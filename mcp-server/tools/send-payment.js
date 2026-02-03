/**
 * Send Payment Tool
 * Sends an x402 payment to access a protected resource
 */

const { z } = require('zod');
const { PaymentFlow } = require('../payment-flow');
const { getWallet, getDefaultWallet } = require('../keystore');

const schema = {
  url: z.string().describe('The protected resource URL'),
  walletName: z.string().optional().describe('Wallet name (or uses default)'),
  maxAmount: z.string().optional().describe('Maximum amount willing to pay (USDC)'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().describe('HTTP method (default: POST)'),
  body: z.string().optional().describe('JSON body to send with the request'),
  skipConfirmation: z.boolean().optional().describe('Skip confirmation for this payment')
};

async function handler({ url, walletName, maxAmount, method, body, skipConfirmation }, config, x402Client) {
  try {
    // Get wallet
    let wallet;
    try {
      wallet = walletName ? getWallet(walletName) : getDefaultWallet();
    } catch (e) {
      return {
        content: [{
          type: 'text',
          text: `❌ ${e.message}. Use walletName parameter or set a default wallet.`
        }],
        isError: true
      };
    }

    if (!wallet) {
      return {
        content: [{
          type: 'text',
          text: `❌ No wallet configured. Add a wallet using the keystore or set APTOS_PRIVATE_KEY environment variable.`
        }],
        isError: true
      };
    }

    // Create payment flow
    const flow = new PaymentFlow(x402Client, {
      ...config,
      maxPaymentAmount: maxAmount || config.maxPaymentAmount,
      requireConfirmation: !skipConfirmation && config.requireConfirmation
    });

    // Execute complete payment flow
    const result = await flow.pay(url, wallet.privateKey, {
      method: method || 'POST',
      body: body ? JSON.parse(body) : {},
      payerAddress: wallet.address
    });

    if (!result.success) {
      return {
        content: [{
          type: 'text',
          text: result.protected 
            ? `❌ Payment failed\nError: ${result.error || result.reason || 'Unknown error'}\n${result.code ? `Code: ${result.code}` : ''}`
            : `ℹ️ ${result.message}`
        }],
        isError: !result.protected
      };
    }

    // Build success response
    let responseText = `✅ Payment successful!\n\n`;
    responseText += `Transaction: ${result.transaction || 'N/A'}\n`;
    responseText += `Payer: ${result.payer || 'N/A'}\n`;
    responseText += `Receipt ID: ${result.receiptId}\n\n`;
    
    if (result.response) {
      responseText += `Response:\n${JSON.stringify(result.response, null, 2)}`;
    }

    return {
      content: [{
        type: 'text',
        text: responseText
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Payment failed: ${error.message}`
      }],
      isError: true
    };
  }
}

module.exports = { name: 'send_payment', schema, handler };