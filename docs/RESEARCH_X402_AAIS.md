# Ascent x402 & AAIS Research Compilation

**Date:** Feb 4, 2026  
**Researcher:** Hebx  
**Scope:** x402 protocol, Bazaar, ERC-8004/AAIS, Aptos facilitator

---

## 1. x402 Protocol Deep Dive

### What is x402?
x402 is an HTTP-native payment protocol for AI agents and autonomous services. It uses HTTP 402 (Payment Required) status code to initiate payment flows.

### Key Concepts

| Component | Description |
|-----------|-------------|
| **Resource Server** | API endpoint that requires payment |
| **Facilitator** | Intermediary that verifies and settles payments |
| **Client** | Agent/software that pays for services |
| **Payment Channel** | EIP-3009 (Transfer With Authorization) |

### Payment Flow (Exact Scheme)
```
1. Client → Resource Server: Request resource
2. Resource Server → Client: 402 Payment Required + x402 headers
3. Client → Facilitator: Submit signed authorization
4. Facilitator → Blockchain: Submit settlement transaction
5. Facilitator → Client: Settlement proof
6. Client → Resource Server: Request + PAYMENT-SIGNATURE header
7. Resource Server → Client: 200 OK + resource
```

### x402 Headers
- `X-PAYMENT-REQUIRED`: Base64-encoded payment requirement
- `PAYMENT-SIGNATURE`: Settlement proof from facilitator

### Supported Networks
- Base (main focus)
- Ethereum L1
- Aptos (emerging support)

---

## 2. x402 Bazaar (Discovery Layer)

### What is Bazaar?
A machine-readable catalog for discovering x402-compatible API endpoints. Think of it as a search index for payable APIs.

### Key Features
- **Programmatic Discovery:** Agents can find services without human intervention
- **Metadata:** Pricing, schemas, capabilities exposed via API
- **Automatic Registration:** Services registered when payments are processed
- **Global Visibility:** Single discovery layer for all x402 services

### Bazaar v2 Architecture
```typescript
// Route configuration with Bazaar extension
{
  path: '/api/service',
  payment: {
    amount: '1000000', // 1 USDC
    asset: '0x...',
    network: 'base'
  },
  extensions: {
    bazaar: {
      title: 'Data Analysis Service',
      description: 'AI-powered data analysis',
      inputSchema: { /* JSON Schema */ },
      outputSchema: { /* JSON Schema */ },
      tags: ['AI', 'Data', 'Analytics']
    }
  }
}
```

### Discovery Endpoint
```
GET /discovery/resources
Response: Array of available services with metadata
```

### Benefits for Ascent
1. **Agent Discovery:** Our agents can find services automatically
2. **Service Exposure:** Our marketplace services become discoverable globally
3. **Interoperability:** Agents from other platforms can hire our agents

---

## 3. ERC-8004 / AAIS (Agent Identity & Reputation)

### What is ERC-8004?
A standard for on-chain agent identity and reputation. Enables:
- Verifiable agent identities (NFT-based)
- Portable reputation scores
- Cross-platform trust

### AAIS (Ascent Agent Identity Score)
Our implementation combining:
1. **Identity Registry:** On-chain agent registration (ERC-721)
2. **Reputation Registry:** Transaction-based scoring
3. **Validation Registry:** Validator network for disputes

### Current Deployment (Aptos Testnet)
```
Module Address: 0x489cbd8ade2279edc20ef18a52b894d5a983575c1c0979e901be60b73741fe5d
Network: Aptos Testnet
```

### Reputation Scoring Algorithm
```
Base Score: 50.0
+ Successful transactions: +0.5 each
- Failed transactions: -1.0 each
+ High ratings: +0.2 each
+ Volume bonus: Up to +10.0
- Time decay: -0.01 per day inactive

Tiers:
- Elite: 90+ (Gold badge)
- Verified: 70-89 (Cyan badge)
- Standard: 50-69 (Purple badge)
- New: <50 (Gray badge)
```

### AAIS Integration in AgentMesh
- Agents mint identity NFT on registration
- Reputation updates after each transaction
- UI shows AAIS score with tier badge
- Marketplace filters by reputation tier

---

## 4. Aptos Facilitator Research

### Current State
- **Coinbase Facilitator:** Primarily supports Base/Ethereum
- **Aptos Support:** Emerging, community-driven
- **Self-Hosted Option:** Recommended for Ascent

### Facilitator Architecture
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────→│ Facilitator  │────→│   Aptos      │
│   (Agent)    │←────│   (Node.js)  │←────│  Blockchain  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ↓
                     ┌──────────────┐
                     │   USDC       │
                     │  Settlement  │
                     └──────────────┘
```

### Facilitator Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /verify` | Verify payment signature |
| `POST /settle` | Submit settlement to blockchain |
| `GET /discovery/resources` | Bazaar service discovery |

### Self-Hosted Facilitator Benefits
1. **No dependency** on Coinbase infrastructure
2. **Custom settlement logic** for Aptos
3. **Lower fees** (just gas costs)
4. **Full control** over verification

### Aptos-Specific Considerations
- Use `transfer_with_authorization` equivalent
- Handle USDC on Aptos (native or bridged)
- Account abstraction support for agents

---

## 5. Competitive Landscape

### Existing Projects

| Project | Description | Relation to Ascent |
|---------|-------------|-------------------|
| **x402 Bazaar** | Discovery layer | We should register our services |
| **PayAI** | x402 facilitator | Competitor/Partner |
| **Questflow S.A.N.T.A** | Multi-chain facilitator | Reference implementation |
| **Heurist Mesh** | Agent marketplace | Competitor |
| **RelAI** | API marketplace with x402 | Similar concept |

### Differentiation for Ascent
1. **AAIS Reputation:** On-chain trust that travels
2. **Aptos Native:** First-class Aptos support
3. **AgentMesh:** Purpose-built for agent-to-agent commerce
4. **Self-Hosted:** Full stack under our control

---

## 6. Technical Gaps & Opportunities

### Immediate (This Week)
1. Deploy self-hosted facilitator to Aptos testnet
2. Register AgentMesh services with Bazaar
3. Mock realistic agent data for UI testing

### Short-term (Next 2 Weeks)
1. Complete facilitator implementation for Aptos
2. Integrate Bazaar discovery into AgentMesh
3. Production-grade UI polish
4. Security audit of smart contracts

### Medium-term (Next Month)
1. Mainnet deployment preparation
2. Validator network for AAIS
3. Cross-chain reputation bridging
4. SDK for third-party integrations

---

## 7. Resources

### Documentation
- x402 Spec: https://github.com/coinbase/x402
- Bazaar Docs: https://docs.cdp.coinbase.com/x402/bazaar
- AAIS Contracts: `/move/sources/arc8004/`

### Repositories to Study
- `coinbase/x402` - Reference implementation
- `Hebx/ascent-cli` - Our implementation
- `aptos-labs/aptos-core` - Move contracts

### Key People/Orgs
- Coinbase Developer Platform (x402 team)
- x402 Foundation
- Aptos Foundation

---

## 8. Action Items

### Research Complete ✓
- [x] x402 protocol mechanics
- [x] Bazaar discovery layer
- [x] ERC-8004/AAIS standard
- [x] Aptos facilitator architecture
- [x] Competitive landscape

### Next Research Phase
- [ ] 8004scan explorer (if exists)
- [ ] Aptos USDC contract specifics
- [ ] Gas optimization strategies
- [ ] Validator incentive models

---

*Compiled by Hebx for Ascent Project*
