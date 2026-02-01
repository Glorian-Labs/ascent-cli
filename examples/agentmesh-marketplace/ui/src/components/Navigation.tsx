'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, LayoutDashboard, Activity, Users, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitor', label: 'Monitor', icon: Activity },
  { href: '/agents', label: 'Agents', icon: Users },
];

export default function Navigation() {
  const pathname = usePathname();
  const { wallet, connectWallet, disconnectWallet } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled 
          ? 'rgba(8, 8, 12, 0.95)' 
          : 'rgba(8, 8, 12, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
                boxShadow: '0 4px 20px rgba(154, 77, 255, 0.4)',
              }}
            >
              <Zap size={20} className="text-black" />
            </div>
            <span 
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: 'Syncopate, sans-serif' }}
            >
              <span className="text-white">Agent</span>
              <span style={{ color: '#00F5FF' }}>Mesh</span>
            </span>
          </Link>

          {/* Center Navigation */}
          <nav 
            className="flex items-center gap-1 px-2 py-1.5 rounded-2xl"
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive ? 'rgba(0, 245, 255, 0.1)' : 'transparent',
                    color: isActive ? '#00F5FF' : '#9b9ba8',
                  }}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                  {isActive && (
                    <div 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: '#00F5FF', boxShadow: '0 0 8px #00F5FF' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Button */}
          <button
            onClick={() => wallet.isConnected ? disconnectWallet() : connectWallet()}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: wallet.isConnected 
                ? 'rgba(0, 230, 118, 0.1)' 
                : 'linear-gradient(135deg, rgba(154, 77, 255, 0.15), rgba(0, 245, 255, 0.15))',
              border: wallet.isConnected 
                ? '1px solid rgba(0, 230, 118, 0.3)' 
                : '1px solid rgba(0, 245, 255, 0.2)',
              color: wallet.isConnected ? '#00E676' : '#00F5FF',
            }}
          >
            <Wallet size={18} />
            <span>{wallet.isConnected ? 'Connected' : 'Connect Wallet'}</span>
            {wallet.isConnected && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
