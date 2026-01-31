// Express x402 Server Template
const express = require('express');
const { x402ResourceServer, HTTPFacilitatorClient } = require('@rvk_rishikesh/core/server');
const { ExactAptosScheme } = require('@rvk_rishikesh/aptos/exact/server');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PAY_TO_ADDRESS = process.env.PAYMENT_RECIPIENT_ADDRESS;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402-navy.vercel.app/facilitator/';

// Initialize x402
const facilitator = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const aptosScheme = new ExactAptosScheme();

const server = new x402ResourceServer([facilitator])
  .register('aptos:2', aptosScheme);

const routes = {
  '/api/paid-endpoint': {
    accepts: [{
      scheme: 'exact',
      payTo: PAY_TO_ADDRESS,
      price: '0.01',
      network: 'aptos:2'
    }],
    description: 'Paid API endpoint',
    mimeType: 'application/json'
  }
};

// Protected endpoint
app.post('/api/paid-endpoint', async (req, res) => {
  res.json({ 
    message: 'Forge complete! Access granted to protected agent logic.',
    poweredBy: 'Ascent'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Ascent Agent Server running on port ${PORT}`);
  console.log(`💰 Forging payments to: ${PAY_TO_ADDRESS}\n`);
});
