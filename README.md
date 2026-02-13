# Ascent CLI

**Agentic commerce toolkit for Aptos — x402 payments, on-chain identity, verifiable settlement.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Aptos](https://img.shields.io/badge/Aptos-Testnet-purple.svg)](https://aptoslabs.com)
[![x402](https://img.shields.io/badge/x402-Payment%20Protocol-orange.svg)](https://www.x402.org/)

---

## What is Ascent CLI?

Ascent CLI is a developer toolkit for building trust-minimized, verifiable agent commerce systems on Aptos. It gives autonomous agents the primitives to pay, get paid, prove settlement, and establish on-chain reputation — all from the command line.

**Who is it for?** Developers building AI agents, autonomous services, or any system where software needs to transact without human intervention.

**What can I do in 5 minutes?**

```bash
npm i -g @ascent/cli
ascent init my-api --template express
cd my-api && npm install
ascent dev                    # starts server + local facilitator
# in another terminal:
ascent test --all-wallets     # 5 concurrent wallets hit your x402 endpoint
```

---

## Why it matters

- **Programmatic payments without API keys** — agents sign x402 payment intents with cryptographic keys; no OAuth, no billing dashboards.
- **Deterministic on-chain settlement** — every payment produces a verifiable Aptos transaction hash and receipt, not a promise.
- **Portable identity and reputation** — AAIS / ARC-8004 Move contracts let agents accumulate trust scores that any service can query.

---

## Key Capabilities

- **x402 payment client** — sign, verify, and settle USDC payments on Aptos with a local facilitator on `:4022`
- **On-chain agent identity** — NFT-based identity registry + reputation scoring (0–100) via Move contracts
- **Project scaffolding** — `ascent init` generates Express, Next.js, or Hono projects wired for x402
- **Multi-wallet stress testing** — `ascent test --all-wallets` simulates 5 concurrent payers against your endpoint
- **Real-time observability** — `ascent monitor` for terminal dashboards, `ascent dashboard` for web analytics (SQLite-backed)
- **Move tooling** — `ascent move init` scaffolds a Move project; `ascent move inject` adds payment verification modules
- **AAIS TypeScript SDK** — `AAISClient` class for minting identities, submitting attestations, and querying trust scores

---

## Status

| State | What's included |
|---|---|
| **Stable** | CLI commands, x402 payment client, local facilitator, AAIS Move contracts + SDK, AgentMesh demo, Express template |
| **Experimental** | Next.js / Hono templates (scaffold-level); facilitator settlement is mock (simulated tx hashes — real on-chain submission pending) |
| **Planned** | MCP Server, A2A Protocol, self-hosted facilitator, mainnet, CI/CD, contract audit — see [ROADMAP.md](./ROADMAP.md) |

---

## Use Cases

| Scenario | What happens |
|---|---|
| Agent pays for sentiment analysis via x402 | Buyer agent hits a `/analyze` endpoint, gets `402`, signs payment, receives result + on-chain receipt |
| Reputation gates marketplace listing | AgentMesh requires AAIS score ≥ 70 to list a service; new agents build trust through successful transactions |
| Multi-wallet stress test simulates 5 concurrent payers | `ascent test --all-wallets` fires parallel x402 flows from 5 wallets against your dev server |
| Autonomous service monetization | Developer scaffolds an Express API with `ascent init`, adds a paid route, and agents can pay-per-call with zero integration overhead |
| Auditable transaction history | Every settlement writes to Aptos; any party can independently verify the receipt chain |

---

## Quick Start

```bash
# Install globally (or clone for local dev)
npm install -g @ascent/cli
# git clone https://github.com/Glorian-Labs/ascent-cli.git && cd ascent-cli && npm install

# Scaffold a new project
ascent init my-agent-api --template express
cd my-agent-api && npm install

# Configure wallet — edit .env.local:
#   PAYMENT_RECIPIENT_ADDRESS=0x...
#   APTOS_PRIVATE_KEY=0x...

# Start dev server + local facilitator
ascent dev

# Test payment flow (separate terminal)
ascent test --all-wallets
```

---

## Demo

The **AgentMesh Marketplace** demonstrates the full Ascent stack: agents register services, AAIS reputation scores gate listings (70+ required), consumers pay per call via x402, and ratings update trust scores in a self-reinforcing loop.

```bash
cd examples/agentmesh-marketplace
npm install && node seed-demo.js && node server.js   # backend on :3007
cd ui && npm install && npm run dev                   # UI on :3003
```

See [examples/agentmesh-marketplace/](./examples/agentmesh-marketplace/) for full setup.

---

## Architecture

```text
Buyer Agent              Seller Agent             Aptos Chain
    |                         |                        |
    |  1. Request service     |                        |
    +------------------------>|                        |
    |  2. 402 + payment terms |                        |
    |<------------------------+                        |
    |  3. x402 payment intent |                        |
    +------------------------>|                        |
    |            4. Validate identity (AAIS)           |
    |                         +------> Trust Layer --->|
    |  5. Settle via facilitator                       |
    +------------------------>[Facilitator]----------->|
    |                         |   6. On-chain tx       |
    |  7. Receipt (tx hash + proof)                    |
    |<-------------------------------------------------+
    |  8. Service delivered    |                        |
    +------------------------>|                        |
```

---

## CLI Commands

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

## Vision / Planned

- **MCP Server** — Claude Desktop integration for conversational agent commerce (Phase 4)
- **A2A Protocol** — Google Agent-to-Agent protocol support (Phase 4, design stage)
- **Self-hosted Facilitator** — production-grade facilitator deployment; local mock exists today (Phase 2)
- **Multi-chain** — Aptos mainnet, Base, Solana; testnet-only today (Phase 2–3)
- **CI/CD Pipeline** — automated testing and deployment (Phase 5)

Full roadmap: [ROADMAP.md](./ROADMAP.md)

---

## Documentation

- **[Documentation Index](./docs/README.md)** — Full docs map
- **[CLI Command Reference](./USAGE.md)** — All commands, options, and examples
- **[Technical Manual](./docs/guide.md)** — Installation, configuration, workflow
- **[Core Concepts](./docs/concepts.md)** — x402, facilitators, AAIS / ARC-8004
- **[Developer Walkthrough](./docs/end-user-guide.md)** — Step-by-step build guide
- **[Strategic Use Cases](./docs/use-cases.md)** — Applied scenarios
- **[Production Roadmap](./ROADMAP.md)** — Milestones and timeline

---

## Project Structure

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

Branches: `master` is the canonical production branch. Feature work happens on `feat/*` branches.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution workflow and PR expectations.

## Security

If you discover a vulnerability, do not open a public issue. Contact **security@glorianlabs.com**.

## License

[MIT](./LICENSE)

---

**Ascent CLI** — _Verifiable agent commerce, deterministic settlement, trusted coordination._
