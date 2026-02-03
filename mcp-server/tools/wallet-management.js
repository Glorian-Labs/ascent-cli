/**
 * Wallet Management Tools
 * Tools for managing agent wallets
 */

const { z } = require('zod');
const { 
  addWallet, 
  getWallet, 
  getDefaultWallet, 
  listWallets, 
  removeWallet, 
  setDefaultWallet 
} = require('../keystore');
const { TEST_WALLETS } = require('../../lib/x402-client');

// List wallets tool
const listSchema = {};

async function listHandler() {
  try {
    const wallets = listWallets();
    const defaultWallet = wallets.find(w => w.isDefault);
    
    if (wallets.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `📭 No wallets configured.\n\nUse add_wallet tool to add a wallet, or use test wallets from get_test_wallets.`
        }]
      };
    }
    
    const walletList = wallets.map(w => {
      const indicator = w.isDefault ? '★' : ' ';
      return `${indicator} ${w.name} (created: ${new Date(w.createdAt).toLocaleDateString()})`;
    }).join('\n');
    
    return {
      content: [{
        type: 'text',
        text: `📋 Configured Wallets\n\n${walletList}\n\n${defaultWallet ? `Default: ${defaultWallet.name}` : 'No default wallet set'}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to list wallets: ${error.message}`
      }],
      isError: true
    };
  }
}

// Add wallet tool
const addSchema = {
  name: z.string().describe('Unique name for the wallet'),
  privateKey: z.string().describe('Aptos private key (hex format with 0x prefix)'),
  makeDefault: z.boolean().optional().describe('Set as default wallet')
};

async function addHandler({ name, privateKey, makeDefault }) {
  try {
    addWallet(name, privateKey, makeDefault);
    
    return {
      content: [{
        type: 'text',
        text: `✅ Wallet "${name}" added successfully.${makeDefault ? ' Set as default.' : ''}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to add wallet: ${error.message}`
      }],
      isError: true
    };
  }
}

// Get test wallets tool
const testWalletsSchema = {};

async function testWalletsHandler() {
  const walletInfo = TEST_WALLETS.map(w => ({
    name: w.name,
    address: w.address,
    addressShort: w.address.slice(0, 20) + '...'
  }));
  
  return {
    content: [{
      type: 'text',
      text: `📋 Available Test Wallets\n\n` +
            walletInfo.map(w => 
              `${w.name}:\n  Address: ${w.addressShort}`
            ).join('\n\n') +
            `\n\n💡 Use check_balance tool with any of these addresses to see their USDC balance.`
    }]
  };
}

module.exports = {
  list_wallets: { name: 'list_wallets', schema: listSchema, handler: listHandler },
  add_wallet: { name: 'add_wallet', schema: addSchema, handler: addHandler },
  get_test_wallets: { name: 'get_test_wallets', schema: testWalletsSchema, handler: testWalletsHandler }
};