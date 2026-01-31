# 📖 Ascent CLI - Complete Technical Manual

Welcome to **Ascent**, the elite toolkit for building x402 payment-enabled applications on Aptos. This guide covers every feature from project ignition to production deployment.

---

## 🚀 1. Installation & Initialization

### Global Install
```bash
npm install -g @ascent/cli
```

### Ignition (Scaffolding)
Start a new project with the interactive forge. Select your stack (Express/Next.js/Hono), network, and payment settings.
```bash
ascent init my-agent-api
```

---

## 🛠️ 2. Development Operations

### The Local Forge (Dev Server)
Ascent starts your server and a **Local x402 Facilitator** simultaneously. The facilitator handles payment verification and on-chain settlement, so you don't have to worry about the backend complexity during dev.
```bash
ascent dev
```
- **Agent Server:** `http://localhost:3000`
- **Facilitator:** `http://localhost:4022`

---

## 🎭 3. Agent Identity & Reputation (AAIS)

Ascent doesn't just process payments; it tracks **Trust**. The Agent Identity Standard (AAIS) layer allows agents to build a history of reliability.

### Register an Identity
Link your wallet to a human-readable name.
```bash
ascent identity register --address 0x... --name "Cyber-Scribe-V2"
```

### View Trust Metrics
Check an agent's success rate, volume, and total reputation score.
```bash
ascent identity show --address 0x...
```

---

## 📊 4. Real-time Monitoring

### Web Dashboard
A high-performance analytics dashboard for tracking global payment flows and agent rankings.
```bash
ascent dashboard --port 3456
```
Features:
- **Leaderboard:** Top-rated agents by Reputation Score.
- **Volume Tracking:** Total USDC processed through your infrastructure.
- **Live Stream:** Real-time transaction feed with Aptos Explorer links.

---

## 🦀 5. Move Language Helpers

Generate Move modules for custom on-chain payment verification logic.
```bash
ascent move init    # Bootstrap Move project
ascent move inject  # Inject payment verifier module
```

---

## 💰 Resource Registry

| Network | Chain ID | USDC Asset Address |
| :--- | :--- | :--- |
| **Aptos Testnet** | `aptos:2` | `0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832` |
| **Aptos Mainnet** | `aptos:1` | `0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b` |

---

Built for the **Canteen x Aptos x402 Hackathon 2026**
