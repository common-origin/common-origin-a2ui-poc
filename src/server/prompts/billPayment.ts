/**
 * Bill Payment Prompt — v0.9
 *
 * Focused prompt for bill payment / BPAY scenarios.
 * Includes multi-step flow: select biller → enter amount → review → confirm.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getBillPaymentPrompt(): string {
  return `
# SCENARIO: Bill Payment / BPAY

The user wants to pay a bill, make a BPAY payment, or manage scheduled payments.

# CUSTOMER CONTEXT

The customer is Sarah Chen. She pays from her Everyday Account (••••7890) — $3,247.85.

Her saved billers:
- AGL Energy — Biller Code 8374, Ref 9182 0045 2371 (electricity, ~$180-220/quarter)
- Telstra — Biller Code 7060, Ref 4021 8837 1256 (mobile + internet, ~$139/month)
- City of Melbourne — Biller Code 1847, Ref 2204 5591 8832 (rates, ~$480/quarter)
- Medibank Private — Biller Code 3391, Ref 7712 3300 8845 (health insurance, ~$245/month)
- Origin Energy — Biller Code 6214, Ref 1155 8823 4490 (gas, ~$85/quarter)

Upcoming bills:
- Telstra — $139.00 due 22 Feb 2026 (3 days away)
- Medibank Private — $245.00 due 1 Mar 2026
- AGL Energy — $198.50 due 15 Mar 2026

# AVAILABLE COMPONENTS (use only these — v0.9 flat format)

## Stack — Flex layout container
{"id":"x","component":"Stack","direction":"row"|"column","gap":"none"|"xs"|"sm"|"md"|"lg"|"xl","children":["child-id"]}

## Text — Typography
{"id":"x","component":"Text","text":"text","variant":"h1"|"h2"|"h3"|"body"|"caption"}

## Card — Container with padding
{"id":"x","component":"Card","variant":"outlined"|"filled","children":["child-id"]}

## TextField — Text input
{"id":"x","component":"TextField","value":{"path":"/fieldName"},"onChange":{"eventType":"change","dataPath":"fieldName"},"label":"Label","placeholder":"Placeholder"}

## NumberField — Numeric input
{"id":"x","component":"NumberField","value":{"path":"/amount"},"onChange":{"eventType":"change","dataPath":"amount"},"label":"Amount","min":0}

## Select — Dropdown
{"id":"x","component":"Select","value":{"path":"/field"},"onChange":{"eventType":"change","dataPath":"field"},"label":"Label","options":[{"label":"Option1","value":"opt1"}]}

## Button — Action button
{"id":"x","component":"Button","label":"Label","variant":"primary"|"secondary"|"text","action":{"name":"action_name","context":[{"key":"field","value":"value"}]}}

## AccountCard — Account display
{"id":"x","component":"AccountCard","accountName":"Name","accountNumber":"1234","balance":5000.00,"currency":"AUD","accountType":"transaction"}

## MoneyDisplay — Currency amount
{"id":"x","component":"MoneyDisplay","amount":1234.56,"currency":"AUD","size":"large"|"medium"|"small","weight":"regular"|"bold"}

## Alert — Notification
{"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}

## Divider — Separator
{"id":"x","component":"Divider","orientation":"horizontal"}

## ListItem — List item with primary/secondary text
{"id":"x","component":"ListItem","primary":"Primary text","secondary":"Secondary text","interactive":true,"onClick":{"name":"action","context":[]}}

## List — List container
{"id":"x","component":"List","dividers":true,"children":["item1","item2"]}

# BILL PAYMENT FLOW

1. **Select Biller** — Show saved billers or search for a new biller, show upcoming bills
   - Clicking a biller/bill: action: {"name":"select_biller","context":[{"key":"biller","value":"AGL Energy"},{"key":"amount","value":198.50}]}

2. **Payment Form** (when you receive action "select_biller") — Show amount, from account, payment date
   - "Review Payment" button: action: {"name":"review_payment","context":[...all fields...]}

3. **Review Screen** (when you receive "review_payment") — Summary with "Pay now" and "Edit" buttons
   - "Pay now" button: action: {"name":"confirm_payment","context":[...]}
   - "Edit" button: action: {"name":"back_to_form","context":[]}

4. **Success Screen** (when you receive "confirm_payment") — Confirmation with receipt number

# EXAMPLE 1 — Upcoming bills view

User: "Pay a bill"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","upcoming-header","upcoming-alert","upcoming-list","saved-header","saved-list"]},{"id":"header","component":"Text","text":"Pay a bill","variant":"h1"},{"id":"upcoming-header","component":"Text","text":"Upcoming bills","variant":"h2"},{"id":"upcoming-alert","component":"Alert","content":"Your Telstra bill of $139.00 is due in 3 days (22 Feb 2026).","variant":"warning","title":"Due soon"},{"id":"upcoming-list","component":"List","dividers":true,"children":["bill1","bill2","bill3"]},{"id":"bill1","component":"ListItem","primary":"Telstra — $139.00","secondary":"Due 22 Feb 2026 · Mobile + Internet","interactive":true,"onClick":{"name":"select_biller","context":[{"key":"biller","value":"Telstra"},{"key":"billerCode","value":"7060"},{"key":"reference","value":"4021 8837 1256"},{"key":"amount","value":139.00},{"key":"dueDate","value":"2026-02-22"}]}},{"id":"bill2","component":"ListItem","primary":"Medibank Private — $245.00","secondary":"Due 1 Mar 2026 · Health insurance","interactive":true,"onClick":{"name":"select_biller","context":[{"key":"biller","value":"Medibank Private"},{"key":"billerCode","value":"3391"},{"key":"reference","value":"7712 3300 8845"},{"key":"amount","value":245.00},{"key":"dueDate","value":"2026-03-01"}]}},{"id":"bill3","component":"ListItem","primary":"AGL Energy — $198.50","secondary":"Due 15 Mar 2026 · Electricity","interactive":true,"onClick":{"name":"select_biller","context":[{"key":"biller","value":"AGL Energy"},{"key":"billerCode","value":"8374"},{"key":"reference","value":"9182 0045 2371"},{"key":"amount","value":198.50},{"key":"dueDate","value":"2026-03-15"}]}},{"id":"saved-header","component":"Text","text":"Saved billers","variant":"h2"},{"id":"saved-list","component":"List","dividers":true,"children":["biller1","biller2"]},{"id":"biller1","component":"ListItem","primary":"Origin Energy","secondary":"Biller Code: 6214 · Gas","interactive":true,"onClick":{"name":"select_biller","context":[{"key":"biller","value":"Origin Energy"},{"key":"billerCode","value":"6214"},{"key":"reference","value":"1155 8823 4490"},{"key":"amount","value":0},{"key":"dueDate","value":""}]}},{"id":"biller2","component":"ListItem","primary":"City of Melbourne","secondary":"Biller Code: 1847 · Council rates","interactive":true,"onClick":{"name":"select_biller","context":[{"key":"biller","value":"City of Melbourne"},{"key":"billerCode","value":"1847"},{"key":"reference","value":"2204 5591 8832"},{"key":"amount","value":0},{"key":"dueDate","value":""}]}}]}}

# EXAMPLE 2 — Payment form (after select_biller)

User: 'The user performed action "select_biller" with the following details: biller: Telstra, billerCode: 7060, reference: 4021 8837 1256, amount: 139.00, dueDate: 2026-02-22'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["back-btn","header","biller-card","from-account","form","actions"]},{"id":"back-btn","component":"Button","label":"← Back to bills","variant":"text","action":{"name":"back_to_bills","context":[]}},{"id":"header","component":"Text","text":"Pay Telstra","variant":"h1"},{"id":"biller-card","component":"Card","variant":"outlined","children":["biller-details"]},{"id":"biller-details","component":"Stack","direction":"column","gap":"xs","children":["biller-name","biller-ref","biller-due"]},{"id":"biller-name","component":"Text","text":"Telstra · Mobile + Internet","variant":"body"},{"id":"biller-ref","component":"Text","text":"Biller Code: 7060 · Ref: 4021 8837 1256","variant":"caption"},{"id":"biller-due","component":"Text","text":"Due: 22 February 2026 (3 days)","variant":"caption"},{"id":"from-account","component":"AccountCard","accountName":"Everyday Account","accountNumber":"7890","balance":3247.85,"currency":"AUD","accountType":"transaction"},{"id":"form","component":"Stack","direction":"column","gap":"md","children":["amount-field","date-field"]},{"id":"amount-field","component":"NumberField","value":{"path":"/amount"},"onChange":{"eventType":"change","dataPath":"amount"},"label":"Amount","min":0.01},{"id":"date-field","component":"Select","value":{"path":"/paymentDate"},"onChange":{"eventType":"change","dataPath":"paymentDate"},"label":"Payment date","options":[{"label":"Pay now","value":"now"},{"label":"Pay on due date (22 Feb)","value":"2026-02-22"},{"label":"Choose a date","value":"custom"}]},{"id":"actions","component":"Stack","direction":"row","gap":"md","children":["cancel-btn","review-btn"]},{"id":"cancel-btn","component":"Button","label":"Cancel","variant":"secondary","action":{"name":"back_to_bills","context":[]}},{"id":"review-btn","component":"Button","label":"Review payment","variant":"primary","action":{"name":"review_payment","context":[{"key":"biller","value":"Telstra"},{"key":"billerCode","value":"7060"},{"key":"reference","value":"4021 8837 1256"},{"key":"amount","value":{"path":"/amount"}},{"key":"fromAccount","value":"Everyday Account (••••7890)"},{"key":"paymentDate","value":{"path":"/paymentDate"}}]}}]}}
{"updateDataModel":{"surfaceId":"main","value":{"amount":139.00,"paymentDate":"now"}}}

Generate your response now.`;
}
