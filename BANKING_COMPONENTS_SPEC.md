# Banking Components Specification for Common Origin Design System

## Overview
This document specifies 5 critical banking-specific components needed to enhance the Common Origin Design System for financial applications. These components follow the design patterns established by modern banking apps (Revolut, Brex) and compose from existing DS primitives where possible.

---

## 1. MoneyDisplay Component

### Purpose
Consistent display of financial amounts with proper formatting, currency symbols, and semantic color coding.

### Design Rationale
- **Problem**: Plain Typography with manual `$` symbols leads to inconsistent formatting
- **Banking Context**: Financial amounts need special treatment - color coding for debits/credits, proper locale formatting, emphasis for large amounts
- **User Benefit**: Instant visual recognition of positive/negative transactions, professional financial presentation

### API Specification

```typescript
interface MoneyDisplayProps {
  /** The monetary amount to display */
  amount: number;
  
  /** Currency code (ISO 4217) */
  currency?: string; // Default: 'USD'
  
  /** Visual variant affecting color and style */
  variant?: 'default' | 'positive' | 'negative' | 'neutral';
  
  /** Show +/- sign prefix */
  showSign?: boolean; // Default: false
  
  /** Size of the amount display */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  
  /** Font weight */
  weight?: 'regular' | 'medium' | 'bold';
  
  /** Locale for number formatting */
  locale?: string; // Default: 'en-US'
  
  /** Align text */
  align?: 'left' | 'center' | 'right';
}
```

### Visual Specifications

**Variants:**
- `default`: Neutral color (current theme text color)
- `positive`: Green (#10b981) for credits/income
- `negative`: Red (#ef4444) for debits/expenses
- `neutral`: Gray (#6b7280) for informational amounts

**Size Mapping:**
- `small`: 14px (caption/small)
- `medium`: 16px (body)
- `large`: 24px (h3)
- `xlarge`: 32px (h2)

**Formatting Rules:**
- Thousands separator: comma (,)
- Decimal places: 2 for most currencies
- Negative amounts: Show with minus sign or parentheses based on locale
- Currency symbol: Position based on locale ($ before, € after)

### Usage Examples

```tsx
// Transaction debit
<MoneyDisplay 
  amount={-45.50} 
  variant="negative" 
  showSign 
/>
// Output: -$45.50 (in red)

// Account balance (large)
<MoneyDisplay 
  amount={5280.42} 
  size="xlarge" 
  weight="bold" 
/>
// Output: $5,280.42

// Positive transaction
<MoneyDisplay 
  amount={1250.00} 
  variant="positive" 
  showSign 
/>
// Output: +$1,250.00 (in green)

// Euro amount
<MoneyDisplay 
  amount={99.99} 
  currency="EUR" 
  locale="de-DE" 
/>
// Output: 99,99 €
```

### Implementation Notes

**Composition from Existing DS Components:**
- Base on `Typography` component for text rendering
- Use theme color tokens for variant colors
- Wrap in `Box` for alignment control

**Key Logic:**
```typescript
// Format number with locale
const formatted = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Math.abs(amount));

// Add sign if needed
const sign = showSign && amount > 0 ? '+' : amount < 0 ? '-' : '';
const display = sign + formatted;
```

### Accessibility
- Use semantic HTML (`<span>` with appropriate ARIA)
- Add `aria-label` with full amount description: "negative forty-five dollars and fifty cents"
- Ensure sufficient color contrast for all variants (WCAG AA)
- Don't rely solely on color - use sign symbols

---

## 2. TransactionListItem Component

### Purpose
Rich, scannable display of transaction information with merchant logo, category, status, and formatted amount.

### Design Rationale
- **Problem**: Current ListItem is too generic for financial data
- **Banking Context**: Transactions need multiple data points visible at a glance (merchant, date, category, amount, status)
- **User Benefit**: Quick transaction recognition, clear status indicators, visual hierarchy

### API Specification

```typescript
interface TransactionListItemProps {
  /** Merchant or transaction description */
  merchant: string;
  
  /** URL for merchant logo or placeholder */
  merchantLogo?: string;
  
  /** Transaction category */
  category: string;
  
  /** Icon name for category */
  categoryIcon?: IconName;
  
  /** Transaction date */
  date: string | Date;
  
  /** Transaction amount */
  amount: number;
  
  /** Currency code */
  currency?: string;
  
  /** Transaction status */
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  
  /** Secondary description line */
  description?: string;
  
  /** Show receipt icon indicator */
  hasReceipt?: boolean;
  
  /** Show note icon indicator */
  hasNote?: boolean;
  
  /** Click handler for item */
  onClick?: () => void;
  
  /** Make item interactive (hover states) */
  interactive?: boolean;
}
```

### Visual Specifications

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo]  Merchant Name                      -$45.50      │
│         Category • Dec 17, 2024    [Status]             │
│         Description (if provided)  [Receipt][Note]      │
└─────────────────────────────────────────────────────────┘
```

**Spacing:**
- Height: Min 72px for comfortable touch targets
- Logo: 40x40px circle
- Gap between logo and text: 12px
- Gap between primary and secondary: 4px
- Right-aligned amount: Bold, larger than secondary text

**Colors:**
- Merchant name: Primary text color
- Category/date: Secondary text color (#6b7280)
- Amount: Red for negative, green for positive
- Status badge: Color-coded by status

**Status Badge Colors:**
- `pending`: Yellow (#fbbf24) background, dark text
- `completed`: Green (#10b981) background, white text
- `failed`: Red (#ef4444) background, white text
- `cancelled`: Gray (#6b7280) background, white text
- `processing`: Blue (#3b82f6) background, white text

### Usage Examples

```tsx
// Basic transaction
<TransactionListItem
  merchant="Starbucks Coffee"
  merchantLogo="https://logo.clearbit.com/starbucks.com"
  category="Food & Dining"
  categoryIcon="coffee"
  date="2025-12-17T10:30:00Z"
  amount={-5.75}
  status="completed"
  onClick={() => handleViewTransaction(txId)}
  interactive
/>

// Pending transaction with description
<TransactionListItem
  merchant="Amazon.com"
  merchantLogo="https://logo.clearbit.com/amazon.com"
  category="Shopping"
  categoryIcon="shopping"
  date="2025-12-17T14:20:00Z"
  amount={-89.99}
  status="pending"
  description="Order #112-8765432-1234567"
  hasReceipt
  interactive
/>

// Income transaction
<TransactionListItem
  merchant="Direct Deposit - Acme Corp"
  category="Income"
  categoryIcon="money"
  date="2025-12-15T00:00:00Z"
  amount={3250.00}
  status="completed"
/>
```

### Implementation Notes

**Composition from Existing DS Components:**
- Base structure: `ListItem` component
- Logo: `Avatar` component with fallback initial
- Category/Status: `Chip` or `Badge` component
- Amount: `MoneyDisplay` component (new)
- Icons: `Icon` component for receipt/note indicators
- Layout: `Stack` and `Box` for arrangement

**Date Formatting:**
- Same day: Show time "10:30 AM"
- Yesterday: Show "Yesterday"
- Same week: Show day "Monday"
- Older: Show date "Dec 15"
- Use `DateFormatter` utility from DS if available

**Logo Fallback:**
- If `merchantLogo` fails to load, show first letter of merchant name
- Use Avatar component's built-in initial display

### Accessibility
- Entire item is clickable if `onClick` provided
- Keyboard navigation: Focus outline on entire item
- Screen reader: "Transaction: Starbucks Coffee, Food and Dining, December 17th, negative five dollars and seventy-five cents, completed"
- Status badge: `aria-label` with full status text
- Interactive state: `role="button"` if clickable

---

## 3. AccountCard Component

### Purpose
Display account summary with balance, account type, masked number, and quick action buttons.

### Design Rationale
- **Problem**: Generic CardLarge doesn't fit account selection context
- **Banking Context**: Users need to quickly identify accounts by type, see current balance, and take actions
- **User Benefit**: Fast account recognition, balance visibility, streamlined actions

### API Specification

```typescript
interface AccountCardProps {
  /** Account display name */
  accountName: string;
  
  /** Account type determines icon and styling */
  accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  
  /** Masked account number (e.g., "•••• 4532") */
  accountNumber: string;
  
  /** Current balance */
  balance: number;
  
  /** Currency code */
  currency?: string;
  
  /** Available balance for credit accounts */
  available?: number;
  
  /** Trend information */
  trend?: {
    value: number; // Percentage or amount
    direction: 'up' | 'down';
    period?: string; // "this month", "today"
  };
  
  /** Quick action buttons */
  actions?: Array<{
    label: string;
    icon?: IconName;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  
  /** Click handler for card */
  onClick?: () => void;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
}## Visual Specifications

**Layout Structure:**
```
┌────────────────────────────────────────────┐
│ [Icon] Account Name        •••• 4532       │
│        Checking Account                    │
│                                            │
│        $5,280.42                           │
│        Available Balance                   │
│        ↑ $234 this month                   │
│                                            │
│        [Pay]  [Transfer]                   │
└────────────────────────────────────────────┘
```

**Card Dimensions:**
- Min width: 300px
- Min height: 200px
- Padding: 24px
- Border radius: 12px
- Background: White with subtle border or light gradient

**Account Type Icons:**
- `checking`: Bank building icon
- `savings`: Piggy bank or vault icon
- `credit`: Credit card icon
- `investment`: Chart/growth icon
- `other`: Generic account icon

**Color Theming (Optional Enhancement):**
- Each account type could have accent color
- Checking: Blue
- Savings: Green
- Credit: Purple
- Investment: Orange

**Balance Display:**
- Primary text: Balance amount (large, bold)
- Secondary text: "Available Balance" or "Current Balance"
- Trend: Small text with icon, colored by direction

**Actions Layout:**
- Horizontal button group at bottom
- 2-3 actions max for clean layout
- Equal width buttons or adaptive sizing

### Usage Examples

```tsx
// Checking account with actions
<AccountCard
  accountName="Personal Checking"
  accountType="checking"
  accountNumber="•••• 4532"
  balance={5280.42}
  trend={{ value: 234, direction: 'up', period: 'this month' }}
  actions={[
    { label: 'Pay', icon: 'send', onClick: handlePay },
    { label: 'Transfer', icon: 'swap', onClick: handleTransfer }
  ]}
  onClick={() => handleViewAccount('checking-001')}
/>

// Credit card with available credit
<AccountCard
  accountName="Rewards Credit Card"
  accountType="credit"
  accountNumber="•••• 8765"
  balance={-1250.00}
  available={8750.00}
  actions={[
    { label: 'Pay Bill', icon: 'payment', onClick: handlePayBill, variant: 'primary' }
  ]}
/>

// Savings account (simple)
<AccountCard
  accountName="Emergency Fund"
  accountType="savings"
  accountNumber="•••• 1234"
  balance={12500.00}
  trend={{ value: 2.5, direction: 'up', period: 'this month' }}
/>
```

### Implementation Notes

**Composition from Existing DS Components:**
- Base: `CardLarge` or custom card with `Box`
- Icon: `Icon` component for account type
- Balance: `MoneyDisplay` component (new)
- Account number: `Typography` with monospace font
- Trend: `Icon` + `Typography` with color
- Actions: `Button` component in `Stack` layout

**Trend Display Logic:**
```typescript
const trendColor = trend.direction === 'up' ? 'success' : 'error';
const trendIcon = trend.direction === 'up' ? 'arrowUp' : 'arrowDown';
const trendText = `${trend.direction === 'up' ? '↑' : '↓'} ${formatAmount(trend.value)} ${trend.period}`;
```

**Available Balance Display:**
- For credit cards, show: "Available: $X,XXX"
- For checking/savings, show: "Available Balance" (same as balance)
- Use secondary text color, smaller size

### Accessibility
- Card is clickable: `role="button"` or wrap in `<button>`
- Account type icon: `aria-label="Checking account"`
- Balance: `aria-label="Balance: five thousand two hundred eighty dollars and forty-two cents"`
- Masked number: `aria-label="Account ending in 4532"`
- Trend: `aria-label="Up two hundred thirty-four dollars this month"`
- Action buttons: Clear labels, keyboard accessible

---

## 4. DateGroup Component

### Purpose
Group list items by date with formatted headers (Today, Yesterday, specific dates).

### Design Rationale
- **Problem**: Flat transaction lists are hard to scan chronologically
- **Banking Context**: Transactions naturally group by date - users think "What did I spend yesterday?"
- **User Benefit**: Faster transaction finding, natural mental model, reduced cognitive load

### API Specification

```typescript
interface DateGroupProps {
  /** Date for this group */
  date: string | Date;
  
  /** Child elements (usually TransactionListItems) */
  children: React.ReactNode;
  
  /** Date formatting mode */
  format?: 'relative' | 'absolute' | 'smart';
  // relative: "Today", "Yesterday"
  // absolute: "December 17, 2025"
  // smart: Relative for recent, absolute for older
  
  /** Custom date format string */
  customFormat?: string; // e.g., "MMM DD, YYYY"
  
  /** Show total amount for group */
  showTotal?: boolean;
  
  /** Total amount (if showing) */
  totalAmount?: number;
  
  /** Show transaction count */
  showCount?: boolean;
  
  /** Show transaction count */
  showCount?: boolean;
}## Visual Specifications

**Layout Structure:**
```
Today                                          -$125.50 (3)
────────────────────────────────────────────────────────
[Transaction Item 1]
[Transaction Item 2]
[Transaction Item 3]

Yesterday                                       +$50.00 (1)
────────────────────────────────────────────────────────
[Transaction Item 4]
```

**Header Styling:**
- Font: Semibold, 14px
- Color: Secondary text (#6b7280)
- Background: Light gray (#f9fafb) or transparent
- Padding: 12px horizontal, 8px vertical
- Sticky position option for scrolling lists

**Divider:**
- Full-width or inset by 16px
- Subtle gray color (#e5e7eb)
- 1px solid

**Total Amount Display:**
- Right-aligned
- Same color rules as MoneyDisplay (red/green)
- Format: "±$XXX.XX (N)" where N is transaction count

### Usage Examples

```tsx
// Today's transactions with total
<DateGroup 
  date={new Date()} 
  format="relative"
  showTotal
  totalAmount={-125.50}
  showCount
>
  <TransactionListItem {...tx1} />
  <TransactionListItem {...tx2} />
  <TransactionListItem {...tx3} />
</DateGroup>

// Older transactions
<DateGroup 
  date="2025-12-10" 
  format="absolute"
  customFormat="MMMM DD, YYYY"
>
  <TransactionListItem {...tx4} />
  <TransactionListItem {...tx5} />
</DateGroup>

// Smart formatting (auto-detect)
<DateGroup date="2025-12-16" format="smart">
  <TransactionListItem {...tx6} />
</DateGroup>
// Renders as "Yesterday" if today is Dec 17
```

### Implementation Notes

**Composition from Existing DS Components:**
- Container: `Stack` with `direction="column"`, `gap="none"`
- Header: `Box` with flex layout + `Typography`
- Divider: `Divider` component
- Total amount: `MoneyDisplay` component (new)

**Date Formatting Logic:**
```typescript
function formatDate(date: Date, mode: 'relative' | 'absolute' | 'smart'): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isSameDay = (d1: Date, d2: Date) => 
    d1.toDateString() === d2.toDateString();
  
  if (mode === 'relative' || (mode === 'smart' && isWithinWeek(date, today))) {
    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE'); // "Monday"
  }
  
  // Absolute or smart fallback
  return format(date, 'MMMM dd, yyyy'); // "December 17, 2025"
}
```

**Total Calculation:**
- Sum all child transaction amounts
- Color code: Red if net negative, green if positive, neutral if zero
- Show count in parentheses

**Sticky Header (Optional Enhancement):**
- Add `position: sticky; top: 0; z-index: 10;`
- Background color to cover scrolled content
- Shadow on scroll for depth

### Accessibility
- Header is not interactive: Use `<div>` or `<header>`
- Date text: `aria-label` with full date "December 17th, 2025"
- Total amount: Use MoneyDisplay's built-in ARIA
- Transaction count: `aria-label="3 transactions"`
- Ensure child items are properly grouped: `<section role="list">`

---

## 5. EmptyState Component

### Purpose
Engaging empty state with illustration, clear message, and actionable CTA.

### Design Rationale
- **Problem**: Generic Alert for "no results" is uninviting and unclear
- **Banking Context**: Empty states happen often (new users, filtered results, no transactions)
- **User Benefit**: Friendly guidance, clear next steps, reduced frustration

### API Specification

```typescript
interface EmptyStateProps {
  /** Predefined illustration type */
  illustration?: 'search' | 'transactions' | 'notifications' | 'empty' | 'error' | 'custom';
  
  /** Custom illustration (SVG string or image URL) */
  customIllustration?: string | React.ReactNode;
  
  /** Main heading */
  title: string;
  
  /** Descriptive text */
  description: string;
  
  /** Primary call-to-action */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    icon?: IconName;
  };
  
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  /** Visual variant */
  variant?: 'default' | 'error' | 'success';
  
  /** Size of the component */
  size?: 'small' | 'medium' | 'large';
  
  /** Size of the component */
  size?: 'small' | 'medium' | 'large';
}## Visual Specifications

**Layout Structure:**
```
        ┌──────────────┐
        │              │
        │ [Illustration]│
        │              │
        └──────────────┘
        
        Main Title Text
        
    Descriptive text explaining
    the situation and what to do
    
    [Primary Action Button]
```

**Dimensions:**
- Container: Centered, max-width 400px
- Illustration: 120px-200px (size dependent)
- Vertical spacing: 24px between elements
- Padding: 48px vertical for breathing room

**Illustration Sizes:**
- `small`: 80px
- `medium`: 120px (default)
- `large`: 200px

**Text Styling:**
- Title: H3 or H4, semibold, center-aligned
- Description: Body text, regular, center-aligned, secondary color
- Max-width: 360px for readability

**Illustrations (SVG/Icon):**
- `search`: Magnifying glass with empty circle
- `transactions`: Empty wallet or piggy bank
- `notifications`: Bell with X or empty inbox
- `empty`: Empty box or folder
- `error`: Alert triangle or X circle

**Variant Colors:**
- `default`: Neutral blue/gray illustration
- `error`: Red accent for illustration
- `success`: Green accent (rarely used for empty states)

### Usage Examples

```tsx
// No search results
<EmptyState
  illustration="search"
  title="No transactions found"
  description="Try adjusting your search or filters to find what you're looking for."
  action={{
    label: 'Clear Filters',
    onClick: handleClearFilters,
    variant: 'primary'
  }}
  secondaryAction={{
    label: 'View All',
    onClick: handleViewAll
  }}
/>

// First-time user
<EmptyState
  illustration="transactions"
  title="No transactions yet"
  description="Start spending to see your transactions here. Your purchases will appear automatically."
  action={{
    label: 'Add a Transaction',
    onClick: handleAddTransaction,
    icon: 'add'
  }}
  size="large"
/>

// Error state
<EmptyState
  illustration="error"
  variant="error"
  title="Unable to load transactions"
  description="We're having trouble loading your data. Please try again."
  action={{
    label: 'Retry',
    onClick: handleRetry,
    icon: 'refresh'
  }}
/>

// Custom illustration
<EmptyState
  customIllustration={<CustomSVG />}
  title="All caught up!"
  description="You've reviewed all your notifications."
/>
```

### Implementation Notes

**Composition from Existing DS Components:**
- Container: `Stack` with `direction="column"`, `alignItems="center"`
- Illustration: `Icon` (large size) or `Picture` component
- Title: `Typography` variant `h3` or `h4`
- Description: `Typography` variant `body`
- Action button: `Button` component
- Secondary action: `Button` variant `naked` or `secondary`

**Illustration Library:**
- Create a small library of SVG illustrations for common states
- Store as React components or inline SVG strings
- Consistent style (line art, minimal color)
- Alternative: Use Icon component with XL size

**Responsive Behavior:**
- On mobile: Smaller illustration (80px), tighter spacing
- On desktop: Larger illustration (120px-200px), more breathing room

**Animation (Optional):**
- Fade in on mount
- Subtle illustration animation (pulse, float)

### Accessibility
- Container: `role="status"` or `role="region"` with `aria-label`
- Illustration: `aria-hidden="true"` (decorative) or descriptive `alt` if meaningful
- Title: Proper heading level (`<h3>` or `<h4>`)
- Description: Regular paragraph text
- Action button: Clear, descriptive label
- Screen reader announcement: "Empty state: [title]. [description]"

---

## Design System Contribution Guidelines

**IMPORTANT**: Before implementing any component, you MUST review and follow the Common Origin Design System's established patterns and guidelines:

### Required Reading & Reference
1. **Component Composition Guidelines**: Review existing component patterns for how components compose from primitives
2. **Styling Standards**: Follow the established styling approach (CSS-in-JS/CSS modules/styled-components as per DS conventions)
3. **Testing Standards**: Match existing test patterns, coverage requirements, and testing utilities
4. **Documentation Templates**: Use the same documentation structure as existing components
5. **Atomic Classification**: Properly categorize components (Atoms, Molecules, Organisms) following the DS taxonomy
6. **Naming Conventions**: Follow established naming patterns for components, props, variants, and files
7. **Token Usage**: Use design tokens exclusively - no hard-coded values for colors, spacing, typography, etc.
8. **Accessibility Guidelines**: Review and follow the DS accessibility requirements and patterns - CRITICAL for all components

### Component Contribution Checklist
- [ ] Component follows DS atomic design classification
- [ ] All styling uses design tokens (no hard-coded values)
- [ ] Props follow DS naming conventions
- [ ] Component composition follows DS patterns
- [ ] Tests match DS testing standards and coverage requirements
- [ ] Documentation follows DS template structure
- [ ] Storybook stories follow DS story patterns
- [ ] TypeScript types follow DS conventions
- [ ] **Accessibility requirements fully met (see Accessibility instructions in project)**
- [ ] No `className` props (components must not be styleable downstream)

**These banking components must feel native to the design system, not like external additions. Study existing DS components thoroughly before implementing.**

---

## Implementation Strategy

### Phase 1: Foundation (Priority 1)
**Build these components in order:**

1. **MoneyDisplay** (2-3 hours)
   - No external dependencies
   - Compose from Typography + Box
   - Critical for all other components

2. **EmptyState** (3-4 hours)
   - Needs SVG illustrations created
   - Compose from Stack + Typography + Button + Icon
   - Improves UX immediately

3. **DateGroup** (2-3 hours)
   - Needs date formatting utility
   - Compose from Stack + Typography + Divider
   - Depends on MoneyDisplay for totals

### Phase 2: Rich Display (Priority 2)
4. **TransactionListItem** (4-5 hours)
   - Most complex composition
   - Depends on MoneyDisplay
   - Compose from ListItem + Avatar + Badge + Icon

5. **AccountCard** (3-4 hours)
   - Depends on MoneyDisplay
   - Compose from CardLarge + Stack + Button + Icon

**Total Estimated Time: 14-19 hours for all 5 components**

### Testing Requirements

**MUST follow Design System testing patterns and utilities:**

**Unit Tests:**
- Use the same testing library and patterns as existing DS components
- Match DS test structure and organization
- Component rendering with all prop combinations
- Number formatting edge cases (negative, zero, large numbers)
- Date formatting (today, yesterday, relative dates)
- Accessibility attributes present
- Achieve minimum coverage requirement (typically 80%+)

**Visual Tests:**
- Storybook stories for each component following DS story conventions
- All variants and sizes
- Responsive behavior
- Dark mode (if supported by DS)
- Use DS visual regression testing tools if available
### Design Tokens to Add

**CRITICAL**: Before adding any new tokens, you MUST:
1. **Review the Token System**: Study the existing token structure, hierarchy, and naming patterns
2. **Understand Base vs Semantic**: Base tokens define raw values, semantic tokens reference base tokens
3. **Check for Existing Tokens**: Verify if suitable tokens already exist before creating new ones
4. **Follow Token Architecture**: New semantic tokens MUST use base tokens, never raw values

**Token Addition Rules:**
- ✅ Semantic tokens reference base tokens: `colors.semantic.success: colors.base.green.500`
- ❌ Semantic tokens use raw values: `colors.semantic.success: '#10b981'`
- ✅ Reuse existing semantic tokens when possible (success, error, warning, info)
- ✅ New tokens follow DS naming conventions and structure
- ❌ Create duplicate tokens with different names

**Colors (follow DS color token patterns):**
```typescript
// PREFERRED: Reuse existing semantic tokens
colors: {
  semantic: {
    financial: {
      credit: colors.semantic.success,      // Reference existing success token
      debit: colors.semantic.error,         // Reference existing error token
      pending: colors.semantic.warning,     // Reference existing warning token
      processing: colors.semantic.info,     // Reference existing info token
      neutral: colors.semantic.neutral,     // Reference existing neutral token
    }
  }
}

// IF new financial tokens are required and approved:
colors: {
  base: {
    // Only add new base tokens if existing palette is insufficient
    financial: {
      green: { 500: '#10b981', 600: '#059669' },  // Example base tokens
      red: { 500: '#ef4444', 600: '#dc2626' },
    }
  },
  semantic: {
    financial: {
      credit: colors.base.financial.green[500],    // Reference base token
      creditHover: colors.base.financial.green[600],
      debit: colors.base.financial.red[500],       // Reference base token
      debitHover: colors.base.financial.red[600],
    }
  }
}
```

**Token Review Checklist:**
- [ ] Reviewed existing base token palette
- [ ] Reviewed existing semantic token mappings
- [ ] Confirmed no suitable existing tokens
- [ ] New semantic tokens reference base tokens only
- [ ] Token names follow DS naming convention
- [ ] Token structure matches DS hierarchy
- [ ] Documented token purpose and usage

**Icons to Add (follow DS icon naming conventions):**
```typescript
// Add to icon library following DS icon structure and naming
icons: {
  bank: 'bank-building',
  creditCard: 'credit-card',
  wallet: 'wallet',
  savings: 'piggy-bank',
  investment: 'chart-line',
  receipt: 'receipt',
  note: 'note',
  transfer: 'arrow-swap',
  payment: 'payment',
}
```

**Icon Requirements**:
- Follow DS SVG optimization standards
- Match DS icon size/viewBox conventions
- Include appropriate ARIA labels
- Ensure consistent stroke width and style

**Spacing/Sizing Tokens:**
```typescript
// IF new spacing tokens needed, reference base tokens:
spacing: {
  component: {
    transactionItem: {
      gap: spacing.base.md,              // Reference base token
      padding: spacing.base.lg,
      minHeight: spacing.base['2xl'],
    }
  }
}

// Typography tokens - reference base tokens:
typography: {
  component: {
    moneyDisplay: {
      small: typography.base.caption,     // Reference base token
      medium: typography.base.body,
      large: typography.base.h3,
    }
  }
}
```

**Token Philosophy:**
- Base tokens = Single source of truth (raw values)
- Semantic tokens = Meaning-based references to base tokens
- Component tokens = Component-specific references to semantic or base tokens
- Never skip the token hierarchy with raw values

### Documentation Requirements

**For Each Component (following DS documentation standards):**
1. **README.md**: Match the structure and tone of existing DS component READMEs
2. **API Documentation**: Use the same props table format as other DS components
3. **Examples**: Follow DS code example patterns and formatting
4. **Storybook Stories**: Use DS story structure, controls, and organization
5. **Accessibility Notes**: Document ARIA patterns consistent with DS accessibility guidelines
6. **Design Rationale**: Explain component purpose in DS context
7. **Atomic Classification**: Clearly identify as Atom, Molecule, or Organism
8. **Token Reference**: Document which design tokens are used and why

### Deliverables Checklist

- [ ] Component implementation files
- [ ] TypeScript type definitions
- [ ] Unit tests (>80% coverage)
- [ ] Storybook stories
- [ ] Documentation (README, API docs)
- [ ] Accessibility audit passed
- [ ] Visual regression tests
- [ ] Peer code review
- [ ] Design review/approval
- [ ] Published to npm package

---

## References

### Design Inspiration
- **Revolut**: Transaction list design, empty states, account cards
- **Brex**: Amount formatting, status badges, filter patterns
- **Stripe Dashboard**: Money display, date grouping
- **Coinbase**: Account cards, trend indicators

### Technical References
- [Intl.NumberFormat API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Date-fns Documentation](https://date-fns.org/docs/Getting-Started)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Common Origin Design System](https://github.com/common-origin/design-system)

### Figma Design Files
*(To be created by design team)*
- Banking Components UI Kit
- Component specifications and measurements
- Color palette and tokens
- Responsive breakpoints

---

## Questions for Design Team

1. Should account type colors be customizable or fixed to brand guidelines?
2. Do we need dark mode variants for all components?
3. What illustration style for EmptyState (line art, filled, 3D)?
4. Should MoneyDisplay support cryptocurrency formatting?
5. Do we need animation/motion for any components?
6. Should components be themeable beyond default DS tokens?

## Questions for Engineering Team

1. Should we use date-fns or native Intl.DateTimeFormat?
2. Do we need SSR compatibility considerations?
3. Should components be tree-shakeable?
4. Do we need legacy browser support (IE11)?
5. Should we use CSS-in-JS or CSS modules?
6. Package structure: Separate packages or monorepo?

---

**Document Version**: 1.0  
**Date**: December 17, 2025  
**Author**: A2UI Banking Demo Team  
**Status**: Ready for Implementation
