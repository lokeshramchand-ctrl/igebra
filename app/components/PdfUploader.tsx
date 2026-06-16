'use client';

import { useState } from 'react';

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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Document</h2>
      
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 mb-4
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100 cursor-pointer"
      />

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'uploading' ? 'Processing & Embedding...' : 'Upload & Process'}
      </button>

      {status === 'success' && (
        <p className="mt-4 text-sm text-green-600 text-center">Successfully uploaded and processed!</p>
      )}
      {status === 'error' && (
        <p className="mt-4 text-sm text-red-600 text-center">Error processing the document.</p>
      )}
    </div>
  );
}