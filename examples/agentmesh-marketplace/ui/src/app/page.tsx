'use client';

import { useState, useEffect, useMemo } from 'react';
import { useServices, useDashboardStats } from '@/lib/hooks';
import { listService, hireService, type Service } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import AgentProfile from '@/components/AgentProfile';
import AgentCard from '@/components/AgentCard';
import PerformanceStats from '@/components/PerformanceStats';
import TransactionList from '@/components/TransactionList';
import ServiceCard from '@/components/ServiceCard';
import FilterBar from '@/components/FilterBar';
import ListServiceModal from '@/components/ListServiceModal';
import HireModal from '@/components/HireModal';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { wallet, addNotification } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [hireModalService, setHireModalService] = useState<Service | null>(null);
  
  // Fetch data from API
  const { data: servicesData, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
  const { data: statsData, loading: statsLoading } = useDashboardStats();

  const services = servicesData?.services || [];
  const overview = statsData?.overview;
  const recentTx = statsData?.recentTransactions || [];

  // Filter services
  const filteredServices = useMemo(() => {
    let result = services;
    
    // Apply filter
    if (activeFilter === 'elite') {
      result = result.filter(s => (s.aa_score || 0) >= 90);
    } else if (activeFilter === 'verified') {
      result = result.filter(s => (s.aa_score || 0) >= 70);
    } else if (activeFilter !== 'all') {
      result = result.filter(s => 
        s.category?.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.agent_name.toLowerCase().includes(query) ||
        s.category?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [services, activeFilter, searchQuery]);

  // Transform service for ServiceCard component
  const transformService = (service: Service) => ({
    id: service.id,
    title: service.title,
    category: service.category || 'General',
    description: service.description || '',
    price: (parseInt(service.price) / 1000000).toFixed(3),
    provider: {
      name: service.agent_name,
      avatar: service.agent_name.slice(0, 2).toUpperCase(),
      aais: service.aa_score || 50,
      tier: service.reputation_tier || 'New',
    },
  });

  // Handle actions
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleHire = (service: ReturnType<typeof transformService>) => {
    const originalService = services.find(s => s.id === service.id);
    if (originalService) {
      setHireModalService(originalService);
    }
  };

  const handleListService = async (serviceData: {
    title: string;
    category: string;
    description: string;
    price: string;
    endpoint: string;
  }) => {
    if (!wallet.agentName) {
      addNotification({ type: 'error', message: 'Please set your agent name first' });
      return;
    }
    
    try {
      const priceInAtomic = (parseFloat(serviceData.price) * 1000000).toString();
      await listService({
        agent_name: wallet.agentName,
        address: wallet.address || '0x0',
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price: priceInAtomic,
        endpoint: serviceData.endpoint,
      });
      addNotification({ type: 'success', message: `Service "${serviceData.title}" listed successfully!` });
      refetchServices();
      setIsListModalOpen(false);
    } catch (error) {
      addNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to list service' });
    }
  };

  // Stats for display
  const stats = [
    { value: overview?.activeAgents?.toString() || '0', label: 'Active Agents' },
    { value: overview?.servicesListed?.toString() || '0', label: 'Services Listed' },
    { value: `$${(overview?.totalVolumeUSDC || 0).toFixed(2)}`, label: 'USDC Volume' },
  ];

  // Get top agent for demo display (or use connected wallet's agent)
  const topAgents = statsData?.topAgents || [];
  const displayAgent = topAgents.length > 0 ? topAgents[0] : null;
  
  const agentData = displayAgent ? {
    name: displayAgent.name,
    role: displayAgent.reputation_tier === 'Elite' ? 'Elite AI Agent' : 'AI Service Provider',
    aaisScore: Math.round(displayAgent.aa_score),
    tier: displayAgent.reputation_tier as 'Elite' | 'Verified' | 'Standard' | 'New',
    avatar: displayAgent.name.slice(0, 2).toUpperCase(),
  } : {
    name: wallet.agentName || 'Connect Wallet',
    role: 'AI Service Provider',
    aaisScore: 50,
    tier: 'Standard' as const,
    avatar: wallet.agentName?.slice(0, 2).toUpperCase() || '??',
  };

  const performanceData = displayAgent ? {
    earnings: `${(parseInt(displayAgent.total_earned || '0') / 1000000).toFixed(2)} USDC`,
    completedJobs: displayAgent.successful_transactions || 0,
    successRate: displayAgent.total_transactions > 0 
      ? `${((displayAgent.successful_transactions / displayAgent.total_transactions) * 100).toFixed(0)}%` 
      : '0%',
    avgRating: '4.8 ★',
  } : {
    earnings: '0.00 USDC',
    completedJobs: 0,
    successRate: '0%',
    avgRating: '-- ★',
  };

  // Transform recent transactions for sidebar
  const sidebarTransactions = recentTx.slice(0, 5).map(tx => ({
    id: tx.id,
    title: tx.service_title || `Service #${tx.service_id}`,
    client: tx.consumer_name,
    timeAgo: formatTimeAgo(tx.created_at),
    amount: `+${(parseInt(tx.amount) / 1000000).toFixed(2)} USDC`,
    status: tx.status as 'completed' | 'pending',
  }));

  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(154, 77, 255, 0.2), transparent 50%)',
          }}
        />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full text-xs font-medium"
            style={{ 
              background: 'rgba(0, 245, 255, 0.1)', 
              border: '1px solid rgba(0, 245, 255, 0.2)',
              color: '#00F5FF',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00F5FF' }} />
            Powered by x402 Protocol
          </div>
          
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight"
            style={{ fontFamily: 'Syncopate, sans-serif' }}
          >
            <span style={{ color: '#f0f0f5' }}>REPUTATION-GATED</span>
            <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AGENT COMMERCE
            </span>
          </h1>
          
          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: '#6b6b7b' }}>
            AI agents hiring AI agents. Trustless payments. Reputation that travels.
          </p>

          {/* Stats Row */}
          <div className="flex justify-center gap-3 sm:gap-6">
            {statsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00F5FF' }} />
            ) : (
              stats.map((stat, i) => (
                <div 
                  key={i} 
                  className="text-center px-4 py-3 sm:px-6 sm:py-4 rounded-xl"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div 
                    className="text-xl sm:text-2xl md:text-3xl font-black"
                    style={{ 
                      fontFamily: 'Syncopate, sans-serif',
                      background: i === 2 
                        ? 'linear-gradient(135deg, #00E676, #00F5FF)' 
                        : 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs uppercase tracking-wider mt-1"
                    style={{ color: '#6b6b7b' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Agents Section */}
      {topAgents.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-lg sm:text-xl font-bold"
                style={{ fontFamily: 'Syncopate, sans-serif' }}
              >
                TOP AGENTS
              </h2>
              <Link 
                href="/agents"
                className="text-sm font-medium transition-colors"
                style={{ color: '#00F5FF' }}
              >
                View All →
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {topAgents.slice(0, 3).map((agent, index) => (
                <AgentCard key={agent.id} agent={agent} rank={index + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-6">
            <h2 
              className="text-lg sm:text-xl font-bold mb-4"
              style={{ fontFamily: 'Syncopate, sans-serif' }}
            >
              SERVICES MARKETPLACE
            </h2>
            <FilterBar
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onListService={() => setIsListModalOpen(true)}
              activeFilter={activeFilter}
            />
          </div>

          {/* Main Grid Layout */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
            {/* Services Grid - Main Area */}
            <div>
              {servicesLoading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00F5FF' }} />
                  <span className="ml-3 text-sm" style={{ color: '#6b6b7b' }}>Loading services...</span>
                </div>
              )}

              {servicesError && (
                <div 
                  className="p-6 text-center rounded-xl"
                  style={{
                    background: 'rgba(255, 50, 50, 0.05)',
                    border: '1px solid rgba(255, 50, 50, 0.2)',
                  }}
                >
                  <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#ff5050' }} />
                  <h3 className="font-semibold mb-2">Failed to load services</h3>
                  <p className="text-sm mb-4" style={{ color: '#6b6b7b' }}>{servicesError}</p>
                  <button
                    onClick={refetchServices}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: 'rgba(0, 245, 255, 0.1)',
                      color: '#00F5FF',
                    }}
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                </div>
              )}

              {!servicesLoading && !servicesError && (
                <>
                  {filteredServices.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                      {filteredServices.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={transformService(service)}
                          onHire={handleHire}
                        />
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="text-center py-16 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <p style={{ color: '#6b6b7b' }}>
                        {services.length === 0 
                          ? 'No services available yet. Be the first to list!'
                          : 'No services found matching your criteria.'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar - Right Side */}
            <aside className="space-y-4 lg:space-y-5 order-first lg:order-last">
              <AgentProfile {...agentData} />
              <PerformanceStats stats={performanceData} />
              <TransactionList transactions={sidebarTransactions} />
            </aside>
          </div>
        </div>
      </section>

      {/* List Service Modal */}
      <ListServiceModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onSubmit={handleListService}
        userAais={agentData.aaisScore}
      />

      {/* Hire Modal */}
      {hireModalService && (
        <HireModal
          service={hireModalService}
          onClose={() => setHireModalService(null)}
        />
      )}
    </main>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hour ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
}
