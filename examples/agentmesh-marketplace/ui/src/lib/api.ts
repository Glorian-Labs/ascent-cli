// AgentMesh API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007';

export interface Agent {
  id: number;
  name: string;
  address: string;
  aa_score: number;
  total_transactions: number;
  successful_transactions: number;
  total_earned: string;
  created_at: string;
  reputation_tier: 'Elite' | 'Verified' | 'Standard' | 'New';
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
  agentmesh: string;
  min_aais: number;
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
  return fetchJSON('/health');
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchJSON('/stats');
}

// Agents
export async function getAgents(params?: { min_aais?: number; sort?: 'score' | 'earnings' }): Promise<{ count: number; agents: Agent[] }> {
  const searchParams = new URLSearchParams();
  if (params?.min_aais) searchParams.set('min_aais', params.min_aais.toString());
  if (params?.sort) searchParams.set('sort', params.sort);
  
  const query = searchParams.toString();
  return fetchJSON(`/agents${query ? `?${query}` : ''}`);
}

export async function getAgent(name: string): Promise<Agent & { services: Service[]; recent_transactions: Transaction[] }> {
  return fetchJSON(`/agents/${encodeURIComponent(name)}`);
}

// Services
export async function getServices(params?: { min_aais?: number; category?: string; agent?: string }): Promise<{ count: number; services: Service[] }> {
  const searchParams = new URLSearchParams();
  if (params?.min_aais) searchParams.set('min_aais', params.min_aais.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.agent) searchParams.set('agent', params.agent);
  
  const query = searchParams.toString();
  return fetchJSON(`/services${query ? `?${query}` : ''}`);
}

export async function listService(data: {
  agent_name: string;
  address?: string;
  title: string;
  description?: string;
  category?: string;
  price: string;
  endpoint?: string;
}): Promise<{ success: boolean; service_id: number; message: string; aa_score: number }> {
  return fetchJSON('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Hiring & Transactions
export async function hireService(serviceId: number, consumerName: string): Promise<{
  success: boolean;
  transaction_id: number;
  service: Service;
  payment_required: { amount: string; asset: string; network: string };
}> {
  return fetchJSON(`/services/${serviceId}/hire`, {
    method: 'POST',
    body: JSON.stringify({ consumer_name: consumerName }),
  });
}

export async function confirmTransaction(transactionId: number, paymentSignature: string): Promise<{
  success: boolean;
  message: string;
  tx_hash: string;
  provider_aais: number;
  consumer_aais: number;
}> {
  return fetchJSON(`/transactions/${transactionId}/confirm`, {
    method: 'POST',
    headers: {
      'payment-signature': paymentSignature,
    },
  });
}

export async function rateTransaction(transactionId: number, rating: number, review?: string): Promise<{
  success: boolean;
  message: string;
  provider_new_aais: number;
}> {
  return fetchJSON(`/transactions/${transactionId}/rate`, {
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
  return fetchJSON(`/transactions${query ? `?${query}` : ''}`);
}

// Seed (dev only)
export async function seedAgent(data: {
  name: string;
  address: string;
  aa_score: number;
  total_transactions: number;
  successful_transactions: number;
}): Promise<{ success: boolean; message: string; agent: { name: string; aa_score: number; tier: string } }> {
  return fetchJSON('/seed', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
