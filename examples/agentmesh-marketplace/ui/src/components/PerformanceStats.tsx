'use client';

import { TrendingUp } from 'lucide-react';

interface Stats {
  earnings: string;
  completedJobs: number;
  successRate: string;
  avgRating: string;
}

interface PerformanceStatsProps {
  stats: Stats;
}

export default function PerformanceStats({ stats }: PerformanceStatsProps) {
  const statRows = [
    { label: 'Total Earnings', value: stats.earnings },
    { label: 'Completed Jobs', value: stats.completedJobs.toString() },
    { label: 'Success Rate', value: stats.successRate },
    { label: 'Avg Rating', value: stats.avgRating },
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary uppercase tracking-wider">
        <TrendingUp size={20} className="text-accent-teal" />
        Performance
      </div>
      
      <div className="space-y-3">
        {statRows.map((row, index) => (
          <div 
            key={index} 
            className="flex justify-between py-3 border-b border-white/5 last:border-0"
          >
            <span className="text-text-secondary text-sm">{row.label}</span>
            <span className="font-semibold">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
