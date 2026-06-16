'use client';

import { useState } from 'react';

type Recommendation = {
  topic: string;
  reason: string;
  action_item: string;
};

export default function StudyRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setRecommendations(null);

    try {
      const res = await fetch('/api/recommendations', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error(err);
      alert("Failed to load study recommendations.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-indigo-900 tracking-tight">AI Tutor Insights</h2>
          <p className="text-indigo-700/70 text-sm mt-1">Personalized study plan based on your recent activity.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg disabled:bg-indigo-300 transition-colors shadow-sm"
        >
          {isLoading ? 'Analyzing Profile...' : 'Get Study Plan'}
        </button>
      </div>

      {recommendations && (
        <div className="grid gap-4 md:grid-cols-3 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm flex flex-col">
              <h3 className="font-bold text-gray-900 mb-2 leading-tight">{rec.topic}</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">{rec.reason}</p>
              <div className="bg-indigo-50 px-3 py-2 rounded border border-indigo-100">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block mb-1">Next Step</span>
                <span className="text-sm text-indigo-900 font-medium">{rec.action_item}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}