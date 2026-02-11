/**
 * Gemini Agent API Route
 *
 * This Next.js API route handles real-time A2UI generation using Google's Gemini AI.
 * It streams JSONL-formatted A2UI messages back to the client incrementally.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from '@/src/server/systemPrompt';
import type { ScenarioType } from '@/src/server/queryRouter';
import { createLogger, truncate } from '@/src/lib/logger';
import type { NextRequest } from 'next/server';

const log = createLogger('APIRoute');

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model configuration
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const MAX_TOKENS = 8192;
const TEMPERATURE = 0.3;
const IDLE_TIMEOUT_MS = 30000; // 30 second idle timeout (resets on each chunk)

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
  const startTime = Date.now();

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
      log.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({
          error: 'Agent not configured',
          message: 'GEMINI_API_KEY environment variable is not set. Please add your API key to .env.local',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the Gemini model with scenario-specific prompt
    const detectedScenario = (scenario as ScenarioType) || 'unknown';
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: getSystemPrompt(detectedScenario),
    });

    const userPrompt = query;

    log.info('Calling Gemini', { query, scenario, model: MODEL_NAME });

    // Generate content with streaming
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      },
    });

    log.debug('Gemini stream started');

    // Create a ReadableStream that incrementally parses and forwards JSONL
    const stream = new ReadableStream({
      async start(controller) {
        let idleTimer: ReturnType<typeof setTimeout> | null = null;
        let buffer = '';
        let messageCount = 0;
        let chunkCount = 0;
        let fencingDetected = false;
        let firstByteTime: number | null = null;

        const resetIdleTimer = () => {
          if (idleTimer) clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            log.error('Idle timeout reached', { chunkCount, messageCount, elapsed: Date.now() - startTime });
            controller.error(new Error('Agent response idle timeout'));
          }, IDLE_TIMEOUT_MS);
        };

        const tryEnqueueLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          // Skip markdown fencing lines
          if (trimmed.startsWith('```')) {
            fencingDetected = true;
            return;
          }

          try {
            JSON.parse(trimmed); // Validate JSON
            messageCount++;
            controller.enqueue(new TextEncoder().encode(trimmed + '\n'));
            log.debug(`Message ${messageCount}`, { preview: truncate(trimmed, 120) });
          } catch {
            log.warn('Invalid JSON line, skipping', { preview: truncate(trimmed, 200) });
          }
        };

        try {
          resetIdleTimer();

          for await (const chunk of result.stream) {
            const text = chunk.text();
            chunkCount++;

            if (!firstByteTime) {
              firstByteTime = Date.now();
              log.info('Time to first byte', { ms: firstByteTime - startTime });
            }

            resetIdleTimer();
            buffer += text;

            // Incrementally extract complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last (possibly incomplete) line

            for (const line of lines) {
              tryEnqueueLine(line);
            }
          }

          // Process any remaining buffer content
          if (buffer.trim()) {
            tryEnqueueLine(buffer);
          }

          if (idleTimer) clearTimeout(idleTimer);

          const elapsed = Date.now() - startTime;
          log.info('Stream complete', { chunkCount, messageCount, elapsed, query: truncate(query, 60) });

          if (messageCount === 0) {
            log.error('Gemini returned 0 valid JSONL messages', { chunkCount, fencingDetected });
          }

          controller.close();
        } catch (error) {
          if (idleTimer) clearTimeout(idleTimer);
          log.error('Stream processing error', {
            error: error instanceof Error ? error.message : String(error),
            chunkCount,
            messageCount,
          });

          // Send error as JSONL message
          const errorMessage = JSON.stringify({
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              type: 'stream_error',
            },
          });
          controller.enqueue(new TextEncoder().encode(errorMessage + '\n'));
          controller.close();
        }
      },

      cancel() {
        log.info('Stream cancelled by client');
      },
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
    log.error('API route error', { error: error instanceof Error ? error.message : String(error) });

    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * GET /api/agent
 * Health check endpoint
 */
export async function GET() {
  const isConfigured =
    !!process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

  return Response.json({
    status: 'ok',
    agent: 'gemini',
    model: MODEL_NAME,
    configured: isConfigured,
    mode: process.env.NEXT_PUBLIC_AGENT_MODE || 'mock',
  });
}
