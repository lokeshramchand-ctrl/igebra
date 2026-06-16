import { NextResponse } from 'next/server';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { supabaseAdmin } from '@/lib/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs'; 
const pdf = require("pdf-parse/lib/pdf-parse.js");
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
    
    // FIX: Clean the text of null bytes and weird PDF spacing artifacts
    const cleanText = (pdfData.text || '').replace(/\0/g, '').replace(/\s+/g, ' ').trim();

    if (!cleanText) {
      return NextResponse.json({ error: 'No readable text found in PDF.' }, { status: 400 });
    }

    // 3. Chunk Text using Langchain
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const rawChunks = await textSplitter.createDocuments([cleanText]);

    // FIX: Strictly filter out any chunks that are just empty space
    const chunks = rawChunks.filter((chunk: any) => chunk.pageContent.trim().length > 0);

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No valid text chunks could be generated.' }, { status: 400 });
    }

// 4. Generate Embeddings using the Native Google SDK
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    // 5. Extract and embed content natively
    console.log(`[DEBUG] Sending ${chunks.length} chunks to Google natively...`);
    
    // We use Promise.all to run them concurrently for speed
    const embeddings = await Promise.all(
      chunks.map(async (chunk: any) => {
        try {
          const response = await embeddingModel.embedContent(chunk.pageContent);
          return response.embedding.values; // This is the pure array of numbers
        } catch (err) {
          console.error("Embedding generation failed for a chunk:", err);
          return null; // Our shield in Step 6 will catch and filter this out
        }
      })
    );

    // 6. Build and Validate Records (THE CRITICAL FIX)
    const recordsToInsert = chunks.map((chunk: any, index: number) => {
      const embedding = embeddings[index];
      
      // Ensure the embedding exists, is an array, and actually contains numbers
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        console.warn(`[Warning] Chunk at index ${index} generated an invalid embedding. Skipping.`);
        return null; // Mark as invalid
      }

      return {
        content: chunk.pageContent,
        metadata: { source: file.name, ...chunk.metadata },
        embedding: embedding,
      };
    }).filter((record) => record !== null); // Strip out any invalid records we marked above

    // If EVERY chunk failed, stop here
    if (recordsToInsert.length === 0) {
      return NextResponse.json({ error: 'All generated embeddings were invalid.' }, { status: 500 });
    }

    // 7. Store in Supabase
    const { error } = await supabaseAdmin
      .from('document_chunks')
      .insert(recordsToInsert);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed and stored ${recordsToInsert.length} chunks.` 
    });

  } catch (error) {
    console.error('Processing Error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file.' },
      { status: 500 }
    );
  }
}