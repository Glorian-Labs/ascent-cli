// Analytics dashboard with SQLite persistence
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const Database = require('better-sqlite3');

class AnalyticsDashboard {
  constructor() {
    this.app = express();
    this.db = null;
    this.server = null;
  }

  async start(options = {}) {
    const port = options.port || 3456;
    const dbPath = options.dbPath || './payments.db';

    // Initialize database
    this.initDatabase(dbPath);

    // Middleware
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '..', 'dashboard')));

    // API Routes
    this.app.get('/api/analytics', (req, res) => {
      try {
        const stats = this.getStats();
        const transactions = this.getRecentTransactions(50);
        
        res.json({
          ...stats,
          transactions
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/stats', (req, res) => {
      try {
        res.json(this.getStats());
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/transactions', (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 100;
        res.json(this.getRecentTransactions(limit));
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/record', (req, res) => {
      try {
        const { payer, amount, status, txHash, endpoint } = req.body;
        this.recordPayment(payer, amount, status, txHash, endpoint);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Serve dashboard HTML if not exists
    this.ensureDashboardHTML();

    this.server = this.app.listen(port, () => {
      console.log(chalk.cyan(`\n╔════════════════════════════════════════════════════════════╗`));
      console.log(chalk.cyan(`║              x402 Analytics Dashboard                      ║`));
      console.log(chalk.cyan(`╚════════════════════════════════════════════════════════════╝`));
      console.log(chalk.blue(`\n📊 Dashboard: http://localhost:${port}`));
      console.log(chalk.gray(`   Database: ${path.resolve(dbPath)}`));
      console.log(chalk.gray(`\n   Press Ctrl+C to stop`));
    });

    return {
      url: `http://localhost:${port}`,
      stop: () => {
        this.server.close();
        this.db.close();
      }
    };
  }

  initDatabase(dbPath) {
    fs.ensureDirSync(path.dirname(path.resolve(dbPath)) || '.');
    this.db = new Database(dbPath);

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        payer TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        txHash TEXT,
        endpoint TEXT,
        network TEXT DEFAULT 'aptos:2'
      );

      CREATE INDEX IF NOT EXISTS idx_payer ON payments(payer);
      CREATE INDEX IF NOT EXISTS idx_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON payments(timestamp);
    `);
  }

  recordPayment(payer, amount, status, txHash, endpoint) {
    const stmt = this.db.prepare(`
      INSERT INTO payments (payer, amount, status, txHash, endpoint)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(payer, amount, status, txHash, endpoint);
  }

  getStats() {
    const totalPayments = this.db.prepare('SELECT COUNT(*) as count FROM payments').get().count;
    const totalVolume = this.db.prepare('SELECT COALESCE(SUM(amount), 0) as volume FROM payments WHERE status = ?').get('success').volume;
    const successfulPayments = this.db.prepare('SELECT COUNT(*) as count FROM payments WHERE status = ?').get('success').count;
    const uniquePayers = this.db.prepare('SELECT COUNT(DISTINCT payer) as count FROM payments').get().count;
    
    const successRate = totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(1) : 0;

    return {
      totalPayments,
      totalVolume: parseFloat(totalVolume || 0),
      successRate: parseFloat(successRate),
      uniquePayers,
      successfulPayments
    };
  }

  getRecentTransactions(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM payments
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  ensureDashboardHTML() {
    const dashboardDir = path.join(process.cwd(), 'dashboard');
    const dashboardPath = path.join(dashboardDir, 'index.html');

    if (!fs.existsSync(dashboardPath)) {
      fs.ensureDirSync(dashboardDir);
      
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>x402 Payment Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
    header { text-align: center; margin-bottom: 40px; }
    h1 { font-size: 2.5em; margin-bottom: 10px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: #64748b; }
    .stats { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
      gap: 20px; 
      margin-bottom: 40px; 
    }
    .stat-card { 
      background: linear-gradient(135deg, #1e293b, #334155); 
      padding: 30px; 
      border-radius: 16px; 
      text-align: center;
      border: 1px solid #334155;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-5px); }
    .stat-value { 
      font-size: 3em; 
      font-weight: bold; 
      background: linear-gradient(135deg, #3b82f6, #22c55e); 
      -webkit-background-clip: text; 
      -webkit-text-fill-color: transparent; 
    }
    .stat-label { color: #94a3b8; margin-top: 10px; font-size: 0.9em; }
    .transactions { background: #1e293b; border-radius: 16px; padding: 30px; border: 1px solid #334155; }
    .transactions h2 { margin-bottom: 20px; color: #f8fafc; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 15px; color: #94a3b8; font-weight: 500; border-bottom: 2px solid #334155; }
    td { padding: 15px; border-bottom: 1px solid #334155; }
    tr:hover { background: #334155; }
    .status-success { color: #22c55e; font-weight: 500; }
    .status-failed { color: #ef4444; font-weight: 500; }
    .status-pending { color: #f59e0b; font-weight: 500; }
    .tx-hash { font-family: monospace; font-size: 0.9em; }
    .tx-hash a { color: #3b82f6; text-decoration: none; }
    .tx-hash a:hover { text-decoration: underline; }
    .payer { font-family: monospace; font-size: 0.9em; color: #94a3b8; }
    .amount { font-weight: 500; color: #22c55e; }
    .live-indicator { 
      display: inline-flex; 
      align-items: center; 
      gap: 8px; 
      background: #22c55e20; 
      color: #22c55e; 
      padding: 8px 16px; 
      border-radius: 20px; 
      font-size: 0.85em;
      margin-top: 20px;
    }
    .live-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .empty-state { text-align: center; padding: 60px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🥠 x402 Payment Analytics</h1>
      <p class="subtitle">Real-time payment monitoring for Aptos x402</p>
      <div class="live-indicator"><span class="live-dot"></span> Live Updates</div>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value" id="totalPayments">-</div>
        <div class="stat-label">Total Payments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="totalVolume">-</div>
        <div class="stat-label">Volume (USDC)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="successRate">-</div>
        <div class="stat-label">Success Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="uniquePayers">-</div>
        <div class="stat-label">Unique Payers</div>
      </div>
    </div>

    <div class="transactions">
      <h2>Recent Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Payer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody id="transactions">
          <tr><td colspan="5" class="empty-state">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function loadData() {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        
        document.getElementById('totalPayments').textContent = data.totalPayments.toLocaleString();
        document.getElementById('totalVolume').textContent = data.totalVolume.toFixed(4);
        document.getElementById('successRate').textContent = data.successRate + '%';
        document.getElementById('uniquePayers').textContent = data.uniquePayers.toLocaleString();
        
        const tbody = document.getElementById('transactions');
        
        if (data.transactions.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No payments yet. Start accepting x402 payments!</td></tr>';
          return;
        }
        
        tbody.innerHTML = data.transactions.map(tx => \`
          <tr>
            <td>\${new Date(tx.timestamp).toLocaleString()}</td>
            <td class="payer">\${tx.payer.slice(0, 8)}...\${tx.payer.slice(-4)}</td>
            <td class="amount">+\${tx.amount} USDC</td>
            <td class="status-\${tx.status}">\${tx.status}</td>
            <td class="tx-hash">
              <a href="https://explorer.aptoslabs.com/txn/\${tx.txHash}?network=testnet" target="_blank">
                \${tx.txHash ? tx.txHash.slice(0, 12) + '...' : '-'}
              </a>
            </td>
          </tr>
        \`).join('');
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    
    loadData();
    setInterval(loadData, 3000);
  </script>
</body>
</html>
`;
      fs.writeFileSync(dashboardPath, html);
    }
  }
}

module.exports = new AnalyticsDashboard();
