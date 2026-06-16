import { NextResponse } from 'next/server';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { supabaseAdmin } from '@/lib/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export const runtime = 'nodejs'; 
const pdf = require("pdf-parse");

export async function POST(request: Request) {
  try {
    // 1. Receive the File
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Extract Text using pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdf(buffer);
    const rawText = pdfData.text || '';

    // 3. Chunk Text using Langchain
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await textSplitter.createDocuments([rawText]);

    // 4. Generate Embeddings using Gemini
    const embeddingsModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004", // Current standard Gemini embedding model
    });

    // Extract raw string content from the chunk documents
    const chunkStrings = chunks.map((chunk: { pageContent: any; }) => chunk.pageContent);
    const embeddings = await embeddingsModel.embedDocuments(chunkStrings);

    // 5. Store in Supabase
    // Combine chunks and embeddings into the format expected by our database
    const recordsToInsert = chunks.map((chunk, index) => ({
      content: chunk.pageContent,
      metadata: { source: file.name, ...chunk.metadata },
      embedding: embeddings[index],
    }));

    const { error } = await supabaseAdmin
      .from('document_chunks')
      .insert(recordsToInsert);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed and stored ${chunks.length} chunks.` 
    });

  } catch (error) {
    console.error('Processing Error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file.' },
      { status: 500 }
    );
  }
}

function pdfParse(buffer: Buffer<ArrayBuffer>) {
  throw new Error('Function not implemented.');
}
