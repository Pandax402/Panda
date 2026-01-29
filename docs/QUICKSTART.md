# Quickstart Guide

Get up and running with Pandax402 in under 5 minutes.

---

## Prerequisites

- Node.js 18+
- A Solana wallet with SOL
- An Express.js application (or similar)

---

## Installation

```bash
npm install @pandax402/sdk
```

---

## Server Setup (2 minutes)

### 1. Initialize the Gatekeeper

```typescript
import express from 'express';
import { Pandax402 } from '@pandax402/sdk';

const app = express();

const panda = new Pandax402({
  serviceWallet: 'YOUR_SOLANA_WALLET_ADDRESS',
  pricePerRequest: 0.001,
  network: 'devnet',  // Use 'mainnet' for production
});
```

### 2. Protect Your Endpoint

```typescript
app.get('/api/premium', panda.guard(), (req, res) => {
  res.json({ message: 'Payment received! Here is your data.' });
});

app.listen(3000);
```

That's it. Your endpoint now requires payment.

---

## Client Setup (2 minutes)

### Browser

```typescript
import { Pandax402Client } from '@pandax402/sdk';
import { useWallet } from '@solana/wallet-adapter-react';

const wallet = useWallet();
const client = new Pandax402Client({ wallet });

const response = await client.fetch('https://yourapi.com/api/premium');
const data = await response.json();
```

### Node.js

```typescript
import { Pandax402Client } from '@pandax402/sdk';
import { Keypair } from '@solana/web3.js';

const wallet = Keypair.fromSecretKey(/* your key */);
const client = new Pandax402Client({ wallet, autoConfirm: true });

const response = await client.fetch('https://yourapi.com/api/premium');
```

---

## Test It

1. Start your server
2. Make a request without payment → Get `402 Payment Required`
3. Make a request with client SDK → Payment happens automatically
4. Receive your data

---

## Next Steps

- [API Reference](./API.md)
- [Architecture](./ARCHITECTURE.md)
- [Agent Deployment](./AGENTS.md)
- [Privacy Guide](./PRIVACY.md)
