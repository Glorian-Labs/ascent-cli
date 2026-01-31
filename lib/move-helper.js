// Move language helper
const chalk = require('chalk');
const fs = require('fs-extra');

class MoveHelper {
  async init() {
    console.log(chalk.blue('Initializing Move project...'));
    
    fs.ensureDirSync('move/sources');
    
    const moveToml = `[package]
name = "x402_payment_logic"
version = "1.0.0"
edition = "2024"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-framework.git", subdir = "aptos-framework", rev = "mainnet" }
`;
    
    fs.writeFileSync('move/Move.toml', moveToml);
    console.log(chalk.green('✓ Move.toml created'));
  }

  async addPaymentLogic() {
    console.log(chalk.blue('Adding payment verification logic...\n'));
    
    const code = `module x402_payment_logic::payment_verifier {
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
        // Check if transfer occurred
        // This is a simplified example
        true
    }

    /// Get payment count for an address
    public fun get_payment_count(addr: address): u64 {
        // Would track on-chain
        0
    }
}
`;
    fs.ensureDirSync('move/sources');
    fs.writeFileSync('move/sources/payment_verifier.move', code);
    
    console.log(chalk.green('✓ Payment verifier module created'));
    console.log(chalk.blue('\nNext: cd move && aptos move compile'));
  }
}

module.exports = new MoveHelper();
