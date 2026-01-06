# Banking Components Specification - Phase 2 (High Priority)
## Common Origin Design System

## Overview
This document specifies 5 high-priority banking components (excluding charting and date picker which require external dependencies). These components significantly enhance UX for financial applications and follow patterns from Revolut, Brex, and other modern banking apps.

---

## 6. SearchField Component

### Purpose
Search input optimized for financial data with autocomplete, suggestions, and recent searches.

### Design Rationale
- **Problem**: Standard TextField doesn't provide search-specific features like suggestions or history
- **Banking Context**: Users need to quickly find transactions, merchants, beneficiaries with autocomplete
- **User Benefit**: Faster search, reduced typing, discovery of past searches

### API Specification

```typescript
interface SearchFieldProps {
  /** Current search value */
  value: string;
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Search suggestions to display */
  suggestions?: Array<{
    label: string;
    value: string;
    type?: 'merchant' | 'category' | 'amount' | 'recipient';
    icon?: IconName;
    metadata?: string; // Secondary info like "Last used: 2 days ago"
  }>;
  
  /** Recent searches to display when field is focused */
  recentSearches?: string[];
  
  /** Show loading indicator */
  loading?: boolean;
  
  /** Search callback (triggered on Enter or explicit search) */
  onSearch?: (query: string) => void;
  
  /** Clear callback */
  onClear?: () => void;
  
  /** Suggestion selected callback */
  onSuggestionSelect?: (suggestion: { label: string; value: string }) => void;
  
  /** Debounce delay in milliseconds */
  debounceMs?: number; // Default: 300
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Error state */
  error?: string;
}
```

### Visual Specifications

**Layout Structure:**
```
┌──────────────────────────────────────────────────────┐
│ [🔍]  Search transactions...                  [✕]   │
└──────────────────────────────────────────────────────┘
       ▼ (when focused)
┌──────────────────────────────────────────────────────┐
│ Recent Searches                                      │
│ ─────────────────────────────────────────────────────│
│ [🕐] Starbucks                                       │
│ [🕐] Amazon                                          │
│                                                      │
│ Suggestions                                          │
│ ─────────────────────────────────────────────────────│
│ [🏪] Starbucks Coffee - Merchant                     │
│ [📁] Food & Dining - Category                        │
│ [💰] $45.50 - Amount                                 │
└──────────────────────────────────────────────────────┘
```

**Dimensions:**
- Height: 44px (matches DS TextField height)
- Dropdown max-height: 320px with scroll
- Suggestion item height: 48px
- Dropdown appears below input (or above if insufficient space)

**Colors & States:**
- Default: Same as TextField
- Focus: Search icon changes to accent color
- Loading: Spinner replaces search icon
- Error: Red border with error message below
- Clear button: Only visible when value exists

**Suggestion Groups:**
- Recent searches: Clock icon, lighter text
- Merchants: Store icon, primary text
- Categories: Folder icon, secondary color
- Amounts: Currency icon, highlighted amount

### Usage Examples

```tsx
// Basic search
<SearchField
  value={query}
  onChange={setQuery}
  placeholder="Search transactions..."
  onSearch={handleSearch}
/>

// With suggestions and recent searches
<SearchField
  value={query}
  onChange={setQuery}
  suggestions={[
    { 
      label: 'Starbucks Coffee', 
      value: 'starbucks', 
      type: 'merchant',
      icon: 'store',
      metadata: 'Last transaction: 2 days ago'
    },
    { 
      label: 'Food & Dining', 
      value: 'food', 
      type: 'category',
      icon: 'folder'
    }
  ]}
  recentSearches={['Amazon', 'Target', 'Gas']}
  onSuggestionSelect={(suggestion) => {
    setQuery(suggestion.value);
    handleSearch(suggestion.value);
  }}
  loading={isSearching}
/>

// With debounce for API calls
<SearchField
  value={query}
  onChange={setQuery}
  debounceMs={500}
  onSearch={debouncedApiSearch}
/>
```

### Implementation Notes

**Composition from Existing DS Components:**
- Base: `TextField` with type="search"
- Dropdown: Custom positioned container or DS `Dropdown` adapted
- Suggestions: `List` + `ListItem` components
- Icons: `Icon` component
- Loading: DS `Spinner` or loading indicator
- Layout: `Stack` and `Box` for dropdown structure

**Dropdown Behavior:**
- Opens on focus if recentSearches exist
- Opens on typing if suggestions exist
- Closes on Escape, outside click, or selection
- Arrow keys navigate suggestions
- Enter selects highlighted suggestion or triggers search

**Debouncing Logic:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (value && onChange) {
      onChange(value);
    }
  }, debounceMs);
  
  return () => clearTimeout(timer);
}, [value, debounceMs]);
```

**Keyboard Support:**
- Arrow Up/Down: Navigate suggestions
- Enter: Select highlighted or search
- Escape: Close dropdown, clear on second press
- Tab: Close dropdown, move to next field

### Accessibility
- Input has `role="searchbox"`
- Dropdown has `role="listbox"`
- Suggestions have `role="option"`
- Use `aria-expanded` for dropdown state
- Use `aria-activedescendant` for keyboard navigation
- Announce suggestion count: "3 suggestions available"
- Recent searches announced: "Recent searches, 2 items"
- Clear button: `aria-label="Clear search"`
- Loading state announced via `aria-live`

---

## 7. CategoryBadge Component

### Purpose
Visual category indicator with icon and color coding for transaction categorization.

### Design Rationale
- **Problem**: Plain text categories lack visual identity and scannability
- **Banking Context**: Transaction categories need instant recognition (dining, travel, shopping)
- **User Benefit**: Faster category identification, visual hierarchy, improved scannability

### API Specification

```typescript
interface CategoryBadgeProps {
  /** Category name */
  category: string;
  
  /** Icon for the category */
  icon?: IconName;
  
  /** Color accent (use semantic tokens) */
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'red' | 'yellow' | 'gray';
  
  /** Size variant */
  size?: 'small' | 'medium';
  
  /** Visual style */
  variant?: 'filled' | 'outlined' | 'minimal';
  
  /** Click handler for filtering by category */
  onClick?: () => void;
  
  /** Disabled state */
  disabled?: boolean;
}
```

### Visual Specifications

**Layout Structure:**
```
Filled:   [🍔 Food & Dining]  (colored background, white text)
Outlined: [🍔 Food & Dining]  (colored border and text, transparent bg)
Minimal:  🍔 Food & Dining    (colored icon and text, no border/bg)
```

**Dimensions:**
- Small: 24px height, 8px padding, 12px font
- Medium: 32px height, 12px padding, 14px font
- Icon size: 16px (small), 20px (medium)
- Border radius: 16px (pill shape)
- Gap between icon and text: 6px

**Color Mappings (use DS semantic tokens):**
- Blue: General/Transfers
- Green: Income/Salary
- Orange: Food & Dining
- Purple: Entertainment
- Pink: Shopping
- Red: Bills/Utilities
- Yellow: Travel
- Gray: Uncategorized

**States:**
- Default: Full opacity
- Hover (if clickable): Slightly darker background
- Active: Even darker background
- Disabled: 50% opacity, no pointer events

### Usage Examples

```tsx
// Basic category badge
<CategoryBadge
  category="Food & Dining"
  icon="restaurant"
  color="orange"
/>

// Clickable for filtering
<CategoryBadge
  category="Travel"
  icon="plane"
  color="yellow"
  onClick={() => filterByCategory('travel')}
/>

// Different variants
<CategoryBadge category="Shopping" icon="cart" color="pink" variant="filled" />
<CategoryBadge category="Shopping" icon="cart" color="pink" variant="outlined" />
<CategoryBadge category="Shopping" icon="cart" color="pink" variant="minimal" />

// Small size for compact displays
<CategoryBadge
  category="Bills"
  icon="receipt"
  color="red"
  size="small"
/>
```

### Implementation Notes

**Composition from Existing DS Components:**
- Base: `Chip` or `Tag` component with custom styling
- Icon: `Icon` component
- Layout: Flex container with icon + text
- Colors: Reference DS semantic color tokens

**Color Token Mapping:**
```typescript
const colorTokens = {
  blue: 'colors.semantic.info',
  green: 'colors.semantic.success',
  orange: 'colors.semantic.warning',
  purple: 'colors.semantic.purple', // Or map to existing
  pink: 'colors.semantic.pink',
  red: 'colors.semantic.error',
  yellow: 'colors.semantic.caution',
  gray: 'colors.semantic.neutral',
};
```

**Variant Styling:**
- Filled: `background: color`, `color: white`
- Outlined: `border: 1px solid color`, `color: color`, `background: transparent`
- Minimal: `color: color`, no border/background

### Accessibility
- If clickable: `role="button"`, keyboard accessible
- If non-interactive: `role="status"` or semantic element
- Icon: `aria-hidden="true"` (category text provides context)
- Full text announced: "Food and Dining category"
- Color not sole indicator (icon + text provide context)
- Sufficient contrast in all variants (WCAG AA)

---

## 8. StatusBadge Component

### Purpose
Transaction status indicator with color coding and optional icon.

### Design Rationale
- **Problem**: No visual distinction between pending, completed, failed transactions
- **Banking Context**: Users need immediate status recognition for transaction states
- **User Benefit**: Quick status identification, reduced uncertainty, clear visual hierarchy

### API Specification

```typescript
interface StatusBadgeProps {
  /** Transaction status */
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'scheduled';
  
  /** Size variant */
  size?: 'small' | 'medium';
  
  /** Show status icon */
  showIcon?: boolean; // Default: true
  
  /** Custom label (overrides default status text) */
  label?: string;
}
```

### Visual Specifications

**Layout Structure:**
```
[⏱️ Pending]     (yellow background)
[✓ Completed]    (green background)
[✕ Failed]       (red background)
[○ Cancelled]    (gray background)
[⟳ Processing]   (blue background)
[📅 Scheduled]   (purple background)
```

**Dimensions:**
- Small: 20px height, 6px padding, 11px font
- Medium: 24px height, 8px padding, 12px font
- Icon size: 12px (small), 14px (medium)
- Border radius: 4px
- Gap between icon and text: 4px

**Status Colors (use DS semantic tokens):**
- Pending: Yellow background (#FEF3C7), dark text (#92400E)
- Completed: Green background (#D1FAE5), dark text (#065F46)
- Failed: Red background (#FEE2E2), dark text (#991B1B)
- Cancelled: Gray background (#F3F4F6), dark text (#374151)
- Processing: Blue background (#DBEAFE), dark text (#1E40AF)
- Scheduled: Purple background (#EDE9FE), dark text (#5B21B6)

**Icons by Status:**
- Pending: Clock icon
- Completed: Checkmark icon
- Failed: X icon
- Cancelled: Circle icon
- Processing: Refresh/spinner icon
- Scheduled: Calendar icon

### Usage Examples

```tsx
// Basic status badge
<StatusBadge status="pending" />
// Output: [⏱️ Pending]

<StatusBadge status="completed" />
// Output: [✓ Completed]

<StatusBadge status="failed" />
// Output: [✕ Failed]

// Small size for compact displays
<StatusBadge status="processing" size="small" />

// Without icon
<StatusBadge status="completed" showIcon={false} />
// Output: [Completed]

// Custom label
<StatusBadge status="pending" label="Payment in progress" />
// Output: [⏱️ Payment in progress]
```

### Implementation Notes

**Composition from Existing DS Components:**
- Base: `Badge` or `Chip` component with custom styling
- Icon: `Icon` component
- Layout: Inline flex with icon + text

**Status Label Mapping:**
```typescript
const statusLabels = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  processing: 'Processing',
  scheduled: 'Scheduled',
};
```

**Icon Mapping:**
```typescript
const statusIcons = {
  pending: 'clock',
  completed: 'check',
  failed: 'close',
  cancelled: 'circle',
  processing: 'refresh',
  scheduled: 'calendar',
};
```

### Accessibility
- Use `role="status"` for non-interactive badge
- Full status announced: "Transaction status: Pending"
- Icon: `aria-hidden="true"` (label provides context)
- Color not sole indicator (icon + text provide full context)
- Sufficient contrast between background and text (WCAG AA)
- Status changes announced via `aria-live="polite"`

---

## 11. TabBar Component

### Purpose
Switch between related views (All transactions, Expenses, Income).

### Design Rationale
- **Problem**: No way to switch between different transaction views without navigation
- **Banking Context**: Users need to filter by transaction type or view different sections
- **User Benefit**: Quick view switching, clear current context, improved navigation

### API Specification

```typescript
interface TabBarProps {
  /** Array of tabs */
  tabs: Array<{
    id: string;
    label: string;
    icon?: IconName;
    badge?: number; // Notification count
    disabled?: boolean;
  }>;
  
  /** Currently active tab ID */
  activeTab: string;
  
  /** Tab change callback */
  onChange: (tabId: string) => void;
  
  /** Visual variant */
  variant?: 'default' | 'pills' | 'underline';
  
  /** Full width tabs (equal distribution) */
  fullWidth?: boolean;
}
```

### Visual Specifications

**Layout Structure:**

Default variant:
```
┌────────────┬────────────┬────────────┐
│    All     │  Expenses  │   Income   │
└────────────┴────────────┴────────────┘
   (active)     (hover)    (inactive)
```

Pills variant:
```
 ╭───────╮  ┌─────────┐  ┌────────┐
 │  All  │  │Expenses │  │ Income │
 ╰───────╯  └─────────┘  └────────┘
```

Underline variant:
```
  All      Expenses    Income
  ──       ─────────   ──────
```

**Dimensions:**
- Tab height: 48px
- Horizontal padding: 16-24px
- Gap between tabs: 8px (pills), 0px (default/underline)
- Underline height: 3px
- Border radius (pills): 24px
- Min touch target: 44x44px

**Colors & States:**
- Active: Primary color background (pills), primary text + underline
- Inactive: Neutral color, hover shows subtle background
- Disabled: 50% opacity, no pointer events
- Focus: Clear focus outline following DS patterns

**Badge Display:**
- Position: Top-right of tab label
- Size: 18px circle with count
- Color: Accent color (red for notifications)
- Max count: 99+ for larger numbers

### Usage Examples

```tsx
// Basic tab bar
<TabBar
  tabs={[
    { id: 'all', label: 'All' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'income', label: 'Income' }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>

// With icons and badges
<TabBar
  tabs={[
    { id: 'all', label: 'All', icon: 'list', badge: 15 },
    { id: 'expenses', label: 'Expenses', icon: 'arrowDown', badge: 8 },
    { id: 'income', label: 'Income', icon: 'arrowUp', badge: 7 }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="pills"
/>

// Full width distribution
<TabBar
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
  fullWidth
/>

// With disabled tab
<TabBar
  tabs={[
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending', disabled: true },
    { id: 'completed', label: 'Completed' }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### Implementation Notes

**Composition from Existing DS Components:**
- Container: `Stack` with `direction="row"`
- Tabs: `Button` component with custom variants
- Badge: DS `Badge` component
- Icon: `Icon` component
- Underline/pill: Custom styled elements or pseudo-elements

**Variant Rendering:**
- Default: Subtle border between tabs, active has background
- Pills: Individual rounded buttons, active has primary background
- Underline: Minimal design, active has bottom border

**Full Width Logic:**
```typescript
const tabStyle = fullWidth ? {
  flex: 1,
  justifyContent: 'center'
} : {
  flex: '0 0 auto'
};
```

### Accessibility
- Container: `role="tablist"`
- Each tab: `role="tab"`
- Active tab: `aria-selected="true"`
- Inactive tabs: `aria-selected="false"`
- Tab panels: `role="tabpanel"` with `aria-labelledby` referencing tab
- Keyboard: Arrow keys navigate between tabs
- Disabled tabs: `aria-disabled="true"`, not focusable
- Badge count announced: "Expenses, 8 notifications"

---

## 12. ActionSheet Component

### Purpose
Mobile-optimized action menu for contextual transaction actions.

### Design Rationale
- **Problem**: No mobile-friendly way to show multiple actions for a transaction
- **Banking Context**: Users need quick access to actions like Share, Export, Report
- **User Benefit**: Touch-friendly actions, clear options, doesn't obscure content

### API Specification

```typescript
interface ActionSheetProps {
  /** Control open state */
  isOpen: boolean;
  
  /** Close callback */
  onClose: () => void;
  
  /** Optional title */
  title?: string;
  
  /** Array of actions */
  actions: Array<{
    label: string;
    icon?: IconName;
    variant?: 'default' | 'destructive';
    onClick: () => void;
    disabled?: boolean;
  }>;
  
  /** Cancel button label */
  cancelLabel?: string; // Default: 'Cancel'
}
```

### Visual Specifications

**Layout Structure (Mobile - Bottom Sheet):**
```
╔══════════════════════════════════════╗
║ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║ ← Backdrop
║                                      ║
║  ┌────────────────────────────────┐  ║
║  │ Transaction Actions            │  ║ ← Title
║  ├────────────────────────────────┤  ║
║  │ [📤] Share Receipt             │  ║
║  │ [📊] Export PDF                │  ║
║  │ [🚨] Report Issue              │  ║
║  ├────────────────────────────────┤  ║
║  │ Cancel                         │  ║ ← Cancel button
║  └────────────────────────────────┘  ║
╚══════════════════════════════════════╝
```

**Dimensions:**
- Sheet max-width: 100% on mobile, 400px on desktop
- Sheet padding: 16px
- Action item height: 56px
- Icon size: 24px
- Border radius: 16px top corners
- Gap between actions: 1px divider or 4px spacing
- Cancel button: Separated with 8px gap, slightly emphasized

**Colors & States:**
- Default action: Primary text, neutral background on hover
- Destructive action: Red text, red background on hover
- Disabled: 50% opacity, no pointer events
- Backdrop: Semi-transparent black (rgba(0,0,0,0.5))

**Animation:**
- Sheet slides up from bottom (mobile)
- Backdrop fades in
- Duration: 200-300ms with ease-out curve

### Usage Examples

```tsx
// Basic action sheet
<ActionSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Transaction Actions"
  actions={[
    {
      label: 'Share Receipt',
      icon: 'share',
      onClick: handleShare
    },
    {
      label: 'Export PDF',
      icon: 'export',
      onClick: handleExport
    },
    {
      label: 'Report Issue',
      icon: 'warning',
      variant: 'destructive',
      onClick: handleReport
    }
  ]}
/>

// Without title
<ActionSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  actions={[
    { label: 'View Details', icon: 'view', onClick: handleView },
    { label: 'Edit', icon: 'edit', onClick: handleEdit },
    { label: 'Delete', icon: 'trash', variant: 'destructive', onClick: handleDelete }
  ]}
/>

// With disabled action
<ActionSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  actions={[
    { label: 'Download', icon: 'download', onClick: handleDownload, disabled: !hasReceipt }
  ]}
  cancelLabel="Dismiss"
/>
```

### Implementation Notes

**Composition from Existing DS Components:**
- Base: DS `Sheet` component configured for bottom position
- Actions: `List` + `ListItem` components with interactive prop
- Icon: `Icon` component
- Cancel: `Button` component with secondary variant
- Backdrop: Part of Sheet component

**Sheet Configuration:**
```typescript
<Sheet
  isOpen={isOpen}
  onClose={onClose}
  position="bottom"
  variant="sheet"
  // Additional props
/>
```

**Close Triggers:**
- Click backdrop
- Click Cancel button
- Click any action (after executing)
- Swipe down gesture (if supported)
- Escape key

**Mobile Optimization:**
- Touch targets: Minimum 56px height
- Swipe-to-close gesture
- Prevents body scroll when open
- Safe area padding for iOS notch

### Accessibility
- Sheet: `role="dialog"` or use existing Sheet accessibility
- Title: `aria-labelledby` if title present
- Actions list: `role="menu"`
- Each action: `role="menuitem"`
- Destructive actions: Additional warning in `aria-label`
- Focus trap: Focus stays within sheet when open
- Focus management: Focus first action on open, return focus on close
- Keyboard: Escape closes sheet, Enter/Space activates action
- Backdrop: `aria-hidden="true"`
- Disabled actions: `aria-disabled="true"`, not focusable

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
- [ ] **Accessibility requirements fully met (see Accessibility section below)**
- [ ] No `className` props (components must not be styleable downstream)

**These banking components must feel native to the design system, not like external additions. Study existing DS components thoroughly before implementing.**

---

## Accessibility Requirements

**MANDATORY**: All components MUST meet the Design System's accessibility standards. Before implementing, review the accessibility guidelines and patterns in the Design System project.

### Required Accessibility Standards

1. **WCAG 2.1 Level AA Compliance**
   - All components must meet WCAG 2.1 Level AA standards minimum
   - Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
   - Don't rely solely on color to convey information

2. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Tab order must be logical and intuitive
   - Focus indicators must be clearly visible (follow DS focus patterns)
   - Support standard keyboard shortcuts (Enter, Space, Escape, Arrow keys where appropriate)

3. **Screen Reader Support**
   - Semantic HTML elements used appropriately
   - All interactive elements have accessible names
   - ARIA attributes follow WAI-ARIA best practices
   - Dynamic content changes announced via `aria-live` regions
   - Images and icons have appropriate alt text or `aria-hidden` if decorative

4. **ARIA Patterns**
   - Follow DS ARIA patterns for component types (search, tabs, menus, dialogs)
   - Use ARIA roles appropriately (don't override semantic HTML)
   - Provide `aria-label`, `aria-labelledby`, `aria-describedby` where needed
   - Use `aria-expanded`, `aria-selected`, `aria-pressed` for stateful components
   - Implement proper `aria-live` for status updates and dynamic content

5. **Focus Management**
   - Focus states must be clearly visible (use DS focus ring patterns)
   - Focus must be trapped in modals/sheets when open
   - Focus must return to trigger element when closing modals/sheets
   - Skip links for long content (if applicable)

6. **Touch Targets**
   - Minimum 44x44px touch target size (WCAG 2.5.5)
   - Adequate spacing between interactive elements
   - Support for touch, mouse, and keyboard interactions

7. **Motion and Animation**
   - Respect `prefers-reduced-motion` media query
   - Provide alternatives to animation when motion is reduced
   - No auto-playing animations that can't be paused

### Component-Specific Accessibility

**SearchField:**
- Input has `role="searchbox"` and `aria-label="Search transactions"`
- Dropdown uses `aria-expanded` for open/closed state
- Suggestions have `role="listbox"` and `option`
- Use `aria-activedescendant` for keyboard navigation
- Announce suggestion count: "5 suggestions available"
- Clear button has descriptive `aria-label`

**CategoryBadge:**
- Non-interactive: Semantic element with no role
- Interactive: `role="button"` with keyboard support
- Icon is `aria-hidden="true"`
- Full category announced: "Food and Dining category"
- Color not sole indicator (icon + text provide context)

**StatusBadge:**
- Use `role="status"` for status announcements
- Status changes use `aria-live="polite"`
- Full status announced: "Transaction status: Pending"
- Icon is `aria-hidden="true"`

**TabBar:**
- Container: `role="tablist"`
- Tabs: `role="tab"` with `aria-selected`
- Arrow key navigation between tabs
- Badge counts announced
- Tab panels use `role="tabpanel"`

**ActionSheet:**
- Sheet: `role="dialog"` with focus trap
- Actions: `role="menu"` and `menuitem`
- Focus management on open/close
- Keyboard navigation (Escape closes)
- Destructive actions announced with warning

### Accessibility Testing Checklist

**For each component, verify:**
- [ ] Reviewed DS accessibility guidelines and patterns
- [ ] Keyboard navigation works completely (no mouse required)
- [ ] Screen reader testing completed (NVDA, JAWS, VoiceOver)
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators visible and follow DS patterns
- [ ] ARIA attributes validated (aXe, WAVE, Lighthouse)
- [ ] Touch targets meet minimum size requirements
- [ ] Respects `prefers-reduced-motion`
- [ ] Tested with browser zoom (200%+)
- [ ] No keyboard traps
- [ ] Dynamic content changes announced

---

## Implementation Strategy

### Phase 2 Build Order

1. **CategoryBadge** (2-3 hours)
   - Simple composition from Chip + Icon
   - Establishes category visual language
   - No external dependencies

2. **StatusBadge** (2-3 hours)
   - Simple composition from Badge + Icon
   - Critical for transaction status display
   - No external dependencies

3. **TabBar** (3-4 hours)
   - Moderate complexity
   - Compose from Button + Stack
   - Common pattern, high reusability

4. **SearchField** (5-6 hours)
   - Complex with dropdown, suggestions, debouncing
   - Depends on TextField, List, ListItem
   - High value for user experience

5. **ActionSheet** (3-4 hours)
   - Uses existing Sheet component
   - Mainly configuration + action list
   - Mobile-first design

**Total Estimated Time: 15-20 hours for all 5 components**

### Testing Requirements

**MUST follow Design System testing patterns and utilities:**

**Unit Tests:**
- Use the same testing library and patterns as existing DS components
- Match DS test structure and organization
- Component rendering with all prop combinations
- Event handlers and callbacks
- Keyboard interactions
- State management
- Accessibility attributes present
- Achieve minimum coverage requirement (typically 80%+)

**Visual Tests:**
- Storybook stories for each component following DS story conventions
- All variants and sizes
- Interactive states (hover, focus, active, disabled)
- Responsive behavior
- Dark mode (if supported by DS)
- Use DS visual regression testing tools if available

**Integration Tests:**
- Components work together (SearchField with suggestions)
- Events propagate correctly
- Keyboard navigation flows
- Focus management

### Design Tokens to Add

**CRITICAL**: Before adding any new tokens, you MUST:
1. **Review the Token System**: Study the existing token structure, hierarchy, and naming patterns
2. **Understand Base vs Semantic**: Base tokens define raw values, semantic tokens reference base tokens
3. **Check for Existing Tokens**: Verify if suitable tokens already exist before creating new ones
4. **Follow Token Architecture**: New semantic tokens MUST use base tokens, never raw values

**Token Addition Rules:**
- ✅ Semantic tokens reference base tokens: `colors.semantic.success: colors.base.green.500`
- ❌ Semantic tokens use raw values: `colors.semantic.success: '#10b981'`
- ✅ Reuse existing semantic tokens when possible
- ✅ New tokens follow DS naming conventions and structure
- ❌ Create duplicate tokens with different names

**Category Colors (reuse semantic tokens):**
```typescript
// PREFERRED: Map to existing semantic tokens
const categoryColors = {
  blue: colors.semantic.info,
  green: colors.semantic.success,
  orange: colors.semantic.warning,
  purple: colors.semantic.purple, // If exists, otherwise create
  pink: colors.semantic.pink,
  red: colors.semantic.error,
  yellow: colors.semantic.caution,
  gray: colors.semantic.neutral,
};
```

**Status Colors (reuse semantic tokens):**
```typescript
const statusColors = {
  pending: colors.semantic.warning,     // Yellow
  completed: colors.semantic.success,   // Green
  failed: colors.semantic.error,        // Red
  cancelled: colors.semantic.neutral,   // Gray
  processing: colors.semantic.info,     // Blue
  scheduled: colors.semantic.purple,    // Purple
};
```

**Icons to Add (follow DS icon conventions):**
```typescript
icons: {
  clock: 'clock',           // For pending status
  refresh: 'refresh',       // For processing status
  calendar: 'calendar',     // For scheduled status
  restaurant: 'restaurant', // For food category
  plane: 'plane',          // For travel category
  cart: 'cart',            // For shopping category
  // ... other category icons
}
```

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
- **Revolut**: Search with suggestions, category badges, action sheets
- **Brex**: Tab navigation, status badges, category colors
- **Stripe Dashboard**: Search patterns, status indicators
- **Coinbase**: Category organization, action menus

### Technical References
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Common Origin Design System](https://github.com/common-origin/design-system)

---

## Questions for Design Team

1. Should category colors be customizable per implementation or standardized?
2. Do we need dark mode variants for all badge/chip components?
3. What animation style for ActionSheet (slide, fade, scale)?
4. Should SearchField support multi-select from suggestions?
5. Should TabBar support nested tab groups?
6. Do we need custom category icon mappings?

## Questions for Engineering Team

1. Should SearchField debouncing be handled internally or externally?
2. Do we need SSR compatibility for dropdown positioning?
3. Should ActionSheet use native bottom sheet on mobile?
4. How should we handle very long category names?
5. Should tabs support lazy loading of content?
6. Do we need gesture support for ActionSheet swipe-to-close?

---

**Document Version**: 1.0  
**Date**: December 17, 2025  
**Author**: A2UI Banking Demo Team  
**Status**: Ready for Implementation
