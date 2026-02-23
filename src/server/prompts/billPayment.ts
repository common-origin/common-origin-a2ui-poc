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
{"id":"x","component":"AccountCard","accountName":"Name","accountNumber":"1234","balance":5000.00,"currency":"AUD","accountType":"everyday"}

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

# MANDATORY RULES

1. Show upcoming due bills first, then saved billers.
2. Every selectable bill/biller ListItem must be interactive and include onClick action "select_biller" with context keys: biller, billerCode, reference, amount, dueDate.
3. Payment form must include editable amount (NumberField) and payment date (Select) with local onChange bindings.
4. Review step must show a clear payment summary and include both "confirm_payment" and "back_to_form" actions.
5. Success step must include a confirmation message and receipt/reference number.
6. All amounts must be AUD and realistic for Australian bill payments.

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
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["back-btn","header","biller-card","from-account","form","actions"]},{"id":"back-btn","component":"Button","label":"← Back to bills","variant":"text","action":{"name":"back_to_bills","context":[]}},{"id":"header","component":"Text","text":"Pay Telstra","variant":"h1"},{"id":"biller-card","component":"Card","variant":"outlined","children":["biller-details"]},{"id":"biller-details","component":"Stack","direction":"column","gap":"xs","children":["biller-name","biller-ref","biller-due"]},{"id":"biller-name","component":"Text","text":"Telstra · Mobile + Internet","variant":"body"},{"id":"biller-ref","component":"Text","text":"Biller Code: 7060 · Ref: 4021 8837 1256","variant":"caption"},{"id":"biller-due","component":"Text","text":"Due: 22 February 2026 (3 days)","variant":"caption"},{"id":"from-account","component":"AccountCard","accountName":"Everyday Account","accountNumber":"7890","balance":3247.85,"currency":"AUD","accountType":"everyday"},{"id":"form","component":"Stack","direction":"column","gap":"md","children":["amount-field","date-field"]},{"id":"amount-field","component":"NumberField","value":{"path":"/amount"},"onChange":{"eventType":"change","dataPath":"amount"},"label":"Amount","min":0.01},{"id":"date-field","component":"Select","value":{"path":"/paymentDate"},"onChange":{"eventType":"change","dataPath":"paymentDate"},"label":"Payment date","options":[{"label":"Pay now","value":"now"},{"label":"Pay on due date (22 Feb)","value":"2026-02-22"},{"label":"Choose a date","value":"custom"}]},{"id":"actions","component":"Stack","direction":"row","gap":"md","children":["cancel-btn","review-btn"]},{"id":"cancel-btn","component":"Button","label":"Cancel","variant":"secondary","action":{"name":"back_to_bills","context":[]}},{"id":"review-btn","component":"Button","label":"Review payment","variant":"primary","action":{"name":"review_payment","context":[{"key":"biller","value":"Telstra"},{"key":"billerCode","value":"7060"},{"key":"reference","value":"4021 8837 1256"},{"key":"amount","value":{"path":"/amount"}},{"key":"fromAccount","value":"Everyday Account (••••7890)"},{"key":"paymentDate","value":{"path":"/paymentDate"}}]}}]}}
{"updateDataModel":{"surfaceId":"main","value":{"amount":139.00,"paymentDate":"now"}}}

# EXAMPLE 3 — Review screen (after review_payment)

User: 'The user performed action "review_payment" with the following details: biller: Telstra, billerCode: 7060, reference: 4021 8837 1256, amount: 139, fromAccount: Everyday Account (••••7890), paymentDate: now'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["back-btn","header","summary-card","actions"]},{"id":"back-btn","component":"Button","label":"← Edit payment","variant":"text","action":{"name":"back_to_form","context":[]}},{"id":"header","component":"Text","text":"Review bill payment","variant":"h1"},{"id":"summary-card","component":"Card","variant":"outlined","children":["summary-stack"]},{"id":"summary-stack","component":"Stack","direction":"column","gap":"sm","children":["row1","row2","row3","row4","row5","row6"]},{"id":"row1","component":"Text","text":"Biller: Telstra","variant":"body"},{"id":"row2","component":"Text","text":"Biller code: 7060","variant":"body"},{"id":"row3","component":"Text","text":"Reference: 4021 8837 1256","variant":"body"},{"id":"row4","component":"Text","text":"From: Everyday Account (••••7890)","variant":"body"},{"id":"row5","component":"Text","text":"Payment date: now","variant":"body"},{"id":"row6","component":"MoneyDisplay","amount":-139.00,"currency":"AUD","size":"large","weight":"bold","variant":"negative"},{"id":"actions","component":"Stack","direction":"row","gap":"md","children":["edit-btn","confirm-btn"]},{"id":"edit-btn","component":"Button","label":"Edit","variant":"secondary","action":{"name":"back_to_form","context":[]}},{"id":"confirm-btn","component":"Button","label":"Pay now","variant":"primary","action":{"name":"confirm_payment","context":[{"key":"biller","value":"Telstra"},{"key":"amount","value":139.00},{"key":"reference","value":"4021 8837 1256"},{"key":"paymentDate","value":"now"}]}}]}}

# EXAMPLE 4 — Success screen (after confirm_payment)

User: 'The user performed action "confirm_payment" with the following details: biller: Telstra, amount: 139, reference: 4021 8837 1256, paymentDate: now'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["success","receipt-card","actions"]},{"id":"success","component":"Alert","content":"Your BPAY payment to Telstra has been submitted successfully.","variant":"success","title":"Payment complete"},{"id":"receipt-card","component":"Card","variant":"outlined","children":["receipt-stack"]},{"id":"receipt-stack","component":"Stack","direction":"column","gap":"sm","children":["amount","biller","date","receipt"]},{"id":"amount","component":"MoneyDisplay","amount":-139.00,"currency":"AUD","size":"large","weight":"bold","variant":"negative"},{"id":"biller","component":"Text","text":"Biller: Telstra","variant":"body"},{"id":"date","component":"Text","text":"Processed: 23 February 2026","variant":"body"},{"id":"receipt","component":"Text","text":"Receipt number: BPAY-20260223-9174","variant":"caption"},{"id":"actions","component":"Stack","direction":"row","gap":"sm","children":["done-btn","another-btn"]},{"id":"done-btn","component":"Button","label":"Done","variant":"primary","action":{"name":"back_to_bills","context":[]}},{"id":"another-btn","component":"Button","label":"Pay another bill","variant":"secondary","action":{"name":"start_bill_payment","context":[]}}]}}

Generate your response now.`;
}
