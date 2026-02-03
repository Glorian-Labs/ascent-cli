/**
 * Budget Management Prompt
 * Guide for managing payment budgets and tracking spending
 */

const { z } = require('zod');

const schema = {
  walletAddress: z.string().optional().describe('Wallet address to check')
};

function handler({ walletAddress }, config) {
  return {
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Help me manage my x402 payment budget.\n\n` +
              (walletAddress 
                ? `Check the balance for ${walletAddress} and review my recent transaction history.`
                : `Check the available test wallets and show me how to monitor my spending.`) +
              `\n\nCurrent configured limits:\n` +
              `- Max per payment: ${config.maxPaymentAmount} USDC\n` +
              `- Daily budget: ${config.dailyBudget} USDC\n\n` +
              `What are my spending patterns and how can I optimize my payments?`
      }
    }]
  };
}

module.exports = { name: 'budget-management', schema, handler };