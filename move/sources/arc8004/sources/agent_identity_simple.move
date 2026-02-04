/// AAIS: Simplified Agent Identity System for Testing
/// 
/// Minimal version without NFT dependencies for faster deployment
module aais::agent_identity_simple {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::table::{Self, Table};

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_IDENTITY_ALREADY_EXISTS: u64 = 2;
    const E_IDENTITY_NOT_FOUND: u64 = 3;

    /// Simple agent identity without NFT
    struct AgentIdentity has store, drop, copy {
        agent_id: String,
        name: String,
        owner: address,
        metadata_uri: String,
        capabilities: vector<String>,
        created_at: u64,
        verified: bool,
        aaiss_score: u64,
    }

    /// Registry
    struct IdentityRegistry has key {
        admin: address,
        identities: Table<String, AgentIdentity>,
        owner_to_agent: Table<address, String>,
    }

    /// Initialize
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        move_to(admin, IdentityRegistry {
            admin: admin_addr,
            identities: table::new(),
            owner_to_agent: table::new(),
        });
    }

    /// Register agent identity
    public entry fun register(
        owner: &signer,
        agent_id: String,
        name: String,
        metadata_uri: String,
        capabilities: vector<String>,
    ) acquires IdentityRegistry {
        let owner_addr = signer::address_of(owner);
        let now = timestamp::now_seconds();

        let registry = borrow_global_mut<IdentityRegistry>(@aais);
        
        assert!(!table::contains(&registry.identities, agent_id), E_IDENTITY_ALREADY_EXISTS);

        let identity = AgentIdentity {
            agent_id,
            name,
            owner: owner_addr,
            metadata_uri,
            capabilities,
            created_at: now,
            verified: false,
            aaiss_score: 0,
        };

        table::add(&mut registry.identities, agent_id, identity);
        table::add(&mut registry.owner_to_agent, owner_addr, agent_id);
    }

    /// Update AAIS score
    public entry fun update_score(
        agent_id: String,
        new_score: u64,
    ) acquires IdentityRegistry {
        let registry = borrow_global_mut<IdentityRegistry>(@aais);
        assert!(table::contains(&registry.identities, agent_id), E_IDENTITY_NOT_FOUND);
        
        let identity = table::borrow_mut(&mut registry.identities, agent_id);
        identity.aaiss_score = new_score;
    }

    /// View functions
    #[view]
    public fun get_identity(agent_id: String): AgentIdentity acquires IdentityRegistry {
        let registry = borrow_global<IdentityRegistry>(@aais);
        *table::borrow(&registry.identities, agent_id)
    }

    #[view]
    public fun get_score(agent_id: String): u64 acquires IdentityRegistry {
        let registry = borrow_global<IdentityRegistry>(@aais);
        let identity = table::borrow(&registry.identities, agent_id);
        identity.aaiss_score
    }

    #[view]
    public fun is_registered(agent_id: String): bool acquires IdentityRegistry {
        let registry = borrow_global<IdentityRegistry>(@aais);
        table::contains(&registry.identities, agent_id)
    }
}
