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
import { createLogger, truncate } from '@/src/lib/logger';
import { validateA2UIMessage } from '@/src/lib/messageValidator';

const log = createLogger('Agent');

/**
 * Agent mode configuration
 */
const AGENT_MODE = process.env.NEXT_PUBLIC_AGENT_MODE || 'mock';

/**
 * A single turn in a conversation
 */
export interface ConversationTurn {
  role: 'user' | 'agent';
  content: string;
}

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
  scenario?: string,
  history?: ConversationTurn[]
): Promise<void> {
  let messageCount = 0;

  try {
    log.info('Calling API', { query: truncate(query, 80), scenario });

    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, scenario, history: history || [] }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body received from agent');
    }

    log.debug('Streaming response started');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Extract complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const parsed = JSON.parse(trimmed);

            // Check for error messages from the stream
            if ('error' in parsed) {
              log.error('Agent returned error message', { error: parsed.error });
              throw new Error(parsed.error?.message || 'Agent error');
            }

            // Validate against A2UI schema + catalog
            const validation = validateA2UIMessage(parsed);
            if (!validation.valid) {
              log.warn('Invalid A2UI message, skipping', { errors: validation.errors, preview: truncate(trimmed, 120) });
              continue;
            }
            if (validation.warnings && validation.warnings.length > 0) {
              log.warn('A2UI catalog warnings', { count: validation.warnings.length, warnings: validation.warnings.slice(0, 5) });
            }

            messageCount++;
            const messageType = Object.keys(validation.message!)[0];
            log.debug(`Message ${messageCount}: ${messageType}`);
            onMessage(validation.message!);
          } catch (parseError) {
            if (parseError instanceof SyntaxError) {
              log.warn('Invalid JSON line, skipping', { preview: truncate(trimmed, 200) });
            } else {
              throw parseError; // Re-throw non-parse errors (like the agent error above)
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());

          if ('error' in parsed) {
            throw new Error(parsed.error?.message || 'Agent error');
          }

          const validation = validateA2UIMessage(parsed);
          if (validation.valid) {
            messageCount++;
            log.debug(`Final message ${messageCount}: ${Object.keys(validation.message!)[0]}`);
            onMessage(validation.message!);
          } else {
            log.warn('Invalid final A2UI message', { errors: validation.errors });
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            log.warn('Failed to parse final buffer', { preview: truncate(buffer, 200) });
          } else {
            throw parseError;
          }
        }
      }

      log.info('Completed', { totalMessages: messageCount });

      if (messageCount === 0) {
        log.error('No valid messages received from Gemini');
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    log.error('Call failed', { error: error instanceof Error ? error.message : String(error) });
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
  scenario?: string,
  _history?: ConversationTurn[]
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
    log.error('Mock agent call failed', { error: error instanceof Error ? error.message : String(error) });
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
    history?: ConversationTurn[];  // Conversation history for multi-turn
  }
): Promise<void> {
  const mode = options?.forceMode || AGENT_MODE;
  const retryWithMock = options?.retryOnError !== false; // Default: true

  try {
    const history = options?.history;
    if (mode === 'real') {
      log.info('Using real Gemini agent', { query: truncate(query, 60), scenario, historyLength: history?.length || 0 });
      await callRealAgent(query, onMessage, scenario, history);
    } else {
      log.info('Using mock agent', { query: truncate(query, 60), scenario });
      await callMockAgent(query, onMessage, scenario, history);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    log.error('Agent error', { message: err.message, mode });

    // Call custom error handler if provided
    if (options?.onError) {
      options.onError(err);
    }

    // Retry with mock agent if real agent failed and retry is enabled
    if (mode === 'real' && retryWithMock) {
      log.warn('Falling back to mock agent after real agent failure');
      try {
        await callMockAgent(query, onMessage, scenario);
      } catch (mockError) {
        log.error('Mock agent fallback also failed', { error: mockError instanceof Error ? mockError.message : String(mockError) });
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
