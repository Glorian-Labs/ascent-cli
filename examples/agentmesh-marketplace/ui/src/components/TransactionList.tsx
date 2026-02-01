'use client';

import { Activity, ArrowUpRight } from 'lucide-react';

interface Transaction {
  id: number;
  title: string;
  client: string;
  timeAgo: string;
  amount: string;
  status: 'completed' | 'pending';
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div 
        className="p-4 sm:p-5 rounded-2xl text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 10, 15, 0.8), rgba(5, 5, 8, 0.9))',
          border: '1px solid rgba(154, 77, 255, 0.15)',
        }}
      >
        <Activity size={24} className="mx-auto mb-2" style={{ color: '#6b6b7b' }} />
        <p className="text-sm" style={{ color: '#6b6b7b' }}>No recent activity</p>
      </div>
    );
  }

  return (
    <div 
      className="p-4 sm:p-5 rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, rgba(10, 10, 15, 0.8), rgba(5, 5, 8, 0.9))',
        border: '1px solid rgba(154, 77, 255, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-widest" style={{ color: '#6b6b7b' }}>
        <Activity size={16} style={{ color: '#00F5FF' }} />
        Recent Activity
      </div>
      
      <div className="space-y-2.5">
        {transactions.map((tx) => (
          <div 
            key={tx.id}
            className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            {/* Status Indicator */}
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: tx.status === 'completed' ? '#00E676' : '#FFD700',
                boxShadow: `0 0 8px ${tx.status === 'completed' ? 'rgba(0, 230, 118, 0.5)' : 'rgba(255, 215, 0, 0.5)'}`,
              }}
            />
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{tx.title}</div>
              <div className="text-xs" style={{ color: '#6b6b7b' }}>
                {tx.client} • {tx.timeAgo}
              </div>
            </div>
            
            {/* Amount */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span 
                className="font-bold text-sm"
                style={{ 
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#00E676',
                }}
              >
                {tx.amount}
              </span>
              <ArrowUpRight size={12} style={{ color: '#00E676' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
