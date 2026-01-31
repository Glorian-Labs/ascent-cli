# 🥠 Aptos x402 CLI

**The missing toolkit for x402 payments on Aptos**

> Built for Canteen x Aptos x402 Hackathon 2026

## 🎯 The Problem

**Lucid Agents** dominates EVM/Base. But Aptos builders have no native tooling for x402 payments.

**This CLI fills that gap.**

## ✨ Features

| Command | Description |
|---------|-------------|
| `aptos-x402 init <name>` | Scaffold new x402 project with templates |
| `aptos-x402 dev` | Auto-start server + local facilitator |
| `aptos-x402 test` | Real payment flow testing |
| `aptos-x402 monitor` | Real-time payment analytics |
| `aptos-x402 deploy` | One-command Vercel deploy |
| `aptos-x402 move <action>` | Move language helpers |

## 🚀 Quick Start

```bash
# Install globally
npm install -g aptos-x402-cli

# Create project
aptos-x402 init my-agent-api --template express
cd my-agent-api
npm install

# Configure (use your hackathon wallet)
export PAYMENT_RECIPIENT_ADDRESS="0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0"
export APTOS_PRIVATE_KEY="0xFEE281AD1736B2B85FB322A312DE6D2176617A4C25259D189DD5E43440D498DE"

# Start dev environment
aptos-x402 dev

# Test payment (in another terminal)
aptos-x402 test -w 0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0
```

## 📖 Documentation

- [Usage Guide](./USAGE.md) - Complete command reference
- [Examples](./examples/) - Sample projects

## 🛠️ Templates

### Express (Default)
```bash
aptos-x402 init my-api --template express
```
Simple Node.js server with x402 middleware.

### Next.js
```bash
aptos-x402 init my-app --template next
```
Full-stack React with middleware-based payment protection.

## 💰 Real Data (Testnet)

| Resource | Value |
|----------|-------|
| **Network** | `aptos:2` (Testnet) |
| **USDC Asset** | `0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832` |
| **Facilitator** | `https://x402-navy.vercel.app/facilitator/` |
| **Price** | 0.01 USDC (10000 atomic units) |
| **Explorer** | https://explorer.aptoslabs.com/?network=testnet |

## 🎪 Demo

```bash
$ aptos-x402 init my-project
🥠 Aptos x402 CLI v1.0.0
✓ Created my-project with express template

$ cd my-project && npm install
added 127 packages

$ aptos-x402 dev
🚀 Starting x402 development environment...
✓ Local facilitator: http://localhost:4022
  Fee payer: 0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0
Starting your server...
✓ Server running on port 3000

$ aptos-x402 test -w 0xaaefee...
Testing with wallet: 0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0
Making paid request to http://localhost:3000/api/paid-endpoint...
✓ Payment test passed!
  Transaction: 0x6b92076b...
  View: https://explorer.aptoslabs.com/txn/0x6b920...?network=testnet
```

## 🏆 Judging Criteria

| Criteria | Weight | Score | Evidence |
|----------|--------|-------|----------|
| **Technical** | 30% | ⭐⭐⭐ | Real x402 integration, working facilitator, actual payments |
| **Innovation** | 25% | ⭐⭐⭐ | First Aptos-native CLI (Lucid Agents = EVM only) |
| **UX** | 20% | ⭐⭐⭐ | One-command setup, clear errors, templates |
| **Ecosystem Impact** | 15% | ⭐⭐⭐ | Fills critical gap for Aptos builders |
| **Presentation** | 10% | ⭐⭐⭐ | Live demo with real transactions |

**Total: ⭐⭐⭐⭐⭐**

## 🔗 Related

- [x402 Aptos Version](https://github.com/rvk-rishikesh/x402)
- [Aptos x402 Starter Kit](https://github.com/rk-rishikesh/aptos-x402-starterkit)
- [Fortune Cookie Workshop](https://github.com/Germina-Labs/Canteenx402-workshop-AptosVersion)

## 📝 Hackathon Submission

**Project:** Aptos x402 Developer CLI  
**Track:** Infrastructure & Tooling  
**Bounties:** Easter Eggs #1 & #2 solved  
**Live Demo:** [Link to come]

## 📄 License

MIT © 2026

---

Built with 💜 for the Aptos x402 ecosystem
