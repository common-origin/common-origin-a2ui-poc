# Common Origin Design System — Component API Reference

> **Auto-generated from `@common-origin/design-system` v2.8.2 type definitions.**
> Regenerate this file when the DS version is bumped by reading `.d.ts` files from `node_modules/@common-origin/design-system/dist/`.

---

## Table of Contents

### Atoms
1. [Button](#button)
2. [Typography](#typography)
3. [Stack](#stack)
4. [MoneyDisplay](#moneydisplay)
5. [Chip](#chip)
6. [FilterChip](#filterchip)
7. [BooleanChip](#booleanchip)
8. [CategoryBadge](#categorybadge)
9. [StatusBadge](#statusbadge)
10. [Divider](#divider)
11. [ProgressBar](#progressbar)
12. [Badge](#badge)
13. [Box](#box)
14. [Avatar](#avatar)
15. [Icon](#icon)
16. [IconButton](#iconbutton)
17. [Picture](#picture)
18. [DateFormatter](#dateformatter)
19. [Container](#container)
20. [Tag](#tag)

### Molecules
21. [AccountCard](#accountcard)
22. [ActionSheet](#actionsheet)
23. [Alert](#alert)
24. [CardLarge](#cardlarge)
25. [CardSmall](#cardsmall)
26. [Checkbox](#checkbox)
27. [ChipGroup](#chipgroup)
28. [DateGroup](#dategroup)
29. [Dropdown](#dropdown)
30. [EmptyState](#emptystate)
31. [List](#list)
32. [ListItem](#listitem)
33. [NumberInput](#numberinput)
34. [SearchField](#searchfield)
35. [Sheet](#sheet)
36. [TabBar](#tabbar)
37. [TextField](#textfield)
38. [TransactionListItem](#transactionlistitem)
39. [Slider](#slider)
40. [PasswordField](#passwordfield)

### Shared Types
- [IconName](#iconname)

---

## Shared Types

### IconName

```typescript
type IconName =
  | 'add' | 'addRing' | 'arrowDown' | 'arrowLeft' | 'arrowRight' | 'arrowUp'
  | 'back' | 'bell' | 'cancel' | 'caret' | 'caretDown' | 'caretUp'
  | 'check' | 'checkRing' | 'close' | 'copy' | 'crossCircle'
  | 'directionRight' | 'edit' | 'export' | 'fileDocSearch' | 'filter'
  | 'info' | 'lamp' | 'lineOut' | 'link' | 'menu' | 'message' | 'order'
  | 'paper' | 'pause' | 'play' | 'playBack' | 'refresh' | 'remove'
  | 'search' | 'star' | 'starFilled' | 'table' | 'trash' | 'userBox'
  | 'view' | 'viewHide';
```

---

## Atoms

### Button

**Import**: `import { Button } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Button`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | **Yes** | — | Button label content |
| `variant` | `'primary' \| 'secondary' \| 'naked'` | No | `'primary'` | |
| `size` | `'small' \| 'medium' \| 'large'` | No | `'medium'` | |
| `purpose` | `'button' \| 'link'` | No | `'button'` | When `'link'`, renders as anchor |
| `url` | `string` | No | — | For link purpose |
| `target` | `string` | No | — | For link purpose |
| `iconName` | `IconName` | No | — | |
| `linkComponent` | `ComponentType` | No | — | Custom link component |
| `disabled` | `boolean` | No | `false` | Inherited from ButtonHTMLAttributes |
| `onClick` | `() => void` | No | — | Inherited from ButtonHTMLAttributes |

---

### Typography

**Import**: `import { Typography } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Text`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | **Yes** | — | Text content |
| `variant` | `TypographyVariant` | No | `'body'` | See variants below |
| `color` | `TypographyColor` | No | `'default'` | See colors below |
| `as` | `ElementType` | No | — | Override HTML element |

**TypographyVariant**: `'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle' | 'body' | 'small' | 'overline' | 'caption' | 'button1' | 'button2' | 'button3' | 'label'`

**TypographyColor**: `'default' | 'emphasis' | 'subdued' | 'inverse' | 'disabled' | 'interactive' | 'error' | 'success' | 'warning'`

---

### Stack

**Import**: `import { Stack } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Stack`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | **Yes** | — | |
| `direction` | `'column' \| 'row'` | No | `'column'` | |
| `gap` | `StackGap` | No | `'md'` | See values below |
| `alignItems` | `StackAlign` | No | — | |
| `justifyContent` | `StackJustify` | No | — | |
| `wrap` | `boolean` | No | `false` | |

**StackGap**: `'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'`

**StackAlign**: `'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline'`

**StackJustify**: `'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'`

---

### MoneyDisplay

**Import**: `import { MoneyDisplay } from '@common-origin/design-system'`
**A2UI Catalog Name**: `MoneyDisplay`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `amount` | `number` | **Yes** | — | Negative for debits |
| `currency` | `string` | No | `'AUD'` | ISO 4217 code |
| `variant` | `'default' \| 'positive' \| 'negative' \| 'neutral'` | No | `'default'` | |
| `showSign` | `boolean` | No | `false` | |
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | No | `'medium'` | |
| `weight` | `'regular' \| 'medium' \| 'bold'` | No | `'regular'` | |
| `locale` | `string` | No | `'en-AU'` | |
| `align` | `'left' \| 'center' \| 'right'` | No | `'left'` | |

---

### Chip

**Import**: `import { Chip } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Chip`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | No | — | Chip label |
| `variant` | `'default' \| 'emphasis' \| 'subtle' \| 'interactive'` | No | `'default'` | Also accepts legacy `'light' \| 'dark'` |
| `size` | `'small' \| 'medium'` | No | `'medium'` | |
| `disabled` | `boolean` | No | `false` | |
| `onClick` | `() => void` | No | — | |

---

### FilterChip

**Import**: `import { FilterChip } from '@common-origin/design-system'`
**A2UI Catalog Name**: `FilterChip`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | No | — | |
| `selected` | `boolean` | No | `false` | |
| `onDismiss` | `() => void` | No | — | |
| `size` | `'small' \| 'medium'` | No | `'medium'` | |
| `disabled` | `boolean` | No | `false` | |

---

### BooleanChip

**Import**: `import { BooleanChip } from '@common-origin/design-system'`
**A2UI Catalog Name**: `BooleanChip`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | No | — | |
| `selected` | `boolean` | **Yes** | — | |
| `onClick` | `() => void` | **Yes** | — | |
| `size` | `'small' \| 'medium'` | No | `'medium'` | |
| `disabled` | `boolean` | No | `false` | |

---

### CategoryBadge

**Import**: `import { CategoryBadge } from '@common-origin/design-system'`
**A2UI Catalog Name**: `CategoryBadge`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | **Yes** | — | Badge text |
| `color` | `CategoryColor` | No | `'blue'` | See values below |
| `variant` | `'filled' \| 'outlined' \| 'minimal'` | No | `'filled'` | |
| `size` | `'small' \| 'medium'` | No | `'medium'` | |
| `icon` | `IconName` | No | — | |
| `onClick` | `() => void` | No | — | |
| `disabled` | `boolean` | No | `false` | |

**CategoryColor**: `'blue' | 'purple' | 'pink' | 'yellow' | 'green' | 'red' | 'orange' | 'gray'`

---

### StatusBadge

**Import**: `import { StatusBadge } from '@common-origin/design-system'`
**A2UI Catalog Name**: `StatusBadge`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `status` | `StatusType` | **Yes** | — | See values below |
| `label` | `string` | No | — | |
| `size` | `'small' \| 'medium'` | No | `'medium'` | |
| `showIcon` | `boolean` | No | `true` | |
| `liveRegion` | `boolean` | No | `true` | |

**StatusType**: `'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'scheduled'`

> **Note**: A2UI catalog rules include `'refunded'` in StatusBadge status values, but the DS only supports `'scheduled'` as the 6th option. This is a mismatch — see `docs/design-system-feedback.md`.

---

### Divider

**Import**: `import { Divider } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Divider`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `variant` | `'default' \| 'strong' \| 'minimal'` | No | `'default'` | |
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | No | `'medium'` | |
| `orientation` | `'horizontal' \| 'vertical'` | No | `'horizontal'` | |

---

### ProgressBar

**Import**: `import { ProgressBar } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Progress` (wrapped with Typography label)

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `value` | `number` | **Yes** | — | 0–100 |
| `variant` | `'horizontal' \| 'vertical'` | No | `'horizontal'` | |
| `color` | `'success' \| 'error' \| 'default'` | No | `'default'` | |
| `height` | `'sm' \| 'md' \| 'lg' \| 'xl'` | No | `'md'` | |
| `width` | `'sm' \| 'md' \| 'lg' \| 'xl'` | No | — | |

---

### Badge

**Import**: `import { Badge } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | **Yes** | — | |
| `count` | `number` | No | — | |
| `max` | `number` | No | — | |
| `variant` | `'default' \| 'primary' \| 'error' \| 'warning' \| 'success'` | No | `'default'` | |
| `dot` | `boolean` | No | `false` | |

---

### Box

**Import**: `import { Box } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

A general-purpose layout primitive with comprehensive spacing, color, and styling props. Uses semantic token keys for all spacing/color/border values.

| Prop Category | Props | Type |
|---------------|-------|------|
| Display | `display` | `'block' \| 'inline' \| 'inline-block' \| 'flex' \| 'inline-flex' \| 'none'` |
| Flex | `flexDirection`, `justifyContent`, `alignItems`, `flexWrap`, `gap` | Standard flex values |
| Margin | `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my` | Spacing token keys |
| Padding | `p`, `pt`, `pr`, `pb`, `pl`, `px`, `py` | Spacing token keys |
| Size | `width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, `minHeight` | `string` |
| Position | `position`, `top`, `right`, `bottom`, `left` | Standard CSS values |
| Border | `borderRadius`, `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft` | Token keys |
| Color | `bg`, `color` | Semantic token keys |
| Effects | `shadow`, `cursor`, `transition`, `hoverShadow`, `hoverTransform` | Token keys / string |
| Overflow | `overflow`, `overflowX`, `overflowY` | `'visible' \| 'hidden' \| 'scroll' \| 'auto'` |
| Other | `as`, `children`, `onClick`, `role`, `tabIndex` | Standard React props |

**Spacing token keys**: `'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl' | 'auto'`

**Background token keys**: `'default' | 'subtle' | 'emphasis' | 'surface' | 'inverse' | 'interactive' | 'interactive-subtle' | 'interactive-hover' | 'interactive-active' | 'error' | 'error-subtle' | 'success' | 'success-subtle' | 'warning' | 'warning-subtle' | 'disabled' | 'progressTrack'`

---

### Avatar

**Import**: `import { Avatar } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `name` | `string` | **Yes** | — | Generates initials fallback |
| `picture` | `string` | No | — | Image URL |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | No | `'md'` | |

---

### Icon

**Import**: `import { Icon } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `name` | `IconName` | **Yes** | — | |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | No | `'md'` | |
| `iconColor` | `'default' \| 'emphasis' \| ... \| 'inherit'` | No | `'default'` | |

---

### IconButton

**Import**: `import { IconButton } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `variant` | `'primary' \| 'secondary' \| 'naked'` | **Yes** | — | |
| `iconName` | `IconName` | **Yes** | — | |
| `aria-label` | `string` | **Yes** | — | Accessibility required |
| `size` | `'small' \| 'medium' \| 'large'` | No | `'medium'` | |
| `url` | `string` | No | — | |
| `onClick` | `() => void` | No | — | |

---

### Picture

**Import**: `import { Picture } from '@common-origin/design-system'`
**Not in A2UI catalog** — used internally by CardLarge.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `title` | `string` | **Yes** | — | Alt text |
| `src` | `string` | **Yes** | — | Image source |
| `width` | `number` | No | — | |
| `height` | `number` | No | — | |
| `onClick` | `() => void` | No | — | |
| `href` | `string` | No | — | |

---

### DateFormatter

**Import**: `import { DateFormatter } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `dateString` | `string` | **Yes** | — | |
| `formatString` | `string` | No | `'yyyy'` | |
| `mode` | `'absolute' \| 'relative' \| 'smart'` | No | `'absolute'` | |

---

### Container

**Import**: `import { Container } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | No | — | |

---

### Tag

**Import**: `import { Tag } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | **Yes** | — | |
| `variant` | `'default' \| 'interactive' \| 'success' \| 'warning' \| 'error' \| 'emphasis'` | No | `'default'` | |
| `border` | `boolean` | No | `true` | |

---

## Molecules

### AccountCard

**Import**: `import { AccountCard } from '@common-origin/design-system'`
**A2UI Catalog Name**: `AccountCard`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `accountType` | `AccountType` | **Yes** | — | See values below |
| `accountName` | `string` | **Yes** | — | |
| `balance` | `number` | **Yes** | — | |
| `accountNumber` | `string` | No | — | |
| `trend` | `'up' \| 'down' \| 'neutral'` | No | — | |
| `trendValue` | `string` | No | — | e.g., "+2.5%" |
| `action` | `AccountCardAction` | No | — | Primary action button |
| `secondaryAction` | `AccountCardAction` | No | — | |
| `currency` | `string` | No | `'AUD'` | |
| `onClick` | `() => void` | No | — | |

**AccountType**: `'checking' | 'savings' | 'credit' | 'investment' | 'loan'`

**AccountCardAction**:
```typescript
interface AccountCardAction {
    label: string;      // Required
    onClick: () => void; // Required
    icon?: IconName;
    variant?: 'primary' | 'secondary' | 'naked';
}
```

> **DS Feedback**: The DS uses `'checking'` but Australian banking needs `'everyday'`. See `docs/design-system-feedback.md`.

---

### ActionSheet

**Import**: `import { ActionSheet } from '@common-origin/design-system'`
**A2UI Catalog Name**: `ActionSheet`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `isOpen` | `boolean` | **Yes** | — | |
| `onClose` | `() => void` | **Yes** | — | |
| `actions` | `Action[]` | **Yes** | — | See below |
| `title` | `string` | No | — | |
| `description` | `string` | No | — | |
| `closeOnOverlayClick` | `boolean` | No | `true` | |
| `closeOnEscape` | `boolean` | No | `true` | |
| `showCloseButton` | `boolean` | No | `true` | |

**Action**:
```typescript
interface Action {
    id: string;          // Required
    label: string;       // Required
    onSelect: () => void; // Required
    icon?: IconName;
    destructive?: boolean;
    disabled?: boolean;
}
```

---

### Alert

**Import**: `import { Alert } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Alert`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | **Yes** | — | Alert content |
| `variant` | `'error' \| 'warning' \| 'info' \| 'success'` | No | `'info'` | |
| `title` | `string` | No | — | |
| `dismissible` | `boolean` | No | `false` | |
| `onDismiss` | `() => void` | No | — | |
| `action` | `ReactNode` | No | — | Custom action element |
| `inline` | `boolean` | No | `false` | |
| `ariaLive` | `'polite' \| 'assertive' \| 'off'` | No | `'polite'` | |

---

### CardLarge

**Import**: `import { CardLarge } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Card`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `title` | `string` | **Yes** | — | |
| `excerpt` | `string` | **Yes** | — | |
| `picture` | `string` | **Yes** | — | **Required — forces placeholder hack** |
| `subtitle` | `string` | No | — | |
| `labels` | `string[]` | No | — | |
| `onImageClick` | `() => void` | No | — | |
| `imageHref` | `string` | No | — | |

> **DS Feedback**: `picture` is required, forcing the catalog to pass a grey placeholder SVG when the agent doesn't provide an image. Should be optional, or a `CardLarge` variant without image should exist. See `docs/design-system-feedback.md`.

---

### CardSmall

**Import**: `import { CardSmall } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS, could be used as an alternative to CardLarge when no image is needed.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `title` | `string` | **Yes** | — | |
| `picture` | `string` | No | — | **Optional** (unlike CardLarge) |
| `subtitle` | `string` | No | — | |
| `meta` | `string` | No | — | |
| `href` | `string` | No | — | |

---

### Checkbox

**Import**: `import { Checkbox } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Checkbox`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `label` | `string` | **Yes** | — | |
| `checked` | `boolean` | No | — | |
| `indeterminate` | `boolean` | No | — | |
| `labelPosition` | `'left' \| 'right'` | No | `'right'` | |
| `helperText` | `string` | No | — | |
| `error` | `string` | No | — | |
| `disabled` | `boolean` | No | `false` | |
| `onChange` | `(event: ChangeEvent) => void` | No | — | |

---

### ChipGroup

**Import**: `import { ChipGroup } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `labels` | `string[]` | **Yes** | — | |
| `variant` | `'default' \| 'dark'` | No | `'default'` | |

---

### DateGroup

**Import**: `import { DateGroup } from '@common-origin/design-system'`
**A2UI Catalog Name**: `DateGroup`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `date` | `Date \| string` | **Yes** | — | |
| `children` | `ReactNode` | **Yes** | — | Transaction items |
| `format` | `'absolute' \| 'relative' \| 'smart'` | No | `'absolute'` | |
| `showTotal` | `boolean` | No | `false` | |
| `totalAmount` | `number` | No | — | |
| `showCount` | `boolean` | No | `false` | |
| `count` | `number` | No | — | |
| `sticky` | `boolean` | No | `false` | |
| `currency` | `string` | No | `'AUD'` | |

---

### Dropdown

**Import**: `import { Dropdown } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Select`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `options` | `DropdownOption[]` | **Yes** | — | See below |
| `value` | `string` | **Yes** | — | |
| `onChange` | `(value: string) => void` | **Yes** | — | |
| `placeholder` | `string` | No | — | |
| `disabled` | `boolean` | No | `false` | |
| `label` | `string` | No | — | |
| `helperText` | `string` | No | — | |
| `error` | `string` | No | — | |

**DropdownOption**:
```typescript
interface DropdownOption {
    id: string;    // Required
    label: string; // Required
    value?: any;
}
```

> **Note**: A2UI catalog maps `{value, label}` pairs from the agent to `{id: value, value, label}` format for the DS.

---

### EmptyState

**Import**: `import { EmptyState } from '@common-origin/design-system'`
**A2UI Catalog Name**: `EmptyState`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `title` | `string` | **Yes** | — | |
| `description` | `string` | **Yes** | — | |
| `illustration` | `EmptyStateIllustration` | No | — | See values below |
| `customIllustration` | `ReactNode` | No | — | |
| `action` | `EmptyStateAction` | No | — | See below |
| `secondaryAction` | `EmptyStateAction` | No | — | |
| `variant` | `'default' \| 'error' \| 'success'` | No | `'default'` | |
| `size` | `'small' \| 'medium' \| 'large'` | No | `'medium'` | |

**EmptyStateIllustration**: `'search' | 'transactions' | 'notifications' | 'empty' | 'error' | 'custom'`

**EmptyStateAction**:
```typescript
interface EmptyStateAction {
    label: string;       // Required
    onClick: () => void; // Required
    variant?: 'primary' | 'secondary';
    icon?: IconName;
}
```

---

### List

**Import**: `import { List } from '@common-origin/design-system'`
**A2UI Catalog Name**: `List`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `children` | `ReactNode` | **Yes** | — | ListItem children |
| `dividers` | `boolean` | No | `true` | |
| `spacing` | `'compact' \| 'comfortable'` | No | `'comfortable'` | |

---

### ListItem

**Import**: `import { ListItem } from '@common-origin/design-system'`
**A2UI Catalog Name**: `ListItem`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `primary` | `ReactNode` | **Yes** | — | Main text |
| `secondary` | `ReactNode` | No | — | Secondary text |
| `badge` | `ReactNode` | No | — | Trailing badge element |
| `icon` | `ReactNode` | No | — | Leading icon element |
| `expandable` | `boolean` | No | `false` | |
| `expanded` | `boolean` | No | `false` | |
| `onToggle` | `() => void` | No | — | |
| `interactive` | `boolean` | No | `false` | |
| `onClick` | `() => void` | No | — | |
| `disabled` | `boolean` | No | `false` | |
| `selected` | `boolean` | No | `false` | |
| `spacing` | `'compact' \| 'comfortable'` | No | `'comfortable'` | |
| `children` | `ReactNode` | No | — | Expandable content |

---

### NumberInput

**Import**: `import { NumberInput } from '@common-origin/design-system'`
**A2UI Catalog Name**: `NumberField`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `label` | `string` | No | — | |
| `helperText` | `string` | No | — | |
| `error` | `string` | No | — | |
| `required` | `boolean` | No | `false` | |
| `disabled` | `boolean` | No | `false` | |
| `min` | `number` | No | — | |
| `max` | `number` | No | — | |
| `step` | `number` | No | `1` | |
| `value` | `number \| ''` | No | — | |
| `defaultValue` | `number \| ''` | No | — | |
| `onChange` | `(value: number \| '', event) => void` | No | — | |

---

### SearchField

**Import**: `import { SearchField } from '@common-origin/design-system'`
**A2UI Catalog Name**: `SearchField`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `value` | `string` | **Yes** | — | |
| `onChange` | `(value: string) => void` | **Yes** | — | |
| `suggestions` | `Suggestion[]` | No | — | See below |
| `showRecentSearches` | `boolean` | No | `true` | |
| `recentSearches` | `string[]` | No | — | |
| `onSuggestionSelect` | `(suggestion) => void` | No | — | |
| `onClearRecentSearches` | `() => void` | No | — | |
| `debounceMs` | `number` | No | `300` | |
| `placeholder` | `string` | No | `'Search...'` | |
| `disabled` | `boolean` | No | `false` | |
| `loading` | `boolean` | No | `false` | |

**Suggestion**:
```typescript
interface Suggestion {
    id: string;    // Required
    label: string; // Required
    description?: string;
    category?: string;
}
```

---

### Sheet

**Import**: `import { Sheet } from '@common-origin/design-system'`
**A2UI Catalog Name**: `Modal` (slide-in panel, not centered dialog)

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `isOpen` | `boolean` | **Yes** | — | |
| `onClose` | `() => void` | **Yes** | — | |
| `position` | `'top' \| 'right' \| 'bottom' \| 'left'` | No | `'right'` | |
| `variant` | `'sheet' \| 'drawer'` | No | `'sheet'` | |
| `width` | `string` | No | `'400px'` | |
| `height` | `string` | No | `'400px'` | |
| `children` | `ReactNode` | No | — | |
| `closeOnOverlayClick` | `boolean` | No | `true` | |
| `closeOnEscape` | `boolean` | No | `true` | |
| `title` | `string` | No | — | |

> **DS Feedback**: No centered `Modal` / `Dialog` component exists in the DS. `Sheet` is a slide-in panel used as a substitute. See `docs/design-system-feedback.md`.

---

### TabBar

**Import**: `import { TabBar } from '@common-origin/design-system'`
**A2UI Catalog Name**: `TabBar`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `tabs` | `Tab[]` | **Yes** | — | See below |
| `activeTab` | `string` | **Yes** | — | Tab ID |
| `onTabChange` | `(tabId: string) => void` | **Yes** | — | |
| `variant` | `'default' \| 'pills' \| 'underline'` | No | `'default'` | |

**Tab**:
```typescript
interface Tab {
    id: string;       // Required
    label: string;    // Required
    badge?: number;
    disabled?: boolean;
}
```

---

### TextField

**Import**: `import { TextField } from '@common-origin/design-system'`
**A2UI Catalog Name**: `TextField`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `label` | `string` | No | — | |
| `helperText` | `string` | No | — | |
| `error` | `string` | No | — | |
| `required` | `boolean` | No | `false` | |
| `disabled` | `boolean` | No | `false` | |
| `type` | `'text' \| 'email' \| 'tel' \| 'url' \| 'search'` | No | `'text'` | |

---

### TransactionListItem

**Import**: `import { TransactionListItem } from '@common-origin/design-system'`
**A2UI Catalog Name**: `TransactionListItem`

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `merchant` | `string` | **Yes** | — | |
| `amount` | `number` | **Yes** | — | Negative for debits |
| `date` | `Date \| string` | **Yes** | — | |
| `status` | `'completed' \| 'pending' \| 'failed'` | No | — | |
| `category` | `TransactionCategory` | No | — | See below |
| `merchantLogo` | `string` | No | — | |
| `description` | `string` | No | — | |
| `hasReceipt` | `boolean` | No | — | |
| `hasNote` | `boolean` | No | — | |
| `currency` | `string` | No | `'AUD'` | |
| `onClick` | `() => void` | No | — | |

**TransactionCategory**: `'shopping' | 'dining' | 'transport' | 'entertainment' | 'bills' | 'other'`

---

### Slider

**Import**: `import { Slider } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `min` | `number` | No | `0` | |
| `max` | `number` | No | `100` | |
| `step` | `number` | No | `1` | |
| `value` | `number` | No | — | |
| `defaultValue` | `number` | No | — | |
| `rangeValue` | `[number, number]` | No | — | |
| `defaultRangeValue` | `[number, number]` | No | — | |
| `onChange` | `(value: number) => void` | No | — | |
| `onRangeChange` | `(values: [number, number]) => void` | No | — | |
| `disabled` | `boolean` | No | `false` | |
| `label` | `string` | No | — | |
| `showValueLabel` | `boolean` | No | `true` | |
| `formatValue` | `(value: number) => string` | No | — | |

---

### PasswordField

**Import**: `import { PasswordField } from '@common-origin/design-system'`
**Not in A2UI catalog** — available in DS but not exposed to agents.

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `label` | `string` | No | — | |
| `helperText` | `string` | No | — | |
| `error` | `string` | No | — | |
| `required` | `boolean` | No | `false` | |
| `disabled` | `boolean` | No | `false` | |
| `showToggle` | `boolean` | No | `true` | Password visibility toggle |

---

## Components in A2UI Catalog vs DS

| In A2UI Catalog | DS Component | Notes |
|-----------------|-------------|-------|
| ✅ Button | Button | |
| ✅ Text | Typography | Name differs |
| ✅ Stack | Stack | |
| ✅ MoneyDisplay | MoneyDisplay | |
| ✅ Chip | Chip | |
| ✅ FilterChip | FilterChip | |
| ✅ BooleanChip | BooleanChip | |
| ✅ CategoryBadge | CategoryBadge | |
| ✅ StatusBadge | StatusBadge | |
| ✅ Divider | Divider | |
| ✅ Progress | ProgressBar | Name differs, wrapped with label |
| ✅ Card | CardLarge | Name differs, picture required |
| ✅ List | List | |
| ✅ ListItem | ListItem | |
| ✅ DateGroup | DateGroup | |
| ✅ AccountCard | AccountCard | |
| ✅ ActionSheet | ActionSheet | |
| ✅ Alert | Alert | |
| ✅ Checkbox | Checkbox | |
| ✅ Select | Dropdown | Name differs |
| ✅ NumberField | NumberInput | Name differs |
| ✅ SearchField | SearchField | |
| ✅ Modal | Sheet | Name differs, no centered modal |
| ✅ TabBar | TabBar | |
| ✅ TextField | TextField | |
| ✅ TransactionListItem | TransactionListItem | |
| ✅ EmptyState | EmptyState | |
| ✅ Skeleton | *Custom (not DS)* | Hand-rolled |
| ❌ Not in catalog | Badge | Available in DS |
| ❌ Not in catalog | Box | Available in DS |
| ❌ Not in catalog | Avatar | Available in DS |
| ❌ Not in catalog | Icon | Available in DS |
| ❌ Not in catalog | IconButton | Available in DS |
| ❌ Not in catalog | Picture | Available in DS |
| ❌ Not in catalog | DateFormatter | Available in DS |
| ❌ Not in catalog | Container | Available in DS |
| ❌ Not in catalog | Tag | Available in DS |
| ❌ Not in catalog | CardSmall | Available in DS |
| ❌ Not in catalog | ChipGroup | Available in DS |
| ❌ Not in catalog | Slider | Available in DS |
| ❌ Not in catalog | PasswordField | Available in DS |
