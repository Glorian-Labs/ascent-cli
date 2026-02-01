// Express x402 Server - same verify/settle pattern as fortune-cookie and minimal-x402
const express = require('express');
const path = require('path');
// Load .env.local first, then .env.ascent-dev so "ascent dev" override wins (local facilitator)
const projectDir = path.resolve(process.cwd());
require('dotenv').config({ path: path.join(projectDir, '.env.local') });
require('dotenv').config({ path: path.join(projectDir, '.env.ascent-dev') });
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { HTTPFacilitatorClient } = require('@rvk_rishikesh/core/server');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3006;
const PAY_TO_ADDRESS = process.env.PAYMENT_RECIPIENT_ADDRESS;
const DEFAULT_FACILITATOR = 'https://x402-navy.vercel.app/facilitator/';
const FACILITATOR_URL = process.env.FACILITATOR_URL || DEFAULT_FACILITATOR;
const LOCAL_FACILITATOR = 'http://localhost:4022/';
const USDC_ASSET = "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832";
const FACILITATOR_TIMEOUT_MS = 15000;

let cachedFacilitatorUrl = null;
async function getFacilitatorUrl() {
  if (cachedFacilitatorUrl) return cachedFacilitatorUrl;
  const base = FACILITATOR_URL.endsWith('/') ? FACILITATOR_URL.slice(0, -1) : FACILITATOR_URL;
  const isDefaultRemote = base === DEFAULT_FACILITATOR.slice(0, -1) || base === 'https://x402-navy.vercel.app/facilitator';
  if (isDefaultRemote) {
    try {
      const localHealth = LOCAL_FACILITATOR.replace(/\/$/, '') + '/health';
      const r = await Promise.race([
        fetch(localHealth, { method: 'GET' }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
      ]);
      if (r && r.ok) {
        cachedFacilitatorUrl = LOCAL_FACILITATOR.replace(/\/$/, '');
        console.log('[api/paid] Using local facilitator at', cachedFacilitatorUrl);
        return cachedFacilitatorUrl;
      }
    } catch (_) {}
  }
  cachedFacilitatorUrl = FACILITATOR_URL.replace(/\/$/, '');
  return cachedFacilitatorUrl;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms))
  ]);
}

/**
 * Creates PAYMENT-REQUIRED header for 402 response
 */
function createPaymentRequirements(url) {
  const accepts = [{
    scheme: "exact",
    network: "aptos:2",
    amount: "10000", // 0.01 USDC
    asset: USDC_ASSET,
    payTo: PAY_TO_ADDRESS,
    maxTimeoutSeconds: 300,
    extra: { symbol: "USDC", sponsored: true }
  }];

  const requirements = {
    x402Version: 2,
    error: "Payment required",
    accepts: accepts,
    resource: {
      url: url,
      description: "Paid API endpoint",
      mimeType: "application/json",
      accepts: accepts
    }
  };
  return Buffer.from(JSON.stringify(requirements)).toString('base64');
}

/**
 * Protected endpoint middleware
 */
app.post('/api/paid', async (req, res) => {
  const paymentSignature = req.headers['payment-signature'];
  
  if (!paymentSignature) {
    return res
      .status(402)
      .set('PAYMENT-REQUIRED', createPaymentRequirements(`http://localhost:${PORT}/api/paid`))
      .json({ error: "Payment required" });
  }
  
  try {
    const paymentPayload = JSON.parse(Buffer.from(paymentSignature, 'base64').toString());
    // Same shape as fortune-cookie / minimal-x402: scheme, network, amount, asset, payTo, extra
    const paymentRequirements = {
      scheme: "exact",
      network: "aptos:2",
      amount: "10000",
      asset: USDC_ASSET,
      payTo: PAY_TO_ADDRESS,
      extra: { symbol: "USDC", sponsored: true }
    };
    const facilitatorUrl = await getFacilitatorUrl();
    console.log('[api/paid] Payment received, calling facilitator verify at', facilitatorUrl, '(timeout', FACILITATOR_TIMEOUT_MS / 1000, 's)');

    const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
    let verifyResult;
    try {
      verifyResult = await withTimeout(
        facilitator.verify(paymentPayload, paymentRequirements),
        FACILITATOR_TIMEOUT_MS,
        'Facilitator verify'
      );
    } catch (e) {
      console.error('[api/paid] Facilitator verify error:', e.message || e);
      return res.status(504).json({ error: "Facilitator verify timed out", detail: e.message });
    }
    console.log('[api/paid] Verify response:', JSON.stringify(verifyResult));
    if (!verifyResult.isValid) {
      console.log('[api/paid] Rejected:', verifyResult.invalidReason || 'unknown');
      return res.status(402).json({ error: "Invalid payment", reason: verifyResult.invalidReason });
    }

    console.log('[api/paid] Calling facilitator settle...');
    let settleResult;
    try {
      settleResult = await withTimeout(
        facilitator.settle(paymentPayload, paymentRequirements),
        FACILITATOR_TIMEOUT_MS,
        'Facilitator settle'
      );
    } catch (e) {
      console.error('[api/paid] Facilitator settle error:', e.message || e);
      return res.status(504).json({ error: "Facilitator settle timed out", detail: e.message });
    }
    console.log('[api/paid] Settle response:', JSON.stringify(settleResult));
    if (!settleResult.success) return res.status(402).json({ error: "Settlement failed" });

    console.log('[api/paid] Payment complete, tx:', settleResult.transaction);
    res.status(200).json({ 
      message: 'Forge complete! Access granted to protected agent logic.',
      transaction: settleResult.transaction,
      poweredBy: 'Ascent'
    });
      
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  const url = (process.env.FACILITATOR_URL || '').trim() || DEFAULT_FACILITATOR;
  const base = url.replace(/\/$/, '');
  console.log(`\n🚀 Ascent Agent Server running on port ${PORT}`);
  console.log(`💰 Forging payments to: ${PAY_TO_ADDRESS}`);
  if (base.includes('localhost') && base.includes('4022')) {
    console.log(`✓ Facilitator: ${base} (local)\n`);
  } else if (url.includes('x402-navy.vercel.app')) {
    console.log(`\n⚠️  Facilitator: remote (verify may fail). Run "ascent dev" from this directory for local.\n`);
  } else {
    console.log(`   Facilitator: ${base}\n`);
  }
});
