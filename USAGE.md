# 📖 Aptos x402 CLI - Usage Guide

## 🚀 Getting Started

### 1. Installation
```bash
npm install -g aptos-x402-cli
```

### 2. Scaffold a Project
Choose between Express (default) or Next.js:
```bash
aptos-x402 init my-agent-api --template express
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
aptos-x402 dev
```
- Server: `http://localhost:3000`
- Facilitator: `http://localhost:4022`

### 5. Test Payment Flow
```bash
aptos-x402 test -w 0xyour_wallet
```

---

## 🛠️ Commands

### `init <project-name>`
Scaffold a new x402 project.

Options:
- `-t, --template <type>`: Template type (`express`, `next`, `hono`)

Example:
```bash
aptos-x402 init my-api --template next
```

### `dev`
Start development server with local facilitator.

Options:
- `-p, --port <port>`: Server port (default: 3000)
- `-f, --facilitator-port <port>`: Facilitator port (default: 4022)
- `--no-facilitator`: Use public facilitator instead of local

Example:
```bash
aptos-x402 dev --port 8080
```

### `test`
Test payment flow with test wallet.

Options:
- `-w, --wallet <address>`: Test wallet address
- `-a, --amount <amount>`: Payment amount (default: 0.01)

Example:
```bash
aptos-x402 test -w 0x489cbd8ade2279edc20ef18a52b894d5a983575c1c0979e901be60b73741fe5d
```

### `monitor`
Monitor payment flows in real-time.

Options:
- `-i, --interval <ms>`: Update interval (default: 3000)

### `deploy`
Deploy to Vercel.

### `move <action>`
Move language helpers.

Actions:
- `init`: Initialize Move project
- `add-payment-logic`: Add payment verification module

Example:
```bash
aptos-x402 move init
aptos-x402 move add-payment-logic
```

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

### Template Structure

**Express Template:**
```
my-api/
├── server.js          # x402-enabled server
├── package.json
├── .env.example
└── README.md
```

**Next.js Template:**
```
my-api/
├── middleware.js      # x402 payment proxy
├── app/
├── package.json
├── .env.example
└── README.md
```

---

## 🎯 Example: Complete Setup

```bash
# 1. Create project
aptos-x402 init fortune-api
cd fortune-api

# 2. Install dependencies
npm install

# 3. Configure
export PAYMENT_RECIPIENT_ADDRESS="0xyour_address"
export APTOS_PRIVATE_KEY="0xyour_private_key"

# 4. Start dev environment
aptos-x402 dev

# 5. In another terminal, test
aptos-x402 test -w 0xyour_wallet
```

---

## 🐛 Troubleshooting

### "Facilitator not configured"
Set `APTOS_PRIVATE_KEY` in your environment.

### "Expected 402, got 200"
Your endpoint might not be protected. Check middleware configuration.

### Payment fails
Ensure wallet has testnet USDC at: https://faucet.circle.com/

---

Built for **Canteen x Aptos x402 Hackathon 2026**
