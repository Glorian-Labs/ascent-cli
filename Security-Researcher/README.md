# My x402 App

x402 payment-enabled API built with Aptos.

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your wallet details (PAYMENT_RECIPIENT_ADDRESS, APTOS_PRIVATE_KEY for facilitator fee payer)
```

## Run

**Intended flow:** run from this project directory (not from ascent-cli root):

```bash
ascent dev
```

This starts the local facilitator (port 4022) and then this API server. The CLI writes `.env.ascent-dev` (FACILITATOR_URL=http://localhost:4022) so the server uses the local facilitator even when env isn’t inherited by npm/nodemon; the file is removed when you stop ascent dev. For settle to succeed, set `APTOS_PRIVATE_KEY` in this project’s `.env.local` (fee payer for the facilitator).

To run only the API (e.g. for production): `npm run dev` or `node server.js`. The server will use the remote facilitator unless it detects a local facilitator on 4022.

## Test Payment

**`npm test`** runs the payment flow test (all 5 wallets). It **requires the stack to be running**: start `ascent dev` in one terminal, then in another run:

```bash
npm test
```

Or from the ascent-cli repo (or with `ascent` on PATH):

```bash
ascent test --endpoint http://localhost:3006/api/paid -w <wallet-address> -p <private-key>
# or
ascent test --all-wallets --endpoint http://localhost:3006/api/paid
```

If the facilitator or server is not reachable, the test exits with code 1 and tells you to start with `ascent dev`.

## Payment verify (aligned with x402 standard)

- **Server** uses `HTTPFacilitatorClient` from `@rvk_rishikesh/core/server`: `facilitator.verify(...)` then `facilitator.settle(...)` with a 15s timeout. Facilitator URL is used without a trailing slash so `/verify` and `/settle` paths are correct.
- **Local facilitator**: When you run `ascent dev` from **this project directory**, the CLI starts the local facilitator and then this API; the server will use the local facilitator so verify/settle succeed. Set `APTOS_PRIVATE_KEY` in this project’s `.env.local` so the facilitator has a fee payer and settle succeeds.
- **Remote facilitator**: The public facilitator often returns `unexpected_verify_error` for our manual client payload; use the official x402 client (fortune-cookie style) for remote compatibility.
