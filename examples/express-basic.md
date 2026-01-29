# Express.js Basic Example

Simple Express server with Pandax402 payment gating.

---

## Setup

```bash
npm install express @pandax402/sdk
```

---

## Server Code

```typescript
// server.ts
import express from 'express';
import { Pandax402 } from '@pandax402/sdk';

const app = express();

// Initialize Pandax402
const panda = new Pandax402({
  serviceWallet: process.env.SOLANA_WALLET!,
  pricePerRequest: 0.001,  // 0.001 SOL per request
  network: 'devnet',       // Use 'mainnet' for production
});

// Free endpoint - no payment required
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Free endpoint - public data
app.get('/api/public', (req, res) => {
  res.json({
    message: 'This is free public data',
    items: ['apple', 'banana', 'cherry'],
  });
});

// Paid endpoint - requires payment
app.get('/api/premium', panda.guard(), (req, res) => {
  res.json({
    message: 'Payment received! Here is your premium data.',
    secret: 'The answer is 42',
    timestamp: Date.now(),
  });
});

// Paid endpoint with different price
app.get('/api/expensive', panda.guard({ priceOverride: 0.01 }), (req, res) => {
  res.json({
    message: 'This was an expensive request!',
    analysis: {
      sentiment: 'positive',
      confidence: 0.95,
      keywords: ['premium', 'quality', 'exclusive'],
    },
  });
});

// Paid POST endpoint
app.post('/api/process', express.json(), panda.guard(), (req, res) => {
  const { data } = req.body;
  
  // Process the paid request
  const result = {
    input: data,
    processed: true,
    output: `Processed: ${data}`,
  };
  
  res.json(result);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Wallet: ${process.env.SOLANA_WALLET}`);
  console.log(`Network: devnet`);
});
```

---

## Running

```bash
# Set environment variables
export SOLANA_WALLET=YourWalletAddressHere

# Run server
npx ts-node server.ts
```

---

## Testing

### Without Payment

```bash
curl http://localhost:3000/api/premium
```

Response:
```json
{
  "status": 402,
  "message": "Payment Required",
  "x402": {
    "wallet": "YourWalletAddressHere",
    "amount": 0.001,
    "network": "devnet"
  }
}
```

### With Payment (using client SDK)

```typescript
import { Pandax402Client } from '@pandax402/sdk';
import { Keypair } from '@solana/web3.js';

const wallet = Keypair.fromSecretKey(/* your key */);
const client = new Pandax402Client({ wallet, autoConfirm: true });

const response = await client.fetch('http://localhost:3000/api/premium');
console.log(await response.json());
// { message: 'Payment received!', secret: '...', timestamp: ... }
```

---

## File Structure

```
express-basic/
├── server.ts
├── package.json
├── tsconfig.json
└── .env.example
```

---

## package.json

```json
{
  "name": "pandax402-express-example",
  "version": "1.0.0",
  "scripts": {
    "start": "ts-node server.ts",
    "dev": "ts-node-dev server.ts"
  },
  "dependencies": {
    "@pandax402/sdk": "^1.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```
