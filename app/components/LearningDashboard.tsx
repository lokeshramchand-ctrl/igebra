'use client';

import { useEffect, useState } from 'react';
import { FileText, MessageSquare, Target, Trophy, Loader2 } from 'lucide-react';

type Stats = {
  documentsUploaded: number;
  questionsAsked: number;
  quizzesAttempted: number;
  averageScore: string;
};

export default function LearningDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading your learning metrics...</p>
      </div>
    );
  }

  const metrics = [
    { 
      label: 'Documents Uploaded', 
      value: stats?.documentsUploaded ?? 0,
      icon: FileText,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50'
    },
    { 
      label: 'Questions Asked', 
      value: stats?.questionsAsked ?? 0,
      icon: MessageSquare,
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50'
    },
    { 
      label: 'Quizzes Attempted', 
      value: stats?.quizzesAttempted ?? 0,
      icon: Target,
      colorClass: 'text-violet-600',
      bgClass: 'bg-violet-50'
    },
    { 
      label: 'Average Score', 
      value: stats?.averageScore ?? '0%',
      icon: Trophy,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50'
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Learning Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">Track your engagement and performance across all study materials.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index} 
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${item.bgClass} transition-colors`}>
                  <Icon className={`w-5 h-5 ${item.colorClass}`} />
                </div>
              </div>
              
              <div>
                <span className="block text-3xl font-bold text-slate-900 tracking-tight mb-1">
                  {item.value}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}