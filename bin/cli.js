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
  .option('-t, --template <type>', 'Template: express|next|hono')
  .option('-i, --interactive', 'Interactive setup with prompts', true)
  .action(async (projectName, options) => {
    const targetDir = path.resolve(process.cwd(), projectName);
    
    if (fs.existsSync(targetDir)) {
      console.log(chalk.red(`✖ Directory ${projectName} already exists`));
      process.exit(1);
    }
    
    fs.ensureDirSync(targetDir);
    
    try {
      if (options.interactive) {
        // Use interactive setup
        const interactiveSetup = require('./lib/interactive-setup');
        const config = await interactiveSetup.run(projectName, targetDir);
        
        console.log(chalk.green(`\n✔ Created ${chalk.bold(projectName)} with ${config.template} template`));
        console.log(chalk.blue('\n📦 Project configured:'));
        console.log(`  Network: ${chalk.cyan(config.network)}`);
        console.log(`  Price: ${chalk.cyan(config.price)} USDC`);
        console.log(`  Endpoint: ${chalk.cyan(config.endpoint)}`);
        console.log(`  Dashboard: ${config.includeDashboard ? chalk.green('✓') : chalk.red('✗')}`);
        
        console.log(chalk.blue('\n🚀 Next steps:'));
        console.log(`  cd ${projectName}`);
        console.log('  npm install');
        console.log('  aptos-x402 dev');
        console.log(chalk.gray('\n  # Or test with multiple wallets:'));
        console.log(chalk.gray('  aptos-x402 test --all-wallets'));
      } else {
        // Use simple template
        const spinner = ora('Creating project...').start();
        await createTemplate(targetDir, options.template || 'express', projectName);
        spinner.succeed(`Created ${chalk.green(projectName)} with ${options.template || 'express'} template`);
        
        console.log(chalk.blue('\nNext steps:'));
        console.log(`  cd ${projectName}`);
        console.log('  npm install');
        console.log('  aptos-x402 dev');
      }
      
    } catch (error) {
      console.log(chalk.red(`\n✖ Failed: ${error.message}`));
      process.exit(1);
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
  .option('-p, --private-key <key>', 'Wallet private key')
  .option('-a, --amount <amount>', 'Payment amount in USDC', '0.01')
  .option('-e, --endpoint <url>', 'API endpoint to test', 'http://localhost:3000/api/paid')
  .option('--all-wallets', 'Test with all 5 hackathon wallets')
  .action(async (options) => {
    try {
      if (options.allWallets) {
        // Multi-wallet test
        const multiTester = require('./lib/multi-wallet-tester');
        await multiTester.testAllWallets({
          amount: options.amount,
          endpoint: options.endpoint
        });
      } else {
        // Single wallet test
        if (!options.wallet && !options.privateKey) {
          console.log(chalk.red('Error: Provide --wallet or --private-key, or use --all-wallets'));
          process.exit(1);
        }
        
        const multiTester = require('./lib/multi-wallet-tester');
        await multiTester.testSingle({
          wallet: options.wallet,
          privateKey: options.privateKey,
          amount: options.amount,
          endpoint: options.endpoint
        });
      }
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Monitor command
program
  .command('monitor')
  .description('Monitor payment flows in real-time (terminal)')
  .option('-i, --interval <ms>', 'Update interval', '3000')
  .action(async (options) => {
    console.log(chalk.cyan('📊 Starting terminal payment monitor...\n'));
    
    const monitor = require('./lib/monitor');
    await monitor.start({ interval: parseInt(options.interval) });
  });

// Dashboard command
program
  .command('dashboard')
  .description('Start web analytics dashboard')
  .option('-p, --port <port>', 'Dashboard port', '3456')
  .option('-d, --db <path>', 'Database path', './payments.db')
  .action(async (options) => {
    const dashboard = require('./lib/dashboard');
    await dashboard.start({ 
      port: parseInt(options.port),
      dbPath: options.db
    });
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
