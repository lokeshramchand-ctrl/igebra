import PdfUploader from './components/PdfUploader';
import ChatInterface from './components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Enterprise AI RAG System</h1>
          <p className="text-gray-500 mt-2">Upload a document and immediately chat with it.</p>
        </div>

        {/* Feature 1 */}
        <PdfUploader />

        {/* Feature 2 */}
        <ChatInterface />
        
      </div>
    </main>
  );
}