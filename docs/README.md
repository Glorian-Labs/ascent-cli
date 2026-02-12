# Ascent CLI — Documentation

Welcome to the Ascent CLI documentation. This index links to all available guides, references, and resources.

---

## Getting Started

- [CLI Command Reference](../USAGE.md) — All commands, options, and examples
- [Complete Technical Manual](./guide.md) — Installation, configuration, and development workflow
- [Developer Walkthrough](./end-user-guide.md) — Step-by-step guide for building x402-enabled services

## Concepts

- [Core Concepts](./concepts.md) — x402 protocol, facilitators, receipts, AAIS/ARC-8004 identity and reputation
- [x402 & AAIS Research](./RESEARCH_X402_AAIS.md) — Protocol deep dive and design rationale
- [Strategic Use Cases](./use-cases.md) — Pay-per-query agents, reputation-gated APIs, A2A commerce

## Demos

- [AgentMesh Marketplace](../examples/agentmesh-marketplace/README.md) — Reputation-gated agent commerce platform
  - [Setup Guide](../examples/agentmesh-marketplace/SETUP.md)
  - [Testing Guide](../examples/agentmesh-marketplace/TESTING.md)

## Project

- [Roadmap](../ROADMAP.md) — Production milestones and timeline
- [Feature Roadmap Notes](./ROADMAP_NEXT_FEATURES.md) — Detailed next-feature planning
- [Contributing](../CONTRIBUTING.md) — How to contribute

---

## Architecture Overview

```
ascent-cli/
├── bin/cli.js              # CLI entry point (commander.js)
├── lib/
│   ├── x402-client.js      # x402 payment client for Aptos
│   ├── facilitator.js      # Local facilitator server
│   ├── arc8004/index.js    # AAIS TypeScript SDK
│   ├── multi-wallet-tester.js
│   ├── monitor.js
│   ├── dashboard.js
│   ├── move-helper.js
│   ├── interactive-setup.js
│   └── config.js
├── move/sources/arc8004/   # Move smart contracts
│   ├── agent_identity.move
│   ├── reputation.move
│   └── validation.move
├── templates/              # Project scaffolding templates
│   ├── express/
│   ├── next/
│   └── hono/
├── examples/
│   └── agentmesh-marketplace/  # Demo app (backend + Next.js UI)
└── docs/                   # You are here
```

For the full README and quickstart, see the [project root](../README.md).
