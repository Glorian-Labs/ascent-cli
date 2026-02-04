/**
 * AAIS: Ascent Agent Identity System
 * 
 * TypeScript SDK for interacting with AAIS (ARC-8004) Move contracts.
 * Provides identity, reputation, and validation functionality.
 */

import { Aptos, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

// Contract addresses
const AAIS_MODULE_ADDRESS = process.env.AAIS_MODULE_ADDRESS || "0xCAFE"; // Replace with deployed address

// Trust levels
export enum TrustLevel {
  UNKNOWN = 0,
  NEW = 1,
  DEVELOPING = 2,
  ESTABLISHED = 3,
  TRUSTED = 4,
  EXCELLENT = 5,
}

export const TrustLevelLabels: Record<TrustLevel, string> = {
  [TrustLevel.UNKNOWN]: "Unknown",
  [TrustLevel.NEW]: "New",
  [TrustLevel.DEVELOPING]: "Developing",
  [TrustLevel.ESTABLISHED]: "Established",
  [TrustLevel.TRUSTED]: "Trusted",
  [TrustLevel.EXCELLENT]: "Excellent",
};

// Validation types
export enum ValidationType {
  MANUAL = 0,
  ZKPROOF = 1,
  TEE = 2,
  ORACLE = 3,
}

// Interfaces
export interface AgentIdentity {
  agentId: string;
  name: string;
  metadataUri: string;
  capabilities: string[];
  createdAt: number;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
  aaissScore: number;
}

export interface AgentScore {
  totalScore: number;
  feedbackCount: number;
  averageScoreScaled: number;
  trustLevel: TrustLevel;
  lastUpdated: number;
  totalVolume: number;
}

export interface ReputationAttestation {
  agentId: string;
  clientAddress: string;
  score: number;
  paymentHash: string;
  serviceRating: number;
  timestamp: number;
}

export interface TaskValidation {
  taskId: string;
  agentId: string;
  validatorId: string;
  isValid: boolean;
  validationType: ValidationType;
  proof: string;
  timestamp: number;
}

/**
 * AAIS Client for interacting with the AAIS Move contracts
 */
export class AAISClient {
  private aptos: Aptos;
  private moduleAddress: string;

  constructor(aptos: Aptos, moduleAddress: string = AAIS_MODULE_ADDRESS) {
    this.aptos = aptos;
    this.moduleAddress = moduleAddress;
  }

  // ==================== IDENTITY ====================

  /**
   * Initialize the AAIS identity registry (admin only)
   */
  async initializeIdentityRegistry(admin: Account): Promise<string> {
    const tx = await this.aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${this.moduleAddress}::agent_identity::initialize`,
        functionArguments: [],
      },
    });

    const submitted = await this.aptos.signAndSubmitTransaction({
      signer: admin,
      transaction: tx,
    });

    return submitted.hash;
  }

  /**
   * Mint a new agent identity NFT
   */
  async mintIdentity(
    creator: Account,
    agentId: string,
    name: string,
    metadataUri: string,
    capabilities: string[]
  ): Promise<string> {
    const tx = await this.aptos.transaction.build.simple({
      sender: creator.accountAddress,
      data: {
        function: `${this.moduleAddress}::agent_identity::mint_identity`,
        functionArguments: [
          agentId,
          name,
          metadataUri,
          capabilities,
        ],
      },
    });

    const submitted = await this.aptos.signAndSubmitTransaction({
      signer: creator,
      transaction: tx,
    });

    return submitted.hash;
  }

  /**
   * Verify an agent identity (admin only)
   */
  async verifyIdentity(
    admin: Account,
    tokenAddress: string
  ): Promise<string> {
    const tx = await this.aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${this.moduleAddress}::agent_identity::verify_identity`,
        functionArguments: [tokenAddress],
      },
    });

    const submitted = await this.aptos.signAndSubmitTransaction({
      signer: admin,
      transaction: tx,
    });

    return submitted.hash;
  }

  /**
   * Get agent identity details
   */
  async getIdentity(tokenAddress: string): Promise<AgentIdentity> {
    const result = await this.aptos.view({
      payload: {
        function: `${this.moduleAddress}::agent_identity::get_identity`,
        functionArguments: [tokenAddress],
      },
    });

    return {
      agentId: result[0] as string,
      name: result[1] as string,
      metadataUri: result[2] as string,
      verified: result[3] as boolean,
      createdAt: Number(result[4]),
      aaissScore: Number(result[5]),
    };
  }

  /**
   * Get all registered agent addresses
   */
  async getAllAgents(): Promise<string[]> {
    const result = await this.aptos.view({
      payload: {
        function: `${this.moduleAddress}::agent_identity::get_all_agents`,
        functionArguments: [],
      },
    });

    return result[0] as string[];
  }

  // ==================== REPUTATION ====================

  /**
   * Initialize the reputation registry (admin only)
   */
  async initializeReputationRegistry(admin: Account): Promise<string> {
    const tx = await this.aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${this.moduleAddress}::reputation::initialize`,
        functionArguments: [],
      },
    });

    const submitted = await this.aptos.signAndSubmitTransaction({
      signer: admin,
      transaction: tx,
    });

    return submitted.hash;
  }

  /**
   * Submit feedback attestation for an agent
   */
  async attestFeedback(
    client: Account,
    agentId: string,
    score: number, // 1-5
    paymentHash: string,
    serviceRating: number, // 1-5
    paymentAmount: number
  ): Promise<string> {
    const tx = await this.aptos.transaction.build.simple({
      sender: client.accountAddress,
      data: {
        function: `${this.moduleAddress}::reputation::attest_feedback`,
        functionArguments: [
          agentId,
          score,
          paymentHash,
          serviceRating,
          paymentAmount,
        ],
      },
    });

    const submitted = await this.aptos.signAndSubmitTransaction({
      signer: client,
      transaction: tx,
    });

    return submitted.hash;
  }

  /**
   * Get agent reputation score
   */
  async getAgentScore(agentId: string): Promise<AgentScore> {
    const result = await this.aptos.view({
      payload: {
        function: `${this.moduleAddress}::reputation::get_agent_score`,
        functionArguments: [agentId],
      },
    });

    return {
      totalScore: Number(result[0]),
      feedbackCount: Number(result[1]),
      averageScoreScaled: Number(result[2]),
      trustLevel: result[3] as TrustLevel,
      lastUpdated: Number(result[4]),
      totalVolume: Number(result[5]),
    };
  }

  /**
   * Check if agent meets AgentMesh marketplace threshold (70/100)
   */
  async meetsMarketplaceThreshold(agentId: string): Promise<boolean> {
    const result = await this.aptos.view({
      payload: {
        function: `${this.moduleAddress}::reputation::meets_marketplace_threshold`,
        functionArguments: [agentId],
      },
    });

    return result[0] as boolean;
  }

  /**
   * Get trust level label
   */
  getTrustLevelLabel(level: TrustLevel): string {
    return TrustLevelLabels[level] || "Unknown";
  }

  // ==================== VALIDATION ====================

  /**
   * Initialize the validation registry (admin only)
   */
  async initializeValidationRegistry(admin: Account): Promise<string> {
    const tx = await this.aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${this.moduleAddress}::validation::initialize`,
        functionArguments: [],
      },
    });

    const submitted = await this.aptos.signAndSubmitTransaction({
      signer: admin,
      transaction: tx,
    });

    return submitted.hash;
  }

  /**
   * Add a validator (admin only)
   */
  async addValidator(
    admin: Account,
    validatorAddress: string
  ): Promise<string> {
    const tx = await this.aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${this.moduleAddress}::validation::add_validator`,
        functionArguments: [validatorAddress],
      },
    });

    const submitted = await this.aptos.signAndSubmitTransaction({
      signer: admin,
      transaction: tx,
    });

    return submitted.hash;
  }

  /**
   * Submit task validation
   */
  async submitValidation(
    validator: Account,
    taskId: string,
    agentId: string,
    validatorId: string,
    isValid: boolean,
    proof: string,
    validationType: ValidationType
  ): Promise<string> {
    const tx = await this.aptos.transaction.build.simple({
      sender: validator.accountAddress,
      data: {
        function: `${this.moduleAddress}::validation::submit_validation_with_result`,
        functionArguments: [
          taskId,
          agentId,
          validatorId,
          isValid,
          proof,
          validationType,
        ],
      },
    });

    const submitted = await this.aptos.signAndSubmitTransaction({
      signer: validator,
      transaction: tx,
    });

    return submitted.hash;
  }

  /**
   * Check if address is a validator
   */
  async isValidator(address: string): Promise<boolean> {
    const result = await this.aptos.view({
      payload: {
        function: `${this.moduleAddress}::validation::is_validator`,
        functionArguments: [address],
      },
    });

    return result[0] as boolean;
  }
}

/**
 * Create an AAIS client instance
 */
export function createAAISClient(
  aptos: Aptos,
  moduleAddress?: string
): AAISClient {
  return new AAISClient(aptos, moduleAddress);
}

export default AAISClient;
