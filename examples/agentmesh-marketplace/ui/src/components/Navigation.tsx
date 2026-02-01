'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, LayoutDashboard, Activity, Store, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navLinks = [
  { href: '/', label: 'Marketplace', icon: Store },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitor', label: 'Monitor', icon: Activity },
  { href: '/agents', label: 'Agents', icon: Users },
];

export default function Navigation() {
  const pathname = usePathname();
  const { wallet, connectWallet, disconnectWallet } = useApp();

  return (
    <nav 
      className="fixed top-0 left-0 right-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center z-50"
      style={{
        background: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(154, 77, 255, 0.15)',
      }}
    >
      <Link 
        href="/" 
        className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-wider"
        style={{ fontFamily: 'Syncopate, sans-serif' }}
      >
        <span 
          style={{
            background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Agent
        </span>
        <span style={{ color: '#6b6b7b' }}>Mesh</span>
      </Link>

      <div className="hidden sm:flex gap-4 lg:gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex items-center gap-2 text-sm font-medium transition-all py-2"
              style={{
                color: isActive ? '#00F5FF' : '#6b6b7b',
              }}
              onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = '#f0f0f5')}
              onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = '#6b6b7b')}
            >
              <Icon size={16} />
              {link.label}
              {isActive && (
                <span 
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #9A4DFF, #00F5FF)' }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => wallet.isConnected ? disconnectWallet() : connectWallet()}
        className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(154, 77, 255, 0.2), rgba(0, 245, 255, 0.2))',
          border: '1px solid rgba(0, 245, 255, 0.3)',
          color: '#00F5FF',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #9A4DFF, #00F5FF)';
          e.currentTarget.style.color = '#050508';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(154, 77, 255, 0.2), rgba(0, 245, 255, 0.2))';
          e.currentTarget.style.color = '#00F5FF';
        }}
      >
        <Wallet size={16} />
        <span className="hidden sm:inline">
          {wallet.isConnected ? wallet.address?.slice(0, 8) + '...' : 'Connect Wallet'}
        </span>
        <span className="sm:hidden">
          {wallet.isConnected ? 'Connected' : 'Connect'}
        </span>
      </button>
    </nav>
  );
}
