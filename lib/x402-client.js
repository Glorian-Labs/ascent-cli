/**
 * Hardened x402 Client for Aptos - Production Ready
 * Bypasses the broken @rvk_rishikesh client library
 * 
 * Features:
 * - Exponential backoff retry mechanism
 * - Transaction monitoring (pending, confirmed, failed)
 * - Multi-facilitator support (primary + failover)
 * - Batch payment support
 * - Comprehensive logging
 * - Circuit breaker pattern for resilience
 */

const { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const EventEmitter = require('events');

const USDC_ASSET = '0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832';
const DEFAULT_FACILITATOR = 'http://localhost:4022';

/**
 * Transaction status enum
 */
const TransactionStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  TIMEOUT: 'timeout'
};

/**
 * Logger utility with levels
 */
class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
  }

  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  _timestamp() {
    return new Date().toISOString();
  }

  error(message, meta = {}) {
    if (this._shouldLog('error')) {
      console.error(`[${this._timestamp()}] ERROR: ${message}`, meta);
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog('warn')) {
      console.warn(`[${this._timestamp()}] WARN: ${message}`, meta);
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog('info')) {
      console.log(`[${this._timestamp()}] INFO: ${message}`, meta);
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog('debug')) {
      console.log(`[${this._timestamp()}] DEBUG: ${message}`, meta);
    }
  }
}

/**
 * Retry utility with exponential backoff
 */
async function withRetry(operation, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.baseDelay || 1000;
  const maxDelay = options.maxDelay || 30000;
  const retryableErrors = options.retryableErrors || ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'NETWORK_ERROR', 'ENOTFOUND', 'EAI_AGAIN'];
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const isRetryable = retryableErrors.some(errCode => 
        error.message?.includes(errCode) || 
        error.code === errCode ||
        error.type === errCode
      );
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      if (options.onRetry) {
        options.onRetry(attempt + 1, maxRetries, delay, error);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Circuit breaker for external service calls
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.name = options.name || 'CircuitBreaker';
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.failures = 0;
      } else {
        throw new Error(`Circuit breaker '${this.name}' is OPEN`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Transaction monitor for tracking payment status
 */
class TransactionMonitor extends EventEmitter {
  constructor(aptos, options = {}) {
    super();
    this.aptos = aptos;
    this.pendingTransactions = new Map();
    this.pollInterval = options.pollInterval || 2000;
    this.maxWaitTime = options.maxWaitTime || 120000;
    this.logger = options.logger || new Logger({ level: 'info' });
    this.isRunning = false;
    this.pollCount = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._poll();
    this.logger.info('Transaction monitor started');
  }

  stop() {
    this.isRunning = false;
    this.logger.info('Transaction monitor stopped');
  }

  track(transactionHash, metadata = {}) {
    this.pendingTransactions.set(transactionHash, {
      hash: transactionHash,
      status: TransactionStatus.PENDING,
      startTime: Date.now(),
      pollCount: 0,
      metadata
    });
    this.emit('tracked', { hash: transactionHash, metadata });
    this.logger.info(`Tracking transaction: ${transactionHash}`, metadata);
    return transactionHash;
  }

  async _poll() {
    while (this.isRunning) {
      await this._checkPendingTransactions();
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
  }

  async _checkPendingTransactions() {
    const now = Date.now();
    this.pollCount++;
    
    for (const [hash, tx] of this.pendingTransactions) {
      try {
        tx.pollCount++;
        
        // Check for timeout
        if (now - tx.startTime > this.maxWaitTime) {
          tx.status = TransactionStatus.TIMEOUT;
          this.pendingTransactions.delete(hash);
          this.emit('timeout', tx);
          this.logger.warn(`Transaction timed out: ${hash}`, { 
            duration: now - tx.startTime,
            polls: tx.pollCount 
          });
          continue;
        }

        // Check transaction status
        const status = await this.aptos.transaction.getTransactionByHash({ transactionHash: hash });
        
        if (status.type === 'user_transaction') {
          if (status.success) {
            tx.status = TransactionStatus.CONFIRMED;
            tx.confirmation = status;
            tx.duration = now - tx.startTime;
            this.pendingTransactions.delete(hash);
            this.emit('confirmed', tx);
            this.logger.info(`Transaction confirmed: ${hash}`, { 
              version: status.version,
              duration: tx.duration,
              polls: tx.pollCount
            });
          } else {
            tx.status = TransactionStatus.FAILED;
            tx.error = status.vm_status;
            tx.duration = now - tx.startTime;
            this.pendingTransactions.delete(hash);
            this.emit('failed', tx);
            this.logger.error(`Transaction failed: ${hash}`, { 
              vmStatus: status.vm_status,
              duration: tx.duration,
              polls: tx.pollCount
            });
          }
        }
      } catch (error) {
        // Transaction not found yet or error fetching - keep pending
        if (error.message?.includes('not found')) {
          this.logger.debug(`Transaction ${hash} not yet on chain`, { 
            polls: tx.pollCount 
          });
        } else {
          this.logger.debug(`Transaction ${hash} poll error`, { 
            error: error.message,
            polls: tx.pollCount
          });
        }
      }
    }
  }

  getPendingCount() {
    return this.pendingTransactions.size;
  }

  getStats() {
    return {
      pending: this.getPendingCount(),
      isRunning: this.isRunning,
      totalPolls: this.pollCount
    };
  }

  getPendingTransactions() {
    return Array.from(this.pendingTransactions.values());
  }
}

/**
 * Facilitator manager with primary and failover support
 */
class FacilitatorManager {
  constructor(facilitatorUrls, options = {}) {
    this.facilitators = Array.isArray(facilitatorUrls) 
      ? facilitatorUrls.map((url, index) => ({
          url,
          priority: index,
          healthy: true,
          lastError: null,
          errorCount: 0,
          successCount: 0,
          circuitBreaker: new CircuitBreaker({ 
            name: `facilitator-${index}`,
            ...(options.circuitBreakerOptions || {})
          })
        }))
      : [{ 
          url: facilitatorUrls, 
          priority: 0, 
          healthy: true, 
          successCount: 0,
          circuitBreaker: new CircuitBreaker({ name: 'facilitator-0' })
        }];
    
    this.healthCheckInterval = options.healthCheckInterval || 30000;
    this.maxErrors = options.maxErrors || 5;
    this.logger = options.logger || new Logger({ level: 'info' });
    this.currentIndex = 0;
    this.healthCheckTimer = null;
    
    this._startHealthChecks();
  }

  _startHealthChecks() {
    this._healthCheck(); // Run immediately
    this.healthCheckTimer = setInterval(() => this._healthCheck(), this.healthCheckInterval);
  }

  stop() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  async _healthCheck() {
    for (const facilitator of this.facilitators) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${facilitator.url}/health`, { 
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        const wasHealthy = facilitator.healthy;
        facilitator.healthy = response.ok;
        
        if (response.ok && facilitator.errorCount > 0) {
          facilitator.errorCount = 0;
          facilitator.lastError = null;
          this.logger.info(`Facilitator recovered: ${facilitator.url}`);
        }
        
        if (!response.ok && wasHealthy) {
          this.logger.warn(`Facilitator health check failed: ${facilitator.url}`, { 
            status: response.status 
          });
        }
      } catch (error) {
        if (facilitator.healthy) {
          this.logger.warn(`Facilitator unreachable: ${facilitator.url}`, { 
            error: error.message 
          });
        }
        facilitator.healthy = false;
      }
    }
  }

  async execute(operation) {
    const sortedFacilitators = [...this.facilitators]
      .filter(f => f.healthy && f.circuitBreaker.state !== 'OPEN')
      .sort((a, b) => a.priority - b.priority);
    
    if (sortedFacilitators.length === 0) {
      throw new Error('No healthy facilitators available');
    }

    const errors = [];
    
    for (const facilitator of sortedFacilitators) {
      try {
        const result = await facilitator.circuitBreaker.execute(() => operation(facilitator.url));
        facilitator.successCount++;
        return { result, facilitator: facilitator.url };
      } catch (error) {
        facilitator.errorCount++;
        facilitator.lastError = error.message;
        
        if (facilitator.errorCount >= this.maxErrors) {
          facilitator.healthy = false;
          this.logger.warn(`Facilitator marked unhealthy: ${facilitator.url}`, { 
            error: error.message 
          });
        }
        
        errors.push({ url: facilitator.url, error: error.message });
      }
    }
    
    throw new Error(`All facilitators failed: ${JSON.stringify(errors)}`);
  }

  getStatus() {
    return this.facilitators.map(f => ({
      url: f.url,
      healthy: f.healthy,
      errorCount: f.errorCount,
      successCount: f.successCount,
      lastError: f.lastError,
      circuitBreaker: f.circuitBreaker.getState()
    }));
  }
}

/**
 * Production-ready X402Client
 */
class X402Client extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.network = config.network || 'aptos:2';
    this.aptosConfig = new AptosConfig({ 
      network: this.network === 'aptos:2' ? Network.TESTNET : Network.MAINNET 
    });
    this.aptos = new Aptos(this.aptosConfig);
    
    // Logging
    this.logger = new Logger({ level: config.logLevel || 'info' });
    
    // Facilitator management
    const facilitatorUrls = config.facilitatorUrls || config.facilitatorUrl || DEFAULT_FACILITATOR;
    this.facilitatorManager = new FacilitatorManager(facilitatorUrls, {
      logger: this.logger,
      circuitBreakerOptions: config.circuitBreakerOptions
    });
    
    // Transaction monitoring
    this.monitor = new TransactionMonitor(this.aptos, {
      logger: this.logger,
      pollInterval: config.pollInterval,
      maxWaitTime: config.maxWaitTime
    });
    
    // Retry configuration
    this.retryOptions = {
      maxRetries: config.maxRetries || 3,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      onRetry: (attempt, maxRetries, delay, error) => {
        this.logger.warn(`Retry ${attempt}/${maxRetries} after ${delay}ms`, { 
          error: error.message 
        });
        this.emit('retry', { attempt, maxRetries, delay, error });
      }
    };
    
    // Start monitoring
    if (config.enableMonitoring !== false) {
      this.monitor.start();
    }
    
    // Event forwarding from monitor
    this.monitor.on('confirmed', (tx) => this.emit('transactionConfirmed', tx));
    this.monitor.on('failed', (tx) => this.emit('transactionFailed', tx));
    this.monitor.on('timeout', (tx) => this.emit('transactionTimeout', tx));
    
    this.logger.info('X402Client initialized', { network: this.network });
  }

  /**
   * Check USDC balance for an address
   */
  async checkBalance(address) {
    return withRetry(async () => {
      try {
        const coinsData = await this.aptos.getAccountCoinsData({
          accountAddress: address
        });
        
        const usdcCoin = coinsData.find(c => 
          c.asset_type === USDC_ASSET ||
          c.metadata?.asset_type === USDC_ASSET
        );
        
        const result = {
          address,
          balance: usdcCoin ? usdcCoin.amount.toString() : '0',
          asset: USDC_ASSET
        };
        
        this.logger.debug('Balance checked', result);
        return result;
      } catch (error) {
        this.logger.error('Balance check failed', { address, error: error.message });
        throw error;
      }
    }, this.retryOptions);
  }

  /**
   * Create payment payload for a protected resource
   */
  async createPaymentPayload(privateKeyHex, requirements) {
    return withRetry(async () => {
      const account = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(privateKeyHex)
      });

      this.logger.debug('Creating payment payload', { 
        address: account.accountAddress.toString(),
        amount: requirements.amount 
      });

      // Build transaction
      const rawTransaction = await this.aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: '0x1::primary_fungible_store::transfer',
          typeArguments: ['0x1::fungible_asset::Metadata'],
          functionArguments: [
            requirements.asset || USDC_ASSET,
            requirements.payTo,
            requirements.amount
          ]
        }
      });

      // Sign transaction
      const senderAuthenticator = this.aptos.transaction.sign({
        signer: account,
        transaction: rawTransaction
      });

      // Create payload in format facilitator expects
      const transactionBytes = Array.from(rawTransaction.rawTransaction.bcsToBytes());
      const authenticatorBytes = Array.from(senderAuthenticator.bcsToBytes());
      
      const aptosPaymentPayload = {
        transaction: transactionBytes,
        senderAuthenticator: authenticatorBytes
      };

      return {
        accepted: {
          scheme: "exact",
          network: this.network
        },
        payload: {
          transaction: Buffer.from(JSON.stringify(aptosPaymentPayload)).toString('base64')
        }
      };
    }, this.retryOptions);
  }

  /**
   * Verify payment with facilitator
   */
  async verifyPayment(paymentPayload, paymentRequirements) {
    return this.facilitatorManager.execute(async (facilitatorUrl) => {
      this.logger.debug('Verifying payment', { facilitator: facilitatorUrl });
      
      const verifyRes = await fetch(`${facilitatorUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPayload, paymentRequirements })
      });

      if (!verifyRes.ok) {
        throw new Error(`Verify failed with status ${verifyRes.status}`);
      }

      return await verifyRes.json();
    });
  }

  /**
   * Settle payment with facilitator
   */
  async settlePayment(paymentPayload, paymentRequirements) {
    return this.facilitatorManager.execute(async (facilitatorUrl) => {
      this.logger.debug('Settling payment', { facilitator: facilitatorUrl });
      
      const settleRes = await fetch(`${facilitatorUrl}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPayload, paymentRequirements })
      });

      if (!settleRes.ok) {
        throw new Error(`Settle failed with status ${settleRes.status}`);
      }

      return await settleRes.json();
    });
  }

  /**
   * Pay for a protected resource
   * Returns { success, transaction, response, facilitator }
   */
  async payForResource(url, privateKeyHex, options = {}) {
    const startTime = Date.now();
    const account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKeyHex)
    });

    this.logger.info('Starting payment flow', { 
      url, 
      address: account.accountAddress.toString() 
    });

    try {
      // Step 1: Get 402 response with requirements
      this.logger.debug('Fetching payment requirements');
      const initResponse = await withRetry(async () => {
        const response = await fetch(url, {
          method: options.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options.body || {})
        });
        return response;
      }, this.retryOptions);

      if (initResponse.status !== 402) {
        this.logger.info('Resource accessible without payment', { status: initResponse.status });
        return {
          success: initResponse.ok,
          status: initResponse.status,
          response: await initResponse.json().catch(() => null),
          duration: Date.now() - startTime
        };
      }

      // Parse requirements
      const paymentRequired = initResponse.headers.get('PAYMENT-REQUIRED');
      if (!paymentRequired) {
        throw new Error('Missing PAYMENT-REQUIRED header in 402 response');
      }
      
      let requirements;
      try {
        requirements = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
      } catch (e) {
        throw new Error(`Failed to parse payment requirements: ${e.message}`);
      }
      
      if (!requirements.accepts || !requirements.accepts[0]) {
        throw new Error('Invalid payment requirements: missing accepts array');
      }
      
      const accept = requirements.accepts[0];

      this.logger.debug('Payment requirements received', { 
        amount: accept.amount,
        asset: accept.asset 
      });

      // Step 2: Create payment payload
      const paymentPayload = await this.createPaymentPayload(privateKeyHex, {
        amount: accept.amount,
        asset: accept.asset,
        payTo: accept.payTo
      });

      const paymentRequirements = {
        scheme: "exact",
        network: this.network,
        amount: accept.amount,
        asset: accept.asset,
        payTo: accept.payTo,
        extra: accept.extra || { sponsored: true }
      };

      // Step 3: Verify with facilitator (with failover)
      this.logger.debug('Verifying payment with facilitator');
      const { result: verifyResult, facilitator } = await this.verifyPayment(paymentPayload, paymentRequirements);
      
      if (!verifyResult.isValid) {
        this.logger.error('Payment verification failed', { reason: verifyResult.invalidReason });
        return {
          success: false,
          error: 'verify_failed',
          reason: verifyResult.invalidReason,
          payer: verifyResult.payer,
          duration: Date.now() - startTime
        };
      }

      // Step 4: Settle with facilitator
      this.logger.debug('Settling payment');
      const { result: settleResult } = await this.settlePayment(paymentPayload, paymentRequirements);
      
      if (!settleResult.success) {
        this.logger.error('Payment settlement failed', { reason: settleResult.errorReason });
        return {
          success: false,
          error: 'settle_failed',
          reason: settleResult.errorReason,
          duration: Date.now() - startTime
        };
      }

      // Track transaction
      this.monitor.track(settleResult.transaction, {
        url,
        amount: accept.amount,
        payer: settleResult.payer
      });

      // Step 5: Call resource with payment signature
      this.logger.debug('Calling resource with payment signature');
      const paymentSignature = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      
      const finalResponse = await withRetry(async () => {
        return fetch(url, {
          method: options.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PAYMENT-SIGNATURE': paymentSignature
          },
          body: JSON.stringify(options.body || {})
        });
      }, this.retryOptions);

      const duration = Date.now() - startTime;
      this.logger.info('Payment completed successfully', { 
        transaction: settleResult.transaction,
        duration 
      });

      return {
        success: finalResponse.ok,
        status: finalResponse.status,
        transaction: settleResult.transaction,
        payer: settleResult.payer,
        response: await finalResponse.json().catch(() => null),
        facilitator,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Payment flow failed', { error: error.message, duration });
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        duration
      };
    }
  }

  /**
   * Execute batch payments efficiently
   * Returns array of results
   */
  async executeBatch(payments, options = {}) {
    this.logger.info('Starting batch payment execution', { count: payments.length });
    
    const concurrency = options.concurrency || 3;
    const results = [];
    const queue = payments.map((p, index) => ({ ...p, index }));
    
    const executeNext = async () => {
      while (queue.length > 0) {
        const payment = queue.shift();
        const paymentStartTime = Date.now();
        try {
          const result = await this.payForResource(
            payment.url,
            payment.privateKey,
            payment.options || {}
          );
          results.push({ ...result, index: payment.index, paymentDuration: Date.now() - paymentStartTime });
          this.emit('batchPaymentComplete', { index: payment.index, result });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error.message, 
            index: payment.index,
            paymentDuration: Date.now() - paymentStartTime
          });
          this.emit('batchPaymentError', { index: payment.index, error });
        }
      }
    };

    // Execute with concurrency limit
    await Promise.all(Array(concurrency).fill(null).map(executeNext));
    
    // Sort by index
    results.sort((a, b) => a.index - b.index);
    
    const successCount = results.filter(r => r.success).length;
    this.logger.info('Batch payment complete', { 
      total: payments.length,
      successful: successCount,
      failed: payments.length - successCount
    });
    
    return results;
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionHash) {
    try {
      const status = await this.aptos.transaction.getTransactionByHash({ transactionHash });
      return {
        hash: transactionHash,
        status: status.success ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
        version: status.version,
        vmStatus: status.vm_status,
        timestamp: status.timestamp,
        gasUsed: status.gas_used,
        success: status.success
      };
    } catch (error) {
      if (error.message?.includes('not found')) {
        return {
          hash: transactionHash,
          status: TransactionStatus.PENDING
        };
      }
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(transactionHash, timeout = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await this.getTransactionStatus(transactionHash);
      
      if (status.status === TransactionStatus.CONFIRMED) {
        return status;
      }
      
      if (status.status === TransactionStatus.FAILED) {
        throw new Error(`Transaction failed: ${status.vmStatus}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Transaction confirmation timeout');
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      network: this.network,
      pendingTransactions: this.monitor.getStats(),
      facilitators: this.facilitatorManager.getStatus()
    };
  }

  /**
   * Close the client and cleanup resources
   */
  close() {
    this.monitor.stop();
    this.facilitatorManager.stop();
    this.logger.info('X402Client closed');
  }
}

// Test wallets for development and testing
const TEST_WALLETS = [
  { 
    name: 'Test Wallet 1', 
    key: '0xFEE281AD1736B2B85FB322A312DE6D2176617A4C25259D189DD5E43440D498DE',
    address: '0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0'
  },
  { 
    name: 'Wallet 2', 
    key: '0x27E494815376D492A64382825DB5A19F9DEC59B2F0E63CBD395F421CB70A8E0A',
    address: '0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4'
  },
  { 
    name: 'Wallet 3', 
    key: '0x9A51D0A13590B93F8CDE82724976D6B61D826C542D5C640FBFB0F2C6D274BE9F',
    address: '0x924c2e983753bb29b45ae9b4036d48861f204da096b36af710c95d1742b05ad4'
  },
  { 
    name: 'Wallet 4', 
    key: '0x8A5B2E6F1C3D9A7B4E2F5C8D1A6B3E9F2C5D8A1B4E7F0C3D6A9B2E5F8C1D4A70',
    address: '0xf1697d22257fd39653319eb3a2ee23fca2ca99b26f7fc79090249fbfbc401e03'
  },
  { 
    name: 'Wallet 5', 
    key: '0xB3E7A1F4C8D2E5B9A6C3F0D8E1B4A7C2F5D8E1B4A7C0F3D6E9B2C5F8A1D4E7B0',
    address: '0x6cd199bbbc8bb3c17de4d2aebc2e75b4e9d7e3083188d987b597a3de8239df2a'
  }
];

/**
 * Check all test wallet balances
 */
async function checkAllWallets(config = {}) {
  const client = new X402Client(config);
  
  console.log('💰 Checking Test Wallet Balances...\n');
  
  let fundedCount = 0;
  
  for (const wallet of TEST_WALLETS) {
    try {
      const balance = await client.checkBalance(wallet.address);
      const hasFunds = parseInt(balance.balance) >= 10000; // At least 0.01 USDC
      
      if (hasFunds) fundedCount++;
      
      console.log(`${wallet.name}: ${wallet.address.slice(0, 20)}...`);
      console.log(`  Balance: ${balance.balance} USDC atomic units (${parseInt(balance.balance) / 1000000} USDC)`);
      console.log(`  Status: ${hasFunds ? '✅ Funded' : '❌ Empty'}`);
      console.log();
    } catch (error) {
      console.log(`${wallet.name}: ${wallet.address.slice(0, 20)}...`);
      console.log(`  Error checking balance: ${error.message}`);
      console.log();
    }
  }
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total Funded: ${fundedCount}/${TEST_WALLETS.length} wallets`);
  
  if (fundedCount === 0) {
    console.log('\n⚠️  ALL WALLETS ARE EMPTY!');
    console.log('Get testnet USDC at: https://faucet.circle.com/');
    console.log('\nOr use the Aptos CLI:');
    console.log('aptos account fund-with-faucet --account <address>');
  }
  
  client.close();
  return fundedCount;
}

module.exports = { 
  X402Client, 
  TEST_WALLETS, 
  checkAllWallets,
  TransactionStatus,
  Logger,
  CircuitBreaker,
  TransactionMonitor,
  FacilitatorManager,
  withRetry
};

// Run balance check if called directly
if (require.main === module) {
  checkAllWallets().catch(console.error);
}
