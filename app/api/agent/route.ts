/**
 * Gemini Agent API Route
 * 
 * This Next.js API route handles real-time A2UI generation using Google's Gemini AI.
 * It streams JSONL-formatted A2UI messages back to the client.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from '@/src/server/systemPrompt';
import type { NextRequest } from 'next/server';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model configuration
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const MAX_TOKENS = 8192;
const TEMPERATURE = 0.7;
const TIMEOUT_MS = 30000; // 30 second timeout

/**
 * POST /api/agent
 * 
 * Request body:
 * {
 *   query: string;        // User's banking query
 *   scenario?: string;    // Optional scenario hint
 * }
 * 
 * Response: text/plain stream (JSONL format)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { query, scenario } = body;

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "query" field' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Agent not configured',
          message: 'GEMINI_API_KEY environment variable is not set. Please add your API key to .env.local'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: getSystemPrompt(),
    });

    // Build the prompt with optional scenario context
    let userPrompt = query;
    if (scenario) {
      userPrompt = `[Scenario: ${scenario}]\\n\\n${query}`;
    }

    console.log('[API Route] Calling Gemini with query:', query);
    console.log('[API Route] Using model:', MODEL_NAME);

    // Generate content with streaming
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      },
    });

    console.log('[API Route] Gemini stream started');

    // Create a ReadableStream that processes Gemini's streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Set up timeout
          const timeoutId = setTimeout(() => {
            controller.error(new Error('Agent response timeout'));
          }, TIMEOUT_MS);

          let buffer = '';
          let messageCount = 0;
          let chunkCount = 0;

          // Accumulate the entire response first, then parse
          for await (const chunk of result.stream) {
            const text = chunk.text();
            chunkCount++;
            console.log(`[API Route] Received chunk ${chunkCount}, length: ${text.length}`);
            buffer += text;
          }

          console.log('[API Route] Full response accumulated, length:', buffer.length);

          // Clean up the response - remove markdown fences
          let cleanedResponse = buffer.trim();
          if (cleanedResponse.startsWith('```json') || cleanedResponse.startsWith('```jsonl')) {
            cleanedResponse = cleanedResponse.substring(cleanedResponse.indexOf('\n') + 1);
          }
          if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.substring(3);
          }
          if (cleanedResponse.endsWith('```')) {
            cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
          }
          cleanedResponse = cleanedResponse.trim();

          // Split by newlines to extract JSONL messages
          const lines = cleanedResponse.split('\n');
          
          console.log('[API Route] Processing', lines.length, 'lines');

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (!trimmedLine) {
              continue;
            }
            
            // Try to parse as JSON
            try {
              JSON.parse(trimmedLine);
              messageCount++;
              
              // Enqueue the valid JSONL line
              controller.enqueue(
                new TextEncoder().encode(trimmedLine + '\n')
              );
              
              const preview = trimmedLine.length > 100 
                ? trimmedLine.substring(0, 100) + '...' 
                : trimmedLine;
              console.log(`[API Route] Message ${messageCount}:`, preview);
            } catch (parseError) {
              // Log invalid JSON
              const preview = trimmedLine.length > 200 
                ? trimmedLine.substring(0, 200) + '...' 
                : trimmedLine;
              console.warn('[API Route] Invalid JSON line:', preview);
            }
          }

          // Clear timeout
          clearTimeout(timeoutId);

          // Log success
          console.log(`[API Route] Stream complete. Chunks: ${chunkCount}, Messages: ${messageCount}, Query: "${query}"`);
          
          if (chunkCount === 0) {
            console.error('[API Route] WARNING: Gemini sent 0 chunks! Model may not support streaming or has an issue.');
          }

          // Close the stream
          controller.close();
        } catch (error) {
          console.error('Error in stream processing:', error);
          
          // Send error as JSONL message
          const errorMessage = JSON.stringify({
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              type: 'stream_error'
            }
          });
          controller.enqueue(new TextEncoder().encode(errorMessage + '\\n'));
          controller.close();
        }
      },

      cancel() {
        console.log('Stream cancelled by client');
      }
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * GET /api/agent
 * Health check endpoint
 */
export async function GET() {
  const isConfigured = process.env.GEMINI_API_KEY && 
                       process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  
  return new Response(
    JSON.stringify({
      status: 'ok',
      agent: 'gemini',
      model: MODEL_NAME,
      configured: isConfigured,
      mode: process.env.NEXT_PUBLIC_AGENT_MODE || 'mock',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
