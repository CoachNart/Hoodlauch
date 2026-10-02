import { defineChain } from 'viem';
export const robinhood=defineChain({id:4663,name:'Robinhood Chain',nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18},rpcUrls:{default:{http:[process.env.NEXT_PUBLIC_RPC_URL||'https://rpc.mainnet.chain.robinhood.com']}},blockExplorers:{default:{name:'Robinhood Chain Explorer',url:'https://robinhoodchain.blockscout.com'}}});
export const robinhoodTestnet=defineChain({id:46630,name:'Robinhood Chain Testnet',nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18},rpcUrls:{default:{http:[process.env.NEXT_PUBLIC_TESTNET_RPC_URL||'https://rpc.testnet.chain.robinhood.com']}},blockExplorers:{default:{name:'Robinhood Testnet Explorer',url:'https://explorer.testnet.chain.robinhood.com'}},testnet:true});
export const activeChain=process.env.NEXT_PUBLIC_USE_TESTNET==='true'?robinhoodTestnet:robinhood;
export const explorerUrl=activeChain.blockExplorers.default.url;
