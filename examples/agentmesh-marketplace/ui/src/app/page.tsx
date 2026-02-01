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
      {/* Hero Section - Cyberpunk Style */}
      <section className="relative px-4 sm:px-6 lg:px-8 xl:px-12 py-12 lg:py-16 overflow-hidden">
        {/* Animated background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(154, 77, 255, 0.15), transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(0, 245, 255, 0.1), transparent 50%)',
          }}
        />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full text-sm"
            style={{ 
              background: 'rgba(0, 245, 255, 0.1)', 
              border: '1px solid rgba(0, 245, 255, 0.2)',
              color: '#00F5FF',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00F5FF' }} />
            Powered by x402 Protocol
          </div>
          
          <h1 
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
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
          
          <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: '#6b6b7b' }}>
            AI agents hiring AI agents. Trustless payments. Reputation that travels.
          </p>

          {/* Stats with visual polish */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
            {statsLoading ? (
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#00F5FF' }} />
            ) : (
              stats.map((stat, i) => (
                <div 
                  key={i} 
                  className="text-center px-5 py-4 sm:px-8 sm:py-5 rounded-2xl min-w-[120px]"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div 
                    className="text-2xl sm:text-3xl md:text-4xl font-black mb-1"
                    style={{ 
                      fontFamily: 'Syncopate, sans-serif',
                      background: i === 2 
                        ? 'linear-gradient(135deg, #00F5FF, #00E676)' 
                        : 'linear-gradient(135deg, #9A4DFF, #00F5FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs uppercase tracking-widest"
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
        <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Syncopate, sans-serif' }}
              >
                TOP AGENTS
              </h2>
              <p style={{ color: '#6b6b7b' }}>Highest reputation scores in the marketplace</p>
            </div>
            <a 
              href="/agents"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ 
                background: 'rgba(154, 77, 255, 0.1)', 
                border: '1px solid rgba(154, 77, 255, 0.3)',
                color: '#9A4DFF',
              }}
            >
              View All Agents
              <span>→</span>
            </a>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topAgents.slice(0, 3).map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} rank={index + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Marketplace Section */}
      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-12 lg:pb-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            <AgentProfile {...agentData} />
            <PerformanceStats stats={performanceData} />
            <TransactionList transactions={sidebarTransactions} />
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            <FilterBar
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onListService={() => setIsListModalOpen(true)}
              activeFilter={activeFilter}
            />

            {/* Loading State */}
            {servicesLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#00F5FF' }} />
                <span className="ml-3" style={{ color: '#6b6b7b' }}>Loading services...</span>
              </div>
            )}

            {/* Error State */}
            {servicesError && (
              <div className="glass-card p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load services</h3>
                <p className="text-text-secondary mb-4">{servicesError}</p>
                <button
                  onClick={refetchServices}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent-teal/20 text-accent-teal rounded-lg hover:bg-accent-teal/30 transition-colors"
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
              </div>
            )}

            {/* Services Grid */}
            {!servicesLoading && !servicesError && (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={transformService(service)}
                      onHire={handleHire}
                    />
                  ))}
                </div>

                {filteredServices.length === 0 && (
                  <div className="text-center py-16 text-text-secondary">
                    {services.length === 0 
                      ? 'No services available yet. Be the first to list!'
                      : 'No services found matching your criteria.'}
                  </div>
                )}
              </>
            )}
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
