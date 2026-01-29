# Token Support

Payment token configuration and multi-token support.

---

## Current Support

### SOL (Native)

Solana's native token is fully supported.

```typescript
const panda = new Pandax402({
  serviceWallet: 'YOUR_WALLET',
  pricePerRequest: 0.001,  // 0.001 SOL
  token: 'SOL',  // Default
});
```

---

## Roadmap: SPL Tokens

### USDC

```typescript
// Coming soon
const panda = new Pandax402({
  serviceWallet: 'YOUR_WALLET',
  pricePerRequest: 0.10,  // $0.10
  token: 'USDC',
});
```

### Custom SPL Tokens

```typescript
// Coming soon
const panda = new Pandax402({
  serviceWallet: 'YOUR_WALLET',
  pricePerRequest: 100,
  token: {
    mint: 'TOKEN_MINT_ADDRESS',
    decimals: 9,
  },
});
```

---

## Multi-Token Acceptance

Accept multiple tokens for the same endpoint:

```typescript
// Coming soon
const panda = new Pandax402({
  serviceWallet: 'YOUR_WALLET',
  pricing: {
    SOL: 0.001,
    USDC: 0.15,
    USDT: 0.15,
  },
});
```

Client chooses which token to pay with:

```typescript
const client = new Pandax402Client({
  wallet,
  preferredToken: 'USDC',
});
```

---

## Price Feeds

For dynamic pricing based on token value:

```typescript
// Coming soon
const panda = new Pandax402({
  serviceWallet: 'YOUR_WALLET',
  priceUSD: 0.10,  // Always $0.10 regardless of token
  acceptedTokens: ['SOL', 'USDC'],
  priceFeed: 'pyth',  // Use Pyth for SOL/USD conversion
});
```

---

## Token Verification

All token payments are verified on-chain:

1. Correct token mint
2. Correct amount (accounting for decimals)
3. Correct recipient
4. Transaction finality

No trust assumptions. Pure cryptographic verification.
