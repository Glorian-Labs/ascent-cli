# Ascent CLI

**Agentic commerce toolkit on Aptos — x402 payments, identity/reputation, and developer workflow.**

Built by [Glorian Labs](https://github.com/glorian-labs).

---

## Why Ascent

- **Verifiable agent payments.** x402 gives autonomous agents HTTP-native payment capabilities. Ascent provides the full stack: client, local facilitator, and Express/Next.js/Hono middleware.
- **Trust before transactions.** On-chain identity and reputation (AAIS/ARC-8004) let agents prove reliability before they earn. Reputation scores, attestations, and trust tiers — all on Aptos.
- **Dev-first workflow.** One command scaffolds a monetized API. Another spins up a local facilitator for offline testing. No billing infrastructure to build.
- **Working code, not whitepapers.** Every feature listed below is backed by code you can run. What's planned is labeled Planned.

---

## Features

### Core

| Feature | Description | Status |
|---|---|---|
| x402 Payment Client | Sign, verify, and settle payments via Aptos USDC and a facilitator | Implemented |
| Local Facilitator | Express server on `:4022` for offline payment verification/settlement | Implemented |
| Project Scaffolding | `ascent init` generates Express, Next.js, or Hono x402 projects | Implemented |
| Multi-Wallet Stress Test | `ascent test --all-wallets` runs payment simulations across 5 wallets | Implemented |

### Trust Layer (AAIS / ARC-8004)

| Feature | Description | Status |
|---|---|---|
| Agent Identity (Move) | On-chain NFT-based identity registry on Aptos | Implemented |
| Reputation Scoring (Move) | On-chain feedback attestation and trust scoring (0–100) | Implemented |
| Validation Registry (Move) | Validator network with task validation and proof types | Implemented |
| AAIS TypeScript SDK | `AAISClient` class: mint, verify, attest, query from Node.js | Implemented |
| CLI Identity Commands | `ascent identity register/list/show` for local SQLite registry | Implemented |

### Developer Experience

| Feature | Description | Status |
|---|---|---|
| `ascent dev` | Starts agent server + local facilitator together; loads `.env.local` | Implemented |
| `ascent move init/inject` | Initialize Move project; inject payment verification module | Implemented |
| `ascent kill` | Kill stuck processes on common Ascent ports | Implemented |
| Interactive Setup | `ascent init` with guided prompts for network, price, endpoint | Implemented |
| Templates | Express (full), Next.js (middleware), Hono (scaffold) | Implemented |

### Observability

| Feature | Description | Status |
|---|---|---|
| `ascent monitor` | Real-time terminal payment flow monitoring | Implemented |
| `ascent dashboard` | Web analytics dashboard on `:3456` backed by SQLite | Implemented |
| `ascent logs` | Guidance on where dev/facilitator output appears | Implemented |

### Planned

| Feature | Target | Branch/Notes |
|---|---|---|
| MCP Server (Claude Desktop) | Phase 4 | `feat/mcp-server` (name only — not yet implemented) |
| A2A Protocol (Google) | Phase 4 | Design stage |
| Self-hosted Facilitator | Phase 2 | Local mock exists; production deploy pending |
| Multi-chain (Mainnet, Base, Solana) | Phase 2–3 | Testnet only today |
| CI/CD Pipeline | Phase 5 | No `.github/` yet |

See [ROADMAP.md](./ROADMAP.md) for the full production roadmap.

---

## Quickstart

```bash
# Install globally
npm install -g @ascent/cli

# Scaffold a new x402 project
ascent init my-agent-api --template express

# Enter the project
cd my-agent-api && npm install

# Configure wallet (edit .env.local with your keys)
# PAYMENT_RECIPIENT_ADDRESS=0x...
# APTOS_PRIVATE_KEY=0x...

# Start dev server + local facilitator
ascent dev

# In another terminal — test payment flow
ascent test --all-wallets
```

### CLI Commands

| Command | Description |
|---|---|
| `ascent init <name>` | Scaffold x402 project (express/next/hono) |
| `ascent dev` | Start dev server + local facilitator |
| `ascent test` | Test x402 payment flow |
| `ascent monitor` | Real-time payment monitoring |
| `ascent dashboard` | Web analytics dashboard |
| `ascent identity <action>` | Agent identity management (register/list/show) |
| `ascent move <action>` | Move language helpers (init/inject) |
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

### Run the Backend

```bash
cd examples/agentmesh-marketplace
npm install

# Seed demo data
node seed-demo.js

# Start the API server (port 3007)
node server.js
```

### Run the UI

```bash
cd examples/agentmesh-marketplace/ui
npm install
npm run dev
# Open http://localhost:3003
```

Backend API: `http://localhost:3007`
UI: `http://localhost:3003`

See [examples/agentmesh-marketplace/README.md](./examples/agentmesh-marketplace/README.md) for full setup and testing instructions.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      ASCENT STACK                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CLI (bin/cli.js)                                        │
│    ├─ init / dev / test / monitor / dashboard / kill     │
│    ├─ identity register / list / show                    │
│    └─ move init / inject                                 │
│                                                          │
│  Core Libraries (lib/)                                   │
│    ├─ x402-client.js     x402 payment client (Aptos)     │
│    ├─ facilitator.js     Local facilitator (:4022)        │
│    ├─ arc8004/index.js   AAIS TypeScript SDK              │
│    ├─ multi-wallet-tester.js  Payment stress testing      │
│    ├─ monitor.js         Terminal payment monitoring       │
│    └─ dashboard.js       Web analytics                    │
│                                                          │
│  Move Contracts (move/sources/arc8004/)                  │
│    ├─ agent_identity.move    NFT identity registry        │
│    ├─ reputation.move        On-chain scoring             │
│    └─ validation.move        Validator network            │
│                                                          │
│  Templates (templates/)                                  │
│    ├─ express/   Full Express x402 server                 │
│    ├─ next/      Next.js middleware scaffold               │
│    └─ hono/      Hono scaffold                            │
│                                                          │
│  Demo (examples/agentmesh-marketplace/)                  │
│    ├─ server.js      Backend API + SQLite + x402          │
│    └─ ui/            Next.js + shadcn/ui dashboard         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Payment Flow                                            │
│                                                          │
│  Request ──▶ 402 + PAYMENT-REQUIRED (base64)             │
│          ──▶ Client signs Aptos tx                        │
│          ──▶ Facilitator /verify                          │
│          ──▶ Facilitator /settle                          │
│          ──▶ 200 OK + PAYMENT-RESPONSE + content          │
│                                                          │
│  External                                                │
│    Aptos Testnet (aptos:2) ◀──▶ USDC Settlement           │
│    Facilitator: localhost:4022 (dev) or hosted             │
└──────────────────────────────────────────────────────────┘
```

---

## Documentation

| Document | Description |
|---|---|
| [docs/README.md](./docs/README.md) | Documentation index |
| [USAGE.md](./USAGE.md) | CLI command reference and setup guide |
| [docs/guide.md](./docs/guide.md) | Complete technical manual |
| [docs/end-user-guide.md](./docs/end-user-guide.md) | Developer walkthrough |
| [docs/use-cases.md](./docs/use-cases.md) | Strategic use case scenarios |
| [docs/concepts.md](./docs/concepts.md) | x402, facilitators, AAIS/ARC-8004 concepts |
| [docs/RESEARCH_X402_AAIS.md](./docs/RESEARCH_X402_AAIS.md) | x402 & AAIS protocol research |
| [ROADMAP.md](./ROADMAP.md) | Production roadmap and milestones |
| [examples/agentmesh-marketplace/](./examples/agentmesh-marketplace/) | AgentMesh demo (backend + UI) |

---

## Project Status

### Stable (master)

- CLI commands: `init`, `dev`, `test`, `monitor`, `dashboard`, `identity`, `move`, `kill`, `logs`
- x402 payment client with Aptos testnet support
- Local facilitator for offline development
- AAIS Move contracts (compiled, deployed to testnet)
- AAIS TypeScript SDK
- AgentMesh marketplace demo (backend + UI)
- Express project template

### Experimental

- Next.js and Hono templates (scaffold-level, not full-featured)
- Facilitator settlement is mock (returns simulated tx hashes — real on-chain submission pending)

### Planned

- MCP Server for Claude Desktop integration
- A2A Protocol for agent-to-agent negotiation
- Self-hosted production facilitator
- Mainnet deployment
- CI/CD pipeline
- Smart contract audit

See [ROADMAP.md](./ROADMAP.md) for timeline and details.

---

## Network Configuration

| Resource | Testnet | Mainnet |
|---|---|---|
| Network | `aptos:2` | `aptos:1` (planned) |
| USDC Asset | `0x69091f...af52832` | TBD |
| Facilitator | `localhost:4022` (dev) / `x402-navy.vercel.app` (hosted) | TBD |
| Explorer | [Aptos Explorer (testnet)](https://explorer.aptoslabs.com/?network=testnet) | — |

---

## Contributing

We welcome contributions. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit changes (`git commit -m 'feat: description'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

Use [conventional commits](https://www.conventionalcommits.org/). Prefix: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.

---

## Security

If you discover a security vulnerability, do **not** open a public issue. Email security concerns privately. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

**Important:** Never commit private keys or `.env.local` files. The `.gitignore` is configured to exclude them.

---

## License

MIT — see [LICENSE](./LICENSE).

Copyright (c) 2026 Glorian Labs LTD

---

<p align="center">
  <strong>Ascent CLI</strong> — verifiable agent commerce on Aptos<br>
  <em>x402 payments · ARC-8004 reputation · Developer workflow</em><br>
  <a href="https://github.com/glorian-labs/ascent-cli">GitHub</a> ·
  <a href="./ROADMAP.md">Roadmap</a> ·
  <a href="./docs/README.md">Docs</a>
</p>
