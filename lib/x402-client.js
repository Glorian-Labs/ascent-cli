/**
 * Working x402 Client for Aptos
 * Bypasses the broken @rvk_rishikesh client library
 */

const { Account, Ed25519PrivateKey, Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const USDC_ASSET = '0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832';
const DEFAULT_FACILITATOR = 'http://localhost:4022';

class X402Client {
  constructor(config = {}) {
    this.facilitatorUrl = config.facilitatorUrl || DEFAULT_FACILITATOR;
    this.network = config.network || 'aptos:2';
    this.aptosConfig = new AptosConfig({ 
      network: this.network === 'aptos:2' ? Network.TESTNET : Network.MAINNET 
    });
    this.aptos = new Aptos(this.aptosConfig);
  }

  /**
   * Check USDC balance for an address
   */
  async checkBalance(address) {
    try {
      // Get fungible asset balance
      const balance = await this.aptos.getCurrentFungibleAssetBalances({
        accountAddress: address
      });
      
      const usdcBalance = balance.find(b => 
        b.asset_type === USDC_ASSET || 
        b.metadata?.inner === USDC_ASSET
      );
      
      return {
        address,
        balance: usdcBalance ? usdcBalance.amount : '0',
        asset: USDC_ASSET
      };
    } catch (error) {
      return {
        address,
        balance: '0',
        error: error.message
      };
    }
  }

  /**
   * Create payment payload for a protected resource
   */
  async createPaymentPayload(privateKeyHex, requirements) {
    const account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKeyHex)
    });

    // Build transaction
    const rawTransaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: '0x1::primary_fungible_store::transfer',
        typeArguments: ['0x1::fungible_asset::Metadata'],
        functionArguments: [
          requirements.asset || USDC_ASSET,
          requirements.payTo,
          requirements.amount
        ]
      }
    });

    // Sign transaction
    const senderAuthenticator = this.aptos.transaction.sign({
      signer: account,
      transaction: rawTransaction
    });

    // Create payload in format facilitator expects
    const transactionBytes = Array.from(rawTransaction.rawTransaction.bcsToBytes());
    const authenticatorBytes = Array.from(senderAuthenticator.bcsToBytes());
    
    const aptosPaymentPayload = {
      transaction: transactionBytes,
      senderAuthenticator: authenticatorBytes
    };

    return {
      accepted: {
        scheme: "exact",
        network: this.network
      },
      payload: {
        transaction: Buffer.from(JSON.stringify(aptosPaymentPayload)).toString('base64')
      }
    };
  }

  /**
   * Pay for a protected resource
   * Returns { success, transaction, response }
   */
  async payForResource(url, privateKeyHex, options = {}) {
    const account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKeyHex)
    });

    try {
      // Step 1: Get 402 response with requirements
      const initResponse = await fetch(url, {
        method: options.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options.body || {})
      });

      if (initResponse.status !== 402) {
        // Already accessible or other error
        return {
          success: initResponse.ok,
          status: initResponse.status,
          response: await initResponse.json()
        };
      }

      // Parse requirements
      const paymentRequired = initResponse.headers.get('PAYMENT-REQUIRED');
      const requirements = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
      const accept = requirements.accepts[0];

      // Step 2: Create payment payload
      const paymentPayload = await this.createPaymentPayload(privateKeyHex, {
        amount: accept.amount,
        asset: accept.asset,
        payTo: accept.payTo
      });

      const paymentRequirements = {
        scheme: "exact",
        network: this.network,
        amount: accept.amount,
        asset: accept.asset,
        payTo: accept.payTo,
        extra: accept.extra || { sponsored: true }
      };

      // Step 3: Verify with facilitator
      const verifyRes = await fetch(`${this.facilitatorUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPayload, paymentRequirements })
      });

      const verifyResult = await verifyRes.json();
      
      if (!verifyResult.isValid) {
        return {
          success: false,
          error: 'verify_failed',
          reason: verifyResult.invalidReason,
          payer: verifyResult.payer
        };
      }

      // Step 4: Settle with facilitator
      const settleRes = await fetch(`${this.facilitatorUrl}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPayload, paymentRequirements })
      });

      const settleResult = await settleRes.json();
      
      if (!settleResult.success) {
        return {
          success: false,
          error: 'settle_failed',
          reason: settleResult.errorReason
        };
      }

      // Step 5: Call resource with payment signature
      const paymentSignature = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      
      const finalResponse = await fetch(url, {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYMENT-SIGNATURE': paymentSignature
        },
        body: JSON.stringify(options.body || {})
      });

      return {
        success: finalResponse.ok,
        status: finalResponse.status,
        transaction: settleResult.transaction,
        payer: settleResult.payer,
        response: await finalResponse.json()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
}

// Test wallets from Easter Egg #2
// Addresses verified from XOR operation with magic spell
const TEST_WALLETS = [
  { 
    name: 'Wallet 1 (Easter Egg #2)', 
    key: '0xFEE281AD1736B2B85FB322A312DE6D2176617A4C25259D189DD5E43440D498DE',
    address: '0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0'
  },
  { 
    name: 'Wallet 2', 
    key: '0x27E494815376D492A64382825DB5A19F9DEC59B2F0E63CBD395F421CB70A8E0A',
    address: '0xaaea48900c8f8045876505fe5fc5a623b1e423ef573a55b8b308cdecc749e6f4'
  },
  { 
    name: 'Wallet 3', 
    key: '0x9A51D0A13590B93F8CDE82724976D6B61D826C542D5C640FBFB0F2C6D274BE9F',
    address: '0x924c2e983753bb29b45ae9b4036d48861f204da096b36af710c95d1742b05ad4'
  },
  { 
    name: 'Wallet 4', 
    key: '0x8A5B2E6F1C3D9A7B4E2F5C8D1A6B3E9F2C5D8A1B4E7F0C3D6A9B2E5F8C1D4A70',
    address: '0xf1697d22257fd39653319eb3a2ee23fca2ca99b26f7fc79090249fbfbc401e03'
  },
  { 
    name: 'Wallet 5', 
    key: '0xB3E7A1F4C8D2E5B9A6C3F0D8E1B4A7C2F5D8E1B4A7C0F3D6E9B2C5F8A1D4E7B',
    address: '0x6cd199bbbc8bb3c17de4d2aebc2e75b4e9d7e3083188d987b597a3de8239df2a'
  }
];

/**
 * Check all test wallet balances
 */
async function checkAllWallets() {
  const client = new X402Client();
  
  console.log('💰 Checking Test Wallet Balances...\n');
  
  let fundedCount = 0;
  
  for (const wallet of TEST_WALLETS) {
    try {
      const balance = await client.checkBalance(wallet.address);
      const hasFunds = parseInt(balance.balance) >= 10000; // At least 0.01 USDC
      
      if (hasFunds) fundedCount++;
      
      console.log(`${wallet.name}: ${wallet.address.slice(0, 20)}...`);
      console.log(`  Balance: ${balance.balance} USDC atomic units (${parseInt(balance.balance) / 1000000} USDC)`);
      console.log(`  Status: ${hasFunds ? '✅ Funded' : '❌ Empty'}`);
      console.log();
    } catch (error) {
      console.log(`${wallet.name}: ${wallet.address.slice(0, 20)}...`);
      console.log(`  Error checking balance: ${error.message}`);
      console.log();
    }
  }
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total Funded: ${fundedCount}/${TEST_WALLETS.length} wallets`);
  
  if (fundedCount === 0) {
    console.log('\n⚠️  ALL WALLETS ARE EMPTY!');
    console.log('Get testnet USDC at: https://faucet.circle.com/');
    console.log('\nOr use the hackathon faucet:');
    console.log('curl -X POST https://faucet.circle.com/v1/testnet/faucet -d \'{"address":"YOUR_ADDRESS","amount":20}\'');
  }
}

module.exports = { X402Client, TEST_WALLETS, checkAllWallets };

// Run balance check if called directly
if (require.main === module) {
  checkAllWallets().catch(console.error);
}
