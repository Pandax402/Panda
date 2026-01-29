# Rate Limiting

Payment-based rate limiting as an alternative to arbitrary limits.

---

## Philosophy

Traditional rate limiting: "You can only make N requests per minute."

Pandax402 approach: "You can make unlimited requests if you pay for them."

This creates economic signals instead of arbitrary barriers.

---

## Hybrid Approach

Combine payment gating with traditional rate limiting for DDoS protection:

```typescript
import { Pandax402 } from '@pandax402/sdk';
import rateLimit from 'express-rate-limit';

const panda = new Pandax402({
  serviceWallet: wallet,
  pricePerRequest: 0.001,
});

// DDoS protection (very high limit)
const ddosLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,  // 1000 req/min per IP
  message: 'Too many requests',
});

// Apply both
app.use('/api', ddosLimiter);
app.get('/api/premium', panda.guard(), handler);
```

---

## Tiered Pricing

Higher frequency = higher price:

```typescript
const requestCounts = new Map();

function dynamicPricing(req) {
  const ip = req.ip;
  const count = requestCounts.get(ip) || 0;
  requestCounts.set(ip, count + 1);
  
  // Price increases with request count
  if (count < 10) return 0.0001;
  if (count < 100) return 0.001;
  return 0.01;
}

app.get('/api/data', (req, res, next) => {
  const price = dynamicPricing(req);
  panda.guard({ priceOverride: price })(req, res, next);
}, handler);
```

---

## Burst Protection

Prevent payment spam attacks:

```typescript
const recentPayments = new Map();

const burstProtection = (req, res, next) => {
  const wallet = req.headers['x-payer-wallet'];
  const lastPayment = recentPayments.get(wallet);
  const now = Date.now();
  
  if (lastPayment && now - lastPayment < 100) {
    // Less than 100ms between payments
    return res.status(429).json({ error: 'Too fast' });
  }
  
  recentPayments.set(wallet, now);
  next();
};

app.get('/api/data', burstProtection, panda.guard(), handler);
```

---

## Fair Usage Policies

Document expected usage patterns:

```typescript
const fairUsage = {
  recommended: {
    requestsPerMinute: 60,
    pricePerRequest: 0.0001,
  },
  heavy: {
    requestsPerMinute: 600,
    pricePerRequest: 0.001,  // 10x price
  },
  enterprise: {
    requestsPerMinute: 6000,
    pricePerRequest: 0.01,  // Contact for volume discounts
  },
};
```

---

## Monitoring

Track payment patterns for abuse detection:

```typescript
panda.on('payment:received', (event) => {
  metrics.recordPayment({
    wallet: event.payer,
    amount: event.amount,
    timestamp: Date.now(),
  });
});

// Alert on suspicious patterns
setInterval(() => {
  const suspicious = metrics.findSuspiciousPatterns();
  if (suspicious.length > 0) {
    alertAdmin('Suspicious payment patterns detected', suspicious);
  }
}, 60000);
```
