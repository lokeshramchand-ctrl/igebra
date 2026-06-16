'use client';

import { useState } from 'react';
import { Brain, Loader2, Award, CheckCircle2, ChevronRight } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 transition-all font-sans">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            Knowledge Assessment
          </h2>
          <p className="text-sm text-slate-500 mt-1">Generate a dynamic quiz based on your uploaded documents.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all disabled:bg-indigo-300 flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Quiz'
          )}
        </button>
      </div>

      {/* Active Quiz Area */}
      {quiz && !isGraded && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* MCQs */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Multiple Choice</h3>
            {quiz.mcqs.map((q, i) => (
              <div key={`mcq_${i}`} className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-900 mb-4 flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {i + 1}
                  </span>
                  {q.question}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {q.options.map((opt, j) => {
                    const isSelected = answers[`mcq_${i}`] === opt;
                    return (
                      <label 
                        key={j} 
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`mcq_${i}`}
                          value={opt}
                          onChange={(e) => setAnswers({ ...answers, [`mcq_${i}`]: e.target.value })}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600 focus:ring-offset-0"
                        />
                        <span className={`text-sm ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* True / False */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">True or False</h3>
            {quiz.true_false.map((q, i) => (
              <div key={`tf_${i}`} className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-900 mb-4 flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-violet-100 text-violet-700 text-xs font-bold">
                    {quiz.mcqs.length + i + 1}
                  </span>
                  {q.question}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {['True', 'False'].map((opt) => {
                    const isSelected = answers[`tf_${i}`] === opt;
                    return (
                      <label 
                        key={opt} 
                        className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-violet-50 border-violet-500 ring-1 ring-violet-500' 
                            : 'bg-white border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`tf_${i}`}
                          value={opt}
                          onChange={(e) => setAnswers({ ...answers, [`tf_${i}`]: e.target.value })}
                          className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-600"
                        />
                        <span className={`text-sm ${isSelected ? 'text-violet-900 font-bold' : 'text-slate-700 font-medium'}`}>
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={submitQuiz} 
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md flex justify-center items-center gap-2"
          >
            Submit Answers to Grade
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Graded Results Screen */}
      {isGraded && (
        <div className="py-8 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4 shadow-inner">
              <Award className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
              {score} <span className="text-3xl text-slate-400 font-medium">/ 8</span>
            </h3>
            <p className="text-slate-500 font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Score securely saved to your learning profile
            </p>
          </div>
          
          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              Short Answer Reference Guide
            </h4>
            <ul className="space-y-6">
              {quiz?.short_answer.map((q, i) => (
                <li key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <span className="block font-semibold text-slate-900 mb-2 leading-snug">
                    <span className="text-indigo-600 mr-2">Q:</span>{q.question}
                  </span>
                  <span className="block text-slate-600 text-sm leading-relaxed">
                    <span className="text-emerald-600 font-semibold mr-2">A:</span>{q.answer}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}