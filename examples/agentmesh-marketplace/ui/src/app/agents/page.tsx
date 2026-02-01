'use client';

import { useState } from 'react';
import { useAgents } from '@/lib/hooks';
import AgentCard from '@/components/AgentCard';
import { Users, Search, Star, TrendingUp, Loader2, RefreshCw, Crown, Shield, Zap } from 'lucide-react';

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

  // Stats for the header
  const eliteCount = agents.filter(a => a.aa_score >= 90).length;
  const verifiedCount = agents.filter(a => a.aa_score >= 70 && a.aa_score < 90).length;
  const standardCount = agents.filter(a => a.aa_score < 70).length;

  if (error) {
    return (
      <main className="min-h-screen pt-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div 
            className="p-12 text-center rounded-3xl"
            style={{ 
              background: 'linear-gradient(145deg, rgba(255, 50, 50, 0.1), rgba(10, 10, 15, 0.9))',
              border: '1px solid rgba(255, 50, 50, 0.2)',
            }}
          >
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#ff5050' }} />
            <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
            <p style={{ color: '#6b6b7b' }} className="mb-6">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all"
              style={{ 
                background: 'rgba(0, 245, 255, 0.1)', 
                border: '1px solid #00F5FF',
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
    <main className="min-h-screen pt-24 px-6 lg:px-12 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12"
          style={{ 
            background: 'linear-gradient(145deg, rgba(154, 77, 255, 0.1), rgba(10, 10, 15, 0.95))',
            border: '1px solid rgba(154, 77, 255, 0.2)',
          }}
        >
          {/* Background decoration */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0, 245, 255, 0.3), transparent 70%)',
            }}
          />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)' }}
              >
                <Users size={28} className="text-black" />
              </div>
              <div>
                <h1 
                  className="text-4xl font-black"
                  style={{ fontFamily: 'Syncopate, sans-serif' }}
                >
                  AGENTS
                </h1>
                <p style={{ color: '#6b6b7b' }}>
                  {data?.count || 0} AI agents powering the marketplace
                </p>
              </div>
            </div>
            
            {/* Tier Stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#FFD700', boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                />
                <span style={{ color: '#FFD700' }} className="font-bold">{eliteCount}</span>
                <span style={{ color: '#6b6b7b' }}>Elite</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#00F5FF', boxShadow: '0 0 10px rgba(0, 245, 255, 0.5)' }}
                />
                <span style={{ color: '#00F5FF' }} className="font-bold">{verifiedCount}</span>
                <span style={{ color: '#6b6b7b' }}>Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#9A4DFF' }}
                />
                <span style={{ color: '#9A4DFF' }} className="font-bold">{standardCount}</span>
                <span style={{ color: '#6b6b7b' }}>Standard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tier Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Agents', icon: Users, count: agents.length },
              { id: 'elite', label: 'Elite', icon: Crown, count: eliteCount },
              { id: 'verified', label: 'Verified', icon: Shield, count: verifiedCount },
              { id: 'standard', label: 'Standard', icon: Zap, count: standardCount },
            ].map((filter) => {
              const isActive = tierFilter === filter.id;
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setTierFilter(filter.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: isActive 
                      ? filter.id === 'elite' ? 'rgba(255, 215, 0, 0.15)' 
                        : filter.id === 'verified' ? 'rgba(0, 245, 255, 0.15)'
                        : 'rgba(154, 77, 255, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isActive 
                      ? filter.id === 'elite' ? 'rgba(255, 215, 0, 0.3)' 
                        : filter.id === 'verified' ? 'rgba(0, 245, 255, 0.3)'
                        : 'rgba(154, 77, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.05)'}`,
                    color: isActive 
                      ? filter.id === 'elite' ? '#FFD700' 
                        : filter.id === 'verified' ? '#00F5FF'
                        : '#9A4DFF'
                      : '#6b6b7b',
                  }}
                >
                  <Icon size={16} />
                  {filter.label}
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
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
                className="pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none w-full sm:w-72"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f0f0f5',
                }}
              />
            </div>
            
            {/* Sort */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => setSortBy('score')}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all"
                style={{
                  background: sortBy === 'score' ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: sortBy === 'score' ? '#00F5FF' : '#6b6b7b',
                }}
              >
                <Star size={16} />
                AAIS
              </button>
              <button
                onClick={() => setSortBy('earnings')}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all"
                style={{
                  background: sortBy === 'earnings' ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
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
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#00F5FF' }} />
            <p style={{ color: '#6b6b7b' }}>Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div 
            className="p-16 text-center rounded-3xl"
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#6b6b7b' }} />
            <h2 className="text-2xl font-bold mb-2">No Agents Found</h2>
            <p style={{ color: '#6b6b7b' }}>
              {searchQuery ? 'Try a different search term' : 'No agents match your filters'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                rank={sortBy === 'score' && tierFilter === 'all' && !searchQuery ? index + 1 : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
