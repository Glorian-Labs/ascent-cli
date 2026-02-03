# 📖 Ascent CLI - Usage Guide

## 🚀 Getting Started

### 1. Installation
```bash
npm install -g ascent-cli
```

### 2. Scaffold a Project
Choose between Express (default) or Next.js:
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
- Server: `http://localhost:3000`
- Facilitator: `http://localhost:4022`

### 5. Test Payment Flow
```bash
ascent test -w 0xyour_wallet
```

---

## 🎭 Agent Identity & Reputation

### 1. Register Agent Identity
Link your wallet to a human-readable name for the global dashboard.
```bash
ascent identity register --address 0x489... --name "Hebx-Security-Bot"
```

### 2. Check Reputation & Metrics
View real-time trust scores and payment history.
```bash
ascent identity show --address 0x489...
```

### 3. List Registry
See all indexed agents ranked by their reputation score.
```bash
ascent identity list
```

---

## 🛠️ Commands

### `init <project-name>`
Scaffold a new x402 project.

Options:
- `-t, --template <type>`: Template type (`express`, `next`, `hono`)

Example:
```bash
ascent init my-api --template next
```

### `dev`
Start development server with local facilitator.

Options:
- `-p, --port <port>`: Server port (default: 3000)
- `-f, --facilitator-port <port>`: Facilitator port (default: 4022)
- `--no-facilitator`: Use public facilitator instead of local

Example:
```bash
ascent dev --port 8080
```

### `test`
Test payment flow with test wallet.

Options:
- `-w, --wallet <address>`: Test wallet address
- `-a, --amount <amount>`: Payment amount (default: 0.01)

Example:
```bash
ascent test -w 0x489cbd8ade2279edc20ef18a52b894d5a983575c1c0979e901be60b73741fe5d
```

### `monitor`
Monitor payment flows in real-time.

Options:
- `-i, --interval <ms>`: Update interval (default: 3000)

### `dashboard`
Start web analytics dashboard.

Options:
- `-p, --port <port>`: Dashboard port (default: 3456)
- `-d, --db <path>`: Database path (default: ./payments.db)

### `identity <action>`
Manage agent identity and reputation.

Actions:
- `register`: Link address to name
- `list`: Show all agents
- `show`: Detailed metrics for one agent

### `move <action>`
Aptos Move language agent helpers.

Actions:
- `init`: Initialize Move project
- `inject`: Add payment verification module

### `config`
Show current configuration.

---

## 💰 Resources

- **Network:** `aptos:2` (Testnet)
- **USDC Asset:** `0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832`
- **Facilitator:** `https://x402-navy.vercel.app/facilitator/`
- **Explorer:** `https://explorer.aptoslabs.com/?network=testnet`

---

## 🔧 Technical Details

### x402 Protocol Flow
```
Request → 402 + PAYMENT-REQUIRED (base64 requirements)
    ↓
Client builds transaction (0.01 USDC)
    ↓
Client signs, sends PAYMENT-SIGNATURE header
    ↓
Server verifies with facilitator /verify
    ↓
Server settles with facilitator /settle
    ↓
200 OK + PAYMENT-RESPONSE + content
```

---

## 🎯 Example: Complete Setup

```bash
# 1. Create project
ascent init fortune-api
cd fortune-api

# 2. Install dependencies
npm install

# 3. Configure
export PAYMENT_RECIPIENT_ADDRESS="0xyour_address"
export APTOS_PRIVATE_KEY="0xyour_private_key"

# 4. Start dev environment
ascent dev

# 5. In another terminal, test
ascent test -w 0xyour_wallet
```

---

Built for production-grade agent commerce on Aptos
