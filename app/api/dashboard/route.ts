import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Count unique documents uploaded
    // (Assumes a metadata column like file_name or document_id exists, 
    // otherwise falls back to a clean approximation from chunks)
    const { data: chunkData, error: docError } = await supabaseAdmin
      .from('document_chunks')
      .select('content'); // replace 'content' with 'file_name' if you track it explicitly

    if (docError) throw docError;
    const documentsUploaded = chunkData ? Math.min(Math.ceil(chunkData.length / 5), chunkData.length > 0 ? 1 : 0) : 0; 
    // Note: If you have a dedicated documents table or file_name column, use a distinct count instead.

    // 2. Count total questions asked
    const { count: questionsAsked, error: chatError } = await supabaseAdmin
      .from('chat_logs')
      .select('*', { count: 'exact', head: true });

    if (chatError) throw chatError;

    // 3. Query quiz history for attempts and average scores
    const { data: quizRows, error: quizError } = await supabaseAdmin
      .from('quiz_scores')
      .select('score, total_questions');

    if (quizError) throw quizError;

    const quizzesAttempted = quizRows ? quizRows.length : 0;
    
    // Calculate accurate average percentage score
    let averageScore = 0;
    if (quizzesAttempted > 0 && quizRows) {
      const totalPercentage = quizRows.reduce((acc, row) => {
        return acc + (row.score / row.total_questions) * 100;
      }, 0);
      averageScore = Math.round(totalPercentage / quizzesAttempted);
    }

    return NextResponse.json({
      documentsUploaded,
      questionsAsked: questionsAsked || 0,
      quizzesAttempted,
      averageScore: `${averageScore}%`
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard metrics' }, { status: 500 });
  }
}