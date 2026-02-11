/**
 * Spending Summary Prompt — v0.9
 *
 * Focused prompt for spending analytics / summary scenarios.
 * Only includes components relevant to displaying spending data.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getSpendingSummaryPrompt(): string {
  return `
# SCENARIO: Spending Summary / Analytics

The user wants to see their spending breakdown, summary, or analytics.

# AVAILABLE COMPONENTS (use only these — v0.9 flat format)

## Stack — Flex layout container
{"id":"x","component":"Stack","direction":"row"|"column","gap":"none"|"xs"|"sm"|"md"|"lg"|"xl","children":["child-id"]}

## Text — Typography
{"id":"x","component":"Text","text":"text","variant":"h1"|"h2"|"h3"|"body"|"caption"}

## Card — Container with padding
{"id":"x","component":"Card","variant":"outlined"|"filled","children":["child-id"]}

## MoneyDisplay — Currency amount
{"id":"x","component":"MoneyDisplay","amount":1234.56,"currency":"AUD","size":"lg"|"md"|"sm","trend":"up"|"down"|"neutral","label":"Label"}

## Progress — Percentage bar
{"id":"x","component":"Progress","value":75,"max":100,"label":"Category","variant":"determinate"}

## CategoryBadge — Spending category badge
{"id":"x","component":"CategoryBadge","category":"shopping"|"dining"|"transport"|"entertainment"|"bills"|"other","label":"Shopping"}

## Divider — Separator
{"id":"x","component":"Divider","orientation":"horizontal"}

## Alert — Notification
{"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}

# EXAMPLE

User: "How much did I spend this month?"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","total-card","breakdown-header","breakdown"]},{"id":"header","component":"Text","text":"February spending summary","variant":"h1"},{"id":"total-card","component":"Card","variant":"filled","children":["total-money"]},{"id":"total-money","component":"MoneyDisplay","amount":2847.30,"currency":"AUD","size":"lg","trend":"up","label":"Total spent this month"},{"id":"breakdown-header","component":"Text","text":"By category","variant":"h2"},{"id":"breakdown","component":"Stack","direction":"column","gap":"md","children":["cat1","bar1","cat2","bar2","cat3","bar3"]},{"id":"cat1","component":"CategoryBadge","category":"shopping","label":"Shopping — $1,230.00"},{"id":"bar1","component":"Progress","value":43,"max":100,"label":"Shopping","variant":"determinate"},{"id":"cat2","component":"CategoryBadge","category":"dining","label":"Dining — $645.50"},{"id":"bar2","component":"Progress","value":23,"max":100,"label":"Dining","variant":"determinate"},{"id":"cat3","component":"CategoryBadge","category":"bills","label":"Bills — $520.00"},{"id":"bar3","component":"Progress","value":18,"max":100,"label":"Bills","variant":"determinate"}]}}

Generate your response now.`;
}
