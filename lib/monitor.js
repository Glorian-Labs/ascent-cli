// Payment monitor
const chalk = require('chalk');

class PaymentMonitor {
  async start(options) {
    console.log(chalk.cyan('📊 x402 Payment Monitor\n'));
    console.log(chalk.gray('Watching for payment flows...\n'));
    
    const stats = {
      totalPayments: 0,
      totalVolume: 0,
      lastPayment: null
    };

    setInterval(() => {
      // Clear screen
      console.clear();
      
      console.log(chalk.cyan('╔════════════════════════════════════════════════════════════╗'));
      console.log(chalk.cyan('║              x402 Payment Monitor                          ║'));
      console.log(chalk.cyan('╚════════════════════════════════════════════════════════════╝\n'));
      
      console.log(chalk.blue('Statistics:'));
      console.log(`  Total Payments: ${chalk.green(stats.totalPayments)}`);
      console.log(`  Total Volume:   ${chalk.green(stats.totalVolume + ' USDC')}`);
      console.log(`  Last Payment:   ${chalk.gray(stats.lastPayment || 'None')}`);
      
      console.log(chalk.gray('\nPress Ctrl+C to exit'));
      
      // Simulate incoming data
      if (Math.random() > 0.7) {
        stats.totalPayments++;
        stats.totalVolume += 0.01;
        stats.lastPayment = new Date().toISOString();
      }
      
    }, options.interval);
  }
}

module.exports = new PaymentMonitor();
