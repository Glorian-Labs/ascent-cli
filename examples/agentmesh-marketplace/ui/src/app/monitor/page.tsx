'use client';

import { useState } from 'react';
import { useLiveHealth, useLiveTransactions } from '@/lib/hooks-v2';
import { 
  Activity, Server, CheckCircle, AlertCircle, Clock, 
  RefreshCw, Search, Shield, Zap, Database, Loader2,
  Terminal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <Terminal size={14} className="sm:w-4 sm:h-4 text-[#00f0ff]" />
              <span className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider">System Monitor</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">
              Network <span className="text-[#00f0ff]">Status</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#141419] border border-[#39ff14]/20 self-start sm:self-auto">
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-[#39ff14]" style={{ animationDuration: '3s' }} />
            <span className="text-[10px] sm:text-[0.7rem] font-mono uppercase tracking-wider text-[#39ff14]">Auto-refresh</span>
          </div>
        </div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <HealthCard
            icon={Server}
            title="API Server"
            status={healthError ? 'error' : health?.status === 'ok' ? 'healthy' : 'unknown'}
            detail={healthError ? 'Connection failed' : health ? 'Running on port 3007' : 'Checking...'}
          />
          <HealthCard
            icon={Database}
            title="SQLite Database"
            status={healthError ? 'error' : health?.status === 'ok' ? 'healthy' : 'unknown'}
            detail={healthError ? 'Cannot connect' : health ? 'agentmesh.db active' : 'Checking...'}
          />
          <HealthCard
            icon={Shield}
            title="AAIS System"
            status={health?.aais_enabled ? 'healthy' : 'unknown'}
            detail={health?.aais_enabled ? 'AAIS Enabled' : 'Checking...'}
          />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <MetricCard
            icon={Zap}
            label="Total Transactions"
            value={`${transactions.length}`}
            color="#00f0ff"
          />
          <MetricCard
            icon={CheckCircle}
            label="Success Rate"
            value={transactions.length > 0 ? 
              `${((statusCounts.completed / transactions.length) * 100).toFixed(0)}%` : '0%'}
            color="#39ff14"
          />
          <MetricCard
            icon={Clock}
            label="Pending"
            value={`${statusCounts.pending}`}
            color="#ffaa00"
          />
          <MetricCard
            icon={AlertCircle}
            label="Failed"
            value={`${statusCounts.failed}`}
            color="#ff006e"
          />
        </div>

        {/* Transaction Stream */}
        <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                  <Activity size={16} className="sm:w-[18px] sm:h-[18px] text-[#00f0ff]" />
                </div>
                <CardTitle className="font-display text-base sm:text-lg">Transaction Stream</CardTitle>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {/* Search */}
                <div className="relative">
                  <Search 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a6a]" 
                    size={14} 
                  />
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-48 lg:w-64 bg-[#0a0a0f] border-[rgba(255,255,255,0.08)] text-white font-mono text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>
                
                {/* Status Filter */}
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="bg-[#0a0a0f] border border-[rgba(255,255,255,0.08)] p-1 h-9 sm:h-10">
                    {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                      <TabsTrigger 
                        key={status}
                        value={status}
                        className="font-mono text-[10px] sm:text-xs uppercase data-[state=active]:bg-[#00f0ff]/10 
                          data-[state=active]:text-[#00f0ff] px-2 sm:px-3 py-1"
                      >
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {status === 'completed' && <CheckCircle size={10} className="sm:w-3 sm:h-3 text-[#39ff14]" />}
                          {status === 'pending' && <Clock size={10} className="sm:w-3 sm:h-3 text-[#ffaa00]" />}
                          {status === 'failed' && <AlertCircle size={10} className="sm:w-3 sm:h-3 text-[#ff006e]" />}
                          <span className="hidden sm:inline capitalize">{status}</span>
                          <span className="sm:hidden capitalize">{status.charAt(0)}</span>
                          <span className="text-[10px] opacity-60">({statusCounts[status]})</span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="pb-3 text-left text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">ID</th>
                    <th className="pb-3 text-left text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Service</th>
                    <th className="pb-3 text-left text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Provider</th>
                    <th className="pb-3 text-left text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Consumer</th>
                    <th className="pb-3 text-left text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Amount</th>
                    <th className="pb-3 text-left text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Status</th>
                    <th className="pb-3 text-left text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txLoading && !transactions.length ? (
                    <tr>
                      <td colSpan={7} className="py-8 sm:py-12 text-center">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 text-[#00f0ff]" />
                        <p className="text-sm text-[#8a8a9a] font-mono">Loading transactions...</p>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 sm:py-12 text-center text-sm text-[#8a8a9a] font-mono">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr 
                        key={tx.id} 
                        className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        <td className="py-2.5 sm:py-3 font-mono text-[10px] sm:text-xs text-[#5a5a6a]">#{tx.id}</td>
                        <td className="py-2.5 sm:py-3">
                          <div className="font-mono text-xs sm:text-sm truncate max-w-[120px] lg:max-w-[200px]">{tx.service_title || `Service #${tx.service_id}`}</div>
                        </td>
                        <td className="py-2.5 sm:py-3 font-mono text-[10px] sm:text-xs truncate max-w-[80px] lg:max-w-[120px]">{tx.provider_name}</td>
                        <td className="py-2.5 sm:py-3 font-mono text-[10px] sm:text-xs truncate max-w-[80px] lg:max-w-[120px]">{tx.consumer_name}</td>
                        <td className="py-2.5 sm:py-3">
                          <span className="font-mono font-semibold text-[#00f0ff] text-xs sm:text-sm">
                            ${(parseInt(tx.amount) / 1000000).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 sm:py-3">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="py-2.5 sm:py-3 font-mono text-[10px] sm:text-xs text-[#5a5a6a]">
                          {formatTime(tx.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
              {txLoading && !transactions.length ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#00f0ff]" />
                  <p className="text-sm text-[#8a8a9a] font-mono">Loading transactions...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#8a8a9a] font-mono">
                  No transactions found
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="p-3 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={tx.status} />
                        <span className="font-mono text-[10px] text-[#5a5a6a]">#{tx.id}</span>
                      </div>
                      <span className="font-mono font-semibold text-[#00f0ff] text-sm">
                        ${(parseInt(tx.amount) / 1000000).toFixed(2)}
                      </span>
                    </div>
                    <div className="font-mono text-sm mb-1 truncate">{tx.service_title || `Service #${tx.service_id}`}</div>
                    <div className="flex items-center gap-2 text-[10px] text-[#8a8a9a] font-mono">
                      <span className="truncate max-w-[100px]">{tx.provider_name}</span>
                      <span>→</span>
                      <span className="truncate max-w-[100px]">{tx.consumer_name}</span>
                    </div>
                    <div className="text-[10px] text-[#5a5a6a] font-mono mt-1">
                      {formatTime(tx.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
  const config = {
    healthy: { bg: '#39ff1410', border: '#39ff1430', color: '#39ff14', icon: CheckCircle },
    error: { bg: '#ff006e10', border: '#ff006e30', color: '#ff006e', icon: AlertCircle },
    unknown: { bg: '#ffaa0010', border: '#ffaa0030', color: '#ffaa00', icon: Clock },
  };

  const style = config[status];
  const StatusIcon = style.icon;

  return (
    <Card 
      className="border-0"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div 
            className="p-2 sm:p-3"
            style={{ background: `${style.color}15` }}
          >
            <Icon size={20} className="sm:w-6 sm:h-6" style={{ color: style.color }} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-mono font-semibold text-sm sm:text-base mb-0.5 truncate">{title}</h3>
            <p className="text-[10px] sm:text-xs text-[#8a8a9a] font-mono truncate">{detail}</p>
          </div>
          <StatusIcon size={18} className="sm:w-[22px] sm:h-[22px] flex-shrink-0" style={{ color: style.color }} strokeWidth={1.5} />
        </div>
      </CardContent>
    </Card>
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
    <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-[#5a5a6a]">
          <Icon size={14} className="sm:w-4 sm:h-4" strokeWidth={1.5} />
          <span className="text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider">{label}</span>
        </div>
        <div 
          className="font-display text-xl sm:text-2xl font-black truncate"
          style={{ color }}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
    completed: { bg: '#39ff1415', color: '#39ff14', icon: CheckCircle },
    pending: { bg: '#ffaa0015', color: '#ffaa00', icon: Clock },
    failed: { bg: '#ff006e15', color: '#ff006e', icon: AlertCircle },
  };

  const style = config[status] || { bg: '#80808015', color: '#808080', icon: Activity };
  const Icon = style.icon;

  return (
    <Badge 
      variant="outline"
      className="font-mono text-[10px] sm:text-[0.65rem] uppercase border-0 px-1.5 py-0.5"
      style={{ background: style.bg, color: style.color }}
    >
      <Icon size={8} className="mr-1 sm:w-[10px] sm:h-[10px]" />
      {status}
    </Badge>
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
