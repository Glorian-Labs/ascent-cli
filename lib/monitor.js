// Payment monitor
const chalk = require('chalk');
const Table = require('cli-table3');
const gradient = require('gradient-string').default;

class PaymentMonitor {
  async start(options) {
    const brandPurple = '#9A4DFF';
    const brandTeal = '#00F5FF';
    const brandGradient = gradient(brandPurple, brandTeal);

    console.log(chalk.magenta('🔭 Ascent Transaction Monitor active.\n'));
    
    const stats = {
      totalPayments: 0,
      totalVolume: 0,
      successCount: 0,
      failCount: 0,
      lastEvent: null,
      history: []
    };

    setInterval(() => {
      console.clear();
      
      console.log(brandGradient('══════════════════════════════════════════════════════════════'));
      console.log(brandGradient('║                 ASCENT TRANSACTION MONITOR                 ║'));
      console.log(brandGradient('══════════════════════════════════════════════════════════════\n'));
      
      const table = new Table({
        head: [chalk.cyan('Metric'), chalk.cyan('Value')],
        colWidths: [20, 40],
        style: { head: [], border: [] }
      });

      table.push(
        ['Total Flows', chalk.bold(stats.totalPayments)],
        ['Total Volume', chalk.green(stats.totalVolume.toFixed(2) + ' USDC')],
        ['Successes', chalk.green(stats.successCount)],
        ['Failures', chalk.red(stats.failCount)],
        ['Last Event', chalk.gray(stats.lastEvent || 'N/A')]
      );

      console.log(table.toString());
      
      if (stats.history.length > 0) {
        console.log(chalk.bold('\nRecent Events:'));
        stats.history.slice(-5).reverse().forEach(ev => {
          const color = ev.status === 'SUCCESS' ? chalk.green : chalk.red;
          console.log(`  ${chalk.gray(ev.time)} | ${color(ev.status)} | ${ev.amount} USDC | ${chalk.blue(ev.payer)}`);
        });
      }
      
      console.log(chalk.gray('\nPress Ctrl+C to exit session...'));
      
      // Simulation logic
      if (Math.random() > 0.6) {
        const isSuccess = Math.random() > 0.2;
        const amount = 0.01;
        stats.totalPayments++;
        if (isSuccess) {
          stats.successCount++;
          stats.totalVolume += amount;
        } else {
          stats.failCount++;
        }
        
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        stats.lastEvent = isSuccess ? 'PAYMENT_RECEIVED' : 'PAYMENT_FAILED';
        
        stats.history.push({
          time: timeStr,
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          amount: amount,
          payer: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6)
        });
      }
      
    }, options.interval);
  }
}

module.exports = new PaymentMonitor();
