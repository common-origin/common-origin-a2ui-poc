/**
 * Conversation History Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  trimConversationHistory,
  isWithinWindow,
  describeHistory,
  DEFAULT_HISTORY_WINDOW,
} from './conversationHistory';
import type { ConversationTurn } from './agentClient';

function makeTurns(count: number): ConversationTurn[] {
  return Array.from({ length: count }, (_, i) => ({
    role: i % 2 === 0 ? 'user' : 'agent',
    content: `turn-${i}`,
  }));
}

describe('trimConversationHistory', () => {
  it('returns the full history when it is within the window', () => {
    const history = makeTurns(4);
    expect(trimConversationHistory(history)).toHaveLength(4);
  });

  it('trims to the most recent maxTurns entries', () => {
    const history = makeTurns(10);
    const trimmed = trimConversationHistory(history, 6);
    expect(trimmed).toHaveLength(6);
    // Most-recent entries are preserved
    expect(trimmed[trimmed.length - 1].content).toBe('turn-9');
  });

  it('rounds down to even when maxTurns is odd to preserve pairs', () => {
    const history = makeTurns(10);
    // maxTurns=5 → effective window=4 (even)
    const trimmed = trimConversationHistory(history, 5);
    expect(trimmed).toHaveLength(4);
  });

  it('uses DEFAULT_HISTORY_WINDOW=6 when maxTurns is omitted', () => {
    const history = makeTurns(20);
    const trimmed = trimConversationHistory(history);
    expect(trimmed).toHaveLength(DEFAULT_HISTORY_WINDOW);
  });

  it('returns empty array for empty input', () => {
    expect(trimConversationHistory([])).toEqual([]);
  });

  it('returns single-item array unchanged when within window', () => {
    const history: ConversationTurn[] = [{ role: 'user', content: 'hello' }];
    expect(trimConversationHistory(history)).toHaveLength(1);
  });

  it('trims to exactly maxTurns when input is exactly one over', () => {
    const history = makeTurns(7);
    const trimmed = trimConversationHistory(history, 6);
    expect(trimmed).toHaveLength(6);
  });
});

describe('isWithinWindow', () => {
  it('returns true when history is shorter than window', () => {
    expect(isWithinWindow(makeTurns(3), 6)).toBe(true);
  });

  it('returns true when history equals the window', () => {
    expect(isWithinWindow(makeTurns(6), 6)).toBe(true);
  });

  it('returns false when history exceeds the window', () => {
    expect(isWithinWindow(makeTurns(7), 6)).toBe(false);
  });

  it('uses DEFAULT_HISTORY_WINDOW when maxTurns omitted', () => {
    expect(isWithinWindow(makeTurns(DEFAULT_HISTORY_WINDOW + 1))).toBe(false);
    expect(isWithinWindow(makeTurns(DEFAULT_HISTORY_WINDOW))).toBe(true);
  });
});

describe('describeHistory', () => {
  it('returns "0 turns" for empty history', () => {
    expect(describeHistory([])).toBe('0 turns');
  });

  it('returns singular "1 turn" for single entry', () => {
    expect(describeHistory([{ role: 'user', content: 'hi' }])).toBe('1 turn (user)');
  });

  it('includes role list in output', () => {
    const history = makeTurns(4);
    const desc = describeHistory(history);
    expect(desc).toContain('4 turns');
    expect(desc).toContain('user');
    expect(desc).toContain('agent');
  });
});
