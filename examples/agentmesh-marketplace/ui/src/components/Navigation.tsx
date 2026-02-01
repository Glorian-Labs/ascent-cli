'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, LayoutDashboard, Activity, Users, Menu, X, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitor', label: 'Monitor', icon: Activity },
  { href: '/agents', label: 'Agents', icon: Users },
];

export default function Navigation() {
  const pathname = usePathname();
  const { wallet, connectWallet, disconnectWallet } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{
          background: 'rgba(5, 5, 8, 0.95)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(154, 77, 255, 0.15)',
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
              }}
            >
              <Zap size={16} className="text-black" />
            </div>
            <span 
              className="text-base font-bold tracking-wide"
              style={{ fontFamily: 'Syncopate, sans-serif' }}
            >
              <span style={{ color: '#f0f0f5' }}>Agent</span>
              <span style={{ color: '#00F5FF' }}>Mesh</span>
            </span>
          </Link>

          {/* Center Navigation - Always visible on desktop */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
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
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => wallet.isConnected ? disconnectWallet() : connectWallet()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: wallet.isConnected 
                  ? 'rgba(0, 230, 118, 0.15)' 
                  : 'rgba(0, 245, 255, 0.1)',
                border: wallet.isConnected 
                  ? '1px solid rgba(0, 230, 118, 0.3)' 
                  : '1px solid rgba(0, 245, 255, 0.25)',
                color: wallet.isConnected ? '#00E676' : '#00F5FF',
              }}
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">
                {wallet.isConnected ? 'Connected' : 'Connect Wallet'}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#8b8b9b',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] md:hidden"
          style={{ paddingTop: '64px' }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div 
            className="relative mx-4 mt-2 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200"
            style={{
              background: 'rgba(10, 10, 15, 0.98)',
              border: '1px solid rgba(154, 77, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(154, 77, 255, 0.2)' }}>
              <span className="text-sm font-semibold" style={{ color: '#f0f0f5' }}>Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#8b8b9b',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#f0f0f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#8b8b9b';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all mb-1"
                    style={{
                      background: isActive ? 'rgba(0, 245, 255, 0.15)' : 'transparent',
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
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Wallet Button */}
            <div className="p-4 pt-2 border-t" style={{ borderColor: 'rgba(154, 77, 255, 0.2)' }}>
              <button
                onClick={() => {
                  wallet.isConnected ? disconnectWallet() : connectWallet();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold transition-all"
                style={{
                  background: wallet.isConnected 
                    ? 'rgba(0, 230, 118, 0.15)' 
                    : 'rgba(0, 245, 255, 0.1)',
                  border: wallet.isConnected 
                    ? '1px solid rgba(0, 230, 118, 0.3)' 
                    : '1px solid rgba(0, 245, 255, 0.25)',
                  color: wallet.isConnected ? '#00E676' : '#00F5FF',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = wallet.isConnected 
                    ? 'rgba(0, 230, 118, 0.25)' 
                    : 'rgba(0, 245, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = wallet.isConnected 
                    ? 'rgba(0, 230, 118, 0.15)' 
                    : 'rgba(0, 245, 255, 0.1)';
                }}
              >
                <Wallet size={18} />
                {wallet.isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
