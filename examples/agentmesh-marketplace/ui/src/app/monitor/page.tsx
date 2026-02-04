'use client';

import { useState } from 'react';
import { useLiveHealth, useLiveTransactions } from '@/lib/hooks-v2';
import { 
  Activity, Server, CheckCircle, AlertCircle, Clock, 
  RefreshCw, Search, Shield, Zap, Database, Loader2,
  Terminal, Wifi
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
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Terminal size={16} className="text-[#00f0ff]" />
              <span className="text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider">System Monitor</span>
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold">
              Network <span className="text-[#00f0ff]">Status</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-[#141419] border border-[#39ff14]/20">
            <RefreshCw className="w-4 h-4 animate-spin text-[#39ff14]" style={{ animationDuration: '3s' }} />
            <span className="text-[0.7rem] font-mono uppercase tracking-wider text-[#39ff14]">Auto-refresh</span>
          </div>
        </div>

        {/* System Health Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                  <Activity size={18} className="text-[#00f0ff]" />
                </div>
                <CardTitle className="font-display text-lg">Transaction Stream</CardTitle>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a6a]" 
                    size={16} 
                  />
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-[#0a0a0f] border-[rgba(255,255,255,0.08)] text-white font-mono text-sm"
                  />
                </div>
                
                {/* Status Filter */}
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="bg-[#0a0a0f] border border-[rgba(255,255,255,0.08)] p-1">
                    {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                      <TabsTrigger 
                        key={status}
                        value={status}
                        className="font-mono text-xs uppercase data-[state=active]:bg-[#00f0ff]/10 
                          data-[state=active]:text-[#00f0ff]"
                      >
                        <div className="flex items-center gap-1.5">
                          {status === 'completed' && <CheckCircle size={12} className="text-[#39ff14]" />}
                          {status === 'pending' && <Clock size={12} className="text-[#ffaa00]" />}
                          {status === 'failed' && <AlertCircle size={12} className="text-[#ff006e]" />}
                          <span className="hidden sm:inline">{status === 'all' ? 'All' : status}</span>
                          <span className="text-[0.6rem] opacity-60">({statusCounts[status]})</span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="pb-3 text-left text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">ID</th>
                    <th className="pb-3 text-left text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Service</th>
                    <th className="pb-3 text-left text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Provider</th>
                    <th className="pb-3 text-left text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Consumer</th>
                    <th className="pb-3 text-left text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Amount</th>
                    <th className="pb-3 text-left text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Status</th>
                    <th className="pb-3 text-left text-[0.65rem] font-mono uppercase tracking-wider text-[#5a5a6a]">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txLoading && !transactions.length ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#00f0ff]" />
                        <p className="text-[#8a8a9a] font-mono">Loading transactions...</p>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8a8a9a] font-mono">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr 
                        key={tx.id} 
                        className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        <td className="py-3 font-mono text-xs text-[#5a5a6a]">#{tx.id}</td>
                        <td className="py-3">
                          <div className="font-mono text-sm">{tx.service_title || `Service #${tx.service_id}`}</div>
                        </td>
                        <td className="py-3 font-mono text-xs">{tx.provider_name}</td>
                        <td className="py-3 font-mono text-xs">{tx.consumer_name}</td>
                        <td className="py-3">
                          <span className="font-mono font-semibold text-[#00f0ff]">
                            ${(parseInt(tx.amount) / 1000000).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="py-3 font-mono text-xs text-[#5a5a6a]">
                          {formatTime(tx.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div 
            className="p-3"
            style={{ background: `${style.color}15` }}
          >
            <Icon size={24} style={{ color: style.color }} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-mono font-semibold mb-0.5">{title}</h3>
            <p className="text-xs text-[#8a8a9a] font-mono">{detail}</p>
          </div>
          <StatusIcon size={22} style={{ color: style.color }} strokeWidth={1.5} />
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
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2 text-[#5a5a6a]">
          <Icon size={16} strokeWidth={1.5} />
          <span className="text-[0.65rem] font-mono uppercase tracking-wider">{label}</span>
        </div>
        <div 
          className="font-display text-2xl font-black"
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
      className="font-mono text-[0.65rem] uppercase border-0"
      style={{ background: style.bg, color: style.color }}
    >
      <Icon size={10} className="mr-1" />
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
