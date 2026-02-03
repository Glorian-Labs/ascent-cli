/**
 * Transaction Review Prompt
 * Review recent payment transactions
 */

const { z } = require('zod');

const schema = {
  transactionHash: z.string().optional().describe('Specific transaction to review')
};

function handler({ transactionHash }) {
  return {
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: transactionHash
          ? `Please review transaction ${transactionHash}. Verify its status and show me the receipt.`
          : `Show me my recent x402 payment transactions. I want to review my spending history ` +
            `and check the status of my past payments.`
      }
    }]
  };
}

module.exports = { name: 'transaction-review', schema, handler };