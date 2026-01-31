# My x402 Next.js App

x402 payment-enabled Next.js application.

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local
```

## Run

```bash
npm run dev
```

## Protected Endpoints

- `POST /api/paid` - Requires 0.01 USDC payment

## Test

```bash
aptos-x402 test -w <wallet-address>
```
