// Config manager
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Config {
  show() {
    const envPath = path.join(process.cwd(), '.env.local');
    
    console.log(chalk.blue('Current Configuration:\n'));
    
    if (fs.existsSync(envPath)) {
      const env = fs.readFileSync(envPath, 'utf8');
      console.log(env);
    } else {
      console.log(chalk.yellow('No .env.local found. Run: aptos-x402 init <project>'));
    }
  }
}

module.exports = new Config();
