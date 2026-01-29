# Agent Deployment Guide

Autonomous payment agents for machine-to-machine commerce.

---

## Overview

Pandax402 agents enable autonomous systems to pay for services without human intervention. This unlocks machine-to-machine commerce at scale.

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Ecosystem                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│   │  AI Agent │   │ Data Bot  │   │ Scraper   │        │
│   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘        │
│         │               │               │              │
│         └───────────────┼───────────────┘              │
│                         │                              │
│                         ▼                              │
│              ┌─────────────────────┐                   │
│              │   Pandax402Agent    │                   │
│              │  ┌───────────────┐  │                   │
│              │  │ Budget Control│  │                   │
│              │  │ Domain Filter │  │                   │
│              │  │ Privacy Mode  │  │                   │
│              │  └───────────────┘  │                   │
│              └──────────┬──────────┘                   │
│                         │                              │
│                         ▼                              │
│              ┌─────────────────────┐                   │
│              │   x402 Services     │                   │
│              └─────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Installation

```bash
npm install @pandax402/sdk
```

### Basic Agent

```typescript
import { Pandax402Agent } from '@pandax402/sdk';
import { Keypair } from '@solana/web3.js';

// Load or generate wallet
const wallet = Keypair.fromSecretKey(/* your key */);

// Create agent
const agent = new Pandax402Agent({
  wallet,
  network: 'mainnet',
  budgetLimit: 0.5,  // Max 0.5 SOL per session
});

// Execute paid request
const response = await agent.execute({
  url: 'https://api.example.com/data',
  method: 'GET'
});

console.log(await response.json());
```

---

## Configuration

### Full Configuration

```typescript
const agent = new Pandax402Agent({
  // Required
  wallet: Keypair,
  
  // Network
  network: 'mainnet' | 'devnet',
  rpcEndpoint: 'https://custom-rpc.com',  // Optional
  
  // Budget Controls
  budgetLimit: 1.0,           // Max SOL per session
  maxPricePerRequest: 0.01,   // Max SOL per single request
  dailyLimit: 5.0,            // Max SOL per 24 hours
  
  // Security
  allowedDomains: ['api.trusted.com', '*.verified.io'],
  blockedDomains: ['scam.example.com'],
  requireHttps: true,
  
  // Privacy
  privacyMode: false,
  
  // Behavior
  retryAttempts: 3,
  confirmationTimeout: 30000,  // ms
  autoTopUp: false,
});
```

### Budget Controls

```typescript
// Set limits
agent.setBudget(1.0);              // Session limit
agent.setMaxPrice(0.01);           // Per-request limit
agent.setDailyLimit(10.0);         // 24-hour limit

// Check spending
const spent = agent.getSpent();
const remaining = agent.getRemainingBudget();
const dailySpent = agent.getDailySpent();

// Reset (new session)
agent.resetBudget();
```

### Domain Controls

```typescript
// Whitelist approach (recommended)
const agent = new Pandax402Agent({
  wallet,
  allowedDomains: [
    'api.openai.com',
    'api.anthropic.com',
    '*.verified-apis.com'
  ]
});

// Blacklist approach
const agent = new Pandax402Agent({
  wallet,
  blockedDomains: [
    'known-scam.com',
    '*.suspicious.io'
  ]
});
```

---

## Use Cases

### AI Agent with Tool Access

```typescript
import { Pandax402Agent } from '@pandax402/sdk';

const paymentAgent = new Pandax402Agent({
  wallet: agentWallet,
  budgetLimit: 2.0,
  allowedDomains: ['api.weather.com', 'api.news.io']
});

async function aiAgentLoop() {
  while (true) {
    const task = await getNextTask();
    
    if (task.requiresExternalData) {
      // Agent automatically pays for API access
      const data = await paymentAgent.execute({
        url: task.apiEndpoint,
        method: 'GET'
      }).then(r => r.json());
      
      await processWithAI(data);
    }
  }
}
```

### Data Pipeline

```typescript
const pipelineAgent = new Pandax402Agent({
  wallet,
  budgetLimit: 10.0,
  maxPricePerRequest: 0.001,  // Micropayments
  allowedDomains: ['data-provider.com']
});

async function runPipeline() {
  const records = [];
  
  for (const id of recordIds) {
    const record = await pipelineAgent.execute({
      url: `https://data-provider.com/record/${id}`,
      method: 'GET'
    }).then(r => r.json());
    
    records.push(record);
    
    // Check budget periodically
    if (pipelineAgent.getRemainingBudget() < 0.1) {
      console.log('Budget low, pausing...');
      break;
    }
  }
  
  return records;
}
```

### Scheduled Task

```typescript
import { Pandax402Agent } from '@pandax402/sdk';
import cron from 'node-cron';

const agent = new Pandax402Agent({
  wallet,
  dailyLimit: 1.0,
  allowedDomains: ['api.metrics.com']
});

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const metrics = await agent.execute({
      url: 'https://api.metrics.com/hourly',
      method: 'GET'
    }).then(r => r.json());
    
    await storeMetrics(metrics);
  } catch (error) {
    if (error.code === 'BUDGET_EXCEEDED') {
      console.log('Daily budget exhausted');
    }
  }
});
```

---

## Security Best Practices

### Wallet Management

```typescript
// GOOD: Use dedicated agent wallet with limited funds
const agentWallet = Keypair.generate();
await fundWallet(agentWallet.publicKey, 1.0);  // Only 1 SOL

// BAD: Never use your main wallet
const mainWallet = loadMainWallet();  // Don't do this!
```

### Budget Limits

```typescript
// Set multiple layers of protection
const agent = new Pandax402Agent({
  wallet,
  budgetLimit: 0.5,        // Session: 0.5 SOL max
  maxPricePerRequest: 0.01, // Single request: 0.01 SOL max
  dailyLimit: 2.0,         // Daily: 2.0 SOL max
});
```

### Domain Whitelisting

```typescript
// Always use explicit whitelist for production
const agent = new Pandax402Agent({
  wallet,
  allowedDomains: [
    'api.verified-service.com',  // Exact match
    '*.trusted-provider.io'       // Subdomain wildcard
  ],
  requireHttps: true  // Never allow HTTP
});
```

### Monitoring

```typescript
// Log all transactions
agent.on('payment:initiated', (event) => {
  logger.info('Payment initiated', {
    amount: event.amount,
    destination: event.destination,
    timestamp: Date.now()
  });
});

agent.on('payment:confirmed', (event) => {
  logger.info('Payment confirmed', {
    signature: event.signature,
    amount: event.amount
  });
});

// Alert on unusual activity
agent.on('payment:initiated', (event) => {
  if (event.amount > 0.1) {
    alertAdmin('Large payment detected', event);
  }
});
```

---

## Error Handling

```typescript
import { 
  Pandax402Agent, 
  BudgetExceededError,
  DomainNotAllowedError,
  PaymentFailedError 
} from '@pandax402/sdk';

try {
  const result = await agent.execute({ url: '...' });
} catch (error) {
  if (error instanceof BudgetExceededError) {
    // Handle budget limit
    await notifyAdmin('Budget exceeded');
    await pauseAgent();
  } else if (error instanceof DomainNotAllowedError) {
    // Handle blocked domain
    logger.warn('Attempted access to blocked domain', error.domain);
  } else if (error instanceof PaymentFailedError) {
    // Handle payment failure
    if (error.reason === 'INSUFFICIENT_BALANCE') {
      await topUpWallet(agent.wallet);
    }
  }
}
```

---

## Privacy Mode

Enhanced privacy for sensitive agent operations.

```typescript
const agent = new Pandax402Agent({
  wallet,
  privacyMode: true
});
```

Privacy mode enables:

| Feature | Description |
|---------|-------------|
| Randomized timing | Delays between requests to prevent timing analysis |
| Request batching | Groups requests to obscure access patterns |
| Minimal headers | Strips unnecessary request metadata |
| Fresh wallets | Option to use one-time wallets per request |

---

## Deployment Patterns

### Serverless Function

```typescript
// AWS Lambda / Vercel / etc.
export async function handler(event) {
  const agent = new Pandax402Agent({
    wallet: getWalletFromSecrets(),
    budgetLimit: 0.1,  // Per-invocation limit
  });
  
  const data = await agent.execute({
    url: 'https://api.service.com/data'
  }).then(r => r.json());
  
  return { statusCode: 200, body: JSON.stringify(data) };
}
```

### Containerized Agent

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
ENV WALLET_SECRET_PATH=/secrets/wallet.json
CMD ["node", "agent.js"]
```

### Multi-Agent System

```typescript
// Coordinator pattern
class AgentCoordinator {
  private agents: Map<string, Pandax402Agent> = new Map();
  
  createAgent(id: string, budget: number) {
    const wallet = Keypair.generate();
    const agent = new Pandax402Agent({ wallet, budgetLimit: budget });
    this.agents.set(id, agent);
    return agent;
  }
  
  async executeWithAgent(id: string, request: Request) {
    const agent = this.agents.get(id);
    if (!agent) throw new Error('Agent not found');
    return agent.execute(request);
  }
  
  getTotalSpent() {
    let total = 0;
    for (const agent of this.agents.values()) {
      total += agent.getSpent();
    }
    return total;
  }
}
```

---

## Monitoring & Observability

### Metrics

```typescript
// Prometheus-style metrics
const metrics = {
  paymentsTotal: new Counter('pandax402_payments_total'),
  paymentAmountTotal: new Counter('pandax402_payment_amount_sol'),
  requestLatency: new Histogram('pandax402_request_latency_ms'),
  budgetRemaining: new Gauge('pandax402_budget_remaining_sol'),
};

agent.on('payment:confirmed', (event) => {
  metrics.paymentsTotal.inc();
  metrics.paymentAmountTotal.inc(event.amount);
});

setInterval(() => {
  metrics.budgetRemaining.set(agent.getRemainingBudget());
}, 10000);
```

### Alerting

```typescript
// Alert thresholds
const ALERT_THRESHOLDS = {
  lowBudget: 0.1,
  highSpendRate: 0.5,  // SOL per hour
  failedPayments: 3,
};

agent.on('budget:low', (remaining) => {
  if (remaining < ALERT_THRESHOLDS.lowBudget) {
    sendAlert('Agent budget critically low');
  }
});
```

---

<p align="center">
<em>Autonomous payments. Human oversight. Machine efficiency.</em>
</p>
