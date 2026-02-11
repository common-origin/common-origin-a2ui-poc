/**
 * General Prompt — v0.9
 *
 * Fallback prompt when query doesn't match a known scenario.
 * Includes the full component catalog in v0.9 flat format.
 */

import { CATALOG_ID } from '@/src/a2ui/constants';

export function getGeneralPrompt(): string {
  return `
# SCENARIO: General Query

The user query doesn't match a specific banking scenario. Use your best judgment
to compose a helpful UI from the available components.

# AVAILABLE COMPONENTS (full catalog — v0.9 flat format)

## Layout & Structure
- Stack: {"id":"x","component":"Stack","direction":"row"|"column","gap":"none"|"xs"|"sm"|"md"|"lg"|"xl","children":["child-id"]}
- Card: {"id":"x","component":"Card","variant":"outlined"|"filled","children":["child-id"]}
- Divider: {"id":"x","component":"Divider","orientation":"horizontal"|"vertical"}

## Typography
- Text: {"id":"x","component":"Text","text":"text","variant":"h1"|"h2"|"h3"|"body"|"caption"}

## Data Display
- MoneyDisplay: {"id":"x","component":"MoneyDisplay","amount":1234.56,"currency":"AUD","size":"lg"|"md"|"sm","trend":"up"|"down"|"neutral","label":"Label"}
- TransactionListItem: {"id":"x","component":"TransactionListItem","merchant":"Name","amount":-45.75,"date":"2026-01-15","status":"completed"|"pending"|"failed","category":"shopping"|"dining","currency":"AUD"}
- DateGroup: {"id":"x","component":"DateGroup","date":"2026-01-15","format":"relative"|"medium","showCount":true,"count":3,"currency":"AUD","children":["tx1","tx2"]}
- AccountCard: {"id":"x","component":"AccountCard","accountName":"Name","accountNumber":"1234","balance":5000.00,"currency":"AUD","accountType":"savings"|"transaction"}
- Progress: {"id":"x","component":"Progress","value":75,"max":100,"label":"Label","variant":"determinate"}
- CategoryBadge: {"id":"x","component":"CategoryBadge","category":"shopping"|"dining"|"transport"|"entertainment"|"bills"|"other","label":"Label"}
- StatusBadge: {"id":"x","component":"StatusBadge","status":"completed"|"pending"|"failed","label":"Label"}

## Form Controls
- TextField: {"id":"x","component":"TextField","value":{"path":"/field"},"onChange":{"eventType":"change","dataPath":"field"},"label":"Label","placeholder":"Placeholder"}
- NumberField: {"id":"x","component":"NumberField","value":{"path":"/amount"},"onChange":{"eventType":"change","dataPath":"amount"},"label":"Amount","prefix":"$","min":0}
- Select: {"id":"x","component":"Select","value":{"path":"/field"},"onChange":{"eventType":"change","dataPath":"field"},"label":"Label","options":[{"label":"Option","value":"val"}]}
- Checkbox: {"id":"x","component":"Checkbox","checked":false,"label":"Label","onChange":{"eventType":"change","dataPath":"field"}}
- SearchField: {"id":"x","component":"SearchField","value":{"path":"/query"},"onChange":{"eventType":"change","dataPath":"query"},"placeholder":"Search..."}

## Actions & Navigation
- Button: {"id":"x","component":"Button","label":"Label","variant":"primary"|"secondary"|"text","onClick":{"eventType":"submit","dataPath":"data"}}
- BooleanChip: {"id":"x","component":"BooleanChip","content":"Label","selected":true|false}
- TabBar: {"id":"x","component":"TabBar","tabs":[{"label":"Tab1","value":"tab1"},{"label":"Tab2","value":"tab2"}],"activeTab":{"path":"/activeTab"},"onChange":{"eventType":"change","dataPath":"activeTab"}}

## Feedback
- Alert: {"id":"x","component":"Alert","content":"Message","variant":"info"|"success"|"warning"|"error","title":"Title"}
- EmptyState: {"id":"x","component":"EmptyState","illustration":"search"|"empty"|"error","title":"Title","description":"Description"}

# EXAMPLE

User: "Show my accounts"

{"createSurface":{"surfaceId":"main","catalogId":"${CATALOG_ID}"}}
{"updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Stack","direction":"column","gap":"lg","children":["header","accounts"]},{"id":"header","component":"Text","text":"Your accounts","variant":"h1"},{"id":"accounts","component":"Stack","direction":"column","gap":"md","children":["acc1","acc2"]},{"id":"acc1","component":"AccountCard","accountName":"Everyday Account","accountNumber":"7890","balance":3250.00,"currency":"AUD","accountType":"transaction"},{"id":"acc2","component":"AccountCard","accountName":"Goal Saver","accountNumber":"4567","balance":12500.00,"currency":"AUD","accountType":"savings"}]}}

Generate your response now.`;
}
