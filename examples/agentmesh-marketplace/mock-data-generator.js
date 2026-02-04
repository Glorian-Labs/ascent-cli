// Mock data generator for AgentMesh UI testing
// Matches actual database schema
// Run with: node mock-data-generator.js

const fs = require('fs');
const path = require('path');

// Utility functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAddress = () => '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

// Agent name generators
const agentPrefixes = [
  'Data', 'Code', 'Web', 'Auto', 'Smart', 'Cyber', 'Net', 'Cloud', 
  'AI', 'Bot', 'Agent', 'Synth', 'Quantum', 'Neural', 'Deep', 'Fast',
  'Secure', 'Verify', 'Check', 'Scan', 'Build', 'Deploy', 'Test',
  'Analyze', 'Process', 'Stream', 'Block', 'Chain', 'Crypto', 'DeFi'
];

const agentSuffixes = [
  'Master', 'Wizard', 'Pro', 'Elite', 'Prime', 'Core', 'Node', 'Hub',
  'Engine', 'Bot', 'Agent', 'Helper', 'Assistant', 'Worker', 'Miner',
  'Scout', 'Guard', 'Sentinel', 'Oracle', 'Relay', 'Bridge', 'Link'
];

const generateAgentName = () => {
  const prefix = randomChoice(agentPrefixes);
  const suffix = randomChoice(agentSuffixes);
  const number = randomInt(1, 999);
  return `${prefix}${suffix}_${number}`;
};

// Service categories and types
const serviceCategories = [
  { name: 'AI/ML', services: ['Sentiment Analysis', 'Image Recognition', 'Text Generation', 'Data Classification', 'Prediction Model', 'NLP Processing'] },
  { name: 'Data', services: ['Data Scraping', 'Data Cleaning', 'Data Analysis', 'Data Visualization', 'Database Query', 'Data Export'] },
  { name: 'Security', services: ['Vulnerability Scan', 'Code Audit', 'Dependency Check', 'Security Review', 'Penetration Test', 'Threat Analysis'] },
  { name: 'Development', services: ['Code Review', 'Bug Fix', 'Feature Implementation', 'API Integration', 'Testing', 'Documentation'] },
  { name: 'Web3', services: ['Smart Contract Audit', 'Token Analysis', 'DeFi Strategy', 'NFT Valuation', 'Chain Analysis', 'Gas Optimization'] },
  { name: 'Content', services: ['Content Writing', 'SEO Optimization', 'Social Media', 'Translation', 'Summarization', 'Research'] }
];

// Generate AAIS score with realistic distribution
const generateAASScore = () => {
  const r = Math.random();
  if (r < 0.05) return randomInt(900, 1000) / 10; // Elite (5%)
  if (r < 0.25) return randomInt(700, 899) / 10;  // Verified (20%)
  if (r < 0.70) return randomInt(500, 699) / 10;  // Standard (45%)
  return randomInt(300, 499) / 10;                 // New (30%)
};

const getTierFromScore = (score) => {
  if (score >= 90) return 'Elite';
  if (score >= 70) return 'Verified';
  if (score >= 50) return 'Standard';
  return 'New';
};

// Generate agent
const generateAgent = (index) => {
  const name = generateAgentName();
  const address = randomAddress();
  const aaScore = generateAASScore();
  
  // Transaction stats based on score
  const baseTransactions = aaScore >= 90 ? randomInt(50, 200) :
                          aaScore >= 70 ? randomInt(20, 100) :
                          aaScore >= 50 ? randomInt(5, 50) :
                          randomInt(0, 10);
  
  const successRate = aaScore >= 90 ? randomInt(95, 100) :
                     aaScore >= 70 ? randomInt(85, 95) :
                     aaScore >= 50 ? randomInt(70, 85) :
                     randomInt(50, 70);
  
  const totalTransactions = baseTransactions;
  const successfulTransactions = Math.floor(totalTransactions * (successRate / 100));
  const totalEarned = (successfulTransactions * randomInt(5, 25) * 1000000).toString();
  
  return {
    name,
    address,
    agent_id: randomAddress(), // AAIS on-chain ID
    token_address: randomAddress(), // NFT token
    aa_score: aaScore,
    on_chain_score: Math.floor(aaScore * 10),
    trust_level: Math.floor(aaScore / 10),
    total_transactions: totalTransactions,
    successful_transactions: successfulTransactions,
    total_earned: totalEarned,
    tier: getTierFromScore(aaScore)
  };
};

// Generate service
const generateService = (agentName, index) => {
  const category = randomChoice(serviceCategories);
  const serviceName = randomChoice(category.services);
  const priceUSDC = randomInt(1, 50);
  
  const descriptions = [
    `Professional ${serviceName.toLowerCase()} service with fast turnaround`,
    `High-quality ${serviceName.toLowerCase()} delivered by experienced agent`,
    `AI-powered ${serviceName.toLowerCase()} with 99% accuracy guarantee`,
    `Reliable ${serviceName.toLowerCase()} service for your needs`,
    `Expert-level ${serviceName.toLowerCase()} with detailed reporting`
  ];
  
  return {
    agent_name: agentName,
    title: serviceName,
    description: randomChoice(descriptions),
    category: category.name,
    price: (priceUSDC * 1000000).toString(),
    endpoint: `/api/services/${agentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
    active: 1
  };
};

// Generate transaction
const generateTransaction = (index, services) => {
  const service = randomChoice(services);
  const provider = service.agent_name;
  
  // Generate a different consumer
  let consumer;
  do {
    consumer = randomChoice(services).agent_name;
  } while (consumer === provider);
  
  const statuses = ['completed', 'completed', 'completed', 'completed', 'pending'];
  const status = randomChoice(statuses);
  
  return {
    service_id: index % services.length + 1,
    provider_name: provider,
    consumer_name: consumer,
    amount: service.price,
    status,
    rating: status === 'completed' ? randomInt(3, 5) : null,
    review: status === 'completed' && Math.random() > 0.7 ? 
      randomChoice([
        'Great service, highly recommended!',
        'Fast and professional work.',
        'Exceeded expectations.',
        'Good communication and delivery.',
        'Will hire again!'
      ]) : null,
    tx_hash: Math.random() > 0.5 ? randomAddress() : null,
    payment_hash: Math.random() > 0.5 ? randomAddress() : null
  };
};

// Generate all mock data
const generateMockData = () => {
  console.log('🎲 Generating mock data...\n');
  
  // Generate 50 agents
  const numAgents = 50;
  const agents = Array(numAgents).fill(0).map((_, i) => generateAgent(i + 1));
  console.log(`✅ Generated ${numAgents} agents`);
  
  // Calculate stats
  const eliteCount = agents.filter(a => a.tier === 'Elite').length;
  const verifiedCount = agents.filter(a => a.tier === 'Verified').length;
  const standardCount = agents.filter(a => a.tier === 'Standard').length;
  const newCount = agents.filter(a => a.tier === 'New').length;
  
  console.log(`   Elite: ${eliteCount} | Verified: ${verifiedCount} | Standard: ${standardCount} | New: ${newCount}`);
  
  // Generate services (1-3 per agent)
  const services = [];
  for (const agent of agents) {
    const numServices = randomInt(1, 3);
    for (let i = 0; i < numServices; i++) {
      services.push(generateService(agent.name, i));
    }
  }
  console.log(`✅ Generated ${services.length} services`);
  
  // Generate 100 transactions
  const numTransactions = 100;
  const transactions = Array(numTransactions).fill(0).map((_, i) => 
    generateTransaction(i + 1, services)
  );
  console.log(`✅ Generated ${numTransactions} transactions`);
  
  // Calculate volume
  const totalVolume = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseInt(t.amount), 0);
  console.log(`   Total Volume: ${(totalVolume / 1000000).toFixed(2)} USDC`);
  
  return { agents, services, transactions };
};

// Save to SQLite database
const saveToDatabase = (data) => {
  const dbPath = path.join(__dirname, 'agentmesh.db');
  
  let db;
  try {
    const Database = require('better-sqlite3');
    db = new Database(dbPath);
    console.log('\n💾 Saving to database...');
  } catch (e) {
    console.log('\n⚠️  better-sqlite3 not available, saving to JSON instead');
    const jsonPath = path.join(__dirname, 'mock-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved to ${jsonPath}`);
    return;
  }
  
  // Clear existing data (keep table structure)
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM services');
  db.exec('DELETE FROM agents');
  
  // Reset auto-increment
  db.exec("DELETE FROM sqlite_sequence WHERE name='agents'");
  db.exec("DELETE FROM sqlite_sequence WHERE name='services'");
  db.exec("DELETE FROM sqlite_sequence WHERE name='transactions'");
  
  // Insert agents
  const insertAgent = db.prepare(`
    INSERT INTO agents (name, address, agent_id, token_address, aa_score, 
                       on_chain_score, trust_level, total_transactions, 
                       successful_transactions, total_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const agent of data.agents) {
    insertAgent.run(
      agent.name,
      agent.address,
      agent.agent_id,
      agent.token_address,
      agent.aa_score,
      agent.on_chain_score,
      agent.trust_level,
      agent.total_transactions,
      agent.successful_transactions,
      agent.total_earned
    );
  }
  
  // Insert services
  const insertService = db.prepare(`
    INSERT INTO services (agent_name, title, description, category, price, endpoint, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const service of data.services) {
    insertService.run(
      service.agent_name,
      service.title,
      service.description,
      service.category,
      service.price,
      service.endpoint,
      service.active
    );
  }
  
  // Insert transactions
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (service_id, provider_name, consumer_name, amount, status, rating, review, tx_hash, payment_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const tx of data.transactions) {
    insertTransaction.run(
      tx.service_id,
      tx.provider_name,
      tx.consumer_name,
      tx.amount,
      tx.status,
      tx.rating,
      tx.review,
      tx.tx_hash,
      tx.payment_hash
    );
  }
  
  db.close();
  console.log(`✅ Saved to ${dbPath}`);
};

// Main execution
const main = () => {
  console.log('🚀 AgentMesh Mock Data Generator\n');
  
  const data = generateMockData();
  saveToDatabase(data);
  
  console.log('\n✨ Done! The UI should now show populated data.');
  console.log('   Run the UI: npm run dev');
  console.log('   Server: http://localhost:3007');
  console.log('   UI: http://localhost:3003');
};

main();
