# Integration Patterns

Common patterns for integrating Pandax402 with popular frameworks and services.

---

## Web Frameworks

### Express.js

```typescript
import express from 'express';
import { Pandax402 } from '@pandax402/sdk';

const app = express();
const panda = new Pandax402({ serviceWallet, pricePerRequest: 0.001 });

// Single endpoint
app.get('/api/premium', panda.guard(), handler);

// All routes in path
app.use('/api/paid', panda.guard());
```

### Fastify

```typescript
import Fastify from 'fastify';
import { pandax402Plugin } from '@pandax402/sdk/fastify';

const fastify = Fastify();

fastify.register(pandax402Plugin, {
  serviceWallet,
  pricePerRequest: 0.001,
});

fastify.get('/api/premium', {
  preHandler: fastify.pandax402.guard(),
}, handler);
```

### Hono

```typescript
import { Hono } from 'hono';
import { pandax402Middleware } from '@pandax402/sdk/hono';

const app = new Hono();

const panda = pandax402Middleware({
  serviceWallet,
  pricePerRequest: 0.001,
});

app.get('/api/premium', panda, (c) => {
  return c.json({ data: 'premium' });
});
```

### Next.js

```typescript
// app/api/premium/route.ts
import { Pandax402 } from '@pandax402/sdk';
import { NextRequest, NextResponse } from 'next/server';

const panda = new Pandax402({ serviceWallet, pricePerRequest: 0.001 });

export async function GET(request: NextRequest) {
  const result = await panda.verifyRequest(request);
  
  if (!result.paid) {
    return NextResponse.json(result.paymentRequest, { status: 402 });
  }
  
  return NextResponse.json({ data: 'premium' });
}
```

---

## Serverless Platforms

### AWS Lambda

```typescript
import { Pandax402 } from '@pandax402/sdk';

const panda = new Pandax402({ serviceWallet, pricePerRequest: 0.001 });

export const handler = panda.wrapLambda(async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ data: 'premium' }),
  };
});
```

### Vercel Functions

```typescript
import { Pandax402 } from '@pandax402/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const panda = new Pandax402({ serviceWallet, pricePerRequest: 0.001 });

export default panda.wrapVercel(
  async (req: VercelRequest, res: VercelResponse) => {
    res.json({ data: 'premium' });
  }
);
```

### Cloudflare Workers

```typescript
import { Pandax402 } from '@pandax402/sdk/cloudflare';

const panda = new Pandax402({ serviceWallet, pricePerRequest: 0.001 });

export default {
  async fetch(request: Request): Promise<Response> {
    return panda.handleRequest(request, async () => {
      return new Response(JSON.stringify({ data: 'premium' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  },
};
```

---

## Database Integration

### Track Payments

```typescript
import { Pandax402 } from '@pandax402/sdk';
import { db } from './database';

const panda = new Pandax402({ serviceWallet, pricePerRequest: 0.001 });

panda.on('payment:received', async (event) => {
  await db.payments.insert({
    signature: event.signature,
    payer: event.payer,
    amount: event.amount,
    endpoint: event.endpoint,
    timestamp: new Date(),
  });
});
```

### Revenue Analytics

```typescript
// Get daily revenue
const dailyRevenue = await db.payments
  .where('timestamp', '>=', startOfDay)
  .sum('amount');

// Get top payers
const topPayers = await db.payments
  .groupBy('payer')
  .sum('amount')
  .orderBy('sum', 'desc')
  .limit(10);
```

---

## Monitoring Integration

### Prometheus

```typescript
import { Counter, Histogram } from 'prom-client';

const paymentsTotal = new Counter({
  name: 'pandax402_payments_total',
  help: 'Total number of payments',
  labelNames: ['endpoint', 'status'],
});

const paymentLatency = new Histogram({
  name: 'pandax402_payment_verification_seconds',
  help: 'Payment verification latency',
});

panda.on('payment:received', ({ endpoint }) => {
  paymentsTotal.inc({ endpoint, status: 'success' });
});

panda.on('payment:failed', ({ endpoint }) => {
  paymentsTotal.inc({ endpoint, status: 'failed' });
});
```

### DataDog

```typescript
import StatsD from 'hot-shots';

const dogstatsd = new StatsD();

panda.on('payment:received', (event) => {
  dogstatsd.increment('pandax402.payments', { endpoint: event.endpoint });
  dogstatsd.gauge('pandax402.amount', event.amount);
});
```

---

## Queue Integration

### Background Processing

```typescript
import { Queue } from 'bullmq';

const processingQueue = new Queue('processing');

app.post('/api/process', panda.guard(), async (req, res) => {
  // Payment verified, queue work
  const job = await processingQueue.add('processData', {
    data: req.body,
    paymentSignature: req.headers['x-payment-proof'],
  });
  
  res.json({ jobId: job.id, status: 'queued' });
});
```

---

## Caching Integration

### Redis Cache

```typescript
import Redis from 'ioredis';

const redis = new Redis();

const panda = new Pandax402({
  serviceWallet,
  pricePerRequest: 0.001,
  cache: {
    get: (key) => redis.get(key),
    set: (key, value, ttl) => redis.setex(key, ttl, value),
    delete: (key) => redis.del(key),
  },
});
```

---

## Wallet Integration

### Solana Wallet Adapter (React)

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { Pandax402Client } from '@pandax402/sdk';

function PremiumContent() {
  const wallet = useWallet();
  const [data, setData] = useState(null);
  
  const fetchPremium = async () => {
    const client = new Pandax402Client({ wallet });
    const response = await client.fetch('/api/premium');
    setData(await response.json());
  };
  
  return (
    <button onClick={fetchPremium}>
      Get Premium Data (0.001 SOL)
    </button>
  );
}
```

---

## Logging Integration

### Structured Logging

```typescript
import pino from 'pino';

const logger = pino();

panda.on('payment:received', (event) => {
  logger.info({
    type: 'payment',
    status: 'received',
    signature: event.signature,
    amount: event.amount,
  }, 'Payment received');
});

panda.on('access:granted', (event) => {
  logger.info({
    type: 'access',
    status: 'granted',
    requestId: event.requestId,
  }, 'Access granted');
});
```

---

## Testing Integration

### Jest

```typescript
import { createMockPanda } from '@pandax402/sdk/testing';

describe('Premium API', () => {
  it('returns data when paid', async () => {
    const panda = createMockPanda({ alwaysAllow: true });
    const app = createApp(panda);
    
    const res = await request(app).get('/api/premium');
    expect(res.status).toBe(200);
  });
  
  it('requires payment when unpaid', async () => {
    const panda = createMockPanda({ alwaysAllow: false });
    const app = createApp(panda);
    
    const res = await request(app).get('/api/premium');
    expect(res.status).toBe(402);
  });
});
```
