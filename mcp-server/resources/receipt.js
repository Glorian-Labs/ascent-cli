/**
 * Transaction Receipt Resource
 * Access transaction receipts by transaction hash
 */

const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');

async function handler(uri, { transactionHash }) {
  try {
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
    
    const txn = await aptos.transaction.getTransactionByHash({ transactionHash });
    
    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify({
          transactionHash,
          success: txn.success,
          vmStatus: txn.vm_status,
          sender: txn.sender,
          gasUsed: txn.gas_used,
          gasUnitPrice: txn.gas_unit_price,
          timestamp: txn.timestamp,
          version: txn.version,
          receiptGeneratedAt: new Date().toISOString()
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      contents: [{
        uri: uri.href,
        mimeType: 'text/plain',
        text: `Error fetching receipt: ${error.message}`
      }]
    };
  }
}

module.exports = { name: 'receipt', pattern: 'receipt://{transactionHash}', handler };