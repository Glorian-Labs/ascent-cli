/**
 * Get Receipt Tool
 * Retrieves and displays a payment receipt
 */

const { z } = require('zod');
const { ReceiptGenerator } = require('../receipts');

const schema = {
  receiptId: z.string().describe('The receipt ID from a previous payment')
};

async function handler({ receiptId }) {
  try {
    const generator = new ReceiptGenerator();
    const receipt = generator.getReceipt(receiptId);
    
    if (!receipt) {
      return {
        content: [{
          type: 'text',
          text: `⚠️ Receipt "${receiptId}" not found. Receipts are stored in memory and may have expired.`
        }],
        isError: true
      };
    }
    
    const formatted = generator.formatReceipt(receipt);
    
    return {
      content: [{
        type: 'text',
        text: formatted
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to get receipt: ${error.message}`
      }],
      isError: true
    };
  }
}

module.exports = { name: 'get_receipt', schema, handler };