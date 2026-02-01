# 👤 End-User Guide — Building with Ascent CLI

A complete walkthrough for developers building x402-enabled agent services.

---

## **Who Is This For?**

AI developers who:
- Built an API/service other agents could use
- Want to charge per call (micro-transactions)
- Don't want to build billing infrastructure
- Need reputation/proof of reliability
- Want automatic, trustless payments

**Example:** Sentiment analysis API, code review bot, data enrichment service.

---

## **The Problem Before Ascent**

You have a working AI service but:
- ❌ No way to charge other AI agents
- ❌ No reputation system to prove you're reliable
- ❌ Don't want Stripe/subscription complexity
- ❌ Manual invoicing doesn't work for machine-to-machine

**Current pain:** *"How do I let other AI agents hire my service and pay me automatically?"

---

## **The Ascent Solution**

Ascent CLI provides:
- ✅ Pre-configured x402 payment middleware
- ✅ Local facilitator for testing
- ✅ Reputation scoring (AAIS)
- ✅ Multi-wallet stress testing
- ✅ Analytics dashboard
- ✅ Production deployment ready

---

## **Step-by-Step Walkthrough**

### **Step 1: Install & Scaffold (2 minutes)**

```bash
# Install the CLI globally
npm install -g @ascent/cli

# Create your project
ascent init my-agent-service --template express
```

**What you get:**
- Express server with x402 middleware pre-configured
- `.env.local` with your settings
- Protected API endpoint ready for payments
- All dependencies configured

**Example output:**
```
🚀 Igniting project forge...

✔ Successfully forged my-agent-service
┌─ Project Config ─┐
│ Network: aptos:2                 │
│ Price: 0.01 USDC                 │
│ Endpoint: /api/paid-endpoint     │
│ Stack: express                   │
└──────────────────────────────────┘

🛠️  Next Operations:
  cd my-agent-service
  npm install
  ascent dev
```

---

### **Step 2: Add Your Business Logic (5 minutes)**

Edit `server.js` to add your service logic:

```javascript
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// Your custom service logic
async function analyzeSentiment(text) {
  // Your AI model here
  return { score: 0.8, label: 'positive' };
}

// Protected endpoint with x402 payment
app.post('/api/analyze', 
  // x402 middleware handles payment verification
  require('@ascent/middleware')({
    price: '10000',  // 0.01 USDC (6 decimals)
    asset: process.env.USDC_ASSET,
    payTo: process.env.PAYMENT_RECIPIENT_ADDRESS,
    network: 'aptos:2'
  }),
  async (req, res) => {
    // This only runs if payment was verified!
    const { text } = req.body;
    const sentiment = await analyzeSentiment(text);
    
    res.json({
      success: true,
      sentiment,
      poweredBy: 'YourAgentName',
      transaction: req.payment.txHash  // Proof of payment
    });
  }
);

app.listen(process.env.PORT || 3006);
```

**Key points:**
- Payment verification happens automatically
- Your code only runs after successful payment
- Transaction hash included for audit trail

---

### **Step 3: Start Development Environment (1 command)**

```bash
cd my-agent-service
npm install
ascent dev
```

**Output:**
```
🔥 Ascent Development Environment starting...

✓ Local Facilitator active on port 4022
  → Verifies x402 payments
  → Settles on Aptos testnet
  
🚀 Launching agent server...
  → Server on port 3006
  → Endpoint: /api/paid-endpoint
  
💰 Payment recipient: 0x489c...fe5d
```

**What's running:**
| Component | Port | Purpose |
|-----------|------|---------|
| Facilitator | 4022 | Verifies & settles payments |
| Agent Server | 3006 | Your API with x402 middleware |

---

### **Step 4: Test With Real Wallets (2 minutes)**

```bash
# In another terminal
ascent test --all-wallets
```

**Output:**
```
🧪 Ascent Multi-Wallet Stress Test
Target: http://localhost:3006/api/paid-endpoint

Wallet 1  ✓ FORGED  0.01 USDC  TX: 0x7a3f...
Wallet 2  ✓ FORGED  0.01 USDC  TX: 0x9b2e...
Wallet 3  ✓ FORGED  0.01 USDC  TX: 0x4c8d...
Wallet 4  ✓ FORGED  0.01 USDC  TX: 0x1f5a...
Wallet 5  ✓ FORGED  0.01 USDC  TX: 0x6d9b...

Success Rate: 100%
Aggregated Volume: 0.05 USDC
```

**What happens:**
1. Each wallet sends a request to your endpoint
2. Receives 402 Payment Required response
3. Signs transaction with USDC
4. Facilitator verifies & settles
5. Your API processes the request
6. Payment confirmed on-chain

**You see:** Real USDC flowing to your wallet.

---

### **Step 5: Register Identity & Build Reputation (AAIS)**

Register your agent to build reputation:

```bash
ascent identity register \
  --address 0x489cbd8ade2279edc20ef18a52b894d5a983575c1c0979e901be60b73741fe5d \
  --name "SentimentPro"
```

**Output:**
```
✓ Agent SentimentPro registered for 0x489c...fe5d
```

**Check your reputation:**
```bash
ascent identity show --address 0x489c...fe5d
```

**Output:**
```
Agent Metrics: SentimentPro
  Address:      0x489c...fe5d
  Trust Score:  85/100
  Total Earned: 1,240 USDC
  Success Rate: 96%
  Completed:    48 jobs
```

**AAIS Score Formula:**
```
AAIS = 30 (base) + (success_rate × 50) + min(volume/1M, 20)
```

| Tier | Score | Meaning |
|------|-------|---------|
| Elite | 90-100 | Top 10%, premium pricing |
| Verified | 70-89 | Can list services |
| Standard | 50-69 | Can consume only |
| New | 0-49 | Building reputation |

---

### **Step 6: Launch Dashboard & Monitor**

```bash
ascent dashboard --port 3003
```

**Opens:** http://localhost:3003

**Dashboard shows:**
- Real-time transaction stream
- Total volume & earnings
- AAIS score history
- Top agents leaderboard
- Recent activity feed

---

### **Step 7: Deploy to Production**

When ready for mainnet:

```bash
# Update environment for production
cat > .env.production << EOF
PORT=3006
NETWORK=aptos:1
FACILITATOR_URL=https://facilitator.x402.io
PAYMENT_RECIPIENT_ADDRESS=your_mainnet_address
USDC_ASSET=0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b
EOF

# Build & deploy
npm run build
npm start
```

**Production checklist:**
- [ ] Mainnet wallet funded with APT for gas
- [ ] Real USDC payments enabled
- [ ] Facilitator URL set to production
- [ ] Domain & SSL configured
- [ ] Monitoring & alerting set up

---

## **Full Command Reference**

| Command | Purpose | Example |
|---------|---------|---------|
| `ascent init <name>` | Scaffold new project | `ascent init my-api --template express` |
| `ascent dev` | Start dev environment | `ascent dev --port 3006` |
| `ascent test` | Test with wallets | `ascent test --all-wallets` |
| `ascent identity register` | Register agent identity | `ascent identity register --address 0x... --name "BotName"` |
| `ascent identity show` | View reputation | `ascent identity show --address 0x...` |
| `ascent dashboard` | Launch analytics UI | `ascent dashboard --port 3003` |

---

## **Architecture Overview**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client Agent  │────▶│  Your API Server │────▶│  x402 Middleware│
│  (wants service)│     │   (port 3006)    │     │  (verifies pay) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
         │                                                │
         │◀───────────────────────────────────────────────┘
         │                        402 Payment Required
         │
         │     Signs transaction with USDC
         ▼
┌─────────────────────────────────────────────────────────┐
│                   Facilitator (port 4022)                │
│              Verifies signature & settles                │
│                   on Aptos blockchain                    │
└─────────────────────────────────────────────────────────┘
         │
         │     Payment confirmed
         ▼
┌─────────────────────────────────────────────────────────┐
│                Your Business Logic Runs                  │
│              (analyze, process, respond)                 │
└─────────────────────────────────────────────────────────┘
```

---

## **Real-World Example: SentimentPro**

> "I built a sentiment analysis API. With Ascent:
> 
> 1. `ascent init sentiment-api` — project ready in 2 minutes
> 2. Added my AI model to `/api/analyze`
> 3. `ascent dev` — testing with 5 wallets immediately
> 4. Built AAIS reputation (92 Elite tier)
> 5. Listed on AgentMesh marketplace
> 6. Now earning 0.01 USDC per call, fully automated"

**— Alex, AI Developer**

---

## **Value Summary**

| Without Ascent | With Ascent |
|----------------|-------------|
| Build billing: 2 weeks | `ascent init`: 2 minutes |
| Stripe integration: 1 week | Pre-configured: instant |
| Reputation system: 1 week | AAIS built-in: automatic |
| **Total: 4 weeks** | **Total: 10 minutes** |

---

## **Next Steps**

1. **Try it:** `ascent init test-project && cd test-project && ascent dev`
2. **Read:** [Technical Guide](./guide.md) for advanced configuration
3. **Explore:** [AgentMesh Marketplace](../examples/agentmesh-marketplace/) for inspiration
4. **Build:** Your own x402-enabled agent service

---

*Built for the Canteen × Aptos × x402 Hackathon 2026*
