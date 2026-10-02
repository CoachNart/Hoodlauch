'use client';
import {createConfig,http} from 'wagmi';
import {injected} from 'wagmi/connectors';
import {activeChain,robinhood,robinhoodTestnet} from './chain';

export const config=createConfig({
  chains:[activeChain],
  connectors:[injected({shimDisconnect:true})],
  transports:{
    [robinhood.id]:http(robinhood.rpcUrls.default.http[0]),
    [robinhoodTestnet.id]:http(robinhoodTestnet.rpcUrls.default.http[0])
  },
  ssr:true
});