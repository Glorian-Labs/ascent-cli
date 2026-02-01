'use client';

import { useState } from 'react';
import { useLiveHealth, useLiveTransactions } from '@/lib/hooks';
import { 
  Activity, Server, CheckCircle, AlertCircle, Clock, 
  RefreshCw, Filter, Search, Shield, Zap, Database
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
    <main className="min-h-screen pt-24 px-6 lg:px-12 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">System Monitor</h1>
            <p className="text-text-secondary mt-1">Real-time health and transaction monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <RefreshCw className="w-4 h-4 text-green-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-sm text-green-400">Auto-refresh</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Transaction Monitor */}
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Activity className="text-accent-teal" size={20} />
              Transaction Stream
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-accent-teal w-full sm:w-64"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex gap-2">
                {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      statusFilter === status
                        ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/50'
                        : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    {status === 'completed' && <CheckCircle size={14} className="text-green-400" />}
                    {status === 'pending' && <Clock size={14} className="text-yellow-400" />}
                    {status === 'failed' && <AlertCircle size={14} className="text-red-400" />}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span className="text-xs opacity-70">({statusCounts[status]})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-text-secondary border-b border-border-subtle">
                  <th className="pb-4 font-medium">ID</th>
                  <th className="pb-4 font-medium">Service</th>
                  <th className="pb-4 font-medium">Provider</th>
                  <th className="pb-4 font-medium">Consumer</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Rating</th>
                  <th className="pb-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {txLoading && !transactions.length ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-text-secondary">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-text-secondary">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 font-mono text-sm">#{tx.id}</td>
                      <td className="py-4">
                        <div className="text-sm font-medium">{tx.service_title || `Service #${tx.service_id}`}</div>
                        {tx.category && (
                          <div className="text-xs text-text-secondary">{tx.category}</div>
                        )}
                      </td>
                      <td className="py-4 text-sm">{tx.provider_name}</td>
                      <td className="py-4 text-sm">{tx.consumer_name}</td>
                      <td className="py-4 text-sm font-semibold text-accent-teal">
                        {(parseInt(tx.amount) / 1000000).toFixed(2)} USDC
                      </td>
                      <td className="py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-4">
                        {tx.rating ? (
                          <span className="text-accent-gold">{tx.rating} ★</span>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="py-4 text-sm text-text-secondary">
                        {formatTime(tx.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard
            icon={Zap}
            label="Throughput"
            value={`${transactions.length}`}
            unit="tx total"
          />
          <MetricCard
            icon={CheckCircle}
            label="Success Rate"
            value={transactions.length > 0 ? 
              `${((statusCounts.completed / transactions.length) * 100).toFixed(1)}` : '0'}
            unit="%"
          />
          <MetricCard
            icon={Clock}
            label="Pending"
            value={`${statusCounts.pending}`}
            unit="transactions"
          />
          <MetricCard
            icon={AlertCircle}
            label="Failed"
            value={`${statusCounts.failed}`}
            unit="transactions"
          />
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
  const statusColors = {
    healthy: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    unknown: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  };

  return (
    <div className={`glass-card p-6 border ${statusColors[status]}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${
          status === 'healthy' ? 'bg-green-500/20' :
          status === 'error' ? 'bg-red-500/20' :
          'bg-yellow-500/20'
        }`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm opacity-80">{detail}</p>
        </div>
        <div className="ml-auto">
          {status === 'healthy' && <CheckCircle className="text-green-400" size={20} />}
          {status === 'error' && <AlertCircle className="text-red-400" size={20} />}
          {status === 'unknown' && <Clock className="text-yellow-400" size={20} />}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
      styles[status as keyof typeof styles] || 'bg-gray-500/20 text-gray-400'
    }`}>
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
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 text-text-secondary mb-2">
        <Icon size={16} />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold">{value}</span>
        <span className="text-sm text-text-secondary">{unit}</span>
      </div>
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
