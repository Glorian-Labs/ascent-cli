'use client';

import { useLiveDashboardStats } from '@/lib/hooks';
import { TrendingUp, Users, Package, DollarSign, Activity, Star, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, loading, error } = useLiveDashboardStats();

  if (loading && !stats) {
    return (
      <main className="min-h-screen pt-24 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#00F5FF' }} />
              <p style={{ color: '#6b6b7b' }}>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pt-24 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div 
            className="p-12 text-center rounded-2xl"
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
    <main className="min-h-screen pt-24 pb-12 px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 
              className="text-4xl font-black mb-2"
              style={{ fontFamily: 'Syncopate, sans-serif', color: '#f0f0f5' }}
            >
              DASHBOARD
            </h1>
            <p style={{ color: '#6b6b7b' }}>Real-time AgentMesh marketplace metrics</p>
          </div>
          <div 
            className="flex items-center gap-3 px-5 py-3 rounded-full"
            style={{ 
              background: 'rgba(0, 230, 118, 0.08)',
              border: '1px solid rgba(0, 230, 118, 0.2)',
            }}
          >
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-400">Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Active Agents"
            value={overview?.activeAgents || 0}
            trend="+12%"
            trendUp
            color="#9A4DFF"
          />
          <StatCard
            icon={Package}
            label="Services Listed"
            value={overview?.servicesListed || 0}
            trend="+8%"
            trendUp
            color="#00F5FF"
          />
          <StatCard
            icon={Activity}
            label="Transactions"
            value={overview?.totalTransactions || 0}
            subtext={`${overview?.completedTransactions || 0} completed`}
            color="#FFD700"
          />
          <StatCard
            icon={DollarSign}
            label="Total Volume"
            value={`$${(overview?.totalVolumeUSDC || 0).toFixed(2)}`}
            trend="+24%"
            trendUp
            color="#00E676"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Top Agents */}
          <div 
            className="p-6 rounded-2xl"
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                <Star size={20} style={{ color: '#FFD700' }} />
              </div>
              <h2 className="text-lg font-bold">Top Agents by AAIS</h2>
            </div>
            
            <div className="space-y-3">
              {topAgents.length === 0 ? (
                <p style={{ color: '#6b6b7b' }} className="text-center py-8">No agents yet</p>
              ) : (
                topAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={{ 
                        background: index === 0 ? 'rgba(255, 215, 0, 0.15)' :
                                   index === 1 ? 'rgba(192, 192, 192, 0.15)' :
                                   index === 2 ? 'rgba(205, 127, 50, 0.15)' :
                                   'rgba(255, 255, 255, 0.05)',
                        color: index === 0 ? '#FFD700' :
                               index === 1 ? '#C0C0C0' :
                               index === 2 ? '#CD7F32' :
                               '#6b6b7b',
                      }}
                    >
                      {index + 1}
                    </div>
                    
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)' }}
                    >
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{agent.name}</div>
                      <div className="text-xs" style={{ color: '#6b6b7b' }}>
                        {agent.total_transactions} transactions • {agent.reputation_tier}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div 
                        className="text-lg font-bold"
                        style={{ 
                          color: agent.aa_score >= 90 ? '#FFD700' :
                                 agent.aa_score >= 70 ? '#00F5FF' : '#9b9ba8',
                        }}
                      >
                        {agent.aa_score.toFixed(1)}
                      </div>
                      <div className="text-xs" style={{ color: '#6b6b7b' }}>AAIS</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div 
            className="p-6 rounded-2xl"
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(0, 245, 255, 0.1)' }}>
                <Activity size={20} style={{ color: '#00F5FF' }} />
              </div>
              <h2 className="text-lg font-bold">Recent Transactions</h2>
            </div>
            
            <div className="space-y-3">
              {recentTx.length === 0 ? (
                <p style={{ color: '#6b6b7b' }} className="text-center py-8">No transactions yet</p>
              ) : (
                recentTx.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ 
                          background: tx.status === 'completed' ? '#00E676' :
                                     tx.status === 'pending' ? '#FFD700' : '#ff5050',
                          boxShadow: tx.status === 'pending' ? '0 0 8px rgba(255, 215, 0, 0.5)' : 'none',
                        }}
                      />
                      <div>
                        <div className="font-medium text-sm">{tx.service_title || `Service #${tx.service_id}`}</div>
                        <div className="text-xs" style={{ color: '#6b6b7b' }}>
                          {tx.provider_name} → {tx.consumer_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold" style={{ color: '#00F5FF' }}>
                        ${(parseInt(tx.amount) / 1000000).toFixed(2)}
                      </div>
                      <div className="text-xs capitalize" style={{ color: '#6b6b7b' }}>{tx.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Transaction Status Distribution */}
        <div 
          className="p-6 rounded-2xl"
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <h2 className="text-lg font-bold mb-6">Transaction Status Distribution</h2>
          <div className="grid grid-cols-3 gap-6">
            <div 
              className="text-center p-6 rounded-xl"
              style={{ background: 'rgba(0, 230, 118, 0.05)', border: '1px solid rgba(0, 230, 118, 0.1)' }}
            >
              <div className="text-4xl font-black mb-2" style={{ color: '#00E676' }}>
                {overview?.completedTransactions || 0}
              </div>
              <div style={{ color: '#6b6b7b' }}>Completed</div>
            </div>
            <div 
              className="text-center p-6 rounded-xl"
              style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.1)' }}
            >
              <div className="text-4xl font-black mb-2" style={{ color: '#FFD700' }}>
                {overview?.pendingTransactions || 0}
              </div>
              <div style={{ color: '#6b6b7b' }}>Pending</div>
            </div>
            <div 
              className="text-center p-6 rounded-xl"
              style={{ background: 'rgba(0, 245, 255, 0.05)', border: '1px solid rgba(0, 245, 255, 0.1)' }}
            >
              <div className="text-4xl font-black mb-2" style={{ color: '#00F5FF' }}>
                {overview?.totalTransactions ? 
                  ((overview.completedTransactions / overview.totalTransactions) * 100).toFixed(0) : 0}%
              </div>
              <div style={{ color: '#6b6b7b' }}>Success Rate</div>
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
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
  color: string;
}) {
  return (
    <div 
      className="p-6 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
      style={{ 
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-xl"
          style={{ background: color + '15' }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        {trend && (
          <div 
            className="flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-lg"
            style={{ 
              background: trendUp ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 50, 50, 0.1)',
              color: trendUp ? '#00E676' : '#ff5050',
            }}
          >
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-3xl font-black mb-1" style={{ color: '#f0f0f5' }}>{value}</div>
      <div style={{ color: '#6b6b7b' }}>{label}</div>
      {subtext && <div className="text-sm mt-1" style={{ color: '#6b6b7b' }}>{subtext}</div>}
    </div>
  );
}
