'use client';

import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 transition-all">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Knowledge Ingestion</h2>
        <p className="text-sm text-slate-500 mt-1">Upload your course PDFs to build your personalized AI brain.</p>
      </div>
      
      {/* Custom Dropzone Area */}
      <div className="mb-6">
        <label 
          htmlFor="file-upload" 
          className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            file 
              ? 'border-indigo-400 bg-indigo-50/50' 
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            {file ? (
              <>
                <FileText className="w-10 h-10 text-indigo-500 mb-3" />
                <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                <p className="mb-2 text-sm text-slate-600">
                  <span className="font-semibold text-indigo-600">Click to browse</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">PDF documents only (Max 10MB)</p>
              </>
            )}
          </div>
          <input 
            id="file-upload" 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={status === 'uploading'}
          />
        </label>
      </div>

      {/* Action Button */}
      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="w-full bg-slate-900 text-white font-medium py-3 px-4 rounded-xl disabled:bg-slate-100 disabled:text-slate-400 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing & Embedding...
          </>
        ) : (
          'Upload & Process Document'
        )}
      </button>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-medium border border-emerald-100 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          Document successfully embedded into the vector database!
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm font-medium border border-red-100 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          Failed to process the document. Please try again.
        </div>
      )}
    </div>
  );
}