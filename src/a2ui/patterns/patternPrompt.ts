/**
 * Pattern Prompt Block Generator
 *
 * Generates compact, agent-readable pattern reference blocks that can be
 * injected into system prompts. This replaces — or summarises — the verbose
 * JSONL examples that currently bulk out every scenario prompt.
 *
 * Design goal: reduce prompt token count while improving pattern consistency
 * by teaching the agent the *names* and *rules* of patterns, not just showing
 * raw examples.
 */

import { ALL_PATTERNS, getPatternsByCategory, getPatternsForScenario } from './definitions';
import type { PatternDefinition } from './types';

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Render a single pattern as a compact directive paragraph. */
function formatPattern(p: PatternDefinition): string {
  const required = p.requiredComponents.join(', ');
  const states = p.states?.map((s) => s.id).join(' → ') ?? '';
  const statesLine = states ? `\n  States: ${states}.` : '';

  return (
    `**${p.id}** — ${p.description}\n` +
    `  Required: ${required}.${statesLine}\n` +
    `  ${p.agentGuidance}`
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Full pattern reference block — all 10 patterns.
 * Intended for the base system prompt or general-purpose agents.
 *
 * Token budget: ~900 tokens (vs ~3 000 tokens for full JSONL examples).
 */
export function getPatternReferenceBlock(): string {
  const byCategory = {
    'data-display': getPatternsByCategory('data-display'),
    'progressive-input': getPatternsByCategory('progressive-input'),
    'navigation': getPatternsByCategory('navigation'),
    'agentic': getPatternsByCategory('agentic'),
  };

  const sections = [
    formatSection('DATA DISPLAY', byCategory['data-display']),
    formatSection('PROGRESSIVE INPUT', byCategory['progressive-input']),
    formatSection('NAVIGATION', byCategory['navigation']),
    formatSection('AGENTIC (unique to agent-driven UX)', byCategory['agentic']),
  ].join('\n\n');

  return `# DESIGN SYSTEM PATTERNS

Patterns are named UI compositions. Use them by name — they define the structure,
required components, and interaction rules for common banking UX flows.
Reference a pattern by stating its ID (e.g. "use the confirmation-flow pattern").

${sections}`;
}

/**
 * Compact pattern block for a specific scenario.
 * Includes only the patterns relevant to that scenario — reduces token count
 * for focused prompt variants.
 *
 * @param scenarioId - Must match a ScenarioType value from queryRouter.ts
 */
export function getPatternBlockForScenario(scenarioId: string): string {
  const patterns = getPatternsForScenario(scenarioId);
  if (patterns.length === 0) return '';

  const lines = patterns.map(formatPattern).join('\n\n');
  return `## PATTERNS FOR THIS SCENARIO\n\n${lines}`;
}

/**
 * One-liner pattern IDs for annotating a scenario prompt header.
 * Used to quickly orient the agent at the top of a scenario section.
 *
 * @example
 * // Returns: "Patterns: confirmation-flow, progressive-input"
 */
export function getPatternIds(scenarioId: string): string {
  const patterns = getPatternsForScenario(scenarioId);
  if (patterns.length === 0) return '';
  return `Patterns: ${patterns.map((p) => p.id).join(', ')}`;
}

/**
 * Minimal pattern cheat-sheet — just names and required components.
 * Token-minimal variant for tight prompt budgets.
 */
export function getPatternCheatSheet(): string {
  const lines = ALL_PATTERNS.map(
    (p) => `• ${p.id}: requires ${p.requiredComponents.join(', ')}`
  );
  return `# PATTERN QUICK REFERENCE\n${lines.join('\n')}`;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function formatSection(title: string, patterns: PatternDefinition[]): string {
  if (patterns.length === 0) return '';
  const body = patterns.map(formatPattern).join('\n\n');
  return `### ${title}\n\n${body}`;
}
