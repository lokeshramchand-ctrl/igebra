'use client';

import { useState } from 'react';

export default function ChatInterface() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer(''); // Clear previous answer

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setAnswer(data.answer);
    } catch (error) {
      console.error(error);
      setAnswer("Sorry, I encountered an error while searching the documents.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Ask the Document AI</h2>
      
      <form onSubmit={handleAsk} className="flex gap-2 mb-6">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What are the key takeaways from the PDF?"
          className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="bg-blue-600 text-white font-medium py-3 px-6 rounded-md disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? 'Searching...' : 'Ask'}
        </button>
      </form>

      {answer && (
        <div className="bg-gray-50 p-6 rounded-md border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">AI Response</h3>
          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}