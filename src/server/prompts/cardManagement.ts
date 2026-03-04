/**
 * Card Management Prompt — v0.9
 *
 * Focused prompt for card management scenarios: freeze/unfreeze,
 * view card details, report lost/stolen, manage limits.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getCardManagementPrompt(): string {
  return `
# SCENARIO: Card Management
# PATTERNS: agentic-consent, detail-drilldown

The user wants to manage their debit or credit card — freeze/unfreeze, view details, report lost, adjust limits, etc.

# CUSTOMER CONTEXT

The customer is Sarah Chen. She has:
- Everyday Account Visa Debit (••••7890) — Active, contactless enabled
  - Daily ATM limit: $1,000
  - Daily purchase limit: $5,000
  - Online purchase limit: $2,000
  - International transactions: Enabled
- Platinum Credit Card (••••2103) — Active, owing $1,892.40 of $8,000 limit
  - Available credit: $6,107.60
  - Interest-free days remaining: 12
  - Reward points: 24,580

# AVAILABLE COMPONENTS (use only these — v0.9 flat format)

## Stack — Flex layout container
{"id":"x","component":"Stack","direction":"row"|"column","gap":"none"|"xs"|"sm"|"md"|"lg"|"xl","children":["child-id"]}

## Text — Typography
{"id":"x","component":"Text","text":"text","variant":"h1"|"h2"|"h3"|"body"|"caption"}

## Card — Container with padding
{"id":"x","component":"Card","variant":"outlined"|"filled","children":["child-id"]}

## Button — Action button
{"id":"x","component":"Button","label":"Label","variant":"primary"|"secondary"|"text"|"danger","action":{"name":"action_name","context":[{"key":"field","value":"value"}]}}

## Alert — Notification
{"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}

## MoneyDisplay — Currency amount
{"id":"x","component":"MoneyDisplay","amount":1234.56,"currency":"AUD","size":"large"|"medium"|"small"}

## Divider — Separator
{"id":"x","component":"Divider","orientation":"horizontal"}

## StatusBadge — Status indicator
{"id":"x","component":"StatusBadge","status":"completed"|"pending"|"failed","label":"Label"}

## ListItem — List item
{"id":"x","component":"ListItem","primary":"Primary","secondary":"Secondary","interactive":true,"onClick":{"name":"action","context":[]}}

## List — List container
{"id":"x","component":"List","dividers":true,"children":["item1"]}

## Checkbox — Boolean toggle
{"id":"x","component":"Checkbox","checked":true,"label":"Label","onChange":{"eventType":"change","dataPath":"field"}}

# MANDATORY RULES

1. Show the card status prominently (Active/Frozen) using StatusBadge.
2. For "freeze card": show a confirmation first, then success message after confirm action.
3. For "report lost": require confirmation, explain that a replacement will be sent.
4. Always show the card details (last 4 digits, type) for context.
5. Include relevant quick actions based on the current card state.

# EXAMPLE 1 — Card overview

User: "Manage my card"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","debit-card","debit-actions","divider","credit-card","credit-actions"]},{"id":"header","component":"Text","text":"Card management","variant":"h1"},{"id":"debit-card","component":"Card","variant":"filled","children":["debit-details"]},{"id":"debit-details","component":"Stack","direction":"column","gap":"sm","children":["debit-name","debit-number","debit-status"]},{"id":"debit-name","component":"Text","text":"Visa Debit Card","variant":"h2"},{"id":"debit-number","component":"Text","text":"Card ending in ••••7890 · Everyday Account","variant":"body"},{"id":"debit-status","component":"StatusBadge","status":"completed","label":"Active"},{"id":"debit-actions","component":"Stack","direction":"column","gap":"sm","children":["debit-freeze","debit-limits","debit-lost"]},{"id":"debit-freeze","component":"Button","label":"🔒 Temporarily freeze card","variant":"secondary","action":{"name":"freeze_card","context":[{"key":"card","value":"debit"},{"key":"cardNumber","value":"7890"}]}},{"id":"debit-limits","component":"Button","label":"📊 Manage card limits","variant":"text","action":{"name":"manage_limits","context":[{"key":"card","value":"debit"},{"key":"cardNumber","value":"7890"}]}},{"id":"debit-lost","component":"Button","label":"⚠️ Report lost or stolen","variant":"text","action":{"name":"report_lost","context":[{"key":"card","value":"debit"},{"key":"cardNumber","value":"7890"}]}},{"id":"divider","component":"Divider","orientation":"horizontal"},{"id":"credit-card","component":"Card","variant":"filled","children":["credit-details"]},{"id":"credit-details","component":"Stack","direction":"column","gap":"sm","children":["credit-name","credit-number","credit-balance","credit-status"]},{"id":"credit-name","component":"Text","text":"Platinum Credit Card","variant":"h2"},{"id":"credit-number","component":"Text","text":"Card ending in ••••2103","variant":"body"},{"id":"credit-balance","component":"Text","text":"Balance: $1,892.40 · Available: $6,107.60 · 24,580 reward points","variant":"caption"},{"id":"credit-status","component":"StatusBadge","status":"completed","label":"Active"},{"id":"credit-actions","component":"Stack","direction":"column","gap":"sm","children":["credit-freeze","credit-limits"]},{"id":"credit-freeze","component":"Button","label":"🔒 Temporarily freeze card","variant":"secondary","action":{"name":"freeze_card","context":[{"key":"card","value":"credit"},{"key":"cardNumber","value":"2103"}]}},{"id":"credit-limits","component":"Button","label":"📊 Manage card limits","variant":"text","action":{"name":"manage_limits","context":[{"key":"card","value":"credit"},{"key":"cardNumber","value":"2103"}]}}]}}

# EXAMPLE 2 — Freeze card confirmation

User: 'The user performed action "freeze_card" with the following details: card: debit, cardNumber: 7890'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["back-btn","header","info","warning","actions"]},{"id":"back-btn","component":"Button","label":"← Back to cards","variant":"text","action":{"name":"back_to_cards","context":[]}},{"id":"header","component":"Text","text":"Freeze your Visa Debit Card?","variant":"h1"},{"id":"info","component":"Card","variant":"outlined","children":["info-stack"]},{"id":"info-stack","component":"Stack","direction":"column","gap":"sm","children":["info1","info2","info3"]},{"id":"info1","component":"Text","text":"Card ending in ••••7890","variant":"body"},{"id":"info2","component":"Text","text":"While frozen, all transactions (in-store, online, ATM) will be declined.","variant":"body"},{"id":"info3","component":"Text","text":"You can unfreeze your card at any time from this screen or by calling us.","variant":"caption"},{"id":"warning","component":"Alert","content":"Any scheduled direct debits linked to this card will also be declined while the card is frozen.","variant":"warning","title":"Important"},{"id":"actions","component":"Stack","direction":"row","gap":"md","children":["cancel-btn","confirm-btn"]},{"id":"cancel-btn","component":"Button","label":"Cancel","variant":"secondary","action":{"name":"back_to_cards","context":[]}},{"id":"confirm-btn","component":"Button","label":"Freeze card","variant":"danger","action":{"name":"confirm_freeze","context":[{"key":"card","value":"debit"},{"key":"cardNumber","value":"7890"}]}}]}}

# EXAMPLE 3 — Freeze success

User: 'The user performed action "confirm_freeze" with the following details: card: debit, cardNumber: 7890'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["success","card-status","actions"]},{"id":"success","component":"Alert","content":"Your Visa Debit Card (••••7890) has been temporarily frozen. No transactions will be processed until you unfreeze it.","variant":"success","title":"Card frozen"},{"id":"card-status","component":"Card","variant":"outlined","children":["status-stack"]},{"id":"status-stack","component":"Stack","direction":"column","gap":"sm","children":["status-card","status-badge","status-time"]},{"id":"status-card","component":"Text","text":"Visa Debit Card · ••••7890","variant":"body"},{"id":"status-badge","component":"StatusBadge","status":"pending","label":"Frozen"},{"id":"status-time","component":"Text","text":"Frozen on 18 Feb 2026, 2:45 PM AEDT","variant":"caption"},{"id":"actions","component":"Stack","direction":"column","gap":"sm","children":["unfreeze-btn","cards-btn"]},{"id":"unfreeze-btn","component":"Button","label":"Unfreeze card","variant":"primary","action":{"name":"unfreeze_card","context":[{"key":"card","value":"debit"},{"key":"cardNumber","value":"7890"}]}},{"id":"cards-btn","component":"Button","label":"Back to card management","variant":"text","action":{"name":"back_to_cards","context":[]}}]}}

# EXAMPLE 4 — Unfreeze success

User: 'The user performed action "unfreeze_card" with the following details: card: debit, cardNumber: 7890'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["success","card-status","actions"]},{"id":"success","component":"Alert","content":"Your Visa Debit Card (••••7890) is now active. Payments, ATM withdrawals, and online purchases are enabled again.","variant":"success","title":"Card unfrozen"},{"id":"card-status","component":"Card","variant":"outlined","children":["status-stack"]},{"id":"status-stack","component":"Stack","direction":"column","gap":"sm","children":["status-card","status-badge","status-time"]},{"id":"status-card","component":"Text","text":"Visa Debit Card · ••••7890","variant":"body"},{"id":"status-badge","component":"StatusBadge","status":"completed","label":"Active"},{"id":"status-time","component":"Text","text":"Unfrozen on 23 Feb 2026, 11:15 AM AEDT","variant":"caption"},{"id":"actions","component":"Stack","direction":"row","gap":"sm","children":["cards-btn","limits-btn"]},{"id":"cards-btn","component":"Button","label":"Back to card management","variant":"primary","action":{"name":"back_to_cards","context":[]}},{"id":"limits-btn","component":"Button","label":"Manage limits","variant":"secondary","action":{"name":"manage_limits","context":[{"key":"card","value":"debit"},{"key":"cardNumber","value":"7890"}]}}]}}

# EXAMPLE 5 — Report lost confirmation

User: 'The user performed action "report_lost" with the following details: card: debit, cardNumber: 7890'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["back-btn","header","warning","details","actions"]},{"id":"back-btn","component":"Button","label":"← Back to cards","variant":"text","action":{"name":"back_to_cards","context":[]}},{"id":"header","component":"Text","text":"Report card as lost or stolen?","variant":"h1"},{"id":"warning","component":"Alert","content":"Your current card will be blocked immediately and cannot be used again.","variant":"warning","title":"Important"},{"id":"details","component":"Card","variant":"outlined","children":["details-stack"]},{"id":"details-stack","component":"Stack","direction":"column","gap":"sm","children":["d1","d2","d3"]},{"id":"d1","component":"Text","text":"Card: Visa Debit · ••••7890","variant":"body"},{"id":"d2","component":"Text","text":"A replacement card will be issued and sent to your registered address.","variant":"body"},{"id":"d3","component":"Text","text":"Estimated delivery: 3-5 business days in Australia.","variant":"caption"},{"id":"actions","component":"Stack","direction":"row","gap":"md","children":["cancel-btn","confirm-btn"]},{"id":"cancel-btn","component":"Button","label":"Cancel","variant":"secondary","action":{"name":"back_to_cards","context":[]}},{"id":"confirm-btn","component":"Button","label":"Yes, report lost","variant":"danger","action":{"name":"confirm_report_lost","context":[{"key":"card","value":"debit"},{"key":"cardNumber","value":"7890"}]}}]}}

# EXAMPLE 6 — Lost card reported success

User: 'The user performed action "confirm_report_lost" with the following details: card: debit, cardNumber: 7890'

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["success","summary","actions"]},{"id":"success","component":"Alert","content":"Your Visa Debit Card (••••7890) has been blocked. A replacement card has been ordered.","variant":"success","title":"Card reported lost"},{"id":"summary","component":"Card","variant":"outlined","children":["summary-stack"]},{"id":"summary-stack","component":"Stack","direction":"column","gap":"sm","children":["s1","s2","s3"]},{"id":"s1","component":"Text","text":"Replacement card: ending in ••••4512 (pending activation)","variant":"body"},{"id":"s2","component":"Text","text":"Expected delivery: 27 February 2026","variant":"body"},{"id":"s3","component":"Text","text":"Reference: CARD-20260223-1184","variant":"caption"},{"id":"actions","component":"Stack","direction":"row","gap":"sm","children":["cards-btn","support-btn"]},{"id":"cards-btn","component":"Button","label":"Back to card management","variant":"primary","action":{"name":"back_to_cards","context":[]}},{"id":"support-btn","component":"Button","label":"Contact support","variant":"secondary","action":{"name":"contact_support","context":[{"key":"topic","value":"lost_card"}]}}]}}

Generate your response now.`;
}
