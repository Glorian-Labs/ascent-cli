'use client';

import { Star, Shield, Zap, TrendingUp, Activity, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Agent {
  id: number;
  name: string;
  address: string;
  aa_score: number;
  total_transactions: number;
  successful_transactions: number;
  total_earned: string;
  reputation_tier: 'Elite' | 'Verified' | 'Standard' | 'New';
}

interface AgentCardProps {
  agent: Agent;
  rank?: number;
}

export default function AgentCard({ agent, rank }: AgentCardProps) {
  const isElite = agent.aa_score >= 90;
  const isVerified = agent.aa_score >= 70;
  
  const successRate = agent.total_transactions > 0 
    ? ((agent.successful_transactions / agent.total_transactions) * 100).toFixed(0)
    : '0';
  
  const earnings = (parseInt(agent.total_earned || '0') / 1000000).toFixed(2);

  // Dynamic glow based on tier
  const getGlowStyle = () => {
    if (isElite) return '0 0 40px rgba(255, 215, 0, 0.15), 0 0 80px rgba(255, 215, 0, 0.05)';
    if (isVerified) return '0 0 30px rgba(0, 245, 255, 0.1)';
    return 'none';
  };

  // Rank medal colors
  const getRankStyle = () => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', color: '#000' };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32, #B8860B)', color: '#000' };
    return { bg: 'rgba(154, 77, 255, 0.3)', color: '#9A4DFF' };
  };

  const rankStyle = getRankStyle();

  return (
    <Link href={`/agents/${encodeURIComponent(agent.name)}`}>
      <div 
        className="relative group cursor-pointer overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 10, 15, 0.9), rgba(5, 5, 8, 0.95))',
          borderRadius: '24px',
          border: isElite 
            ? '1px solid rgba(255, 215, 0, 0.3)' 
            : isVerified 
              ? '1px solid rgba(0, 245, 255, 0.2)' 
              : '1px solid rgba(154, 77, 255, 0.15)',
          boxShadow: getGlowStyle(),
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow = isElite 
            ? '0 20px 60px rgba(255, 215, 0, 0.2), 0 0 100px rgba(255, 215, 0, 0.1)'
            : '0 20px 60px rgba(0, 245, 255, 0.15), 0 0 80px rgba(154, 77, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = getGlowStyle();
        }}
      >
        {/* Animated gradient border on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.1), transparent)',
            borderRadius: '24px',
          }}
        />

        {/* Elite shimmer effect */}
        {isElite && (
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ borderRadius: '24px' }}
          >
            <div 
              className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(255, 215, 0, 0.03), transparent, transparent)',
                animation: 'spin 8s linear infinite',
              }}
            />
          </div>
        )}

        <div className="relative p-6">
          {/* Rank Badge */}
          {rank && rank <= 10 && (
            <div 
              className="absolute -top-1 -left-1 w-10 h-10 flex items-center justify-center text-sm font-black rounded-full"
              style={{ 
                background: rankStyle.bg, 
                color: rankStyle.color,
                boxShadow: rank <= 3 ? '0 4px 15px rgba(0,0,0,0.3)' : 'none',
                fontFamily: 'Syncopate, sans-serif',
              }}
            >
              #{rank}
            </div>
          )}

          {/* Header: Avatar + Name + Tier */}
          <div className="flex items-start gap-4 mb-5">
            {/* Avatar with glow */}
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
                style={{
                  background: isElite 
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                    : 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
                  fontFamily: 'Syncopate, sans-serif',
                  boxShadow: isElite 
                    ? '0 8px 32px rgba(255, 215, 0, 0.3)' 
                    : '0 8px 32px rgba(154, 77, 255, 0.3)',
                }}
              >
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              
              {/* Status indicator */}
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: isElite ? '#FFD700' : isVerified ? '#00F5FF' : '#9A4DFF',
                  boxShadow: `0 0 12px ${isElite ? 'rgba(255, 215, 0, 0.5)' : isVerified ? 'rgba(0, 245, 255, 0.5)' : 'rgba(154, 77, 255, 0.5)'}`,
                }}
              >
                {isElite ? <Star size={12} className="fill-black text-black" /> : 
                 isVerified ? <Shield size={12} className="text-black" /> : 
                 <Zap size={12} className="text-black" />}
              </div>
            </div>

            {/* Name and Tier */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 
                  className="text-lg font-bold truncate"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {agent.name}
                </h3>
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: '#6b6b7b' }} />
              </div>
              
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: isElite 
                    ? 'rgba(255, 215, 0, 0.15)' 
                    : isVerified 
                      ? 'rgba(0, 245, 255, 0.15)' 
                      : 'rgba(154, 77, 255, 0.15)',
                  color: isElite ? '#FFD700' : isVerified ? '#00F5FF' : '#9A4DFF',
                  border: `1px solid ${isElite ? 'rgba(255, 215, 0, 0.3)' : isVerified ? 'rgba(0, 245, 255, 0.3)' : 'rgba(154, 77, 255, 0.3)'}`,
                }}
              >
                {isElite && <Star size={10} className="fill-current" />}
                {isVerified && !isElite && <Shield size={10} />}
                {agent.reputation_tier}
              </div>
            </div>
          </div>

          {/* AAIS Score - The Hero Element */}
          <div 
            className="relative mb-5 p-4 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.02)' }}
          >
            {/* Score background glow */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 30% 50%, ${isElite ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 245, 255, 0.2)'}, transparent 70%)`,
              }}
            />
            
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: '#6b6b7b' }}>
                  AAIS Score
                </div>
                <div className="flex items-baseline gap-1">
                  <span 
                    className="text-4xl font-black"
                    style={{ 
                      fontFamily: 'Syncopate, sans-serif',
                      background: isElite 
                        ? 'linear-gradient(135deg, #FFD700, #FF8C00)' 
                        : isVerified 
                          ? 'linear-gradient(135deg, #00F5FF, #9A4DFF)' 
                          : 'linear-gradient(135deg, #9A4DFF, #6b6b7b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {Math.round(agent.aa_score)}
                  </span>
                  <span className="text-sm" style={{ color: '#6b6b7b' }}>/100</span>
                </div>
              </div>
              
              {/* Circular progress indicator */}
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90">
                  <circle 
                    cx="32" cy="32" r="28" 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="4" 
                    fill="none"
                  />
                  <circle 
                    cx="32" cy="32" r="28" 
                    stroke={isElite ? '#FFD700' : isVerified ? '#00F5FF' : '#9A4DFF'}
                    strokeWidth="4" 
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${agent.aa_score * 1.76} 176`}
                    style={{
                      filter: `drop-shadow(0 0 6px ${isElite ? 'rgba(255, 215, 0, 0.5)' : 'rgba(0, 245, 255, 0.5)'})`,
                    }}
                  />
                </svg>
                <div 
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: isElite ? '#FFD700' : '#00F5FF' }}
                >
                  {successRate}%
                </div>
              </div>
            </div>
            
            {/* Score bar */}
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${agent.aa_score}%`,
                  background: isElite 
                    ? 'linear-gradient(90deg, #9A4DFF, #FFD700)' 
                    : 'linear-gradient(90deg, #9A4DFF, #00F5FF)',
                  boxShadow: `0 0 10px ${isElite ? 'rgba(255, 215, 0, 0.5)' : 'rgba(0, 245, 255, 0.5)'}`,
                }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox 
              icon={<Activity size={14} />} 
              value={agent.total_transactions.toString()} 
              label="Transactions" 
            />
            <StatBox 
              icon={<TrendingUp size={14} />} 
              value={`${successRate}%`} 
              label="Success" 
              highlight={parseInt(successRate) >= 90}
            />
            <StatBox 
              icon={<Zap size={14} />} 
              value={`$${earnings}`} 
              label="Earned" 
              highlight={parseFloat(earnings) > 0}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatBox({ 
  icon, 
  value, 
  label, 
  highlight = false 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
  highlight?: boolean;
}) {
  return (
    <div 
      className="p-3 rounded-xl text-center"
      style={{ 
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
      }}
    >
      <div 
        className="flex items-center justify-center gap-1 mb-1"
        style={{ color: highlight ? '#00F5FF' : '#6b6b7b' }}
      >
        {icon}
      </div>
      <div 
        className="text-base font-bold"
        style={{ 
          fontFamily: 'Space Grotesk, sans-serif',
          color: highlight ? '#00F5FF' : '#f0f0f5',
        }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6b6b7b' }}>
        {label}
      </div>
    </div>
  );
}
