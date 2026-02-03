#!/usr/bin/env node
/**
 * Ascent MCP Server
 * Model Context Protocol server for AI agent payments on Aptos x402
 * 
 * This server enables AI agents (like Claude) to:
 * - Check USDC balances
 * - Send payments via x402 protocol
 * - Get payment requirements from protected resources
 * - Verify payment status
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');

// Import x402 client
const { X402Client, TEST_WALLETS } = require('../lib/x402-client');
const Database = require('better-sqlite3');

// Configuration
const CONFIG_PATH = process.env.ASCENT_MCP_CONFIG || path.join(process.cwd(), 'mcp-config.json');
const DB_PATH = process.env.ASCENT_DB_PATH || './payments.db';
const DEFAULT_FACILITATOR = process.env.FACILITATOR_URL || 'http://localhost:4022';

// Load or create configuration
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  return {
    defaultWallet: process.env.APTOS_PRIVATE_KEY || null,
    facilitatorUrl: DEFAULT_FACILITATOR,
    network: 'aptos:2',
    maxPaymentAmount: '1.0', // Maximum USDC per payment
    dailyBudget: '10.0', // Maximum USDC per day
    requireConfirmation: true
  };
}

const config = loadConfig();
const x402Client = new X402Client({
  facilitatorUrl: config.facilitatorUrl,
  network: config.network
});

// Transaction tracking
let db;
try {
  db = new Database(DB_PATH);
  db.prepare(`
    CREATE TABLE IF NOT EXISTS mcp_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_name TEXT NOT NULL,
      params TEXT,
      result TEXT,
      success BOOLEAN,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
} catch (e) {
  console.error('Database not available:', e.message);
}

// Budget tracking
const dailySpend = new Map(); // address -> amount spent today

function logTransaction(toolName, params, result, success) {
  if (db) {
    try {
      db.prepare(`
        INSERT INTO mcp_transactions (tool_name, params, result, success)
        VALUES (?, ?, ?, ?)
      `).run(toolName, JSON.stringify(params), JSON.stringify(result), success);
    } catch (e) {
      // Silent fail for logging
    }
  }
}

// Create MCP Server
const server = new McpServer({
  name: 'ascent-x402-mcp',
  version: '1.0.0'
});

// ============================================================================
// TOOLS
// ============================================================================

/**
 * Tool: check_balance
 * Check USDC balance for a wallet address
 */
server.tool(
  'check_balance',
  'Check USDC balance for an Aptos wallet address',
  {
    address: z.string().describe('The Aptos wallet address to check (0x...)'),
    network: z.enum(['testnet', 'mainnet']).optional().describe('Network to check (defaults to config)')
  },
  async ({ address, network }) => {
    try {
      const client = new X402Client({
        facilitatorUrl: config.facilitatorUrl,
        network: network === 'mainnet' ? 'aptos:1' : 'aptos:2'
      });
      
      const result = await client.checkBalance(address);
      
      logTransaction('check_balance', { address, network }, result, !result.error);
      
      if (result.error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error checking balance: ${result.error}`
          }],
          isError: true
        };
      }
      
      const balanceUSDC = (parseInt(result.balance) / 1000000).toFixed(6);
      
      return {
        content: [{
          type: 'text',
          text: `💰 Balance for ${address.slice(0, 20)}...\n\n` +
                `USDC Balance: ${balanceUSDC} USDC\n` +
                `(Atomic units: ${result.balance})\n` +
                `Asset: ${result.asset.slice(0, 20)}...`
        }]
      };
    } catch (error) {
      logTransaction('check_balance', { address, network }, { error: error.message }, false);
      return {
        content: [{
          type: 'text',
          text: `❌ Failed to check balance: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

/**
 * Tool: get_payment_requirements
 * Get payment requirements from a protected resource (402 response)
 */
server.tool(
  'get_payment_requirements',
  'Get payment requirements from an x402 protected resource',
  {
    url: z.string().describe('The protected resource URL'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().describe('HTTP method (default: POST)'),
    body: z.string().optional().describe('JSON body to send with the request')
  },
  async ({ url, method, body }) => {
    try {
      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      
      const initResponse = await fetch(url, {
        method: method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body || '{}'
      });
      
      if (initResponse.status !== 402) {
        const responseBody = await initResponse.text();
        return {
          content: [{
            type: 'text',
            text: `ℹ️ Resource is not protected or already accessible\n` +
                  `Status: ${initResponse.status} ${initResponse.statusText}\n` +
                  `Response: ${responseBody.slice(0, 500)}`
          }]
        };
      }
      
      const paymentRequired = initResponse.headers.get('PAYMENT-REQUIRED');
      if (!paymentRequired) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ 402 response received but no PAYMENT-REQUIRED header found`
          }],
          isError: true
        };
      }
      
      const requirements = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
      const accept = requirements.accepts[0];
      
      logTransaction('get_payment_requirements', { url, method }, { requirements }, true);
      
      return {
        content: [{
          type: 'text',
          text: `💳 Payment Required for ${url}\n\n` +
                `Amount: ${(parseInt(accept.amount) / 1000000).toFixed(6)} USDC\n` +
                `Asset: ${accept.asset}\n` +
                `Pay To: ${accept.payTo}\n` +
                `Scheme: ${accept.scheme}\n` +
                `Network: ${accept.network}\n` +
                `\nAdditional Info: ${JSON.stringify(accept.extra || {}, null, 2)}`
        }]
      };
    } catch (error) {
      logTransaction('get_payment_requirements', { url, method }, { error: error.message }, false);
      return {
        content: [{
          type: 'text',
          text: `❌ Failed to get payment requirements: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

/**
 * Tool: send_payment
 * Send an x402 payment to access a protected resource
 */
server.tool(
  'send_payment',
  'Send an x402 payment to access a protected resource',
  {
    url: z.string().describe('The protected resource URL'),
    privateKey: z.string().optional().describe('Private key (or uses config default)'),
    maxAmount: z.string().optional().describe('Maximum amount willing to pay (USDC)'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().describe('HTTP method (default: POST)'),
    body: z.string().optional().describe('JSON body to send with the request')
  },
  async ({ url, privateKey, maxAmount, method, body }) => {
    try {
      const walletKey = privateKey || config.defaultWallet;
      
      if (!walletKey) {
        return {
          content: [{
            type: 'text',
            text: `❌ No wallet configured. Please set APTOS_PRIVATE_KEY environment variable or provide privateKey parameter.`
          }],
          isError: true
        };
      }
      
      // Budget check
      if (maxAmount && parseFloat(maxAmount) > parseFloat(config.maxPaymentAmount)) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ Payment amount exceeds maximum allowed (${config.maxPaymentAmount} USDC). ` +
                  `Update mcp-config.json to increase limit.`
          }],
          isError: true
        };
      }
      
      const result = await x402Client.payForResource(url, walletKey, {
        method: method || 'POST',
        body: body ? JSON.parse(body) : {}
      });
      
      logTransaction('send_payment', { url, method }, result, result.success);
      
      if (!result.success) {
        return {
          content: [{
            type: 'text',
            text: `❌ Payment failed\n` +
                  `Error: ${result.error || result.reason || 'Unknown error'}\n` +
                  (result.payer ? `Payer: ${result.payer}` : '')
          }],
          isError: true
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: `✅ Payment successful!\n\n` +
                `Transaction: ${result.transaction || 'N/A'}\n` +
                `Payer: ${result.payer || 'N/A'}\n` +
                `Status: ${result.status}\n\n` +
                `Response:\n${JSON.stringify(result.response, null, 2)}`
        }]
      };
    } catch (error) {
      logTransaction('send_payment', { url, method }, { error: error.message }, false);
      return {
        content: [{
          type: 'text',
          text: `❌ Payment failed: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

/**
 * Tool: verify_payment
 * Verify a payment transaction status
 */
server.tool(
  'verify_payment',
  'Verify the status of a payment transaction',
  {
    transactionHash: z.string().describe('The transaction hash to verify'),
    network: z.enum(['testnet', 'mainnet']).optional().describe('Network (default: testnet)')
  },
  async ({ transactionHash, network }) => {
    try {
      const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');
      
      const aptosConfig = new AptosConfig({ 
        network: network === 'mainnet' ? Network.MAINNET : Network.TESTNET 
      });
      const aptos = new Aptos(aptosConfig);
      
      const txn = await aptos.transaction.getTransactionByHash({
        transactionHash
      });
      
      logTransaction('verify_payment', { transactionHash, network }, { status: txn.success }, true);
      
      const status = txn.success ? '✅ Success' : '❌ Failed';
      const statusEmoji = txn.success ? '✅' : '❌';
      
      return {
        content: [{
          type: 'text',
          text: `${statusEmoji} Transaction Status\n\n` +
                `Hash: ${transactionHash}\n` +
                `Status: ${status}\n` +
                `VM Status: ${txn.vm_status}\n` +
                `Sender: ${txn.sender}\n` +
                `Version: ${txn.version}\n` +
                `Timestamp: ${new Date(parseInt(txn.timestamp) / 1000).toISOString()}`
        }]
      };
    } catch (error) {
      logTransaction('verify_payment', { transactionHash, network }, { error: error.message }, false);
      return {
        content: [{
          type: 'text',
          text: `❌ Failed to verify transaction: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

/**
 * Tool: get_wallet_info
 * Get information about configured wallets
 */
server.tool(
  'get_wallet_info',
  'Get information about available test wallets and configuration',
  {},
  async () => {
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
);

/**
 * Tool: get_transaction_history
 * Get recent MCP transaction history
 */
server.tool(
  'get_transaction_history',
  'Get recent transaction history from this MCP session',
  {
    limit: z.number().optional().describe('Number of transactions to return (default: 10)')
  },
  async ({ limit }) => {
    if (!db) {
      return {
        content: [{
          type: 'text',
          text: `⚠️ Database not available for transaction history`
        }],
        isError: true
      };
    }
    
    try {
      const transactions = db.prepare(`
        SELECT * FROM mcp_transactions 
        ORDER BY timestamp DESC 
        LIMIT ?
      `).all(limit || 10);
      
      if (transactions.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `📝 No transactions found in this session.`
          }]
        };
      }
      
      const history = transactions.map(t => {
        const status = t.success ? '✅' : '❌';
        const time = new Date(t.timestamp).toLocaleTimeString();
        return `${status} [${time}] ${t.tool_name}`;
      }).join('\n');
      
      return {
        content: [{
          type: 'text',
          text: `📝 Recent Transactions (last ${transactions.length}):\n\n${history}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Failed to get transaction history: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// RESOURCES
// ============================================================================

/**
 * Resource: Transaction Receipts
 * Access transaction receipts by transaction hash
 */
server.resource(
  'receipt',
  'receipt://{transactionHash}',
  async (uri, { transactionHash }) => {
    try {
      const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');
      
      const aptosConfig = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(aptosConfig);
      
      const txn = await aptos.transaction.getTransactionByHash({ transactionHash });
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            transactionHash,
            success: txn.success,
            vmStatus: txn.vm_status,
            sender: txn.sender,
            gasUsed: txn.gas_used,
            gasUnitPrice: txn.gas_unit_price,
            timestamp: txn.timestamp,
            version: txn.version,
            receiptGeneratedAt: new Date().toISOString()
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/plain',
          text: `Error fetching receipt: ${error.message}`
        }]
      };
    }
  }
);

/**
 * Resource: Payment Requirements
 * Access payment requirements for a URL
 */
server.resource(
  'payment-requirements',
  'payment-requirements://{url}',
  async (uri, { url }) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      
      const initResponse = await fetch(decodedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      
      if (initResponse.status !== 402) {
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              url: decodedUrl,
              protected: false,
              status: initResponse.status,
              message: 'Resource is not payment-protected or is freely accessible'
            }, null, 2)
          }]
        };
      }
      
      const paymentRequired = initResponse.headers.get('PAYMENT-REQUIRED');
      const requirements = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            url: decodedUrl,
            protected: true,
            requirements: requirements.accepts,
            scheme: requirements.scheme,
            network: requirements.network
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/plain',
          text: `Error fetching payment requirements: ${error.message}`
        }]
      };
    }
  }
);

// ============================================================================
// PROMPTS
// ============================================================================

/**
 * Prompt: Payment Authorization Flow
 */
server.prompt(
  'payment-authorization',
  'Guide for authorizing and sending x402 payments',
  {
    resourceUrl: z.string().describe('The URL of the protected resource'),
    maxBudget: z.string().optional().describe('Maximum budget for this payment')
  },
  ({ resourceUrl, maxBudget }) => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `I need to access a paid resource at ${resourceUrl}. ` +
                `Please help me authorize the payment${maxBudget ? ` with a maximum budget of ${maxBudget} USDC` : ''}.\n\n` +
                `First, check the payment requirements using the get_payment_requirements tool, ` +
                `then guide me through the payment process if the amount is acceptable.`
        }
      }]
    };
  }
);

/**
 * Prompt: Budget Management
 */
server.prompt(
  'budget-management',
  'Guide for managing payment budgets and tracking spending',
  {
    walletAddress: z.string().optional().describe('Wallet address to check')
  },
  ({ walletAddress }) => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Help me manage my x402 payment budget.\n\n` +
                (walletAddress 
                  ? `Check the balance for ${walletAddress} and review my recent transaction history.`
                  : `Check the available test wallets and show me how to monitor my spending.`) +
                `\n\nCurrent configured limits:\n` +
                `- Max per payment: ${config.maxPaymentAmount} USDC\n` +
                `- Daily budget: ${config.dailyBudget} USDC\n\n` +
                `What are my spending patterns and how can I optimize my payments?`
        }
      }]
    };
  }
);

/**
 * Prompt: Transaction Review
 */
server.prompt(
  'transaction-review',
  'Review recent payment transactions',
  {
    transactionHash: z.string().optional().describe('Specific transaction to review')
  },
  ({ transactionHash }) => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: transactionHash
            ? `Please review transaction ${transactionHash}. Verify its status and show me the receipt.`
            : `Show me my recent x402 payment transactions. I want to review my spending history ` +
              `and check the status of my past payments.`
        }
      }]
    };
  }
);

/**
 * Prompt: New Agent Setup
 */
server.prompt(
  'agent-setup',
  'Setup guide for new AI agents using x402 payments',
  {},
  () => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `I'm setting up a new AI agent to use x402 payments on Aptos. ` +
                `Please guide me through:\n\n` +
                `1. Available test wallets I can use\n` +
                `2. How to check wallet balances\n` +
                `3. How to get payment requirements from a protected resource\n` +
                `4. How to send payments\n` +
                `5. How to verify transactions\n\n` +
                `Start by showing me the available wallets.`
        }
      }]
    };
  }
);

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log startup to stderr (stdout is used for MCP protocol)
  console.error('✅ Ascent MCP Server started');
  console.error(`   Config: ${CONFIG_PATH}`);
  console.error(`   Facilitator: ${config.facilitatorUrl}`);
  console.error(`   Network: ${config.network}`);
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

module.exports = { server, x402Client, config };
