'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, LayoutDashboard, Activity, Users, Zap, Menu, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitor', label: 'Monitor', icon: Activity },
  { href: '/agents', label: 'Agents', icon: Users },
];

export function Navigation() {
  const pathname = usePathname();
  const { wallet, connectWallet, disconnectWallet } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-[#020204]/90 backdrop-blur-xl border-[rgba(255,255,255,0.08)]" 
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div 
                className="w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, #00f0ff, #b829dd)',
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                }}
              >
                <Zap size={20} className="text-black" strokeWidth={2.5} />
              </div>
              {/* Glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff, #b829dd)',
                  filter: 'blur(15px)',
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-wider leading-none">
                <span className="text-white">AGENT</span>
                <span className="text-[#00f0ff]">MESH</span>
              </span>
              <span className="text-[0.6rem] text-[#5a5a6a] tracking-[0.3em] font-mono-alt uppercase">
                v2.0.1-alpha
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 text-sm font-mono font-medium transition-all duration-200",
                    "uppercase tracking-wider",
                    isActive 
                      ? "text-[#00f0ff]" 
                      : "text-[#8a8a9a] hover:text-white"
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{link.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f0ff]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#141419] border border-[rgba(255,255,255,0.06)]">
              <div className="relative flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
                <span className="text-[0.65rem] text-[#8a8a9a] font-mono uppercase tracking-wider">Live</span>
              </div>
            </div>

            {/* Wallet Button */}
            <Button
              onClick={() => wallet.isConnected ? disconnectWallet() : connectWallet()}
              className={cn(
                "hidden sm:flex items-center gap-2 px-5 py-2 text-xs font-mono font-semibold uppercase tracking-wider",
                "transition-all duration-300 border",
                wallet.isConnected 
                  ? "bg-[#39ff14]/10 border-[#39ff14]/30 text-[#39ff14] hover:bg-[#39ff14]/20" 
                  : "bg-transparent border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black"
              )}
            >
              <Wallet size={14} strokeWidth={1.5} />
              <span>{wallet.isConnected ? wallet.address?.slice(0, 6) + '...' + wallet.address?.slice(-4) : 'Connect'}</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#8a8a9a] hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[rgba(255,255,255,0.08)] py-4 bg-[#020204]/95 backdrop-blur-xl">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors",
                      isActive 
                        ? "bg-[#00f0ff]/10 text-[#00f0ff] border-l-2 border-[#00f0ff]" 
                        : "text-[#8a8a9a] hover:text-white hover:bg-[rgba(255,255,255,0.02)]"
                    )}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <Button
                  onClick={() => {
                    wallet.isConnected ? disconnectWallet() : connectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono font-semibold uppercase tracking-wider",
                    wallet.isConnected 
                      ? "bg-[#39ff14]/10 text-[#39ff14]" 
                      : "bg-[#00f0ff] text-black"
                  )}
                >
                  <Wallet size={16} strokeWidth={1.5} />
                  <span>{wallet.isConnected ? 'Disconnect' : 'Connect Wallet'}</span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
