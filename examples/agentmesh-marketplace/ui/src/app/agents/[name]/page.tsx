'use client';

import { useState } from 'react';
import { useAgent } from '@/lib/hooks-v2';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Star, Activity, Package, DollarSign, 
  CheckCircle, Clock, AlertCircle, Crown, Shield, Zap,
  Terminal, Wallet, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import HireModal from '@/components/HireModal';

export default function AgentDetailPage() {
  const params = useParams();
  const name = decodeURIComponent(params.name as string);
  const { data: agent, loading, error } = useAgent(name);
  const [hireModalOpen, setHireModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-[50vh] sm:h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#8a8a9a] font-mono">Loading agent profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/agents" 
            className="inline-flex items-center gap-2 text-[#8a8a9a] hover:text-white mb-6 sm:mb-8 font-mono text-sm transition-colors"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            Back to Agents
          </Link>
          <div className="p-8 sm:p-12 text-center bg-[#141419] border border-[#ff006e]/30">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[#ff006e]" />
            <h2 className="font-display text-lg sm:text-xl font-bold mb-2">Agent Not Found</h2>
            <p className="text-sm text-[#8a8a9a] font-mono">{error || 'This agent does not exist'}</p>
          </div>
        </div>
      </div>
    );
  }

  const successRate = agent.total_transactions > 0 
    ? ((agent.successful_transactions / agent.total_transactions) * 100).toFixed(1)
    : '0';

  const tier = agent.aa_score >= 90 ? 'Elite' : agent.aa_score >= 70 ? 'Verified' : 'Standard';
  const tierColor = tier === 'Elite' ? '#ffaa00' : tier === 'Verified' ? '#00f0ff' : '#b829dd';

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-1">
          <Terminal size={14} className="sm:w-4 sm:h-4 text-[#00f0ff]" />
          <span className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider">Agent Profile</span>
        </div>

        {/* Back Link */}
        <Link 
          href="/agents" 
          className="inline-flex items-center gap-2 text-[#8a8a9a] hover:text-white mb-4 sm:mb-6 font-mono text-xs sm:text-sm transition-colors"
        >
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
          Back to Agents
        </Link>

        {/* Profile Header Card */}
        <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)] mb-4 sm:mb-6 overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-none border-2 flex-shrink-0" style={{ borderColor: tierColor }}>
                <AvatarFallback 
                  className="rounded-none text-xl sm:text-2xl lg:text-3xl font-bold"
                  style={{ 
                    background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)`,
                    color: tierColor
                  }}
                >
                  {agent.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold truncate">{agent.name}</h1>
                  <Badge 
                    variant="outline"
                    className="font-mono text-[10px] sm:text-xs uppercase tracking-wider flex-shrink-0"
                    style={{ 
                      background: `${tierColor}15`,
                      borderColor: `${tierColor}40`,
                      color: tierColor
                    }}
                  >
                    {tier === 'Elite' && <Crown size={10} className="mr-1 sm:w-3 sm:h-3" />}
                    {tier === 'Verified' && <Shield size={10} className="mr-1 sm:w-3 sm:h-3" />}
                    {tier === 'Standard' && <Zap size={10} className="mr-1 sm:w-3 sm:h-3" />}
                    {tier}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#8a8a9a] font-mono">
                  <span className="px-2 py-1 bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] truncate max-w-[120px] sm:max-w-none">
                    {agent.address?.slice(0, 6)}...{agent.address?.slice(-4)}
                  </span>
                  <span className="text-[#5a5a6a] hidden sm:inline">•</span>
                  <span className="text-[10px] sm:text-xs">Joined {new Date(agent.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* AAIS Score */}
              <div className="text-left sm:text-right p-3 sm:p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] mt-2 sm:mt-0">
                <div 
                  className="font-display text-3xl sm:text-4xl lg:text-5xl font-black"
                  style={{ color: tierColor }}
                >
                  {agent.aa_score.toFixed(1)}
                </div>
                <div className="text-[10px] sm:text-xs text-[#5a5a6a] font-mono uppercase tracking-wider">AAIS Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            icon={Activity}
            label="Transactions"
            value={agent.total_transactions}
            color="#8a8a9a"
          />
          <StatCard
            icon={CheckCircle}
            label="Successful"
            value={agent.successful_transactions}
            color="#39ff14"
          />
          <StatCard
            icon={DollarSign}
            label="Total Earned"
            value={`${(parseInt(agent.total_earned) / 1000000).toFixed(2)}`}
            color="#00f0ff"
            subtext="USDC"
          />
          <StatCard
            icon={TrendingUp}
            label="Success Rate"
            value={`${successRate}%`}
            color="#ffaa00"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Services */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-[#b829dd]/10 border border-[#b829dd]/20">
                      <Package size={16} className="sm:w-[18px] sm:h-[18px] text-[#b829dd]" />
                    </div>
                    <CardTitle className="font-display text-base sm:text-lg">Active Services</CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] sm:text-xs border-[rgba(255,255,255,0.1)]">
                    {agent.services?.length || 0} Listed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {!agent.services?.length ? (
                  <div className="text-center py-8 sm:py-12 text-[#8a8a9a] font-mono">
                    <Package size={28} className="sm:w-8 sm:h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No active services</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {agent.services.map((service) => (
                      <div 
                        key={service.id} 
                        className="p-3 sm:p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]
                          hover:border-[rgba(0,240,255,0.2)] transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-mono font-semibold text-sm sm:text-base mb-1 truncate">{service.title}</h3>
                            <p className="text-xs sm:text-sm text-[#8a8a9a] mb-2 sm:mb-3 line-clamp-2">{service.description}</p>
                            {service.category && (
                              <Badge 
                                variant="outline" 
                                className="font-mono text-[10px] sm:text-[0.65rem] uppercase border-[rgba(255,255,255,0.1)]"
                              >
                                {service.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <div className="font-display text-lg sm:text-xl font-bold text-[#00f0ff]">
                              {(parseInt(service.price) / 1000000).toFixed(2)}
                            </div>
                            <div className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono">USDC</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                    <Activity size={16} className="sm:w-[18px] sm:h-[18px] text-[#00f0ff]" />
                  </div>
                  <CardTitle className="font-display text-base sm:text-lg">Recent Transactions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {!agent.recent_transactions?.length ? (
                  <div className="text-center py-8 sm:py-12 text-[#8a8a9a] font-mono">
                    <Activity size={28} className="sm:w-8 sm:h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {agent.recent_transactions.slice(0, 5).map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)] gap-2 sm:gap-0"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <StatusIcon status={tx.status} />
                          <div className="min-w-0">
                            <div className="font-mono text-xs sm:text-sm">
                              {tx.provider_name === agent.name ? (
                                <>
                                  <span className="text-[#39ff14]">Sold</span>{' '}
                                  <span className="text-[#00f0ff] truncate inline-block max-w-[80px] sm:max-w-[120px] align-bottom">{tx.consumer_name}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[#ff006e]">Bought</span>{' '}
                                  <span className="text-[#b829dd] truncate inline-block max-w-[80px] sm:max-w-[120px] align-bottom">{tx.provider_name}</span>
                                </>
                              )}
                            </div>
                            <div className="text-[10px] sm:text-xs text-[#5a5a6a] font-mono">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className={`font-mono font-semibold text-xs sm:text-sm ${
                            tx.provider_name === agent.name ? 'text-[#39ff14]' : 'text-[#ff006e]'
                          }`}>
                            {tx.provider_name === agent.name ? '+' : '-'}
                            {(parseInt(tx.amount) / 1000000).toFixed(2)} USDC
                          </div>
                          {tx.rating && (
                            <div className="text-[10px] sm:text-xs text-[#ffaa00]">{tx.rating} ★</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="font-display text-base sm:text-lg flex items-center gap-2">
                  <Wallet size={16} className="sm:w-[18px] sm:h-[18px] text-[#00f0ff]" />
                  Hire This Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-xs sm:text-sm text-[#8a8a9a] mb-3 sm:mb-4 font-mono">
                  Hire {agent.name} for their services. Payment via x402 protocol.
                </p>
                <Button 
                  onClick={() => setHireModalOpen(true)}
                  className="w-full py-4 sm:py-6 font-mono font-semibold uppercase tracking-wider text-xs sm:text-sm
                    bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
                  disabled={!agent.services?.length}
                >
                  <Zap size={14} className="mr-2 sm:w-4 sm:h-4" />
                  Hire Agent
                </Button>
                {!agent.services?.length && (
                  <p className="text-[10px] sm:text-xs text-[#5a5a6a] font-mono mt-2 text-center">
                    No services available to hire
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reputation Stats */}
            <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="font-display text-base sm:text-lg flex items-center gap-2">
                  <Star size={16} className="sm:w-[18px] sm:h-[18px] text-[#ffaa00]" />
                  Reputation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-[#8a8a9a] font-mono">Successful TXs</span>
                  <span className="font-mono font-semibold text-sm text-[#39ff14]">{agent.successful_transactions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-[#8a8a9a] font-mono">Success Rate</span>
                  <span className="font-mono font-semibold text-sm text-[#ffaa00]">
                    {agent.total_transactions > 0 
                      ? ((agent.successful_transactions / agent.total_transactions) * 100).toFixed(0) 
                      : 0}%
                  </span>
                </div>
                <Separator className="bg-[rgba(255,255,255,0.06)]" />
                <div className="p-2.5 sm:p-3 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]">
                  <div className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider mb-1">
                    Reputation Tier
                  </div>
                  <div 
                    className="font-display text-base sm:text-lg font-bold"
                    style={{ color: tierColor }}
                  >
                    {agent.reputation_tier}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hire Modal */}
      <HireModal
        isOpen={hireModalOpen}
        onClose={() => setHireModalOpen(false)}
        agent={agent}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  subtext?: string;
}) {
  return (
    <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-[#5a5a6a]">
          <Icon size={14} className="sm:w-4 sm:h-4" strokeWidth={1.5} />
          <span className="text-[10px] sm:text-[0.65rem] font-mono uppercase tracking-wider">{label}</span>
        </div>
        <div className="font-display text-xl sm:text-2xl font-bold truncate" style={{ color }}>
          {value}
        </div>
        {subtext && <div className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono">{subtext}</div>}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle size={14} className="sm:w-4 sm:h-4 text-[#39ff14] flex-shrink-0" />;
  if (status === 'pending') return <Clock size={14} className="sm:w-4 sm:h-4 text-[#ffaa00] flex-shrink-0" />;
  return <AlertCircle size={14} className="sm:w-4 sm:h-4 text-[#ff006e] flex-shrink-0" />;
}
