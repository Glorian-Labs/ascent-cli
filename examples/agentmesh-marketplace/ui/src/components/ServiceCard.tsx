'use client';

import { Star, Shield, Zap } from 'lucide-react';

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

export default function ServiceCard({ service, onHire }: ServiceCardProps) {
  const isElite = service.provider.aais >= 90;
  const isVerified = service.provider.aais >= 70;

  const getTierStyles = () => {
    if (isElite) return { text: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.3)' };
    if (isVerified) return { text: '#00F5FF', bg: 'rgba(0, 245, 255, 0.15)', border: 'rgba(0, 245, 255, 0.3)' };
    return { text: '#6b6b7b', bg: 'rgba(107, 107, 123, 0.15)', border: 'rgba(107, 107, 123, 0.3)' };
  };

  const tierStyles = getTierStyles();

  return (
    <div className="glass-card p-6 relative overflow-hidden group cursor-pointer service-card">
      {/* Elite badge */}
      {isElite && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: 'rgba(255, 215, 0, 0.2)', color: '#FFD700' }}>
          <Star size={12} className="fill-current" />
          Elite
        </div>
      )}
      
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#9A4DFF] to-[#00F5FF] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="pr-16">
          <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
          <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(154, 77, 255, 0.15)', color: '#9A4DFF' }}>
            {service.category}
          </span>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold" style={{ color: '#00F5FF' }}>
            {service.price}
          </div>
          <div className="text-xs" style={{ color: '#6b6b7b' }}>USDC</div>
        </div>
      </div>
      
      <p className="text-sm mb-6 line-clamp-2" style={{ color: '#6b6b7b' }}>
        {service.description}
      </p>
      
      <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9A4DFF] to-[#00F5FF] flex items-center justify-center text-xs font-bold">
            {service.provider.avatar}
          </div>
          {isElite && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FFD700' }}>
              <Star size={10} className="fill-black text-black" />
            </div>
          )}
          {isVerified && !isElite && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#00F5FF' }}>
              <Shield size={10} className="text-black" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="text-sm font-semibold">{service.provider.name}</div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: tierStyles.text }}>
              AAIS {service.provider.aais}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full" 
              style={{ backgroundColor: tierStyles.bg, color: tierStyles.text, border: `1px solid ${tierStyles.border}` }}>
              {service.provider.tier}
            </span>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onHire(service); }}
          className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ 
            backgroundColor: 'rgba(0, 245, 255, 0.1)', 
            border: '1px solid #00F5FF',
            color: '#00F5FF'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#00F5FF';
            e.currentTarget.style.color = '#050508';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 245, 255, 0.1)';
            e.currentTarget.style.color = '#00F5FF';
          }}
        >
          <Zap size={14} className="inline mr-1" />
          Hire
        </button>
      </div>
    </div>
  );
}
