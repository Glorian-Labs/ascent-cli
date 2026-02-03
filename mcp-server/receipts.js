/**
 * Payment Receipt Generator
 * Creates detailed receipts for x402 payments
 */

const crypto = require('crypto');

class ReceiptGenerator {
  constructor() {
    this.receipts = new Map();
  }

  /**
   * Generate a receipt for a payment
   */
  generateReceipt(paymentData) {
    const receiptId = this.generateReceiptId(paymentData);
    const timestamp = new Date().toISOString();
    
    const receipt = {
      receiptId,
      version: '1.0.0',
      timestamp,
      payment: {
        transactionHash: paymentData.transactionHash || paymentData.transaction,
        payer: paymentData.payer,
        payee: paymentData.payee,
        amount: paymentData.amount,
        asset: paymentData.asset,
        network: paymentData.network || 'aptos:2'
      },
      resource: {
        url: paymentData.resourceUrl,
        method: paymentData.method || 'POST'
      },
      verification: {
        verifiedAt: timestamp,
        verifiedBy: paymentData.facilitator || 'x402-facilitator',
        signature: this.generateSignature(paymentData)
      }
    };
    
    this.receipts.set(receiptId, receipt);
    return receipt;
  }

  /**
   * Generate unique receipt ID
   */
  generateReceiptId(paymentData) {
    const data = `${paymentData.transactionHash || paymentData.transaction}:${paymentData.payer}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 32);
  }

  /**
   * Generate signature for receipt integrity
   */
  generateSignature(paymentData) {
    const data = JSON.stringify({
      tx: paymentData.transactionHash || paymentData.transaction,
      payer: paymentData.payer,
      amount: paymentData.amount,
      timestamp: Date.now()
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get receipt by ID
   */
  getReceipt(receiptId) {
    return this.receipts.get(receiptId);
  }

  /**
   * Get all receipts for a payer
   */
  getReceiptsByPayer(payer) {
    return Array.from(this.receipts.values()).filter(r => r.payment.payer === payer);
  }

  /**
   * Format receipt for display
   */
  formatReceipt(receipt) {
    const amountUSDC = (parseInt(receipt.payment.amount) / 1000000).toFixed(6);
    
    return `
╔══════════════════════════════════════════════════════════╗
║                    PAYMENT RECEIPT                       ║
╠══════════════════════════════════════════════════════════╣
║ Receipt ID: ${receipt.receiptId.slice(0, 40).padEnd(40)} ║
║ Timestamp: ${receipt.timestamp.padEnd(41)} ║
╠══════════════════════════════════════════════════════════╣
║ PAYMENT DETAILS                                          ║
╠══════════════════════════════════════════════════════════╣
║ Amount:        ${amountUSDC.padEnd(10)} USDC                         ║
║ Asset:         ${receipt.payment.asset.slice(0, 42).padEnd(42)} ║
║ Network:       ${receipt.payment.network.padEnd(42)} ║
╠══════════════════════════════════════════════════════════╣
║ PARTICIPANTS                                             ║
╠══════════════════════════════════════════════════════════╣
║ Payer:  ${receipt.payment.payer.slice(0, 44).padEnd(44)} ║
║ Payee:  ${(receipt.payment.payee || 'N/A').slice(0, 44).padEnd(44)} ║
╠══════════════════════════════════════════════════════════╣
║ TRANSACTION                                              ║
╠══════════════════════════════════════════════════════════╣
║ Hash:   ${(receipt.payment.transactionHash || 'N/A').slice(0, 44).padEnd(44)} ║
╠══════════════════════════════════════════════════════════╣
║ VERIFICATION                                             ║
╠══════════════════════════════════════════════════════════╣
║ Verified By:  ${receipt.verification.verifiedBy.padEnd(39)} ║
║ Signature:    ${receipt.verification.signature.slice(0, 40).padEnd(40)} ║
╚══════════════════════════════════════════════════════════╝
`;
  }

  /**
   * Export receipt as JSON
   */
  exportReceipt(receiptId) {
    const receipt = this.receipts.get(receiptId);
    if (!receipt) return null;
    return JSON.stringify(receipt, null, 2);
  }

  /**
   * Validate receipt integrity
   */
  validateReceipt(receipt) {
    const expectedSignature = this.generateSignature({
      transactionHash: receipt.payment.transactionHash,
      payer: receipt.payment.payer,
      amount: receipt.payment.amount
    });
    
    return receipt.verification.signature === expectedSignature;
  }
}

module.exports = { ReceiptGenerator };