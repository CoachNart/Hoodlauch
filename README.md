# Hoodlaunch

Creator-first token launchpad UI and onchain integration for Robinhood Chain.

## Stack
- Next.js App Router + TypeScript
- wagmi + viem for EVM wallet connectivity
- Robinhood Chain mainnet (4663) / testnet (46630)
- Solidity factory contract in `contracts/`

## Run
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Onchain setup
Deploy `contracts/HoodLaunchFactory.sol` to Robinhood Chain Testnet first. Set `NEXT_PUBLIC_FACTORY_ADDRESS` to the deployed address. The frontend then submits `createToken` transactions from connected wallets.

The included contract is a product scaffold and must be independently audited before production financial use. Do not use it as a substitute for a security audit.
