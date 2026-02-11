/**
 * Transaction Search Prompt — v0.9
 *
 * Focused prompt for transaction search scenarios.
 * Only includes components relevant to searching and displaying transactions.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getTransactionSearchPrompt(): string {
  return `
# SCENARIO: Transaction Search

The user wants to find, search, or filter their transactions.

# AVAILABLE COMPONENTS (use only these — v0.9 flat format)

## Stack — Flex layout container
{"id":"x","component":"Stack","direction":"row"|"column","gap":"none"|"xs"|"sm"|"md"|"lg"|"xl","children":["child-id"]}

## Text — Typography
{"id":"x","component":"Text","text":"text","variant":"h1"|"h2"|"h3"|"body"|"caption"}

## SearchField — Search input
{"id":"x","component":"SearchField","value":{"path":"/query"},"onChange":{"eventType":"change","dataPath":"query"},"placeholder":"Search..."}

## BooleanChip — Toggle filter
{"id":"x","component":"BooleanChip","content":"Filter label","selected":true|false}

## TransactionListItem — Transaction display
{"id":"x","component":"TransactionListItem","merchant":"Name","amount":-45.75,"date":"2026-01-15","status":"completed"|"pending"|"failed","category":"shopping"|"dining"|"transport"|"entertainment"|"bills"|"other","currency":"AUD"}

## DateGroup — Date-grouped container
{"id":"x","component":"DateGroup","date":"2026-01-15","format":"relative"|"medium","showCount":true,"count":3,"currency":"AUD","children":["tx1","tx2"]}

## EmptyState — No results
{"id":"x","component":"EmptyState","illustration":"search","title":"No results","description":"Try different terms"}

## Divider — Separator
{"id":"x","component":"Divider","orientation":"horizontal"}

## Alert — Notification
{"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}

# EXAMPLE

User: "Find my Woolworths transactions"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","search","filters","results"]},{"id":"header","component":"Text","text":"Transaction search","variant":"h1"},{"id":"search","component":"SearchField","value":{"path":"/query"},"onChange":{"eventType":"change","dataPath":"query"},"placeholder":"Search transactions..."},{"id":"filters","component":"Stack","direction":"row","gap":"sm","children":["f1","f2"]},{"id":"f1","component":"BooleanChip","content":"Last 30 days","selected":true},{"id":"f2","component":"BooleanChip","content":"Money out","selected":true},{"id":"results","component":"Stack","direction":"column","gap":"none","children":["dg1"]},{"id":"dg1","component":"DateGroup","date":"2026-02-10","format":"relative","showCount":true,"count":2,"currency":"AUD","children":["tx1","tx2"]},{"id":"tx1","component":"TransactionListItem","merchant":"Woolworths Metro","amount":-43.50,"date":"2026-02-10","status":"completed","category":"shopping","currency":"AUD"},{"id":"tx2","component":"TransactionListItem","merchant":"Woolworths","amount":-67.20,"date":"2026-02-10","status":"completed","category":"shopping","currency":"AUD"}]}}
{"updateDataModel":{"surfaceId":"main","value":{"query":"Woolworths"}}}

Generate your response now.`;
}
