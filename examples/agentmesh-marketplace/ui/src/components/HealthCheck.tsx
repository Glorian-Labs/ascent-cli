'use client';

import { useEffect, useState } from 'react';
import { Activity, Database, Server, AlertCircle, CheckCircle } from 'lucide-react';
import { getHealth } from '@/lib/api-v2';

interface HealthStatus {
  status: string;
  aais_enabled: boolean;
  network: string;
  timestamp: string;
}

export default function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    try {
      setLoading(true);
      const data = await getHealth();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !health) {
    return (
      <div 
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          color: '#6b6b7b',
        }}
      >
        <Activity size={16} className="animate-pulse" />
        Connecting...
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        style={{
          background: 'rgba(255, 50, 50, 0.1)',
          border: '1px solid rgba(255, 50, 50, 0.2)',
          color: '#ff5050',
        }}
      >
        <AlertCircle size={16} />
        Disconnected
      </div>
    );
  }

  if (!health) return null;

  const isHealthy = health.status === 'ok';
  const networkLabel = health.network === 'mainnet' ? 'Mainnet' : 'Testnet';

  return (
    <div 
      className="flex items-center gap-4 px-4 py-2 rounded-xl text-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Server Status */}
      <div className="flex items-center gap-1.5">
        <Server size={14} style={{ color: isHealthy ? '#00E676' : '#ff5050' }} />
        <span style={{ color: '#6b6b7b' }}>API</span>
        <CheckCircle size={12} style={{ color: '#00E676' }} />
      </div>

      {/* AAIS Status */}
      <div className="flex items-center gap-1.5">
        <Database size={14} style={{ color: health.aais_enabled ? '#00E676' : '#FF9800' }} />
        <span style={{ color: '#6b6b7b' }}>AAIS</span>
        {health.aais_enabled ? (
          <CheckCircle size={12} style={{ color: '#00E676' }} />
        ) : (
          <span style={{ color: '#FF9800', fontSize: '10px' }}>Disabled</span>
        )}
      </div>

      {/* Network */}
      <div 
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{
          background: health.network === 'mainnet' 
            ? 'rgba(0, 230, 118, 0.1)' 
            : 'rgba(0, 245, 255, 0.1)',
          color: health.network === 'mainnet' ? '#00E676' : '#00F5FF',
          border: `1px solid ${health.network === 'mainnet' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(0, 245, 255, 0.2)'}`,
        }}
      >
        {networkLabel}
      </div>
    </div>
  );
}
