'use client';

import { User, Star, Shield, Award } from 'lucide-react';
import AgentAvatar from './AgentAvatar';

interface AgentProfileProps {
  name: string;
  role: string;
  aaisScore: number;
  tier: 'Elite' | 'Verified' | 'Standard' | 'New';
  avatar: string;
}

export default function AgentProfile({ name, role, aaisScore, tier, avatar }: AgentProfileProps) {
  const getTierStyles = () => {
    switch (tier) {
      case 'Elite': return { 
        color: '#FFD700', 
        bg: 'rgba(255, 215, 0, 0.15)', 
        border: 'rgba(255, 215, 0, 0.5)',
        glow: '0 0 20px rgba(255, 215, 0, 0.3)'
      };
      case 'Verified': return { 
        color: '#00F5FF', 
        bg: 'rgba(0, 245, 255, 0.15)', 
        border: 'rgba(0, 245, 255, 0.5)',
        glow: '0 0 20px rgba(0, 245, 255, 0.3)'
      };
      case 'Standard': return { 
        color: '#9A4DFF', 
        bg: 'rgba(154, 77, 255, 0.15)', 
        border: 'rgba(154, 77, 255, 0.5)',
        glow: 'none'
      };
      default: return { 
        color: '#6b6b7b', 
        bg: 'rgba(107, 107, 123, 0.15)', 
        border: 'rgba(107, 107, 123, 0.5)',
        glow: 'none'
      };
    }
  };

  const tierStyles = getTierStyles();
  const isElite = tier === 'Elite';

  return (
    <div 
      className="p-4 sm:p-5 text-center relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, rgba(10, 10, 15, 0.8), rgba(5, 5, 8, 0.9))',
        border: isElite ? '1px solid rgba(255, 215, 0, 0.2)' : '1px solid rgba(154, 77, 255, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Elite glow effect */}
      {isElite && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
      )}
      
      <div className="flex items-center justify-center gap-2 mb-4 text-sm uppercase tracking-wider" style={{ color: '#6b6b7b' }}>
        <User size={16} style={{ color: '#00F5FF' }} />
        Featured Agent
      </div>
      
      <div className="flex justify-center mb-4">
        <AgentAvatar 
          name={name} 
          tier={tier}
          size="xl"
          showBadge={true}
        />
      </div>
      
      <h3 className="text-xl font-semibold mb-1">{name}</h3>
      <p className="text-sm mb-4" style={{ color: '#6b6b7b' }}>{role}</p>
      
      <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6b7b' }}>
          AAIS Score
        </div>
        <div className="flex items-baseline justify-center gap-1 mb-3">
          <span 
            className="text-5xl font-bold"
            style={{ 
              fontFamily: 'Syncopate, sans-serif',
              background: aaisScore >= 90 
                ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                : aaisScore >= 70 
                  ? 'linear-gradient(135deg, #00F5FF, #9A4DFF)' 
                  : 'linear-gradient(135deg, #9A4DFF, #6b6b7b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {aaisScore}
          </span>
          <span style={{ color: '#6b6b7b' }}>/100</span>
        </div>
        
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ 
              width: `${aaisScore}%`,
              background: aaisScore >= 90 
                ? 'linear-gradient(90deg, #9A4DFF, #FFD700)' 
                : 'linear-gradient(90deg, #9A4DFF, #00F5FF)'
            }}
          />
        </div>
        
        <div 
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-semibold"
          style={{ 
            backgroundColor: tierStyles.bg, 
            color: tierStyles.color,
            border: `1px solid ${tierStyles.border}`,
            boxShadow: tierStyles.glow
          }}
        >
          {isElite && <Star size={14} className="fill-current" />}
          {tier === 'Verified' && <Shield size={14} />}
          {tier === 'Standard' && <Award size={14} />}
          {tier.toUpperCase()} TIER
        </div>
      </div>
    </div>
  );
}
