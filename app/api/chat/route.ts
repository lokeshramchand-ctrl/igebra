import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the native Google Gen AI SDK for the text generation
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    await supabaseAdmin.from("chat_logs").insert([{ question }]);
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

    // 3. Format context WITH explicit citation metadata
    // We safely look for page numbers depending on how the PDF parser stored them
    // map gives us access to the array index (i)
    const contextText = chunks
      .map((chunk: any, i: number) => {
        const pageInfo =
          chunk.metadata?.loc?.pageNumber || chunk.metadata?.page;
        const sourceName = pageInfo
          ? `Page ${pageInfo}`
          : `Document Section ${i + 1}`;
        return `--- SOURCE ID: ${sourceName} ---\n${chunk.content}`;
      })
      .join("\n\n");

    // 4. Construct the Precision Prompt
    const prompt = `
      You are a precision enterprise AI. Answer the user's question using ONLY the provided context.
      
      Rules:
      1. Provide a clear, direct answer.
      2. List the exact "SOURCE ID"s you used to formulate your answer.
      3. Calculate a confidence score (0-100) based on how explicitly the answer is stated in the text. If you have to infer heavily, lower the score.

      Context:
      ${contextText}

      Question:
      ${question}
    `;

    const GENERATE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

    // 5. Force Strict JSON Output
    const chatResponse = await fetch(GENERATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              answer: { type: "STRING" },
              sources: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "List of Source IDs used, e.g., 'Page 12'",
              },
              confidence: {
                type: "INTEGER",
                description: "Confidence score from 0 to 100",
              },
            },
            required: ["answer", "sources", "confidence"],
          },
        },
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error("[DEBUG] Gemini Chat Error:", errorText);
      throw new Error("Failed to generate response from Gemini");
    }

    const chatData = await chatResponse.json();
    const rawText = chatData.candidates[0].content.parts[0].text;

    // Parse the strict JSON
    const structuredResponse = JSON.parse(rawText);

    return NextResponse.json(structuredResponse);
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 },
    );
  }
}
