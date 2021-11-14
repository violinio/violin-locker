# Violin Locker
The Violin Locker is an LP locking smart-contract system to be deployed on EVM compatible chains. It is provided as-is.

## Deploy
```
yarn deploy avax
```

### Environment variables
- `PRIVATE_KEY`
- `ETHERSCAN_APIKEY`


## Features
### Time-based locking
The violin Locker allows users to lock in ERC-20 compatible tokens for a set period. During this period, these funds are not withdrawable by anyone disabling the possibility for these funds to be sold or dumped during the period. After the period is expired, the Lock owner can withdraw the position to their wallet.

### Isolated holding contracts
The violin Locker allows parties to lock their tokens in an isolated subcontract. This means that the LP tokens will be stored within a secure subcontract, separate from other funds. The core Locker contract is then the only intermediary who can manage these funds.

### Ownership NFT tokens
The Violin Locker is an NFT contract that mints an NFT token representing the ownership of a Lock. This token can then be stored in multisig contracts or transferred between governance wallets for an improved locking experience. Of course, the lock can only be unlocked by the wallet bearing the token, thus it should never be burned.

### Governance Unlock
Projects might choose to allow the Violin governance to prematurely release their funds before the lockout period is over. This can only be executed with explicit and exceptional consent by both the Violin governance and the locking party and such requests are only granted after a careful review of the projects' individual circumstances. Most notably if they have to re-deploy due to a bug while they had already locked liquidity.

Governance can never withdraw tokens themselves, the only account which can withdraw funds (after they are unlocked) is the NFT holder.

## Contracts
The contracts have been deployed as-is on a variety of chains.

### Staging

| Chain    | Address                                    |
| -------- | ------------------------------------------ |
| Arbitrum |  |
| Avax     | 0x0b7161d5dd0C85e8f072b7de076012CC9355F82C |
| BSC      | 0xf5dcD1E23991f6675944a9B1047Bc47d0011a5d8 |
| Celo     | 0xf5dcD1E23991f6675944a9B1047Bc47d0011a5d8 |
| Cronos   | 0xf5dcD1E23991f6675944a9B1047Bc47d0011a5d8 |
| Fantom   | 0xf5dcD1E23991f6675944a9B1047Bc47d0011a5d8 |
| Harmony  | 0xf5dcD1E23991f6675944a9B1047Bc47d0011a5d8 |
| Iotex    | 0xf5dcD1E23991f6675944a9B1047Bc47d0011a5d8 |
| Moonriver | 0xf5dcD1E23991f6675944a9B1047Bc47d0011a5d8 |
| Polygon  | 0xf5dcD1E23991f6675944a9B1047Bc47d0011a5d8 |