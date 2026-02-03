/**
 * Payment Request/Response Flow Handler
 * Manages the full lifecycle of x402 payments
 */

const { ReceiptGenerator } = require('./receipts');

class PaymentFlow {
  constructor(x402Client, config = {}) {
    this.client = x402Client;
    this.config = {
      maxAmount: config.maxPaymentAmount || '1.0',
      dailyBudget: config.dailyBudget || '10.0',
      requireConfirmation: config.requireConfirmation !== false,
      ...config
    };
    this.receiptGenerator = new ReceiptGenerator();
    this.dailySpend = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Step 1: Get payment requirements from a protected resource
   */
  async getRequirements(url, options = {}) {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const initResponse = await fetch(url, {
      method: options.method || 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body || {})
    });
    
    if (initResponse.status !== 402) {
      return {
        protected: false,
        status: initResponse.status,
        accessible: initResponse.ok,
        response: initResponse.ok ? await initResponse.json() : null
      };
    }
    
    const paymentRequired = initResponse.headers.get('PAYMENT-REQUIRED');
    if (!paymentRequired) {
      throw new Error('402 response received but no PAYMENT-REQUIRED header');
    }
    
    const requirements = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
    const accept = requirements.accepts[0];
    
    const requestId = this.generateRequestId();
    const flow = {
      requestId,
      url,
      method: options.method || 'POST',
      body: options.body,
      requirements: accept,
      rawRequirements: requirements,
      status: 'requirements_received',
      timestamp: Date.now()
    };
    
    this.pendingRequests.set(requestId, flow);
    
    return {
      protected: true,
      requestId,
      amount: accept.amount,
      amountUSDC: (parseInt(accept.amount) / 1000000).toFixed(6),
      asset: accept.asset,
      payTo: accept.payTo,
      scheme: accept.scheme,
      network: accept.network,
      extra: accept.extra
    };
  }

  /**
   * Step 2: Validate if payment is within budget
   */
  validatePayment(requestId, payerAddress) {
    const flow = this.pendingRequests.get(requestId);
    if (!flow) {
      throw new Error('Payment request not found or expired');
    }
    
    const amount = parseFloat(flow.requirements.amount) / 1000000;
    const maxAmount = parseFloat(this.config.maxAmount);
    const dailyBudget = parseFloat(this.config.dailyBudget);
    
    // Check per-payment limit
    if (amount > maxAmount) {
      return {
        valid: false,
        reason: `Amount ${amount} USDC exceeds maximum allowed ${maxAmount} USDC`,
        code: 'AMOUNT_EXCEEDS_MAX'
      };
    }
    
    // Check daily budget
    const spentToday = this.dailySpend.get(payerAddress) || 0;
    if (spentToday + amount > dailyBudget) {
      return {
        valid: false,
        reason: `Payment would exceed daily budget of ${dailyBudget} USDC (${spentToday} already spent)`,
        code: 'DAILY_BUDGET_EXCEEDED'
      };
    }
    
    return {
      valid: true,
      amount,
      remainingDaily: dailyBudget - spentToday
    };
  }

  /**
   * Step 3: Execute payment
   */
  async executePayment(requestId, privateKey, options = {}) {
    const flow = this.pendingRequests.get(requestId);
    if (!flow) {
      throw new Error('Payment request not found or expired');
    }
    
    // Update flow status
    flow.status = 'executing';
    flow.payerKey = '[REDACTED]';
    
    try {
      // Execute payment through x402 client
      const result = await this.client.payForResource(flow.url, privateKey, {
        method: flow.method,
        body: flow.body
      });
      
      if (!result.success) {
        flow.status = 'failed';
        flow.error = result.error || result.reason;
        return {
          success: false,
          requestId,
          error: result.error || result.reason,
          payer: result.payer
        };
      }
      
      // Update flow with success
      flow.status = 'completed';
      flow.transaction = result.transaction;
      flow.payer = result.payer;
      flow.response = result.response;
      
      // Track spending
      const amount = parseFloat(flow.requirements.amount) / 1000000;
      const currentSpend = this.dailySpend.get(result.payer) || 0;
      this.dailySpend.set(result.payer, currentSpend + amount);
      
      // Generate receipt
      const receipt = this.receiptGenerator.generateReceipt({
        transactionHash: result.transaction,
        payer: result.payer,
        payee: flow.requirements.payTo,
        amount: flow.requirements.amount,
        asset: flow.requirements.asset,
        network: flow.requirements.network,
        resourceUrl: flow.url,
        method: flow.method,
        facilitator: this.client.facilitatorUrl
      });
      
      return {
        success: true,
        requestId,
        transaction: result.transaction,
        payer: result.payer,
        receipt: receipt,
        receiptId: receipt.receiptId,
        response: result.response
      };
      
    } catch (error) {
      flow.status = 'error';
      flow.error = error.message;
      throw error;
    }
  }

  /**
   * Complete payment flow in one call
   */
  async pay(url, privateKey, options = {}) {
    // Step 1: Get requirements
    const requirements = await this.getRequirements(url, options);
    
    if (!requirements.protected) {
      return {
        success: true,
        protected: false,
        message: 'Resource is freely accessible',
        response: requirements.response
      };
    }
    
    // Step 2: Validate (if payer address provided)
    if (options.payerAddress) {
      const validation = this.validatePayment(requirements.requestId, options.payerAddress);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.reason,
          code: validation.code
        };
      }
    }
    
    // Step 3: Execute payment
    return await this.executePayment(requirements.requestId, privateKey, options);
  }

  /**
   * Get receipt by ID
   */
  getReceipt(receiptId) {
    return this.receiptGenerator.getReceipt(receiptId);
  }

  /**
   * Get daily spending for an address
   */
  getDailySpend(address) {
    return this.dailySpend.get(address) || 0;
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Get pending request status
   */
  getRequestStatus(requestId) {
    const flow = this.pendingRequests.get(requestId);
    if (!flow) return null;
    
    return {
      requestId,
      status: flow.status,
      url: flow.url,
      amount: flow.requirements?.amount,
      timestamp: flow.timestamp
    };
  }
}

module.exports = { PaymentFlow };