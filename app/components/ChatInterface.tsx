'use client';

import { useState } from 'react';

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

  // Helper to color-code the confidence badge
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Enterprise Search</h2>
      
      <form onSubmit={handleAsk} className="flex gap-3 mb-8">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What is the primary architecture of the Velar Project?"
          className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="bg-black text-white font-medium py-4 px-8 rounded-lg disabled:bg-gray-300 hover:bg-gray-800 transition-colors"
        >
          {isLoading ? 'Searching...' : 'Ask Database'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {response && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            
            {/* The Answer */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">AI Analysis</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {response.answer}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 gap-4">
              {/* Citations */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {response.sources.length > 0 ? (
                    response.sources.map((source, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full shadow-sm">
                        {source}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No specific sources cited.</span>
                  )}
                </div>
              </div>

              {/* Confidence Score */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:text-right">Confidence</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getConfidenceColor(response.confidence)}`}>
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