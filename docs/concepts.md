# Core Concepts

This document explains the foundational protocols and systems that Ascent CLI builds on.

---

## x402 Protocol

x402 is an HTTP-native payment protocol designed for autonomous agents and machine-to-machine commerce. It uses the HTTP `402 Payment Required` status code to initiate payment flows.

### How It Works

1. **Client requests** a protected resource (e.g., `POST /api/paid`)
2. **Server responds** with `402` + `PAYMENT-REQUIRED` header containing base64-encoded payment requirements (amount, asset, recipient)
3. **Client builds and signs** an Aptos transaction matching the requirements
4. **Facilitator verifies** the signed transaction is valid (`POST /verify`)
5. **Facilitator settles** the transaction on-chain (`POST /settle`)
6. **Client retries** the original request with a `PAYMENT-SIGNATURE` header
7. **Server delivers** the content + `PAYMENT-RESPONSE` header with receipt

### Key Properties

- **HTTP-native**: Uses standard HTTP headers; no custom transport needed
- **Chain-agnostic**: x402 standard supports multiple networks (Aptos, Base, Solana)
- **Agent-friendly**: No API keys, OAuth, or sessions — just cryptographic signatures
- **Verifiable**: Every payment produces an on-chain receipt

### Payment Requirements Format

```json
{
  "accepts": [{
    "scheme": "exact",
    "network": "aptos:2",
    "amount": "10000",
    "asset": "0x69091f...af52832",
    "payTo": "0xrecipient..."
  }]
}
```

---

## Facilitator

The facilitator is an intermediary service that verifies payment signatures and settles transactions on-chain. It acts as the trust bridge between the client and the resource server.

### Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/verify` | POST | Validate a payment signature without submitting to chain |
| `/settle` | POST | Submit the verified transaction on-chain |
| `/supported` | GET | List supported networks and schemes |
| `/health` | GET | Health check |

### Local vs Hosted

- **Local** (`ascent dev`): Runs on `localhost:4022`. Uses mock settlement for development — transactions are validated but not submitted to Aptos.
- **Hosted** (`x402-navy.vercel.app`): Public testnet facilitator with real on-chain settlement.

In production, you would run your own facilitator or use a trusted hosted instance.

---

## AAIS (Ascent Agent Identity Score)

AAIS is an on-chain identity and reputation system for autonomous agents, implemented as Move smart contracts on Aptos. It is inspired by ERC-8004 concepts adapted for the Aptos ecosystem (hence the alias ARC-8004).

### Three Registries

**1. Agent Identity Registry** (`agent_identity.move`)
- NFT-based identity: each agent gets a unique on-chain token
- Stores: agent ID, name, metadata URI, capabilities, verification status
- Admin can verify identities (KYC-like attestation for agents)

**2. Reputation Registry** (`reputation.move`)
- Feedback attestation system: clients rate agents after service
- Scores: 0–100 scale with trust levels (Unknown → New → Developing → Established → Trusted → Excellent)
- Payment-weighted: higher transaction volumes carry more weight
- AgentMesh marketplace threshold: 70+ required to list services

**3. Validation Registry** (`validation.move`)
- Validator network for task verification
- Supports multiple proof types: Manual, ZK Proof, TEE, Oracle
- Slashing conditions framework for misbehaving validators

### Trust Levels

| Level | Score Range | Label |
|---|---|---|
| 0 | — | Unknown |
| 1 | 0–20 | New |
| 2 | 20–40 | Developing |
| 3 | 40–60 | Established |
| 4 | 60–80 | Trusted |
| 5 | 80–100 | Excellent |

### TypeScript SDK

The `AAISClient` class (`lib/arc8004/index.js`) provides a typed interface:

```typescript
import { AAISClient, createAAISClient } from './lib/arc8004';

const client = createAAISClient(aptos, moduleAddress);

// Identity
await client.mintIdentity(creator, agentId, name, metadataUri, capabilities);
await client.verifyIdentity(admin, tokenAddress);
const identity = await client.getIdentity(tokenAddress);

// Reputation
await client.attestFeedback(client, agentId, score, paymentHash, serviceRating, amount);
const score = await client.getAgentScore(agentId);
const eligible = await client.meetsMarketplaceThreshold(agentId);

// Validation
await client.addValidator(admin, validatorAddress);
await client.submitValidation(validator, taskId, agentId, validatorId, isValid, proof, type);
```

---

## MCP Server (Planned)

Model Context Protocol integration will allow AI assistants (e.g., Claude via Claude Desktop) to use Ascent tools directly — checking balances, making payments, and querying agent reputation through natural language.

**Status:** Not yet implemented. See [ROADMAP.md](../ROADMAP.md) Phase 4.

---

## A2A Protocol (Planned)

Agent-to-Agent protocol support (based on Google's A2A spec) will enable autonomous agents to discover, negotiate with, and pay each other without human intervention.

**Status:** Design stage. See [ROADMAP.md](../ROADMAP.md) Phase 4.
