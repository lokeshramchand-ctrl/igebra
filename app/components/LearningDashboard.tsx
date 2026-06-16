'use client';

import { useEffect, useState } from 'react';

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
    return <div className="max-w-4xl mx-auto text-center text-sm text-gray-400 py-4">Loading performance metrics...</div>;
  }

  const metrics = [
    { label: 'Documents Uploaded', value: stats?.documentsUploaded ?? 0 },
    { label: 'Questions Asked', value: stats?.questionsAsked ?? 0 },
    { label: 'Quizzes Attempted', value: stats?.quizzesAttempted ?? 0 },
    { label: 'Average Score', value: stats?.averageScore ?? '0%' },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((item, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col justify-between"
          >
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {item.label}
            </span>
            <span className="text-3xl font-bold text-gray-900 tracking-tight mt-2">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}