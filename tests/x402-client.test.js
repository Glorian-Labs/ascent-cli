/**
 * X402 Client Reliability Tests
 * Tests for retry logic, circuit breaker, multi-facilitator support, and monitoring
 */

const {
  X402Client,
  Logger,
  CircuitBreaker,
  TransactionMonitor,
  FacilitatorManager,
  withRetry,
  TransactionStatus,
  TEST_WALLETS
} = require('../lib/x402-client');

// Mock @aptos-labs/ts-sdk
jest.mock('@aptos-labs/ts-sdk', () => ({
  Account: {
    fromPrivateKey: jest.fn(() => ({
      accountAddress: { toString: () => '0xtestaddress' }
    }))
  },
  Ed25519PrivateKey: jest.fn(),
  Aptos: jest.fn(() => ({
    getAccountCoinsData: jest.fn(),
    transaction: {
      build: { simple: jest.fn() },
      sign: jest.fn(),
      getTransactionByHash: jest.fn()
    }
  })),
  AptosConfig: jest.fn(),
  Network: { TESTNET: 'testnet', MAINNET: 'mainnet' }
}));

// Mock node-fetch
const mockFetch = jest.fn();
jest.mock('node-fetch', () => jest.fn(() => mockFetch()));

describe('Logger', () => {
  let logger;
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should log at correct levels', () => {
    logger = new Logger({ level: 'info' });
    
    logger.error('error message');
    logger.warn('warn message');
    logger.info('info message');
    logger.debug('debug message');
    
    expect(consoleSpy.error).toHaveBeenCalled();
    expect(consoleSpy.warn).toHaveBeenCalled();
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('INFO: info message'),
      {}
    );
    // Debug should not be called at info level
    expect(consoleSpy.log).not.toHaveBeenCalledWith(
      expect.stringContaining('DEBUG'),
      expect.anything()
    );
  });

  test('should include metadata in logs', () => {
    logger = new Logger({ level: 'debug' });
    
    logger.info('test', { key: 'value' });
    
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('INFO: test'),
      { key: 'value' }
    );
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should succeed on first attempt', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await withRetry(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('should retry on retryable errors', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
      .mockResolvedValue('success');
    
    const onRetry = jest.fn();
    const promise = withRetry(operation, { maxRetries: 3, baseDelay: 1000, onRetry });
    
    // Fast-forward past delays
    jest.advanceTimersByTime(1000); // First retry
    jest.advanceTimersByTime(2000); // Second retry
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  test('should not retry on non-retryable errors', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Invalid input'));
    
    await expect(withRetry(operation)).rejects.toThrow('Invalid input');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('should throw after max retries exceeded', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('ECONNRESET'));
    
    const promise = withRetry(operation, { maxRetries: 2, baseDelay: 100 });
    
    jest.advanceTimersByTime(100);
    jest.advanceTimersByTime(200);
    
    await expect(promise).rejects.toThrow('ECONNRESET');
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  test('should respect maxDelay', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue('success');
    
    const promise = withRetry(operation, { maxRetries: 4, baseDelay: 1000, maxDelay: 3000 });
    
    // Delays should be: 1000, 2000, 3000, 3000 (capped)
    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(2000);
    jest.advanceTimersByTime(3000);
    jest.advanceTimersByTime(3000);
    
    await promise;
    
    expect(operation).toHaveBeenCalledTimes(5);
  });
});

describe('CircuitBreaker', () => {
  test('should allow operations when CLOSED', async () => {
    const cb = new CircuitBreaker();
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await cb.execute(operation);
    
    expect(result).toBe('success');
    expect(cb.state).toBe('CLOSED');
  });

  test('should open after threshold failures', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3 });
    const operation = jest.fn().mockRejectedValue(new Error('fail'));
    
    // Fail 3 times
    await expect(cb.execute(operation)).rejects.toThrow('fail');
    await expect(cb.execute(operation)).rejects.toThrow('fail');
    await expect(cb.execute(operation)).rejects.toThrow('fail');
    
    expect(cb.state).toBe('OPEN');
  });

  test('should reject operations when OPEN', async () => {
    const cb = new CircuitBreaker();
    cb.state = 'OPEN';
    cb.lastFailureTime = Date.now();
    
    const operation = jest.fn().mockResolvedValue('success');
    
    await expect(cb.execute(operation)).rejects.toThrow('Circuit breaker');
    expect(operation).not.toHaveBeenCalled();
  });

  test('should transition to HALF_OPEN after timeout', async () => {
    jest.useFakeTimers();
    const cb = new CircuitBreaker({ resetTimeout: 5000 });
    cb.state = 'OPEN';
    cb.lastFailureTime = Date.now();
    
    jest.advanceTimersByTime(6000);
    
    const operation = jest.fn().mockResolvedValue('success');
    await cb.execute(operation);
    
    expect(cb.state).toBe('CLOSED');
    jest.useRealTimers();
  });

  test('should close on success', async () => {
    const cb = new CircuitBreaker();
    cb.failures = 2;
    
    const operation = jest.fn().mockResolvedValue('success');
    await cb.execute(operation);
    
    expect(cb.state).toBe('CLOSED');
    expect(cb.failures).toBe(0);
  });

  test('should return state info', () => {
    const cb = new CircuitBreaker({ name: 'test-cb' });
    cb.failures = 2;
    
    const state = cb.getState();
    
    expect(state.name).toBe('test-cb');
    expect(state.state).toBe('CLOSED');
    expect(state.failures).toBe(2);
  });
});

describe('TransactionMonitor', () => {
  let monitor;
  let mockAptos;

  beforeEach(() => {
    jest.useFakeTimers();
    mockAptos = {
      transaction: {
        getTransactionByHash: jest.fn()
      }
    };
    monitor = new TransactionMonitor(mockAptos, { pollInterval: 1000, maxWaitTime: 30000 });
  });

  afterEach(() => {
    monitor.stop();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should track transactions', () => {
    const emitSpy = jest.spyOn(monitor, 'emit');
    
    monitor.track('0xhash1', { url: 'test' });
    
    expect(monitor.getPendingCount()).toBe(1);
    expect(emitSpy).toHaveBeenCalledWith('tracked', {
      hash: '0xhash1',
      metadata: { url: 'test' }
    });
  });

  test('should detect confirmed transactions', async () => {
    const confirmedTx = {
      type: 'user_transaction',
      success: true,
      version: '12345',
      vm_status: 'Executed successfully'
    };
    mockAptos.transaction.getTransactionByHash.mockResolvedValue(confirmedTx);
    
    const emitSpy = jest.spyOn(monitor, 'emit');
    monitor.track('0xhash1', { url: 'test' });
    monitor.start();
    
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    
    expect(emitSpy).toHaveBeenCalledWith('confirmed', expect.objectContaining({
      hash: '0xhash1',
      status: TransactionStatus.CONFIRMED
    }));
    expect(monitor.getPendingCount()).toBe(0);
  });

  test('should detect failed transactions', async () => {
    const failedTx = {
      type: 'user_transaction',
      success: false,
      vm_status: 'Move abort'
    };
    mockAptos.transaction.getTransactionByHash.mockResolvedValue(failedTx);
    
    const emitSpy = jest.spyOn(monitor, 'emit');
    monitor.track('0xhash1', { url: 'test' });
    monitor.start();
    
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    
    expect(emitSpy).toHaveBeenCalledWith('failed', expect.objectContaining({
      hash: '0xhash1',
      status: TransactionStatus.FAILED,
      error: 'Move abort'
    }));
  });

  test('should timeout transactions', async () => {
    mockAptos.transaction.getTransactionByHash.mockRejectedValue(new Error('not found'));
    
    const emitSpy = jest.spyOn(monitor, 'emit');
    monitor.track('0xhash1', { url: 'test' });
    monitor.start();
    
    // Advance past maxWaitTime
    jest.advanceTimersByTime(31000);
    await Promise.resolve();
    
    expect(emitSpy).toHaveBeenCalledWith('timeout', expect.objectContaining({
      hash: '0xhash1',
      status: TransactionStatus.TIMEOUT
    }));
  });

  test('should return stats', () => {
    monitor.track('0xhash1', {});
    monitor.track('0xhash2', {});
    monitor.start();
    
    const stats = monitor.getStats();
    
    expect(stats.pending).toBe(2);
    expect(stats.isRunning).toBe(true);
  });
});

describe('FacilitatorManager', () => {
  let manager;
  let fetchSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation();
  });

  afterEach(() => {
    if (manager) manager.stop();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('should create single facilitator from string', () => {
    manager = new FacilitatorManager('http://localhost:4022');
    
    expect(manager.facilitators).toHaveLength(1);
    expect(manager.facilitators[0].url).toBe('http://localhost:4022');
  });

  test('should create multiple facilitators from array', () => {
    manager = new FacilitatorManager([
      'http://primary:4022',
      'http://backup1:4022',
      'http://backup2:4022'
    ]);
    
    expect(manager.facilitators).toHaveLength(3);
    expect(manager.facilitators[0].priority).toBe(0);
    expect(manager.facilitators[1].priority).toBe(1);
  });

  test('should execute on healthy facilitator', async () => {
    manager = new FacilitatorManager('http://localhost:4022');
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await manager.execute(operation);
    
    expect(result.result).toBe('success');
    expect(result.facilitator).toBe('http://localhost:4022');
  });

  test('should failover to next facilitator', async () => {
    manager = new FacilitatorManager([
      'http://primary:4022',
      'http://backup:4022'
    ]);
    
    // Mark primary as unhealthy
    manager.facilitators[0].healthy = false;
    
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await manager.execute(operation);
    
    expect(result.facilitator).toBe('http://backup:4022');
  });

  test('should throw when all facilitators fail', async () => {
    manager = new FacilitatorManager([
      'http://primary:4022',
      'http://backup:4022'
    ]);
    
    const operation = jest.fn().mockRejectedValue(new Error('fail'));
    
    await expect(manager.execute(operation)).rejects.toThrow('All facilitators failed');
  });

  test('should mark facilitator unhealthy after max errors', async () => {
    manager = new FacilitatorManager(['http://localhost:4022'], { maxErrors: 2 });
    
    const operation = jest.fn().mockRejectedValue(new Error('fail'));
    
    await expect(manager.execute(operation)).rejects.toThrow();
    await expect(manager.execute(operation)).rejects.toThrow();
    
    expect(manager.facilitators[0].healthy).toBe(false);
  });

  test('should return status for all facilitators', () => {
    manager = new FacilitatorManager([
      'http://primary:4022',
      'http://backup:4022'
    ]);
    
    const status = manager.getStatus();
    
    expect(status).toHaveLength(2);
    expect(status[0]).toHaveProperty('url');
    expect(status[0]).toHaveProperty('healthy');
    expect(status[0]).toHaveProperty('errorCount');
    expect(status[0]).toHaveProperty('circuitBreaker');
  });
});

describe('X402Client', () => {
  let client;

  beforeEach(() => {
    jest.useFakeTimers();
    client = new X402Client({
      enableMonitoring: false,
      logLevel: 'error'
    });
  });

  afterEach(() => {
    if (client) client.close();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should initialize with default config', () => {
    expect(client.network).toBe('aptos:2');
    expect(client.monitor).toBeDefined();
    expect(client.facilitatorManager).toBeDefined();
  });

  test('should initialize with custom config', () => {
    const customClient = new X402Client({
      network: 'aptos:1',
      facilitatorUrls: ['http://f1:4022', 'http://f2:4022'],
      logLevel: 'debug',
      maxRetries: 5
    });
    
    expect(customClient.network).toBe('aptos:1');
    expect(customClient.facilitatorManager.facilitators).toHaveLength(2);
    expect(customClient.retryOptions.maxRetries).toBe(5);
    
    customClient.close();
  });

  test('should emit events from monitor', (done) => {
    client = new X402Client({ enableMonitoring: true, logLevel: 'error' });
    
    client.on('transactionConfirmed', (tx) => {
      expect(tx.hash).toBe('0xtest');
      done();
    });
    
    client.monitor.emit('confirmed', { hash: '0xtest' });
  });

  test('should emit retry events', (done) => {
    client.on('retry', (data) => {
      expect(data.attempt).toBe(1);
      done();
    });
    
    client.retryOptions.onRetry(1, 3, 1000, new Error('test'));
  });

  test('should return stats', () => {
    const stats = client.getStats();
    
    expect(stats).toHaveProperty('network');
    expect(stats).toHaveProperty('pendingTransactions');
    expect(stats).toHaveProperty('facilitators');
  });
});

describe('Integration Tests', () => {
  test('TEST_WALLETS should be properly formatted', () => {
    expect(TEST_WALLETS).toHaveLength(5);
    
    TEST_WALLETS.forEach(wallet => {
      expect(wallet).toHaveProperty('name');
      expect(wallet).toHaveProperty('key');
      expect(wallet).toHaveProperty('address');
      expect(wallet.key).toMatch(/^0x[0-9a-fA-F]+$/);
      expect(wallet.address).toMatch(/^0x[0-9a-fA-F]+$/);
    });
  });
});
