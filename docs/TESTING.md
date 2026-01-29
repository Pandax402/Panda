# Testing Guide

Testing strategies for Pandax402 integrations.

---

## Unit Testing

### Mocking the Gatekeeper

```typescript
import { Pandax402, createMockPanda } from '@pandax402/sdk';

describe('Premium API', () => {
  let panda;
  
  beforeEach(() => {
    // Mock that always allows access
    panda = createMockPanda({ alwaysAllow: true });
  });
  
  it('returns data when paid', async () => {
    const app = createApp(panda);
    const res = await request(app).get('/api/premium');
    expect(res.status).toBe(200);
  });
});
```

### Testing Payment Rejection

```typescript
describe('Payment Required', () => {
  it('returns 402 without payment', async () => {
    const panda = createMockPanda({ alwaysAllow: false });
    const app = createApp(panda);
    
    const res = await request(app).get('/api/premium');
    
    expect(res.status).toBe(402);
    expect(res.body.x402).toBeDefined();
  });
});
```

---

## Integration Testing

### Using Devnet

```typescript
describe('Devnet Integration', () => {
  const wallet = Keypair.generate();
  
  beforeAll(async () => {
    // Airdrop devnet SOL
    await airdrop(wallet.publicKey, 1);
  });
  
  it('completes payment flow', async () => {
    const panda = new Pandax402({
      serviceWallet: serviceWallet.publicKey.toString(),
      pricePerRequest: 0.001,
      network: 'devnet',
    });
    
    const client = new Pandax402Client({
      wallet,
      network: 'devnet',
    });
    
    const response = await client.fetch('http://localhost:3000/api/premium');
    expect(response.status).toBe(200);
  });
});
```

---

## Agent Testing

```typescript
describe('Agent Budget', () => {
  it('stops when budget exhausted', async () => {
    const agent = new Pandax402Agent({
      wallet: testWallet,
      budgetLimit: 0.002,
      network: 'devnet',
    });
    
    // First request succeeds
    await agent.execute({ url: endpoint });
    
    // Second request succeeds
    await agent.execute({ url: endpoint });
    
    // Third request should fail
    await expect(agent.execute({ url: endpoint }))
      .rejects.toThrow('BUDGET_EXCEEDED');
  });
});
```

---

## E2E Testing

### Full Flow Test

```typescript
describe('E2E Payment Flow', () => {
  let server;
  let client;
  
  beforeAll(async () => {
    server = await startTestServer();
    client = new Pandax402Client({
      wallet: testWallet,
      network: 'devnet',
    });
  });
  
  afterAll(async () => {
    await server.close();
  });
  
  it('complete flow', async () => {
    // 1. Request without payment
    const unpaid = await fetch(server.url + '/api/premium');
    expect(unpaid.status).toBe(402);
    
    // 2. Extract payment info
    const paymentInfo = await unpaid.json();
    expect(paymentInfo.x402.amount).toBe(0.001);
    
    // 3. Pay and retry
    const paid = await client.fetch(server.url + '/api/premium');
    expect(paid.status).toBe(200);
    
    // 4. Verify response
    const data = await paid.json();
    expect(data.premium).toBe(true);
  });
});
```

---

## Test Utilities

### Payment Simulator

```typescript
import { simulatePayment } from '@pandax402/sdk/testing';

// Simulate a successful payment without blockchain
const proof = await simulatePayment({
  payer: testWallet.publicKey,
  recipient: serviceWallet,
  amount: 0.001,
});

// Use in request
const response = await fetch(url, {
  headers: {
    'X-Payment-Proof': proof,
  },
});
```

### Time Mocking

```typescript
import { mockTime } from '@pandax402/sdk/testing';

it('rejects expired proofs', async () => {
  // Create proof
  const proof = await createPaymentProof();
  
  // Advance time
  mockTime.advance(60 * 1000);  // 1 minute
  
  // Verify rejection
  const isValid = await panda.verify(proof);
  expect(isValid).toBe(false);
});
```

---

## CI/CD

### GitHub Actions Example

```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm test
      
      # Integration tests use devnet
      - run: npm run test:integration
        env:
          SOLANA_NETWORK: devnet
```
