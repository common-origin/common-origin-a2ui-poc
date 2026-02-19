/**
 * Account Overview Prompt — v0.9
 *
 * Focused prompt for account overview / dashboard scenarios.
 * Shows all accounts, recent activity, quick actions.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getAccountOverviewPrompt(): string {
  return `
# SCENARIO: Account Overview / Dashboard

The user wants to see their accounts, balances, or an overview of their financial position.

# CUSTOMER CONTEXT

The customer is Sarah Chen, based in Melbourne. She has:
- Everyday Account (••••7890) — $3,247.85 (BSB 063-842), trend: down $420 this week
- Goal Saver (••••4567) — $12,450.00 (BSB 063-842), trend: up $500 (auto-save)  
- Offset Account (••••1847) — $25,000.00 (BSB 063-842), linked to mortgage
- Platinum Credit Card (••••2103) — owing $1,892.40, limit $8,000, min payment due 28 Feb

Her most recent transactions:
- Woolworths Metro CBD — -$87.43 (today, shopping)
- The Coffee Club — -$8.50 (today, dining)
- Uber Eats — -$27.24 (today, dining, pending)
- Salary Credit — +$4,250.00 (last Friday)

# AVAILABLE COMPONENTS (use only these — v0.9 flat format)

## Stack — Flex layout container
{"id":"x","component":"Stack","direction":"row"|"column","gap":"none"|"xs"|"sm"|"md"|"lg"|"xl","children":["child-id"]}

## Text — Typography
{"id":"x","component":"Text","text":"text","variant":"h1"|"h2"|"h3"|"body"|"caption"}

## AccountCard — Account display
{"id":"x","component":"AccountCard","accountName":"Name","accountNumber":"1234","balance":5000.00,"currency":"AUD","accountType":"savings"|"transaction"|"credit","trend":"up"|"down"|"neutral","trendValue":"+$500 this month"}

## MoneyDisplay — Currency amount
{"id":"x","component":"MoneyDisplay","amount":1234.56,"currency":"AUD","size":"large"|"medium"|"small","weight":"regular"|"bold"}

## TransactionListItem — Transaction display
{"id":"x","component":"TransactionListItem","merchant":"Name","amount":-45.75,"date":"2026-02-18","status":"completed"|"pending","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[...]}}

## Card — Container with padding
{"id":"x","component":"Card","variant":"outlined"|"filled","children":["child-id"]}

## Button — Action button
{"id":"x","component":"Button","label":"Label","variant":"primary"|"secondary"|"text","action":{"name":"action_name","context":[{"key":"field","value":"value"}]}}

## Alert — Notification
{"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}

## Divider — Separator
{"id":"x","component":"Divider","orientation":"horizontal"}

# MANDATORY RULES

1. Show a total net worth or total balance at the top.
2. Display each account using AccountCard with trend information where available.
3. Show 2-3 recent transactions for context.
4. Include quick action buttons: "Transfer funds", "View spending", "Search transactions".
5. If a credit card payment is due soon, show an Alert with a warning.
6. When you receive action "view_account_detail", show the detailed view for that account.

# EXAMPLE 1 — Full account overview

User: "Show my accounts"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","total","cc-alert","accounts-header","accounts","recent-header","recent","quick-actions"]},{"id":"header","component":"Text","text":"Good afternoon, Sarah","variant":"h1"},{"id":"total","component":"Stack","direction":"column","gap":"xs","children":["total-label","total-amount"]},{"id":"total-label","component":"Text","text":"Total across all accounts","variant":"caption"},{"id":"total-amount","component":"MoneyDisplay","amount":38805.45,"currency":"AUD","size":"large","weight":"bold"},{"id":"cc-alert","component":"Alert","content":"Your Platinum Credit Card minimum payment of $56.50 is due on 28 February. Current balance: $1,892.40.","variant":"warning","title":"Payment due soon"},{"id":"accounts-header","component":"Text","text":"Your accounts","variant":"h2"},{"id":"accounts","component":"Stack","direction":"column","gap":"md","children":["acc1","acc2","acc3","acc4"]},{"id":"acc1","component":"AccountCard","accountName":"Everyday Account","accountNumber":"7890","balance":3247.85,"currency":"AUD","accountType":"transaction","trend":"down","trendValue":"-$420 this week"},{"id":"acc2","component":"AccountCard","accountName":"Goal Saver","accountNumber":"4567","balance":12450.00,"currency":"AUD","accountType":"savings","trend":"up","trendValue":"+$500 auto-save"},{"id":"acc3","component":"AccountCard","accountName":"Offset Account","accountNumber":"1847","balance":25000.00,"currency":"AUD","accountType":"savings","trend":"neutral","trendValue":"No change"},{"id":"acc4","component":"AccountCard","accountName":"Platinum Credit Card","accountNumber":"2103","balance":-1892.40,"currency":"AUD","accountType":"credit"},{"id":"recent-header","component":"Text","text":"Recent activity","variant":"h2"},{"id":"recent","component":"Stack","direction":"column","gap":"none","children":["tx1","tx2","tx3"]},{"id":"tx1","component":"TransactionListItem","merchant":"Woolworths Metro CBD","amount":-87.43,"date":"2026-02-18","status":"completed","category":"shopping","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Woolworths Metro CBD"},{"key":"amount","value":-87.43},{"key":"date","value":"2026-02-18"},{"key":"category","value":"shopping"},{"key":"status","value":"completed"}]}},{"id":"tx2","component":"TransactionListItem","merchant":"The Coffee Club","amount":-8.50,"date":"2026-02-18","status":"completed","category":"dining","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"The Coffee Club"},{"key":"amount","value":-8.50},{"key":"date","value":"2026-02-18"},{"key":"category","value":"dining"},{"key":"status","value":"completed"}]}},{"id":"tx3","component":"TransactionListItem","merchant":"Uber Eats","amount":-27.24,"date":"2026-02-18","status":"pending","category":"dining","currency":"AUD","onClick":{"name":"view_transaction","context":[{"key":"merchant","value":"Uber Eats"},{"key":"amount","value":-27.24},{"key":"date","value":"2026-02-18"},{"key":"category","value":"dining"},{"key":"status","value":"pending"}]}},{"id":"quick-actions","component":"Stack","direction":"row","gap":"sm","children":["action-transfer","action-spending","action-search"]},{"id":"action-transfer","component":"Button","label":"Transfer funds","variant":"primary","action":{"name":"start_transfer","context":[]}},{"id":"action-spending","component":"Button","label":"View spending","variant":"secondary","action":{"name":"view_spending","context":[]}},{"id":"action-search","component":"Button","label":"Search transactions","variant":"text","action":{"name":"start_search","context":[]}}]}}

Generate your response now.`;
}
