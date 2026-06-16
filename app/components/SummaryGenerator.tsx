'use client';

import { useState } from 'react';

export default function SummaryGenerator() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong generating the summary.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">2-Minute Revision Sheet</h2>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md disabled:bg-purple-300 transition-colors shadow-sm"
        >
          {isLoading ? 'Reading Document...' : 'Generate Summary'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {summary && (
        <div className="mt-6 bg-purple-50 p-6 rounded-md border border-purple-100 prose prose-purple max-w-none">
          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}