/**
 * Fund Transfer Prompt — v0.9
 *
 * Focused prompt for money transfer / payment scenarios.
 * Only includes form components relevant to transfers.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getFundTransferPrompt(): string {
  return `
# SCENARIO: Fund Transfer / Payment

The user wants to send money, transfer funds, or make a payment.

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
{"id":"x","component":"NumberField","value":{"path":"/amount"},"onChange":{"eventType":"change","dataPath":"amount"},"label":"Amount","prefix":"$","min":0}

## Select — Dropdown
{"id":"x","component":"Select","value":{"path":"/field"},"onChange":{"eventType":"change","dataPath":"field"},"label":"Label","options":[{"label":"Option1","value":"opt1"}]}

## Checkbox — Boolean toggle
{"id":"x","component":"Checkbox","checked":false,"label":"Label","onChange":{"eventType":"change","dataPath":"field"}}

## Button — Action button
{"id":"x","component":"Button","label":"Label","variant":"primary"|"secondary"|"text","onClick":{"eventType":"submit","dataPath":"data"},"disabled":false}

## AccountCard — Account display
{"id":"x","component":"AccountCard","accountName":"Name","accountNumber":"1234","balance":5000.00,"currency":"AUD","accountType":"savings"|"transaction"}

## Alert — Notification
{"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}

## MoneyDisplay — Currency amount
{"id":"x","component":"MoneyDisplay","amount":100.00,"currency":"AUD","size":"lg"|"md"|"sm","label":"Label"}

## Divider — Separator
{"id":"x","component":"Divider","orientation":"horizontal"}

# EXAMPLE

User: "Transfer $200 to savings"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","from-card","to-card","divider","amount-section","actions"]},{"id":"header","component":"Text","text":"Transfer funds","variant":"h1"},{"id":"from-card","component":"AccountCard","accountName":"Everyday Account","accountNumber":"7890","balance":3250.00,"currency":"AUD","accountType":"transaction"},{"id":"to-card","component":"AccountCard","accountName":"Goal Saver","accountNumber":"4567","balance":12500.00,"currency":"AUD","accountType":"savings"},{"id":"divider","component":"Divider","orientation":"horizontal"},{"id":"amount-section","component":"Stack","direction":"column","gap":"md","children":["amount-input","desc-input"]},{"id":"amount-input","component":"NumberField","value":{"path":"/amount"},"onChange":{"eventType":"change","dataPath":"amount"},"label":"Amount","prefix":"$","min":0},{"id":"desc-input","component":"TextField","value":{"path":"/description"},"onChange":{"eventType":"change","dataPath":"description"},"label":"Description","placeholder":"Optional"},{"id":"actions","component":"Stack","direction":"row","gap":"md","children":["cancel-btn","confirm-btn"]},{"id":"cancel-btn","component":"Button","label":"Cancel","variant":"secondary","onClick":{"eventType":"submit","dataPath":"cancel"}},{"id":"confirm-btn","component":"Button","label":"Transfer $200.00","variant":"primary","onClick":{"eventType":"submit","dataPath":"transfer"}}]}}
{"updateDataModel":{"surfaceId":"main","value":{"amount":200,"description":""}}}

Generate your response now.`;
}
