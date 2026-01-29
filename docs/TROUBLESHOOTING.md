# Troubleshooting

Common issues and solutions.

---

## Payment Issues

### "Payment Required" after paying

**Symptoms:** Client pays but still receives 402.

**Causes:**
1. Transaction not confirmed yet
2. Wrong payment amount
3. Payment to wrong wallet
4. Proof header missing

**Solutions:**
```typescript
// Ensure sufficient confirmation time
const panda = new Pandax402({
  serviceWallet: wallet,
  pricePerRequest: 0.001,
  gracePeriod: 60,  // Increase grace period
});

// Client: verify payment header
const response = await client.fetch(url);
console.log('Payment proof:', response.headers.get('X-Payment-Proof'));
```

### Transaction timeout

**Symptoms:** Payment fails with timeout error.

**Solutions:**
```typescript
// Increase timeout
const client = new Pandax402Client({
  wallet,
  confirmationTimeout: 60000,  // 60 seconds
});

// Or use faster RPC
const client = new Pandax402Client({
  wallet,
  rpcEndpoint: 'https://fast-rpc-endpoint.com',
});
```

### Insufficient funds

**Symptoms:** `INSUFFICIENT_BALANCE` error.

**Solutions:**
```typescript
// Check balance before request
const balance = await client.getBalance();
if (balance < requiredAmount) {
  console.log('Need more SOL');
}
```

---

## Server Issues

### Middleware not blocking requests

**Symptoms:** Unpaid requests get through.

**Causes:**
1. Middleware order wrong
2. Route not covered

**Solutions:**
```typescript
// Ensure guard comes before handler
app.get('/api/data', 
  panda.guard(),  // Must be first
  (req, res) => { ... }
);

// For all routes in a path
app.use('/api/premium', panda.guard());
```

### Verification failures

**Symptoms:** Valid payments rejected.

**Causes:**
1. Network mismatch
2. RPC issues

**Solutions:**
```typescript
// Ensure network matches
const panda = new Pandax402({
  network: 'mainnet',  // Must match client
});

// Use reliable RPC
const panda = new Pandax402({
  rpcEndpoint: 'https://reliable-rpc.com',
});
```

---

## Agent Issues

### Budget exceeded unexpectedly

**Symptoms:** Agent stops before expected.

**Causes:**
1. Daily limit hit (separate from session limit)
2. Per-request limit triggered

**Solutions:**
```typescript
// Check all limits
console.log('Session remaining:', agent.getRemainingBudget());
console.log('Daily remaining:', agent.getDailyLimit() - agent.getDailySpent());

// Increase limits if needed
agent.setBudget(2.0);
agent.setDailyLimit(10.0);
```

### Domain blocked

**Symptoms:** `DomainNotAllowedError` thrown.

**Solutions:**
```typescript
// Add domain to whitelist
const agent = new Pandax402Agent({
  wallet,
  allowedDomains: [
    'api.example.com',
    '*.trusted.io',  // Wildcard
  ],
});
```

---

## Network Issues

### RPC connection failed

**Symptoms:** Network timeout or connection refused.

**Solutions:**
```typescript
// Try alternative RPC endpoints
const endpoints = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
];

// Implement fallback
for (const endpoint of endpoints) {
  try {
    const panda = new Pandax402({ rpcEndpoint: endpoint });
    break;
  } catch (e) {
    continue;
  }
}
```

### Devnet vs Mainnet confusion

**Symptoms:** Payments work on devnet, fail on mainnet.

**Checklist:**
- [ ] Network config set to 'mainnet'
- [ ] Using real SOL, not devnet SOL
- [ ] RPC endpoint supports mainnet
- [ ] Wallet has mainnet funds

---

## Still Stuck?

1. Check GitHub Issues for similar problems
2. Open a new issue with:
   - Pandax402 version
   - Node.js version
   - Error message
   - Minimal reproduction code
