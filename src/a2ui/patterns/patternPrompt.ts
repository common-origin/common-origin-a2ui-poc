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
import { GLOBAL_RHYTHM_RULES } from './rhythmRules';
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

/**
 * Visual rhythm rules block — a compact agent-readable summary of the
 * cross-cutting layout consistency rules that apply to EVERY surface.
 *
 * Injected into the base system prompt so the agent always knows the
 * visual grammar regardless of which pattern is active.
 *
 * Token budget: ~200 tokens.
 */
export function getRhythmRulesBlock(): string {
  const ruleLines = GLOBAL_RHYTHM_RULES.map((r) => `- **${r.id}**: ${r.description}.`).join('\n');
  return `# VISUAL RHYTHM RULES

The following layout rules apply to EVERY surface you generate, across all patterns.
They ensure a consistent visual rhythm — equal spacing, predictable element order,
and uniform sizing so the UI feels coherent regardless of which scenario is rendered.

${ruleLines}

## Spacing tokens (use these values for gap/spacing props)
- \`"xs"\`  — 4 px  — icon rows, inline chip groups
- \`"sm"\`  — 8 px  — tight label/value pairs, button rows
- \`"md"\` — 16 px  — form fields, card sections ← default for forms
- \`"lg"\` — 24 px  — between logical sections on a page
- \`"xl"\` — 32 px  — top-level full-page sections

## Quick checklist for every surface
1. Every Stack → add \`gap\` prop (use \`"md"\` if unsure).
2. Form fields → Stack with \`direction="column"\` and \`gap="md"\`.
3. Filter chips → Stack with \`direction="row"\` and \`gap="xs"\`.
4. Button pairs → secondary/cancel first, primary/confirm last, same \`size\`.
5. Page structure → heading Text always the first child of its Stack.
6. Input fields → always inside a Stack, never at root level.`;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function formatSection(title: string, patterns: PatternDefinition[]): string {
  if (patterns.length === 0) return '';
  const body = patterns.map(formatPattern).join('\n\n');
  return `### ${title}\n\n${body}`;
}
