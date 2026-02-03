/**
 * Payment Authorization Prompt
 * Guide for authorizing and sending x402 payments
 */

const { z } = require('zod');

const schema = {
  resourceUrl: z.string().describe('The URL of the protected resource'),
  maxBudget: z.string().optional().describe('Maximum budget for this payment')
};

function handler({ resourceUrl, maxBudget }) {
  return {
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `I need to access a paid resource at ${resourceUrl}. ` +
              `Please help me authorize the payment${maxBudget ? ` with a maximum budget of ${maxBudget} USDC` : ''}.\n\n` +
              `First, check the payment requirements using the get_payment_requirements tool, ` +
              `then guide me through the payment process if the amount is acceptable.`
      }
    }]
  };
}

module.exports = { name: 'payment-authorization', schema, handler };