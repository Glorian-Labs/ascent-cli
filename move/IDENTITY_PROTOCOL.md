# ERC-8004 Identity & Reputation System

This directory contains the Aptos-native implementation of the ERC-8004 standard for portable agent identity and reputation.

## Architecture

### Three Core Registries

1. **Identity Registry** (`identity_registry.move`)
   - NFT-based agent registration (analogous to ERC-721)
   - Portable, censorship-resistant identifiers
   - Agent URI resolution to registration files
   - Transferable ownership

2. **Reputation Registry** (`reputation_registry.move`)
   - Standard interface for posting/reading feedback signals
   - On-chain scoring with composability
   - Support for x402-enriched feedback

3. **Validation Registry** (`validation_registry.move`)
   - Hooks for independent validator checks
   - Stake-secured re-execution support
   - TEE attestation and zkML verification placeholders

## Agent Registration File Format

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "myAgentName",
  "description": "A natural language description of the Agent",
  "image": "https://example.com/agentimage.png",
  "services": [
    {
      "name": "A2A",
      "endpoint": "https://agent.example/.well-known/agent-card.json",
      "version": "0.3.0"
    },
    {
      "name": "MCP",
      "endpoint": "https://mcp.agent.eth/",
      "version": "2025-06-18"
    }
  ],
  "x402Support": true,
  "active": true,
  "registrations": [
    {
      "agentId": 22,
      "agentRegistry": "eip155:1:0x742..."
    }
  ],
  "supportedTrust": ["reputation", "crypto-economic", "tee-attestation"]
}
```

## CLI Commands

### Identity Management
- `ascent identity create <name>` - Register new agent identity
- `ascent identity update <agent-id> --uri <uri>` - Update agent metadata
- `ascent identity transfer <agent-id> <new-owner>` - Transfer ownership
- `ascent identity resolve <agent-id>` - Resolve agent registration file

### Reputation Operations
- `ascent reputation rate <agent-id> --score <1-5> --feedback "..."` - Rate an agent
- `ascent reputation stake <agent-id> --amount <apt>` - Stake on agent reputation
- `ascent reputation query <agent-id>` - Query agent reputation score
- `ascent reputation list --top` - List top-rated agents

### Validation
- `ascent validation request <agent-id> --type <tee/zkml>` - Request validation
- `ascent validation submit <agent-id> --result <pass/fail>` - Submit validation result

## Global Agent Identifier Format

Agents are uniquely identified globally by:
```
{namespace}:{chainId}:{identityRegistry}:{agentId}
```

Example:
```
eip155:1:0x742d35cc...:42
aptos:2:0xabc123...:15
```

## Trust Models

The protocol supports pluggable, tiered trust models:

1. **Reputation** - Client feedback and scoring
2. **Crypto-economic** - Stake-secured validation
3. **TEE Attestation** - Trusted Execution Environment proofs
4. **zkML** - Zero-knowledge ML verification

## Integration with x402

Reputation signals can be enriched with x402 payment data:
- Successful payments increase reputation
- Disputed payments decrease reputation
- Payment volume contributes to trust score

## Security Considerations

- Identity ownership is transferable via NFT standard
- Reputation scores are resistant to Sybil attacks through staking
- Validation results require stake to prevent spam
- All registries emit events for off-chain indexing
