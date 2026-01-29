# Pandax402 Examples

Practical examples demonstrating Pandax402 integration patterns.

---

## Table of Contents

1. [Basic Server Protection](#basic-server-protection)
2. [Client Payment Flow](#client-payment-flow)
3. [Agent Automation](#agent-automation)
4. [Multi-Tier Pricing](#multi-tier-pricing)
5. [Privacy-First Integration](#privacy-first-integration)

---

## Basic Server Protection

Protect Express.js endpoints with x402 payment gates.

```typescript
// server.ts
import express from 'express';
import { Pandax402 } from '@pandax402/sdk';

const app = express();

// Initialize gatekeeper
const panda = new Pandax402({
  serviceWallet: process.env.SOLANA_WALLET!,
  pricePerRequest: 0.001,  // 0.001 SOL
  network: 'mainnet',
});

// Free endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Paid endpoint
app.get('/api/premium-data', panda.guard(), (req, res) => {
  res.json({
    data: 'This content required payment to access',
    timestamp: Date.now(),
  });
});

// Paid POST endpoint
app.post('/api/process', panda.guard(), express.json(), (req, res) => {
  const result = processData(req.body);
  res.json({ result });
});

app.listen(3000, () => {
  console.log('Server running with x402 payment gates');
});
```

---

## Client Payment Flow

Make paid requests from a browser or Node.js client.

### Browser with Wallet Adapter

```typescript
// client.ts
import { Pandax402Client } from '@pandax402/sdk';
import { useWallet } from '@solana/wallet-adapter-react';

function PremiumDataFetcher() {
  const wallet = useWallet();
  
  const fetchPremiumData = async () => {
    const client = new Pandax402Client({
      wallet: wallet,
      autoConfirm: false,  // Ask user before each payment
    });
    
    try {
      const response = await client.fetch(
        'https://api.example.com/premium-data'
      );
      const data = await response.json();
      console.log('Received:', data);
    } catch (error) {
      if (error.code === 'USER_REJECTED') {
        console.log('User declined payment');
      }
    }
  };
  
  return (
    <button onClick={fetchPremiumData}>
      Fetch Premium Data (0.001 SOL)
    </button>
  );
}
```

### Node.js Client

```typescript
// node-client.ts
import { Pandax402Client } from '@pandax402/sdk';
import { Keypair } from '@solana/web3.js';

const wallet = Keypair.fromSecretKey(/* your key */);

const client = new Pandax402Client({
  wallet,
  autoConfirm: true,  // Auto-approve payments
  maxPrice: 0.01,     // Safety limit
});

async function main() {
  const response = await client.fetch(
    'https://api.example.com/premium-data'
  );
  
  console.log('Status:', response.status);
  console.log('Data:', await response.json());
  console.log('Paid:', response.headers.get('X-Payment-Amount'));
}

main();
```

---

## Agent Automation

Deploy autonomous agents for machine-to-machine commerce.

### Data Collection Agent

```typescript
// data-agent.ts
import { Pandax402Agent } from '@pandax402/sdk';
import { Keypair } from '@solana/web3.js';

const agent = new Pandax402Agent({
  wallet: Keypair.fromSecretKey(/* agent wallet */),
  budgetLimit: 1.0,
  allowedDomains: ['api.data-provider.com'],
  privacyMode: true,
});

async function collectData(ids: string[]) {
  const results = [];
  
  for (const id of ids) {
    // Check budget before each request
    if (agent.getRemainingBudget() < 0.01) {
      console.log('Budget exhausted');
      break;
    }
    
    const response = await agent.execute({
      url: `https://api.data-provider.com/record/${id}`,
      method: 'GET',
    });
    
    results.push(await response.json());
  }
  
  console.log(`Collected ${results.length} records`);
  console.log(`Spent ${agent.getSpent()} SOL`);
  
  return results;
}

collectData(['a1', 'b2', 'c3', 'd4']);
```

### AI Research Agent

```typescript
// ai-agent.ts
import { Pandax402Agent } from '@pandax402/sdk';

const researchAgent = new Pandax402Agent({
  wallet: agentWallet,
  budgetLimit: 5.0,
  dailyLimit: 20.0,
  allowedDomains: [
    'api.academic-db.com',
    'api.patent-search.io',
    'api.research-papers.org'
  ],
});

async function conductResearch(topic: string) {
  // Search academic databases (paid)
  const papers = await researchAgent.execute({
    url: 'https://api.academic-db.com/search',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: topic, limit: 10 }),
  }).then(r => r.json());
  
  // Fetch full text for top results
  const fullTexts = [];
  for (const paper of papers.slice(0, 3)) {
    const text = await researchAgent.execute({
      url: `https://api.academic-db.com/paper/${paper.id}/full`,
      method: 'GET',
    }).then(r => r.json());
    fullTexts.push(text);
  }
  
  return { papers, fullTexts, spent: researchAgent.getSpent() };
}
```

---

## Multi-Tier Pricing

Different prices for different endpoints or features.

```typescript
// multi-tier-server.ts
import express from 'express';
import { Pandax402 } from '@pandax402/sdk';

const app = express();

// Base configuration
const baseConfig = {
  serviceWallet: process.env.SOLANA_WALLET!,
  network: 'mainnet' as const,
};

// Tier configurations
const tiers = {
  basic: new Pandax402({ ...baseConfig, pricePerRequest: 0.0001 }),
  standard: new Pandax402({ ...baseConfig, pricePerRequest: 0.001 }),
  premium: new Pandax402({ ...baseConfig, pricePerRequest: 0.01 }),
};

// Basic tier - cheap, limited data
app.get('/api/basic/data', tiers.basic.guard(), (req, res) => {
  res.json({ summary: 'Basic data summary' });
});

// Standard tier - full data
app.get('/api/standard/data', tiers.standard.guard(), (req, res) => {
  res.json({ full: 'Complete dataset with details' });
});

// Premium tier - data + analysis
app.get('/api/premium/data', tiers.premium.guard(), (req, res) => {
  res.json({
    full: 'Complete dataset',
    analysis: 'AI-powered insights',
    predictions: 'Future trends',
  });
});

// Dynamic pricing based on request params
const dynamicPanda = new Pandax402({
  ...baseConfig,
  pricePerRequest: 0.001,
});

app.get('/api/search', (req, res, next) => {
  const depth = parseInt(req.query.depth as string) || 1;
  // Adjust price based on search depth
  const adjustedPrice = 0.001 * depth;
  
  dynamicPanda.guard({ priceOverride: adjustedPrice })(req, res, next);
}, (req, res) => {
  res.json({ results: 'Search results' });
});

app.listen(3000);
```

---

## Privacy-First Integration

Maximum privacy configuration for sensitive applications.

### Server Configuration

```typescript
// privacy-server.ts
import express from 'express';
import { Pandax402 } from '@pandax402/sdk';

const app = express();

const panda = new Pandax402({
  serviceWallet: process.env.SOLANA_WALLET!,
  pricePerRequest: 0.001,
  network: 'mainnet',
  
  // Privacy options
  logLevel: 'none',           // No logging
  collectMetrics: false,      // No metrics collection
  includeWalletInResponse: false,  // Don't echo wallet back
});

// Remove identifying headers
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

// Paid endpoint with minimal response headers
app.get('/api/private-data', panda.guard(), (req, res) => {
  res.set({
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  
  res.json({ data: 'Private content' });
});

app.listen(3000);
```

### Agent with Privacy Mode

```typescript
// privacy-agent.ts
import { Pandax402Agent } from '@pandax402/sdk';
import { Keypair } from '@solana/web3.js';

// Generate fresh wallet for this session
const sessionWallet = Keypair.generate();
// Fund it with exact amount needed
await fundWallet(sessionWallet.publicKey, 0.1);

const agent = new Pandax402Agent({
  wallet: sessionWallet,
  budgetLimit: 0.1,
  
  // Privacy settings
  privacyMode: true,          // Enable all privacy features
  randomizeTimings: true,     // Random delays between requests
  stripHeaders: true,         // Remove unnecessary headers
  
  allowedDomains: ['api.private-service.com'],
});

async function privateOperation() {
  const result = await agent.execute({
    url: 'https://api.private-service.com/sensitive-data',
    method: 'GET',
    // Minimal headers
    headers: {
      'Accept': 'application/json',
    },
  });
  
  return result.json();
}

// After session, wallet can be discarded
```

---

## Running Examples

Each example can be run independently:

```bash
# Install dependencies
npm install @pandax402/sdk @solana/web3.js

# Set environment variables
export SOLANA_WALLET=<your-wallet-address>

# Run server example
npx ts-node server.ts

# Run client example
npx ts-node client.ts

# Run agent example
npx ts-node agent.ts
```

---

## Next Steps

- Read the [API Reference](../docs/API.md)
- Review [Architecture](../docs/ARCHITECTURE.md)
- Understand [Privacy](../docs/PRIVACY.md)
- Deploy [Agents](../docs/AGENTS.md)

---

<p align="center">
<em>Pay to access. No accounts. No permissions. No trust.</em>
</p>
