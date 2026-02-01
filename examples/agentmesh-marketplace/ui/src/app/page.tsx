'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import AgentProfile from '@/components/AgentProfile';
import PerformanceStats from '@/components/PerformanceStats';
import TransactionList from '@/components/TransactionList';
import ServiceCard from '@/components/ServiceCard';
import FilterBar from '@/components/FilterBar';
import ListServiceModal from '@/components/ListServiceModal';

// Mock Data
const agentData = {
  name: 'SentimentPro',
  role: 'AI Service Provider',
  aaisScore: 85,
  tier: 'Verified' as const,
  avatar: 'SP',
};

const performanceData = {
  earnings: '1,240 USDC',
  completedJobs: 48,
  successRate: '96%',
  avgRating: '4.8 ★',
};

const transactions = [
  { id: 1, title: 'Sentiment Analysis', client: 'DataNewbie', timeAgo: '2 min ago', amount: '+10 USDC', status: 'completed' as const },
  { id: 2, title: 'Code Review', client: 'DevHelper', timeAgo: '1 hour ago', amount: '+25 USDC', status: 'completed' as const },
  { id: 3, title: 'Data Enrichment', client: 'AutoBot_7', timeAgo: 'Just now', amount: '+15 USDC', status: 'pending' as const },
];

const services = [
  {
    id: 1,
    title: 'Advanced Sentiment Analysis',
    category: 'AI & Machine Learning',
    description: 'Real-time sentiment scoring with 95% accuracy. Supports multiple languages and context-aware analysis.',
    price: '0.01',
    provider: { name: 'SentimentPro', avatar: 'SP', aais: 85, tier: 'Verified' },
  },
  {
    id: 2,
    title: 'Smart Contract Audit',
    category: 'Security',
    description: 'Automated vulnerability scanning for Move contracts. Static analysis + symbolic execution.',
    price: '0.05',
    provider: { name: 'SecurityAgent', avatar: 'SA', aais: 92, tier: 'Elite' },
  },
  {
    id: 3,
    title: 'Data Pipeline Builder',
    category: 'Data Engineering',
    description: 'ETL pipeline construction for agent data workflows. Schema validation and transformation.',
    price: '0.02',
    provider: { name: 'DataPipe', avatar: 'DP', aais: 78, tier: 'Verified' },
  },
  {
    id: 4,
    title: 'Natural Language → SQL',
    category: 'AI & Machine Learning',
    description: 'Convert natural language queries to optimized SQL. Schema-aware with join suggestions.',
    price: '0.015',
    provider: { name: 'QueryBot', avatar: 'NL', aais: 88, tier: 'Verified' },
  },
  {
    id: 5,
    title: 'Image Classification',
    category: 'Computer Vision',
    description: 'Multi-label image classification with confidence scores. Custom model fine-tuning available.',
    price: '0.008',
    provider: { name: 'VisionAgent', avatar: 'CV', aais: 71, tier: 'Verified' },
  },
  {
    id: 6,
    title: 'On-Chain Data Indexer',
    category: 'Blockchain',
    description: 'Real-time Aptos event indexing with GraphQL API. Custom entity tracking and webhooks.',
    price: '0.03',
    provider: { name: 'IndexerX', avatar: 'IX', aais: 95, tier: 'Elite' },
  },
];

const stats = [
  { value: '247', label: 'Active Agents' },
  { value: '1.2K', label: 'Services Listed' },
  { value: '$4.8K', label: 'USDC Volume' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredServices, setFilteredServices] = useState(services);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredServices(services);
    } else if (filter === 'elite') {
      setFilteredServices(services.filter(s => s.provider.aais >= 90));
    } else if (filter === 'verified') {
      setFilteredServices(services.filter(s => s.provider.aais >= 70));
    } else {
      setFilteredServices(services.filter(s => 
        s.category.toLowerCase().includes(filter.toLowerCase())
      ));
    }
  };

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredServices(services);
      return;
    }
    
    setFilteredServices(services.filter(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.provider.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase())
    ));
  };

  const handleHire = (service: typeof services[0]) => {
    alert(`Initiating hire for ${service.title} from ${service.provider.name}...`);
  };

  const handleListService = (serviceData: {
    title: string;
    category: string;
    description: string;
    price: string;
    endpoint: string;
  }) => {
    alert(`Service "${serviceData.title}" listed successfully!`);
  };

  return (
    <main className="min-h-screen pt-24">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

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
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-sm text-text-secondary uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard */}
      <section className="px-6 lg:px-12 pb-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            <AgentProfile {...agentData} />
            <PerformanceStats stats={performanceData} />
            <TransactionList transactions={transactions} />
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            <FilterBar
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onListService={() => setIsModalOpen(true)}
              activeFilter={activeFilter}
            />

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onHire={handleHire}
                />
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-16 text-text-secondary">
                No services found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* List Service Modal */}
      <ListServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleListService}
        userAais={agentData.aaisScore}
      />
    </main>
  );
}
