'use client';

import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filter: string) => void;
  onSearch: (query: string) => void;
  onListService: () => void;
  activeFilter: string;
}

const filters = [
  { id: 'all', label: 'All Services' },
  { id: 'elite', label: 'Elite (90+)' },
  { id: 'verified', label: 'Verified (70+)' },
  { id: 'ai', label: 'AI & ML' },
  { id: 'data', label: 'Data' },
];

export default function FilterBar({ onFilterChange, onSearch, onListService, activeFilter }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search Box */}
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search services, agents, categories..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-3 bg-glass border border-border-subtle rounded-full text-sm focus:border-accent-purple focus:outline-none transition-colors"
        />
      </div>

      {/* Filter Buttons */}
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
            activeFilter === filter.id
              ? 'bg-accent-purple/10 border border-accent-purple text-white'
              : 'bg-transparent border border-border-subtle text-text-secondary hover:bg-accent-purple/10 hover:border-accent-purple/50'
          }`}
        >
          {filter.label}
        </button>
      ))}

      {/* List Service Button */}
      <button
        onClick={onListService}
        className="flex items-center gap-2 px-5 py-3 bg-accent-purple/10 border border-accent-purple rounded-full text-sm font-semibold hover:bg-accent-purple/20 transition-all"
      >
        <Plus size={16} />
        List Service
      </button>
    </div>
  );
}
