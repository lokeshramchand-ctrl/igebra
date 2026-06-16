'use client';

import { useState } from 'react';

type QuizData = {
  mcqs: { question: string; options: string[]; answer: string }[];
  true_false: { question: string; answer: string }[];
  short_answer: { question: string; answer: string }[];
};

export default function QuizGenerator() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerate = async () => {
    setIsLoading(true);
    setQuiz(null);
    setIsGraded(false);
    setAnswers({});
    
    try {
      const res = await fetch('/api/quiz', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuiz(data.quiz);
    } catch (err) {
      console.error(err);
      alert('Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    let currentScore = 0;

    // Grade MCQs
    quiz.mcqs.forEach((q, i) => {
      if (answers[`mcq_${i}`] === q.answer) currentScore++;
    });

    // Grade T/F
    quiz.true_false.forEach((q, i) => {
      if (answers[`tf_${i}`] === q.answer) currentScore++;
    });

    // Short answers are self-graded for this hackathon version, so total auto-graded is 8
    setScore(currentScore);
    setIsGraded(true);

    // Save to DB
    await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: currentScore, total_questions: 8 }),
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100 font-sans">
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Knowledge Check</h2>
          <p className="text-gray-500 text-sm mt-1">Test your retention of the uploaded material.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all disabled:bg-gray-300"
        >
          {isLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>

      {quiz && !isGraded && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* MCQs */}
          <div className="space-y-6">
            {quiz.mcqs.map((q, i) => (
              <div key={`mcq_${i}`} className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-800 mb-4">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, j) => (
                    <label key={j} className="flex items-center space-x-3 p-3 rounded bg-white border border-gray-200 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        name={`mcq_${i}`}
                        value={opt}
                        onChange={(e) => setAnswers({ ...answers, [`mcq_${i}`]: e.target.value })}
                        className="text-black focus:ring-black"
                      />
                      <span className="text-gray-700 text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* True / False */}
          <div className="space-y-6">
            {quiz.true_false.map((q, i) => (
              <div key={`tf_${i}`} className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-800 mb-4">{quiz.mcqs.length + i + 1}. {q.question}</p>
                <div className="flex space-x-4">
                  {['True', 'False'].map((opt) => (
                    <label key={opt} className="flex-1 flex items-center justify-center space-x-2 p-3 rounded bg-white border border-gray-200 cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        name={`tf_${i}`}
                        value={opt}
                        onChange={(e) => setAnswers({ ...answers, [`tf_${i}`]: e.target.value })}
                        className="text-black focus:ring-black"
                      />
                      <span className="text-gray-700 text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={submitQuiz} className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Submit Answers
          </button>
        </div>
      )}

      {isGraded && (
        <div className="text-center py-12 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{score} / 8</h3>
          <p className="text-gray-500 mb-8">Your score has been securely saved to the database.</p>
          
          <div className="text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Short Answer Reference Guide</h4>
            <ul className="space-y-4">
              {quiz?.short_answer.map((q, i) => (
                <li key={i} className="text-sm">
                  <span className="block font-semibold text-gray-800 mb-1">Q: {q.question}</span>
                  <span className="block text-gray-600">A: {q.answer}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}