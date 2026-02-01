'use client';

import { TrendingUp, DollarSign, CheckCircle, Star, Briefcase } from 'lucide-react';

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
  const hasEarnings = parseFloat(stats.earnings.replace(/[^0-9.]/g, '')) > 0;
  
  const statRows = [
    { 
      label: 'Total Earnings', 
      value: stats.earnings, 
      icon: DollarSign,
      highlight: hasEarnings,
      highlightColor: '#00E676',
    },
    { 
      label: 'Completed Jobs', 
      value: stats.completedJobs.toString(), 
      icon: Briefcase,
      highlight: stats.completedJobs > 0,
      highlightColor: '#00F5FF',
    },
    { 
      label: 'Success Rate', 
      value: stats.successRate, 
      icon: CheckCircle,
      highlight: parseInt(stats.successRate) >= 90,
      highlightColor: '#00F5FF',
    },
    { 
      label: 'Avg Rating', 
      value: stats.avgRating, 
      icon: Star,
      highlight: parseFloat(stats.avgRating) >= 4.5,
      highlightColor: '#FFD700',
    },
  ];

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
        <TrendingUp size={16} style={{ color: '#00F5FF' }} />
        Performance
      </div>
      
      <div className="space-y-2">
        {statRows.map((row, index) => {
          const Icon = row.icon;
          return (
            <div 
              key={index} 
              className="flex justify-between items-center py-2.5 px-3 rounded-xl transition-all"
              style={{ 
                background: row.highlight ? `rgba(${row.highlightColor === '#00E676' ? '0, 230, 118' : row.highlightColor === '#FFD700' ? '255, 215, 0' : '0, 245, 255'}, 0.05)` : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color: row.highlight ? row.highlightColor : '#6b6b7b' }} />
                <span className="text-sm" style={{ color: '#6b6b7b' }}>{row.label}</span>
              </div>
              <span 
                className="font-bold text-sm"
                style={{ 
                  color: row.highlight ? row.highlightColor : '#f0f0f5',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {row.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
