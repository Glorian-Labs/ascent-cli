'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAgents } from '@/lib/hooks-v2';
import { 
  Users, Search, Star, TrendingUp, Loader2, RefreshCw, 
  Crown, Shield, Zap, ArrowRight, Terminal, Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AgentsPage() {
  const [sortBy, setSortBy] = useState<'score' | 'earnings'>('score');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const { data, loading, error, refetch } = useAgents({ sort: sortBy });

  const agents = data?.agents || [];
  
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || 
      (tierFilter === 'elite' && agent.aa_score >= 90) ||
      (tierFilter === 'verified' && agent.aa_score >= 70 && agent.aa_score < 90) ||
      (tierFilter === 'standard' && agent.aa_score < 70);
    return matchesSearch && matchesTier;
  });

  const eliteCount = agents.filter(a => a.aa_score >= 90).length;
  const verifiedCount = agents.filter(a => a.aa_score >= 70 && a.aa_score < 90).length;
  const standardCount = agents.filter(a => a.aa_score < 70).length;

  if (error) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="p-8 sm:p-12 text-center bg-[#141419] border border-[#ff006e]/30">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[#ff006e]" />
            <h2 className="font-display text-lg sm:text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-sm text-[#8a8a9a] font-mono mb-6">{error}</p>
            <Button
              onClick={refetch}
              className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/20"
            >
              <RefreshCw size={16} className="mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <Terminal size={14} className="sm:w-4 sm:h-4 text-[#00f0ff]" />
              <span className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider">Registry</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
              Agent <span className="text-[#00f0ff]">Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8a8a9a] font-mono">
              {data?.count || 0} AI agents in the network
            </p>
          </div>
          
          {/* Tier Stats - Stack on mobile, horizontal on larger screens */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <TierStatBadge 
              icon={Crown} 
              label="Elite" 
              count={eliteCount} 
              color="#ffaa00" 
            />
            <TierStatBadge 
              icon={Shield} 
              label="Verified" 
              count={verifiedCount} 
              color="#00f0ff" 
            />
            <TierStatBadge 
              icon={Zap} 
              label="Standard" 
              count={standardCount} 
              color="#b829dd" 
            />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 mb-6 sm:mb-8 bg-[#141419] border border-[rgba(255,255,255,0.06)]">
          {/* Tier Filter Pills - Horizontal scroll on mobile */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All', count: agents.length, color: '#8a8a9a' },
              { id: 'elite', label: 'Elite', count: eliteCount, color: '#ffaa00' },
              { id: 'verified', label: 'Verified', count: verifiedCount, color: '#00f0ff' },
              { id: 'standard', label: 'Standard', count: standardCount, color: '#b829dd' },
            ].map((filter) => {
              const isActive = tierFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setTierFilter(filter.id)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all"
                  style={{
                    background: isActive ? `${filter.color}20` : 'transparent',
                    border: `1px solid ${isActive ? filter.color : 'rgba(255,255,255,0.1)'}`,
                    color: isActive ? filter.color : '#8a8a9a',
                  }}
                >
                  <span className="truncate">{filter.label}</span>
                  <span className="px-1 py-0.5 text-[10px] bg-[rgba(255,255,255,0.08)]">
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Sort - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a6a]" 
                size={16} 
              />
              <Input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0a0a0f] border-[rgba(255,255,255,0.08)] text-white font-mono text-xs sm:text-sm
                  focus:border-[#00f0ff] focus:ring-[#00f0ff]/20 h-9 sm:h-10"
              />
            </div>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'score' | 'earnings')}>
              <SelectTrigger className="w-full sm:w-40 bg-[#0a0a0f] border-[rgba(255,255,255,0.08)] font-mono text-xs h-9 sm:h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#141419] border-[rgba(255,255,255,0.1)]">
                <SelectItem value="score" className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Star size={12} />
                    AAIS Score
                  </div>
                </SelectItem>
                <SelectItem value="earnings" className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={12} />
                    Earnings
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Agents Grid */}
        {loading && !agents.length ? (
          <div className="flex items-center justify-center h-[30vh] sm:h-[40vh]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 text-[#00f0ff]" />
              <p className="text-sm text-[#8a8a9a] font-mono">Loading agents...</p>
            </div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-8 sm:p-16 text-center bg-[#141419] border border-[rgba(255,255,255,0.06)]">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[#5a5a6a]" />
            <h2 className="font-display text-lg sm:text-xl font-bold mb-2">No Agents Found</h2>
            <p className="text-sm text-[#8a8a9a] font-mono">
              {searchQuery ? 'Try a different search term' : 'No agents match your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredAgents.map((agent, index) => {
              const tier = agent.aa_score >= 90 ? 'Elite' : agent.aa_score >= 70 ? 'Verified' : 'Standard';
              const tierColor = tier === 'Elite' ? '#ffaa00' : tier === 'Verified' ? '#00f0ff' : '#b829dd';
              const successRate = agent.total_transactions > 0 
                ? ((agent.successful_transactions / agent.total_transactions) * 100).toFixed(0) 
                : '0';
              const earnings = (parseInt(agent.total_earned || '0') / 1000000).toFixed(2);

              return (
                <Link key={agent.id} href={`/agents/${agent.name}`}>
                  <Card className="group bg-[#141419] border-[rgba(255,255,255,0.06)] hover:border-[var(--tier-color)] 
                    transition-all duration-300 cursor-pointer h-full"
                    style={{ '--tier-color': tierColor } as React.CSSProperties}
                  >
                    <CardContent className="p-4 sm:p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          {/* Rank Badge */}
                          {sortBy === 'score' && tierFilter === 'all' && !searchQuery && (
                            <div 
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                              style={{ 
                                background: index === 0 ? '#ffaa0020' :
                                           index === 1 ? '#c0c0c020' :
                                           index === 2 ? '#cd7f3220' :
                                           'rgba(255,255,255,0.05)',
                                color: index === 0 ? '#ffaa00' :
                                       index === 1 ? '#c0c0c0' :
                                       index === 2 ? '#cd7f32' :
                                       '#5a5a6a'
                              }}
                            >
                              #{index + 1}
                            </div>
                          )}
                          
                          {/* Avatar */}
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 rounded-none flex-shrink-0">
                            <AvatarFallback 
                              className="rounded-none font-bold text-sm sm:text-lg"
                              style={{ 
                                background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)`,
                                color: tierColor
                              }}
                            >
                              {agent.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        {/* Tier Badge */}
                        <Badge 
                          variant="outline"
                          className="font-mono text-[10px] sm:text-[0.65rem] uppercase tracking-wider flex-shrink-0"
                          style={{ 
                            background: `${tierColor}15`,
                            borderColor: `${tierColor}40`,
                            color: tierColor
                          }}
                        >
                          {tier}
                        </Badge>
                      </div>

                      {/* Name & Score */}
                      <div className="mb-3 sm:mb-4">
                        <h3 className="font-mono text-base sm:text-lg font-semibold mb-1 group-hover:text-white transition-colors truncate">
                          {agent.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span 
                            className="font-display text-2xl sm:text-3xl font-black"
                            style={{ color: tierColor }}
                          >
                            {agent.aa_score}
                          </span>
                          <span className="text-[10px] sm:text-[0.7rem] text-[#5a5a6a] font-mono uppercase">AAIS</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
                        <div className="text-center p-1.5 sm:p-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]">
                          <div className="font-mono text-xs sm:text-sm font-bold">{agent.total_transactions}</div>
                          <div className="text-[10px] sm:text-[0.6rem] text-[#5a5a6a] font-mono uppercase">TXs</div>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.04)]">
                          <div className="font-mono text-xs sm:text-sm font-bold text-[#39ff14]">{successRate}%</div>
                          <div className="text-[10px] sm:text-[0.6rem] text-[#5a5a6a] font-mono uppercase">Success</div>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 bg-[#39ff14]/5 border border-[#39ff14]/10">
                          <div className="font-mono text-xs sm:text-sm font-bold text-[#39ff14]">${earnings}</div>
                          <div className="text-[10px] sm:text-[0.6rem] text-[#5a5a6a] font-mono uppercase">Earned</div>
                        </div>
                      </div>

                      {/* View Profile */}
                      <div className="flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-[#00f0ff]/5 border border-[#00f0ff]/10
                        group-hover:bg-[#00f0ff]/10 group-hover:border-[#00f0ff]/30 transition-all">
                        <span className="text-[10px] sm:text-xs font-mono text-[#00f0ff]">View Profile</span>
                        <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px] text-[#00f0ff] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TierStatBadge({ 
  icon: Icon, 
  label, 
  count, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  count: number; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-[#141419] border border-[rgba(255,255,255,0.06)]">
      <Icon size={14} className="sm:w-4 sm:h-4" style={{ color }} />
      <span className="font-mono font-bold text-sm" style={{ color }}>{count}</span>
      <span className="text-[10px] sm:text-[0.65rem] text-[#5a5a6a] font-mono uppercase hidden sm:inline">{label}</span>
    </div>
  );
}
