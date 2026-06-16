'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Target, ArrowRight, BookOpen } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 font-sans transition-all">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            AI Tutor Insights
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Get a personalized study plan based on your recent quizzes and questions.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl disabled:bg-indigo-300 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Profile...
            </>
          ) : (
            'Generate Study Plan'
          )}
        </button>
      </div>

      {/* Recommendations Grid */}
      {recommendations && (
        <div className="grid gap-4 md:grid-cols-3 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col hover:border-indigo-200 transition-colors group"
            >
              {/* Topic Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 leading-tight pt-1">
                  {rec.topic}
                </h3>
              </div>
              
              {/* Reason */}
              <p className="text-sm text-slate-600 mb-6 flex-1 leading-relaxed">
                {rec.reason}
              </p>
              
              {/* Action Item Box */}
              <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm relative overflow-hidden">
                {/* Subtle decorative background accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                
                <div className="flex items-center gap-2 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Next Step
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium flex items-start gap-2">
                  <span className="flex-1">{rec.action_item}</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0 group-hover:text-indigo-600 transition-colors group-hover:translate-x-1" />
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}