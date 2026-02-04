// React hooks for AgentMesh API v2 (AAIS Integration)
'use client';

import { useState, useEffect, useCallback } from 'react';
import * as api from './api-v2';

// Generic hook for API calls
function useApiCall<T>(fetchFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Health check hook
export function useHealth() {
  return useApiCall(api.getHealth);
}

// Dashboard stats hook
export function useDashboardStats() {
  return useApiCall(api.getDashboardStats);
}

// Agents list hook
export function useAgents(params?: { min_aais?: number; sort?: 'score' | 'earnings' }) {
  return useApiCall(() => api.getAgents(params));
}

// Single agent hook
export function useAgent(name: string) {
  return useApiCall(() => api.getAgent(name));
}

// Services list hook
export function useServices(params?: { min_aais?: number; category?: string; agent?: string }) {
  return useApiCall(() => api.getServices(params));
}

// Transactions hook
export function useTransactions(params?: { status?: string; limit?: number }) {
  return useApiCall(() => api.getTransactions(params));
}

// On-chain reputation hook
export function useOnChainReputation(agentId: string) {
  const [data, setData] = useState<(api.OnChainReputation & { trust_level_label: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!agentId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await api.getOnChainReputation(agentId);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch on-chain reputation');
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Export all API functions for direct use
export * from './api-v2';
