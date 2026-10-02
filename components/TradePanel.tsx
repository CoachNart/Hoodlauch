'use client';
import {useEffect,useMemo,useState} from 'react';
import {useAccount,useReadContract,useWriteContract} from 'wagmi';
import {formatEther,formatUnits,parseEther,parseUnits} from 'viem';
import {factoryAbi} from '@/lib/abi';
import {tokenAbi} from '@/lib/tokenAbi';

export default function TradePanel({token}:{token:string}){
  const {address,isConnected}=useAccount();
  const {writeContractAsync,isPending}=useWriteContract();
  const factory=process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`|undefined;
  const tokenAddress=token as `0x${string}`;
  const [tab,setTab]=useState<'buy'|'sell'>('buy');
  const [eth,setEth]=useState('0.01');
  const [amount,setAmount]=useState('');
  const [slippage,setSlippage]=useState('1');
  const [status,setStatus]=useState('');
  const ethIn=useMemo(()=>{try{return parseEther(eth||'0')}catch{return 0n}},[eth]);
  const tokenIn=useMemo(()=>{try{return parseUnits(amount||'0',18)}catch{return 0n}},[amount]);
  const buyQuote=useReadContract({address:factory,abi:factoryAbi,functionName:'quoteBuy',args:[tokenAddress,ethIn],query:{enabled:!!factory&&ethIn>0n}});
  const sellQuote=useReadContract({address:factory,abi:factoryAbi,functionName:'quoteSell',args:[tokenAddress,tokenIn],query:{enabled:!!factory&&tokenIn>0n}});
  const balance=useReadContract({address:tokenAddress,abi:tokenAbi,functionName:'balanceOf',args:[address!],query:{enabled:!!address}});
  const allowance=useReadContract({address:tokenAddress,abi:tokenAbi,functionName:'allowance',args:[address!,factory!],query:{enabled:!!address&&!!factory}});
  useEffect(()=>{setStatus('')},[tab]);
  const slipBps=Math.max(0,Math.min(10000,Math.round(Number(slippage||0)*100)));
  const minBuy=buyQuote.data ? buyQuote.data[0]*BigInt(10000-slipBps)/10000n : 0n;
  const minSell=sellQuote.data ? sellQuote.data[0]*BigInt(10000-slipBps)/10000n : 0n;

  async function trade(){
    if(!factory||!isConnected||!address){setStatus('Connect your wallet and configure the factory.');return}
    try{
      setStatus('Waiting for wallet approval…');
      if(tab==='buy'){
        if(ethIn<=0n||!buyQuote.data){setStatus('Enter a valid ETH amount.');return}
        const hash=await writeContractAsync({address:factory,abi:factoryAbi,functionName:'buyToken',args:[tokenAddress,minBuy],value:ethIn});
        setStatus('Buy submitted: '+hash);
      }else{
        if(tokenIn<=0n||!sellQuote.data){setStatus('Enter a valid token amount.');return}
        if((allowance.data??0n)<tokenIn){
          const hash=await writeContractAsync({address:tokenAddress,abi:tokenAbi,functionName:'approve',args:[factory,tokenIn]});
          setStatus('Approval submitted. Confirm it, then click Sell again. '+hash);
          await allowance.refetch();
          return;
        }
        const hash=await writeContractAsync({address:factory,abi:factoryAbi,functionName:'sellToken',args:[tokenAddress,tokenIn,minSell]});
        setStatus('Sell submitted: '+hash);
      }
    }catch(e){setStatus(e instanceof Error?e.message:'Transaction rejected.')}
  }

  return <div className="card cardpad">
    <div className="sectionhead" style={{alignItems:'center',marginBottom:12}}><div><h2>Trade</h2><p>Direct reserve trading with wallet-side slippage protection.</p></div><span className="green mono">1% FEE</span></div>
    <div className="filters" style={{marginBottom:12}}><button className={'filter '+(tab==='buy'?'active':'')} onClick={()=>setTab('buy')}>Buy</button><button className={'filter '+(tab==='sell'?'active':'')} onClick={()=>setTab('sell')}>Sell</button></div>
    {tab==='buy'?<div className="field"><label>BUY WITH ETH</label><input value={eth} onChange={e=>setEth(e.target.value)} inputMode="decimal" placeholder="0.01"/><div className="trade-quote">Estimated output: {buyQuote.data?formatUnits(buyQuote.data[0],18):'—'} tokens</div></div>:<div className="field"><label>SELL TOKENS</label><input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" placeholder="0.0"/><div className="trade-quote">Wallet: {balance.data?formatUnits(balance.data,18):'—'} · Estimated ETH: {sellQuote.data?formatEther(sellQuote.data[0]):'—'}</div></div>}
    <div className="field"><label>MAX SLIPPAGE %</label><input value={slippage} onChange={e=>setSlippage(e.target.value)} inputMode="decimal"/></div>
    <button className="btn primary" disabled={isPending} onClick={trade} style={{width:'100%',justifyContent:'center'}}>{isPending?'Confirming…':tab==='buy'?'Buy token':(allowance.data??0n)<tokenIn?'Approve token':'Sell token'}</button>
    {status&&<p className="muted" style={{fontSize:10,lineHeight:1.5,marginTop:10,wordBreak:'break-word'}}>{status}</p>}
  </div>
}
