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

Generate your response now.`;
}
