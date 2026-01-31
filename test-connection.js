const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');

async function test() {
  console.log('Connecting to Aptos Testnet...');
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);
  try {
    const info = await aptos.getLedgerInfo();
    console.log('Connected! Chain ID:', info.chain_id);
  } catch (e) {
    console.error('Failed to connect:', e.message);
  }
}

test();
