'use client';

import { Activity } from 'lucide-react';

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
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary uppercase tracking-wider">
        <Activity size={20} className="text-accent-teal" />
        Recent Activity
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div 
            key={tx.id}
            className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-transparent hover:border-border-subtle hover:bg-white/[0.04] transition-all"
          >
            <div 
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                tx.status === 'completed' 
                  ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' 
                  : 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
              }`} 
            />
            
            <div className="flex-1">
              <div className="font-semibold text-sm">{tx.title}</div>
              <div className="text-xs text-text-secondary">
                {tx.client} • {tx.timeAgo}
              </div>
            </div>
            
            <div className="font-display font-bold text-accent-teal">
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
