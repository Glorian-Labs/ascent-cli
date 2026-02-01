'use client';

import { Star, Shield, Zap, Brain, Eye, Database, Lock, Code, BarChart3, Cpu } from 'lucide-react';

interface AgentAvatarProps {
  name: string;
  tier: 'Elite' | 'Verified' | 'Standard' | 'New';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

// Generate unique visual identity based on agent name
function getAgentIdentity(name: string) {
  // Create a hash from the name for consistent randomization
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Predefined agent archetypes with distinct visual identities
  const archetypes = [
    { 
      gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', 
      icon: Brain, 
      pattern: 'neural',
      glow: 'rgba(255, 107, 107, 0.4)',
    },
    { 
      gradient: 'linear-gradient(135deg, #4ECDC4, #44A08D)', 
      icon: Database, 
      pattern: 'data',
      glow: 'rgba(78, 205, 196, 0.4)',
    },
    { 
      gradient: 'linear-gradient(135deg, #667EEA, #764BA2)', 
      icon: Lock, 
      pattern: 'security',
      glow: 'rgba(102, 126, 234, 0.4)',
    },
    { 
      gradient: 'linear-gradient(135deg, #F093FB, #F5576C)', 
      icon: Eye, 
      pattern: 'vision',
      glow: 'rgba(240, 147, 251, 0.4)',
    },
    { 
      gradient: 'linear-gradient(135deg, #4FACFE, #00F2FE)', 
      icon: Cpu, 
      pattern: 'compute',
      glow: 'rgba(79, 172, 254, 0.4)',
    },
    { 
      gradient: 'linear-gradient(135deg, #FA709A, #FEE140)', 
      icon: BarChart3, 
      pattern: 'analytics',
      glow: 'rgba(250, 112, 154, 0.4)',
    },
    { 
      gradient: 'linear-gradient(135deg, #A8EDEA, #FED6E3)', 
      icon: Code, 
      pattern: 'code',
      glow: 'rgba(168, 237, 234, 0.4)',
    },
    { 
      gradient: 'linear-gradient(135deg, #FFD700, #FF8C00)', 
      icon: Star, 
      pattern: 'elite',
      glow: 'rgba(255, 215, 0, 0.5)',
    },
  ];
  
  // Match specific agents to archetypes for consistency
  const knownAgents: Record<string, number> = {
    'SentimentPro': 0,    // Brain - AI/ML
    'SecurityAgent': 2,   // Lock - Security
    'DataPipe': 1,        // Database - Data
    'QueryBot': 0,        // Brain - AI/ML
    'VisionAgent': 3,     // Eye - Vision
    'IndexerX': 4,        // Cpu - Compute
    'CodeReviewer': 6,    // Code
    'DataNewbie': 1,      // Database - Data
  };
  
  const archetypeIndex = knownAgents[name] ?? (hash % archetypes.length);
  return archetypes[archetypeIndex];
}

// SVG patterns for background texture
const patterns = {
  neural: (
    <pattern id="neural" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3" />
      <line x1="10" y1="10" x2="20" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <line x1="10" y1="10" x2="0" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
    </pattern>
  ),
  data: (
    <pattern id="data" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="2" height="10" fill="currentColor" opacity="0.2" />
      <rect x="4" width="2" height="6" y="4" fill="currentColor" opacity="0.3" />
      <rect x="8" width="2" height="8" y="2" fill="currentColor" opacity="0.2" />
    </pattern>
  ),
  security: (
    <pattern id="security" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M8 0 L16 4 L16 12 L8 16 L0 12 L0 4 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
    </pattern>
  ),
  vision: (
    <pattern id="vision" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </pattern>
  ),
  compute: (
    <pattern id="compute" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <line x1="0" y1="6" x2="2" y2="6" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </pattern>
  ),
  analytics: (
    <pattern id="analytics" width="16" height="16" patternUnits="userSpaceOnUse">
      <polyline points="0,16 4,12 8,14 12,8 16,10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </pattern>
  ),
  code: (
    <pattern id="code" width="20" height="10" patternUnits="userSpaceOnUse">
      <text x="0" y="8" fontSize="6" fill="currentColor" opacity="0.15" fontFamily="monospace">01</text>
      <text x="10" y="8" fontSize="6" fill="currentColor" opacity="0.15" fontFamily="monospace">10</text>
    </pattern>
  ),
  elite: (
    <pattern id="elite" width="20" height="20" patternUnits="userSpaceOnUse">
      <polygon points="10,0 12,8 20,8 14,13 16,20 10,16 4,20 6,13 0,8 8,8" fill="currentColor" opacity="0.1" />
    </pattern>
  ),
};

export default function AgentAvatar({ name, tier, size = 'md', showBadge = true }: AgentAvatarProps) {
  const identity = getAgentIdentity(name);
  const Icon = identity.icon;
  const isElite = tier === 'Elite';
  const isVerified = tier === 'Verified';
  
  const sizes = {
    sm: { container: 40, icon: 16, badge: 16, initials: 'text-xs' },
    md: { container: 56, icon: 22, badge: 20, initials: 'text-sm' },
    lg: { container: 72, icon: 28, badge: 24, initials: 'text-lg' },
    xl: { container: 96, icon: 36, badge: 28, initials: 'text-2xl' },
  };
  
  const s = sizes[size];
  
  return (
    <div className="relative" style={{ width: s.container, height: s.container }}>
      {/* Outer glow ring for elite */}
      {isElite && (
        <div 
          className="absolute inset-[-4px] rounded-2xl animate-pulse"
          style={{
            background: `linear-gradient(135deg, rgba(255, 215, 0, 0.3), transparent)`,
            filter: 'blur(4px)',
          }}
        />
      )}
      
      {/* Main avatar container */}
      <div 
        className="relative w-full h-full rounded-2xl overflow-hidden"
        style={{
          background: identity.gradient,
          boxShadow: `0 8px 32px ${identity.glow}`,
        }}
      >
        {/* Pattern overlay */}
        <svg 
          className="absolute inset-0 w-full h-full"
          style={{ color: 'white' }}
        >
          <defs>
            {patterns[identity.pattern as keyof typeof patterns]}
          </defs>
          <rect width="100%" height="100%" fill={`url(#${identity.pattern})`} />
        </svg>
        
        {/* Icon or Initials */}
        <div className="absolute inset-0 flex items-center justify-center">
          {size === 'sm' ? (
            <span 
              className={`font-black ${s.initials}`}
              style={{ 
                color: 'rgba(0,0,0,0.7)',
                fontFamily: 'Syncopate, sans-serif',
                textShadow: '0 1px 2px rgba(255,255,255,0.3)',
              }}
            >
              {name.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            <Icon 
              size={s.icon} 
              strokeWidth={2.5}
              style={{ 
                color: 'rgba(0,0,0,0.6)',
                filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.3))',
              }} 
            />
          )}
        </div>
        
        {/* Shine effect */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
          }}
        />
      </div>
      
      {/* Tier badge */}
      {showBadge && (
        <div 
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: s.badge,
            height: s.badge,
            bottom: -4,
            right: -4,
            background: isElite ? '#FFD700' : isVerified ? '#00F5FF' : '#9A4DFF',
            boxShadow: `0 2px 8px ${isElite ? 'rgba(255,215,0,0.5)' : isVerified ? 'rgba(0,245,255,0.5)' : 'rgba(154,77,255,0.5)'}`,
          }}
        >
          {isElite ? <Star size={s.badge * 0.6} className="fill-black text-black" /> : 
           isVerified ? <Shield size={s.badge * 0.6} className="text-black" /> : 
           <Zap size={s.badge * 0.6} className="text-black" />}
        </div>
      )}
    </div>
  );
}

// Export the identity generator for use in other components
export { getAgentIdentity };
