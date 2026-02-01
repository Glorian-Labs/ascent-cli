'use client';

import { User } from 'lucide-react';

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
  const getTierColor = (aais: number) => {
    if (aais >= 90) return 'text-accent-gold';
    if (aais >= 70) return 'text-accent-teal';
    return 'text-gray-400';
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden group cursor-pointer service-card">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent-purple to-accent-teal opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
          <span className="text-xs text-text-secondary uppercase tracking-wider">
            {service.category}
          </span>
        </div>
        <div className="font-display text-xl font-bold text-accent-teal">
          {service.price}<span className="text-xs text-text-secondary"> USDC</span>
        </div>
      </div>
      
      <p className="text-text-secondary text-sm mb-6 line-clamp-2">
        {service.description}
      </p>
      
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center text-xs font-bold">
          {service.provider.avatar}
        </div>
        
        <div className="flex-1">
          <div className="text-sm font-semibold">{service.provider.name}</div>
          <div className={`text-xs ${getTierColor(service.provider.aais)}`}>
            AAIS {service.provider.aais} • {service.provider.tier}
          </div>
        </div>
        
        <button 
          onClick={() => onHire(service)}
          className="px-4 py-2 bg-accent-teal/10 border border-accent-teal rounded-full text-sm font-semibold text-accent-teal hover:bg-accent-teal hover:text-background transition-all"
        >
          Hire
        </button>
      </div>
    </div>
  );
}
