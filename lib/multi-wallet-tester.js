/**
 * Multi-Wallet Tester for Ascent CLI
 * Stress test x402 payments with multiple wallets
 */

const { X402Client, TEST_WALLETS } = require('./x402-client');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const gradient = require('gradient-string').default;

class MultiWalletTester {
  constructor() {
    this.client = new X402Client();
  }

  /**
   * Check balances for all test wallets
   */
  async checkBalances() {
    console.log(`\n💰 ${gradient('#9A4DFF', '#00F5FF')('Ascent Wallet Balance Check')}\n`);
    
    const table = new Table({
      head: [chalk.bold('Wallet'), chalk.bold('Address'), chalk.bold('USDC Balance'), chalk.bold('Status')],
      colWidths: [20, 28, 18, 12]
    });

    let fundedCount = 0;

    for (const wallet of TEST_WALLETS) {
      const spinner = ora(`Checking ${wallet.name}...`).start();
      
      try {
        const balance = await this.client.checkBalance(wallet.address);
        const usdcAmount = parseInt(balance.balance) / 1000000;
        const hasFunds = parseInt(balance.balance) >= 10000;
        
        if (hasFunds) fundedCount++;
        
        spinner.stop();
        
        table.push([
          wallet.name,
          wallet.address.slice(0, 25) + '...',
          `${usdcAmount.toFixed(4)} USDC`,
          hasFunds ? chalk.green('✅ Funded') : chalk.red('❌ Empty')
        ]);
      } catch (error) {
        spinner.fail(`Error: ${error.message}`);
        table.push([
          wallet.name,
          wallet.address.slice(0, 25) + '...',
          'Error',
          chalk.red('❌ Error')
        ]);
      }
    }

    console.log(table.toString());
    console.log(`\n${chalk.bold('Total Funded:')} ${fundedCount}/${TEST_WALLETS.length} wallets`);
    
    if (fundedCount === 0) {
      console.log(chalk.yellow('\n⚠️  ALL WALLETS ARE EMPTY!'));
      console.log('Get testnet USDC at: https://faucet.circle.com/');
      console.log('Or use Aptos CLI: aptos account fund-with-faucet --account <address>');
    }
    
    return fundedCount;
  }

  /**
   * Test payment with a single wallet
   */
  async testSingle(options) {
    const spinner = ora(chalk.gray(`Testing payment from ${options.wallet?.slice(0, 16) || 'wallet'}...`)).start();
    
    try {
      const wallet = TEST_WALLETS.find(w => w.address === options.wallet);
      if (!wallet) {
        spinner.fail('Wallet not found in test set');
        return { success: false, error: 'Wallet not found' };
      }

      const result = await this.client.payForResource(
        options.endpoint || 'http://localhost:3006/api/paid',
        wallet.key,
        {
          method: 'POST',
          body: { test: true, timestamp: Date.now() }
        }
      );

      if (result.success && result.transaction) {
        spinner.succeed(chalk.green(`Payment successful! Tx: ${result.transaction.slice(0, 20)}...`));
        return {
          success: true,
          wallet: wallet.address,
          transaction: result.transaction,
          payer: result.payer
        };
      } else if (result.error === 'verify_failed') {
        spinner.fail(chalk.red(`Payment failed: ${result.reason}`));
        return { success: false, error: result.reason, wallet: wallet.address };
      } else if (result.error === 'settle_failed') {
        spinner.fail(chalk.red(`Settlement failed: ${result.error}`));
        return { success: false, error: result.error, wallet: wallet.address };
      } else if (result.status === 402) {
        // Server returned 402 even after payment - payload format issue
        spinner.fail(chalk.red('Server rejected payment (402)'));
        return { success: false, error: 'Server rejected payment', wallet: wallet.address };
      } else {
        spinner.fail(chalk.red(`Payment failed: ${result.error || 'Unknown error'}`));
        return { success: false, error: result.error || 'Unknown', wallet: wallet.address };
      }

    } catch (error) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  /**
   * Test all wallets sequentially
   */
  async testAllWallets(options = {}) {
    console.log(`\n🧪 ${gradient('#9A4DFF', '#00F5FF')('Ascent Multi-Wallet Stress Test')}\n`);
    
    const endpoint = options.endpoint || 'http://localhost:3006/api/paid';
    console.log(`Target: ${chalk.cyan(endpoint)}`);
    console.log(`Wallets: ${chalk.bold(TEST_WALLETS.length)}\n`);

    // First check balances
    const fundedCount = await this.checkBalances();
    
    if (fundedCount === 0) {
      console.log(chalk.red('\nCannot run tests - no funded wallets available\n'));
      return [];
    }

    // Run payment tests
    console.log(chalk.bold('\nRunning Payment Tests...\n'));
    
    const results = [];
    let successCount = 0;

    for (const wallet of TEST_WALLETS) {
      const result = await this.testSingle({
        ...options,
        wallet: wallet.address,
        endpoint
      });
      
      results.push(result);
      if (result.success) successCount++;
      
      // Small delay between tests
      if (!options.noDelay) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Summary
    console.log(`\n${gradient('#9A4DFF', '#00F5FF')('Test Summary')}\n`);
    console.log(`Successful: ${chalk.green(successCount)}/${TEST_WALLETS.length}`);
    console.log(`Failed: ${chalk.red(TEST_WALLETS.length - successCount)}/${TEST_WALLETS.length}`);
    
    if (successCount > 0) {
      console.log(chalk.green(`\n✅ ${successCount} payment(s) completed successfully`));
    }
    
    return results;
  }

  /**
   * Quick test with first funded wallet
   */
  async quickTest(endpoint = 'http://localhost:3006/api/paid') {
    console.log(`\n⚡ ${gradient('#9A4DFF', '#00F5FF')('Quick Payment Test')}\n`);
    
    // Find first funded wallet
    for (const wallet of TEST_WALLETS) {
      const balance = await this.client.checkBalance(wallet.address);
      if (parseInt(balance.balance) >= 10000) {
        console.log(`Using ${wallet.name} (${wallet.address.slice(0, 20)}...)`);
        console.log(`Balance: ${parseInt(balance.balance) / 1000000} USDC\n`);
        
        const result = await this.testSingle({
          wallet: wallet.address,
          endpoint
        });
        
        return result;
      }
    }
    
    console.log(chalk.red('No funded wallets found!'));
    console.log('Get testnet USDC at: https://faucet.circle.com/');
    return { success: false, error: 'No funded wallets' };
  }
}

module.exports = { MultiWalletTester, TEST_WALLETS };

// CLI usage
if (require.main === module) {
  const tester = new MultiWalletTester();
  const args = process.argv.slice(2);
  
  if (args.includes('--balances') || args.includes('-b')) {
    tester.checkBalances().catch(console.error);
  } else if (args.includes('--quick') || args.includes('-q')) {
    const endpoint = args.find(a => a.startsWith('http')) || 'http://localhost:3006/api/paid';
    tester.quickTest(endpoint).catch(console.error);
  } else {
    const endpoint = args.find(a => a.startsWith('http')) || 'http://localhost:3006/api/paid';
    tester.testAllWallets({ endpoint }).catch(console.error);
  }
}
