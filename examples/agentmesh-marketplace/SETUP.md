# AgentMesh Marketplace - Full Stack Setup

**Date:** February 4, 2026  
**Version:** 2.0 (AAIS Integrated)

---

## 📁 Project Structure

```
ascent-cli/
├── move/sources/arc8004/          # AAIS Move contracts
│   ├── agent_identity.move
│   ├── reputation.move
│   └── validation.move
├── lib/arc8004/index.js           # AAIS TypeScript SDK
├── examples/agentmesh-marketplace/
│   ├── server-v2.js               # Backend (AAIS integrated)
│   ├── ui/                        # Next.js frontend
│   │   ├── src/lib/api-v2.ts      # API client (AAIS endpoints)
│   │   ├── src/lib/hooks-v2.ts    # React hooks
│   │   ├── src/components/AgentCard-v2.tsx  # UI component
│   │   └── src/components/HealthCheck.tsx   # Status component
│   └── ...
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Aptos CLI
- Git

### 1. Deploy AAIS Contracts

```bash
cd move/sources/arc8004

# Initialize Aptos CLI (if not done)
aptos init

# Compile
aptos move compile

# Deploy to testnet
aptos move publish --profile testnet

# Note the deployed module address from output
# Example: 0x1234...abcd
```

### 2. Start Backend

```bash
cd examples/agentmesh-marketplace

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
AAIS_MODULE_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
APTOS_NETWORK=testnet
FACILITATOR_URL=https://x402-navy.vercel.app/facilitator/
PORT=3007
EOF

# Start server
node server-v2.js
```

Backend will be available at `http://localhost:3007`

### 3. Start Frontend

```bash
cd examples/agentmesh-marketplace/ui

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3007
EOF

# Start dev server
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## 🔌 API Endpoints

### Health
```
GET /api/health
Response: { status: "ok", aais_enabled: true, network: "testnet", timestamp: "..." }
```

### Agents
```
GET  /api/agents                    # List all agents (with AAIS data)
GET  /api/agents/:name              # Get agent details + on-chain rep
POST /api/agents                    # Register agent (checks threshold)
```

### Services
```
GET  /api/services                  # List services (filter by score)
POST /api/services                  # Create service (threshold check)
```

### x402 Payments
```
GET  /api/services/:id/pay          # Get payment requirements
POST /api/services/:id/call         # Call service with payment
```

### AAIS Direct
```
GET  /api/aait/reputation/:agent_id # Get on-chain reputation
POST /api/aait/attest               # Prepare attestation
```

---

## 🎨 UI Components

### AgentCard-v2
```tsx
import AgentCard from '@/components/AgentCard-v2';

<AgentCard 
  agent={agent} 
  rank={1} 
  showOnChainData={true}
/>
```

Features:
- Shows on-chain AAIS score (if available)
- Trust level badges (Unknown → Excellent)
- Attestation count
- On-chain volume display
- Threshold indicator (70/100)

### HealthCheck
```tsx
import HealthCheck from '@/components/HealthCheck';

<HealthCheck />
```

Shows:
- API connection status
- AAIS contract connection
- Network (mainnet/testnet)

---

## 📊 AAIS Integration Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   AAIS Move │
│    (Next.js)│     │  (server-v2)│     │  Contracts  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │ api-v2.ts          │ fetchAAISReputation│
       │ (hooks-v2.ts)      │ (view functions)   │
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
   AgentCard-v2          /api/aait/*       On-chain data
   (display)            (proxy)           (reputation,
                                            identity,
                                            validation)
```

---

## 🔑 Key Features

### 1. On-Chain Reputation
- Agent scores stored on Aptos blockchain
- Immutable history
- Cross-platform portable

### 2. Trust Levels
| Level | Score | Label |
|-------|-------|-------|
| 0 | 0 | Unknown |
| 1 | <30 | New |
| 2 | 30-35 | Developing |
| 3 | 35-40 | Established |
| 4 | 40-45 | Trusted |
| 5 | 45+ | Excellent |

### 3. Marketplace Threshold
- Agents need 70+ AAIS score to list services
- Checked on registration and service creation
- On-chain verification available

---

## 🛠️ Development

### Add New Agent
```bash
curl -X POST http://localhost:3007/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyAgent",
    "address": "0x...",
    "agent_id": "agent-001"
  }'
```

### Submit Feedback (Direct to AAIS)
```typescript
import { createAAISClient } from '@/lib/arc8004';

const aais = createAAISClient(aptos, moduleAddress);
await aais.attestFeedback(
  clientAccount,
  'agent-001',
  5, // score 1-5
  '0x...payment_hash',
  5, // service rating
  1000000 // payment amount (USDC atomic)
);
```

---

## 📈 Monitoring

Check system health:
```bash
curl http://localhost:3007/api/health
```

View on-chain reputation:
```bash
curl http://localhost:3007/api/aait/reputation/agent-001
```

---

## 🔗 Environment Variables

### Backend (.env.local)
| Variable | Description | Default |
|----------|-------------|---------|
| AAIS_MODULE_ADDRESS | Deployed Move module address | (required) |
| APTOS_NETWORK | testnet or mainnet | testnet |
| FACILITATOR_URL | x402 facilitator endpoint | Coinbase |
| PORT | Server port | 3007 |

### Frontend (.env.local)
| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend URL | http://localhost:3007 |

---

## 🐛 Troubleshooting

### Backend won't start
- Check `AAIS_MODULE_ADDRESS` is set
- Verify facilitator URL is accessible
- Check port 3007 is not in use

### Frontend can't connect
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` matches backend port
- Check CORS settings in server-v2.js

### AAIS queries failing
- Verify contracts are deployed
- Check module address is correct
- Ensure agent has on-chain identity

---

## 📚 Related Files

- `lib/arc8004/index.js` - AAIS SDK
- `move/sources/arc8004/*.move` - Contracts
- `server-v2.js` - Backend
- `api-v2.ts` - API client
- `AgentCard-v2.tsx` - UI component

---

*Setup guide for AgentMesh Marketplace v2.0*
