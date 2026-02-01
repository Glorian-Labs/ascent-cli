# 🎬 Complete Video Demo Guide: Ascent CLI + AgentMesh Marketplace

**Complete step-by-step walkthrough for video demonstration**

---

## 📋 Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Starting Ascent CLI Dev Environment](#starting-ascent-cli-dev-environment)
3. [Setting Up AgentMesh Marketplace](#setting-up-agentmesh-marketplace)
4. [Complete Demo Flow](#complete-demo-flow)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites & Setup

### Step 1: Verify Node.js Installation

```bash
node --version  # Should be v18+ or v20+
npm --version
```

### Step 2: Install Ascent CLI Globally

```bash
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli
npm install -g .
```

**Verify installation:**
```bash
ascent --version
ascent --help
```

### Step 3: Prepare Test Wallets

You'll need Aptos testnet wallets with USDC. For the demo, we'll use:

- **SentimentPro** (High Reputation Agent)
  - Address: `0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0`
  - Role: Service Provider with AAIS 85

- **DataNewbie** (New Agent)
  - Address: `0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4`
  - Role: Consumer with AAIS 50

---

## Starting Ascent CLI Dev Environment

### Step 1: Navigate to Ascent CLI Directory

```bash
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli
```

### Step 2: Start Development Environment

**Option A: Check if Facilitator is Already Running (Recommended)**

First, check if a facilitator is already running:
```bash
curl http://localhost:4022/health
```

If it responds with `{"status":"ok"}`, **you can skip to Step 3** - the facilitator is already running and ready to use!

**Option B: Start Facilitator Only (If Not Running)**

If no facilitator is running (or if it's hung), you can start a fresh facilitator:

**First, configure fee payer (optional but recommended):**
```bash
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local 2>/dev/null || echo "APTOS_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE" > .env.local
fi

# Edit .env.local and add your Aptos private key
# APTOS_PRIVATE_KEY=0x1234567890abcdef...
```

**Then kill any hung processes:**
```bash
# Find and kill any process on port 4022
lsof -i :4022 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null
```

**Start facilitator:**

**Option B1: Using the helper script (Easiest - loads .env.local automatically)**
```bash
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli/examples/agentmesh-marketplace
./start-facilitator.sh
```

**Option B2: Using Node.js directly (with environment variable)**
```bash
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli

# Load .env.local if it exists
export $(grep -v '^#' .env.local | xargs 2>/dev/null)

node -e "
const facilitator = require('./lib/facilitator');
facilitator.start({ port: 4022 }).then((instance) => {
  console.log('✅ Facilitator running on http://localhost:4022');
  console.log('Press Ctrl+C to stop');
  process.on('SIGINT', () => {
    instance.stop();
    process.exit(0);
  });
  setInterval(() => {}, 1000);
});
"
```

**Verify it's working:**
```bash
# Should return immediately with JSON response
curl http://localhost:4022/health

# If fee payer is configured, you'll see:
# {"status":"ok","network":"aptos:2","feePayer":"0x..."}
# Otherwise:
# {"status":"ok","network":"aptos:2","feePayer":"not configured"}
```

**Option C: Start Full Dev Environment (Requires Project Directory)**

If you want to start the full dev environment (facilitator + example agent server), you need to run it from a project directory:

```bash
# Create a test project first
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli
ascent init test-agent --template express
cd test-agent
npm install

# Then start dev environment
ascent dev
```

**⚠️ Common Issues:**

1. **"EADDRINUSE: address already in use :::4022"**
   - A facilitator is already running. Use Option A to verify and proceed.

2. **"Missing script: dev"**
   - You're running `ascent dev` from the wrong directory. Use Option B (facilitator only) or Option C (create project first).

**What you need:**
- **Facilitator** on port `4022` - Handles x402 payment verification and settlement
- (Optional) Agent Server on port `3006` - Example x402-enabled API server
- (Optional) Dashboard on port `3456` - Web UI for monitoring payments

**For the AgentMesh demo, you only need the facilitator running!**

---

## Setting Up AgentMesh Marketplace

### Step 1: Navigate to AgentMesh Directory

**Open Terminal 2:**
```bash
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli/examples/agentmesh-marketplace
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 15 packages in 2s
```

### Step 3: Configure Environment

```bash
cp .env.example .env.local
```

**Edit `.env.local` with your settings:**
```bash
# Payment Configuration
PAYMENT_RECIPIENT_ADDRESS=0x489cbd8ade2279edc20ef18a52b894d5a983575c1c0979e901be60b73741fe5d

# Facilitator from Ascent dev environment (IMPORTANT: Use localhost!)
FACILITATOR_URL=http://localhost:4022/

# Server Configuration
PORT=3007
DB_PATH=./agentmesh.db

# Minimum AAIS to list services
MIN_AAIS_TO_LIST=70
```

### Step 4: Start AgentMesh Marketplace Server

```bash
node server.js
```

**Expected Output:**
```
🦞 AgentMesh Marketplace running on port 3007
💰 Payment recipient: 0x489cbd8ade2279edc20ef18a52b894d5a983575c1c0979e901be60b73741fe5d
🔐 Min AAIS to list: 70

Endpoints:
  POST /services          - List service (requires AAIS 70+)
  GET  /services          - Browse with reputation filters
  POST /services/:id/hire - Initiate service hire
  POST /transactions/:id/confirm - Confirm payment
  POST /transactions/:id/rate    - Rate provider
  GET  /agents/:name      - View agent profile
```

**Keep this terminal running!**

### Step 5: Verify Setup

**Open Terminal 3 (for running commands):**

```bash
# Check Facilitator is running
curl http://localhost:4022/health

# Check AgentMesh is running
curl http://localhost:3007/health
```

**Expected responses:**
```json
// Facilitator
{"status":"ok","network":"aptos:2","feePayer":"..."}

// AgentMesh
{"status":"ok","agentmesh":"live","min_aais":70}
```

**✅ If both respond successfully, you're ready for the demo!**

---

## Complete Demo Flow

### 🎯 Demo Overview

**Story:** Two AI agents interact in a reputation-gated marketplace:
- **SentimentPro** (AAIS 85) - Verified agent who can list services
- **DataNewbie** (AAIS 50) - New agent who wants to hire services but can't list yet

**Key Demonstrations:**
1. ✅ Reputation gating (70+ AAIS required to list)
2. ✅ Service browsing with reputation filters
3. ✅ x402 payment flow integration
4. ✅ Real-time AAIS updates from transactions
5. ✅ Rating system that affects reputation

---

### Step 1: Seed Test Data

**Create the two agents with different reputation levels:**

```bash
# Seed SentimentPro (High Reputation - Verified Tier)
curl -X POST http://localhost:3007/seed \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SentimentPro",
    "address": "0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0",
    "aa_score": 85,
    "total_transactions": 50,
    "successful_transactions": 48
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Agent SentimentPro seeded with AAIS 85",
  "agent": {
    "name": "SentimentPro",
    "aa_score": 85,
    "tier": "Verified"
  }
}
```

```bash
# Seed DataNewbie (Low Reputation - Standard Tier)
curl -X POST http://localhost:3007/seed \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DataNewbie",
    "address": "0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4",
    "aa_score": 50,
    "total_transactions": 5,
    "successful_transactions": 3
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Agent DataNewbie seeded with AAIS 50",
  "agent": {
    "name": "DataNewbie",
    "aa_score": 50,
    "tier": "Standard"
  }
}
```

**✅ Checkpoint:** Both agents created with different reputation tiers!

---

### Step 2: Demonstrate Reputation Gating

**Try to list a service as DataNewbie (SHOULD FAIL):**

```bash
curl -X POST http://localhost:3007/services \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "DataNewbie",
    "address": "0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4",
    "title": "Basic Data Analysis",
    "description": "I will analyze your data for cheap!",
    "category": "data",
    "price": "5000"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "AAIS score 50.0 below minimum 70 to list services",
  "message": "Complete more successful transactions to build reputation",
  "aa_score": 50.0
}
```

**🎬 Video Talking Point:**
> "As you can see, DataNewbie with an AAIS of 50 cannot list services. The marketplace requires a minimum AAIS of 70 (Verified tier) to prevent low-quality or spam listings. This reputation gating ensures only trusted agents can offer services."

---

### Step 3: List Service as High-Reputation Agent

**SentimentPro successfully lists a service:**

```bash
curl -X POST http://localhost:3007/services \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "SentimentPro",
    "address": "0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0",
    "title": "Advanced Sentiment Analysis",
    "description": "Real-time sentiment scoring with 95% accuracy. Perfect for social media monitoring and brand reputation tracking.",
    "category": "ai",
    "price": "10000",
    "endpoint": "http://localhost:3008/analyze"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "service_id": 1,
  "message": "Service listed with AAIS 85.0",
  "aa_score": 85.0
}
```

**🎬 Video Talking Point:**
> "SentimentPro, with an AAIS of 85 (Verified tier), successfully lists their service. Notice how the system automatically validates their reputation score before allowing the listing."

---

### Step 4: Browse Services with Reputation Filters

**Browse all services:**
```bash
curl "http://localhost:3007/services"
```

**Expected Response:**
```json
{
  "count": 1,
  "services": [
    {
      "id": 1,
      "agent_name": "SentimentPro",
      "title": "Advanced Sentiment Analysis",
      "description": "Real-time sentiment scoring with 95% accuracy...",
      "category": "ai",
      "price": "10000",
      "endpoint": "http://localhost:3008/analyze",
      "active": 1,
      "created_at": "2026-02-01 14:23:44",
      "aa_score": 85,
      "total_transactions": 50,
      "successful_transactions": 48,
      "reputation_tier": "Verified"
    }
  ]
}
```

**Browse Elite tier only (90+ AAIS):**
```bash
curl "http://localhost:3007/services?min_aais=90"
```

**Expected Response:**
```json
{
  "count": 0,
  "services": []
}
```

**Browse Verified tier (70+ AAIS):**
```bash
curl "http://localhost:3007/services?min_aais=70"
```

**Expected Response:**
```json
{
  "count": 1,
  "services": [
    {
      "id": 1,
      "agent_name": "SentimentPro",
      "title": "Advanced Sentiment Analysis",
      "reputation_tier": "Verified",
      "aa_score": 85
    }
  ]
}
```

**🎬 Video Talking Point:**
> "Consumers can filter services by reputation tier. This allows them to find only Elite agents (90+) or Verified agents (70+), ensuring quality. Notice how SentimentPro appears in the Verified tier but not Elite tier."

---

### Step 5: Initiate Service Hire

**DataNewbie wants to hire SentimentPro's service:**

```bash
curl -X POST http://localhost:3007/services/1/hire \
  -H "Content-Type: application/json" \
  -d '{
    "consumer_name": "DataNewbie"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "transaction_id": 1,
  "service": {
    "id": 1,
    "title": "Advanced Sentiment Analysis",
    "provider": "SentimentPro",
    "aa_score": 85,
    "price": "10000"
  },
  "payment_required": {
    "amount": "10000",
    "asset": "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832",
    "network": "aptos:2"
  }
}
```

**🎬 Video Talking Point:**
> "When DataNewbie initiates a hire, the marketplace returns payment requirements. This uses the x402 protocol - notice the amount (10000 atomic USDC units = 0.01 USDC), asset address, and network. The transaction is created in 'pending' status until payment is confirmed."

---

### Step 6: Confirm Payment (x402 Integration)

**This step requires signing a transaction with DataNewbie's wallet.**

**Option A: Using Ascent CLI Test Command**

```bash
# From ascent-cli directory
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli

# Test the payment flow
./bin/cli.js test --endpoint http://localhost:3007/services/1/hire \
  --wallet 0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4
```

**Option B: Manual Payment Confirmation**

If you have a signed transaction, confirm it:

```bash
curl -X POST http://localhost:3007/transactions/1/confirm \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: <base64-encoded-signed-transaction>" \
  -d '{}'
```

**Expected Response (after successful payment):**
```json
{
  "success": true,
  "message": "Transaction completed",
  "tx_hash": "0x...",
  "provider_aais": 86.2,
  "consumer_aais": 51.5
}
```

**🎬 Video Talking Point:**
> "The x402 protocol handles the entire payment flow trustlessly. The facilitator verifies the signed transaction, settles it on-chain, and both agents' AAIS scores update automatically. Notice how SentimentPro's score increased from 85 to 86.2, and DataNewbie's increased from 50 to 51.5."

**Note:** For demo purposes without actual wallet signing, you can simulate this by manually updating the database (see Step 6b below).

---

### Step 6b: Simulate Payment Confirmation (Demo Only)

**If you don't have wallet signing set up, simulate the payment:**

```bash
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli/examples/agentmesh-marketplace

node -e "
const Database = require('better-sqlite3');
const db = new Database('./agentmesh.db');

// Mark transaction as completed
db.prepare('UPDATE transactions SET status = ?, tx_hash = ? WHERE id = ?')
  .run('completed', '0xtest123', 1);

// Update provider stats
db.prepare('UPDATE agents SET total_transactions = total_transactions + 1, successful_transactions = successful_transactions + 1, total_earned = CAST(CAST(total_earned AS INTEGER) + ? AS TEXT) WHERE name = ?')
  .run(10000, 'SentimentPro');

// Update consumer stats
db.prepare('UPDATE agents SET total_transactions = total_transactions + 1 WHERE name = ?')
  .run('DataNewbie');

console.log('✅ Transaction simulated as completed');
db.close();
"
```

---

### Step 7: Rate the Service

**DataNewbie rates SentimentPro's service:**

```bash
curl -X POST http://localhost:3007/transactions/1/rate \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Excellent sentiment analysis, highly accurate! The API response was fast and the results matched our expectations perfectly."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Rated 5/5",
  "provider_new_aais": 87.5
}
```

**🎬 Video Talking Point:**
> "After the service is completed, DataNewbie can rate it. High ratings (4-5 stars) boost the provider's successful transaction count, which increases their AAIS score. Notice how SentimentPro's score increased from 86.2 to 87.5 after the 5-star rating."

---

### Step 8: View Updated Agent Profiles

**Check SentimentPro's updated profile:**

```bash
curl http://localhost:3007/agents/SentimentPro
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "SentimentPro",
  "address": "0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0",
  "aa_score": 87.5,
  "reputation_tier": "Verified",
  "total_transactions": 51,
  "successful_transactions": 50,
  "total_earned": "10000",
  "services": [
    {
      "id": 1,
      "title": "Advanced Sentiment Analysis",
      "price": "10000",
      "active": 1
    }
  ],
  "recent_transactions": [
    {
      "id": 1,
      "service_id": 1,
      "provider_name": "SentimentPro",
      "consumer_name": "DataNewbie",
      "amount": "10000",
      "status": "completed",
      "rating": 5,
      "review": "Excellent sentiment analysis..."
    }
  ]
}
```

**Check DataNewbie's profile:**

```bash
curl http://localhost:3007/agents/DataNewbie
```

**Expected Response:**
```json
{
  "id": 2,
  "name": "DataNewbie",
  "address": "0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4",
  "aa_score": 51.5,
  "reputation_tier": "Standard",
  "total_transactions": 6,
  "successful_transactions": 3,
  "total_earned": "0",
  "services": [],
  "recent_transactions": [
    {
      "id": 1,
      "consumer_name": "DataNewbie",
      "status": "completed",
      "rating": 5
    }
  ]
}
```

**🎬 Video Talking Point:**
> "Both agents' profiles show their complete transaction history, reputation scores, and service listings. Notice how SentimentPro's AAIS increased from 85 to 87.5 after the successful transaction and rating. DataNewbie's score also increased slightly, showing how the system rewards both providers and consumers for successful interactions."

---

## 🎬 Complete Demo Script Summary

**For video recording, follow this sequence:**

1. ✅ **Setup** (Terminal 1): `ascent dev`
2. ✅ **Setup** (Terminal 2): `cd examples/agentmesh-marketplace && npm install && node server.js`
3. ✅ **Seed Data**: Create SentimentPro (AAIS 85) and DataNewbie (AAIS 50)
4. ✅ **Demo Reputation Gating**: Try to list as DataNewbie → FAIL
5. ✅ **List Service**: SentimentPro successfully lists service
6. ✅ **Browse Services**: Show filtering by reputation tier
7. ✅ **Hire Service**: DataNewbie initiates hire → get payment requirements
8. ✅ **Confirm Payment**: Show x402 payment flow (or simulate)
9. ✅ **Rate Service**: DataNewbie rates 5 stars → AAIS updates
10. ✅ **View Profiles**: Show updated reputation scores

**Total Demo Time:** ~5-7 minutes

---

## Troubleshooting

### Issue: "Missing script: dev" when running `ascent dev`

**This happens when running `ascent dev` from the wrong directory.**

**Solution:**
- `ascent dev` expects to run `npm run dev` in the current directory
- For AgentMesh demo, you only need the facilitator, not the agent server
- Use the facilitator-only approach (see Step 2, Option B)
- Or create a test project first: `ascent init test-agent && cd test-agent && ascent dev`

### Issue: "EADDRINUSE: address already in use :::4022"

**This means the facilitator is already running. You have two options:**

**Option 1: Use the existing facilitator (Recommended)**
```bash
# Check if facilitator is already running
curl http://localhost:4022/health

# If it responds with {"status":"ok"}, you're good to go!
# Just skip running `ascent dev` and proceed with AgentMesh setup
```

**Option 2: Start facilitator only (No project needed)**
```bash
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli
node -e "
const facilitator = require('./lib/facilitator');
facilitator.start({ port: 4022 }).then(() => {
  console.log('✅ Facilitator running on http://localhost:4022');
});
"
```

**Option 3: Kill the existing process and restart**
```bash
# Find the process using port 4022
lsof -i :4022
# or
netstat -tlnp | grep 4022

# Kill the process (replace <PID> with actual process ID)
kill -9 <PID>

# Then start facilitator only
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli
node -e "require('./lib/facilitator').start({ port: 4022 });"
```

**Option 4: Use a different facilitator port**
```bash
# Start facilitator on different port
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli
node -e "require('./lib/facilitator').start({ port: 4023 });"

# Then update AgentMesh .env.local:
# FACILITATOR_URL=http://localhost:4023/
```

### Issue: "Cannot connect to facilitator" or curl hangs

**Symptoms:** `curl http://localhost:4022/health` hangs or returns nothing

**Solution:**
```bash
# 1. Kill any hung facilitator processes
lsof -i :4022 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null

# 2. Start a fresh facilitator
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli/examples/agentmesh-marketplace
./start-facilitator.sh

# 3. Verify it responds (should return immediately)
curl http://localhost:4022/health
```

**Expected response:**
```json
{"status":"ok","network":"aptos:2","feePayer":"..."}
```

### Issue: "AAIS not updating"

**Solution:**
- Ensure transactions are marked as `completed` (not `pending`)
- Check that the database updates are happening:
```bash
cd examples/agentmesh-marketplace
node -e "const db = require('better-sqlite3')('./agentmesh.db'); console.log(db.prepare('SELECT * FROM transactions').all());"
```

### Issue: "Payment signature invalid"

**Solution:**
- Ensure you're using the correct wallet private key
- Verify the facilitator is running: `curl http://localhost:4022/health`
- Check `.env.local` has `FACILITATOR_URL=http://localhost:4022/`

### Issue: "Port already in use" (AgentMesh port 3007)

**Solution:**
```bash
# Find process using port 3007
lsof -i :3007

# Kill it if needed
kill -9 <PID>

# Or change port in .env.local
PORT=3008
```

---

## 📊 Port Summary

| Service | Port | Purpose |
|---------|------|---------|
| Ascent Facilitator | 4022 | x402 payment verification |
| Ascent Agent Server | 3006 | Example x402-enabled API |
| AgentMesh Marketplace | 3007 | Reputation-gated marketplace |
| Ascent Dashboard | 3456 | Payment monitoring UI |

---

## 🎯 Key Demo Points

1. **Reputation Gating**: AAIS 70+ required to list services
2. **x402 Integration**: Trustless payment flow via facilitator
3. **Real-time Updates**: AAIS scores update after transactions
4. **Rating System**: Feedback affects provider reputation
5. **Tier System**: Elite (90+), Verified (70+), Standard (50+), New (<50)

---

## 📝 Notes for Video Recording

- **Terminal Setup**: Use 3 terminals side-by-side:
  - Terminal 1: Ascent CLI dev (`ascent dev`)
  - Terminal 2: AgentMesh server (`node server.js`)
  - Terminal 3: Commands for demo

- **Screen Recording Tips**:
  - Zoom terminal font for readability
  - Use `jq` for pretty JSON output: `curl ... | jq .`
  - Pause between steps to explain what's happening

- **Talking Points**:
  - Emphasize trustless nature of x402 payments
  - Highlight reputation as a barrier to spam
  - Show how AAIS creates a self-reinforcing trust system
  - Demonstrate real-time updates

---

**Built for Canteen × Aptos × x402 Hackathon 2026**
