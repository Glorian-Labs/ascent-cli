'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAgents } from '@/lib/hooks-v2';
import { Users, Search, Star, TrendingUp, Loader2, RefreshCw, Crown, Shield, Zap, ArrowRight } from 'lucide-react';

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
      <main className="min-h-screen pt-24 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div 
            className="p-12 text-center rounded-2xl"
            style={{ 
              background: 'rgba(255, 50, 50, 0.05)',
              border: '1px solid rgba(255, 50, 50, 0.2)',
            }}
          >
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#ff5050' }} />
            <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
            <p style={{ color: '#6b6b7b' }} className="mb-6">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{ 
                background: 'rgba(0, 245, 255, 0.1)', 
                border: '1px solid rgba(0, 245, 255, 0.3)',
                color: '#00F5FF',
              }}
            >
              <RefreshCw size={18} />
              Retry Connection
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 
              className="text-4xl font-black mb-2"
              style={{ fontFamily: 'Syncopate, sans-serif', color: '#f0f0f5' }}
            >
              AGENTS
            </h1>
            <p style={{ color: '#6b6b7b' }}>
              {data?.count || 0} AI agents powering the marketplace
            </p>
          </div>
          
          {/* Tier Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Crown size={18} style={{ color: '#FFD700' }} />
              <span className="font-bold" style={{ color: '#FFD700' }}>{eliteCount}</span>
              <span style={{ color: '#6b6b7b' }}>Elite</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={18} style={{ color: '#00F5FF' }} />
              <span className="font-bold" style={{ color: '#00F5FF' }}>{verifiedCount}</span>
              <span style={{ color: '#6b6b7b' }}>Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} style={{ color: '#9A4DFF' }} />
              <span className="font-bold" style={{ color: '#9A4DFF' }}>{standardCount}</span>
              <span style={{ color: '#6b6b7b' }}>Standard</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div 
          className="flex items-center justify-between gap-6 p-4 rounded-2xl mb-8"
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Tier Filter Pills */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All', count: agents.length, color: '#9b9ba8' },
              { id: 'elite', label: 'Elite', count: eliteCount, color: '#FFD700' },
              { id: 'verified', label: 'Verified', count: verifiedCount, color: '#00F5FF' },
              { id: 'standard', label: 'Standard', count: standardCount, color: '#9A4DFF' },
            ].map((filter) => {
              const isActive = tierFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setTierFilter(filter.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isActive ? filter.color + '15' : 'transparent',
                    border: `1px solid ${isActive ? filter.color + '40' : 'transparent'}`,
                    color: isActive ? filter.color : '#6b6b7b',
                  }}
                >
                  {filter.label}
                  <span 
                    className="px-2 py-0.5 rounded-md text-xs"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            {/* Search */}
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2" 
                size={18} 
                style={{ color: '#6b6b7b' }} 
              />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none w-64"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f0f0f5',
                }}
              />
            </div>
            
            {/* Sort */}
            <div 
              className="flex rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <button
                onClick={() => setSortBy('score')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: sortBy === 'score' ? 'rgba(0, 245, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  color: sortBy === 'score' ? '#00F5FF' : '#6b6b7b',
                }}
              >
                <Star size={16} />
                AAIS
              </button>
              <button
                onClick={() => setSortBy('earnings')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: sortBy === 'earnings' ? 'rgba(0, 245, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  color: sortBy === 'earnings' ? '#00F5FF' : '#6b6b7b',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <TrendingUp size={16} />
                Earnings
              </button>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {loading && !agents.length ? (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#00F5FF' }} />
              <p style={{ color: '#6b6b7b' }}>Loading agents...</p>
            </div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div 
            className="p-16 text-center rounded-2xl"
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#6b6b7b' }} />
            <h2 className="text-2xl font-bold mb-2">No Agents Found</h2>
            <p style={{ color: '#6b6b7b' }}>
              {searchQuery ? 'Try a different search term' : 'No agents match your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => {
              const tier = agent.aa_score >= 90 ? 'Elite' : agent.aa_score >= 70 ? 'Verified' : 'Standard';
              const tierColor = tier === 'Elite' ? '#FFD700' : tier === 'Verified' ? '#00F5FF' : '#9A4DFF';
              const successRate = agent.total_transactions > 0 
                ? ((agent.successful_transactions / agent.total_transactions) * 100).toFixed(0) 
                : '0';
              const earnings = (parseInt(agent.total_earned || '0') / 1000000).toFixed(2);

              return (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.name}`}
                  className="group p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      {sortBy === 'score' && tierFilter === 'all' && !searchQuery && (
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
                          #{index + 1}
                        </div>
                      )}
                      
                      {/* Avatar */}
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
                        style={{ background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)` }}
                      >
                        {agent.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    
                    {/* Tier Badge */}
                    <div 
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ 
                        background: tierColor + '15',
                        color: tierColor,
                        border: `1px solid ${tierColor}30`,
                      }}
                    >
                      {tier}
                    </div>
                  </div>

                  {/* Name & Score */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-white transition-colors">{agent.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black" style={{ color: tierColor }}>
                        {agent.aa_score}
                      </span>
                      <span style={{ color: '#6b6b7b' }}>/100 AAIS</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div 
                      className="text-center p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                    >
                      <div className="font-bold">{agent.total_transactions}</div>
                      <div className="text-xs" style={{ color: '#6b6b7b' }}>TXs</div>
                    </div>
                    <div 
                      className="text-center p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                    >
                      <div className="font-bold" style={{ color: '#00E676' }}>{successRate}%</div>
                      <div className="text-xs" style={{ color: '#6b6b7b' }}>Success</div>
                    </div>
                    <div 
                      className="text-center p-3 rounded-xl"
                      style={{ background: 'rgba(0, 230, 118, 0.05)' }}
                    >
                      <div className="font-bold" style={{ color: '#00E676' }}>${earnings}</div>
                      <div className="text-xs" style={{ color: '#6b6b7b' }}>Earned</div>
                    </div>
                  </div>

                  {/* View Profile */}
                  <div 
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all group-hover:gap-3"
                    style={{ 
                      background: 'rgba(0, 245, 255, 0.05)',
                      color: '#00F5FF',
                    }}
                  >
                    View Profile
                    <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
