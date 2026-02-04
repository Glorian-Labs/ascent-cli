'use client';

import { useLiveDashboardStats } from '@/lib/hooks-v2';
import { 
  TrendingUp, Users, Package, DollarSign, Activity, 
  Star, ArrowUpRight, ArrowDownRight, Loader2, Terminal,
  Zap, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardPage() {
  const { data: stats, loading, error } = useLiveDashboardStats();

  if (loading && !stats) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-[50vh] sm:h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 text-[#00f0ff]" />
              <p className="text-sm text-[#8a8a9a] font-mono">Initializing systems...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="p-8 sm:p-12 text-center bg-[#141419] border border-[#ff006e]/30">
            <Activity className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-[#ff006e]" />
            <h2 className="font-display text-lg sm:text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-sm text-[#8a8a9a] font-mono">{error}</p>
            <p className="text-xs sm:text-sm mt-2 text-[#5a5a6a] font-mono">
              Ensure AgentMesh server is running on port 3007
            </p>
          </div>
        </div>
      </div>
    );
  }

  const overview = stats?.overview;
  const topAgents = stats?.topAgents || [];
  const recentTx = stats?.recentTransactions || [];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <Terminal size={14} className="sm:w-4 sm:h-4 text-[#00f0ff]" />
              <span className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">
              Network <span className="text-[#00f0ff]">Overview</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#141419] border border-[#39ff14]/20 self-start sm:self-auto">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="text-[10px] sm:text-[0.7rem] font-mono uppercase tracking-wider text-[#39ff14]">Live Data</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            icon={Users}
            label="Active Agents"
            value={overview?.activeAgents || 0}
            trend="+12%"
            trendUp
            color="#00f0ff"
          />
          <StatCard
            icon={Package}
            label="Services Listed"
            value={overview?.servicesListed || 0}
            trend="+8%"
            trendUp
            color="#b829dd"
          />
          <StatCard
            icon={Activity}
            label="Transactions"
            value={overview?.totalTransactions || 0}
            subtext={`${overview?.completedTransactions || 0} completed`}
            color="#ffaa00"
          />
          <StatCard
            icon={DollarSign}
            label="Total Volume"
            value={`$${(overview?.totalVolumeUSDC || 0).toFixed(2)}`}
            trend="+24%"
            trendUp
            color="#39ff14"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Top Agents */}
          <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-[#ffaa00]/10 border border-[#ffaa00]/20">
                    <Star size={16} className="sm:w-[18px] sm:h-[18px] text-[#ffaa00]" />
                  </div>
                  <CardTitle className="font-display text-base sm:text-lg">Top Agents</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] sm:text-[0.65rem] font-mono border-[rgba(255,255,255,0.1)]">
                  By AAIS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                {topAgents.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-[#8a8a9a] font-mono">
                    <Shield size={28} className="sm:w-8 sm:h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No agents registered</p>
                  </div>
                ) : (
                  topAgents.map((agent, index) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]
                        hover:border-[rgba(0,240,255,0.2)] transition-colors"
                    >
                      <div 
                        className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-bold text-xs sm:text-sm"
                        style={{ 
                          background: index === 0 ? '#ffaa0020' : 
                                     index === 1 ? '#c0c0c020' : 
                                     index === 2 ? '#cd7f3220' : 
                                     'rgba(255,255,255,0.05)',
                          color: index === 0 ? '#ffaa00' : 
                                 index === 1 ? '#c0c0c0' : 
                                 index === 2 ? '#cd7f32' : 
                                 '#8a8a9a'
                        }}
                      >
                        {index + 1}
                      </div>
                      
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 rounded-none flex-shrink-0">
                        <AvatarFallback 
                          className="rounded-none font-bold text-xs sm:text-sm"
                          style={{ 
                            background: 'linear-gradient(135deg, #00f0ff, #b829dd)',
                            color: 'black'
                          }}
                        >
                          {agent.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs sm:text-sm font-medium truncate">{agent.name}</div>
                        <div className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono">
                          {agent.total_transactions} TXs • {agent.reputation_tier}
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div 
                          className="font-display text-base sm:text-lg lg:text-xl font-bold"
                          style={{ 
                            color: agent.aa_score >= 90 ? '#ffaa00' :
                                   agent.aa_score >= 70 ? '#00f0ff' : '#8a8a9a'
                          }}
                        >
                          {agent.aa_score.toFixed(1)}
                        </div>
                        <div className="text-[10px] sm:text-[0.6rem] text-[#5a5a6a] font-mono">AAIS</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                    <Activity size={16} className="sm:w-[18px] sm:h-[18px] text-[#00f0ff]" />
                  </div>
                  <CardTitle className="font-display text-base sm:text-lg">Recent Activity</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] sm:text-[0.65rem] font-mono border-[rgba(255,255,255,0.1)]">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                {recentTx.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-[#8a8a9a] font-mono">
                    <Zap size={28} className="sm:w-8 sm:h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No transactions yet</p>
                  </div>
                ) : (
                  recentTx.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div 
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                          style={{ 
                            background: tx.status === 'completed' ? '#39ff14' :
                                       tx.status === 'pending' ? '#ffaa00' : '#ff006e',
                            boxShadow: tx.status === 'pending' ? '0 0 8px #ffaa00' : 'none'
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-mono text-xs sm:text-sm truncate">{tx.service_title || `Service #${tx.service_id}`}</div>
                          <div className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono truncate">
                            {tx.provider_name} → {tx.consumer_name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-mono font-semibold text-[#00f0ff] text-xs sm:text-sm">
                          ${(parseInt(tx.amount) / 1000000).toFixed(2)}
                        </div>
                        <div className="text-[10px] sm:text-[0.6rem] text-[#5a5a6a] font-mono uppercase">{tx.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Status Distribution */}
        <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-display text-base sm:text-lg">Transaction Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <DistributionCard
                label="Completed"
                value={overview?.completedTransactions || 0}
                color="#39ff14"
              />
              <DistributionCard
                label="Pending"
                value={overview?.pendingTransactions || 0}
                color="#ffaa00"
              />
              <DistributionCard
                label="Success Rate"
                value={`${overview?.totalTransactions ? 
                  ((overview.completedTransactions / overview.totalTransactions) * 100).toFixed(0) : 0}%`}
                color="#00f0ff"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
    <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)] transition-colors">
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div 
            className="p-1.5 sm:p-2.5"
            style={{ background: `${color}15` }}
          >
            <Icon size={16} className="sm:w-5 sm:h-5" style={{ color }} strokeWidth={1.5} />
          </div>
          {trend && (
            <div 
              className="flex items-center gap-1 text-[10px] sm:text-xs font-mono px-1.5 py-0.5 sm:px-2 sm:py-1"
              style={{ 
                background: trendUp ? '#39ff1420' : '#ff006e20',
                color: trendUp ? '#39ff14' : '#ff006e'
              }}
            >
              {trendUp ? <ArrowUpRight size={10} className="sm:w-3 sm:h-3" /> : <ArrowDownRight size={10} className="sm:w-3 sm:h-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className="font-display text-lg sm:text-2xl font-bold text-white truncate">{value}</div>
        <div className="text-[10px] sm:text-[0.7rem] text-[#8a8a9a] font-mono uppercase tracking-wider">{label}</div>
        {subtext && <div className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono mt-1">{subtext}</div>}
      </CardContent>
    </Card>
  );
}

function DistributionCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div 
      className="text-center p-4 sm:p-6 border"
      style={{ 
        background: `${color}08`,
        borderColor: `${color}30`
      }}
    >
      <div 
        className="font-display text-2xl sm:text-3xl lg:text-4xl font-black mb-2"
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-[10px] sm:text-[0.7rem] text-[#8a8a9a] font-mono uppercase tracking-wider">{label}</div>
    </div>
  );
}
