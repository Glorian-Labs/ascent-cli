'use client';

import { useState } from 'react';
import { useLiveHealth, useLiveTransactions } from '@/lib/hooks-v2';
import { 
  Activity, Server, CheckCircle, AlertCircle, Clock, 
  RefreshCw, Search, Shield, Zap, Database, Loader2
} from 'lucide-react';

export default function MonitorPage() {
  const { data: health, loading: healthLoading, error: healthError } = useLiveHealth();
  const { data: txData, loading: txLoading, error: txError } = useLiveTransactions(50);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = txData?.transactions || [];
  
  const filteredTransactions = transactions.filter(tx => {
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesSearch = !searchQuery || 
      tx.provider_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.consumer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.service_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 
              className="text-4xl font-black mb-2"
              style={{ fontFamily: 'Syncopate, sans-serif', color: '#f0f0f5' }}
            >
              MONITOR
            </h1>
            <p style={{ color: '#6b6b7b' }}>Real-time health and transaction monitoring</p>
          </div>
          <div 
            className="flex items-center gap-3 px-5 py-3 rounded-full"
            style={{ 
              background: 'rgba(0, 230, 118, 0.08)',
              border: '1px solid rgba(0, 230, 118, 0.2)',
            }}
          >
            <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#00E676', animationDuration: '3s' }} />
            <span className="text-sm font-medium" style={{ color: '#00E676' }}>Auto-refresh</span>
          </div>
        </div>

        {/* System Health Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <HealthCard
            icon={Server}
            title="API Server"
            status={healthError ? 'error' : health?.status === 'ok' ? 'healthy' : 'unknown'}
            detail={healthError ? 'Connection failed' : health ? 'Running on port 3007' : 'Checking...'}
          />
          <HealthCard
            icon={Database}
            title="SQLite Database"
            status={healthError ? 'error' : health?.agentmesh === 'live' ? 'healthy' : 'unknown'}
            detail={healthError ? 'Cannot connect' : health ? 'agentmesh.db active' : 'Checking...'}
          />
          <HealthCard
            icon={Shield}
            title="AAIS System"
            status={health?.min_aais ? 'healthy' : 'unknown'}
            detail={health?.min_aais ? `Min score: ${health.min_aais}` : 'Checking...'}
          />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Zap}
            label="Total Transactions"
            value={`${transactions.length}`}
            color="#00F5FF"
          />
          <MetricCard
            icon={CheckCircle}
            label="Success Rate"
            value={transactions.length > 0 ? 
              `${((statusCounts.completed / transactions.length) * 100).toFixed(0)}%` : '0%'}
            color="#00E676"
          />
          <MetricCard
            icon={Clock}
            label="Pending"
            value={`${statusCounts.pending}`}
            color="#FFD700"
          />
          <MetricCard
            icon={AlertCircle}
            label="Failed"
            value={`${statusCounts.failed}`}
            color="#ff5050"
          />
        </div>

        {/* Transaction Stream */}
        <div 
          className="p-6 rounded-2xl"
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(0, 245, 255, 0.1)' }}>
                <Activity size={20} style={{ color: '#00F5FF' }} />
              </div>
              <h2 className="text-lg font-bold">Transaction Stream</h2>
            </div>
            
            <div className="flex gap-4">
              {/* Search */}
              <div className="relative">
                <Search 
                  className="absolute left-4 top-1/2 -translate-y-1/2" 
                  size={16} 
                  style={{ color: '#6b6b7b' }} 
                />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none w-64"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f0f0f5',
                  }}
                />
              </div>
              
              {/* Status Filter */}
              <div 
                className="flex rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                    style={{
                      background: statusFilter === status ? 'rgba(0, 245, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      color: statusFilter === status ? '#00F5FF' : '#6b6b7b',
                      borderLeft: status !== 'all' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                    }}
                  >
                    {status === 'completed' && <CheckCircle size={14} style={{ color: '#00E676' }} />}
                    {status === 'pending' && <Clock size={14} style={{ color: '#FFD700' }} />}
                    {status === 'failed' && <AlertCircle size={14} style={{ color: '#ff5050' }} />}
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    <span className="text-xs opacity-60">({statusCounts[status]})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <th className="pb-4 text-left text-sm font-medium" style={{ color: '#6b6b7b' }}>ID</th>
                  <th className="pb-4 text-left text-sm font-medium" style={{ color: '#6b6b7b' }}>Service</th>
                  <th className="pb-4 text-left text-sm font-medium" style={{ color: '#6b6b7b' }}>Provider</th>
                  <th className="pb-4 text-left text-sm font-medium" style={{ color: '#6b6b7b' }}>Consumer</th>
                  <th className="pb-4 text-left text-sm font-medium" style={{ color: '#6b6b7b' }}>Amount</th>
                  <th className="pb-4 text-left text-sm font-medium" style={{ color: '#6b6b7b' }}>Status</th>
                  <th className="pb-4 text-left text-sm font-medium" style={{ color: '#6b6b7b' }}>Rating</th>
                  <th className="pb-4 text-left text-sm font-medium" style={{ color: '#6b6b7b' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {txLoading && !transactions.length ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#00F5FF' }} />
                      <p style={{ color: '#6b6b7b' }}>Loading transactions...</p>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center" style={{ color: '#6b6b7b' }}>
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr 
                      key={tx.id} 
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                    >
                      <td className="py-4 font-mono text-sm" style={{ color: '#6b6b7b' }}>#{tx.id}</td>
                      <td className="py-4">
                        <div className="text-sm font-medium">{tx.service_title || `Service #${tx.service_id}`}</div>
                      </td>
                      <td className="py-4 text-sm">{tx.provider_name}</td>
                      <td className="py-4 text-sm">{tx.consumer_name}</td>
                      <td className="py-4 text-sm font-semibold" style={{ color: '#00F5FF' }}>
                        ${(parseInt(tx.amount) / 1000000).toFixed(2)}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-4">
                        {tx.rating ? (
                          <span style={{ color: '#FFD700' }}>{tx.rating} ★</span>
                        ) : (
                          <span style={{ color: '#6b6b7b' }}>—</span>
                        )}
                      </td>
                      <td className="py-4 text-sm" style={{ color: '#6b6b7b' }}>
                        {formatTime(tx.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function HealthCard({
  icon: Icon,
  title,
  status,
  detail,
}: {
  icon: React.ElementType;
  title: string;
  status: 'healthy' | 'error' | 'unknown';
  detail: string;
}) {
  const statusConfig = {
    healthy: { bg: 'rgba(0, 230, 118, 0.05)', border: 'rgba(0, 230, 118, 0.15)', color: '#00E676' },
    error: { bg: 'rgba(255, 80, 80, 0.05)', border: 'rgba(255, 80, 80, 0.15)', color: '#ff5050' },
    unknown: { bg: 'rgba(255, 215, 0, 0.05)', border: 'rgba(255, 215, 0, 0.15)', color: '#FFD700' },
  };

  const config = statusConfig[status];

  return (
    <div 
      className="p-5 rounded-2xl"
      style={{ 
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="p-3 rounded-xl"
          style={{ background: config.color + '15' }}
        >
          <Icon size={24} style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm" style={{ color: '#6b6b7b' }}>{detail}</p>
        </div>
        <div>
          {status === 'healthy' && <CheckCircle size={22} style={{ color: '#00E676' }} />}
          {status === 'error' && <AlertCircle size={22} style={{ color: '#ff5050' }} />}
          {status === 'unknown' && <Clock size={22} style={{ color: '#FFD700' }} />}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { bg: 'rgba(0, 230, 118, 0.1)', color: '#00E676' },
    pending: { bg: 'rgba(255, 215, 0, 0.1)', color: '#FFD700' },
    failed: { bg: 'rgba(255, 80, 80, 0.1)', color: '#ff5050' },
  };

  const style = config[status as keyof typeof config] || { bg: 'rgba(128, 128, 128, 0.1)', color: '#808080' };

  return (
    <span 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
      style={{ background: style.bg, color: style.color }}
    >
      {status === 'completed' && <CheckCircle size={12} />}
      {status === 'pending' && <Clock size={12} />}
      {status === 'failed' && <AlertCircle size={12} />}
      {status}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div 
      className="p-5 rounded-2xl"
      style={{ 
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-center gap-2 mb-3" style={{ color: '#6b6b7b' }}>
        <Icon size={16} />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
    </div>
  );
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}
