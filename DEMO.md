# Demo Script — A2UI Banking PoC

Golden-path conversation flows for demonstrating the A2UI banking assistant. Each path is designed to showcase a specific capability and can be run independently or in sequence for a full demo.

---

## Quick Start (2-minute demo)

These three queries demonstrate the core value proposition — an AI agent that generates **real banking UI** from natural language:

1. **"Show my accounts"** → Account overview with balances, trends, and recent activity
2. **"Show my Woolworths transactions"** → Transaction search with date-grouped results, then click a transaction for drill-down
3. **"Transfer $200 to savings"** → Fund transfer form → Review → Confirm (3-step flow)

---

## Path 1: Account Overview → Transaction Drill-down

**Demonstrates:** Account dashboard, transaction search, detail drill-down

| Step | Type what you see below | What happens |
|------|------------------------|--------------|
| 1 | `Show my accounts` | Shows Sarah Chen's 4 accounts with balances, trend indicators, a credit card payment warning, and recent transactions |
| 2 | `Show my recent transactions` | Transaction search with date-grouped results, filter chips, pending/completed status mix |
| 3 | *Click any transaction* | Transaction detail screen with merchant, amount, date, category, status, reference number, dispute button |
| 4 | *Click "Back to transactions"* | Returns to the transaction list |

**Talking points:**
- The agent generates the entire UI declaratively — no hardcoded screens
- Every transaction is clickable — the action context flows back to the agent
- The credit card payment alert shows how the agent surfaces timely information

---

## Path 2: Spending Summary → Comparison

**Demonstrates:** Analytics UI, data visualisation with progress bars, multi-step interaction

| Step | Type what you see below | What happens |
|------|------------------------|--------------|
| 1 | `How much did I spend this month?` | Spending summary with total, category breakdown with progress bars, insight alert about grocery spending trending up |
| 2 | *Click "Compare to last month"* | Month-over-month comparison showing category-level changes, warning about increased spending |
| 3 | *Click "Back to summary"* | Returns to the spending summary |

**Talking points:**
- Progress bars and category badges are real design system components, not images
- The insight alert ("grocery spending up 12%") shows the agent reasoning about the data
- The comparison view is generated entirely by the agent — no separate "comparison screen" was built

---

## Path 3: Fund Transfer (3-step flow)

**Demonstrates:** Form-based UI, data binding, multi-step workflow, success confirmation

| Step | Type what you see below | What happens |
|------|------------------------|--------------|
| 1 | `Transfer $200 to savings` | Pre-populated transfer form with source/destination accounts, amount field, description |
| 2 | *Click "Review transfer"* | Review screen showing transfer summary with "Edit" and "Confirm" buttons |
| 3 | *Click "Confirm transfer"* | Success screen with reference number, new balances, "Make another transfer" option |

**Talking points:**
- The amount ($200) was extracted from the natural language query and pre-populated
- The review step shows the agent understood the multi-step flow pattern
- The success screen includes a reference number and updated balances — realistic banking UX

---

## Path 4: Bill Payment

**Demonstrates:** BPAY flow, upcoming bills with due dates, multi-step payment

| Step | Type what you see below | What happens |
|------|------------------------|--------------|
| 1 | `Pay a bill` | Shows upcoming bills with due dates (Telstra in 3 days), saved billers list |
| 2 | *Click "Telstra — $139.00"* | Payment form with pre-populated amount, from account, payment date selector |
| 3 | *Click "Review payment"* | Payment review with biller details, reference number, scheduled date |

**Talking points:**
- The agent surfaces urgency — "due in 3 days" is prominently displayed
- BPAY biller codes and references are shown (realistic Australian banking context)
- Payment timing options (pay now vs. on due date) demonstrate form interaction

---

## Path 5: Card Management (Freeze/Unfreeze)

**Demonstrates:** Card status, confirmation flow, danger actions, success state

| Step | Type what you see below | What happens |
|------|------------------------|--------------|
| 1 | `Manage my card` | Card management showing both debit and credit cards with status badges, action buttons |
| 2 | *Click "Temporarily freeze card"* | Confirmation screen explaining what freezing does, warning about direct debits |
| 3 | *Click "Freeze card"* | Success screen showing frozen status with timestamp, unfreeze button |

**Talking points:**
- The freeze confirmation shows the agent understanding security UX — you don't freeze a card without checking
- The danger button variant is used for the freeze action — visual hierarchy matters
- Status transitions (Active → Frozen) are shown with StatusBadge components

---

## Path 6: Search by Merchant

**Demonstrates:** Merchant search, empty state handling

| Step | Type what you see below | What happens |
|------|------------------------|--------------|
| 1 | `Find my Coles transactions` | Transaction search filtered to Coles, with date-grouped results |
| 2 | `Find transactions from ALDI` | May show results or empty state depending on agent interpretation |
| 3 | `What can I do?` | Help screen showing all available capabilities as action buttons |

**Talking points:**
- The search field is pre-populated with the merchant name
- Australian retailer names are recognised and handled naturally
- The "What can I do?" fallback shows a clean capability menu

---

## Full Demo Script (10 minutes)

For a comprehensive walkthrough, follow the paths in this order:

1. **Start:** `Show my accounts` (Path 1, Step 1)
2. **Explore:** `How much did I spend this month?` (Path 2)
3. **Act:** `Transfer $200 to savings` (Path 3 — full flow)
4. **Service:** `Pay a bill` → select Telstra (Path 4)
5. **Security:** `Freeze my card` (Path 5)
6. **Search:** `Show my Woolworths transactions` → click a transaction (Path 1, Steps 2-4)

---

## Tips for a Smooth Demo

- **Pause between Steps:** Give the streaming UI a moment to render — the progressive build is part of the story
- **Click the Buttons:** The follow-up action flows are the most impressive part. Don't just type new queries.
- **Mention the Design System:** The components (AccountCard, MoneyDisplay, TransactionListItem) are real design system components, not mocked divs
- **Highlight Data Binding:** When the transfer form pre-populates the $200 amount, that's data binding from the agent's response to the UI
- **Point out the Streaming:** The UI builds incrementally — header first, then content, then actions. This mirrors how a real agent would think and generate
- **Show the Action Loop:** When you click "Confirm Transfer", the context (account, amount, description) flows back to the agent and it generates the success screen

---

## Customer Persona

All scenarios use a consistent persona:

**Sarah Chen** — Melbourne, Australia
- Everyday Account (••••7890): $3,247.85
- Goal Saver (••••4567): $12,450.00
- Offset Account (••••1847): $25,000.00
- Platinum Credit Card (••••2103): $1,892.40 owing

She shops at Woolworths, gets coffee at The Coffee Club, watches Netflix, and has bills with AGL Energy and Telstra. Her grocery spending is trending up this month.
