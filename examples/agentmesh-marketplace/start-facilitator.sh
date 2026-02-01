#!/bin/bash
# Start facilitator only (for AgentMesh demo)

cd /home/hebx/clawd/hackathons/canteen-x402/ascent-cli

# Load .env.local if it exists
if [ -f .env.local ]; then
  echo "📝 Loading environment from .env.local..."
  export $(grep -v '^#' .env.local | xargs)
fi

echo "🚀 Starting facilitator on port 4022..."
echo ""

node -e "
const facilitator = require('./lib/facilitator');

facilitator.start({ port: 4022 }).then((instance) => {
  console.log('');
  console.log('✅ Facilitator is ready!');
  console.log('   Health check: curl http://localhost:4022/health');
  console.log('');
  console.log('Press Ctrl+C to stop');
  
  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping facilitator...');
    if (instance && typeof instance.stop === 'function') {
      instance.stop();
    }
    process.exit(0);
  });
  
  // Keep process running
  setInterval(() => {}, 1000);
}).catch((err) => {
  console.error('❌ Error starting facilitator:', err.message);
  process.exit(1);
});
"
