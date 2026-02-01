// Analytics dashboard - Now launches AgentMesh Next.js UI
const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');

class AnalyticsDashboard {
  constructor() {
    this.process = null;
  }

  async start(options = {}) {
    const uiPort = options.port || 3003;
    const uiPath = path.join(__dirname, '..', 'examples', 'agentmesh-marketplace', 'ui');

    // Check if UI exists
    if (!fs.existsSync(uiPath)) {
      console.log(chalk.red('✖ AgentMesh UI not found at:'), uiPath);
      console.log(chalk.yellow('Make sure you have the latest code with examples/agentmesh-marketplace/ui/'));
      return;
    }

    console.log(chalk.blue('🚀 Starting AgentMesh Dashboard UI...'));
    console.log(chalk.gray(`UI Path: ${uiPath}`));
    console.log(chalk.gray(`Port: ${uiPort}`));
    console.log('');

    // Start Next.js dev server
    this.process = spawn('npm', ['run', 'dev'], {
      cwd: uiPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: uiPort.toString()
      }
    });

    this.process.on('error', (error) => {
      console.log(chalk.red(`✖ Failed to start UI: ${error.message}`));
    });

    this.process.on('exit', (code) => {
      if (code !== 0) {
        console.log(chalk.red(`✖ UI process exited with code ${code}`));
      }
    });

    console.log(chalk.green(`✓ AgentMesh Dashboard starting on http://localhost:${uiPort}`));
    console.log(chalk.gray('Press Ctrl+C to stop'));
  }

  stop() {
    if (this.process) {
      this.process.kill();
      console.log(chalk.yellow('🛑 Dashboard stopped'));
    }
  }
}

module.exports = new AnalyticsDashboard();
