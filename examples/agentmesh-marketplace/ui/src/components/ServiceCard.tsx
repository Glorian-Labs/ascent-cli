'use client';

import { Star, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';
import AgentAvatar from './AgentAvatar';

interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
  price: string;
  provider: {
    name: string;
    avatar: string;
    aais: number;
    tier: string;
  };
}

interface ServiceCardProps {
  service: Service;
  onHire: (service: Service) => void;
}

// Category icons and colors for visual distinction
const categoryStyles: Record<string, { color: string; bg: string }> = {
  'AI & Machine Learning': { color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.15)' },
  'Security': { color: '#667EEA', bg: 'rgba(102, 126, 234, 0.15)' },
  'Data Engineering': { color: '#4ECDC4', bg: 'rgba(78, 205, 196, 0.15)' },
  'Computer Vision': { color: '#F093FB', bg: 'rgba(240, 147, 251, 0.15)' },
  'Blockchain': { color: '#4FACFE', bg: 'rgba(79, 172, 254, 0.15)' },
  'Development': { color: '#A8EDEA', bg: 'rgba(168, 237, 234, 0.15)' },
  'Analytics': { color: '#FA709A', bg: 'rgba(250, 112, 154, 0.15)' },
  'General': { color: '#9A4DFF', bg: 'rgba(154, 77, 255, 0.15)' },
};

export default function ServiceCard({ service, onHire }: ServiceCardProps) {
  const isElite = service.provider.aais >= 90;
  const isVerified = service.provider.aais >= 70;
  const catStyle = categoryStyles[service.category] || categoryStyles['General'];

  return (
    <div 
      className="relative group cursor-pointer overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(15, 15, 20, 0.95), rgba(5, 5, 8, 0.98))',
        borderRadius: '24px',
        border: isElite 
          ? '1px solid rgba(255, 215, 0, 0.25)' 
          : '1px solid rgba(255, 255, 255, 0.06)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = isElite 
          ? '0 20px 50px rgba(255, 215, 0, 0.15)' 
          : '0 20px 50px rgba(154, 77, 255, 0.1)';
        e.currentTarget.style.borderColor = isElite 
          ? 'rgba(255, 215, 0, 0.4)' 
          : 'rgba(0, 245, 255, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isElite 
          ? 'rgba(255, 215, 0, 0.25)' 
          : 'rgba(255, 255, 255, 0.06)';
      }}
    >
      {/* Top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${catStyle.color}, #00F5FF)` }}
      />
      
      {/* Elite shimmer */}
      {isElite && (
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div 
            className="absolute w-[300%] h-full -left-full opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
              animation: 'shimmer 3s infinite',
            }}
          />
        </div>
      )}

      <div className="relative p-4 sm:p-5 lg:p-6">
        {/* Header: Category + Price */}
        <div className="flex items-start justify-between mb-4">
          <span 
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
          >
            <Sparkles size={12} />
            {service.category}
          </span>
          
          <div className="text-right">
            <div 
              className="text-2xl font-black"
              style={{ 
                fontFamily: 'Syncopate, sans-serif',
                color: '#00F5FF',
                textShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
              }}
            >
              {service.price}
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6b6b7b' }}>
              USDC
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="text-xl font-bold mb-3 group-hover:text-white transition-colors"
          style={{ color: '#e0e0e5' }}
        >
          {service.title}
        </h3>
        
        {/* Description */}
        <p 
          className="text-sm mb-6 line-clamp-2 leading-relaxed"
          style={{ color: '#6b6b7b' }}
        >
          {service.description}
        </p>
        
        {/* Provider Section */}
        <div 
          className="flex items-center gap-4 p-4 rounded-2xl"
          style={{ background: 'rgba(255, 255, 255, 0.02)' }}
        >
          <AgentAvatar 
            name={service.provider.name} 
            tier={service.provider.tier as 'Elite' | 'Verified' | 'Standard' | 'New'}
            size="md"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold truncate">{service.provider.name}</span>
              {isElite && <Star size={14} style={{ color: '#FFD700' }} className="fill-current flex-shrink-0" />}
            </div>
            
            <div className="flex items-center gap-2">
              {/* AAIS Score mini bar */}
              <div className="flex items-center gap-1.5">
                <span 
                  className="text-xs font-bold"
                  style={{ color: isElite ? '#FFD700' : isVerified ? '#00F5FF' : '#9A4DFF' }}
                >
                  {Math.round(service.provider.aais)}
                </span>
                <div 
                  className="w-12 h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${service.provider.aais}%`,
                      background: isElite 
                        ? 'linear-gradient(90deg, #9A4DFF, #FFD700)' 
                        : 'linear-gradient(90deg, #9A4DFF, #00F5FF)',
                    }}
                  />
                </div>
              </div>
              
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={{ 
                  backgroundColor: isElite ? 'rgba(255, 215, 0, 0.15)' : isVerified ? 'rgba(0, 245, 255, 0.15)' : 'rgba(154, 77, 255, 0.15)',
                  color: isElite ? '#FFD700' : isVerified ? '#00F5FF' : '#9A4DFF',
                }}
              >
                {service.provider.tier}
              </span>
            </div>
          </div>
          
          {/* Hire Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onHire(service); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all group/btn"
            style={{ 
              background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(154, 77, 255, 0.15))',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              color: '#00F5FF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #00F5FF, #9A4DFF)';
              e.currentTarget.style.color = '#050508';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(154, 77, 255, 0.15))';
              e.currentTarget.style.color = '#00F5FF';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Zap size={16} />
            Hire
            <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
