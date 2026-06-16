import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { score, total_questions } = await request.json();
    
    const { error } = await supabaseAdmin
      .from('quiz_scores')
      .insert([{ score, total_questions }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Score API Error:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}