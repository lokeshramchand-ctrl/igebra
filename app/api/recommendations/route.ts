import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. Fetch the latest quiz score
    const { data: quizData } = await supabaseAdmin
      .from('quiz_scores')
      .select('score, total_questions')
      .order('created_at', { ascending: false })
      .limit(1);

    // 2. Fetch the last 5 questions they asked the AI
    const { data: chatData } = await supabaseAdmin
      .from('chat_logs')
      .select('question')
      .order('created_at', { ascending: false })
      .limit(5);

    // 3. Fetch some document context so the AI knows the actual subject matter
    const { data: chunks } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .limit(100);

    const latestScore = quizData?.[0] ? `${quizData[0].score}/${quizData[0].total_questions}` : 'No quiz taken yet';
    const recentQuestions = chatData?.map(c => c.question).join('\n- ') || 'No questions asked yet';
    const documentContext = chunks?.map(c => c.content).join('\n\n') || '';

    // 4. Construct the AI Tutor Prompt
    const prompt = `
      You are an expert AI academic tutor. Analyze the student's recent activity and the document context to suggest 3 specific topics they need to study next.

      Student's Latest Quiz Score: ${latestScore}
      Student's Recent Chat Questions:
      - ${recentQuestions}

      Document Context:
      ${documentContext}

      Identify 3 distinct topics from the document that the student should focus on. For each topic, provide a brief reason why (based on their questions or just general importance if they lack history) and a specific action item.
    `;

    const GENERATE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

    // 5. Force Strict JSON Output
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
              recommendations: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    topic: { type: "STRING" },
                    reason: { type: "STRING" },
                    action_item: { type: "STRING" }
                  },
                  required: ["topic", "reason", "action_item"]
                }
              }
            },
            required: ["recommendations"]
          }
        }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Gemini Recs Error:', errorText);
        throw new Error("Failed to generate recommendations");
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const structuredResponse = JSON.parse(rawText);

    return NextResponse.json(structuredResponse);

  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}