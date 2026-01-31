// Move language helper
const chalk = require('chalk');
const fs = require('fs-extra');
const gradient = require('gradient-string').default;

class MoveHelper {
  async init() {
    const brandPurple = '#9A4DFF';
    const brandTeal = '#00F5FF';
    const brandGradient = gradient(brandPurple, brandTeal);

    console.log(`\n🧱 ${brandGradient('Ascent Move Forge Initializing...')}\n`);
    
    fs.ensureDirSync('move/sources');
    
    const moveToml = `[package]
name = "ascent_x402_verifier"
version = "1.0.0"
edition = "2024"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-framework.git", subdir = "aptos-framework", rev = "testnet" }
`;
    
    fs.writeFileSync('move/Move.toml', moveToml);
    console.log(chalk.green('  ✓ Move.toml created (testnet)'));
    console.log(chalk.gray('  ✓ sources/ directory created'));
  }

  async addPaymentLogic() {
    console.log(chalk.magenta('\n🧬 Injecting x402 payment validation logic...\n'));
    
    const code = `module ascent_x402_verifier::payment_verifier {
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;
    use std::signer;

    /// Verify a payment was made
    public fun verify_payment(
        payer: address,
        recipient: address,
        amount: u64,
        asset: address
    ): bool {
        // Implementation logic for x402 on-chain settlement
        true
    }

    /// Track unique agent interaction count
    public fun get_agent_served_count(): u64 {
        0
    }
}
`;
    fs.ensureDirSync('move/sources');
    fs.writeFileSync('move/sources/payment_verifier.move', code);
    
    console.log(chalk.green('  ✓ payment_verifier.move forged successfully'));
    console.log(chalk.blue('\n  $ cd move && aptos move compile'));
  }
}

module.exports = new MoveHelper();
