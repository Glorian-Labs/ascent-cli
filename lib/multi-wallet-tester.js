const fetch = require('node-fetch');
const { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network, PrivateKey, PrivateKeyVariants } = require('@aptos-labs/ts-sdk');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const gradient = require('gradient-string').default;

// Test wallets for hackathon stress testing (Aptos testnet only)
// These are public testnet wallets - DO NOT use on mainnet
// Source: Canteen x Aptos x402 Hackathon Notion
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

      // 1. Initial Request
      const endpoint = options.endpoint || 'http://localhost:3006/api/paid';
      const isLocalEndpoint = /^https?:\/\/localhost(:\d+)?\//.test(endpoint) || endpoint.startsWith('http://127.0.0.1');
      // Use 127.0.0.1 so health check hits IPv4 listener (facilitator binds to 127.0.0.1; localhost can resolve to ::1)
      const facilitatorHealthUrl = (options.facilitatorUrl || 'http://127.0.0.1:4022').replace(/\/$/, '') + '/health';

      // Pre-flight: if testing localhost, ensure local facilitator is up (required for verify/settle)
      if (isLocalEndpoint) {
        try {
          const healthRes = await fetch(facilitatorHealthUrl, { method: 'GET', timeout: 3000 });
          if (!healthRes.ok) {
            spinner.fail(`Local facilitator at ${facilitatorHealthUrl} is not healthy. Start the stack with: ${chalk.cyan('ascent dev')} (from the project folder).`);
            return { success: false, error: 'Facilitator not running' };
          }
        } catch (e) {
          spinner.fail(`Local facilitator at ${facilitatorHealthUrl} is not reachable. Start the stack with: ${chalk.cyan('ascent dev')} (from the project folder), then run this test.`);
          return { success: false, error: 'Facilitator not reachable' };
        }
      }

      // Pre-flight: server endpoint
      try {
        const healthRes = await fetch(endpoint, { method: 'POST', timeout: 5000 });
        if (healthRes.status === 404) {
          spinner.fail('Endpoint /api/paid returned 404. Check your server routes.');
          return { success: false, error: 'Route not found' };
        }
      } catch (e) {
        spinner.fail(`Server at ${endpoint} is not reachable. Start the stack with: ${chalk.cyan('ascent dev')} (from the project folder).`);
        return { success: false, error: 'Server not reachable' };
      }

      const firstRes = await fetch(endpoint, { method: 'POST', timeout: 10000 });
      
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

      // 2. Build & sign transaction (AIP-80 compliant key)
      const rawHex = privateKeyHex.trim().replace(/^0x/i, '').replace(/^ed25519-priv-0x/i, '');
      const evenHex = rawHex.length % 2 === 1 ? '0' + rawHex : rawHex;
      const hex64 = evenHex.length < 64 ? evenHex.padStart(64, '0') : evenHex.length > 64 ? evenHex.slice(-64) : evenHex;
      const aip80Key = PrivateKey.formatPrivateKey('0x' + hex64, PrivateKeyVariants.Ed25519);
      const privateKey = new Ed25519PrivateKey(aip80Key);
      const account = Account.fromPrivateKey({ privateKey });

      const aptosConfig = new AptosConfig({ network: Network.TESTNET, fullnode: 'https://fullnode.testnet.aptoslabs.com/v1' });
      const aptos = new Aptos(aptosConfig);

      console.log(`- Connection check to Aptos Testnet...`);
      const ledgerInfo = await aptos.getLedgerInfo();
      console.log(`- Ledger chain ID: ${ledgerInfo.chain_id}`);
      console.log(`- Building transaction...`);
      const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: '0x1::primary_fungible_store::transfer',
          typeArguments: ['0x1::fungible_asset::Metadata'],
          functionArguments: [selectedAccept.asset, selectedAccept.payTo, BigInt(selectedAccept.amount)],
        },
      });
      console.log(`- Signing transaction...`);
      const authenticator = aptos.transaction.sign({ signer: account, transaction });

      const paymentPayload = {
        x402Version: 2,
        payload: {
          transaction: Buffer.from(transaction.bcsToBytes()).toString('base64'),
          authenticator: Buffer.from(authenticator.bcsToBytes()).toString('base64'),
        },
        accepted: selectedAccept,
      };
      const paymentSignature = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      console.log(`- Submitting payment to endpoint (waiting for facilitator verify/settle)...`);
      const secondRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'PAYMENT-SIGNATURE': paymentSignature },
        timeout: 90000,
      });
      console.log(`- Response status: ${secondRes.status}`);

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
        if (secondRes.status === 504 && isLocalEndpoint) {
          console.log(chalk.yellow('\nTip: 504 = facilitator verify/settle timed out. Start the stack with ') + chalk.cyan('ascent dev') + chalk.yellow(' from the project folder, then run this test again.'));
        }
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
    const endpoint = options.endpoint || 'http://localhost:3006/api/paid';
    const isLocal = /^https?:\/\/localhost(:\d+)?\//.test(endpoint) || endpoint.startsWith('http://127.0.0.1');
    // Use 127.0.0.1 so health check hits IPv4 listener (facilitator binds to 127.0.0.1)
    const facilitatorHealthUrl = (options.facilitatorUrl || 'http://127.0.0.1:4022').replace(/\/$/, '') + '/health';

    console.log(`\n🧪 ${brandGradient('Ascent Multi-Wallet Stress Test')}\n`);
    console.log(`Target: ${chalk.cyan(endpoint)}`);
    console.log(`Wallets: ${chalk.bold(HACKATHON_WALLETS.length)}\n`);

    // One pre-flight for local: fail fast if facilitator or server not up
    if (isLocal) {
      try {
        const r = await fetch(facilitatorHealthUrl, { method: 'GET', timeout: 3000 });
        if (!r.ok) {
          console.log(chalk.red(`Local facilitator at ${facilitatorHealthUrl} is not healthy. Start the stack with: ${chalk.cyan('ascent dev')} (from the project folder), then run this test.\n`));
          return [];
        }
      } catch (e) {
        console.log(chalk.red(`Local facilitator at ${facilitatorHealthUrl} is not reachable. Start the stack with: ${chalk.cyan('ascent dev')} (from the project folder), then run this test.\n`));
        return [];
      }
    }

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
