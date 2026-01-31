# Ascent CLI 🧬
### The Elite Toolkit for x402 Agent Commerce on Aptos

**Ascent** is a production-grade CLI built to empower developers to forge x402 payment-enabled agents on the Aptos network. High velocity, lethal precision, local-first.

---

## ⚡ Quick Start

```bash
# Forge a new project
ascent init my-agent

# Launch development environment (includes local facilitator)
ascent dev

# Simulate payment flows with stress-test wallets
ascent test --all-wallets

# Monitor transactions in real-time
ascent monitor
```

## 🛠️ Commands

| Command | Action |
|---------|--------|
| `init <name>` | Scaffold a new agent project (Express/Next/Hono) |
| `dev` | Start dev server with local x402 verification |
| `test` | Run simulated payment cycles using hackathon wallets |
| `monitor` | Terminal-based real-time transaction analytics |
| `move init` | Bootstrap an Aptos Move verification module |
| `move inject` | Inject x402 validation logic into your Move project |

## 🧬 Protocol Flow (x402)

1. **Request**: Agent requests protected resource.
2. **Challenge**: Server returns `402 Payment Required` + requirements.
3. **Synthesis**: Client constructs and signs Aptos transaction.
4. **Verification**: Facilitator verifies on-chain settlement.
5. **Access**: Access granted to elite logic.

---

*Forged by Hebx. Built for the Ascension Phase.* 🥷🏻
