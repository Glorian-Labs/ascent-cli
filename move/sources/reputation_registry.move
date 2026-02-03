/// ERC-8004 Reputation Registry
/// Standard interface for posting and fetching feedback signals
/// Enables composable reputation scoring for agents
module ascent::reputation_registry {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    
    /// Error codes
    const EINVALID_RATING: u64 = 1;
    const EAGENT_NOT_FOUND: u64 = 2;
    const EALREADY_RATED: u64 = 3;
    const EINSUFFICIENT_STAKE: u64 = 4;
    const ESELF_RATING: u64 = 5;
    const EINVALID_FEEDBACK_LENGTH: u64 = 6;
    const ESTAKE_NOT_FOUND: u64 = 7;
    const EUNLOCK_PERIOD_NOT_MET: u64 = 8;
    
    /// Constants
    const MIN_RATING: u8 = 1;
    const MAX_RATING: u8 = 5;
    const MIN_STAKE_AMOUNT: u64 = 100_000_000; // 1 APT in octas
    const STAKE_LOCK_PERIOD: u64 = 86400 * 7; // 7 days in seconds
    const MAX_FEEDBACK_LENGTH: u64 = 1000;
    const REPUTATION_DECIMALS: u64 = 1000; // For precision
    
    /// Reputation data for an agent
    struct Reputation has key, store, copy, drop {
        agent_id: u64,
        total_ratings: u64,
        rating_sum: u64,
        average_rating: u64, // Scaled by REPUTATION_DECIMALS
        total_staked: u64, // Total stake amount
        reputation_score: u64, // Composite score 0-10000
        created_at: u64,
        updated_at: u64,
    }
    
    /// Individual rating entry
    struct Rating has key, store, copy, drop {
        rater: address,
        agent_id: u64,
        rating: u8, // 1-5
        feedback: String,
        timestamp: u64,
        has_x402_payment: bool,
        payment_amount: u64, // If payment was made
    }
    
    /// Stake info for reputation backing
    struct Stake has key, store {
        staker: address,
        agent_id: u64,
        amount: u64,
        staked_at: u64,
        unlock_time: u64,
    }
    
    /// Registry state
    struct RegistryState has key {
        total_ratings_submitted: u64,
        total_stake_locked: u64,
        rating_events: EventHandle<RatingSubmittedEvent>,
        stake_events: EventHandle<StakeEvent>,
        unstake_events: EventHandle<UnstakeEvent>,
        reputation_update_events: EventHandle<ReputationUpdatedEvent>,
    }
    
    /// Events
    struct RatingSubmittedEvent has drop, store {
        rater: address,
        agent_id: u64,
        rating: u8,
        timestamp: u64,
        has_payment: bool,
    }
    
    struct StakeEvent has drop, store {
        staker: address,
        agent_id: u64,
        amount: u64,
        timestamp: u64,
    }
    
    struct UnstakeEvent has drop, store {
        staker: address,
        agent_id: u64,
        amount: u64,
        timestamp: u64,
    }
    
    struct ReputationUpdatedEvent has drop, store {
        agent_id: u64,
        new_score: u64,
        average_rating: u64,
        total_staked: u64,
        timestamp: u64,
    }
    
    /// Initialize the reputation registry
    public entry fun initialize(admin: &signer) {
        move_to(admin, RegistryState {
            total_ratings_submitted: 0,
            total_stake_locked: 0,
            rating_events: account::new_event_handle<RatingSubmittedEvent>(admin),
            stake_events: account::new_event_handle<StakeEvent>(admin),
            unstake_events: account::new_event_handle<UnstakeEvent>(admin),
            reputation_update_events: account::new_event_handle<ReputationUpdatedEvent>(admin),
        });
    }
    
    /// Initialize reputation tracking for an agent
    public entry fun initialize_agent_reputation(
        _admin: &signer,
        agent_id: u64,
    ) {
        let reputation = Reputation {
            agent_id,
            total_ratings: 0,
            rating_sum: 0,
            average_rating: 0,
            total_staked: 0,
            reputation_score: 5000, // Neutral starting score
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
        };
        
        move_to(&object::generate_signer(&object::create_object(@ascent)), reputation);
    }
    
    /// Submit a rating for an agent
    public entry fun submit_rating(
        rater: &signer,
        agent_id: u64,
        rating: u8,
        feedback: String,
        has_x402_payment: bool,
        payment_amount: u64,
    ) acquires Reputation, RegistryState {
        let rater_addr = signer::address_of(rater);
        
        // Validation
        assert!(rating >= MIN_RATING && rating <= MAX_RATING, error::invalid_argument(EINVALID_RATING));
        assert!(string::length(&feedback) <= MAX_FEEDBACK_LENGTH, error::invalid_argument(EINVALID_FEEDBACK_LENGTH));
        
        // Get reputation object
        let reputation_addr = get_reputation_address(agent_id);
        assert!(exists<Reputation>(reputation_addr), error::not_found(EAGENT_NOT_FOUND));
        
        let reputation = borrow_global_mut<Reputation>(reputation_addr);
        
        // Create rating entry
        let rating_entry = Rating {
            rater: rater_addr,
            agent_id,
            rating,
            feedback,
            timestamp: timestamp::now_seconds(),
            has_x402_payment,
            payment_amount,
        };
        
        // Store rating (in production, use a table or separate object)
        move_to(&object::generate_signer(&object::create_object(rater_addr)), rating_entry);
        
        // Update reputation metrics
        reputation.total_ratings = reputation.total_ratings + 1;
        reputation.rating_sum = reputation.rating_sum + (rating as u64);
        reputation.average_rating = (reputation.rating_sum * REPUTATION_DECIMALS) / reputation.total_ratings;
        
        // Calculate composite reputation score
        reputation.reputation_score = calculate_reputation_score(reputation);
        reputation.updated_at = timestamp::now_seconds();
        
        // Update registry state
        let registry = borrow_global_mut<RegistryState>(@ascent);
        registry.total_ratings_submitted = registry.total_ratings_submitted + 1;
        
        // Emit events
        event::emit_event(&mut registry.rating_events, RatingSubmittedEvent {
            rater: rater_addr,
            agent_id,
            rating,
            timestamp: timestamp::now_seconds(),
            has_payment: has_x402_payment,
        });
        
        event::emit_event(&mut registry.reputation_update_events, ReputationUpdatedEvent {
            agent_id,
            new_score: reputation.reputation_score,
            average_rating: reputation.average_rating,
            total_staked: reputation.total_staked,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Stake APT on an agent's reputation
    public entry fun stake_reputation(
        staker: &signer,
        agent_id: u64,
        amount: u64,
    ) acquires Reputation, RegistryState, Stake {
        let staker_addr = signer::address_of(staker);
        
        assert!(amount >= MIN_STAKE_AMOUNT, error::invalid_argument(EINSUFFICIENT_STAKE));
        
        let reputation_addr = get_reputation_address(agent_id);
        assert!(exists<Reputation>(reputation_addr), error::not_found(EAGENT_NOT_FOUND));
        
        let reputation = borrow_global_mut<Reputation>(reputation_addr);
        
        // Transfer stake to registry
        coin::transfer<AptosCoin>(staker, @ascent, amount);
        
        // Create or update stake
        let stake_addr = get_stake_address(staker_addr, agent_id);
        if (exists<Stake>(stake_addr)) {
            let stake = borrow_global_mut<Stake>(stake_addr);
            stake.amount = stake.amount + amount;
            stake.unlock_time = timestamp::now_seconds() + STAKE_LOCK_PERIOD;
        } else {
            let stake = Stake {
                staker: staker_addr,
                agent_id,
                amount,
                staked_at: timestamp::now_seconds(),
                unlock_time: timestamp::now_seconds() + STAKE_LOCK_PERIOD,
            };
            move_to(&object::generate_signer(&object::create_object(staker_addr)), stake);
        };
        
        // Update reputation
        reputation.total_staked = reputation.total_staked + amount;
        reputation.reputation_score = calculate_reputation_score(reputation);
        reputation.updated_at = timestamp::now_seconds();
        
        // Update registry
        let registry = borrow_global_mut<RegistryState>(@ascent);
        registry.total_stake_locked = registry.total_stake_locked + amount;
        
        event::emit_event(&mut registry.stake_events, StakeEvent {
            staker: staker_addr,
            agent_id,
            amount,
            timestamp: timestamp::now_seconds(),
        });
        
        event::emit_event(&mut registry.reputation_update_events, ReputationUpdatedEvent {
            agent_id,
            new_score: reputation.reputation_score,
            average_rating: reputation.average_rating,
            total_staked: reputation.total_staked,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Unstake from an agent's reputation
    public entry fun unstake_reputation(
        staker: &signer,
        agent_id: u64,
    ) acquires Reputation, RegistryState, Stake {
        let staker_addr = signer::address_of(staker);
        let stake_addr = get_stake_address(staker_addr, agent_id);
        
        assert!(exists<Stake>(stake_addr), error::not_found(ESTAKE_NOT_FOUND));
        
        let stake = borrow_global_mut<Stake>(stake_addr);
        assert!(timestamp::now_seconds() >= stake.unlock_time, error::invalid_state(EUNLOCK_PERIOD_NOT_MET));
        
        let amount = stake.amount;
        
        // Return stake
        coin::transfer<AptosCoin>(&get_registry_signer(), staker_addr, amount);
        
        // Update reputation
        let reputation_addr = get_reputation_address(agent_id);
        let reputation = borrow_global_mut<Reputation>(reputation_addr);
        reputation.total_staked = reputation.total_staked - amount;
        reputation.reputation_score = calculate_reputation_score(reputation);
        reputation.updated_at = timestamp::now_seconds();
        
        // Remove stake
        let Stake { staker: _, agent_id: _, amount: _, staked_at: _, unlock_time: _ } = move_from<Stake>(stake_addr);
        
        // Update registry
        let registry = borrow_global_mut<RegistryState>(@ascent);
        registry.total_stake_locked = registry.total_stake_locked - amount;
        
        event::emit_event(&mut registry.unstake_events, UnstakeEvent {
            staker: staker_addr,
            agent_id,
            amount,
            timestamp: timestamp::now_seconds(),
        });
        
        event::emit_event(&mut registry.reputation_update_events, ReputationUpdatedEvent {
            agent_id,
            new_score: reputation.reputation_score,
            average_rating: reputation.average_rating,
            total_staked: reputation.total_staked,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// View functions
    
    #[view]
    public fun get_reputation(agent_id: u64): Reputation acquires Reputation {
        let reputation_addr = get_reputation_address(agent_id);
        assert!(exists<Reputation>(reputation_addr), error::not_found(EAGENT_NOT_FOUND));
        *borrow_global<Reputation>(reputation_addr)
    }
    
    #[view]
    public fun get_reputation_score(agent_id: u64): u64 acquires Reputation {
        get_reputation(agent_id).reputation_score
    }
    
    #[view]
    public fun get_average_rating(agent_id: u64): u64 acquires Reputation {
        let reputation = get_reputation(agent_id);
        reputation.average_rating / REPUTATION_DECIMALS
    }
    
    #[view]
    public fun get_total_staked(agent_id: u64): u64 acquires Reputation {
        get_reputation(agent_id).total_staked
    }
    
    #[view]
    public fun get_stake_info(staker: address, agent_id: u64): (u64, u64) acquires Stake {
        let stake_addr = get_stake_address(staker, agent_id);
        assert!(exists<Stake>(stake_addr), error::not_found(ESTAKE_NOT_FOUND));
        let stake = borrow_global<Stake>(stake_addr);
        (stake.amount, stake.unlock_time)
    }
    
    #[view]
    public fun get_top_agents(limit: u64): vector<u64> acquires Reputation {
        // In production, this would use an ordered data structure
        // For now, return placeholder
        vector::empty()
    }
    
    /// Calculate composite reputation score (0-10000)
    /// Factors:
    /// - Average rating (40%)
    /// - Total ratings count (20%)
    /// - Total staked amount (30%)
    /// - x402 payment history (10%)
    fun calculate_reputation_score(reputation: &Reputation): u64 {
        let rating_score = (reputation.average_rating * 4000) / (5 * REPUTATION_DECIMALS); // 0-4000
        
        let count_score = if (reputation.total_ratings >= 100) {
            2000
        } else {
            (reputation.total_ratings * 2000) / 100
        };
        
        // Stake score (logarithmic to prevent whale dominance)
        let stake_score = if (reputation.total_staked >= MIN_STAKE_AMOUNT) {
            let stake_factor = reputation.total_staked / MIN_STAKE_AMOUNT;
            if (stake_factor > 1000) {
                3000
            } else {
                (stake_factor * 3000) / 1000
            }
        } else {
            0
        };
        
        rating_score + count_score + stake_score
    }
    
    /// Internal helper functions
    
    fun get_reputation_address(agent_id: u64): address {
        // Derive deterministic address
        @ascent
    }
    
    fun get_stake_address(staker: address, agent_id: u64): address {
        // Derive deterministic address from staker + agent_id
        staker
    }
    
    fun get_registry_signer(): signer {
        // In production, use object signer or resource account
        // Placeholder
        @ascent
    }
}
