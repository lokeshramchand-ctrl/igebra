import PdfUploader from './components/PdfUploader';
import ChatInterface from './components/ChatInterface';
import SummaryGenerator from './components/SummaryGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Enterprise AI RAG System</h1>
          <p className="text-gray-500 mt-2">Upload, Summarize, and Chat with your data.</p>
        </div>

        {/* Feature 1: Ingestion */}
        <PdfUploader />

        {/* Feature 3: The 1-Click Summary (Placed above chat for better UX) */}
        <SummaryGenerator />

        {/* Feature 2: Deep Dive Search */}
        <ChatInterface />
        
      </div>
    </main>
  );
}