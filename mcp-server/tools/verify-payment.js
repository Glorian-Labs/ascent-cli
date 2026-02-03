/**
 * Verify Payment Tool
 * Verifies the status of a payment transaction
 */

const { z } = require('zod');
const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');

const schema = {
  transactionHash: z.string().describe('The transaction hash to verify'),
  network: z.enum(['testnet', 'mainnet']).optional().describe('Network (default: testnet)')
};

async function handler({ transactionHash, network }) {
  try {
    const aptosConfig = new AptosConfig({ 
      network: network === 'mainnet' ? Network.MAINNET : Network.TESTNET 
    });
    const aptos = new Aptos(aptosConfig);
    
    const txn = await aptos.transaction.getTransactionByHash({
      transactionHash
    });
    
    const status = txn.success ? '✅ Success' : '❌ Failed';
    const statusEmoji = txn.success ? '✅' : '❌';
    
    return {
      content: [{
        type: 'text',
        text: `${statusEmoji} Transaction Status\n\n` +
              `Hash: ${transactionHash}\n` +
              `Status: ${status}\n` +
              `VM Status: ${txn.vm_status}\n` +
              `Sender: ${txn.sender}\n` +
              `Version: ${txn.version}\n` +
              `Timestamp: ${new Date(parseInt(txn.timestamp) / 1000).toISOString()}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to verify transaction: ${error.message}`
      }],
      isError: true
    };
  }
}

module.exports = { name: 'verify_payment', schema, handler };