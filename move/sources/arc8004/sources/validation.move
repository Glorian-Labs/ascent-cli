/// AAIS: Validation Module
/// 
/// Provides on-chain task validation attestations.
/// Supports multiple validation types including manual, zkProof, TEE, and oracle.
module aais::validation {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::table::{Self, Table};

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_VALIDATION_EXISTS: u64 = 2;
    const E_VALIDATION_NOT_FOUND: u64 = 3;
    const E_INVALID_STATUS: u64 = 4;

    /// Validation status constants
    const STATUS_PENDING: u8 = 0;
    const STATUS_VALIDATED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    /// Validation types
    const VALIDATION_TYPE_MANUAL: u8 = 0;
    const VALIDATION_TYPE_ZKPROOF: u8 = 1;
    const VALIDATION_TYPE_TEE: u8 = 2;
    const VALIDATION_TYPE_ORACLE: u8 = 3;

    /// Task validation attestation
    struct TaskValidation has store, drop, copy {
        /// Unique task identifier
        task_id: String,
        /// Agent that performed the task
        agent_id: String,
        /// Validator identifier
        validator_id: String,
        /// Whether the task is validated
        is_valid: bool,
        /// Validation type
        validation_type: u8,
        /// Cryptographic proof (if applicable)
        proof: String,
        /// Validation timestamp
        timestamp: u64,
    }

    /// Validation registry
    struct ValidationRegistry has key {
        /// Admin address
        admin: address,
        /// Validators whitelist
        validators: vector<address>,
        /// Validations indexed by validator address
        validations: Table<address, vector<TaskValidation>>,
        /// Total validation count
        total_count: u64,
    }

    /// Events
    #[event]
    struct ValidationSubmitted has drop, store {
        task_id: String,
        agent_id: String,
        validator_id: String,
        is_valid: bool,
        validation_type: u8,
        timestamp: u64,
    }

    #[event]
    struct ValidatorAdded has drop, store {
        validator: address,
        added_by: address,
        timestamp: u64,
    }

    /// Initialize the validation registry
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, ValidationRegistry {
            admin: admin_addr,
            validators: vector::empty(),
            validations: table::new(),
            total_count: 0,
        });
    }

    /// Add a validator to the whitelist
    public entry fun add_validator(
        admin: &signer,
        validator: address,
    ) acquires ValidationRegistry {
        let admin_addr = signer::address_of(admin);
        let registry = borrow_global_mut<ValidationRegistry>(@aais);
        
        assert!(registry.admin == admin_addr, E_NOT_AUTHORIZED);
        
        if (!vector::contains(&registry.validators, &validator)) {
            vector::push_back(&mut registry.validators, validator);
            
            event::emit(ValidatorAdded {
                validator,
                added_by: admin_addr,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Submit a task validation
    public entry fun submit_validation(
        validator: &signer,
        task_id: String,
        agent_id: String,
        validator_id: String,
        proof: String,
        validation_type: u8,
    ) acquires ValidationRegistry {
        let validator_addr = signer::address_of(validator);
        let now = timestamp::now_seconds();

        let validation = TaskValidation {
            task_id,
            agent_id,
            validator_id,
            is_valid: true, // Default to valid when submitted
            validation_type,
            proof,
            timestamp: now,
        };

        // Store validation
        let registry = borrow_global_mut<ValidationRegistry>(@aais);
        
        if (!table::contains(&registry.validations, validator_addr)) {
            table::add(&mut registry.validations, validator_addr, vector::empty());
        };
        
        let validation_list = table::borrow_mut(&mut registry.validations, validator_addr);
        vector::push_back(validation_list, validation);
        
        registry.total_count = registry.total_count + 1;

        // Emit event
        event::emit(ValidationSubmitted {
            task_id: validation.task_id,
            agent_id: validation.agent_id,
            validator_id: validation.validator_id,
            is_valid: true,
            validation_type,
            timestamp: now,
        });
    }

    /// Submit validation with explicit validity
    public entry fun submit_validation_with_result(
        validator: &signer,
        task_id: String,
        agent_id: String,
        validator_id: String,
        is_valid: bool,
        proof: String,
        validation_type: u8,
    ) acquires ValidationRegistry {
        let validator_addr = signer::address_of(validator);
        let now = timestamp::now_seconds();

        let validation = TaskValidation {
            task_id,
            agent_id,
            validator_id,
            is_valid,
            validation_type,
            proof,
            timestamp: now,
        };

        // Store validation
        let registry = borrow_global_mut<ValidationRegistry>(@aais);
        
        if (!table::contains(&registry.validations, validator_addr)) {
            table::add(&mut registry.validations, validator_addr, vector::empty());
        };
        
        let validation_list = table::borrow_mut(&mut registry.validations, validator_addr);
        vector::push_back(validation_list, validation);
        
        registry.total_count = registry.total_count + 1;

        // Emit event
        event::emit(ValidationSubmitted {
            task_id: validation.task_id,
            agent_id: validation.agent_id,
            validator_id: validation.validator_id,
            is_valid,
            validation_type,
            timestamp: now,
        });
    }

    /// View functions
    
    #[view]
    public fun get_total_validations(): u64 acquires ValidationRegistry {
        let registry = borrow_global<ValidationRegistry>(@aais);
        registry.total_count
    }

    #[view]
    public fun is_validator(addr: address): bool acquires ValidationRegistry {
        let registry = borrow_global<ValidationRegistry>(@aais);
        vector::contains(&registry.validators, &addr)
    }

    #[view]
    public fun get_validator_validations(validator_address: address): vector<TaskValidation> acquires ValidationRegistry {
        let registry = borrow_global<ValidationRegistry>(@aais);
        
        if (table::contains(&registry.validations, validator_address)) {
            *table::borrow(&registry.validations, validator_address)
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun get_validation_type_label(validation_type: u8): String {
        if (validation_type == VALIDATION_TYPE_MANUAL) {
            std::string::utf8(b"Manual")
        } else if (validation_type == VALIDATION_TYPE_ZKPROOF) {
            std::string::utf8(b"ZK Proof")
        } else if (validation_type == VALIDATION_TYPE_TEE) {
            std::string::utf8(b"TEE Attestation")
        } else if (validation_type == VALIDATION_TYPE_ORACLE) {
            std::string::utf8(b"Oracle")
        } else {
            std::string::utf8(b"Unknown")
        }
    }
}
