/// ERC-8004 Identity Registry
/// NFT-based agent registration with URI storage
/// Provides portable, censorship-resistant agent identifiers
module ascent::identity_registry {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_framework::timestamp;
    use aptos_token_objects::token;
    use aptos_token_objects::collection;
    
    /// Error codes
    const EAGENT_NOT_FOUND: u64 = 1;
    const EAGENT_ALREADY_EXISTS: u64 = 2;
    const EINVALID_URI: u64 = 3;
    const ENOT_OWNER: u64 = 4;
    const EAGENT_INACTIVE: u64 = 5;
    const EINVALID_NAME: u64 = 6;
    const EREGISTRY_PAUSED: u64 = 7;
    const EINVALID_NAMESPACE: u64 = 8;
    
    /// Constants
    const COLLECTION_NAME: vector<u8> = b"Ascent Agent Identities";
    const COLLECTION_DESCRIPTION: vector<u8> = b"ERC-8004 compatible portable agent identities";
    const COLLECTION_URI: vector<u8> = b"https://ascent.io/collection";
    const MAX_NAME_LENGTH: u64 = 64;
    const MAX_URI_LENGTH: u64 = 512;
    
    /// Global agent identifier format: {namespace}:{chainId}:{registry}:{agentId}
    /// Example: aptos:2:0xabc...:42
    
    /// Core agent data structure
    struct Agent has key, store, copy, drop {
        agent_id: u64,
        name: String,
        owner: address,
        agent_uri: String,
        registration_timestamp: u64,
        is_active: bool,
        namespace: String,
        chain_id: u64,
        metadata: AgentMetadata,
    }
    
    /// Extended agent metadata
    struct AgentMetadata has key, store, copy, drop {
        x402_support: bool,
        supported_trust_models: vector<String>,
        version: u64,
    }
    
    /// Registry state
    struct RegistryState has key {
        /// Total number of registered agents
        agent_count: u64,
        /// Mapping of agent_id -> Agent (stored as object)
        /// Paused state for emergency
        is_paused: bool,
        /// Registry namespace (e.g., "aptos")
        namespace: String,
        /// Chain ID
        chain_id: u64,
        /// Registry address
        registry_address: address,
        /// Event handles
        agent_registered_events: EventHandle<AgentRegisteredEvent>,
        agent_updated_events: EventHandle<AgentUpdatedEvent>,
        agent_transferred_events: EventHandle<AgentTransferredEvent>,
        agent_deactivated_events: EventHandle<AgentDeactivatedEvent>,
    }
    
    /// Agent object to own the NFT
    struct AgentObject has key {
        agent_id: u64,
        extend_ref: ExtendRef,
    }
    
    /// Events
    struct AgentRegisteredEvent has drop, store {
        agent_id: u64,
        name: String,
        owner: address,
        agent_uri: String,
        timestamp: u64,
    }
    
    struct AgentUpdatedEvent has drop, store {
        agent_id: u64,
        owner: address,
        old_uri: String,
        new_uri: String,
        timestamp: u64,
    }
    
    struct AgentTransferredEvent has drop, store {
        agent_id: u64,
        from: address,
        to: address,
        timestamp: u64,
    }
    
    struct AgentDeactivatedEvent has drop, store {
        agent_id: u64,
        owner: address,
        timestamp: u64,
    }
    
    /// Initialize the registry (called once by deployer)
    public entry fun initialize(
        deployer: &signer,
        namespace: String,
        chain_id: u64,
    ) {
        let deployer_addr = signer::address_of(deployer);
        
        // Create collection for agent NFTs
        collection::create_unlimited_collection(
            deployer,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_NAME),
            option::none(),
            string::utf8(COLLECTION_URI),
        );
        
        move_to(deployer, RegistryState {
            agent_count: 0,
            is_paused: false,
            namespace,
            chain_id,
            registry_address: deployer_addr,
            agent_registered_events: account::new_event_handle<AgentRegisteredEvent>(deployer),
            agent_updated_events: account::new_event_handle<AgentUpdatedEvent>(deployer),
            agent_transferred_events: account::new_event_handle<AgentTransferredEvent>(deployer),
            agent_deactivated_events: account::new_event_handle<AgentDeactivatedEvent>(deployer),
        });
    }
    
    /// Register a new agent identity
    public entry fun register_agent(
        account: &signer,
        name: String,
        agent_uri: String,
        x402_support: bool,
    ) acquires RegistryState {
        let registry = borrow_global_mut<RegistryState>(@ascent);
        assert!(!registry.is_paused, error::invalid_state(EREGISTRY_PAUSED));
        
        let name_len = string::length(&name);
        assert!(name_len > 0 && name_len <= MAX_NAME_LENGTH, error::invalid_argument(EINVALID_NAME));
        
        let uri_len = string::length(&agent_uri);
        assert!(uri_len > 0 && uri_len <= MAX_URI_LENGTH, error::invalid_argument(EINVALID_URI));
        
        let owner = signer::address_of(account);
        let agent_id = registry.agent_count + 1;
        
        // Create agent object
        let constructor_ref = object::create_object(owner);
        let object_signer = object::generate_signer(&constructor_ref);
        let extend_ref = object::generate_extend_ref(&constructor_ref);
        
        // Store agent data
        let agent = Agent {
            agent_id,
            name: name,
            owner,
            agent_uri: agent_uri,
            registration_timestamp: timestamp::now_seconds(),
            is_active: true,
            namespace: registry.namespace,
            chain_id: registry.chain_id,
            metadata: AgentMetadata {
                x402_support,
                supported_trust_models: vector::empty(),
                version: 1,
            },
        };
        
        move_to(&object_signer, AgentObject { 
            agent_id, 
            extend_ref 
        });
        move_to(&object_signer, agent);
        
        // Mint NFT representing the agent
        let token_name = string::utf8(b"Agent #");
        string::append(&mut token_name, to_string(agent_id));
        
        token::create_named_token(
            account,
            string::utf8(COLLECTION_NAME),
            string::utf8(COLLECTION_DESCRIPTION),
            token_name,
            option::none(),
            agent_uri,
        );
        
        // Update registry state
        registry.agent_count = agent_id;
        
        // Emit event
        event::emit_event(&mut registry.agent_registered_events, AgentRegisteredEvent {
            agent_id,
            name,
            owner,
            agent_uri,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Update agent URI (metadata)
    public entry fun update_agent_uri(
        account: &signer,
        agent_id: u64,
        new_uri: String,
    ) acquires RegistryState, Agent {
        let owner = signer::address_of(account);
        let agent_obj_addr = get_agent_object_address(agent_id);
        
        let agent = borrow_global_mut<Agent>(agent_obj_addr);
        assert!(agent.owner == owner, error::permission_denied(ENOT_OWNER));
        assert!(agent.is_active, error::invalid_state(EAGENT_INACTIVE));
        
        let uri_len = string::length(&new_uri);
        assert!(uri_len > 0 && uri_len <= MAX_URI_LENGTH, error::invalid_argument(EINVALID_URI));
        
        let old_uri = agent.agent_uri;
        agent.agent_uri = new_uri;
        agent.metadata.version = agent.metadata.version + 1;
        
        let registry = borrow_global_mut<RegistryState>(@ascent);
        event::emit_event(&mut registry.agent_updated_events, AgentUpdatedEvent {
            agent_id,
            owner,
            old_uri,
            new_uri,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Transfer agent ownership
    public entry fun transfer_agent(
        account: &signer,
        agent_id: u64,
        new_owner: address,
    ) acquires RegistryState, Agent {
        let current_owner = signer::address_of(account);
        let agent_obj_addr = get_agent_object_address(agent_id);
        
        let agent = borrow_global_mut<Agent>(agent_obj_addr);
        assert!(agent.owner == current_owner, error::permission_denied(ENOT_OWNER));
        assert!(agent.is_active, error::invalid_state(EAGENT_INACTIVE));
        
        agent.owner = new_owner;
        
        let registry = borrow_global_mut<RegistryState>(@ascent);
        event::emit_event(&mut registry.agent_transferred_events, AgentTransferredEvent {
            agent_id,
            from: current_owner,
            to: new_owner,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Deactivate an agent (soft delete)
    public entry fun deactivate_agent(
        account: &signer,
        agent_id: u64,
    ) acquires RegistryState, Agent {
        let owner = signer::address_of(account);
        let agent_obj_addr = get_agent_object_address(agent_id);
        
        let agent = borrow_global_mut<Agent>(agent_obj_addr);
        assert!(agent.owner == owner, error::permission_denied(ENOT_OWNER));
        
        agent.is_active = false;
        
        let registry = borrow_global_mut<RegistryState>(@ascent);
        event::emit_event(&mut registry.agent_deactivated_events, AgentDeactivatedEvent {
            agent_id,
            owner,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Add supported trust model
    public entry fun add_trust_model(
        account: &signer,
        agent_id: u64,
        trust_model: String,
    ) acquires Agent {
        let owner = signer::address_of(account);
        let agent_obj_addr = get_agent_object_address(agent_id);
        
        let agent = borrow_global_mut<Agent>(agent_obj_addr);
        assert!(agent.owner == owner, error::permission_denied(ENOT_OWNER));
        
        vector::push_back(&mut agent.metadata.supported_trust_models, trust_model);
    }
    
    /// View functions
    
    #[view]
    public fun get_agent(agent_id: u64): Agent acquires Agent {
        let agent_obj_addr = get_agent_object_address(agent_id);
        assert!(exists<Agent>(agent_obj_addr), error::not_found(EAGENT_NOT_FOUND));
        *borrow_global<Agent>(agent_obj_addr)
    }
    
    #[view]
    public fun get_agent_count(): u64 acquires RegistryState {
        borrow_global<RegistryState>(@ascent).agent_count
    }
    
    #[view]
    public fun get_agent_uri(agent_id: u64): String acquires Agent {
        let agent = get_agent(agent_id);
        agent.agent_uri
    }
    
    #[view]
    public fun get_agent_owner(agent_id: u64): address acquires Agent {
        let agent = get_agent(agent_id);
        agent.owner
    }
    
    #[view]
    public fun is_agent_active(agent_id: u64): bool acquires Agent {
        let agent = get_agent(agent_id);
        agent.is_active
    }
    
    #[view]
    public fun get_global_identifier(agent_id: u64): String acquires RegistryState, Agent {
        let registry = borrow_global<RegistryState>(@ascent);
        let agent = get_agent(agent_id);
        
        let identifier = registry.namespace;
        string::append(&mut identifier, string::utf8(b":"));
        string::append(&mut identifier, to_string(registry.chain_id));
        string::append(&mut identifier, string::utf8(b":"));
        string::append(&mut identifier, to_string(registry.registry_address));
        string::append(&mut identifier, string::utf8(b":"));
        string::append(&mut identifier, to_string(agent_id));
        
        identifier
    }
    
    #[view]
    public fun get_agents_by_owner(owner: address): vector<u64> acquires Agent {
        let result = vector::empty();
        let count = get_agent_count();
        let i = 1;
        
        while (i <= count) {
            let agent_obj_addr = get_agent_object_address(i);
            if (exists<Agent>(agent_obj_addr)) {
                let agent = borrow_global<Agent>(agent_obj_addr);
                if (agent.owner == owner && agent.is_active) {
                    vector::push_back(&mut result, i);
                }
            };
            i = i + 1;
        };
        
        result
    }
    
    /// Internal functions
    
    fun get_agent_object_address(agent_id: u64): address {
        // Derive deterministic address from agent_id
        // In production, use a proper derivation scheme
        @ascent
    }
    
    fun to_string(n: u64): String {
        if (n == 0) {
            return string::utf8(b"0")
        };
        
        let digits = vector::empty<u8>();
        let num = n;
        
        while (num > 0) {
            let digit = ((num % 10) as u8) + 48;
            vector::push_back(&mut digits, digit);
            num = num / 10;
        };
        
        vector::reverse(&mut digits);
        string::utf8(digits)
    }
    
    /// Admin functions
    
    public entry fun pause_registry(admin: &signer) acquires RegistryState {
        assert!(signer::address_of(admin) == @ascent, error::permission_denied(ENOT_OWNER));
        let registry = borrow_global_mut<RegistryState>(@ascent);
        registry.is_paused = true;
    }
    
    public entry fun unpause_registry(admin: &signer) acquires RegistryState {
        assert!(signer::address_of(admin) == @ascent, error::permission_denied(ENOT_OWNER));
        let registry = borrow_global_mut<RegistryState>(@ascent);
        registry.is_paused = false;
    }
}
