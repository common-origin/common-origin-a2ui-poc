/**
 * Spending Summary Prompt — v0.9
 *
 * Focused prompt for spending analytics / summary scenarios.
 * Includes multiple examples and multi-step drill-down flows.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getSpendingSummaryPrompt(): string {
  return `
# SCENARIO: Spending Summary / Analytics
# PATTERNS: spending-breakdown

The user wants to see their spending breakdown, summary, or analytics.

# CUSTOMER CONTEXT

The customer is Sarah Chen. Her Everyday Account (••••7890) has a balance of $3,247.85.
This month (February 2026), she has spent approximately $2,847.30 across these categories:
- Groceries (Woolworths, Coles, Aldi): ~$620 (12 transactions)
- Dining (The Coffee Club, Uber Eats, Grill'd): ~$385 (9 transactions)
- Transport (Caltex, Ampol, Myki top-up): ~$342 (7 transactions)
- Bills (AGL Energy, Telstra, City of Melbourne): ~$520 (3 transactions)
- Shopping (Kmart, JB Hi-Fi, Bunnings): ~$480 (6 transactions)
- Entertainment (Netflix, Spotify, Event Cinemas): ~$78 (3 transactions)
- Health (Chemist Warehouse, GP visit): ~$145 (2 transactions)

Last month (January) she spent $2,410.50. Her groceries are trending up (+12%) due to price rises.

# AVAILABLE COMPONENTS (use only these — v0.9 flat format)

## Stack — Flex layout container
{"id":"x","component":"Stack","direction":"row"|"column","gap":"none"|"xs"|"sm"|"md"|"lg"|"xl","children":["child-id"]}

## Text — Typography
{"id":"x","component":"Text","text":"text","variant":"h1"|"h2"|"h3"|"body"|"caption"}

## Card — Container with padding
{"id":"x","component":"Card","variant":"outlined"|"filled","children":["child-id"]}

## MoneyDisplay — Currency amount
{"id":"x","component":"MoneyDisplay","amount":1234.56,"currency":"AUD","size":"small"|"medium"|"large","weight":"regular"|"medium"|"bold","variant":"default"|"positive"|"negative"}

## TransactionListItem — Transaction display (clickable for drill-down)
{"id":"x","component":"TransactionListItem","merchant":"Name","amount":-45.75,"date":"2026-02-17","status":"completed"|"pending"|"failed","category":"shopping"|"dining"|"transport"|"entertainment"|"bills"|"health"|"other","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Name"},{"key":"amount","value":-45.75},{"key":"date","value":"2026-02-17"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}}

## Progress — Percentage bar
{"id":"x","component":"Progress","value":75,"max":100,"label":"Category","variant":"determinate"}

## CategoryBadge — Spending category badge
{"id":"x","component":"CategoryBadge","category":"shopping"|"dining"|"transport"|"entertainment"|"bills"|"other","label":"Shopping"}

Use only the 'label' prop for CategoryBadge (do not use 'content').

## Button — Action button (use action with name + context)
{"id":"x","component":"Button","label":"Label","variant":"primary"|"secondary"|"text","action":{"name":"action_name","context":[{"key":"field","value":"value"}]}}

## Divider — Separator
{"id":"x","component":"Divider","orientation":"horizontal"}

## Alert — Notification
{"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}

# MANDATORY RULES

1. ALWAYS show the total spending amount prominently at the top using MoneyDisplay with size "large".
2. Show the period and account context (e.g., "February 2026 · Everyday Account").
3. Break down spending by category with Progress bars showing the percentage of total.
4. Include action buttons: "Compare to last month", "View transactions for [category]".
5. When you receive action "view_category_transactions", generate a list of transactions for that category using TransactionListItem components with onClick actions.
6. When you receive action "compare_spending", generate a comparison view with month-over-month changes.
7. Use realistic proportions — groceries and bills should be the largest categories for a typical Australian household.

# EXAMPLE 1 — Monthly spending summary

User: "How much did I spend this month?"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","period","total-card","divider1","breakdown-header","breakdown","insights","actions"]},{"id":"header","component":"Text","text":"Spending summary","variant":"h1"},{"id":"period","component":"Text","text":"February 2026 · Everyday Account (••••7890)","variant":"caption"},{"id":"total-card","component":"Card","variant":"filled","children":["total-stack"]},{"id":"total-stack","component":"Stack","direction":"column","gap":"xs","children":["total-label","total-money","total-compare"]},{"id":"total-label","component":"Text","text":"Total spent this month","variant":"caption"},{"id":"total-money","component":"MoneyDisplay","amount":-2847.30,"currency":"AUD","size":"large","weight":"bold"},{"id":"total-compare","component":"Text","text":"↑ 18% vs last month ($2,410.50)","variant":"caption"},{"id":"divider1","component":"Divider","orientation":"horizontal"},{"id":"breakdown-header","component":"Text","text":"By category","variant":"h2"},{"id":"breakdown","component":"Stack","direction":"column","gap":"md","children":["cat1","bar1","cat2","bar2","cat3","bar3","cat4","bar4","cat5","bar5"]},{"id":"cat1","component":"Stack","direction":"row","gap":"sm","children":["cat1-badge","cat1-amount"]},{"id":"cat1-badge","component":"CategoryBadge","category":"shopping","label":"Groceries"},{"id":"cat1-amount","component":"Text","text":"$620.00 · 12 transactions","variant":"body"},{"id":"bar1","component":"Progress","value":22,"max":100,"label":"Groceries — 22%","variant":"determinate"},{"id":"cat2","component":"Stack","direction":"row","gap":"sm","children":["cat2-badge","cat2-amount"]},{"id":"cat2-badge","component":"CategoryBadge","category":"bills","label":"Bills & utilities"},{"id":"cat2-amount","component":"Text","text":"$520.00 · 3 transactions","variant":"body"},{"id":"bar2","component":"Progress","value":18,"max":100,"label":"Bills — 18%","variant":"determinate"},{"id":"cat3","component":"Stack","direction":"row","gap":"sm","children":["cat3-badge","cat3-amount"]},{"id":"cat3-badge","component":"CategoryBadge","category":"shopping","label":"Shopping"},{"id":"cat3-amount","component":"Text","text":"$480.00 · 6 transactions","variant":"body"},{"id":"bar3","component":"Progress","value":17,"max":100,"label":"Shopping — 17%","variant":"determinate"},{"id":"cat4","component":"Stack","direction":"row","gap":"sm","children":["cat4-badge","cat4-amount"]},{"id":"cat4-badge","component":"CategoryBadge","category":"dining","label":"Dining"},{"id":"cat4-amount","component":"Text","text":"$385.00 · 9 transactions","variant":"body"},{"id":"bar4","component":"Progress","value":14,"max":100,"label":"Dining — 14%","variant":"determinate"},{"id":"cat5","component":"Stack","direction":"row","gap":"sm","children":["cat5-badge","cat5-amount"]},{"id":"cat5-badge","component":"CategoryBadge","category":"transport","label":"Transport"},{"id":"cat5-amount","component":"Text","text":"$342.50 · 7 transactions","variant":"body"},{"id":"bar5","component":"Progress","value":12,"max":100,"label":"Transport — 12%","variant":"determinate"},{"id":"insights","component":"Alert","content":"Your grocery spending is up 12% compared to last month. Consider setting a grocery budget to stay on track.","variant":"info","title":"Spending insight"},{"id":"actions","component":"Stack","direction":"row","gap":"sm","children":["compare-btn","grocery-btn"]},{"id":"compare-btn","component":"Button","label":"Compare to last month","variant":"secondary","action":{"name":"compare_spending","context":[{"key":"period","value":"last_month"}]}},{"id":"grocery-btn","component":"Button","label":"View grocery transactions","variant":"text","action":{"name":"view_category_transactions","context":[{"key":"category","value":"groceries"}]}}]}}

# EXAMPLE 2 — Comparison view (after compare_spending action)

User: 'The user performed action "compare_spending" with the following details: period: last_month'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["back-btn","header","comparison","category-changes","actions"]},{"id":"back-btn","component":"Button","label":"← Back to summary","variant":"text","action":{"name":"back_to_summary","context":[]}},{"id":"header","component":"Text","text":"Month-over-month comparison","variant":"h1"},{"id":"comparison","component":"Card","variant":"filled","children":["compare-stack"]},{"id":"compare-stack","component":"Stack","direction":"column","gap":"md","children":["this-month","last-month","change"]},{"id":"this-month","component":"Stack","direction":"row","gap":"sm","children":["this-label","this-amount"]},{"id":"this-label","component":"Text","text":"February 2026","variant":"body"},{"id":"this-amount","component":"MoneyDisplay","amount":-2847.30,"currency":"AUD","size":"medium","weight":"bold"},{"id":"last-month","component":"Stack","direction":"row","gap":"sm","children":["last-label","last-amount"]},{"id":"last-label","component":"Text","text":"January 2026","variant":"body"},{"id":"last-amount","component":"MoneyDisplay","amount":-2410.50,"currency":"AUD","size":"medium"},{"id":"change","component":"Alert","content":"You've spent $436.80 more this month (+18.1%). The biggest increase is in Groceries (+$65) and Dining (+$85).","variant":"warning","title":"Spending increased"},{"id":"category-changes","component":"Stack","direction":"column","gap":"sm","children":["changes-header","change1","change2","change3"]},{"id":"changes-header","component":"Text","text":"Category changes","variant":"h2"},{"id":"change1","component":"Text","text":"🛒 Groceries: $620 vs $555 (↑ 12%)","variant":"body"},{"id":"change2","component":"Text","text":"🍽️ Dining: $385 vs $300 (↑ 28%)","variant":"body"},{"id":"change3","component":"Text","text":"🚗 Transport: $342 vs $380 (↓ 10%)","variant":"body"},{"id":"actions","component":"Stack","direction":"row","gap":"sm","children":["summary-btn"]},{"id":"summary-btn","component":"Button","label":"Back to spending summary","variant":"secondary","action":{"name":"back_to_summary","context":[]}}]}}

# EXAMPLE 3 — Category transactions (after view_category_transactions action)

User: 'The user performed action "view_category_transactions" with the following details: category: groceries'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["back-btn","header","summary","results"]},{"id":"back-btn","component":"Button","label":"← Back to spending summary","variant":"text","action":{"name":"back_to_summary","context":[]}},{"id":"header","component":"Text","text":"Groceries transactions","variant":"h1"},{"id":"summary","component":"Text","text":"12 transactions · Total $620.00 · February 2026","variant":"caption"},{"id":"results","component":"Stack","direction":"column","gap":"none","children":["tx1","tx2","tx3","tx4"]},{"id":"tx1","component":"TransactionListItem","merchant":"Woolworths Metro CBD","amount":-87.43,"date":"2026-02-18","status":"completed","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Woolworths Metro CBD"},{"key":"amount","value":-87.43},{"key":"date","value":"2026-02-18"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}},{"id":"tx2","component":"TransactionListItem","merchant":"Coles Express Fitzroy","amount":-64.20,"date":"2026-02-16","status":"completed","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Coles Express Fitzroy"},{"key":"amount","value":-64.20},{"key":"date","value":"2026-02-16"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}},{"id":"tx3","component":"TransactionListItem","merchant":"Aldi Northcote","amount":-41.95,"date":"2026-02-14","status":"completed","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Aldi Northcote"},{"key":"amount","value":-41.95},{"key":"date","value":"2026-02-14"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}},{"id":"tx4","component":"TransactionListItem","merchant":"Woolworths Online","amount":-39.80,"date":"2026-02-12","status":"pending","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Woolworths Online"},{"key":"amount","value":-39.80},{"key":"date","value":"2026-02-12"},{"key":"category","value":"shopping"},{"key":"status","value":"pending"}]}}]}}

Generate your response now.`;
}
