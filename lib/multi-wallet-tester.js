// Multi-wallet payment tester with real x402 integration
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { x402Client, wrapFetchWithPayment } = require('@rvk_rishikesh/fetch');
const { registerExactAptosScheme } = require('@rvk_rishikesh/aptos/exact/client');
const { Account, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const gradient = require('gradient-string').default;

// Hackathon test wallets
const HACKATHON_WALLETS = [
  {
    name: 'Wallet 1 (Egg #2)',
    address: '0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0',
    privateKey: '0xFEE281AD1736B2B85FB322A312DE6D2176617A4C25259D189DD5E43440D498DE'
  },
  {
    name: 'Wallet 2',
    address: '0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4',
    privateKey: '0x27E494815376D492A64382825DB5A19F9DEC59B2F0E63CBD395F421CB70A8E0A'
  },
  {
    name: 'Wallet 3',
    address: '0x924c2e983753bb29b45ae9b4036d48861f204da096b36af710c95d1742b05ad4',
    privateKey: '0x9A51D0A13590B93F8CDE82724976D6B61D826C542D5C640FBFB0F2C6D274BE9F'
  },
  {
    name: 'Wallet 4',
    address: '0xf1697d22257fd39653319eb3a2ee23fca2ca99b26f7fc79090249fbfbc401e03',
    privateKey: '0x8A5B2E6F1C3D9A7B4E2F5C8D1A6B3E9F2C5D8A1B4E7F0C3D6A9B2E5F8C1D4A7'
  },
  {
    name: 'Wallet 5',
    address: '0x6cd199bbbc8bb3c17de4d2aebc2e75b4e9d7e3083188d987b597a3de8239df2a',
    privateKey: '0xB3E7A1F4C8D2E5B9A6C3F0D8E1B4A7C2F5D8E1B4A7C0F3D6E9B2C5F8A1D4E7B0'
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

      const privateKey = new Ed25519PrivateKey(privateKeyHex.replace('0x', ''));
      const account = Account.fromPrivateKey({ privateKey });

      const client = new x402Client();
      registerExactAptosScheme(client, { signer: account });
      
      const fetchWithPayment = wrapFetchWithPayment(fetch, client);

      const endpoint = options.endpoint || 'http://localhost:3000/api/paid';
      const response = await fetchWithPayment(endpoint, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        const txHash = data.transaction || data.txHash || 'unknown';
        
        spinner.succeed(chalk.green(`Payment for ${options.amount} USDC forged successfully.`));
        return {
          success: true,
          wallet: account.accountAddress.toString(),
          transaction: txHash,
          amount: options.amount || '0.01'
        };
      } else {
        const error = await response.text();
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
