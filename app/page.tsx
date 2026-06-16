'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import PdfUploader from './components/PdfUploader';
import ChatInterface from './components/ChatInterface';
import SummaryGenerator from './components/SummaryGenerator';
import QuizGenerator from './components/QuizGenerator';
import LearningDashboard from './components/LearningDashboard';
import StudyRecommendations from './components/StudyRecommendations';
export default function Home() {
  const { data: session, status } = useSession();

  // Show a simple loading state while NextAuth checks the session
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If not logged in, show a beautiful landing page prompting them to log in
  if (!session) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">LearnSphere AI</h1>
          <p className="text-gray-600">Your personalized AI-powered learning environment.</p>
          <button 
            onClick={() => signIn()} 
            className="w-full bg-black text-white font-medium py-4 px-8 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // If logged in, show the full app!
  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 mb-8 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">LearnSphere AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Welcome, {session.user?.name}
          </span>
          <button 
            onClick={() => signOut()}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="max-w-4xl mx-auto space-y-8 px-4">
        <LearningDashboard />
        <StudyRecommendations /> {/* <-- Added here */}
        <PdfUploader />
        <SummaryGenerator />
        <QuizGenerator />
        <ChatInterface />
      </div>
    </main>
  );
}