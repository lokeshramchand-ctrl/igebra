import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. Pull data chunks from Supabase
    const { data: chunks, error } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .limit(500); 

    if (error) throw error;
    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: "No documents found." }, { status: 400 });
    }

    const fullDocumentText = chunks.map(chunk => chunk.content).join('\n\n');

    // 2. Strict instruction prompt
    const prompt = `
      You are an expert exam creator. Based ONLY on the document below, generate a quiz.
      
      Requirements:
      - 5 MCQs
      - 3 True/False questions
      - 2 Short Answer questions

      Document Content:
      ${fullDocumentText}
    `;

const GENERATE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

    // 3. Hit the REST endpoint with a strict responseSchema definition
    const response = await fetch(GENERATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              mcqs: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    answer: { type: "STRING" }
                  },
                  required: ["question", "options", "answer"]
                }
              },
              true_false: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    answer: { type: "STRING" }
                  },
                  required: ["question", "answer"]
                }
              },
              short_answer: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    answer: { type: "STRING" }
                  },
                  required: ["question", "answer"]
                }
              }
            },
            required: ["mcqs", "true_false", "short_answer"]
          }
        }
      })
    });

    // 4. X-Ray Debug log if the network layer rejects the structure
    if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Gemini Quiz Error:', errorText);
        throw new Error("Failed to generate quiz due to upstream API error");
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    // Parse the mathematically locked JSON structure
    const quizData = JSON.parse(rawText);

    return NextResponse.json({ quiz: quizData });

  } catch (error) {
    console.error('Quiz API Error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}