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
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-full flex items-center justify-between relative">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 z-10">
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline"
                    style={{
                      background: isActive ? 'rgba(0, 245, 255, 0.1)' : 'transparent',
                      color: isActive ? '#00F5FF' : '#8b8b9b',
                      textDecoration: 'none',
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
            <div className="flex items-center gap-3 flex-shrink-0 z-10">
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
        </div>
      </nav>

      {/* Mobile Menu - Slide from Right */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] md:hidden"
          style={{
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              animation: 'fadeIn 0.2s ease-out',
            }}
          />
          
          {/* Menu Panel - Slides from right */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm h-full overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(5, 5, 8, 0.98) 100%)',
              borderLeft: '1px solid rgba(154, 77, 255, 0.2)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header with Logo */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ 
                borderColor: 'rgba(154, 77, 255, 0.15)',
                background: 'linear-gradient(135deg, rgba(154, 77, 255, 0.1), rgba(0, 245, 255, 0.05))',
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
                  }}
                >
                  <Zap size={20} className="text-black" />
                </div>
                <span 
                  className="text-lg font-bold"
                  style={{ fontFamily: 'Syncopate, sans-serif' }}
                >
                  <span style={{ color: '#f0f0f5' }}>Agent</span>
                  <span style={{ color: '#00F5FF' }}>Mesh</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#8b8b9b',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#f0f0f5';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#8b8b9b';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-2">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold transition-all relative group"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(154, 77, 255, 0.1))' 
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isActive 
                        ? '1px solid rgba(0, 245, 255, 0.3)' 
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#00F5FF' : '#8b8b9b',
                      animationDelay: `${index * 0.05}s`,
                      animation: 'fadeInUp 0.3s ease-out both',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(154, 77, 255, 0.2)';
                        e.currentTarget.style.color = '#f0f0f5';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#8b8b9b';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div 
                      className="p-2.5 rounded-xl"
                      style={{
                        background: isActive 
                          ? 'rgba(0, 245, 255, 0.2)' 
                          : 'rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span className="flex-1">{link.label}</span>
                    {isActive && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#00F5FF' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Wallet Section */}
            <div className="p-4 pt-6 mt-4 border-t" style={{ borderColor: 'rgba(154, 77, 255, 0.15)' }}>
              <div className="mb-3 px-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6b7b' }}>
                  Wallet
                </span>
              </div>
              <button
                onClick={() => {
                  wallet.isConnected ? disconnectWallet() : connectWallet();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-base font-semibold transition-all relative overflow-hidden group"
                style={{
                  background: wallet.isConnected 
                    ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.15), rgba(0, 230, 118, 0.08))' 
                    : 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(154, 77, 255, 0.1))',
                  border: wallet.isConnected 
                    ? '1px solid rgba(0, 230, 118, 0.3)' 
                    : '1px solid rgba(0, 245, 255, 0.3)',
                  color: wallet.isConnected ? '#00E676' : '#00F5FF',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = wallet.isConnected
                    ? '0 8px 24px rgba(0, 230, 118, 0.2)'
                    : '0 8px 24px rgba(0, 245, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Wallet size={20} />
                <span>{wallet.isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}</span>
                {wallet.isConnected && (
                  <div 
                    className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                    style={{ background: '#00E676' }}
                  />
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 mt-auto border-t" style={{ borderColor: 'rgba(154, 77, 255, 0.15)' }}>
              <div className="text-center">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    background: 'rgba(0, 245, 255, 0.1)',
                    color: '#00F5FF',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00F5FF' }} />
                  Powered by x402
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
