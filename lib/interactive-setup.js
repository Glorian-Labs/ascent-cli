// Interactive project setup with prompts
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

class InteractiveSetup {
  async run(projectName, targetDir) {
    const brandPurple = '#9A4DFF';
    const brandTeal = '#00F5FF';
    const gradient = require('gradient-string').default;
    const brandGradient = gradient(brandPurple, brandTeal);

    console.log(`\n🎨 ${brandGradient('Ascent Project Configuration')}\n`);

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: [
          { name: 'Express - Minimal server (fastest)', value: 'express' },
          { name: 'Next.js - Full-stack React', value: 'next' },
          { name: 'Hono - Edge-ready', value: 'hono' }
        ],
        default: 'express'
      },
      {
        type: 'list',
        name: 'network',
        message: 'Select Aptos network:',
        choices: [
          { name: 'Testnet (aptos:2) - Recommended for development', value: 'aptos:2' },
          { name: 'Mainnet (aptos:1) - Production only', value: 'aptos:1' }
        ],
        default: 'aptos:2'
      },
      {
        type: 'input',
        name: 'recipientAddress',
        message: 'Payment recipient address (your wallet):',
        validate: (input) => input.startsWith('0x') || 'Address must start with 0x'
      },
      {
        type: 'input',
        name: 'price',
        message: 'Default payment price (USDC):',
        default: '0.01',
        validate: (input) => !isNaN(parseFloat(input)) || 'Must be a number'
      },
      {
        type: 'input',
        name: 'endpoint',
        message: 'Protected API endpoint path:',
        default: '/api/paid'
      },
      {
        type: 'confirm',
        name: 'includeDashboard',
        message: 'Include payment analytics dashboard?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeTests',
        message: 'Include example tests?',
        default: true
      }
    ]);

    // Create project with answers
    await this.createProject(targetDir, answers, projectName);

    return answers;
  }

  async createProject(targetDir, config, projectName) {
    const templatesDir = path.join(__dirname, '..', 'templates', config.template);
    fs.copySync(templatesDir, targetDir);

    // Update package.json
    const pkgPath = path.join(targetDir, 'package.json');
    const pkg = fs.readJsonSync(pkgPath);
    pkg.name = projectName;
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

    // Create .env.local with user config
    const usdcAsset = config.network === 'aptos:2' 
      ? '0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832'
      : '0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b';

    const envContent = `# Aptos x402 Configuration
PAYMENT_RECIPIENT_ADDRESS=${config.recipientAddress}
APTOS_NETWORK=${config.network}
APTOS_PRIVATE_KEY=\n# Get testnet USDC: https://faucet.circle.com/

# Facilitator
FACILITATOR_URL=https://x402-navy.vercel.app/facilitator

# Payment Settings
DEFAULT_PRICE=${config.price}
USDC_ASSET=${usdcAsset}

# Analytics (if dashboard enabled)
ANALYTICS_DB=./payments.db
`;
    fs.writeFileSync(path.join(targetDir, '.env.local'), envContent);

    // Create config file
    const configContent = `module.exports = {
  network: '${config.network}',
  recipient: '${config.recipientAddress}',
  defaultPrice: '${config.price}',
  endpoint: '${config.endpoint}',
  usdcAsset: '${usdcAsset}',
  facilitator: 'https://x402-navy.vercel.app/facilitator'
};
`;
    fs.writeFileSync(path.join(targetDir, 'x402.config.js'), configContent);

    // Add dashboard if requested
    if (config.includeDashboard) {
      await this.addDashboard(targetDir);
    }

    // Add tests if requested
    if (config.includeTests) {
      await this.addTests(targetDir, config);
    }

    // Update template files with config
    await this.updateTemplateFiles(targetDir, config);
  }

  async addDashboard(targetDir) {
    const dashboardDir = path.join(targetDir, 'dashboard');
    fs.ensureDirSync(dashboardDir);

    const dashboardHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Ascent | x402 Analytics</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: #1a1a1a; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #333; }
    .stat-value { font-size: 2.5em; font-weight: bold; color: #9A4DFF; }
    .stat-label { color: #888; margin-top: 5px; text-transform: uppercase; font-size: 0.8em; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; background: #1a1a1a; border-radius: 12px; overflow: hidden; }
    th, td { padding: 15px; text-align: left; border-bottom: 1px solid #333; }
    th { background: #222; color: #00F5FF; font-weight: 600; text-transform: uppercase; font-size: 0.85em; }
    .status-success { color: #22c55e; }
    .status-failed { color: #ef4444; }
    h1 { color: #00F5FF; font-weight: 800; letter-spacing: -1px; }
    a { color: #9A4DFF; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>🧬 ASCENT ANALYTICS</h1>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-value" id="totalPayments">0</div>
      <div class="stat-label">Total Flows</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="totalVolume">0</div>
      <div class="stat-label">Volume (USDC)</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="successRate">0%</div>
      <div class="stat-label">Forge Rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="uniquePayers">0</div>
      <div class="stat-label">Agents Served</div>
    </div>
  </div>
  
  <h2>Recent Transactions</h2>
  <table>
    <thead>
      <tr><th>Time</th><th>Payer</th><th>Amount</th><th>Status</th><th>Tx Hash</th></tr>
    </thead>
    <tbody id="transactions"></tbody>
  </table>

  <script>
    async function loadData() {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      
      document.getElementById('totalPayments').textContent = data.totalPayments;
      document.getElementById('totalVolume').textContent = data.totalVolume.toFixed(4);
      document.getElementById('successRate').textContent = data.successRate + '%';
      document.getElementById('uniquePayers').textContent = data.uniquePayers;
      
      const tbody = document.getElementById('transactions');
      tbody.innerHTML = data.transactions.map(tx => \`
        <tr>
          <td>\${new Date(tx.timestamp).toLocaleString()}</td>
          <td>\${tx.payer.slice(0, 10)}...\${tx.payer.slice(-4)}</td>
          <td>\${tx.amount} USDC</td>
          <td class="status-\${tx.status}">\${tx.status}</td>
          <td><a href="https://explorer.aptoslabs.com/txn/\${tx.txHash}?network=testnet" target="_blank">\${tx.txHash.slice(0, 16)}...</a></td>
        </tr>
      \`).join('');
    }
    
    loadData();
    setInterval(loadData, 5000);
  </script>
</body>
</html>
`;
    fs.writeFileSync(path.join(dashboardDir, 'index.html'), dashboardHtml);
  }

  async addTests(targetDir, config) {
    const testDir = path.join(targetDir, 'tests');
    fs.ensureDirSync(testDir);

    const testContent = `const { x402Client } = require('@rvk_rishikesh/fetch');
const { registerExactAptosScheme } = require('@rvk_rishikesh/aptos/exact/client');
const { Account, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');

// Test wallets for development
const TEST_WALLETS = [
  '0xFEE281AD1736B2B85FB322A312DE6D2176617A4C25259D189DD5E43440D498DE',
  // Add more wallet private keys here
];

describe('x402 Payment Flow', () => {
  test('should process payment for ${config.endpoint}', async () => {
    // Test implementation
    console.log('Testing endpoint:', '${config.endpoint}');
    console.log('Network:', '${config.network}');
    console.log('Price:', '${config.price} USDC');
  });
});
`;
    fs.writeFileSync(path.join(testDir, 'payment.test.js'), testContent);
  }

  async updateTemplateFiles(targetDir, config) {
    // Update server.js or middleware with config
    const serverPath = path.join(targetDir, 'server.js');
    if (fs.existsSync(serverPath)) {
      let content = fs.readFileSync(serverPath, 'utf8');
      content = content.replace('0.01', config.price);
      content = content.replace('/api/paid-endpoint', config.endpoint);
      fs.writeFileSync(serverPath, content);
    }

    const middlewarePath = path.join(targetDir, 'middleware.js');
    if (fs.existsSync(middlewarePath)) {
      let content = fs.readFileSync(middlewarePath, 'utf8');
      content = content.replace('0.01', config.price);
      content = content.replace('/api/paid', config.endpoint);
      fs.writeFileSync(middlewarePath, content);
    }
  }
}

module.exports = new InteractiveSetup();
