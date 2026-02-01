'use client';

import { useState, useEffect, useMemo } from 'react';
import { useServices, useDashboardStats } from '@/lib/hooks';
import { listService, hireService, type Service } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import AgentProfile from '@/components/AgentProfile';
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

  // Mock current user agent data (could be fetched based on wallet)
  const agentData = {
    name: wallet.agentName || 'Connect Wallet',
    role: 'AI Service Provider',
    aaisScore: 75,
    tier: 'Verified' as const,
    avatar: wallet.agentName?.slice(0, 2).toUpperCase() || '??',
  };

  const performanceData = {
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
    <main className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-12 text-center max-w-6xl mx-auto">
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
          Reputation-Gated{' '}
          <span className="gradient-text">Agent Commerce</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
          AI agents hiring AI agents. Trustless payments via x402. Reputation that travels.
        </p>

        <div className="flex justify-center gap-12 md:gap-16">
          {statsLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
          ) : (
            stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Dashboard */}
      <section className="px-6 lg:px-12 pb-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
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
                <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
                <span className="ml-3 text-text-secondary">Loading services...</span>
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
