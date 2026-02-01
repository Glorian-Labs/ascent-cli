const fetch = require('node-fetch');
const { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const gradient = require('gradient-string').default;

// Test wallets for hackathon stress testing (Aptos testnet only)
// These are public testnet wallets with fake USDC - DO NOT use on mainnet
// Configure your own via TEST_WALLETS environment variable or .env file
const HACKATHON_WALLETS = process.env.TEST_WALLETS 
  ? JSON.parse(process.env.TEST_WALLETS)
  : [
      {
        name: 'Test Wallet 1',
        address: process.env.TEST_WALLET_1_ADDR || '0x...',
        privateKey: process.env.TEST_WALLET_1_KEY || '0x...'
      }
    ];

class MultiWalletTester {
  async testSingle(options) {
    const spinner = ora(chalk.gray(`Synthesizing payment from ${options.wallet.slice(0, 16)}...`)).start();
    
    try {
      const privateKeyHex = options.privateKey || options.wallet;
      if (!privateKeyHex) {
        spinner.fail('No wallet private key detected.');
        return { success: false, error: 'Missing key' };
      }

      // 1. Initial Request
      const endpoint = options.endpoint || 'http://localhost:3000/api/paid';
      const firstRes = await fetch(endpoint, { method: 'POST' });
      
      if (firstRes.status !== 402) {
        spinner.fail(`Expected 402, got ${firstRes.status}`);
        return { success: false, error: `Wrong status: ${firstRes.status}` };
      }

      const paymentRequiredBase64 = firstRes.headers.get('PAYMENT-REQUIRED');
      if (!paymentRequiredBase64) {
        spinner.fail('No PAYMENT-REQUIRED header found.');
        return { success: false, error: 'Missing header' };
      }

      const requirements = JSON.parse(Buffer.from(paymentRequiredBase64, 'base64').toString());
      const selectedAccept = requirements.accepts[0];

      // 2. Build & Sign Transaction
      const cleanKey = privateKeyHex.trim().replace('0x', '');
      const finalKey = cleanKey.length % 2 !== 0 ? '0' + cleanKey : cleanKey;
      const privateKey = new Ed25519PrivateKey(finalKey);
      const account = Account.fromPrivateKey({ privateKey });

      const aptosConfig = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(aptosConfig);

      // spinner.text = chalk.gray(`Building transaction for ${account.accountAddress.toString()}...`);

      // Construct transaction payload
      const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: "0x1::primary_fungible_store::transfer",
          typeArguments: ["0x1::fungible_asset::Metadata"],
          functionArguments: [selectedAccept.asset, selectedAccept.payTo, BigInt(selectedAccept.amount)],
        },
      });

      // spinner.text = chalk.gray(`Signing transaction...`);
      const authenticator = aptos.transaction.sign({
        signer: account,
        transaction,
      });

      const paymentPayload = {
        x402Version: 2,
        payload: {
          transaction: Buffer.from(transaction.bcsToBytes()).toString('base64'),
          authenticator: Buffer.from(authenticator.bcsToBytes()).toString('base64')
        },
        accepted: selectedAccept
      };

      const paymentSignature = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

      // 3. Retry with Payment
      // spinner.text = chalk.gray(`Submitting forged payment...`);
      const secondRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYMENT-SIGNATURE': paymentSignature
        }
      });

      if (secondRes.ok) {
        const data = await secondRes.json();
        spinner.succeed(chalk.green(`Payment for ${options.amount || '0.01'} USDC forged successfully.`));
        return {
          success: true,
          wallet: account.accountAddress.toString(),
          transaction: data.transaction || 'unknown',
          amount: options.amount || '0.01'
        };
      } else {
        const error = await secondRes.text();
        spinner.fail(chalk.red(`Forge rejected: ${error}`));
        return { success: false, error };
      }

    } catch (error) {
      spinner.fail(chalk.red(`Fatal sim error: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  async testAllWallets(options) {
    const brandPurple = '#9A4DFF';
    const brandTeal = '#00F5FF';
    const brandGradient = gradient(brandPurple, brandTeal);

    console.log(`\n🧪 ${brandGradient('Ascent Multi-Wallet Stress Test')}\n`);
    console.log(`Target: ${chalk.cyan(options.endpoint || 'http://localhost:3000/api/paid')}`);
    console.log(`Wallets: ${chalk.bold(HACKATHON_WALLETS.length)}\n`);

    const results = [];
    let successCount = 0;
    let totalVolume = 0;

    for (const wallet of HACKATHON_WALLETS) {
      const result = await this.testSingle({
        ...options,
        wallet: wallet.address,
        privateKey: wallet.privateKey
      });
      
      results.push({
        name: wallet.name,
        address: wallet.address,
        ...result
      });
      
      if (result.success) {
        successCount++;
        totalVolume += parseFloat(options.amount || '0.01');
      }
    }

    // Beautiful Summary Table
    console.log(`\n${brandGradient('🚀 SIMULATION RESULTS')}`);
    const summaryTable = new Table({
      head: [chalk.cyan('Wallet'), chalk.cyan('Status'), chalk.cyan('TX ID'), chalk.cyan('Amount')],
      style: { head: [], border: [] }
    });

    results.forEach(r => {
      const status = r.success ? chalk.green('FORGED') : chalk.red('FAILED');
      const tx = r.transaction ? r.transaction.slice(0, 12) + '...' : chalk.gray('N/A');
      summaryTable.push([r.name, status, tx, `${r.amount} USDC`]);
    });

    console.log(summaryTable.toString());

    const finalReport = new Table({
      style: { head: [], border: [] }
    });
    
    finalReport.push(
      ['Total Trials', HACKATHON_WALLETS.length],
      ['Success Rate', chalk.bold(((successCount / HACKATHON_WALLETS.length) * 100).toFixed(1) + '%')],
      ['Aggregated Volume', chalk.green(totalVolume.toFixed(2) + ' USDC')]
    );
    
    console.log(finalReport.toString());
    console.log('\n');

    return results;
  }
}

module.exports = new MultiWalletTester();
