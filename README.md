# Hoodlaunch

Creator-first token launchpad for Robinhood Chain.

## Stack
- Next.js App Router + TypeScript
- wagmi + viem for EVM wallet connectivity
- Robinhood Chain mainnet (4663) / testnet (46630)
- Solidity factory contract in `contracts/`

## Frontend
```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_FACTORY_ADDRESS` and `FACTORY_DEPLOY_BLOCK` after deploying the factory. Discovery and token pages read the factory events directly; they do not use the old demo token dataset.

## Contract
The factory supports creator-owned token deployment, a reserve-based bonding curve, 1% creator fees, quote functions, buy/sell slippage protection, creator fee claims, and a graduation milestone. Graduation does not freeze trading.

The contract is **not audited**. It must be independently audited and tested before public financial use. There is no automatic DEX migration router in this release; `Graduated` is a milestone event only.

### Mainnet deployment
Robinhood Chain mainnet uses chain ID `4663` and `https://rpc.mainnet.chain.robinhood.com`. The official documentation recommends testnet deployment first.

Never commit a private key. Use a dedicated deployer wallet funded with ETH and set it only in the local environment:

```bash
export PRIVATE_KEY=0x...
export RH_MAINNET_RPC_URL=https://rpc.mainnet.chain.robinhood.com
npm run contracts:compile
npm run contracts:deploy:mainnet
```

After deployment, set the returned factory address as `NEXT_PUBLIC_FACTORY_ADDRESS` and set `FACTORY_DEPLOY_BLOCK` to the deployment block before publishing the frontend.

The production frontend must also be deployed through a Vercel project connected to this repository. No private key or wallet secret belongs in Vercel frontend environment variables.
