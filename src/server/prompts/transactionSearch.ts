/**
 * Transaction Search Prompt — v0.9
 *
 * Focused prompt for transaction search scenarios.
 * Only includes components relevant to searching and displaying transactions.
 * Includes multiple examples and multi-step drill-down flows.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getTransactionSearchPrompt(): string {
  return `
# SCENARIO: Transaction Search

The user wants to find, search, or filter their transactions.

# CUSTOMER CONTEXT

The customer is Sarah Chen. She has:
- Everyday Account (••••7890) — $3,247.85
- Goal Saver (••••4567) — $12,450.00
- Platinum Credit Card (••••2103) — owing $1,892.40

Use realistic Australian merchants and amounts. Dates should be close to the current date (February 2026). Use a mix of completed, pending, and occasional failed transactions for realism.

# AVAILABLE COMPONENTS (use only these — v0.9 flat format)

## Stack — Flex layout container
{"id":"x","component":"Stack","direction":"row"|"column","gap":"none"|"xs"|"sm"|"md"|"lg"|"xl","children":["child-id"]}

## Text — Typography
{"id":"x","component":"Text","text":"text","variant":"h1"|"h2"|"h3"|"body"|"caption"}

## SearchField — Search input
{"id":"x","component":"SearchField","value":{"path":"/query"},"onChange":{"eventType":"change","dataPath":"query"},"placeholder":"Search..."}

## BooleanChip — Toggle filter
{"id":"x","component":"BooleanChip","content":"Filter label","selected":true|false}

## TransactionListItem — Transaction display (clickable for drill-down)
{"id":"x","component":"TransactionListItem","merchant":"Name","amount":-45.75,"date":"2026-01-15","status":"completed"|"pending"|"failed","category":"shopping"|"dining"|"transport"|"entertainment"|"bills"|"other","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Name"},{"key":"amount","value":-45.75},{"key":"date","value":"2026-01-15"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}}

## DateGroup — Date-grouped container
{"id":"x","component":"DateGroup","date":"2026-01-15","format":"relative"|"medium","showCount":true,"count":3,"currency":"AUD","children":["tx1","tx2"]}

## EmptyState — No results
{"id":"x","component":"EmptyState","illustration":"search","title":"No results","description":"Try different terms"}

## Button — Action button (use action with name + context)
{"id":"x","component":"Button","label":"Label","variant":"primary"|"secondary"|"text","action":{"name":"action_name","context":[{"key":"field","value":"value"}]}}

## StatusBadge — Transaction status
{"id":"x","component":"StatusBadge","status":"completed"|"pending"|"failed","size":"medium"}

## MoneyDisplay — Currency amount
{"id":"x","component":"MoneyDisplay","amount":1234.56,"currency":"AUD","size":"lg"|"md"|"sm"}

## Alert — Notification
{"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}

## Card — Container with padding
{"id":"x","component":"Card","variant":"outlined"|"filled","children":["child-id"]}

## Divider — Separator
{"id":"x","component":"Divider","orientation":"horizontal"}

# MANDATORY RULES

1. EVERY TransactionListItem MUST include an "onClick" property with name "view_transaction". No exceptions.
2. The onClick context MUST include: merchant, amount, date, category, status as literal values.
3. Group transactions by date using DateGroup. Show the most recent dates first.
4. Include a summary line below the header (e.g. "8 transactions totalling $423.50").
5. When you receive a follow-up with action "view_transaction", generate a DETAILED transaction screen (see Example 2).
6. When you receive action "back_to_list", regenerate the original search results.
7. When you receive action "dispute_transaction", show a dispute confirmation form.

# EXAMPLE 1 — Search results

User: "Show my Woolworths transactions"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","summary","search","filters","results"]},{"id":"header","component":"Text","text":"Transaction search","variant":"h1"},{"id":"summary","component":"Text","text":"3 transactions totalling $195.13","variant":"caption"},{"id":"search","component":"SearchField","value":{"path":"/query"},"onChange":{"eventType":"change","dataPath":"query"},"placeholder":"Search transactions..."},{"id":"filters","component":"Stack","direction":"row","gap":"sm","children":["f1","f2","f3"]},{"id":"f1","component":"BooleanChip","content":"Last 30 days","selected":true},{"id":"f2","component":"BooleanChip","content":"Money out","selected":true},{"id":"f3","component":"BooleanChip","content":"Everyday Account","selected":false},{"id":"results","component":"Stack","direction":"column","gap":"none","children":["dg1","dg2"]},{"id":"dg1","component":"DateGroup","date":"2026-02-17","format":"relative","showCount":true,"count":1,"showTotal":true,"totalAmount":-87.43,"currency":"AUD","children":["tx1"]},{"id":"tx1","component":"TransactionListItem","merchant":"Woolworths Metro CBD","amount":-87.43,"date":"2026-02-17","status":"completed","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Woolworths Metro CBD"},{"key":"amount","value":-87.43},{"key":"date","value":"2026-02-17"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}},{"id":"dg2","component":"DateGroup","date":"2026-02-12","format":"relative","showCount":true,"count":2,"showTotal":true,"totalAmount":-107.70,"currency":"AUD","children":["tx2","tx3"]},{"id":"tx2","component":"TransactionListItem","merchant":"Woolworths Doncaster","amount":-67.20,"date":"2026-02-12","status":"completed","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Woolworths Doncaster"},{"key":"amount","value":-67.20},{"key":"date","value":"2026-02-12"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}},{"id":"tx3","component":"TransactionListItem","merchant":"Woolworths Online","amount":-40.50,"date":"2026-02-12","status":"pending","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Woolworths Online"},{"key":"amount","value":-40.50},{"key":"date","value":"2026-02-12"},{"key":"category","value":"shopping"},{"key":"status","value":"pending"}]}}]}}
{"updateDataModel":{"surfaceId":"main","value":{"query":"Woolworths"}}}

# EXAMPLE 2 — Transaction detail (after view_transaction action)

User: 'The user performed action "view_transaction" with the following details: merchant: Woolworths Metro CBD, amount: -87.43, date: 2026-02-17, category: shopping, status: completed'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["back-btn","detail-header","amount-display","detail-card","actions"]},{"id":"back-btn","component":"Button","label":"← Back to transactions","variant":"text","action":{"name":"back_to_list","context":[]}},{"id":"detail-header","component":"Stack","direction":"column","gap":"xs","children":["merchant-name","tx-date","tx-status"]},{"id":"merchant-name","component":"Text","text":"Woolworths Metro CBD","variant":"h1"},{"id":"tx-date","component":"Text","text":"Monday, 17 February 2026","variant":"body"},{"id":"tx-status","component":"StatusBadge","status":"completed","size":"medium"},{"id":"amount-display","component":"MoneyDisplay","amount":-87.43,"currency":"AUD","size":"large","weight":"bold"},{"id":"detail-card","component":"Stack","direction":"column","gap":"md","children":["detail-account","detail-category","detail-ref"]},{"id":"detail-account","component":"Text","text":"From: Everyday Account (••••7890)","variant":"body"},{"id":"detail-category","component":"Text","text":"Category: Shopping","variant":"body"},{"id":"detail-ref","component":"Text","text":"Reference: TXN-20260217-4532","variant":"caption"},{"id":"actions","component":"Stack","direction":"row","gap":"sm","children":["dispute-btn","receipt-btn"]},{"id":"dispute-btn","component":"Button","label":"Dispute transaction","variant":"secondary","action":{"name":"dispute_transaction","context":[{"key":"merchant","value":"Woolworths Metro CBD"},{"key":"amount","value":-87.43},{"key":"date","value":"2026-02-17"},{"key":"reference","value":"TXN-20260217-4532"}]}},{"id":"receipt-btn","component":"Button","label":"Request receipt","variant":"text","action":{"name":"request_receipt","context":[{"key":"reference","value":"TXN-20260217-4532"}]}}]}}

# EXAMPLE 3 — Recent transactions (no specific merchant)

User: "Show my recent transactions"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","summary","filters","results"]},{"id":"header","component":"Text","text":"Recent transactions","variant":"h1"},{"id":"summary","component":"Text","text":"Everyday Account (••••7890) · Last 7 days","variant":"caption"},{"id":"filters","component":"Stack","direction":"row","gap":"sm","children":["f1","f2","f3","f4"]},{"id":"f1","component":"BooleanChip","content":"Last 7 days","selected":true},{"id":"f2","component":"BooleanChip","content":"Last 30 days","selected":false},{"id":"f3","component":"BooleanChip","content":"Money out","selected":false},{"id":"f4","component":"BooleanChip","content":"Money in","selected":false},{"id":"results","component":"Stack","direction":"column","gap":"none","children":["dg1","dg2","dg3"]},{"id":"dg1","component":"DateGroup","date":"2026-02-18","format":"relative","showCount":true,"count":2,"showTotal":true,"totalAmount":-35.74,"currency":"AUD","children":["tx1","tx2"]},{"id":"tx1","component":"TransactionListItem","merchant":"The Coffee Club","amount":-8.50,"date":"2026-02-18","status":"completed","category":"dining","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"The Coffee Club"},{"key":"amount","value":-8.50},{"key":"date","value":"2026-02-18"},{"key":"category","value":"dining"},{"key":"status","value":"completed"}]}},{"id":"tx2","component":"TransactionListItem","merchant":"Uber Eats","amount":-27.24,"date":"2026-02-18","status":"pending","category":"dining","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Uber Eats"},{"key":"amount","value":-27.24},{"key":"date","value":"2026-02-18"},{"key":"category","value":"dining"},{"key":"status","value":"pending"}]}},{"id":"dg2","component":"DateGroup","date":"2026-02-17","format":"relative","showCount":true,"count":3,"showTotal":true,"totalAmount":-239.43,"currency":"AUD","children":["tx3","tx4","tx5"]},{"id":"tx3","component":"TransactionListItem","merchant":"Woolworths Metro CBD","amount":-87.43,"date":"2026-02-17","status":"completed","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Woolworths Metro CBD"},{"key":"amount","value":-87.43},{"key":"date","value":"2026-02-17"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}},{"id":"tx4","component":"TransactionListItem","merchant":"Caltex Epping","amount":-65.00,"date":"2026-02-17","status":"completed","category":"transport","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Caltex Epping"},{"key":"amount","value":-65.00},{"key":"date","value":"2026-02-17"},{"key":"category","value":"transport"},{"key":"status","value":"completed"}]}},{"id":"tx5","component":"TransactionListItem","merchant":"Woolworths Metro CBD","amount":-87.00,"date":"2026-02-17","status":"completed","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Woolworths Metro CBD"},{"key":"amount","value":-87.00},{"key":"date","value":"2026-02-17"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}},{"id":"dg3","component":"DateGroup","date":"2026-02-15","format":"relative","showCount":true,"count":2,"showTotal":true,"totalAmount":-211.99,"currency":"AUD","children":["tx6","tx7"]},{"id":"tx6","component":"TransactionListItem","merchant":"Netflix Australia","amount":-22.99,"date":"2026-02-15","status":"completed","category":"entertainment","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Netflix Australia"},{"key":"amount","value":-22.99},{"key":"date","value":"2026-02-15"},{"key":"category","value":"entertainment"},{"key":"status","value":"completed"}]}},{"id":"tx7","component":"TransactionListItem","merchant":"AGL Energy","amount":-189.00,"date":"2026-02-15","status":"completed","category":"bills","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"AGL Energy"},{"key":"amount","value":-189.00},{"key":"date","value":"2026-02-15"},{"key":"category","value":"bills"},{"key":"status","value":"completed"}]}}]}}

Generate your response now.`;
}
