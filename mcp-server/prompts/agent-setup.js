/**
 * New Agent Setup Prompt
 * Setup guide for new AI agents using x402 payments
 */

const schema = {};

function handler() {
  return {
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `I'm setting up a new AI agent to use x402 payments on Aptos. ` +
              `Please guide me through:\n\n` +
              `1. Available test wallets I can use\n` +
              `2. How to check wallet balances\n` +
              `3. How to get payment requirements from a protected resource\n` +
              `4. How to send payments\n` +
              `5. How to verify transactions\n\n` +
              `Start by showing me the available wallets.`
      }
    }]
  };
}

module.exports = { name: 'agent-setup', schema, handler };