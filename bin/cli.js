#!/usr/bin/env node
// Aptos x402 Developer CLI
// The missing toolkit for x402 payments on Aptos

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const ora = require('ora');

const PACKAGE_VERSION = require(path.join(__dirname, '..', 'package.json')).version;

// Banner
console.log(chalk.cyan(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🥠 ${chalk.bold('Aptos x402 CLI')} v${PACKAGE_VERSION}                          ║
║                                                            ║
║  The missing toolkit for x402 payments on Aptos            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`));

program
  .name('aptos-x402')
  .description('CLI for building x402 payment-enabled applications on Aptos')
  .version(PACKAGE_VERSION);

// Init command
program
  .command('init <project-name>')
  .description('Scaffold a new x402 project')
  .option('-t, --template <type>', 'Template: express|next|hono', 'express')
  .action(async (projectName, options) => {
    const spinner = ora('Creating project...').start();
    
    try {
      const targetDir = path.resolve(process.cwd(), projectName);
      
      if (fs.existsSync(targetDir)) {
        spinner.fail(`Directory ${projectName} already exists`);
        process.exit(1);
      }
      
      fs.ensureDirSync(targetDir);
      
      // Create based on template
      await createTemplate(targetDir, options.template, projectName);
      
      spinner.succeed(`Created ${chalk.green(projectName)} with ${options.template} template`);
      
      console.log(chalk.blue('\nNext steps:'));
      console.log(`  cd ${projectName}`);
      console.log('  npm install');
      console.log('  aptos-x402 dev');
      
    } catch (error) {
      spinner.fail(`Failed: ${error.message}`);
    }
  });

// Dev command
program
  .command('dev')
  .description('Start development server with local facilitator')
  .option('-p, --port <port>', 'Server port', '3000')
  .option('-f, --facilitator-port <port>', 'Facilitator port', '4022')
  .option('--no-facilitator', 'Skip starting local facilitator')
  .action(async (options) => {
    console.log(chalk.yellow('🚀 Starting x402 development environment...\n'));
    
    let facilitatorInstance = null;
    
    // Start facilitator if requested
    if (options.facilitator) {
      const facilitator = require('./lib/facilitator');
      facilitatorInstance = await facilitator.start({ port: options.facilitatorPort });
      
      console.log(chalk.green(`✓ Local facilitator: http://localhost:${options.facilitatorPort}`));
      console.log(chalk.gray('  Facilitator handles payment verification and settlement\n'));
      
      // Set env for server to use local facilitator
      process.env.FACILITATOR_URL = `http://localhost:${options.facilitatorPort}`;
    } else {
      console.log(chalk.blue('Using public facilitator: https://x402-navy.vercel.app/facilitator/\n'));
    }
    
    console.log(chalk.blue('Starting your server...\n'));
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\nShutting down...'));
      if (facilitatorInstance) {
        facilitatorInstance.stop();
        console.log(chalk.gray('✓ Facilitator stopped'));
      }
      process.exit(0);
    });
    
    // Start dev server
    try {
      execSync('npm run dev', { stdio: 'inherit', env: process.env });
    } catch (e) {
      // User exited or error
      if (facilitatorInstance) {
        facilitatorInstance.stop();
      }
    }
  });

// Test command
program
  .command('test')
  .description('Test payment flow with test wallet')
  .option('-w, --wallet <address>', 'Test wallet address')
  .option('-a, --amount <amount>', 'Payment amount in USDC', '0.01')
  .action(async (options) => {
    const spinner = ora('Testing x402 payment flow...').start();
    
    try {
      const tester = require('./lib/tester');
      const result = await tester.run({
        wallet: options.wallet,
        amount: options.amount
      });
      
      if (result.success) {
        spinner.succeed('Payment test passed!');
        console.log(chalk.green(`\n✓ Transaction: ${result.transaction}`));
        console.log(chalk.blue(`  View: https://explorer.aptoslabs.com/txn/${result.transaction}?network=testnet`));
      } else {
        spinner.fail(`Test failed: ${result.error}`);
      }
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

// Monitor command
program
  .command('monitor')
  .description('Monitor payment flows in real-time')
  .option('-i, --interval <ms>', 'Update interval', '3000')
  .action(async (options) => {
    console.log(chalk.cyan('📊 Starting payment monitor...\n'));
    
    const monitor = require('./lib/monitor');
    await monitor.start({ interval: parseInt(options.interval) });
  });

// Deploy command
program
  .command('deploy')
  .description('Deploy to Vercel')
  .action(async () => {
    const spinner = ora('Deploying to Vercel...').start();
    
    try {
      execSync('vercel --prod', { stdio: 'inherit' });
      spinner.succeed('Deployed!');
    } catch (error) {
      spinner.fail('Deployment failed. Is Vercel CLI installed?');
    }
  });

// Move command
program
  .command('move <action>')
  .description('Move language helpers')
  .action(async (action) => {
    const moveHelper = require('./lib/move-helper');
    
    switch (action) {
      case 'init':
        await moveHelper.init();
        break;
      case 'add-payment-logic':
        await moveHelper.addPaymentLogic();
        break;
      default:
        console.log(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.blue('Available: init, add-payment-logic'));
    }
  });

// Config command
program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    const config = require('./lib/config');
    config.show();
  });

async function createTemplate(targetDir, template, projectName) {
  const templatesDir = path.join(__dirname, '..', 'templates', template);
  
  // Copy template files
  fs.copySync(templatesDir, targetDir);
  
  // Update package.json
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = require(pkgPath);
  pkg.name = projectName;
  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
  
  // Create .env.example
  const envContent = `# Aptos x402 Configuration
PAYMENT_RECIPIENT_ADDRESS=0xyour_aptos_address
APTOS_PRIVATE_KEY=0xyour_private_key
FACILITATOR_URL=https://x402-navy.vercel.app/facilitator
NETWORK=aptos-testnet
`;
  fs.writeFileSync(path.join(targetDir, '.env.example'), envContent);
}

program.parse();
