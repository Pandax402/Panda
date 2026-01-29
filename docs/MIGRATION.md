# Migration Guide

Upgrading between Pandax402 versions.

---

## v0.9.x to v1.0.0

### Breaking Changes

#### Configuration API

```typescript
// Before (v0.9.x)
const panda = new Pandax402(walletAddress, price, network);

// After (v1.0.0)
const panda = new Pandax402({
  serviceWallet: walletAddress,
  pricePerRequest: price,
  network: network,
});
```

#### Client SDK

```typescript
// Before (v0.9.x)
const client = new PaymentClient(wallet);
await client.get(url);

// After (v1.0.0)
const client = new Pandax402Client({ wallet });
await client.fetch(url);
```

#### Agent API

```typescript
// Before (v0.9.x)
const agent = createAgent(wallet, budget);

// After (v1.0.0)
const agent = new Pandax402Agent({
  wallet,
  budgetLimit: budget,
});
```

### Deprecated Methods

| Deprecated | Replacement |
|------------|-------------|
| `panda.middleware()` | `panda.guard()` |
| `client.get()` | `client.fetch()` |
| `agent.request()` | `agent.execute()` |

### New Features in v1.0.0

- Privacy mode for agents
- Domain whitelisting
- Daily budget limits
- Enhanced error types

---

## v0.8.x to v0.9.x

### Configuration

Wallet configuration moved from environment to constructor:

```typescript
// Before (v0.8.x)
process.env.PANDA_WALLET = 'address';
const panda = new Pandax402();

// After (v0.9.x)
const panda = new Pandax402(walletAddress, price, network);
```

---

## Need Help?

Open an issue on GitHub for migration assistance.
