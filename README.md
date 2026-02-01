# 🥠 Ascent CLI

**The elite toolkit for autonomous agent commerce on Aptos**

---

## 🎯 The Vision

The future of commerce belongs to **autonomous machines**. API Keys are for humans; **x402 signatures** are for agents.

**Ascent CLI** is the bridge. It provides the infrastructure for developers to build, test, and deploy self-monetizing agentic services on Aptos.

---

## ✨ Features

- 🏗️ **Instant Scaffolding:** Forge x402 projects using Express, Next.js, or Hono.
- ⚡ **Local Forge:** Integrated dev facilitator for offline verification testing.
- 🧪 **Stress Testing:** Multi-wallet simulation for production readiness.
- 📊 **Trust Layer:** Agent Identity & Reputation (AAIS) tracking system.
- 🔭 **Live Dashboard:** Web-based analytics with real-time monitoring.
- 🧪 **E2E Validated:** Rigorous end-to-end testing on every core feature.
- 🦀 **Move Ready:** Automated generation of payment verification modules.

---

## 🚀 Quick Start

```bash
# 1. Install globally
npm install -g @ascent/cli

# 2. Forge a new project
ascent init my-agent-api

# 3. Enter the forge
cd my-agent-api && npm install

# 4. Ignite development
ascent dev

# 5. Stress test payments
ascent test --all-wallets
```

---

## 🦞 Featured Demo: AgentMesh Marketplace

A complete **reputation-gated agent commerce** platform built with Ascent CLI:

- **Service providers** list AI services (sentiment analysis, code review, etc.)
- **AAIS reputation scores** (0-100) determine who can list services (70+ required)
- **Consumers** browse by reputation tier and pay per call via x402
- **Ratings** update AAIS scores, creating a self-reinforcing trust economy

```bash
cd examples/agentmesh-marketplace
npm install && node server.js
```

**UI (Next.js):** Browse agents, hire services, and view the dashboard:

```bash
cd examples/agentmesh-marketplace/ui
npm install && npm run dev
# Open http://localhost:3003
```

*See [examples/agentmesh-marketplace](./examples/agentmesh-marketplace/) for full implementation.*

---

## 📖 Documentation

- [🚀 Technical Guide](./docs/guide.md) - Full command reference & setup.
- [🎯 Use Cases](./docs/use-cases.md) - Strategic scenarios for agentic commerce.
- [🦞 AgentMesh Demo](./examples/agentmesh-marketplace/) - Reputation-gated marketplace.
- [📋 Roadmap](./ROADMAP.md) - Production roadmap & milestones.

---

## 💰 Network Configuration

### Aptos Testnet
| Resource | Value |
| :--- | :--- |
| **Network** | `aptos:2` |
| **USDC Asset** | `0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832` |
| **Facilitator** | `https://x402-navy.vercel.app/facilitator/` |
| **Explorer** | [Aptos Explorer](https://explorer.aptoslabs.com/?network=testnet) |

### Aptos Mainnet (Coming Soon)
| Resource | Value |
| :--- | :--- |
| **Network** | `aptos:1` |
| **USDC Asset** | TBD |
| **Facilitator** | Self-hosted / TBD |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ASCENT STACK                          │
├─────────────────────────────────────────────────────────┤
│  CLI Tool  ←→  Core SDK  ←→  Facilitator  ←→  Aptos    │
│      ↓            ↓              ↓                      │
│  Server MW   Reputation    x402 Standard               │
│   (Express)  (AAIS/8004)   (Coinbase/CDP)              │
│      ↓            ↓              ↓                      │
│  MCP Server  A2A Protocol   USDC Settlement            │
│  (Claude)   (Google)       (Circle)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Installation

```bash
# Via npm
npm install -g @ascent/cli

# Via yarn
yarn global add @ascent/cli

# Verify installation
ascent --version
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Check wallet balances
ascent balances

# Stress test with all wallets
ascent test --all-wallets
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT © [Hebx](https://github.com/Hebx)

---

## 🌐 Links

- [Documentation](https://docs.ascent.dev)
- [GitHub](https://github.com/Hebx/ascent-cli)
- [Issues](https://github.com/Hebx/ascent-cli/issues)
- [Discussions](https://github.com/Hebx/ascent-cli/discussions)

---

<p align="center">
  <strong>Built for the agent economy.</strong><br>
  <em>x402 payments • ERC-8004 reputation • Autonomous commerce</em>
</p>
