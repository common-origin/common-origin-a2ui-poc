/**
 * System Prompt Composer for Gemini Agent
 *
 * Composes a system prompt from base + scenario-specific modules.
 * This reduces prompt size by ~60% for known scenarios by only including
 * the components relevant to the detected query type.
 */

import type { ScenarioType } from './queryRouter';
import { getBasePrompt } from './prompts/base';
import { getTransactionSearchPrompt } from './prompts/transactionSearch';
import { getSpendingSummaryPrompt } from './prompts/spendingSummary';
import { getFundTransferPrompt } from './prompts/fundTransfer';
import { getGeneralPrompt } from './prompts/general';

const scenarioPrompts: Record<ScenarioType, () => string> = {
  'transaction-search': getTransactionSearchPrompt,
  'spending-summary': getSpendingSummaryPrompt,
  'fund-transfer': getFundTransferPrompt,
  'unknown': getGeneralPrompt,
};

/**
 * Get the composed system prompt for a given scenario.
 *
 * @param scenario - The detected scenario type. Defaults to 'unknown' (full catalog).
 * @returns Combined base + scenario prompt string
 */
export function getSystemPrompt(scenario: ScenarioType = 'unknown'): string {
  const base = getBasePrompt();
  const scenarioPrompt = scenarioPrompts[scenario]();
  return `${base}\n${scenarioPrompt}`;
}
