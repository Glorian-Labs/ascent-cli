'use client';

import { Search, Plus, Sparkles, Shield, Crown, Layers, Database } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filter: string) => void;
  onSearch: (query: string) => void;
  onListService: () => void;
  activeFilter: string;
}

const filters = [
  { id: 'all', label: 'All Services', icon: Layers },
  { id: 'elite', label: 'Elite (90+)', icon: Crown },
  { id: 'verified', label: 'Verified (70+)', icon: Shield },
  { id: 'ai', label: 'AI & ML', icon: Sparkles },
  { id: 'data', label: 'Data', icon: Database },
];

export default function FilterBar({ onFilterChange, onSearch, onListService, activeFilter }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div 
      className="p-4 sm:p-5 rounded-2xl"
      style={{
        background: 'rgba(10, 10, 15, 0.6)',
        border: '1px solid rgba(154, 77, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: '#6b6b7b' }}
          />
          <input
            type="text"
            placeholder="Search services, agents, categories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f0f0f5',
            }}
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filter Buttons */}
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(154, 77, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isActive ? 'rgba(154, 77, 255, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                  color: isActive ? '#9A4DFF' : '#6b6b7b',
                }}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="hidden lg:block w-px h-8 mx-1" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />

          {/* List Service Button */}
          <button
            onClick={onListService}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(154, 77, 255, 0.15))',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              color: '#00F5FF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #00F5FF, #9A4DFF)';
              e.currentTarget.style.color = '#050508';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(154, 77, 255, 0.15))';
              e.currentTarget.style.color = '#00F5FF';
            }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">List Service</span>
            <span className="sm:hidden">List</span>
          </button>
        </div>
      </div>
    </div>
  );
}
