// Payment flow tester with real x402 integration
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { x402Client, wrapFetchWithPayment } = require('@rvk_rishikesh/fetch');
const { registerExactAptosScheme } = require('@rvk_rishikesh/aptos/exact/client');
const { Account, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');

class PaymentTester {
  async run(options) {
    try {
      // Setup account
      const privateKeyHex = options.wallet || process.env.APTOS_PRIVATE_KEY;
      if (!privateKeyHex) {
        return { success: false, error: 'No wallet provided. Use -w or set APTOS_PRIVATE_KEY' };
      }

      const privateKey = new Ed25519PrivateKey(privateKeyHex.replace('0x', ''));
      const account = Account.fromPrivateKey({ privateKey });

      console.log(`Testing with wallet: ${account.accountAddress.toString()}`);

      // Initialize x402 client
      const client = new x402Client();
      registerExactAptosScheme(client, { signer: account });
      
      const fetchWithPayment = wrapFetchWithPayment(fetch, client);

      // Test payment flow
      console.log('Making paid request to http://localhost:3000/api/paid-endpoint...');
      
      const response = await fetchWithPayment('http://localhost:3000/api/paid-endpoint', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        const txHash = data.transaction || 'unknown';
        
        return {
          success: true,
          transaction: txHash,
          message: data.message || data.fortune,
          explorer: `https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`
        };
      } else {
        const error = await response.text();
        return { success: false, error: `Payment failed: ${error}` };
      }

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PaymentTester();
