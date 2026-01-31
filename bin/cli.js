#!/usr/bin/env node
/**
 * Ascent CLI - The elite toolkit for x402 payments on Aptos.
 * Forging the Future of Agent Commerce.
 */

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const ora = require('ora');
const boxen = require('boxen').default;
const gradient = require('gradient-string').default;

const PACKAGE_VERSION = require(path.join(__dirname, '..', 'package.json')).version;

// Branding Colors
const brandPurple = '#9A4DFF';
const brandTeal = '#00F5FF';
const brandGradient = gradient(brandPurple, brandTeal);

// Banner
const bannerText = brandGradient.multiline([
  '   ▄▄▄▄▀ ▄▄▄▄▄   ▄█▄    ▄███▄      ▄      ▄▄▄▄▀ ',
  '▀▀▀ █   █     ▀▄ █▀ █   █▀   ▀      █  ▀▀▀ █    ',
  '    █ ▄  ▀▀▀▀▀▀  █   █  ██▄▄    ██   █     █    ',
  '   █   █         █▄ ▄█  █▄   ▄▀ █ █  █    █     ',
  '  ▀   ▀           ▀█▀   ▀███▀   █  █ █   ▀      ',
  '                                █   ██          '
].join('\n'));

const bannerContent = `
${bannerText}

${chalk.bold('ASCENT')} v${PACKAGE_VERSION}
${chalk.italic('Aptos x402 Agent Forge')}

Forging the Future of Agent Commerce.
`;

console.log(boxen(bannerContent, {
  padding: 1,
  margin: 1,
  borderStyle: 'double',
  borderColor: brandPurple,
  float: 'center',
  textAlignment: 'center'
}));

program
  .name('ascent')
  .description('Elite CLI for building x402 payment-enabled applications on Aptos')
  .version(PACKAGE_VERSION);

// Init command
program
  .command('init <project-name>')
  .description('Scaffold a new x402 agent project')
  .option('-t, --template <type>', 'Template: express|next|hono', 'express')
  .option('--no-interactive', 'Disable interactive setup')
  .action(async (projectName, options) => {
    const targetDir = path.resolve(process.cwd(), projectName);
    
    if (fs.existsSync(targetDir)) {
      console.log(chalk.red(`✖ Directory ${projectName} already exists`));
      process.exit(1);
    }
    
    console.log(`\n🚀 ${brandGradient('Igniting project forge...')}\n`);
    
    try {
      if (options.interactive) {
        const interactiveSetup = require('../lib/interactive-setup');
        const config = await interactiveSetup.run(projectName, targetDir);
        
        console.log(chalk.green(`\n✔ Successfully forged ${chalk.bold(projectName)}`));
        
        const details = [
          `Network: ${chalk.cyan(config.network)}`,
          `Price: ${chalk.cyan(config.price)} USDC`,
          `Endpoint: ${chalk.cyan(config.endpoint)}`,
          `Stack: ${chalk.magenta(config.template)}`
        ].join('\n');
        
        console.log(boxen(details, {
          title: 'Project Config',
          padding: 1,
          borderColor: brandTeal
        }));
        
        console.log(chalk.blue('\n🛠️  Next Operations:'));
        console.log(`  ${chalk.cyan('cd')} ${projectName}`);
        console.log(`  ${chalk.cyan('npm install')}`);
        console.log(`  ${chalk.cyan('ascent dev')}`);
        
      } else {
        const spinner = ora(brandGradient('Scaffolding template...')).start();
        await createTemplate(targetDir, options.template, projectName);
        spinner.succeed(`Forged ${chalk.green(projectName)} using ${options.template} stack.`);
        
        console.log(`\n  ${chalk.cyan('cd')} ${projectName}`);
        console.log(`  ${chalk.cyan('ascent dev')}`);
      }
      
    } catch (error) {
      console.log(chalk.red(`\n✖ Forge failed: ${error.message}`));
      process.exit(1);
    }
  });

// Dev command
program
  .command('dev')
  .description('Start agent dev server with local facilitator')
  .option('-p, --port <port>', 'Server port', '3000')
  .option('-f, --facilitator-port <port>', 'Facilitator port', '4022')
  .option('--no-facilitator', 'Skip starting local facilitator')
  .action(async (options) => {
    console.log(`\n🔥 ${brandGradient('Ascent Development Environment starting...')}\n`);
    
    let facilitatorInstance = null;
    
    if (options.facilitator) {
      const facilitator = require('../lib/facilitator');
      facilitatorInstance = await facilitator.start({ port: options.facilitatorPort });
      
      console.log(chalk.green(`✓ Local Facilitator active on port ${options.facilitatorPort}`));
      process.env.FACILITATOR_URL = `http://localhost:${options.facilitatorPort}`;
    } else {
      console.log(chalk.blue('📡 Using public facilitator: https://x402-navy.vercel.app/facilitator/'));
    }
    
    console.log(chalk.yellow('🚀 Launching agent server...\n'));
    
    process.on('SIGINT', () => {
      console.log(`\n\n🛡️  ${chalk.yellow('Shutting down forge...')}`);
      if (facilitatorInstance) facilitatorInstance.stop();
      process.exit(0);
    });
    
    try {
      execSync('npm run dev', { stdio: 'inherit', env: process.env });
    } catch (e) {
      if (facilitatorInstance) facilitatorInstance.stop();
    }
  });

// Test command
program
  .command('test')
  .description('Test x402 payment flow with simulated wallets')
  .option('-w, --wallet <address>', 'Simulated wallet address')
  .option('-p, --private-key <key>', 'Wallet private key')
  .option('-a, --amount <amount>', 'Payment amount in USDC', '0.01')
  .option('-e, --endpoint <url>', 'API endpoint to test', 'http://localhost:3000/api/paid')
  .option('--all-wallets', 'Stress test with all 5 hackathon wallets')
  .action(async (options) => {
    console.log(`\n🧪 ${brandGradient('Running payment simulation...')}\n`);
    
    try {
      if (options.allWallets) {
        const multiTester = require('../lib/multi-wallet-tester');
        await multiTester.testAllWallets({
          amount: options.amount,
          endpoint: options.endpoint
        });
      } else {
        const multiTester = require('../lib/multi-wallet-tester');
        await multiTester.testSingle({
          wallet: options.wallet,
          privateKey: options.privateKey,
          amount: options.amount,
          endpoint: options.endpoint
        });
      }
    } catch (error) {
      console.log(chalk.red(`Sim failure: ${error.message}`));
    }
  });

// Monitor command
program
  .command('monitor')
  .description('Real-time payment flow monitoring')
  .option('-i, --interval <ms>', 'Refresh rate', '3000')
  .action(async (options) => {
    console.log(chalk.magenta('🔭 Ascent Transaction Monitor active.\n'));
    const monitor = require('../lib/monitor');
    await monitor.start({ interval: parseInt(options.interval) });
  });

// Move command
program
  .command('move <action>')
  .description('Aptos Move language agent helpers')
  .action(async (action) => {
    const moveHelper = require('../lib/move-helper');
    switch (action) {
      case 'init': await moveHelper.init(); break;
      case 'inject': await moveHelper.addPaymentLogic(); break;
      default: console.log(chalk.red(`Unknown action: ${action}`));
    }
  });

async function createTemplate(targetDir, template, projectName) {
  const templatesDir = path.join(__dirname, '..', 'templates', template);
  fs.copySync(templatesDir, targetDir);
  
  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = require(pkgPath);
    pkg.name = projectName;
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
  }
}

program.parse();
