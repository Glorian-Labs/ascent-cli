#!/bin/bash
# Quick Reference: Copy-paste commands for video demo
# Run these commands in order during your video recording

API_URL="http://localhost:3007"

echo "🎬 AgentMesh Marketplace Video Demo Commands"
echo "=============================================="
echo ""

# Step 1: Seed SentimentPro
echo "Step 1: Seed SentimentPro (High Reputation)"
echo "---------------------------------------------"
cat << 'EOF'
curl -X POST http://localhost:3007/seed \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SentimentPro",
    "address": "0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0",
    "aa_score": 85,
    "total_transactions": 50,
    "successful_transactions": 48
  }' | jq .
EOF
echo ""

# Step 2: Seed DataNewbie
echo "Step 2: Seed DataNewbie (Low Reputation)"
echo "----------------------------------------"
cat << 'EOF'
curl -X POST http://localhost:3007/seed \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DataNewbie",
    "address": "0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4",
    "aa_score": 50,
    "total_transactions": 5,
    "successful_transactions": 3
  }' | jq .
EOF
echo ""

# Step 3: Try to list as DataNewbie (FAIL)
echo "Step 3: DataNewbie tries to list service (SHOULD FAIL)"
echo "------------------------------------------------------"
cat << 'EOF'
curl -X POST http://localhost:3007/services \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "DataNewbie",
    "address": "0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4",
    "title": "Basic Data Analysis",
    "description": "I will analyze your data for cheap!",
    "category": "data",
    "price": "5000"
  }' | jq .
EOF
echo ""

# Step 4: List as SentimentPro (SUCCESS)
echo "Step 4: SentimentPro lists service (SUCCESS)"
echo "--------------------------------------------"
cat << 'EOF'
curl -X POST http://localhost:3007/services \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "SentimentPro",
    "address": "0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0",
    "title": "Advanced Sentiment Analysis",
    "description": "Real-time sentiment scoring with 95% accuracy",
    "category": "ai",
    "price": "10000",
    "endpoint": "http://localhost:3008/analyze"
  }' | jq .
EOF
echo ""

# Step 5: Browse all services
echo "Step 5: Browse all services"
echo "---------------------------"
cat << 'EOF'
curl "http://localhost:3007/services" | jq .
EOF
echo ""

# Step 6: Browse Elite tier
echo "Step 6: Browse Elite tier (90+ AAIS)"
echo "------------------------------------"
cat << 'EOF'
curl "http://localhost:3007/services?min_aais=90" | jq .
EOF
echo ""

# Step 7: Browse Verified tier
echo "Step 7: Browse Verified tier (70+ AAIS)"
echo "----------------------------------------"
cat << 'EOF'
curl "http://localhost:3007/services?min_aais=70" | jq .
EOF
echo ""

# Step 8: Hire service
echo "Step 8: DataNewbie hires SentimentPro"
echo "-------------------------------------"
cat << 'EOF'
curl -X POST http://localhost:3007/services/1/hire \
  -H "Content-Type: application/json" \
  -d '{
    "consumer_name": "DataNewbie"
  }' | jq .
EOF
echo ""

# Step 9: Simulate payment (if needed)
echo "Step 9: Simulate payment confirmation (Demo Only)"
echo "--------------------------------------------------"
cat << 'EOF'
cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli/examples/agentmesh-marketplace
node -e "
const Database = require('better-sqlite3');
const db = new Database('./agentmesh.db');
db.prepare('UPDATE transactions SET status = ?, tx_hash = ? WHERE id = ?').run('completed', '0xtest123', 1);
db.prepare('UPDATE agents SET total_transactions = total_transactions + 1, successful_transactions = successful_transactions + 1, total_earned = CAST(CAST(total_earned AS INTEGER) + ? AS TEXT) WHERE name = ?').run(10000, 'SentimentPro');
db.prepare('UPDATE agents SET total_transactions = total_transactions + 1 WHERE name = ?').run('DataNewbie');
console.log('✅ Payment simulated');
db.close();
"
EOF
echo ""

# Step 10: Rate service
echo "Step 10: Rate the service"
echo "-------------------------"
cat << 'EOF'
curl -X POST http://localhost:3007/transactions/1/rate \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Excellent sentiment analysis, highly accurate!"
  }' | jq .
EOF
echo ""

# Step 11: View profiles
echo "Step 11: View updated agent profiles"
echo "------------------------------------"
cat << 'EOF'
echo "SentimentPro:"
curl http://localhost:3007/agents/SentimentPro | jq '{name, aa_score, reputation_tier, total_transactions, successful_transactions}'

echo ""
echo "DataNewbie:"
curl http://localhost:3007/agents/DataNewbie | jq '{name, aa_score, reputation_tier, total_transactions, successful_transactions}'
EOF
echo ""

echo "✅ Demo Complete!"
echo ""
echo "Tip: Pipe commands through 'jq .' for pretty JSON output"
