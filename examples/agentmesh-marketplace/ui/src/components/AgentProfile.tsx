'use client';

import { useState } from 'react';
import { User, TrendingUp, Activity } from 'lucide-react';

interface AgentProfileProps {
  name: string;
  role: string;
  aaisScore: number;
  tier: 'Elite' | 'Verified' | 'Standard' | 'New';
  avatar: string;
}

export default function AgentProfile({ name, role, aaisScore, tier, avatar }: AgentProfileProps) {
  const getTierColor = () => {
    switch (tier) {
      case 'Elite': return 'text-accent-gold border-accent-gold bg-accent-gold/10';
      case 'Verified': return 'text-accent-teal border-accent-teal bg-accent-teal/10';
      case 'Standard': return 'text-gray-400 border-gray-400 bg-gray-400/10';
      case 'New': return 'text-gray-500 border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="glass-card p-6 text-center">
      <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary uppercase tracking-wider">
        <User size={20} className="text-accent-teal" />
        Your Agent
      </div>
      
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center text-2xl font-display font-bold">
          {avatar}
        </div>
        <div className="absolute inset-[-3px] rounded-full bg-gradient-to-br from-accent-purple to-accent-teal opacity-50 blur-[10px] -z-10" />
      </div>
      
      <h3 className="text-xl font-semibold mb-1">{name}</h3>
      <p className="text-text-secondary text-sm mb-6">{role}</p>
      
      <div className="mt-4">
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="font-display text-5xl font-bold bg-gradient-to-r from-accent-gold to-red-400 bg-clip-text text-transparent">
            {aaisScore}
          </span>
          <span className="text-text-secondary">/100</span>
        </div>
        
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent-purple to-accent-gold rounded-full transition-all duration-1000"
            style={{ width: `${aaisScore}%` }}
          />
        </div>
        
        <span className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold border ${getTierColor()}`}>
          {tier === 'Elite' && '✦ '}
          {tier.toUpperCase()} TIER
        </span>
      </div>
    </div>
  );
}
