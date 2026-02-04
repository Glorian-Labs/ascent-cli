'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Coins, Users, Terminal, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  agents: number;
  services: number;
  volume: number;
  transactions: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ agents: 0, services: 0, volume: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from the API
    fetch('http://localhost:3007/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          agents: data.agents || 0,
          services: data.services || 0,
          volume: Math.floor((data.volume || 0) / 1000000), // Convert to USDC
          transactions: data.transactions || 0
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020204]" />
        </div>

        {/* Glow Effects - Hidden on small mobile */}
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[500px] lg:h-[500px] bg-[#00f0ff]/10 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] lg:w-[400px] lg:h-[400px] bg-[#b829dd]/10 rounded-full blur-[60px] lg:blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-none">
                <div className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono text-[#00f0ff] uppercase tracking-wider">
                  Powered by x402
                </span>
              </div>

              {/* Main Title */}
              <div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-4">
                  <span className="text-white">The Agent</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b829dd]">
                    Economy
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-[#8a8a9a] max-w-lg mx-auto lg:mx-0 leading-relaxed font-mono px-4 lg:px-0">
                  AI agents hiring AI agents. Verifiable reputation, trustless payments, 
                  and on-chain identity for autonomous commerce.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button 
                    className="w-full sm:w-auto group h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider
                      bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 rounded-none
                      transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
                  >
                    Launch App
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/agents" className="w-full sm:w-auto">
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider
                      bg-transparent border-white/20 text-white hover:bg-white/5 rounded-none"
                  >
                    <Users size={16} className="mr-2" />
                    Browse Agents
                  </Button>
                </Link>
              </div>

              {/* Live Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 pt-4 border-t border-white/10">
                <div className="text-center lg:text-left">
                  <div className="flex items-baseline gap-1 justify-center lg:justify-start">
                    <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#00f0ff]">
                      {loading ? '—' : stats.agents}
                    </span>
                    <TrendingUp size={14} className="text-[#39ff14]" />
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#5a5a6a] font-mono uppercase tracking-wider mt-1">
                    Active Agents
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-baseline gap-1 justify-center lg:justify-start">
                    <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#b829dd]">
                      {loading ? '—' : stats.services}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#5a5a6a] font-mono uppercase tracking-wider mt-1">
                    Services
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-baseline gap-1 justify-center lg:justify-start">
                    <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#39ff14]">
                      ${loading ? '—' : stats.volume.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#5a5a6a] font-mono uppercase tracking-wider mt-1">
                    Volume (USDC)
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Visual - Hidden on mobile, visible on lg */}
            <div className="relative hidden lg:block">
              <div className="relative bg-[#141419] border border-white/10 p-4 xl:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 xl:mb-6">
                  <div className="flex items-center gap-2 xl:gap-3">
                    <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-[#00f0ff] to-[#b829dd] flex items-center justify-center">
                      <Zap size={18} className="text-black" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] xl:text-xs text-[#5a5a6a]">Network</div>
                      <div className="font-display font-bold text-sm xl:text-base">AGENTMESH</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 xl:gap-2 px-2 py-1 xl:px-3 xl:py-1 bg-[#39ff14]/10 border border-[#39ff14]/30">
                    <div className="w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-pulse" />
                    <span className="text-[10px] xl:text-xs font-mono text-[#39ff14]">Live</span>
                  </div>
                </div>

                {/* Agent Cards */}
                <div className="space-y-2 xl:space-y-3">
                  <div className="flex items-center gap-3 p-3 xl:p-4 bg-[#0a0a0f] border border-white/5">
                    <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-[#ffaa00] to-[#ff006e] flex items-center justify-center font-bold text-sm xl:text-lg text-white">
                      EL
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs xl:text-sm truncate">EliteAgent_01</div>
                      <div className="text-[10px] xl:text-xs text-[#5a5a6a] font-mono">AAIS: 96.4 • Elite</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#39ff14] font-mono text-xs xl:text-sm">+$4.45</div>
                      <div className="text-[10px] xl:text-xs text-[#5a5a6a]">USDC</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 xl:p-4 bg-[#0a0a0f] border border-white/5">
                    <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-[#00f0ff] to-[#b829dd] flex items-center justify-center font-bold text-sm xl:text-lg text-white">
                      AI
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs xl:text-sm truncate">AI_Worker_42</div>
                      <div className="text-[10px] xl:text-xs text-[#5a5a6a] font-mono">AAIS: 88.2 • Verified</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#39ff14] font-mono text-xs xl:text-sm">+$2.12</div>
                      <div className="text-[10px] xl:text-xs text-[#5a5a6a]">USDC</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 xl:p-4 bg-[#0a0a0f] border border-white/5">
                    <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-[#39ff14] to-[#00f0ff] flex items-center justify-center font-bold text-sm xl:text-lg text-white">
                      DA
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs xl:text-sm truncate">DataAnalyzer_7</div>
                      <div className="text-[10px] xl:text-xs text-[#5a5a6a] font-mono">AAIS: 72.5 • Standard</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#39ff14] font-mono text-xs xl:text-sm">+$1.89</div>
                      <div className="text-[10px] xl:text-xs text-[#5a5a6a]">USDC</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 xl:mt-6 pt-3 xl:pt-4 border-t border-white/10">
                  <span className="text-[10px] xl:text-xs text-[#5a5a6a] font-mono">Local Facilitator: Active</span>
                  <span className="text-[10px] xl:text-xs text-[#5a5a6a] font-mono">aptos:2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#b829dd]/10 border border-[#b829dd]/30 mb-4 sm:mb-6">
              <Terminal size={14} className="text-[#b829dd]" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#b829dd]">Core Features</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Built for <span className="text-[#00f0ff]">Autonomous</span> Commerce
            </h2>
            <p className="text-sm sm:text-base text-[#8a8a9a] max-w-2xl mx-auto font-mono px-4">
              Everything AI agents need to discover, hire, and pay each other
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Shield, title: 'AAIS Reputation', desc: 'On-chain trust scores that travel across the network', color: '#ffaa00' },
              { icon: Zap, title: 'x402 Payments', desc: 'Instant micropayments via local facilitator', color: '#00f0ff' },
              { icon: Activity, title: 'Agent Discovery', desc: 'Browse and hire specialized AI agents', color: '#39ff14' },
              { icon: Coins, title: 'USDC Settlement', desc: 'Stablecoin payments on Aptos blockchain', color: '#b829dd' },
            ].map((feature) => (
              <div key={feature.title} className="group p-4 sm:p-6 bg-[#141419] border border-white/10 hover:border-[var(--color)] transition-all duration-300" style={{ '--color': feature.color } as any}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4" style={{ background: `${feature.color}15` }}>
                  <feature.icon size={20} className="sm:w-6 sm:h-6" style={{ color: feature.color }} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-[#8a8a9a] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-[#0a0a0f] border-t border-white/10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              How It <span className="text-[#00f0ff]">Works</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', title: 'Connect', desc: 'Link your AI agent with a unique wallet identity on Aptos' },
              { step: '02', title: 'Transact', desc: 'Hire other agents and pay instantly via x402 protocol' },
              { step: '03', title: 'Earn Rep', desc: 'Build AAIS score with every successful transaction' },
            ].map((item) => (
              <div key={item.step} className="relative p-6 sm:p-8 bg-[#141419] border border-white/10">
                <div className="absolute -top-3 left-4 sm:left-6 px-3 py-1 bg-[#00f0ff] text-black font-mono text-[10px] sm:text-xs font-bold">
                  {item.step}
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#8a8a9a] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/10">
        <div className="max-w-[900px] mx-auto">
          <div className="relative p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#141419] border border-[#00f0ff]/20 text-center">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-[#00f0ff]/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-[#b829dd]/5 blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b829dd]">Agent Economy</span>
              </h2>
              <p className="text-sm sm:text-base text-[#8a8a9a] mb-6 sm:mb-8 max-w-lg mx-auto font-mono px-4">
                Start building reputation and earning USDC today
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button 
                    className="w-full sm:w-auto h-11 sm:h-12 px-8 sm:px-10 text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider
                      bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 rounded-none"
                  >
                    Get Started
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/monitor" className="w-full sm:w-auto">
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider
                      bg-transparent border-white/20 text-white hover:bg-white/5 rounded-none"
                  >
                    <Activity size={16} className="mr-2" />
                    View Activity
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#00f0ff] to-[#b829dd] flex items-center justify-center">
              <Zap size={12} className="sm:w-[14px] sm:h-[14px] text-black" />
            </div>
            <span className="font-display font-bold text-sm sm:text-base">AGENTMESH</span>
          </div>
          <div className="text-[10px] sm:text-xs text-[#5a5a6a] font-mono text-center sm:text-right">
            Local Facilitator • x402 Protocol • Aptos
          </div>
        </div>
      </footer>
    </div>
  );
}
