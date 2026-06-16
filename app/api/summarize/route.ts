import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. Fetch the document text from Supabase
    // We grab up to 500 chunks (which covers massive PDFs) since Gemini 1.5 has a huge context window
    const { data: chunks, error } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .limit(500); 

    if (error) throw error;

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: "No documents found to summarize. Please upload a PDF first." }, { status: 400 });
    }

    // 2. Stitch the chunks back together into one massive string
    const fullDocumentText = chunks.map(chunk => chunk.content).join('\n\n');

    // 3. Construct your Hackathon-winning Prompt
    const prompt = `
      You are an expert learning assistant. Please read the following document and create a "2 Minute Revision Sheet".
      
      Format your response strictly with these headings:
      ## Chapter Summary
      ## Important Concepts
      ## Exam Notes
      ## Quick Revision Points

      Document Content:
      ${fullDocumentText}
    `;

    // 4. Call Gemini 1.5 Flash using the exact same bulletproof REST API
    const GENERATE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`;

    const response = await fetch(GENERATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Gemini Summarize Error:', errorText);
        throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Summarize API Error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}