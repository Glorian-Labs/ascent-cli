# Ascent CLI

## Verifiable Agentic Commerce on Aptos

**By [Glorian Labs](https://github.com/Glorian-Labs)**

Ascent CLI is a developer toolkit for building **trust-minimized, verifiable agent commerce systems** on Aptos.

It enables autonomous agents to:

- Negotiate and transact using **x402** payment flows
- Execute **deterministic on-chain settlement**
- Generate **verifiable receipts**
- Attach **identity and reputation** signals (AAIS / ARC-8004)
- Scaffold **Move modules** and commerce primitives

Ascent is not a bot framework. It is infrastructure for **trusted autonomous economic coordination**.

---

## Why Ascent

The agent economy requires more than APIs.

Autonomous agents must:

- **Pay and get paid** programmatically — no API keys, no OAuth, just cryptographic signatures
- **Prove settlement** deterministically — every payment produces an on-chain receipt
- **Establish identity and reputation** — trust scores, attestations, and tiered access
- **Leave auditable economic trails** — verifiable transaction history on Aptos
- **Operate without centralized trust assumptions** — facilitator-mediated, chain-settled

Ascent provides the primitives to make this possible.

---

## Agentic Commerce Flow

```
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

## Features

### Agentic Payment Layer (x402)

| Feature | Description | Status |
|---|---|---|
| x402 Payment Client | Sign, verify, and settle payments via Aptos USDC | Implemented |
| Local Facilitator | Express server on `:4022` for offline verification/settlement | Implemented |
| Deterministic Receipts | Every payment returns a verifiable tx hash and proof | Implemented |
| Multi-Wallet Stress Test | `ascent test --all-wallets` simulates payments across 5 wallets | Implemented |

### Identity & Trust Layer (AAIS / ARC-8004)

| Feature | Description | Status |
|---|---|---|
| Agent Identity (Move) | On-chain NFT-based identity registry | Implemented |
| Reputation Scoring (Move) | Feedback attestation and trust scoring (0–100) | Implemented |
| Validation Registry (Move) | Validator network with task validation and proof types | Implemented |
| AAIS TypeScript SDK | `AAISClient` class: mint, verify, attest, query | Implemented |
| CLI Identity Commands | `ascent identity register/list/show` (local SQLite) | Implemented |

### Developer Experience

| Feature | Description | Status |
|---|---|---|
| `ascent dev` | Starts agent server + local facilitator; loads `.env.local` | Implemented |
| `ascent init` | Scaffolds Express, Next.js, or Hono x402 projects | Implemented |
| `ascent move init/inject` | Move project setup; payment verification module injection | Implemented |
| `ascent kill` | Kill stuck processes on common Ascent ports | Implemented |
| Templates | Express (full), Next.js (middleware), Hono (scaffold) | Implemented |

### Observability

| Feature | Description | Status |
|---|---|---|
| `ascent monitor` | Real-time terminal payment flow monitoring | Implemented |
| `ascent dashboard` | Web analytics dashboard on `:3456` (SQLite-backed) | Implemented |
| `ascent logs` | Log output guidance for dev/facilitator | Implemented |

### Planned

| Feature | Target | Notes |
|---|---|---|
| MCP Server (Claude Desktop) | Phase 4 | Not yet implemented |
| A2A Protocol (Google) | Phase 4 | Design stage |
| Self-hosted Facilitator | Phase 2 | Local mock exists; production deploy pending |
| Multi-chain (Mainnet, Base, Solana) | Phase 2–3 | Testnet only today |
| CI/CD Pipeline | Phase 5 | Not yet configured |

See [ROADMAP.md](./ROADMAP.md) for the full production roadmap.

---

## Quickstart

### Install

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

## Demo: AgentMesh Marketplace

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

## Trust & Verifiability

> Autonomous agents must operate within verifiable economic constraints.

- Payments must be **deterministic**
- Receipts must be **provable**
- Identity must be **attestable**
- Settlement must be **auditable**
- Policies must be **enforceable**

Without these primitives, the agent economy collapses into blind trust. Ascent builds the rails for verifiable coordination.

---

## Architecture

```
bin/        CLI entry points
lib/        Core SDK and utilities
  ├── x402-client.js        Payment client (Aptos USDC)
  ├── facilitator.js        Local facilitator server (:4022)
  ├── arc8004/index.js      AAIS TypeScript SDK
  ├── multi-wallet-tester.js
  ├── monitor.js            Terminal monitoring
  └── dashboard.js          Web analytics
move/       Move smart contracts (identity, reputation, validation)
templates/  Scaffolding templates (Express, Next.js, Hono)
examples/   Demo implementations (AgentMesh marketplace)
docs/       Documentation
```

---

## Documentation

| Document | Description |
|---|---|
| [docs/](./docs/README.md) | Documentation index |
| [USAGE.md](./USAGE.md) | CLI command reference |
| [docs/guide.md](./docs/guide.md) | Technical manual |
| [docs/concepts.md](./docs/concepts.md) | x402, facilitators, AAIS concepts |
| [docs/end-user-guide.md](./docs/end-user-guide.md) | Developer walkthrough |
| [docs/use-cases.md](./docs/use-cases.md) | Strategic use cases |
| [ROADMAP.md](./ROADMAP.md) | Production roadmap |

---

## Project Status

**Stable** — CLI commands, x402 payment client, local facilitator, AAIS Move contracts + SDK, AgentMesh demo, Express template.

**Experimental** — Next.js/Hono templates (scaffold-level). Facilitator settlement is mock (simulated tx hashes — real on-chain submission pending).

**Planned** — MCP Server, A2A Protocol, self-hosted facilitator, mainnet, CI/CD, contract audit. See [ROADMAP.md](./ROADMAP.md).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

If you discover a vulnerability, do **not** open a public issue.

Contact: **security@glorianlabs.com**

## License

MIT — see [LICENSE](./LICENSE).

Copyright (c) 2026 Glorian Labs LTD

---

<p align="center">
  <strong>Ascent CLI</strong> — verifiable agent commerce on Aptos<br>
  <em>x402 payments · ARC-8004 reputation · Developer workflow</em><br>
  <a href="https://github.com/Glorian-Labs/ascent-cli">GitHub</a> ·
  <a href="./ROADMAP.md">Roadmap</a> ·
  <a href="./docs/README.md">Docs</a>
</p>
