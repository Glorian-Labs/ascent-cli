// AgentMesh Marketplace - Production Server with AAIS Integration
// Connects to on-chain AAIS (Ascent Agent Identity System) contracts

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: '.env.local' });

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:3000', 'http://127.0.0.1:3003'],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3007;
const DB_PATH = process.env.DB_PATH || './agentmesh.db';
const PAY_TO_ADDRESS = process.env.PAYMENT_RECIPIENT_ADDRESS;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402-navy.vercel.app/facilitator/';
const USDC_ASSET = "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832";
const MIN_AAIS_TO_LIST = 70;

// AAIS Module Configuration
const AAIS_MODULE_ADDRESS = process.env.AAIS_MODULE_ADDRESS;
const APTOS_NETWORK = process.env.APTOS_NETWORK === 'mainnet' ? Network.MAINNET : Network.TESTNET;

// Initialize Aptos client
const aptos = new Aptos(new AptosConfig({ network: APTOS_NETWORK }));

// Initialize SQLite database (for caching/off-chain data)
const db = new Database(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    agent_id TEXT UNIQUE, -- AAIS on-chain agent ID
    token_address TEXT, -- AAIS NFT token address
    aa_score REAL DEFAULT 50.0,
    on_chain_score INTEGER DEFAULT 0, -- From AAIS contract
    trust_level INTEGER DEFAULT 0, -- From AAIS contract
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
    payment_hash TEXT, -- x402 payment hash
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id)
  );

  CREATE INDEX IF NOT EXISTS idx_agents_score ON agents(aa_score DESC);
  CREATE INDEX IF NOT EXISTS idx_services_agent ON services(agent_name);
  CREATE INDEX IF NOT EXISTS idx_transactions_service ON transactions(service_id);
`);

// ==================== AAIS INTEGRATION ====================

/**
 * Fetch agent reputation from AAIS Move contract
 */
async function fetchAAISReputation(agentId) {
  if (!AAIS_MODULE_ADDRESS || !agentId) return null;
  
  try {
    const result = await aptos.view({
      payload: {
        function: `${AAIS_MODULE_ADDRESS}::reputation::get_agent_score`,
        functionArguments: [agentId],
      },
    });

    return {
      totalScore: Number(result[0]),
      feedbackCount: Number(result[1]),
      averageScoreScaled: Number(result[2]),
      trustLevel: Number(result[3]),
      lastUpdated: Number(result[4]),
      totalVolume: Number(result[5]),
    };
  } catch (error) {
    console.error('Error fetching AAIS reputation:', error);
    return null;
  }
}

/**
 * Check if agent meets marketplace threshold
 */
async function checkMarketplaceThreshold(agentId) {
  if (!AAIS_MODULE_ADDRESS || !agentId) return false;
  
  try {
    const result = await aptos.view({
      payload: {
        function: `${AAIS_MODULE_ADDRESS}::reputation::meets_marketplace_threshold`,
        functionArguments: [agentId],
      },
    });
    return result[0];
  } catch (error) {
    console.error('Error checking marketplace threshold:', error);
    return false;
  }
}

/**
 * Get trust level label
 */
function getTrustLevelLabel(level) {
  const labels = ['Unknown', 'New', 'Developing', 'Established', 'Trusted', 'Excellent'];
  return labels[level] || 'Unknown';
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    aais_enabled: !!AAIS_MODULE_ADDRESS,
    network: APTOS_NETWORK,
    timestamp: new Date().toISOString()
  });
});

// Get all agents with AAIS scores
app.get('/api/agents', async (req, res) => {
  try {
    const agents = db.prepare(`
      SELECT a.*, 
        COUNT(DISTINCT s.id) as service_count,
        COUNT(DISTINCT t.id) as transaction_count
      FROM agents a
      LEFT JOIN services s ON a.name = s.agent_name AND s.active = 1
      LEFT JOIN transactions t ON a.name = t.provider_name
      GROUP BY a.name
      ORDER BY a.aa_score DESC
    `).all();

    // Enrich with on-chain data if available
    const enrichedAgents = await Promise.all(agents.map(async (agent) => {
      if (agent.agent_id && AAIS_MODULE_ADDRESS) {
        const onChainRep = await fetchAAISReputation(agent.agent_id);
        if (onChainRep) {
          return {
            ...agent,
            on_chain_reputation: onChainRep,
            trust_level_label: getTrustLevelLabel(onChainRep.trustLevel),
          };
        }
      }
      return agent;
    }));

    res.json(enrichedAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get agent details with full AAIS data
app.get('/api/agents/:name', async (req, res) => {
  try {
    const agent = db.prepare('SELECT * FROM agents WHERE name = ?').get(req.params.name);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const services = db.prepare('SELECT * FROM services WHERE agent_name = ? AND active = 1').all(req.params.name);
    
    // Fetch on-chain reputation
    let onChainRep = null;
    if (agent.agent_id && AAIS_MODULE_ADDRESS) {
      onChainRep = await fetchAAISReputation(agent.agent_id);
    }

    res.json({
      ...agent,
      services,
      on_chain_reputation: onChainRep,
      trust_level_label: onChainRep ? getTrustLevelLabel(onChainRep.trustLevel) : 'Unknown',
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Register new agent
app.post('/api/agents', async (req, res) => {
  try {
    const { name, address, agent_id, token_address } = req.body;
    
    if (!name || !address) {
      return res.status(400).json({ error: 'name and address required' });
    }

    // Check if agent_id is provided and meets threshold
    if (agent_id && AAIS_MODULE_ADDRESS) {
      const meetsThreshold = await checkMarketplaceThreshold(agent_id);
      if (!meetsThreshold) {
        return res.status(403).json({ 
          error: 'Agent does not meet AAIS threshold (70/100) for marketplace listing',
          aais_required: true
        });
      }
    }

    const stmt = db.prepare(`
      INSERT INTO agents (name, address, agent_id, token_address)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, address, agent_id || null, token_address || null);
    
    res.json({ 
      id: result.lastInsertRowid, 
      name, 
      address,
      agent_id,
      aa_score: 50 // Starting score
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Agent name already exists' });
    }
    res.status(500).json({ error: 'Failed to register agent' });
  }
});

// Get all services
app.get('/api/services', (req, res) => {
  try {
    const { category, min_score } = req.query;
    
    let query = `
      SELECT s.*, a.aa_score, a.name as agent_name_display
      FROM services s
      JOIN agents a ON s.agent_name = a.name
      WHERE s.active = 1
    `;
    const params = [];

    if (category) {
      query += ' AND s.category = ?';
      params.push(category);
    }

    if (min_score) {
      query += ' AND a.aa_score >= ?';
      params.push(min_score);
    }

    query += ' ORDER BY a.aa_score DESC, s.created_at DESC';

    const services = db.prepare(query).all(...params);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create new service
app.post('/api/services', async (req, res) => {
  try {
    const { agent_name, title, description, category, price, endpoint } = req.body;

    // Check agent exists and meets threshold
    const agent = db.prepare('SELECT * FROM agents WHERE name = ?').get(agent_name);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Check on-chain threshold if agent_id exists
    if (agent.agent_id && AAIS_MODULE_ADDRESS) {
      const meetsThreshold = await checkMarketplaceThreshold(agent.agent_id);
      if (!meetsThreshold) {
        return res.status(403).json({ 
          error: 'Agent AAIS score below marketplace threshold (70/100)',
          current_score: agent.aa_score
        });
      }
    } else if (agent.aa_score < MIN_AAIS_TO_LIST) {
      return res.status(403).json({ 
        error: `Agent AAIS score (${agent.aa_score}) below threshold (${MIN_AAIS_TO_LIST})`,
        current_score: agent.aa_score
      });
    }

    const stmt = db.prepare(`
      INSERT INTO services (agent_name, title, description, category, price, endpoint)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(agent_name, title, description, category, price, endpoint);
    
    res.json({ 
      id: result.lastInsertRowid,
      agent_name,
      title,
      price
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// ==================== X402 PAYMENT ROUTES ====================

// Request payment requirements
app.get('/api/services/:id/pay', (req, res) => {
  try {
    const service = db.prepare(`
      SELECT s.*, a.address as provider_address
      FROM services s
      JOIN agents a ON s.agent_name = a.name
      WHERE s.id = ? AND s.active = 1
    `).get(req.params.id);

    if (!service) return res.status(404).json({ error: 'Service not found' });

    const paymentRequirements = {
      x402Version: 2,
      scheme: "exact",
      network: APTOS_NETWORK === Network.MAINNET ? "aptos:1" : "aptos:2",
      amount: service.price,
      asset: USDC_ASSET,
      payTo: service.provider_address || PAY_TO_ADDRESS,
      maxTimeoutSeconds: 60,
      extra: {
        sponsored: true,
        service_id: service.id,
        service_title: service.title,
      }
    };

    res.setHeader('X-PAYMENT-REQUIRED', Buffer.from(JSON.stringify(paymentRequirements)).toString('base64'));
    res.status(402).json({
      error: 'Payment required',
      requirements: paymentRequirements
    });
  } catch (error) {
    console.error('Error requesting payment:', error);
    res.status(500).json({ error: 'Failed to request payment' });
  }
});

// Submit payment and call service
app.post('/api/services/:id/call', async (req, res) => {
  try {
    const { payment_payload, consumer_name } = req.body;
    const service_id = req.params.id;

    const service = db.prepare(`
      SELECT s.*, a.name as agent_name, a.address as provider_address
      FROM services s
      JOIN agents a ON s.agent_name = a.name
      WHERE s.id = ? AND s.active = 1
    `).get(service_id);

    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Verify payment with facilitator
    const verifyResponse = await fetch(`${FACILITATOR_URL}verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x402Version: 2,
        paymentPayload: payment_payload,
      }),
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.valid) {
      return res.status(400).json({ error: 'Invalid payment', details: verifyResult });
    }

    // Record transaction
    const txStmt = db.prepare(`
      INSERT INTO transactions (service_id, provider_name, consumer_name, amount, status, payment_hash)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `);
    const txResult = txStmt.run(service_id, service.agent_name, consumer_name || 'anonymous', service.price, payment_payload);

    // Call the actual service endpoint if provided
    let serviceResult = null;
    if (service.endpoint) {
      try {
        const serviceResponse = await fetch(service.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            payment_verified: true,
            consumer: consumer_name,
            service_id
          }),
        });
        serviceResult = await serviceResponse.json();
      } catch (err) {
        console.error('Service call failed:', err);
      }
    }

    // Settle payment
    const settleResponse = await fetch(`${FACILITATOR_URL}settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x402Version: 2,
        paymentPayload: payment_payload,
      }),
    });

    const settleResult = await settleResponse.json();

    if (settleResult.success) {
      // Update transaction status
      db.prepare(`UPDATE transactions SET status = 'completed', tx_hash = ? WHERE id = ?`)
        .run(settleResult.transaction, txResult.lastInsertRowid);

      // Update agent stats
      db.prepare(`
        UPDATE agents 
        SET total_transactions = total_transactions + 1,
            successful_transactions = successful_transactions + 1,
            total_earned = CAST(CAST(total_earned AS INTEGER) + ? AS TEXT)
        WHERE name = ?
      `).run(parseInt(service.price), service.agent_name);

      res.setHeader('X-PAYMENT-RESPONSE', Buffer.from(JSON.stringify(settleResult)).toString('base64'));
      res.json({
        success: true,
        transaction_hash: settleResult.transaction,
        service_result: serviceResult,
      });
    } else {
      db.prepare(`UPDATE transactions SET status = 'failed' WHERE id = ?`).run(txResult.lastInsertRowid);
      res.status(400).json({ error: 'Payment settlement failed', details: settleResult });
    }
  } catch (error) {
    console.error('Error processing service call:', error);
    res.status(500).json({ error: 'Failed to process service call' });
  }
});

// Submit rating after transaction
app.post('/api/transactions/:id/rate', async (req, res) => {
  try {
    const { rating, review } = req.body;
    const transaction_id = req.params.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transaction_id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    // Update transaction with rating
    db.prepare('UPDATE transactions SET rating = ?, review = ? WHERE id = ?')
      .run(rating, review || null, transaction_id);

    // Update agent AAIS score
    const agent = db.prepare('SELECT * FROM agents WHERE name = ?').get(transaction.provider_name);
    if (agent) {
      // Simple AAIS calculation: base 30 + success_rate * 50 + volume/1M * 20
      const successRate = agent.total_transactions > 0 
        ? (agent.successful_transactions / agent.total_transactions) 
        : 0;
      const volumeScore = Math.min(parseInt(agent.total_earned) / 1000000, 20);
      const newScore = 30 + (successRate * 50) + volumeScore;
      
      db.prepare('UPDATE agents SET aa_score = ? WHERE name = ?')
        .run(Math.min(newScore, 100), transaction.provider_name);
    }

    res.json({ success: true, message: 'Rating submitted' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// ==================== AAIS DIRECT INTEGRATION ====================

// Attest feedback directly to AAIS contract
app.post('/api/aait/attest', async (req, res) => {
  try {
    const { agent_id, score, payment_hash, service_rating, payment_amount } = req.body;
    
    if (!AAIS_MODULE_ADDRESS) {
      return res.status(503).json({ error: 'AAIS not configured' });
    }

    // This would require the client's private key to sign the transaction
    // For demo purposes, return the attestation data that would be submitted
    res.json({
      status: 'ready',
      attestation: {
        agent_id,
        score,
        payment_hash,
        service_rating,
        payment_amount,
        module: `${AAIS_MODULE_ADDRESS}::reputation::attest_feedback`,
      },
      message: 'Submit this data via AAISClient.attestFeedback() with your private key'
    });
  } catch (error) {
    console.error('Error preparing attestation:', error);
    res.status(500).json({ error: 'Failed to prepare attestation' });
  }
});

// Get on-chain reputation for agent
app.get('/api/aait/reputation/:agent_id', async (req, res) => {
  try {
    const { agent_id } = req.params;
    
    if (!AAIS_MODULE_ADDRESS) {
      return res.status(503).json({ error: 'AAIS not configured' });
    }

    const reputation = await fetchAAISReputation(agent_id);
    if (!reputation) {
      return res.status(404).json({ error: 'No on-chain reputation found' });
    }

    res.json({
      ...reputation,
      trust_level_label: getTrustLevelLabel(reputation.trustLevel),
    });
  } catch (error) {
    console.error('Error fetching AAIS reputation:', error);
    res.status(500).json({ error: 'Failed to fetch reputation' });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    AGENTMESH MARKETPLACE                        ║
║                      Production Server                          ║
╠════════════════════════════════════════════════════════════════╣
║  Port:        ${PORT}                                           ║
║  Network:     ${APTOS_NETWORK}                                  ║
║  AAIS:        ${AAIS_MODULE_ADDRESS ? '✅ Connected' : '⚠️  Not configured'}                      ║
║  Facilitator: ${FACILITATOR_URL}                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
