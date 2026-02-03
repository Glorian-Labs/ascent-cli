/**
 * Get Payment Requirements Tool
 * Gets payment requirements from an x402 protected resource
 */

const { z } = require('zod');

const schema = {
  url: z.string().describe('The protected resource URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().describe('HTTP method (default: POST)'),
  body: z.string().optional().describe('JSON body to send with the request')
};

async function handler({ url, method, body }) {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const initResponse = await fetch(url, {
      method: method || 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body || '{}'
    });
    
    if (initResponse.status !== 402) {
      const responseBody = await initResponse.text();
      return {
        content: [{
          type: 'text',
          text: `ℹ️ Resource is not protected or already accessible\n` +
                `Status: ${initResponse.status} ${initResponse.statusText}\n` +
                `Response: ${responseBody.slice(0, 500)}`
        }]
      };
    }
    
    const paymentRequired = initResponse.headers.get('PAYMENT-REQUIRED');
    if (!paymentRequired) {
      return {
        content: [{
          type: 'text',
          text: `⚠️ 402 response received but no PAYMENT-REQUIRED header found`
        }],
        isError: true
      };
    }
    
    const requirements = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
    const accept = requirements.accepts[0];
    
    return {
      content: [{
        type: 'text',
        text: `💳 Payment Required for ${url}\n\n` +
              `Amount: ${(parseInt(accept.amount) / 1000000).toFixed(6)} USDC\n` +
              `Asset: ${accept.asset}\n` +
              `Pay To: ${accept.payTo}\n` +
              `Scheme: ${accept.scheme}\n` +
              `Network: ${accept.network}\n` +
              `\nAdditional Info: ${JSON.stringify(accept.extra || {}, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to get payment requirements: ${error.message}`
      }],
      isError: true
    };
  }
}

module.exports = { name: 'get_payment_requirements', schema, handler };