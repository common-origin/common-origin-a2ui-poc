/**
 * Conversation History Utilities — Phase 6.5
 *
 * Utilities for managing and trimming conversation history sent to the AI
 * agent. Sending the full history on every turn grows prompt cost linearly
 * and adds latency. A sliding window keeps only the most recent context.
 */

import type { ConversationTurn } from './agentClient';

/** Default: keep the last 3 complete user+agent exchanges (6 turns). */
export const DEFAULT_HISTORY_WINDOW = 6;

/**
 * Trim conversation history to the most recent `maxTurns` entries.
 *
 * Always keeps complete user→agent pairs where possible by rounding down
 * to an even number of turns when `maxTurns` is odd (to avoid sending a
 * dangling user turn without its agent response).
 *
 * @param history  Full conversation history
 * @param maxTurns Maximum number of turns to retain (default: 6)
 * @returns Trimmed history slice
 */
export function trimConversationHistory(
  history: ConversationTurn[],
  maxTurns: number = DEFAULT_HISTORY_WINDOW
): ConversationTurn[] {
  if (history.length <= maxTurns) return history;

  // Round down to even to preserve complete pairs
  const window = maxTurns % 2 === 0 ? maxTurns : maxTurns - 1;
  return history.slice(-window);
}

/**
 * Check whether a history slice is within the window limit.
 * Useful for logging / assertions.
 */
export function isWithinWindow(
  history: ConversationTurn[],
  maxTurns: number = DEFAULT_HISTORY_WINDOW
): boolean {
  return history.length <= maxTurns;
}

/**
 * Summarise conversation history for debug logging.
 * Returns a compact string like "3 turns (user, agent, user)".
 */
export function describeHistory(history: ConversationTurn[]): string {
  if (history.length === 0) return '0 turns';
  const roles = history.map((t) => t.role).join(', ');
  return `${history.length} turn${history.length !== 1 ? 's' : ''} (${roles})`;
}
