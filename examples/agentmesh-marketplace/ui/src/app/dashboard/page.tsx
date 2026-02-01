'use client';

import { useLiveDashboardStats } from '@/lib/hooks';
import { TrendingUp, Users, Package, DollarSign, Activity, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, loading, error } = useLiveDashboardStats();

  if (loading && !stats) {
    return (
      <main className="min-h-screen pt-16 lg:pt-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-64 bg-white/5 rounded-lg" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pt-16 lg:pt-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div 
            className="p-8 text-center rounded-2xl"
            style={{
              background: 'rgba(255, 50, 50, 0.05)',
              border: '1px solid rgba(255, 50, 50, 0.2)',
            }}
          >
            <Activity className="w-12 h-12 mx-auto mb-4" style={{ color: '#ff5050' }} />
            <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
            <p style={{ color: '#6b6b7b' }}>{error}</p>
            <p className="text-sm mt-2" style={{ color: '#6b6b7b' }}>Make sure the AgentMesh server is running on port 3007</p>
          </div>
        </div>
      </main>
    );
  }

  const overview = stats?.overview;
  const topAgents = stats?.topAgents || [];
  const recentTx = stats?.recentTransactions || [];

  return (
    <main className="min-h-screen pt-16 lg:pt-18 px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-text-secondary mt-1">Real-time AgentMesh marketplace metrics</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          <StatCard
            icon={Users}
            label="Active Agents"
            value={overview?.activeAgents || 0}
            trend="+12%"
            trendUp
          />
          <StatCard
            icon={Package}
            label="Services Listed"
            value={overview?.servicesListed || 0}
            trend="+8%"
            trendUp
          />
          <StatCard
            icon={Activity}
            label="Transactions"
            value={overview?.totalTransactions || 0}
            subtext={`${overview?.completedTransactions || 0} completed`}
          />
          <StatCard
            icon={DollarSign}
            label="Total Volume"
            value={`${(overview?.totalVolumeUSDC || 0).toFixed(2)} USDC`}
            trend="+24%"
            trendUp
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {/* Top Agents */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <Star className="text-accent-gold" size={20} />
                Top Agents by AAIS
              </h2>
            </div>
            
            <div className="space-y-4">
              {topAgents.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No agents yet</p>
              ) : (
                topAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-accent-gold/20 text-accent-gold' :
                      index === 1 ? 'bg-gray-400/20 text-gray-400' :
                      index === 2 ? 'bg-orange-400/20 text-orange-400' :
                      'bg-white/10 text-text-secondary'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center text-xs font-bold">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-xs text-text-secondary">
                        {agent.total_transactions} transactions • {agent.reputation_tier}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-display font-bold ${
                        agent.aa_score >= 90 ? 'text-accent-gold' :
                        agent.aa_score >= 70 ? 'text-accent-teal' :
                        'text-text-secondary'
                      }`}>
                        {agent.aa_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-text-secondary">AAIS</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <Activity className="text-accent-teal" size={20} />
                Recent Transactions
              </h2>
            </div>
            
            <div className="space-y-3">
              {recentTx.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No transactions yet</p>
              ) : (
                recentTx.slice(0, 8).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        tx.status === 'completed' ? 'bg-green-500' :
                        tx.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium">{tx.service_title || `Service #${tx.service_id}`}</div>
                        <div className="text-xs text-text-secondary">
                          {tx.provider_name} → {tx.consumer_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-accent-teal">
                        {(parseInt(tx.amount) / 1000000).toFixed(2)} USDC
                      </div>
                      <div className="text-xs text-text-secondary capitalize">{tx.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending vs Completed */}
        <div className="glass-card p-6">
          <h2 className="font-display text-xl font-semibold mb-6">Transaction Status Distribution</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-display font-bold text-green-400">
                {overview?.completedTransactions || 0}
              </div>
              <div className="text-sm text-text-secondary mt-1">Completed</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-display font-bold text-yellow-400">
                {overview?.pendingTransactions || 0}
              </div>
              <div className="text-sm text-text-secondary mt-1">Pending</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-display font-bold text-accent-teal">
                {overview?.totalTransactions ? 
                  ((overview.completedTransactions / overview.totalTransactions) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-text-secondary mt-1">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
}) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-accent-teal/10 rounded-lg">
          <Icon className="text-accent-teal" size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
      {subtext && <div className="text-xs text-text-secondary mt-1">{subtext}</div>}
    </div>
  );
}
