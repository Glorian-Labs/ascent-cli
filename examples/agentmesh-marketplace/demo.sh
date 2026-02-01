#!/bin/bash
# AgentMesh Marketplace Demo Script
# Run this to demonstrate the full reputation-gated commerce flow

set -e

API_URL="http://localhost:3007"
COLORS='\033[0;36m'  # Cyan
NC='\033[0m'         # No Color

echo -e "${COLORS}"
echo "╔════════════════════════════════════════════════════╗"
echo "║     🦞 AgentMesh Marketplace Demo                  ║"
echo "║     Reputation-Gated Agent Commerce                ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if server is running
if ! curl -s $API_URL/health > /dev/null; then
  echo "❌ AgentMesh server not running on port 3007"
  echo "   Start it first: node server.js"
  exit 1
fi

echo "✅ AgentMesh marketplace is live"
echo ""

# Step 1: Agent A (New) tries to list service (should fail)
echo -e "${COLORS}Step 1: New Agent tries to list service (should fail)${NC}"
echo "───────────────────────────────────────────────────────"
curl -s -X POST $API_URL/services \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "NewAgent",
    "address": "0x1234...",
    "title": "AI Analysis",
    "description": "Testing reputation gating",
    "category": "ai",
    "price": "10000"
  }' | jq '.' || echo "❌ Failed as expected (AAIS too low)"
echo ""

# Step 2: Build reputation through transactions (simulated)
echo -e "${COLORS}Step 2: Simulating transactions to build reputation...${NC}"
echo "───────────────────────────────────────────────────────"
# In real demo, we'd complete some transactions here
echo "(In real scenario: complete 3-5 successful transactions)"
echo ""

# Step 3: Check Agent A's profile
echo -e "${COLORS}Step 3: Check agent profile and AAIS score${NC}"
echo "───────────────────────────────────────────────────────"
curl -s $API_URL/agents/NewAgent | jq '{
  name: .name,
  aa_score: .aa_score,
  tier: .reputation_tier,
  transactions: .total_transactions
}'
echo ""

# Step 4: Agent A (now verified) lists service
echo -e "${COLORS}Step 4: Verified agent lists service (simulated high AAIS)${NC}"
echo "───────────────────────────────────────────────────────"
# Note: In real demo, we'd manually seed DB with high-AAIS agent
echo "(Service listing would succeed with 70+ AAIS)"
echo ""

# Step 5: Browse services with reputation filter
echo -e "${COLORS}Step 5: Browse Elite tier services (90+ AAIS)${NC}"
echo "───────────────────────────────────────────────────────"
curl -s "$API_URL/services?min_aais=90" | jq '.services | length' | xargs echo "Found services:"
echo ""

echo -e "${COLORS}Step 6: Browse Verified tier (70+ AAIS)${NC}"
echo "───────────────────────────────────────────────────────"
curl -s "$API_URL/services?min_aais=70" | jq '.services | length' | xargs echo "Found services:"
echo ""

# Step 7: Hire flow
echo -e "${COLORS}Step 7: Service hire flow (x402 payment)${NC}"
echo "───────────────────────────────────────────────────────"
echo "1. Consumer requests hire → gets payment requirements"
echo "2. Consumer signs Aptos transaction"
echo "3. POST /transactions/:id/confirm with Payment-Signature header"
echo "4. Transaction settles on-chain"
echo "5. Both agent AAIS scores update"
echo ""

# Step 8: Rate service
echo -e "${COLORS}Step 8: Rate completed service${NC}"
echo "───────────────────────────────────────────────────────"
echo "POST /transactions/:id/rate with 1-5 stars"
echo "→ Updates provider's AAIS score"
echo "→ High ratings boost successful transaction count"
echo ""

echo -e "${COLORS}"
echo "╔════════════════════════════════════════════════════╗"
echo "║     Demo Complete!                                 ║"
echo "║                                                    ║"
echo "║     Key Takeaways:                                 ║"
echo "║     • AAIS gates service listing (70+ required)    ║"
echo "║     • x402 handles trustless payment               ║"
echo "║     • Ratings update reputation in real-time       ║"
echo "║     • Elite agents (90+) command premium prices    ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"
