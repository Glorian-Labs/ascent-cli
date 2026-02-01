// Express x402 Server Template - Protocol Native
const express = require('express');
require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3006;
const PAY_TO_ADDRESS = process.env.PAYMENT_RECIPIENT_ADDRESS;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402-navy.vercel.app/facilitator/';
const USDC_ASSET = "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832";

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
    const paymentRequirements = {
      scheme: "exact", network: "aptos:2", amount: "10000",
      asset: USDC_ASSET, payTo: PAY_TO_ADDRESS, extra: { sponsored: true }
    };
    
    // Verify & Settle with Facilitator
    const facilitatorUrl = FACILITATOR_URL.endsWith('/') ? FACILITATOR_URL : `${FACILITATOR_URL}/`;
    
    const verifyRes = await fetch(`${facilitatorUrl}verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload, paymentRequirements }),
      timeout: 30000 // 30s timeout
    });
    const verifyResult = await verifyRes.json();
    
    if (!verifyResult.isValid) return res.status(402).json({ error: "Invalid payment" });
    
    const settleRes = await fetch(`${facilitatorUrl}settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload, paymentRequirements }),
      timeout: 30000 // 30s timeout
    });
    const settleResult = await settleRes.json();
    
    if (!settleResult.success) return res.status(402).json({ error: "Settlement failed" });
    
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
  console.log(`\n🚀 Ascent Agent Server running on port ${PORT}`);
  console.log(`💰 Forging payments to: ${PAY_TO_ADDRESS}\n`);
});
