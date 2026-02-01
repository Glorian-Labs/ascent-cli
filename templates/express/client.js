/**
 * x402 Payment Client Example
 * 
 * This shows how to pay for a protected resource using the x402 protocol.
 * Uses @aptos-labs/ts-sdk directly (the @rvk_rishikesh client has bugs).
 */

const { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const USDC_ASSET = '0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832';

/**
 * Pay for a protected resource
 * 
 * @param {string} endpoint - The protected endpoint URL
 * @param {string} privateKeyHex - Your Aptos private key (with 0x prefix)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Payment result
 */
async function payForResource(endpoint, privateKeyHex, options = {}) {
  const facilitatorUrl = options.facilitatorUrl || 'http://localhost:4022';
  
  // Create account from private key
  const account = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(privateKeyHex)
  });
  
  console.log('Paying from:', account.accountAddress.toString());

  try {
    // Step 1: Get payment requirements (402 response)
    console.log('Getting payment requirements...');
    const response1 = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body || {})
    });

    if (response1.status !== 402) {
      // Resource is either free or there's an error
      return {
        success: response1.ok,
        status: response1.status,
        response: await response1.json()
      };
    }

    // Parse payment requirements
    const paymentRequired = response1.headers.get('PAYMENT-REQUIRED');
    const requirements = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
    const accept = requirements.accepts[0];
    
    console.log('Payment required:', accept.amount, 'USDC atomic units (0.01 USDC)');

    // Step 2: Build transaction
    console.log('Building transaction...');
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
    
    const rawTransaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: '0x1::primary_fungible_store::transfer',
        typeArguments: ['0x1::fungible_asset::Metadata'],
        functionArguments: [
          accept.asset,   // USDC asset address
          accept.payTo,   // Recipient address
          accept.amount   // Amount in atomic units
        ]
      }
    });

    // Step 3: Sign transaction
    console.log('Signing transaction...');
    const senderAuthenticator = aptos.transaction.sign({
      signer: account,
      transaction: rawTransaction
    });

    // Step 4: Create x402 payment payload
    // This is the format the facilitator expects
    const transactionBytes = Array.from(rawTransaction.rawTransaction.bcsToBytes());
    const authenticatorBytes = Array.from(senderAuthenticator.bcsToBytes());
    
    const aptosPaymentPayload = {
      transaction: transactionBytes,
      senderAuthenticator: authenticatorBytes
    };
    
    const paymentPayload = {
      accepted: {
        scheme: "exact",
        network: "aptos:2"
      },
      payload: {
        transaction: Buffer.from(JSON.stringify(aptosPaymentPayload)).toString('base64')
      }
    };

    const paymentRequirements = {
      scheme: "exact",
      network: "aptos:2",
      amount: accept.amount,
      asset: accept.asset,
      payTo: accept.payTo,
      extra: accept.extra || { sponsored: true }
    };

    // Step 5: Verify with facilitator
    console.log('Verifying payment with facilitator...');
    const verifyRes = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload, paymentRequirements })
    });

    const verifyResult = await verifyRes.json();
    
    if (!verifyResult.isValid) {
      console.error('Verification failed:', verifyResult.invalidReason);
      return {
        success: false,
        error: 'verify_failed',
        reason: verifyResult.invalidReason
      };
    }

    // Step 6: Settle with facilitator
    console.log('Settling payment...');
    const settleRes = await fetch(`${facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload, paymentRequirements })
    });

    const settleResult = await settleRes.json();
    
    if (!settleResult.success) {
      console.error('Settlement failed:', settleResult.errorReason);
      return {
        success: false,
        error: 'settle_failed',
        reason: settleResult.errorReason
      };
    }

    console.log('Payment settled! Transaction:', settleResult.transaction);

    // Step 7: Call the protected endpoint with payment signature
    console.log('Accessing protected resource...');
    const paymentSignature = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    
    const finalResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYMENT-SIGNATURE': paymentSignature
      },
      body: JSON.stringify(options.body || {})
    });

    const result = await finalResponse.json();

    return {
      success: finalResponse.ok,
      status: finalResponse.status,
      transaction: settleResult.transaction,
      payer: settleResult.payer,
      response: result
    };

  } catch (error) {
    console.error('Payment error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage
async function main() {
  // Replace with your private key (must have testnet USDC)
  const PRIVATE_KEY = process.env.PRIVATE_KEY || 'your-private-key-here';
  
  if (PRIVATE_KEY === 'your-private-key-here') {
    console.log('Please set your PRIVATE_KEY environment variable');
    console.log('Get testnet USDC at: https://faucet.circle.com/');
    process.exit(1);
  }

  const result = await payForResource(
    'http://localhost:3006/api/paid',
    PRIVATE_KEY,
    { body: { test: true } }
  );

  if (result.success) {
    console.log('\n✅ Payment successful!');
    console.log('Transaction:', result.transaction);
    console.log('Server response:', result.response);
  } else {
    console.log('\n❌ Payment failed:', result.error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { payForResource };
