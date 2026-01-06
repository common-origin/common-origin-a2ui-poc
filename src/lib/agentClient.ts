/**
 * Agent Client
 * 
 * Unified interface for calling banking agents (mock or real Gemini AI).
 * Automatically routes to the appropriate agent based on NEXT_PUBLIC_AGENT_MODE.
 */

import type { A2UIMessage } from '@/src/a2ui/types';
import { streamTransactionFinderUI } from '@/src/server/mockAgent';
import { streamSpendingSummaryUI } from '@/src/server/spendingSummaryAgent';
import { streamFundTransferUI } from '@/src/server/fundTransferAgent';

/**
 * Agent mode configuration
 */
const AGENT_MODE = process.env.NEXT_PUBLIC_AGENT_MODE || 'mock';

/**
 * Call the real Gemini agent via API route
 * 
 * @param query - User's banking query
 * @param onMessage - Callback for each A2UI message
 * @param scenario - Optional scenario hint for the agent
 */
export async function callRealAgent(
  query: string,
  onMessage: (message: A2UIMessage) => void,
  scenario?: string
): Promise<void> {
  let messageCount = 0;
  
  try {
    console.log('[Real Agent] Calling API with query:', query);
    
    // Call the API route with streaming
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, scenario }),
    });

    // Check for HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    // Check that we have a body to read
    if (!response.body) {
      throw new Error('No response body received from agent');
    }

    console.log('[Real Agent] Streaming response started');

    // Process the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let rawChunks: string[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        rawChunks.push(chunk);
        console.log('[Real Agent] Received chunk (length:', chunk.length, '):', chunk.substring(0, 200));
        console.log('[Real Agent] Chunk contains', (chunk.match(/\n/g) || []).length, 'newlines');
        buffer += chunk;

        // Split by newlines to extract complete JSONL lines
        const lines = buffer.split('\n');
        console.log('[Real Agent] Split buffer into', lines.length, 'lines');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';
        console.log('[Real Agent] Remaining buffer length:', buffer.length);

        // Process each complete line
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine) {
            try {
              const message = JSON.parse(trimmedLine) as A2UIMessage;
              messageCount++;
              
              // Log what type of message we received
              const messageType = Object.keys(message)[0];
              console.log(`[Real Agent] Received message ${messageCount}:`, messageType);
              console.log(`[Real Agent] Full message:`, message);
              
              // Check if it's an error message
              if ('error' in message) {
                console.error('Agent error:', message.error);
                throw new Error((message.error as any).message || 'Agent error');
              }
              
              // Send valid A2UI message to callback
              console.log(`[Real Agent] Sending message ${messageCount} to onMessage callback`);
              onMessage(message);
            } catch (parseError) {
              console.error('[Real Agent] Failed to parse message:', trimmedLine.substring(0, 200));
              console.error('Parse error:', parseError);
              // Continue processing other messages
            }
          }
        }
      }

      // Process any remaining content in the buffer
      if (buffer.trim()) {
        try {
          const message = JSON.parse(buffer.trim()) as A2UIMessage;
          messageCount++;
          
          const messageType = Object.keys(message)[0];
          console.log(`[Real Agent] Received final message ${messageCount}:`, messageType);
          
          if ('error' in message) {
            console.error('Agent error:', message.error);
            throw new Error((message.error as any).message || 'Agent error');
          }
          
          onMessage(message);
        } catch (parseError) {
          console.error('[Real Agent] Failed to parse final buffer:', buffer.substring(0, 200));
        }
      }
      
      console.log(`[Real Agent] Completed. Total messages: ${messageCount}`);
      
      if (messageCount === 0) {
        console.warn('[Real Agent] No messages received! Raw response:', rawChunks.join('').substring(0, 500));
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('[Real Agent] Call failed:', error);
    throw error;
  }
}

/**
 * Call the mock agent (for demo/fallback)
 * 
 * @param query - User's banking query
 * @param onMessage - Callback for each A2UI message
 * @param scenario - Detected scenario type
 */
export async function callMockAgent(
  query: string,
  onMessage: (message: A2UIMessage) => void,
  scenario?: string
): Promise<void> {
  try {
    // Route to appropriate mock agent based on scenario
    switch (scenario) {
      case 'transaction-finder':
        await streamTransactionFinderUI(onMessage);
        break;
      
      case 'spending-summary':
        await streamSpendingSummaryUI(onMessage);
        break;
      
      case 'fund-transfer':
        await streamFundTransferUI(onMessage);
        break;
      
      default:
        // Default to transaction finder for unknown queries
        await streamTransactionFinderUI(onMessage);
        break;
    }
  } catch (error) {
    console.error('Mock agent call failed:', error);
    throw error;
  }
}

/**
 * Unified agent caller - routes to mock or real agent based on configuration
 * 
 * @param query - User's banking query
 * @param onMessage - Callback for each A2UI message
 * @param scenario - Optional scenario hint
 * @param options - Additional options
 * @returns Promise that resolves when all messages are sent
 */
export async function callAgent(
  query: string,
  onMessage: (message: A2UIMessage) => void,
  scenario?: string,
  options?: {
    forceMode?: 'mock' | 'real';  // Override default agent mode
    onError?: (error: Error) => void;  // Custom error handler
    retryOnError?: boolean;  // Retry with mock agent if real agent fails
  }
): Promise<void> {
  const mode = options?.forceMode || AGENT_MODE;
  const retryWithMock = options?.retryOnError !== false; // Default: true

  try {
    if (mode === 'real') {
      // Call real Gemini agent
      console.log(`[Agent] Using real Gemini agent for: "${query}"`);
      await callRealAgent(query, onMessage, scenario);
    } else {
      // Call mock agent
      console.log(`[Agent] Using mock agent for: "${query}" (scenario: ${scenario})`);
      await callMockAgent(query, onMessage, scenario);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('[Agent] Error:', err.message);

    // Call custom error handler if provided
    if (options?.onError) {
      options.onError(err);
    }

    // Retry with mock agent if real agent failed and retry is enabled
    if (mode === 'real' && retryWithMock) {
      console.log('[Agent] Falling back to mock agent after real agent failure');
      try {
        await callMockAgent(query, onMessage, scenario);
      } catch (mockError) {
        console.error('[Agent] Mock agent fallback also failed:', mockError);
        throw mockError;
      }
    } else {
      throw err;
    }
  }
}

/**
 * Get current agent mode
 */
export function getAgentMode(): 'mock' | 'real' {
  return AGENT_MODE === 'real' ? 'real' : 'mock';
}

/**
 * Check if real agent is available (API key configured)
 */
export async function isRealAgentAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/agent', { method: 'GET' });
    const data = await response.json();
    return data.configured === true;
  } catch {
    return false;
  }
}
