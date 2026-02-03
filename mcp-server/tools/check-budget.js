/**
 * Budget Check Tool
 * Check daily spending budget for a wallet
 */

const { z } = require('zod');
const { PaymentFlow } = require('../payment-flow');

const schema = {
  address: z.string().describe('Wallet address to check budget for')
};

async function handler({ address }, config, x402Client) {
  try {
    const flow = new PaymentFlow(x402Client, config);
    const spent = flow.getDailySpend(address);
    const dailyBudget = parseFloat(config.dailyBudget || '10.0');
    const remaining = dailyBudget - spent;
    
    return {
      content: [{
        type: 'text',
        text: `💰 Budget Status for ${address.slice(0, 20)}...\n\n` +
              `Daily Budget: ${dailyBudget.toFixed(6)} USDC\n` +
              `Spent Today:  ${spent.toFixed(6)} USDC\n` +
              `Remaining:    ${remaining.toFixed(6)} USDC\n\n` +
              `Status: ${remaining > 0 ? '✅ Within budget' : '⚠️ Budget exhausted'}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to check budget: ${error.message}`
      }],
      isError: true
    };
  }
}

module.exports = { name: 'check_budget', schema, handler };