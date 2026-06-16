import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the native Google Gen AI SDK for the text generation
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 },
      );
    }

    // 1. Embed the User's Question (Must match the exact same REST API logic as upload)
    const API_KEY = process.env.GOOGLE_API_KEY;
    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${API_KEY}`;

    const embedResponse = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text: question }] },
      }),
    });

    if (!embedResponse.ok) throw new Error("Failed to embed question");

    const embedData = await embedResponse.json();
    let queryEmbedding = embedData.embedding?.values;

    // Normalize the question vector (critical for accurate cosine similarity)
    if (queryEmbedding && queryEmbedding.length > 0) {
      const magnitude = Math.sqrt(
        queryEmbedding.reduce((sum: number, val: number) => sum + val * val, 0),
      );
      queryEmbedding = queryEmbedding.map((val: number) => val / magnitude);
    }

    // 2. Search Supabase for the top 5 most relevant chunks
    const { data: chunks, error: searchError } = await supabaseAdmin.rpc(
      "match_document_chunks",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // Return anything with > 50% similarity
        match_count: 5, // Top 5 chunks
      },
    );

    if (searchError) throw searchError;

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        answer:
          "I couldn't find any information about that in the uploaded documents.",
      });
    }

    // 3. Format the retrieved context
    const contextText = chunks
      .map(
        (chunk: any) =>
          `--- Source: ${chunk.metadata.source} ---\n${chunk.content}`,
      )
      .join("\n\n");

    // 4. Construct the Gemini Prompt
    const prompt = `
      You are a helpful learning assistant.
      Answer the user's question ONLY using the provided context below. 
      If the answer is not contained in the context, say "I cannot answer this based on the provided documents."

      Context:
      ${contextText}

      Question:
      ${question}

      Provide your response in the following format:
      1. Answer: (Your direct answer here)
      2. Key points: (Bullet points of important details)
      3. Source references: (List the file names you used)
    `;
    // 5. Generate the Answer using Direct REST API (Bypassing SDK bugs)
const GENERATE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    const chatResponse = await fetch(GENERATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error("[DEBUG] Gemini Generation Error:", errorText);
      throw new Error("Failed to generate response from Gemini");
    }

    const chatData = await chatResponse.json();

    // Extract the text from Google's JSON response structure
    const finalAnswer = chatData.candidates[0].content.parts[0].text;

    return NextResponse.json({ answer: finalAnswer });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 },
    );
  }
}
