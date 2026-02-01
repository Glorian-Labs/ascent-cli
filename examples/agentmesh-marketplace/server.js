// AgentMesh Marketplace - Reputation-Gated Agent Commerce
const express = require('express');
const Database = require('better-sqlite3');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3007;
const DB_PATH = process.env.DB_PATH || './agentmesh.db';
const PAY_TO_ADDRESS = process.env.PAYMENT_RECIPIENT_ADDRESS;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402-navy.vercel.app/facilitator/';
const USDC_ASSET = "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832";
const MIN_AAIS_TO_LIST = 70;

// Initialize SQLite database
const db = new Database(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    aa_score REAL DEFAULT 50.0,
    total_transactions INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    total_earned TEXT DEFAULT '0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price TEXT NOT NULL, -- atomic USDC units
    endpoint TEXT, -- where to call the service
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_name) REFERENCES agents(name)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER,
    provider_name TEXT,
    consumer_name TEXT,
    amount TEXT,
    status TEXT, -- pending, completed, failed
    rating INTEGER, -- 1-5 stars
    review TEXT,
    tx_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id)
  );
`);

// AAIS Calculation Function
function calculateAAIS(agent) {
  const successRate = agent.total_transactions > 0 
    ? (agent.successful_transactions / agent.total_transactions) 
    : 0;
  
  const volumeScore = Math.min(parseInt(agent.total_earned) / 1000000, 20); // Max 20 pts for volume
  
  // Base: 30, Success: up to 50, Volume: up to 20
  const score = 30 + (successRate * 50) + volumeScore;
  return Math.min(Math.max(score, 0), 100);
}

// Update agent AAIS
function updateAgentAAIS(agentName) {
  const agent = db.prepare('SELECT * FROM agents WHERE name = ?').get(agentName);
  if (!agent) return null;
  
  const newScore = calculateAAIS(agent);
  db.prepare('UPDATE agents SET aa_score = ? WHERE name = ?').run(newScore, agentName);
  return newScore;
}

// Middleware: Check AAIS for service listing
function checkAAISForListing(req, res, next) {
  const { agent_name } = req.body;
  if (!agent_name) return res.status(400).json({ error: 'agent_name required' });
  
  let agent = db.prepare('SELECT * FROM agents WHERE name = ?').get(agent_name);
  
  // Auto-create agent if doesn't exist
  if (!agent) {
    db.prepare('INSERT INTO agents (name, address, aa_score) VALUES (?, ?, 50)')
      .run(agent_name, req.body.address || '0x0');
    agent = db.prepare('SELECT * FROM agents WHERE name = ?').get(agent_name);
  }
  
  if (agent.aa_score < MIN_AAIS_TO_LIST) {
    return res.status(403).json({
      error: `AAIS score ${agent.aa_score.toFixed(1)} below minimum ${MIN_AAIS_TO_LIST} to list services`,
      message: 'Complete more successful transactions to build reputation',
      aa_score: agent.aa_score
    });
  }
  
  req.agent = agent;
  next();
}

// x402 Payment Middleware
function requirePayment(amount) {
  return async (req, res, next) => {
    const paymentSignature = req.headers['payment-signature'];
    
    if (!paymentSignature) {
      const requirements = {
        x402Version: 2,
        error: "Payment required",
        accepts: [{
          scheme: "exact",
          network: "aptos:2",
          amount: amount,
          asset: USDC_ASSET,
          payTo: PAY_TO_ADDRESS,
          maxTimeoutSeconds: 300,
          extra: { symbol: "USDC", sponsored: true }
        }],
        resource: { url: req.originalUrl, description: "AgentMesh service", accepts: [] }
      };
      
      return res.status(402)
        .set('PAYMENT-REQUIRED', Buffer.from(JSON.stringify(requirements)).toString('base64'))
        .json({ error: "Payment required", aa_score_required: true });
    }
    
    try {
      const paymentPayload = JSON.parse(Buffer.from(paymentSignature, 'base64').toString());
      const paymentRequirements = {
        scheme: "exact", network: "aptos:2", amount: amount,
        asset: USDC_ASSET, payTo: PAY_TO_ADDRESS
      };
      
      const facilitatorUrl = FACILITATOR_URL.endsWith('/') ? FACILITATOR_URL : `${FACILITATOR_URL}/`;
      
      // Verify
      const verifyRes = await fetch(`${facilitatorUrl}verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPayload, paymentRequirements })
      });
      const verifyResult = await verifyRes.json();
      
      if (!verifyResult.isValid) return res.status(402).json({ error: "Invalid payment" });
      
      // Settle
      const settleRes = await fetch(`${facilitatorUrl}settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPayload, paymentRequirements })
      });
      const settleResult = await settleRes.json();
      
      if (!settleResult.success) return res.status(402).json({ error: "Settlement failed" });
      
      req.payment = { payload: paymentPayload, tx: settleResult.transaction };
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

// Routes

// 1. List a service (requires 70+ AAIS)
app.post('/services', checkAAISForListing, (req, res) => {
  const { title, description, category, price, endpoint } = req.body;
  
  if (!title || !price) {
    return res.status(400).json({ error: 'title and price required' });
  }
  
  const result = db.prepare(`
    INSERT INTO services (agent_name, title, description, category, price, endpoint)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.agent.name, title, description, category, price, endpoint);
  
  res.json({
    success: true,
    service_id: result.lastInsertRowid,
    message: `Service listed with AAIS ${req.agent.aa_score.toFixed(1)}`,
    aa_score: req.agent.aa_score
  });
});

// 2. Browse services (with reputation filters)
app.get('/services', (req, res) => {
  const { min_aais, category, agent } = req.query;
  
  let query = `
    SELECT s.*, a.aa_score, a.total_transactions, a.successful_transactions
    FROM services s
    JOIN agents a ON s.agent_name = a.name
    WHERE s.active = 1
  `;
  const params = [];
  
  if (min_aais) {
    query += ` AND a.aa_score >= ?`;
    params.push(parseFloat(min_aais));
  }
  if (category) {
    query += ` AND s.category = ?`;
    params.push(category);
  }
  if (agent) {
    query += ` AND s.agent_name = ?`;
    params.push(agent);
  }
  
  query += ` ORDER BY a.aa_score DESC, s.created_at DESC`;
  
  const services = db.prepare(query).all(...params);
  
  res.json({
    count: services.length,
    services: services.map(s => ({
      ...s,
      reputation_tier: s.aa_score >= 90 ? 'Elite' : s.aa_score >= 70 ? 'Verified' : s.aa_score >= 50 ? 'Standard' : 'New'
    }))
  });
});

// 3. Hire a service (pay via x402)
app.post('/services/:id/hire', async (req, res) => {
  const service = db.prepare('SELECT s.*, a.aa_score FROM services s JOIN agents a ON s.agent_name = a.name WHERE s.id = ?').get(req.params.id);
  
  if (!service) return res.status(404).json({ error: 'Service not found' });
  if (!service.active) return res.status(400).json({ error: 'Service inactive' });
  
  const { consumer_name } = req.body;
  if (!consumer_name) return res.status(400).json({ error: 'consumer_name required' });
  
  // Create pending transaction
  const txResult = db.prepare(`
    INSERT INTO transactions (service_id, provider_name, consumer_name, amount, status)
    VALUES (?, ?, ?, ?, 'pending')
  `).run(service.id, service.agent_name, consumer_name, service.price);
  
  res.json({
    success: true,
    transaction_id: txResult.lastInsertRowid,
    service: {
      id: service.id,
      title: service.title,
      provider: service.agent_name,
      aa_score: service.aa_score,
      price: service.price
    },
    payment_required: {
      amount: service.price,
      asset: USDC_ASSET,
      network: 'aptos:2'
    }
  });
});

// 4. Confirm payment and complete transaction
app.post('/transactions/:id/confirm', async (req, res) => {
  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
  if (transaction.status !== 'pending') return res.status(400).json({ error: 'Transaction not pending' });
  
  const paymentSignature = req.headers['payment-signature'];
  if (!paymentSignature) {
    return res.status(402).json({ error: 'Payment signature required' });
  }
  
  try {
    const paymentPayload = JSON.parse(Buffer.from(paymentSignature, 'base64').toString());
    const paymentRequirements = {
      scheme: "exact", network: "aptos:2", amount: transaction.amount,
      asset: USDC_ASSET, payTo: PAY_TO_ADDRESS
    };
    
    const facilitatorUrl = FACILITATOR_URL.endsWith('/') ? FACILITATOR_URL : `${FACILITATOR_URL}/`;
    
    // Verify & Settle
    const verifyRes = await fetch(`${facilitatorUrl}verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload, paymentRequirements })
    });
    
    if (!verifyRes.ok) return res.status(402).json({ error: 'Invalid payment' });
    
    const settleRes = await fetch(`${facilitatorUrl}settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload, paymentRequirements })
    });
    const settleResult = await settleRes.json();
    
    if (!settleResult.success) return res.status(402).json({ error: 'Settlement failed' });
    
    // Update transaction
    db.prepare('UPDATE transactions SET status = ?, tx_hash = ? WHERE id = ?')
      .run('completed', settleResult.transaction, req.params.id);
    
    // Update provider stats
    db.prepare('UPDATE agents SET total_transactions = total_transactions + 1, successful_transactions = successful_transactions + 1, total_earned = CAST(CAST(total_earned AS INTEGER) + ? AS TEXT) WHERE name = ?')
      .run(parseInt(transaction.amount), transaction.provider_name);
    
    // Update consumer stats
    db.prepare('UPDATE agents SET total_transactions = total_transactions + 1 WHERE name = ?')
      .run(transaction.consumer_name);
    
    // Recalculate AAIS
    const providerNewAAIS = updateAgentAAIS(transaction.provider_name);
    const consumerNewAAIS = updateAgentAAIS(transaction.consumer_name);
    
    res.json({
      success: true,
      message: 'Transaction completed',
      tx_hash: settleResult.transaction,
      provider_aais: providerNewAAIS,
      consumer_aais: consumerNewAAIS
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Rate a service (updates AAIS)
app.post('/transactions/:id/rate', (req, res) => {
  const { rating, review } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }
  
  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
  if (transaction.status !== 'completed') return res.status(400).json({ error: 'Transaction not completed' });
  
  // Update transaction with rating
  db.prepare('UPDATE transactions SET rating = ?, review = ? WHERE id = ?')
    .run(rating, review || null, req.params.id);
  
  // Rating affects provider's successful transactions weight
  if (rating >= 4) {
    db.prepare('UPDATE agents SET successful_transactions = successful_transactions + 1 WHERE name = ?')
      .run(transaction.provider_name);
  }
  
  // Recalculate AAIS
  const newAAIS = updateAgentAAIS(transaction.provider_name);
  
  res.json({
    success: true,
    message: `Rated ${rating}/5`,
    provider_new_aais: newAAIS
  });
});

// 6. Get agent profile with AAIS
app.get('/agents/:name', (req, res) => {
  const agent = db.prepare('SELECT * FROM agents WHERE name = ?').get(req.params.name);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  const services = db.prepare('SELECT * FROM services WHERE agent_name = ? AND active = 1').all(req.params.name);
  const transactions = db.prepare('SELECT * FROM transactions WHERE provider_name = ? OR consumer_name = ? ORDER BY created_at DESC LIMIT 10')
    .all(req.params.name, req.params.name);
  
  res.json({
    ...agent,
    reputation_tier: agent.aa_score >= 90 ? 'Elite' : agent.aa_score >= 70 ? 'Verified' : agent.aa_score >= 50 ? 'Standard' : 'New',
    services,
    recent_transactions: transactions
  });
});

// Development: Seed test data
app.post('/seed', (req, res) => {
  const { name, address, aa_score, total_transactions, successful_transactions } = req.body;
  
  try {
    // Check if agent exists
    const existing = db.prepare('SELECT * FROM agents WHERE name = ?').get(name);
    
    if (existing) {
      // Update
      db.prepare(`
        UPDATE agents 
        SET aa_score = ?, total_transactions = ?, successful_transactions = ?, address = ?
        WHERE name = ?
      `).run(aa_score, total_transactions, successful_transactions, address, name);
    } else {
      // Insert
      db.prepare(`
        INSERT INTO agents (name, address, aa_score, total_transactions, successful_transactions)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, address, aa_score, total_transactions, successful_transactions);
    }
    
    res.json({ 
      success: true, 
      message: `Agent ${name} seeded with AAIS ${aa_score}`,
      agent: { name, aa_score, tier: aa_score >= 90 ? 'Elite' : aa_score >= 70 ? 'Verified' : aa_score >= 50 ? 'Standard' : 'New' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', agentmesh: 'live', min_aais: MIN_AAIS_TO_LIST });
});

app.listen(PORT, () => {
  console.log(`\n🦞 AgentMesh Marketplace running on port ${PORT}`);
  console.log(`💰 Payment recipient: ${PAY_TO_ADDRESS}`);
  console.log(`🔐 Min AAIS to list: ${MIN_AAIS_TO_LIST}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /services          - List service (requires AAIS ${MIN_AAIS_TO_LIST}+)`);
  console.log(`  GET  /services          - Browse with reputation filters`);
  console.log(`  POST /services/:id/hire - Initiate service hire`);
  console.log(`  POST /transactions/:id/confirm - Confirm payment`);
  console.log(`  POST /transactions/:id/rate    - Rate provider`);
  console.log(`  GET  /agents/:name      - View agent profile\n`);
});
