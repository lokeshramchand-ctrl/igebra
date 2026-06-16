'use client';

import { useState } from 'react';
import { Search, Send, Loader2, Bot, Library, ShieldCheck, AlertCircle } from 'lucide-react';

type ChatResponse = {
  answer: string;
  sources: string[];
  confidence: number;
};

export default function ChatInterface() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResponse({
        answer: data.answer,
        sources: data.sources,
        confidence: data.confidence
      });
    } catch (err: any) {
      console.error(err);
      setError("Sorry, I encountered an error while searching the documents.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to color-code the confidence badge with modern UI colors
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 font-sans transition-all">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-500" />
          Enterprise Search
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Ask complex questions. The AI will cite exact sources from your documents.
        </p>
      </div>
      
      {/* Search Input Form */}
      <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g.,  Ask question"
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="bg-indigo-600 text-white font-medium py-3.5 px-8 rounded-xl disabled:bg-indigo-300 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              Ask Database
              <Send className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* AI Response Display */}
      {response && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
            
            {/* Subtle decorative edge */}
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            
            {/* The Answer */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                <Bot className="w-4 h-4 text-indigo-500" />
                AI Analysis
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {response.answer}
              </p>
            </div>

            {/* Meta Info (Sources & Confidence) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pt-5 border-t border-slate-200 gap-6">
              
              {/* Citations */}
              <div className="flex-1">
                <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  <Library className="w-3.5 h-3.5" />
                  Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {response.sources.length > 0 ? (
                    response.sources.map((source, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 hover:border-indigo-200 transition-colors cursor-default">
                        {source}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 italic">No specific sources cited.</span>
                  )}
                </div>
              </div>

              {/* Confidence Score */}
              <div className="sm:text-right flex-shrink-0">
                <h3 className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Confidence
                </h3>
                <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${getConfidenceColor(response.confidence)}`}>
                  {response.confidence}% Match
                </span>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}