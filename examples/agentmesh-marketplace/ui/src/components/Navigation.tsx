'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, LayoutDashboard, Activity, Users, ChevronRight, Zap, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & metrics' },
  { href: '/monitor', label: 'Monitor', icon: Activity, description: 'Real-time activity' },
  { href: '/agents', label: 'Agents', icon: Users, description: 'Browse agents' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { wallet, connectWallet, disconnectWallet } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* Main Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-3'
        }`}
        style={{
          background: scrolled 
            ? 'rgba(5, 5, 8, 0.95)' 
            : 'rgba(5, 5, 8, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled 
            ? '1px solid rgba(154, 77, 255, 0.15)' 
            : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
                  boxShadow: '0 4px 15px rgba(154, 77, 255, 0.3)',
                }}
              >
                <Zap size={18} className="text-black" />
              </div>
              <div className="hidden sm:block">
                <span 
                  className="text-lg font-bold"
                  style={{ fontFamily: 'Syncopate, sans-serif' }}
                >
                  <span className="text-white">Agent</span>
                  <span style={{ color: '#00F5FF' }}>Mesh</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-cyan-400' : ''} />
                    <span>{link.label}</span>
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #9A4DFF, #00F5FF)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Wallet Button - Desktop */}
              <button
                onClick={() => wallet.isConnected ? disconnectWallet() : connectWallet()}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: wallet.isConnected 
                    ? 'rgba(0, 230, 118, 0.1)' 
                    : 'linear-gradient(135deg, rgba(154, 77, 255, 0.2), rgba(0, 245, 255, 0.2))',
                  border: wallet.isConnected 
                    ? '1px solid rgba(0, 230, 118, 0.3)' 
                    : '1px solid rgba(0, 245, 255, 0.3)',
                  color: wallet.isConnected ? '#00E676' : '#00F5FF',
                }}
              >
                <Wallet size={16} />
                <span>{wallet.isConnected ? 'Connected' : 'Connect'}</span>
                {wallet.isConnected && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                style={{
                  background: menuOpen ? 'rgba(154, 77, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                }}
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-4 flex flex-col justify-between">
                  <span 
                    className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${
                      menuOpen ? 'rotate-45 translate-y-[7px]' : ''
                    }`}
                  />
                  <span 
                    className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${
                      menuOpen ? 'opacity-0 scale-0' : ''
                    }`}
                  />
                  <span 
                    className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${
                      menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div 
          className={`absolute top-0 right-0 w-full max-w-xs h-full transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
            borderLeft: '1px solid rgba(154, 77, 255, 0.2)',
          }}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)' }}
              >
                <Zap size={16} className="text-black" />
              </div>
              <span className="font-bold text-white" style={{ fontFamily: 'Syncopate, sans-serif' }}>
                Menu
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
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
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/10 border border-cyan-500/30' 
                      : 'bg-white/[0.02] border border-transparent hover:bg-white/5 hover:border-white/10'
                  }`}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  <div 
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-cyan-500/20' : 'bg-white/5'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-cyan-400' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {link.label}
                    </div>
                    <div className="text-xs text-gray-500">{link.description}</div>
                  </div>
                  <ChevronRight size={16} className={isActive ? 'text-cyan-400' : 'text-gray-600'} />
                </Link>
              );
            })}
          </div>

          {/* Wallet Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button
              onClick={() => {
                wallet.isConnected ? disconnectWallet() : connectWallet();
                setMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-semibold transition-all duration-200"
              style={{
                background: wallet.isConnected 
                  ? 'rgba(0, 230, 118, 0.1)' 
                  : 'linear-gradient(135deg, rgba(154, 77, 255, 0.15), rgba(0, 245, 255, 0.15))',
                border: wallet.isConnected 
                  ? '1px solid rgba(0, 230, 118, 0.3)' 
                  : '1px solid rgba(0, 245, 255, 0.3)',
                color: wallet.isConnected ? '#00E676' : '#00F5FF',
              }}
            >
              <Wallet size={18} />
              <span>{wallet.isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}</span>
              {wallet.isConnected && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </button>
            
            {/* Footer Badge */}
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/5 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Powered by x402
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
