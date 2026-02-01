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
    <nav className="fixed top-0 left-0 right-0 px-6 lg:px-12 py-5 flex justify-between items-center bg-background/80 backdrop-blur-xl border-b border-border-subtle z-50">
      <Link href="/" className="font-display text-xl font-bold gradient-text tracking-wider">
        Agent<span className="font-light opacity-70">Mesh</span>
      </Link>

      <div className="flex gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive ? 'text-[#00F5FF]' : 'text-[#6b6b7b] hover:text-white'
              }`}
            >
              <Icon size={16} />
              {link.label}
              {isActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#9A4DFF] to-[#00F5FF]" />
              )}
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => wallet.isConnected ? disconnectWallet() : connectWallet()}
        className="flex items-center gap-2 px-5 py-2.5 btn-primary rounded-full text-sm font-semibold"
      >
        <Wallet size={16} />
        {wallet.isConnected ? wallet.address : 'Connect Wallet'}
      </button>
    </nav>
  );
}
