# Ascent Roadmap - Next Features

**Status:** Feb 4, 2026  
**Current Phase:** Pre-Production → Testnet  
**Target:** Mainnet Q2 2026

---

## Current State Summary

### ✅ Completed (Last 48 Hours)
1. **AgentMesh UI v2** - Cyber-Neo-Brutalist redesign merged to master
2. **AAIS Contracts** - Deployed to Aptos testnet
3. **x402 Payment Flow** - E2E tested locally
4. **Backend Server** - Running on port 3007 with AAIS integration

### 🔄 In Progress
- UI polish for production (Codex working on this)
- Mock data generation for realistic testing

---

## Phase 1: Facilitator & Testnet (Week of Feb 4-11)

### 1.1 Self-Hosted Facilitator for Aptos
**Priority:** P0 🔥  
**Owner:** Infrastructure  
**Estimated:** 3-4 days

#### Tasks
- [ ] Implement `/verify` endpoint for Aptos signatures
- [ ] Implement `/settle` endpoint for USDC transfers
- [ ] Connect to Aptos testnet node
- [ ] Handle USDC on Aptos (contract integration)
- [ ] Add transaction monitoring and retries
- [ ] Error handling for failed settlements
- [ ] Webhook notifications for settlement status

#### Technical Approach
```typescript
// Facilitator architecture
/src/facilitator/
├── index.ts           # Entry point
├── verify.ts          # Signature verification
├── settle.ts          # Blockchain settlement
├── aptos.ts           # Aptos client
├── usdc.ts            # USDC contract interface
└── webhook.ts         # Status notifications
```

#### Acceptance Criteria
- [ ] Can verify x402 payment signatures
- [ ] Can settle USDC on Aptos testnet
- [ ] Returns proper x402 headers
- [ ] Handles errors gracefully
- [ ] <2s settlement time

---

### 1.2 Mock Data & UI Testing
**Priority:** P0 🔥  
**Owner:** Frontend  
**Estimated:** 1-2 days

#### Tasks
- [ ] Create mock agent generator (50+ agents)
- [ ] Generate realistic service listings
- [ ] Create fake transaction history
- [ ] Mock AAIS scores with realistic distribution
- [ ] Add visual regression testing

#### Mock Data Schema
```typescript
// Mock Agents
{
  id: string;
  name: string;           // e.g., "DataAnalyzer_42"
  address: string;        // Aptos address
  aa_score: number;       // 0-100
  reputation_tier: 'Elite' | 'Verified' | 'Standard' | 'New';
  total_transactions: number;
  successful_transactions: number;
  total_earned: string;   // USDC micro units
  services: Service[];
  created_at: string;
}

// Mock Services
{
  id: string;
  title: string;          // e.g., " sentiment analysis"
  description: string;
  category: string;       // e.g., "AI", "Data", "Security"
  price: string;          // USDC micro units
  agent_id: string;
}

// Mock Transactions
{
  id: string;
  provider_name: string;
  consumer_name: string;
  service_id: string;
  service_title: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  rating?: number;
  created_at: string;
}
```

---

### 1.3 Bazaar Integration
**Priority:** P1  
**Owner:** Protocol  
**Estimated:** 2-3 days

#### Tasks
- [ ] Add Bazaar extension to route config
- [ ] Generate OpenAPI schemas for services
- [ ] Register services with Bazaar on startup
- [ ] Query Bazaar for external services
- [ ] Display external services in AgentMesh UI

#### Bazaar Schema
```typescript
// Service registration
{
  title: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  pricing: {
    amount: string;
    asset: string;
    network: string;
  };
  tags: string[];
  endpoint: string;
}
```

---

## Phase 2: Testnet Deployment (Week of Feb 11-18)

### 2.1 Testnet Infrastructure
**Priority:** P0 🔥  
**Owner:** DevOps  
**Estimated:** 2-3 days

#### Tasks
- [ ] Deploy facilitator to testnet server
- [ ] Set up monitoring (uptime, errors)
- [ ] Configure domain/DNS
- [ ] SSL certificates
- [ ] Database backups
- [ ] Log aggregation

#### Infrastructure
```
Testnet Stack:
- VPS: DigitalOcean/AWS (2vCPU, 4GB RAM)
- Database: SQLite (production: PostgreSQL)
- Node: Aptos testnet fullnode
- CDN: Cloudflare (optional)
```

---

### 2.2 Agent Onboarding Flow
**Priority:** P1  
**Owner:** Product  
**Estimated:** 3-4 days

#### Tasks
- [ ] Create agent registration wizard
- [ ] Wallet connection flow
- [ ] Identity NFT minting UI
- [ ] Service creation form
- [ ] Pricing calculator
- [ ] Terms & conditions

#### User Flow
```
1. Connect Wallet → 2. Create Identity → 3. List Services → 4. Set Pricing → 5. Go Live
```

---

### 2.3 Security Hardening
**Priority:** P0 🔥  
**Owner:** Security  
**Estimated:** 3-5 days

#### Tasks
- [ ] Smart contract audit (AAIS contracts)
- [ ] Rate limiting on API endpoints
- [ ] Input validation (zod schemas)
- [ ] SQL injection prevention
- [ ] CORS configuration
- [ ] API key authentication (optional)

---

## Phase 3: Ecosystem & Partnerships (Week of Feb 18-25)

### 3.1 x402 Foundation Alignment
**Priority:** P1  
**Owner:** Business  
**Estimated:** Ongoing

#### Tasks
- [ ] Join x402 Foundation
- [ ] Align with protocol standards
- [ ] Contribute to x402 repo (Aptos support)
- [ ] Register as ecosystem project
- [ ] Apply for grants

---

### 3.2 Aptos Foundation Collaboration
**Priority:** P1  
**Owner:** Business  
**Estimated:** Ongoing

#### Tasks
- [ ] Apply for Aptos ecosystem grant
- [ ] Present at Aptos events
- [ ] Collaborate on Move standards
- [ ] Co-marketing opportunities

---

### 3.3 Developer SDK
**Priority:** P2  
**Owner:** Engineering  
**Estimated:** 1 week

#### Tasks
- [ ] TypeScript SDK package
- [ ] React hooks for integration
- [ ] Example implementations
- [ ] API documentation
- [ ] Quickstart guide

---

## Phase 4: Mainnet Preparation (March)

### 4.1 Mainnet Deployment
**Priority:** P0 🔥  
**Owner:** DevOps  
**Timeline:** Early March

#### Tasks
- [ ] Production infrastructure (Kubernetes)
- [ ] Multi-region deployment
- [ ] Disaster recovery plan
- [ ] 99.9% uptime SLA
- [ ] On-call rotation

---

### 4.2 Token Economics (Optional)
**Priority:** P2  
**Owner:** Product  
**Timeline:** TBD

#### Ideas
- ASC token for governance
- Staking for validators
- Fee discounts for token holders
- Revenue sharing

---

### 4.3 Launch Campaign
**Priority:** P1  
**Owner:** Marketing  
**Timeline:** March

#### Tasks
- [ ] Launch announcement
- [ ] Demo videos
- [ ] Case studies
- [ ] Hackathon sponsorships
- [ ] Influencer partnerships

---

## Immediate Next Steps (This Week)

### Day 1-2: Facilitator
- [ ] Set up facilitator project structure
- [ ] Implement signature verification
- [ ] Connect to Aptos testnet

### Day 3-4: Mock Data
- [ ] Generate 50+ mock agents
- [ ] Create realistic services
- [ ] Populate UI with test data

### Day 5: Bazaar
- [ ] Add Bazaar extension
- [ ] Register services
- [ ] Query external services

---

## Resource Allocation

| Role | Current | Needed |
|------|---------|--------|
| Frontend | 1 (Codex) | 1 (polish) |
| Backend | 1 (me) | 1 (facilitator) |
| Smart Contracts | 1 (me) | 0 (auditor) |
| DevOps | 0 | 1 |
| Business | 0 | 1 (partnerships) |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| x402 protocol changes | Medium | High | Stay aligned with Foundation |
| Aptos network issues | Low | High | Multi-chain roadmap |
| Facilitator bugs | Medium | High | Extensive testing |
| UI not production-ready | Medium | High | Codex rework + user testing |
| Competition | High | Medium | First-mover, AAIS differentiation |

---

## Success Metrics

### Week 1 (Feb 4-11)
- [ ] Facilitator deployed to testnet
- [ ] 50 mock agents in UI
- [ ] Bazaar integration working

### Week 2 (Feb 11-18)
- [ ] Testnet live with real agents
- [ ] 10+ external services via Bazaar
- [ ] Security audit started

### Week 3 (Feb 18-25)
- [ ] x402 Foundation partnership
- [ ] Developer SDK published
- [ ] 100+ active agents

### Mainnet (March)
- [ ] $10K+ transaction volume
- [ ] 50+ active agents
- [ ] 99.9% uptime

---

## Questions for Lord Heb

1. **Facilitator:** Self-hosted or use Coinbase hosted for now?
2. **Mock Data:** Should I generate realistic AI agent personas?
3. **Bazaar:** Prioritize registering our services or querying external ones?
4. **Security:** Budget for professional smart contract audit?
5. **Partnerships:** Start outreach to x402 Foundation now?

---

*Roadmap v1.0 - Updated Feb 4, 2026*
