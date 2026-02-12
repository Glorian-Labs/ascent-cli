# Ascent CLI

**Agentic Commerce Toolkit on Aptos (Ascent CLI by Glorian Labs)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Aptos](https://img.shields.io/badge/Aptos-Testnet-purple.svg)](https://aptoslabs.com)
[![x402](https://img.shields.io/badge/x402-Payment%20Protocol-orange.svg)](https://www.x402.org/)

Ascent CLI is a developer toolkit for building **trust-minimized, verifiable agent commerce systems** on Aptos.

It enables autonomous agents to:

- Negotiate and transact using **x402** payment flows
- Execute **deterministic on-chain settlement**
- Generate **verifiable receipts**
- Attach **identity and reputation** signals (AAIS / ARC-8004)
- Scaffold **Move modules** and commerce primitives

Ascent is not a bot framework. It is infrastructure for **trusted autonomous economic coordination**.

---

## 🔮 Why Ascent

The agent economy requires more than APIs.

Autonomous agents must:

- **Pay and get paid** programmatically — no API keys, no OAuth, just cryptographic signatures
- **Prove settlement** deterministically — every payment produces an on-chain receipt
- **Establish identity and reputation** — trust scores, attestations, and tiered access
- **Leave auditable economic trails** — verifiable transaction history on Aptos
- **Operate without centralized trust assumptions** — facilitator-mediated, chain-settled

Ascent provides the primitives to make this possible.

---

## 🔁 Agentic Commerce Flow

```text
+-------------------+       +-------------------+       +----------------------+
|   Buyer Agent     |       |   Seller Agent    |       |   Trust Layer        |
|   (requester)     |       |   (provider)      |       |   (AAIS / policy)    |
+---------+---------+       +---------+---------+       +----------+-----------+
          |                           |                            |
          | 1. Request service        |                            |
          +-------------------------->|                            |
          |                           |                            |
          | 2. 402 + payment terms    |                            |
          |<--------------------------+                            |
          |                           |                            |
          | 3. x402 payment intent    |                            |
          +-------------------------->|                            |
          |                           |                            |
          |                  4. Validate identity / reputation     |
          |                           +---------------------------->
          |                           |                            |
          |                           |<----------------------------+
          |                           |   (permit / deny / limits) |
          |                           |                            |
          | 5. Settlement request     |                            |
          +-------------------------->+----------------------------+
                                      |   Facilitator              |
                                      +--------------+-------------+
                                                     |
                                                     | 6. On-chain tx (Aptos)
                                                     v
                                      +------------------------------+
                                      |        Aptos Chain           |
                                      |  Move modules · USDC settle  |
                                      |  Receipt · state updates     |
                                      +--------------+---------------+
                                                     |
                                                     | 7. Tx result + proof
                                                     v
                                      +------------------------------+
                                      |   Verifiable Receipt         |
                                      |   (tx hash, events, state)   |
                                      +--------------+---------------+
                                                     |
          | 8. Receipt delivered      |              |
          |<--------------------------+--------------+
          |
          | 9. Service delivered
          +-------------------------->  Seller Agent
```

---

## 🚀 Key Features

### ⚡ Agentic Payment Layer (x402)

| Feature | Description | Status |
|---|---|---|
| x402 Payment Client | Sign, verify, and settle payments via Aptos USDC | Implemented |
| Local Facilitator | Express server on `:4022` for offline verification/settlement | Implemented |
| Deterministic Receipts | Every payment returns a verifiable tx hash and proof | Implemented |
| Multi-Wallet Stress Test | `ascent test --all-wallets` simulates payments across 5 wallets | Implemented |

### 🛡️ Identity & Trust Layer (AAIS / ARC-8004)

| Feature | Description | Status |
|---|---|---|
| Agent Identity (Move) | On-chain NFT-based identity registry | Implemented |
| Reputation Scoring (Move) | Feedback attestation and trust scoring (0–100) | Implemented |
| Validation Registry (Move) | Validator network with task validation and proof types | Implemented |
| AAIS TypeScript SDK | `AAISClient` class: mint, verify, attest, query | Implemented |
| CLI Identity Commands | `ascent identity register/list/show` (local SQLite) | Implemented |

### 🛠️ Developer Experience

| Feature | Description | Status |
|---|---|---|
| `ascent dev` | Starts agent server + local facilitator; loads `.env.local` | Implemented |
| `ascent init` | Scaffolds Express, Next.js, or Hono x402 projects | Implemented |
| `ascent move init/inject` | Move project setup; payment verification module injection | Implemented |
| `ascent kill` | Kill stuck processes on common Ascent ports | Implemented |
| Templates | Express (full), Next.js (middleware), Hono (scaffold) | Implemented |

### 🔭 Observability

| Feature | Description | Status |
|---|---|---|
| `ascent monitor` | Real-time terminal payment flow monitoring | Implemented |
| `ascent dashboard` | Web analytics dashboard on `:3456` (SQLite-backed) | Implemented |
| `ascent logs` | Log output guidance for dev/facilitator | Implemented |

### 🗺️ Planned

| Feature | Target | Notes |
|---|---|---|
| MCP Server (Claude Desktop) | Phase 4 | Not yet implemented |
| A2A Protocol (Google) | Phase 4 | Design stage |
| Self-hosted Facilitator | Phase 2 | Local mock exists; production deploy pending |
| Multi-chain (Mainnet, Base, Solana) | Phase 2–3 | Testnet only today |
| CI/CD Pipeline | Phase 5 | Not yet configured |

See [ROADMAP.md](./ROADMAP.md) for the full production roadmap.

---

## ⚡ Quick Start

```bash
# Global install
npm install -g @ascent/cli

# Or clone for local development
git clone https://github.com/Glorian-Labs/ascent-cli
cd ascent-cli && npm install
```

### Create and run a project

```bash
# Scaffold
ascent init my-agent-api --template express
cd my-agent-api && npm install

# Configure wallet (edit .env.local)
# PAYMENT_RECIPIENT_ADDRESS=0x...
# APTOS_PRIVATE_KEY=0x...

# Start dev server + local facilitator
ascent dev

# Test payment flow (separate terminal)
ascent test --all-wallets
```

### CLI Commands

| Command | Description |
|---|---|
| `ascent init <name>` | Scaffold x402 project (express / next / hono) |
| `ascent dev` | Start dev server + local facilitator |
| `ascent test` | Test x402 payment flow |
| `ascent monitor` | Real-time payment monitoring |
| `ascent dashboard` | Web analytics dashboard |
| `ascent identity <action>` | Agent identity management (register / list / show) |
| `ascent move <action>` | Move language helpers (init / inject) |
| `ascent kill` | Kill stuck Ascent processes |
| `ascent logs` | Log output guidance |

Full command reference: [USAGE.md](./USAGE.md)

---

## 🦞 Demo: AgentMesh Marketplace

A reputation-gated agent commerce platform demonstrating the full Ascent stack:

- Agents register services (sentiment analysis, code review, etc.)
- AAIS reputation scores (0–100) gate who can list (70+ required)
- Consumers browse by tier and pay per call via x402
- Ratings update AAIS scores — a self-reinforcing trust economy

```bash
# Backend (port 3007)
cd examples/agentmesh-marketplace
npm install && node seed-demo.js && node server.js

# UI (port 3003)
cd examples/agentmesh-marketplace/ui
npm install && npm run dev
```

See [examples/agentmesh-marketplace/](./examples/agentmesh-marketplace/) for full setup and testing.

---

## 🔐 Trust & Verifiability

> Autonomous agents must operate within verifiable economic constraints.

- Payments must be **deterministic**
- Receipts must be **provable**
- Identity must be **attestable**
- Settlement must be **auditable**
- Policies must be **enforceable**

Without these primitives, the agent economy collapses into blind trust. Ascent builds the rails for verifiable coordination.

---

## 📦 Project Structure

```text
ascent-cli/
├── bin/            CLI entry points
├── lib/            Core SDK and utilities
│   ├── x402-client.js        Payment client (Aptos USDC)
│   ├── facilitator.js        Local facilitator server (:4022)
│   ├── arc8004/index.js      AAIS TypeScript SDK
│   ├── multi-wallet-tester.js
│   ├── monitor.js            Terminal monitoring
│   └── dashboard.js          Web analytics
├── move/           Move smart contracts (identity, reputation, validation)
├── templates/      Scaffolding templates (Express, Next.js, Hono)
├── examples/       Demo implementations (AgentMesh marketplace)
└── docs/           Documentation
```

### 🌿 Branch Structure

- `master` — Canonical production branch. All feature branches merged here.
- `feat/agentmesh-ui` — AgentMesh UI v2 (Cyber-Neo-Brutalist redesign with shadcn/ui)
- `feat/agentmesh-backend` — AgentMesh production server with AAIS integration
- `feat/erc8004-identity` — ARC-8004 Move contracts + TypeScript SDK
- `feat/x402-client-v2` — Hardened x402 payment client

---

## 📚 Documentation

- **[Documentation Index](./docs/README.md)** — Full docs map
- **[CLI Command Reference](./USAGE.md)** — All commands, options, and examples
- **[Technical Manual](./docs/guide.md)** — Installation, configuration, workflow
- **[Core Concepts](./docs/concepts.md)** — x402, facilitators, AAIS/ARC-8004
- **[Developer Walkthrough](./docs/end-user-guide.md)** — Step-by-step build guide
- **[Strategic Use Cases](./docs/use-cases.md)** — Applied scenarios
- **[Production Roadmap](./ROADMAP.md)** — Milestones and timeline

---

## 📊 Project Status

**Stable** — CLI commands, x402 payment client, local facilitator, AAIS Move contracts + SDK, AgentMesh demo, Express template.

**Experimental** — Next.js/Hono templates (scaffold-level). Facilitator settlement is mock (simulated tx hashes — real on-chain submission pending).

**Planned** — MCP Server, A2A Protocol, self-hosted facilitator, mainnet, CI/CD, contract audit. See [ROADMAP.md](./ROADMAP.md).

---

## 🤝 Contributing

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for contribution workflow and PR expectations.

## 🔐 Security

If you discover a vulnerability, do **not** open a public issue.

Contact: **security@glorianlabs.com**

## 📄 License

This project is licensed under the **[MIT License](./LICENSE)**.

---

**Ascent CLI** — _Verifiable agent commerce, deterministic settlement, trusted coordination._
