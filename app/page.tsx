import PdfUploader from './components/PdfUploader';
import ChatInterface from './components/ChatInterface';
import SummaryGenerator from './components/SummaryGenerator';
import QuizGenerator from './components/QuizGenerator';
import LearningDashboard from './components/LearningDashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Main Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enterprise AI RAG System</h1>
          <p className="text-sm text-gray-500 mt-2">Track, analyze, and optimize your institutional workflows.</p>
        </div>

        {/* Feature 5: The Learning Dashboard Panel */}
        <LearningDashboard />

        {/* Core Utilities */}
        <PdfUploader />
        <SummaryGenerator />
        <QuizGenerator />
        <ChatInterface />
        
      </div>
    </main>
  );
}