import {createPublicClient,http,parseAbiItem} from 'viem';
import {activeChain} from './chain';
import {factoryAbi} from './abi';

const factory=process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`|undefined;
export const publicClient=createPublicClient({chain:activeChain,transport:http(activeChain.rpcUrls.default.http[0])});
const createdEvent=parseAbiItem('event TokenCreated(address indexed token,address indexed creator,string name,string symbol,string metadataURI,string description,uint256 initialEth)');
const tradeEvent=parseAbiItem('event Trade(address indexed token,address indexed trader,bool indexed buy,uint256 ethAmount,uint256 tokenAmount,uint256 fee)');

export async function getCreatedTokens(){
  if(!factory)return[];
  const from=BigInt(process.env.FACTORY_DEPLOY_BLOCK||'0');
  const logs=await publicClient.getLogs({address:factory,event:createdEvent,fromBlock:from,toBlock:'latest'});
  return logs.map(l=>({address:l.args.token||'',name:l.args.name||'Untitled',symbol:l.args.symbol||'TOKEN',creator:l.args.creator||'',metadataURI:l.args.metadataURI||'',description:l.args.description||'',initialEth:l.args.initialEth?.toString()||'0'}));
}

export async function getTokenDetails(address:string){
  if(!factory)return null;
  const token=address as `0x${string}`;
  const [created,ethReserve,tokenReserve,graduated]=await Promise.all([
    getCreatedTokens(),
    publicClient.readContract({address:factory,abi:factoryAbi,functionName:'ethReserve',args:[token]}),
    publicClient.readContract({address:factory,abi:factoryAbi,functionName:'tokenReserve',args:[token]}),
    publicClient.readContract({address:factory,abi:factoryAbi,functionName:'graduated',args:[token]})
  ]);
  const meta=created.find(x=>x.address.toLowerCase()===address.toLowerCase());
  if(!meta)return null;
  const trades=await publicClient.getLogs({address:factory,event:tradeEvent,args:{token},fromBlock:BigInt(process.env.FACTORY_DEPLOY_BLOCK||'0'),toBlock:'latest'});
  const progress=Number((ethReserve*100n)/(50n*10n**18n)>100n?100n:(ethReserve*100n)/(50n*10n**18n));
  return {...meta,ethReserve:ethReserve.toString(),tokenReserve:tokenReserve.toString(),graduated,progress,trades:trades.map(t=>({buy:t.args.buy,ethAmount:t.args.ethAmount?.toString()||'0',tokenAmount:t.args.tokenAmount?.toString()||'0',blockNumber:t.blockNumber?.toString()||'0'}))};
}
