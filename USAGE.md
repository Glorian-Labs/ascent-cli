# Ascent CLI — Usage Guide

## Getting Started

### 1. Installation

```bash
npm install -g @ascent/cli
```

### 2. Scaffold a Project

Choose between Express (default), Next.js, or Hono:

```bash
ascent init my-agent-api --template express
cd my-agent-api
```

### 3. Configuration

Edit `.env.local` with your wallet details:

```env
PAYMENT_RECIPIENT_ADDRESS=0xyour_address
APTOS_PRIVATE_KEY=0xyour_private_key
```

### 4. Local Development

Start your server and a local facilitator:

```bash
ascent dev
```

- Server: `http://localhost:3006`
- Facilitator: `http://localhost:4022`

### 5. Test Payment Flow

```bash
ascent test -w 0xyour_wallet
```

---

## Agent Identity & Reputation

### Register Agent Identity

Link your wallet to a human-readable name for the local registry:

```bash
ascent identity register --address 0x489... --name "Security-Bot"
```

### Check Reputation & Metrics

View trust scores and payment history for a specific agent:

```bash
ascent identity show --address 0x489...
```

### List Registry

See all indexed agents ranked by reputation score:

```bash
ascent identity list
```

---

## Command Reference

### `ascent init <project-name>`

Scaffold a new x402 project.

Options:
- `-t, --template <type>`: Template type (`express`, `next`, `hono`). Default: `express`
- `--no-interactive`: Disable interactive setup (use defaults)

Example:

```bash
ascent init my-api --template next
```

### `ascent dev`

Start development server with local facilitator. Run from inside a project directory.

Options:
- `-p, --port <port>`: Server port (default: 3006)
- `-f, --facilitator-port <port>`: Facilitator port (default: 4022)
- `--no-facilitator`: Use public facilitator instead of local

Example:

```bash
ascent dev --port 8080
```

### `ascent test`

Test x402 payment flow with simulated wallets.

Options:
- `-w, --wallet <address>`: Test wallet address
- `-p, --private-key <key>`: Wallet private key
- `-a, --amount <amount>`: Payment amount in USDC (default: 0.01)
- `-e, --endpoint <url>`: API endpoint to test (default: `http://localhost:3006/api/paid`)
- `-f, --facilitator <url>`: Facilitator URL
- `--all-wallets`: Stress test with all 5 built-in test wallets

Example:

```bash
ascent test --all-wallets
ascent test -w 0x489cbd...
```

### `ascent monitor`

Real-time terminal monitoring of payment flows.

Options:
- `-i, --interval <ms>`: Refresh rate in milliseconds (default: 3000)

### `ascent dashboard`

Start web analytics dashboard.

Options:
- `-p, --port <port>`: Dashboard port (default: 3456)
- `-d, --db <path>`: Database path (default: `./payments.db`)

### `ascent identity <action>`

Manage agent identity and reputation (local SQLite registry).

Actions:
- `register` — Register an agent identity (`--address`, `--name` required)
- `list` — Show all agents ranked by reputation
- `show` — Detailed metrics for one agent (`--address` required)

Options:
- `-a, --address <address>`: Agent wallet address
- `-n, --name <name>`: Display name
- `-d, --db <path>`: Database path (default: `./payments.db`)

### `ascent move <action>`

Aptos Move language helpers.

Actions:
- `init` — Initialize a Move project structure
- `inject` — Add payment verification module to existing Move project

### `ascent kill`

Kill stuck Ascent server processes.

Options:
- `-p, --port <port>`: Kill process on a specific port only

Without options, kills processes on ports 3006, 4022, 3007, 3003, 3000.

### `ascent logs`

Show guidance on where dev server and facilitator logs appear. All output streams to the terminal where `ascent dev` is running.

---

## Network Resources

| Resource | Value |
|---|---|
| Network | `aptos:2` (Testnet) |
| USDC Asset | `0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832` |
| Facilitator (hosted) | `https://x402-navy.vercel.app/facilitator/` |
| Facilitator (local) | `http://localhost:4022` |
| Explorer | [Aptos Explorer (testnet)](https://explorer.aptoslabs.com/?network=testnet) |

---

## x402 Protocol Flow

```
Request ──▶ 402 + PAYMENT-REQUIRED (base64 requirements)
        ──▶ Client builds Aptos tx (0.01 USDC)
        ──▶ Client signs tx
        ──▶ Facilitator /verify
        ──▶ Facilitator /settle
        ──▶ 200 OK + PAYMENT-RESPONSE + content
```

---

## Complete Example

```bash
# 1. Create project
ascent init fortune-api
cd fortune-api

# 2. Install dependencies
npm install

# 3. Configure (edit .env.local)
# PAYMENT_RECIPIENT_ADDRESS=0xyour_address
# APTOS_PRIVATE_KEY=0xyour_private_key

# 4. Start dev environment
ascent dev

# 5. In another terminal, test
ascent test -w 0xyour_wallet

# 6. Monitor transactions
ascent monitor

# 7. View analytics
ascent dashboard
```
