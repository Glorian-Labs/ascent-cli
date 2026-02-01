'use client';

import { useState } from 'react';
import { useAgents } from '@/lib/hooks';
import Link from 'next/link';
import { Users, Search, Filter, Star, TrendingUp, ArrowUpDown, ExternalLink } from 'lucide-react';

export default function AgentsPage() {
  const [sortBy, setSortBy] = useState<'score' | 'earnings'>('score');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading, error, refetch } = useAgents({ sort: sortBy });

  const agents = data?.agents || [];
  
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <main className="min-h-screen pt-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 text-center">
            <Users className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
            <p className="text-text-secondary">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 px-6 lg:px-12 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Agents</h1>
            <p className="text-text-secondary mt-1">
              {data?.count || 0} registered agents in the marketplace
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-accent-teal w-full sm:w-64"
              />
            </div>
            
            {/* Sort */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('score')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'score'
                    ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/50'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10'
                }`}
              >
                <Star size={14} />
                By AAIS
              </button>
              <button
                onClick={() => setSortBy('earnings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'earnings'
                    ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/50'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10'
                }`}
              >
                <TrendingUp size={14} />
                By Earnings
              </button>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {loading && !agents.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-24 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-4 w-full bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Agents Found</h2>
            <p className="text-text-secondary">
              {searchQuery ? 'Try a different search term' : 'No agents registered yet'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${encodeURIComponent(agent.name)}`}
                className="glass-card p-6 group hover:border-accent-teal/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center text-sm font-bold">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-accent-teal transition-colors flex items-center gap-2">
                        {agent.name}
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <TierBadge tier={agent.reputation_tier} score={agent.aa_score} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-border-subtle">
                  <div>
                    <div className={`font-display text-xl font-bold ${
                      agent.aa_score >= 90 ? 'text-accent-gold' :
                      agent.aa_score >= 70 ? 'text-accent-teal' :
                      'text-text-secondary'
                    }`}>
                      {agent.aa_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-text-secondary">AAIS</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold">
                      {agent.total_transactions}
                    </div>
                    <div className="text-xs text-text-secondary">Transactions</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-accent-teal">
                      {(parseInt(agent.total_earned) / 1000000).toFixed(2)}
                    </div>
                    <div className="text-xs text-text-secondary">USDC Earned</div>
                  </div>
                </div>

                {/* Success Rate Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">Success Rate</span>
                    <span className="text-accent-teal">
                      {agent.total_transactions > 0 
                        ? ((agent.successful_transactions / agent.total_transactions) * 100).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-accent-purple to-accent-teal rounded-full transition-all"
                      style={{ 
                        width: agent.total_transactions > 0 
                          ? `${(agent.successful_transactions / agent.total_transactions) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function TierBadge({ tier, score }: { tier: string; score: number }) {
  const styles = {
    Elite: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30',
    Verified: 'bg-accent-teal/20 text-accent-teal border-accent-teal/30',
    Standard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    New: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
      styles[tier as keyof typeof styles] || styles.New
    }`}>
      {tier === 'Elite' && <Star size={10} className="fill-current" />}
      {tier}
    </span>
  );
}
