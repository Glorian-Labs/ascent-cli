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
      <div className="min-h-screen pt-24 px-6 lg:px-12 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#8a8a9a] font-mono">Loading agent profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen pt-24 px-6 lg:px-12 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/agents" 
            className="inline-flex items-center gap-2 text-[#8a8a9a] hover:text-white mb-8 font-mono transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Agents
          </Link>
          <div className="p-12 text-center bg-[#141419] border border-[#ff006e]/30">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#ff006e]" />
            <h2 className="font-display text-xl font-bold mb-2">Agent Not Found</h2>
            <p className="text-[#8a8a9a] font-mono">{error || 'This agent does not exist'}</p>
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
  const tierIcon = tier === 'Elite' ? Crown : tier === 'Verified' ? Shield : Zap;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <Terminal size={16} className="text-[#00f0ff]" />
          <span className="text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider">Agent Profile</span>
        </div>

        {/* Back Link */}
        <Link 
          href="/agents" 
          className="inline-flex items-center gap-2 text-[#8a8a9a] hover:text-white mb-6 font-mono text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Agents
        </Link>

        {/* Profile Header Card */}
        <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)] mb-6 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 rounded-none border-2" style={{ borderColor: tierColor }}>
                <AvatarFallback 
                  className="rounded-none text-3xl font-bold"
                  style={{ 
                    background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)`,
                    color: tierColor
                  }}
                >
                  {agent.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold">{agent.name}</h1>
                  <Badge 
                    variant="outline"
                    className="font-mono text-xs uppercase tracking-wider"
                    style={{ 
                      background: `${tierColor}15`,
                      borderColor: `${tierColor}40`,
                      color: tierColor
                    }}
                  >
                    <tierIcon size={12} className="mr-1" />
                    {tier}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#8a8a9a] font-mono">
                  <span className="px-2 py-1 bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)]">
                    {agent.address?.slice(0, 8)}...{agent.address?.slice(-6)}
                  </span>
                  <span className="text-[#5a5a6a]">•</span>
                  <span>Joined {new Date(agent.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* AAIS Score */}
              <div className="text-center md:text-right p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)]">
                <div 
                  className="font-display text-5xl font-black"
                  style={{ color: tierColor }}
                >
                  {agent.aa_score.toFixed(1)}
                </div>
                <div className="text-xs text-[#5a5a6a] font-mono uppercase tracking-wider">AAIS Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Services */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#b829dd]/10 border border-[#b829dd]/20">
                      <Package size={18} className="text-[#b829dd]" />
                    </div>
                    <CardTitle className="font-display text-lg">Active Services</CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs border-[rgba(255,255,255,0.1)]">
                    {agent.services?.length || 0} Listed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!agent.services?.length ? (
                  <div className="text-center py-12 text-[#8a8a9a] font-mono">
                    <Package size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No active services</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agent.services.map((service) => (
                      <div 
                        key={service.id} 
                        className="p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]
                          hover:border-[rgba(0,240,255,0.2)] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-mono font-semibold mb-1">{service.title}</h3>
                            <p className="text-sm text-[#8a8a9a] mb-3">{service.description}</p>
                            {service.category && (
                              <Badge 
                                variant="outline" 
                                className="font-mono text-[0.65rem] uppercase border-[rgba(255,255,255,0.1)]"
                              >
                                {service.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-display text-xl font-bold text-[#00f0ff]">
                              {(parseInt(service.price) / 1000000).toFixed(2)}
                            </div>
                            <div className="text-[0.65rem] text-[#5a5a6a] font-mono">USDC</div>
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
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                    <Activity size={18} className="text-[#00f0ff]" />
                  </div>
                  <CardTitle className="font-display text-lg">Recent Transactions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {!agent.recent_transactions?.length ? (
                  <div className="text-center py-12 text-[#8a8a9a] font-mono">
                    <Activity size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agent.recent_transactions.slice(0, 5).map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]"
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon status={tx.status} />
                          <div>
                            <div className="font-mono text-sm">
                              {tx.provider_name === agent.name ? (
                                <>
                                  <span className="text-[#39ff14]">Sold</span> to{' '}
                                  <span className="text-[#00f0ff]">{tx.consumer_name}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[#ff006e]">Bought</span> from{' '}
                                  <span className="text-[#b829dd]">{tx.provider_name}</span>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-[#5a5a6a] font-mono">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-semibold ${
                            tx.provider_name === agent.name ? 'text-[#39ff14]' : 'text-[#ff006e]'
                          }`}>
                            {tx.provider_name === agent.name ? '+' : '-'}
                            {(parseInt(tx.amount) / 1000000).toFixed(2)} USDC
                          </div>
                          {tx.rating && (
                            <div className="text-xs text-[#ffaa00]">{tx.rating} ★</div>
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
          <div className="space-y-6">
            <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Wallet size={18} className="text-[#00f0ff]" />
                  Hire This Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#8a8a9a] mb-4 font-mono">
                  Hire {agent.name} for their services. Payment via x402 protocol.
                </p>
                <Button 
                  onClick={() => setHireModalOpen(true)}
                  className="w-full py-6 font-mono font-semibold uppercase tracking-wider
                    bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
                  disabled={!agent.services?.length}
                >
                  <Zap size={16} className="mr-2" />
                  Hire Agent
                </Button>
                {!agent.services?.length && (
                  <p className="text-xs text-[#5a5a6a] font-mono mt-2 text-center">
                    No services available to hire
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reputation Stats */}
            <Card className="bg-[#141419] border-[rgba(255,255,255,0.06)]">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Star size={18} className="text-[#ffaa00]" />
                  Reputation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a8a9a] font-mono">Total Ratings</span>
                  <span className="font-mono font-semibold">{agent.total_ratings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a8a9a] font-mono">Avg Rating</span>
                  <span className="font-mono font-semibold text-[#ffaa00]">
                    {agent.average_rating ? agent.average_rating.toFixed(1) : 'N/A'} ★
                  </span>
                </div>
                <Separator className="bg-[rgba(255,255,255,0.06)]" />
                <div className="p-3 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]">
                  <div className="text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider mb-1">
                    Reputation Tier
                  </div>
                  <div 
                    className="font-display text-lg font-bold"
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
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2 text-[#5a5a6a]">
          <Icon size={16} strokeWidth={1.5} />
          <span className="text-[0.65rem] font-mono uppercase tracking-wider">{label}</span>
        </div>
        <div className="font-display text-2xl font-bold" style={{ color }}>
          {value}
        </div>
        {subtext && <div className="text-[0.65rem] text-[#5a5a6a] font-mono">{subtext}</div>}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle size={16} className="text-[#39ff14]" />;
  if (status === 'pending') return <Clock size={16} className="text-[#ffaa00]" />;
  return <AlertCircle size={16} className="text-[#ff006e]" />;
}
