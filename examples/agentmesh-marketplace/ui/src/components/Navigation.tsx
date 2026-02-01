'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, LayoutDashboard, Activity, Store, Users, Menu, X, Zap } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(5, 5, 8, 0.92)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(154, 77, 255, 0.12)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3"
            >
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
                  boxShadow: '0 4px 20px rgba(154, 77, 255, 0.3)',
                }}
              >
                <Zap size={18} className="text-black" />
              </div>
              <span 
                className="text-lg font-bold tracking-wide hidden sm:block"
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
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: isActive ? 'rgba(0, 245, 255, 0.1)' : 'transparent',
                      color: isActive ? '#00F5FF' : '#8b8b9b',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#f0f0f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#8b8b9b';
                      }
                    }}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Connect Wallet Button */}
              <button
                onClick={() => wallet.isConnected ? disconnectWallet() : connectWallet()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: wallet.isConnected 
                    ? 'rgba(0, 230, 118, 0.15)' 
                    : 'linear-gradient(135deg, rgba(154, 77, 255, 0.15), rgba(0, 245, 255, 0.15))',
                  border: wallet.isConnected 
                    ? '1px solid rgba(0, 230, 118, 0.3)' 
                    : '1px solid rgba(0, 245, 255, 0.25)',
                  color: wallet.isConnected ? '#00E676' : '#00F5FF',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = wallet.isConnected 
                    ? 'rgba(0, 230, 118, 0.25)' 
                    : 'linear-gradient(135deg, #9A4DFF, #00F5FF)';
                  e.currentTarget.style.color = wallet.isConnected ? '#00E676' : '#050508';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = wallet.isConnected 
                    ? 'rgba(0, 230, 118, 0.15)' 
                    : 'linear-gradient(135deg, rgba(154, 77, 255, 0.15), rgba(0, 245, 255, 0.15))';
                  e.currentTarget.style.color = wallet.isConnected ? '#00E676' : '#00F5FF';
                }}
              >
                <Wallet size={16} />
                <span className="hidden sm:inline">
                  {wallet.isConnected ? wallet.address?.slice(0, 6) + '...' + wallet.address?.slice(-4) : 'Connect'}
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#8b8b9b',
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          style={{ paddingTop: '64px' }}
        >
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            className="relative mx-4 mt-4 p-4 rounded-2xl"
            style={{
              background: 'rgba(10, 10, 15, 0.98)',
              border: '1px solid rgba(154, 77, 255, 0.2)',
            }}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all"
                    style={{
                      background: isActive ? 'rgba(0, 245, 255, 0.1)' : 'transparent',
                      color: isActive ? '#00F5FF' : '#8b8b9b',
                    }}
                  >
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
