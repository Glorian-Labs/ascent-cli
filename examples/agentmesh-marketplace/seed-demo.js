const fetch = require('node-fetch');

const API_URL = 'http://localhost:3007';

const agents = [
  { 
    name: 'SentimentPro', 
    address: '0x489cbd8ade2279edc20ef18a52b894d5a983575c1c0979e901be60b73741fe5d', 
    aa_score: 92, 
    total_transactions: 156, 
    successful_transactions: 148,
    total_earned: '1560000' // $1.56 USDC
  },
  { 
    name: 'SecurityAgent', 
    address: '0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0', 
    aa_score: 95, 
    total_transactions: 89, 
    successful_transactions: 87,
    total_earned: '4450000' // $4.45 USDC (higher value audits)
  },
  { 
    name: 'DataPipe', 
    address: '0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4', 
    aa_score: 78, 
    total_transactions: 234, 
    successful_transactions: 210,
    total_earned: '4680000' // $4.68 USDC (high volume)
  },
  { 
    name: 'QueryBot', 
    address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 
    aa_score: 88, 
    total_transactions: 67, 
    successful_transactions: 62,
    total_earned: '1005000' // $1.01 USDC
  },
  { 
    name: 'VisionAgent', 
    address: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 
    aa_score: 71, 
    total_transactions: 45, 
    successful_transactions: 38,
    total_earned: '360000' // $0.36 USDC
  },
  { 
    name: 'IndexerX', 
    address: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321', 
    aa_score: 96, 
    total_transactions: 312, 
    successful_transactions: 305,
    total_earned: '9360000' // $9.36 USDC (top earner)
  },
  { 
    name: 'CodeReviewer', 
    address: '0x11111111222222223333333344444444555555556666666677777777888888889', 
    aa_score: 85, 
    total_transactions: 178, 
    successful_transactions: 165,
    total_earned: '4450000' // $4.45 USDC
  },
  { 
    name: 'DataNewbie', 
    address: '0x99999999aaaaaaabbbbbbbbccccccccddddddddeeeeeeeeffffffffgggggggg0', 
    aa_score: 52, 
    total_transactions: 12, 
    successful_transactions: 8,
    total_earned: '96000' // $0.10 USDC (new agent)
  },
];

const services = [
  { agent_name: 'SentimentPro', title: 'Advanced Sentiment Analysis', description: 'Real-time sentiment scoring with 95% accuracy. Supports multiple languages and context-aware analysis.', category: 'AI & Machine Learning', price: '10000', endpoint: 'https://api.sentimentpro.ai/analyze' },
  { agent_name: 'SecurityAgent', title: 'Smart Contract Audit', description: 'Automated vulnerability scanning for Move contracts. Static analysis + symbolic execution.', category: 'Security', price: '50000', endpoint: 'https://api.securityagent.ai/audit' },
  { agent_name: 'DataPipe', title: 'Data Pipeline Builder', description: 'ETL pipeline construction for agent data workflows. Schema validation and transformation.', category: 'Data Engineering', price: '20000', endpoint: 'https://api.datapipe.ai/build' },
  { agent_name: 'QueryBot', title: 'Natural Language → SQL', description: 'Convert natural language queries to optimized SQL. Schema-aware with join suggestions.', category: 'AI & Machine Learning', price: '15000', endpoint: 'https://api.querybot.ai/convert' },
  { agent_name: 'VisionAgent', title: 'Image Classification', description: 'Multi-label image classification with confidence scores. Custom model fine-tuning available.', category: 'Computer Vision', price: '8000', endpoint: 'https://api.visionagent.ai/classify' },
  { agent_name: 'IndexerX', title: 'On-Chain Data Indexer', description: 'Real-time Aptos event indexing with GraphQL API. Custom entity tracking and webhooks.', category: 'Blockchain', price: '30000', endpoint: 'https://api.indexerx.ai/index' },
  { agent_name: 'CodeReviewer', title: 'AI Code Review', description: 'Automated code review with security checks, performance suggestions, and best practices.', category: 'Development', price: '25000', endpoint: 'https://api.codereviewer.ai/review' },
  { agent_name: 'SentimentPro', title: 'Brand Monitoring', description: 'Real-time brand sentiment tracking across social media and news sources.', category: 'Analytics', price: '35000', endpoint: 'https://api.sentimentpro.ai/monitor' },
  { agent_name: 'IndexerX', title: 'NFT Analytics', description: 'Track NFT collections, floor prices, and trading volume with historical data.', category: 'Blockchain', price: '18000', endpoint: 'https://api.indexerx.ai/nft' },
];

async function seed() {
  console.log('🌱 Seeding AgentMesh database...\n');
  
  // Seed agents
  for (const agent of agents) {
    try {
      const res = await fetch(`${API_URL}/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      });
      const data = await res.json();
      console.log(`✓ Agent ${agent.name}: AAIS ${agent.aa_score} (${data.agent?.tier || 'seeded'})`);
    } catch (e) {
      console.error(`✗ Failed to seed ${agent.name}:`, e.message);
    }
  }
  
  console.log('\n📦 Seeding services...\n');
  
  // Seed services
  for (const service of services) {
    try {
      const res = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      const data = await res.json();
      if (data.success) {
        console.log(`✓ Service "${service.title}" by ${service.agent_name}`);
      } else {
        console.log(`⚠ Service "${service.title}": ${data.error || data.message}`);
      }
    } catch (e) {
      console.error(`✗ Failed to add service:`, e.message);
    }
  }
  
  // Create some transactions
  console.log('\n💸 Creating sample transactions...\n');
  
  const transactions = [
    { service_id: 1, consumer: 'DataNewbie' },
    { service_id: 2, consumer: 'QueryBot' },
    { service_id: 3, consumer: 'VisionAgent' },
    { service_id: 4, consumer: 'DataPipe' },
    { service_id: 5, consumer: 'CodeReviewer' },
  ];
  
  for (const tx of transactions) {
    try {
      const res = await fetch(`${API_URL}/services/${tx.service_id}/hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consumer_name: tx.consumer })
      });
      const data = await res.json();
      if (data.success) {
        console.log(`✓ Transaction #${data.transaction_id}: ${tx.consumer} hiring service #${tx.service_id}`);
      }
    } catch (e) {
      console.error(`✗ Failed transaction:`, e.message);
    }
  }
  
  console.log('\n✅ Seeding complete!\n');
  
  // Show summary
  const statsRes = await fetch(`${API_URL}/stats`);
  const stats = await statsRes.json();
  console.log('📊 Database Summary:');
  console.log(`   Agents: ${stats.overview.activeAgents}`);
  console.log(`   Services: ${stats.overview.servicesListed}`);
  console.log(`   Transactions: ${stats.overview.totalTransactions}`);
}

seed().catch(console.error);
