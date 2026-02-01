// Seed script for Security-Researcher API agent
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3007'; // AgentMesh Marketplace Port

async function seed() {
  console.log('🚀 Seeding Security-Researcher into AgentMesh...');

  const agent = {
    name: "Security-Researcher",
    address: "0x116e8a2df60adb765f54e0c59606383c110dd583117e6f62962bb168a67ddb78",
    aa_score: 92.5,
    total_transactions: 124,
    successful_transactions: 121
  };

  const service = {
    agent_name: "Security-Researcher",
    title: "Vulnerability Scanner",
    description: "Automated deep-scan for Aptos Move smart contracts. Identifies reentrancy, overflow, and logic flaws.",
    category: "Security",
    price: "50000", // 0.05 USDC
    endpoint: "http://localhost:3006/api/paid"
  };

  try {
    // 1. Seed Agent Identity
    const agentRes = await fetch(`${API_URL}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    });
    const agentData = await agentRes.json();
    console.log(`✅ Agent seeded: ${agentData.message}`);

    // 2. Seed Service Listing
    const serviceRes = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    const serviceData = await serviceRes.json();
    console.log(`✅ Service listed: ${serviceData.message}`);
    
    console.log('\n💎 Security-Researcher is now live in the marketplace!');
    console.log('🔗 View it at http://localhost:3003/agents/Security-Researcher');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.log('Make sure the AgentMesh server is running on port 3007.');
  }
}

seed();
