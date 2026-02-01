'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';

const navLinks = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'services', label: 'My Services' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'leaderboard', label: 'Leaderboard' },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 px-6 lg:px-12 py-5 flex justify-between items-center bg-background/80 backdrop-blur-xl border-b border-border-subtle z-50">
      <div className="font-display text-xl font-bold gradient-text tracking-wider">
        Agent<span className="font-light opacity-70">Mesh</span>
      </div>

      <div className="hidden md:flex gap-8">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onTabChange(link.id)}
            className={`relative text-sm font-medium transition-colors ${
              activeTab === link.id ? 'text-accent-teal' : 'text-text-secondary hover:text-white'
            }`}
          >
            {link.label}
            {activeTab === link.id && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-purple to-accent-teal" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setIsConnected(!isConnected)}
        className="flex items-center gap-2 px-5 py-2.5 btn-primary rounded-full text-sm font-semibold"
      >
        <Wallet size={16} />
        {isConnected ? '0x489c...fe5d' : 'Connect Wallet'}
      </button>
    </nav>
  );
}
