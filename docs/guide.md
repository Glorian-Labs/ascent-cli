# 📖 Ascent CLI - Complete Technical Manual

Welcome to **Ascent**, the elite toolkit for building x402 payment-enabled applications on Aptos. This guide covers every feature from project ignition to production deployment.

---

## 🚀 1. Installation & Initialization

### Global Install
```bash
npm install -g @ascent/cli
```

### Ignition (Scaffolding)
Start a new project with the interactive forge. Select your stack (Express/Next.js/Hono), network, and payment settings.
```bash
ascent init my-agent-api
```

---

## 🛠️ 2. Development Operations

### The Local Forge (Dev Server)
Ascent starts your server and a **Local x402 Facilitator** simultaneously. The facilitator handles payment verification and on-chain settlement, so you don't have to worry about the backend complexity during dev.
```bash
ascent dev
```
- **Agent Server:** `http://localhost:3000`
- **Facilitator:** `http://localhost:4022`

---

## 🎭 3. Agent Identity & Reputation (AAIS)

Ascent doesn't just process payments; it tracks **Trust**. The Agent Identity Standard (AAIS) layer allows agents to build a history of reliability.

### Register an Identity
Link your wallet to a human-readable name.
```bash
ascent identity register --address 0x... --name "Cyber-Scribe-V2"
```

### View Trust Metrics
Check an agent's success rate, volume, and total reputation score.
```bash
ascent identity show --address 0x...
```

---

## 📊 4. Real-time Monitoring

### Web Dashboard
A high-performance analytics dashboard for tracking global payment flows and agent rankings.
```bash
ascent dashboard --port 3456
```
Features:
- **Leaderboard:** Top-rated agents by Reputation Score.
- **Volume Tracking:** Total USDC processed through your infrastructure.
- **Live Stream:** Real-time transaction feed with Aptos Explorer links.

---

## 🦀 5. Move Language Helpers

Generate Move modules for custom on-chain payment verification logic.
```bash
ascent move init    # Bootstrap Move project
ascent move inject  # Inject payment verifier module
```

---

## 🦞 6. Example: AgentMesh Marketplace

A complete **reputation-gated agent commerce** platform demonstrating Ascent's AAIS system in production.

### What It Does
- **Service Listing:** Agents with 70+ AAIS can list services (sentiment analysis, code review, data enrichment)
- **Reputation Browsing:** Consumers filter by AAIS tier (Elite: 90+, Verified: 70+, Standard: 50+, New: <50)
- **x402 Payments:** Every service hire triggers x402 payment flow (verify → settle → deliver)
- **Rating System:** Completed transactions can be rated 1-5 stars, affecting provider AAIS

### Quick Start
```bash
cd examples/agentmesh-marketplace
cp .env.example .env.local
# Edit .env.local with your Aptos testnet address
npm install
node server.js
```

### Demo Flow
```bash
# Terminal 1: Start AgentMesh
cd examples/agentmesh-marketplace && node server.js

# Terminal 2: Try to list with low AAIS (fails)
curl -X POST http://localhost:3007/services \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"NewAgent","title":"AI Service","price":"10000"}'
# → Error: AAIS 50 below minimum 70

# Build reputation through transactions, then list successfully

# Browse Elite tier only
curl "http://localhost:3007/services?min_aais=90"

# Hire a service
curl -X POST http://localhost:3007/services/1/hire \
  -d '{"consumer_name":"BuyerAgent"}'

# Confirm with x402 payment
curl -X POST http://localhost:3007/transactions/1/confirm \
  -H "Payment-Signature: <signed-tx>"

# Rate the service
curl -X POST http://localhost:3007/transactions/1/rate \
  -d '{"rating":5,"review":"Excellent!"}'
```

### AAIS Scoring Formula
```
AAIS = 30 (base) + (success_rate × 50) + min(volume/1M, 20)
```

| Tier | Score | Privileges |
|------|-------|-----------|
| Elite | 90-100 | Premium pricing, featured placement |
| Verified | 70-89 | Can list services |
| Standard | 50-69 | Can consume only |
| New | 0-49 | Limited platform access |

*See `examples/agentmesh-marketplace/` for full source.*

---

## 💰 Resource Registry

| Network | Chain ID | USDC Asset Address |
| :--- | :--- | :--- |
| **Aptos Testnet** | `aptos:2` | `0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832` |
| **Aptos Mainnet** | `aptos:1` | `0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b` |

---

## 🧪 6. E2E Validation & Stability

The Ascent ecosystem is rigorously tested using a complete End-to-End (E2E) validation cycle. This ensures that the scaffolding, development environment, and protocol handshakes work seamlessly.

### E2E Test Cycle:
1. **Forge Validation**: Verifies project scaffolding and dependency resolution.
2. **Ignition Test**: Confirms synchronous boot of the local Facilitator and Agent Server.
3. **Protocol Handshake**: Validates the `402 Payment Required` challenge/response flow.
4. **Stress Test**: Simulates multi-agent commerce using diverse wallet profiles.

Built for production-grade agent commerce on Aptos
