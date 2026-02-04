'use client';

import { useAgent } from '@/lib/hooks-v2';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Star, Activity, Package, DollarSign, 
  CheckCircle, Clock, AlertCircle, ExternalLink 
} from 'lucide-react';

export default function AgentDetailPage() {
  const params = useParams();
  const name = decodeURIComponent(params.name as string);
  const { data: agent, loading, error } = useAgent(name);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 px-6 lg:px-12 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-white/10 rounded" />
            <div className="glass-card p-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/10 rounded-full" />
                <div className="space-y-3">
                  <div className="h-8 w-48 bg-white/10 rounded" />
                  <div className="h-4 w-32 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !agent) {
    return (
      <main className="min-h-screen pt-24 px-6 lg:px-12 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/agents" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-8">
            <ArrowLeft size={20} />
            Back to Agents
          </Link>
          <div className="glass-card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Agent Not Found</h2>
            <p className="text-text-secondary">{error || 'This agent does not exist'}</p>
          </div>
        </div>
      </main>
    );
  }

  const successRate = agent.total_transactions > 0 
    ? ((agent.successful_transactions / agent.total_transactions) * 100).toFixed(1)
    : '0';

  return (
    <main className="min-h-screen pt-24 px-6 lg:px-12 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <Link href="/agents" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
          <ArrowLeft size={20} />
          Back to Agents
        </Link>

        {/* Profile Header */}
        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center text-2xl font-bold">
              {agent.name.slice(0, 2).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold">{agent.name}</h1>
                <TierBadge tier={agent.reputation_tier} />
              </div>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="font-mono">{agent.address?.slice(0, 10)}...{agent.address?.slice(-8)}</span>
                <span>•</span>
                <span>Joined {new Date(agent.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className={`font-display text-4xl font-bold ${
                agent.aa_score >= 90 ? 'text-accent-gold' :
                agent.aa_score >= 70 ? 'text-accent-teal' :
                'text-white'
              }`}>
                {agent.aa_score.toFixed(1)}
              </div>
              <div className="text-sm text-text-secondary">AAIS Score</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Activity}
            label="Total Transactions"
            value={agent.total_transactions}
          />
          <StatCard
            icon={CheckCircle}
            label="Successful"
            value={agent.successful_transactions}
            color="text-green-400"
          />
          <StatCard
            icon={DollarSign}
            label="Total Earned"
            value={`${(parseInt(agent.total_earned) / 1000000).toFixed(2)} USDC`}
            color="text-accent-teal"
          />
          <StatCard
            icon={Star}
            label="Success Rate"
            value={`${successRate}%`}
            color="text-accent-gold"
          />
        </div>

        {/* Services */}
        <div className="glass-card p-6">
          <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="text-accent-teal" size={20} />
            Active Services ({agent.services?.length || 0})
          </h2>
          
          {!agent.services?.length ? (
            <p className="text-text-secondary text-center py-8">No active services</p>
          ) : (
            <div className="space-y-4">
              {agent.services.map((service) => (
                <div key={service.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{service.title}</h3>
                      <p className="text-sm text-text-secondary mt-1">{service.description}</p>
                      {service.category && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-white/10 rounded text-xs text-text-secondary">
                          {service.category}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-bold text-accent-teal">
                        {(parseInt(service.price) / 1000000).toFixed(2)} USDC
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-accent-purple" size={20} />
            Recent Transactions
          </h2>
          
          {!agent.recent_transactions?.length ? (
            <p className="text-text-secondary text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {agent.recent_transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={tx.status} />
                    <div>
                      <div className="text-sm font-medium">
                        {tx.provider_name === agent.name ? (
                          <>Sold to <span className="text-accent-teal">{tx.consumer_name}</span></>
                        ) : (
                          <>Bought from <span className="text-accent-purple">{tx.provider_name}</span></>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      tx.provider_name === agent.name ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.provider_name === agent.name ? '+' : '-'}
                      {(parseInt(tx.amount) / 1000000).toFixed(2)} USDC
                    </div>
                    {tx.rating && (
                      <div className="text-xs text-accent-gold">{tx.rating} ★</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles = {
    Elite: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30',
    Verified: 'bg-accent-teal/20 text-accent-teal border-accent-teal/30',
    Standard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    New: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
      styles[tier as keyof typeof styles] || styles.New
    }`}>
      {tier === 'Elite' && <Star size={14} className="fill-current" />}
      {tier}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-white',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 text-text-secondary mb-2">
        <Icon size={16} />
        <span className="text-xs">{label}</span>
      </div>
      <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle size={16} className="text-green-400" />;
  if (status === 'pending') return <Clock size={16} className="text-yellow-400" />;
  return <AlertCircle size={16} className="text-red-400" />;
}
