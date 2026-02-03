#!/usr/bin/env node
/**
 * Ascent CLI - The elite toolkit for x402 payments on Aptos.
 * Forging the Future of Agent Commerce.
 */

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { spawn, execSync } = require('child_process');
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
      const isTTY = typeof process.stdin.isTTY === 'boolean' && process.stdin.isTTY;
      const useInteractive = options.interactive && isTTY;

      if (useInteractive) {
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
        if (options.interactive && !isTTY) {
          console.log(chalk.yellow('Terminal is not interactive; scaffolding with defaults.'));
          console.log(chalk.gray('Run with --no-interactive to suppress this message. Edit .env.local after (see README).\n'));
        }
        const spinner = ora(brandGradient('Scaffolding template...')).start();
        await createTemplate(targetDir, options.template, projectName);
        spinner.succeed(`Forged ${chalk.green(projectName)} using ${options.template} stack.`);
        
        console.log(`\n  ${chalk.cyan('cd')} ${projectName}`);
        console.log(`  ${chalk.cyan('npm install')}`);
        console.log(`  ${chalk.cyan('ascent dev')}`);
      }
      
    } catch (error) {
      console.log(chalk.red(`\n✖ Forge failed: ${error.message}`));
      process.exit(1);
    }
  });

// Dev command (run from x402 project directory: ascent dev)
program
  .command('dev')
  .description('Start agent dev server with local facilitator (run from project directory)')
  .option('-p, --port <port>', 'Server port', '3006')
  .option('-f, --facilitator-port <port>', 'Facilitator port', '4022')
  .option('--no-facilitator', 'Skip starting local facilitator')
  .action(async (options) => {
    // Load project .env.local so facilitator gets APTOS_PRIVATE_KEY etc. (run from project directory)
    const projectEnv = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(projectEnv)) {
      const content = fs.readFileSync(projectEnv, 'utf8');
      content.split('\n').forEach((line) => {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m) {
          const val = m[2].replace(/^["']|["']$/g, '').trim();
          if (val) process.env[m[1]] = val;
        }
      });
    }
    console.log(`\n🔥 ${brandGradient('Ascent Development Environment starting...')}\n`);
    console.log(chalk.gray(`   CWD: ${process.cwd()}\n`));
    let facilitatorInstance = null;
    if (options.facilitator) {
      const facilitator = require('../lib/facilitator');
      facilitatorInstance = await facilitator.start({ port: options.facilitatorPort });
      const localFacilitatorUrl = `http://localhost:${options.facilitatorPort}`;
      console.log(chalk.green(`✓ Local Facilitator active on port ${options.facilitatorPort}`));
      process.env.FACILITATOR_URL = localFacilitatorUrl;
      // Write .env.ascent-dev so the server (npm run dev) uses local facilitator even if env isn't inherited
      const ascentDevEnv = path.join(process.cwd(), '.env.ascent-dev');
      fs.writeFileSync(ascentDevEnv, `FACILITATOR_URL=${localFacilitatorUrl}\n`, 'utf8');
    } else {
      console.log(chalk.blue('📡 Using public facilitator: https://x402-navy.vercel.app/facilitator/'));
    }
    console.log(chalk.yellow('🚀 Launching agent server...\n'));
    const ascentDevEnv = path.join(process.cwd(), '.env.ascent-dev');
    const removeEnv = () => {
      if (fs.existsSync(ascentDevEnv)) try { fs.unlinkSync(ascentDevEnv); } catch (_) {}
    };
    const stopAndExit = (code) => {
      if (facilitatorInstance) {
        facilitatorInstance.stop(() => {
          removeEnv();
          process.exit(code ?? 0);
        });
      } else {
        removeEnv();
        process.exit(code ?? 0);
      }
    };
    const child = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      env: process.env,
      shell: true,
      cwd: process.cwd()
    });
    child.on('exit', (code) => {
      stopAndExit(code ?? 0);
    });
    process.on('SIGINT', () => {
      console.log(`\n\n🛡️  ${chalk.yellow('Shutting down forge...')}`);
      child.kill('SIGINT');
      stopAndExit(0);
    });
  });

// Test command
program
  .command('test')
  .description('Test x402 payment flow with simulated wallets')
  .option('-w, --wallet <address>', 'Simulated wallet address')
  .option('-p, --private-key <key>', 'Wallet private key')
  .option('-a, --amount <amount>', 'Payment amount in USDC', '0.01')
  .option('-e, --endpoint <url>', 'API endpoint to test', 'http://localhost:3006/api/paid')
  .option('-f, --facilitator <url>', 'Facilitator URL')
  .option('--all-wallets', 'Stress test with all 5 test wallets')
  .action(async (options) => {
    console.log(`\n🧪 ${brandGradient('Running payment simulation...')}\n`);
    
    try {
      if (options.allWallets) {
        const multiTester = require('../lib/multi-wallet-tester');
        const results = await multiTester.testAllWallets({
          amount: options.amount,
          endpoint: options.endpoint,
          facilitatorUrl: options.facilitator
        });
        const passed = results.filter(r => r.success).length;
        if (results.length === 0 || passed === 0) {
          process.exit(1);
        }
      } else {
        const multiTester = require('../lib/multi-wallet-tester');
        const result = await multiTester.testSingle({
          wallet: options.wallet,
          privateKey: options.privateKey,
          amount: options.amount,
          endpoint: options.endpoint,
          facilitatorUrl: options.facilitator
        });
        if (!result || !result.success) {
          process.exit(1);
        }
      }
    } catch (error) {
      console.log(chalk.red(`Sim failure: ${error.message}`));
      process.exit(1);
    }
  });

// Logs command – where to see output
program
  .command('logs')
  .description('Show where dev server and facilitator logs appear')
  .action(() => {
    console.log(chalk.cyan('\n📋 Ascent logs\n'));
    console.log('When you run ');
    console.log(chalk.cyan('  ascent dev'));
    console.log(' from a project folder, all output goes to that same terminal:\n');
    console.log('  • ' + chalk.gray('[facilitator]') + ' POST /verify, POST /settle – local facilitator requests');
    console.log('  • ' + chalk.gray('[api/paid]') + ' Payment received, verify, settle – API server handling payments\n');
    console.log('There is no separate log file. Keep the terminal where ');
    console.log(chalk.cyan('ascent dev'));
    console.log(' is running open to watch logs.\n');
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

// Dashboard command
program
  .command('dashboard')
  .description('Start web analytics dashboard')
  .option('-p, --port <port>', 'Dashboard port', '3456')
  .option('-d, --db <path>', 'Database path', './payments.db')
  .action(async (options) => {
    const dashboard = require('../lib/dashboard');
    await dashboard.start({ 
      port: parseInt(options.port),
      dbPath: options.db
    });
  });

// Identity command
program
  .command('identity <action>')
  .description('Manage agent identity and reputation')
  .option('-a, --address <address>', 'Agent wallet address')
  .option('-n, --name <name>', 'Display name for the agent')
  .option('-d, --db <path>', 'Database path', './payments.db')
  .action(async (action, options) => {
    const Database = require('better-sqlite3');
    const db = new Database(options.db);
    
    // Ensure table exists
    db.prepare(`
      CREATE TABLE IF NOT EXISTS agent_identities (
        address TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        reputation_score REAL DEFAULT 50,
        total_spent REAL DEFAULT 0,
        successful_txs INTEGER DEFAULT 0,
        failed_txs INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    switch (action) {
      case 'register':
        if (!options.address || !options.name) {
          console.log(chalk.red('Error: Provide --address and --name'));
          return;
        }
        db.prepare(`
          INSERT INTO agent_identities (address, name)
          VALUES (?, ?)
          ON CONFLICT(address) DO UPDATE SET name = excluded.name
        `).run(options.address, options.name);
        console.log(chalk.green(`✓ Agent ${chalk.bold(options.name)} registered for ${options.address}`));
        break;
        
      case 'list':
        const allAgents = db.prepare('SELECT * FROM agent_identities ORDER BY reputation_score DESC').all();
        console.log(`\n${chalk.bold('Agent Identity Registry')}`);
        allAgents.forEach(a => {
          const scoreColor = a.reputation_score > 70 ? chalk.green : (a.reputation_score > 40 ? chalk.yellow : chalk.red);
          console.log(`  ${chalk.cyan(a.name.padEnd(20))} | ${a.address.slice(0, 10)}... | Score: ${scoreColor(a.reputation_score.toString().padStart(3))}`);
        });
        break;

      case 'show':
        if (!options.address) {
          console.log(chalk.red('Error: Provide --address'));
          return;
        }
        const agent = db.prepare('SELECT * FROM agent_identities WHERE address = ?').get(options.address);
        if (!agent) {
          console.log(chalk.yellow(`No identity found for ${options.address}`));
          return;
        }
        console.log(`\n${chalk.bold('Agent Metrics: ' + agent.name)}`);
        console.log(`  Address:    ${chalk.cyan(agent.address)}`);
        console.log(`  Trust Score: ${agent.reputation_score > 70 ? chalk.green(agent.reputation_score) : chalk.red(agent.reputation_score)}/100`);
        console.log(`  Total Spent: ${chalk.green(agent.total_spent.toFixed(2))} USDC`);
        console.log(`  Success Rate: ${chalk.cyan(Math.round((agent.successful_txs / (agent.successful_txs + agent.failed_txs)) * 100))}%`);
        break;
        
      default:
        console.log(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.blue('Available: register, list, show'));
    }
    db.close();
  });

// Kill command - Kill stuck Ascent processes
program
  .command('kill')
  .description('Kill all running Ascent server processes')
  .option('-p, --port <port>', 'Kill specific port only')
  .action(async (options) => {
    const { execSync } = require('child_process');
    
    if (options.port) {
      // Kill specific port
      try {
        execSync(`lsof -ti:${options.port} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' });
        console.log(chalk.green(`✓ Killed process on port ${options.port}`));
      } catch {
        console.log(chalk.yellow(`No process found on port ${options.port}`));
      }
    } else {
      // Kill all common Ascent ports
      const ports = ['3006', '4022', '3007', '3003', '3000'];
      let killed = 0;
      
      for (const port of ports) {
        try {
          execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' });
          console.log(chalk.green(`✓ Killed process on port ${port}`));
          killed++;
        } catch {
          // No process on this port
        }
      }
      
      if (killed === 0) {
        console.log(chalk.blue('ℹ No Ascent processes found running'));
      } else {
        console.log(chalk.green(`\n✓ Killed ${killed} process(es)`));
        console.log(chalk.gray('You can now start fresh with: ascent dev'));
      }
    }
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
