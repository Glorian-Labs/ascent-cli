// AgentMesh API Client - Updated for AAIS Integration
// Connects to server-v2.js backend with on-chain reputation

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007';

// Trust levels from AAIS
export enum TrustLevel {
  UNKNOWN = 0,
  NEW = 1,
  DEVELOPING = 2,
  ESTABLISHED = 3,
  TRUSTED = 4,
  EXCELLENT = 5,
}

export const TrustLevelLabels: Record<TrustLevel, string> = {
  [TrustLevel.UNKNOWN]: 'Unknown',
  [TrustLevel.NEW]: 'New',
  [TrustLevel.DEVELOPING]: 'Developing',
  [TrustLevel.ESTABLISHED]: 'Established',
  [TrustLevel.TRUSTED]: 'Trusted',
  [TrustLevel.EXCELLENT]: 'Excellent',
};

export interface OnChainReputation {
  totalScore: number;
  feedbackCount: number;
  averageScoreScaled: number;
  trustLevel: TrustLevel;
  lastUpdated: number;
  totalVolume: number;
}

export interface Agent {
  id: number;
  name: string;
  address: string;
  agent_id?: string;
  token_address?: string;
  aa_score: number;
  on_chain_score?: number;
  trust_level?: number;
  total_transactions: number;
  successful_transactions: number;
  total_earned: string;
  created_at: string;
  reputation_tier: 'Elite' | 'Verified' | 'Standard' | 'New';
  // Enriched from AAIS
  on_chain_reputation?: OnChainReputation;
  trust_level_label?: string;
  service_count?: number;
  transaction_count?: number;
}

export interface Service {
  id: number;
  agent_name: string;
  title: string;
  description: string;
  category: string;
  price: string;
  endpoint: string;
  active: boolean;
  created_at: string;
  aa_score?: number;
  total_transactions?: number;
  successful_transactions?: number;
  reputation_tier?: string;
  agent_name_display?: string;
}

export interface Transaction {
  id: number;
  service_id: number;
  provider_name: string;
  consumer_name: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  rating?: number;
  review?: string;
  tx_hash?: string;
  payment_hash?: string;
  created_at: string;
  service_title?: string;
  category?: string;
}

export interface StatsOverview {
  activeAgents: number;
  servicesListed: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  totalVolumeUSDC: number;
}

export interface DashboardStats {
  overview: StatsOverview;
  topAgents: Agent[];
  recentTransactions: Transaction[];
}

export interface HealthStatus {
  status: string;
  aais_enabled: boolean;
  network: string;
  timestamp: string;
}

// API Functions
async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  
  return res.json();
}

// Health Check
export async function getHealth(): Promise<HealthStatus> {
  return fetchJSON('/api/health');
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchJSON('/api/stats');
}

// Agents
export async function getAgents(params?: { min_aais?: number; sort?: 'score' | 'earnings' }): Promise<{ count: number; agents: Agent[] }> {
  const searchParams = new URLSearchParams();
  if (params?.min_aais) searchParams.set('min_aais', params.min_aais.toString());
  if (params?.sort) searchParams.set('sort', params.sort);
  
  const query = searchParams.toString();
  return fetchJSON(`/api/agents${query ? `?${query}` : ''}`);
}

export async function getAgent(name: string): Promise<Agent & { services: Service[]; recent_transactions: Transaction[] }> {
  return fetchJSON(`/api/agents/${encodeURIComponent(name)}`);
}

// Register new agent
export async function registerAgent(data: {
  name: string;
  address: string;
  agent_id?: string;
  token_address?: string;
}): Promise<{ id: number; name: string; address: string; agent_id?: string; aa_score: number }> {
  return fetchJSON('/api/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Services
export async function getServices(params?: { min_aais?: number; category?: string; agent?: string }): Promise<{ count: number; services: Service[] }> {
  const searchParams = new URLSearchParams();
  if (params?.min_aais) searchParams.set('min_aais', params.min_aais.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.agent) searchParams.set('agent', params.agent);
  
  const query = searchParams.toString();
  return fetchJSON(`/api/services${query ? `?${query}` : ''}`);
}

export async function listService(data: {
  agent_name: string;
  title: string;
  description?: string;
  category?: string;
  price: string;
  endpoint?: string;
}): Promise<{ success: boolean; service_id: number; message: string; aa_score: number }> {
  return fetchJSON('/api/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Hiring & Transactions (x402 payments)
export async function hireService(serviceId: number, consumerName: string): Promise<{
  success: boolean;
  payment_required: { 
    amount: string; 
    asset: string; 
    network: string;
    payTo: string;
    extra?: { sponsored: boolean; service_id: number; service_title: string };
  };
  raw_header?: string;
}> {
  const res = await fetch(`${API_BASE}/api/services/${serviceId}/pay`, {
    method: 'GET',
    headers: { 'X-Consumer-Name': consumerName },
  });

  if (res.status === 402) {
    const header = res.headers.get('x-payment-required') || res.headers.get('X-PAYMENT-REQUIRED');
    const json = await res.json().catch(() => ({}));
    return {
      success: true,
      payment_required: json.requirements || {},
      raw_header: header || undefined,
    };
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function callServiceWithPayment(
  serviceId: number, 
  paymentPayload: string, 
  consumerName: string
): Promise<{
  success: boolean;
  message: string;
  transaction_hash: string;
  service_result?: any;
}> {
  return fetchJSON(`/api/services/${serviceId}/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Signature': paymentPayload,
    },
    body: JSON.stringify({ consumer_name: consumerName, payment_payload: paymentPayload }),
  });
}

export async function rateTransaction(transactionId: number, rating: number, review?: string): Promise<{
  success: boolean;
  message: string;
  provider_new_aais?: number;
}> {
  return fetchJSON(`/api/transactions/${transactionId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating, review }),
  });
}

// Get all transactions (for monitor)
export async function getTransactions(params?: { status?: string; limit?: number }): Promise<{ count: number; transactions: Transaction[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const query = searchParams.toString();
  return fetchJSON(`/api/transactions${query ? `?${query}` : ''}`);
}

// ==================== AAIS DIRECT INTEGRATION ====================

// Get on-chain reputation for agent
export async function getOnChainReputation(agentId: string): Promise<OnChainReputation & { trust_level_label: string }> {
  return fetchJSON(`/api/aait/reputation/${encodeURIComponent(agentId)}`);
}

// Prepare feedback attestation (client must sign and submit)
export async function prepareAttestation(data: {
  agent_id: string;
  score: number;
  payment_hash: string;
  service_rating: number;
  payment_amount: number;
}): Promise<{
  status: string;
  attestation: {
    agent_id: string;
    score: number;
    payment_hash: string;
    service_rating: number;
    payment_amount: number;
    module: string;
  };
  message: string;
}> {
  return fetchJSON('/api/aait/attest', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Check if agent meets marketplace threshold
export async function checkMarketplaceThreshold(agentId: string): Promise<boolean> {
  try {
    const rep = await getOnChainReputation(agentId);
    return rep.averageScoreScaled >= 7000; // 70/100 scaled
  } catch {
    return false;
  }
}

// Helper: Get trust level label
export function getTrustLevelLabel(level: TrustLevel): string {
  return TrustLevelLabels[level] || 'Unknown';
}

// Helper: Format AAIS score for display
export function formatAAISScore(scoreScaled: number): string {
  // scoreScaled is 0-10000 (100 = 1.00)
  return (scoreScaled / 100).toFixed(2);
}

// Helper: Calculate tier from score
export function getTierFromScore(score: number): { tier: string; color: string } {
  if (score >= 90) return { tier: 'Elite', color: '#FFD700' };
  if (score >= 70) return { tier: 'Verified', color: '#00F5FF' };
  if (score >= 50) return { tier: 'Standard', color: '#9A4DFF' };
  return { tier: 'New', color: '#6b6b7b' };
}

// Seed (dev only)
export async function seedAgent(data: {
  name: string;
  address: string;
  aa_score: number;
  total_transactions: number;
  successful_transactions: number;
}): Promise<{ success: boolean; message: string; agent: { name: string; aa_score: number; tier: string } }> {
  return fetchJSON('/api/seed', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
