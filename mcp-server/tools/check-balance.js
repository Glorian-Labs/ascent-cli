/**
 * Check Balance Tool
 * Checks USDC balance for an Aptos wallet address
 */

const { z } = require('zod');
const { X402Client } = require('../../lib/x402-client');

const schema = {
  address: z.string().describe('The Aptos wallet address to check (0x...)'),
  network: z.enum(['testnet', 'mainnet']).optional().describe('Network to check (defaults to config)')
};

async function handler({ address, network }, config) {
  try {
    const client = new X402Client({
      facilitatorUrl: config.facilitatorUrl,
      network: network === 'mainnet' ? 'aptos:1' : 'aptos:2'
    });
    
    const result = await client.checkBalance(address);
    
    if (result.error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error checking balance: ${result.error}`
        }],
        isError: true
      };
    }
    
    const balanceUSDC = (parseInt(result.balance) / 1000000).toFixed(6);
    
    return {
      content: [{
        type: 'text',
        text: `💰 Balance for ${address.slice(0, 20)}...\n\n` +
              `USDC Balance: ${balanceUSDC} USDC\n` +
              `(Atomic units: ${result.balance})\n` +
              `Asset: ${result.asset.slice(0, 20)}...`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to check balance: ${error.message}`
      }],
      isError: true
    };
  }
}

module.exports = { name: 'check_balance', schema, handler };