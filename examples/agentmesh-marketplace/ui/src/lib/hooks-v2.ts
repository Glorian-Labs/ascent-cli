'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from './api-v2';

// Generic hook for data fetching
function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Polling hook for real-time updates
export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number = 5000
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const result = await fetcherRef.current();
        if (mounted) {
          setData(result);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, intervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [intervalMs]);

  return { data, loading, error };
}

// Health check hook
export function useHealth() {
  return useAsyncData(() => api.getHealth(), []);
}

// Dashboard stats hook
export function useDashboardStats() {
  return useAsyncData(() => api.getDashboardStats(), []);
}

// Agents hooks
export function useAgents(params?: { min_aais?: number; sort?: 'score' | 'earnings' }) {
  return useAsyncData(() => api.getAgents(params), [params?.min_aais, params?.sort]);
}

export function useAgent(name: string) {
  return useAsyncData(() => api.getAgent(name), [name]);
}

// Services hook
export function useServices(params?: { min_aais?: number; category?: string; agent?: string }) {
  return useAsyncData(() => api.getServices(params), [params?.min_aais, params?.category, params?.agent]);
}

// Transactions hook
export function useTransactions(params?: { status?: string; limit?: number }) {
  return useAsyncData(() => api.getTransactions(params), [params?.status, params?.limit]);
}

// On-chain reputation hook
export function useOnChainReputation(agentId: string) {
  return useAsyncData(() => api.getOnChainReputation(agentId), [agentId]);
}

// Real-time dashboard stats (polls every 5s)
export function useLiveDashboardStats() {
  return usePolling(() => api.getDashboardStats(), 5000);
}

// Real-time transactions (polls every 3s)
export function useLiveTransactions(limit: number = 20) {
  return usePolling(() => api.getTransactions({ limit }), 3000);
}

// Real-time health (polls every 10s)
export function useLiveHealth() {
  return usePolling(() => api.getHealth(), 10000);
}

// Export all API functions for direct use
export * from './api-v2';
