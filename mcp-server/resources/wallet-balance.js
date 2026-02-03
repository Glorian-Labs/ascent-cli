/**
 * Wallet Balance Resource
 * Access wallet balance by address
 */

const { X402Client } = require('../../lib/x402-client');

async function handler(uri, { address }, config) {
  try {
    const client = new X402Client({
      facilitatorUrl: config.facilitatorUrl,
      network: config.network
    });
    
    const result = await client.checkBalance(address);
    const balanceUSDC = result.error ? 0 : parseInt(result.balance) / 1000000;
    
    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify({
          address,
          balance: result.balance,
          balanceUSDC: balanceUSDC.toFixed(6),
          asset: result.asset,
          error: result.error || null,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      contents: [{
        uri: uri.href,
        mimeType: 'text/plain',
        text: `Error fetching balance: ${error.message}`
      }]
    };
  }
}

module.exports = { name: 'wallet-balance', pattern: 'wallet-balance://{address}', handler };