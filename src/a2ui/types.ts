/**
 * A2UI Message Types
 * Based on the A2UI specification for declarative UI generation
 */

export type A2UIMessage =
  | SurfaceUpdateMessage
  | DataModelUpdateMessage
  | BeginRenderingMessage
  | DeleteSurfaceMessage;

export interface SurfaceUpdateMessage {
  surfaceUpdate: {
    surfaceId: string;
    components: ComponentNode[];
  };
}

export interface DataModelUpdateMessage {
  dataModelUpdate: {
    surfaceId: string;
    contents: DataModelEntry[];
  };
}

export interface BeginRenderingMessage {
  beginRendering: {
    surfaceId: string;
    root: string;
    catalogId: string;
  };
}

export interface DeleteSurfaceMessage {
  deleteSurface: {
    surfaceId: string;
  };
}

export interface ComponentNode {
  id: string;
  component: CatalogComponent;
  children?: string[]; // IDs of child components
}

export interface DataModelEntry {
  key: string;
  valueString?: string;
  valueInt?: number;
  valueBool?: boolean;
  valueMap?: Array<{ key: string; valueString?: string; valueInt?: number; valueBool?: boolean }>;
}

/**
 * Catalog Component Types
 * These are the allowed components that can be referenced in A2UI messages
 */
export type CatalogComponent =
  | { Text: TextComponent }
  | { Button: ButtonComponent }
  | { TextField: TextFieldComponent }
  | { Chip: ChipComponent }
  | { FilterChip: FilterChipComponent }
  | { BooleanChip: BooleanChipComponent }
  | { Card: CardComponent }
  | { List: ListComponent }
  | { ListItem: ListItemComponent }
  | { Stack: StackComponent }
  | { Alert: AlertComponent }
  | { Divider: DividerComponent }
  | { Skeleton: SkeletonComponent }
  | { Select: SelectComponent }
  | { NumberField: NumberFieldComponent }
  | { Checkbox: CheckboxComponent }
  | { Modal: ModalComponent }
  | { Progress: ProgressComponent }
  // Banking Components - Phase 1 (Critical)
  | { MoneyDisplay: MoneyDisplayComponent }
  | { TransactionListItem: TransactionListItemComponent }
  | { AccountCard: AccountCardComponent }
  | { DateGroup: DateGroupComponent }
  | { EmptyState: EmptyStateComponent }
  // Banking Components - Phase 2 (High Priority)
  | { SearchField: SearchFieldComponent }
  | { CategoryBadge: CategoryBadgeComponent }
  | { StatusBadge: StatusBadgeComponent }
  | { TabBar: TabBarComponent }
  | { ActionSheet: ActionSheetComponent };

export interface TextComponent {
  text: DataBinding | { literalString: string };
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
}

export interface ButtonComponent {
  label: DataBinding | { literalString: string };
  variant?: 'primary' | 'secondary' | 'naked';
  size?: 'small' | 'medium' | 'large';
  action?: ActionBinding;
  disabled?: boolean;
}

export interface TextFieldComponent {
  label: DataBinding | { literalString: string };
  value?: DataBinding;
  helperText?: DataBinding | { literalString: string };
  error?: DataBinding | { literalString: string };
  type?: 'text' | 'email' | 'tel' | 'url' | 'search';
  required?: boolean;
  disabled?: boolean;
  onChange?: ActionBinding;
}

export interface ChipComponent {
  content: DataBinding | { literalString: string };
  variant?: 'default' | 'emphasis' | 'subtle' | 'interactive';
  size?: 'small' | 'medium';
  onClick?: ActionBinding;
}

export interface FilterChipComponent {
  content: DataBinding | { literalString: string };
  selected?: boolean;
  onDismiss?: ActionBinding;
}

export interface BooleanChipComponent {
  content: DataBinding | { literalString: string };
  selected?: boolean;
  onClick?: ActionBinding;
}

export interface CardComponent {
  title: DataBinding | { literalString: string };
  excerpt?: DataBinding | { literalString: string };
  subtitle?: DataBinding | { literalString: string };
  labels?: Array<string>;
  onClick?: ActionBinding;
}

export interface ListComponent {
  dividers?: boolean;
  spacing?: 'compact' | 'comfortable';
}

export interface ListItemComponent {
  primary: DataBinding | { literalString: string };
  secondary?: DataBinding | { literalString: string };
  badge?: string; // ID of a badge component
  interactive?: boolean;
  onClick?: ActionBinding;
}

export interface StackComponent {
  direction: 'row' | 'column';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export interface AlertComponent {
  content: DataBinding | { literalString: string };
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: DataBinding | { literalString: string };
}

export interface DividerComponent {
  orientation?: 'horizontal' | 'vertical';
}

export interface SkeletonComponent {
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'list';
  width?: string;
  height?: string;
  count?: number;
}

export interface SelectComponent {
  label: DataBinding | { literalString: string };
  value?: DataBinding;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: ActionBinding;
}

export interface NumberFieldComponent {
  label: DataBinding | { literalString: string };
  value?: DataBinding;
  helperText?: DataBinding | { literalString: string };
  error?: DataBinding | { literalString: string };
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  onChange?: ActionBinding;
}

export interface CheckboxComponent {
  label: DataBinding | { literalString: string };
  checked?: boolean;
  disabled?: boolean;
  onChange?: ActionBinding;
}

export interface ModalComponent {
  title: DataBinding | { literalString: string };
  open: boolean;
  onClose?: ActionBinding;
}

export interface ProgressComponent {
  value: number; // 0-100
  variant?: 'linear' | 'circular';
  size?: 'small' | 'medium' | 'large';
  label?: DataBinding | { literalString: string };
}

/**
 * Banking Component Interfaces - Phase 1 (Critical)
 */

export interface MoneyDisplayComponent {
  amount: number | DataBinding;
  currency?: string;
  variant?: 'default' | 'positive' | 'negative' | 'neutral';
  showSign?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'regular' | 'medium' | 'bold';
  locale?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TransactionListItemComponent {
  merchant: DataBinding | { literalString: string };
  amount: number | DataBinding;
  date: DataBinding | { literalString: string };
  status?: 'completed' | 'pending' | 'failed';
  category?: 'shopping' | 'dining' | 'transport' | 'entertainment' | 'bills' | 'other';
  merchantLogo?: string;
  description?: DataBinding | { literalString: string };
  hasReceipt?: boolean;
  hasNote?: boolean;
  currency?: string;
  onClick?: ActionBinding;
}

export interface AccountCardComponent {
  accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  accountName: DataBinding | { literalString: string };
  balance: number | DataBinding;
  accountNumber?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: DataBinding | { literalString: string };
  action?: {
    label: string;
    onClick: ActionBinding;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'naked';
  };
  secondaryAction?: {
    label: string;
    onClick: ActionBinding;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'naked';
  };
  currency?: string;
  onClick?: ActionBinding;
}

export interface DateGroupComponent {
  date: DataBinding | { literalString: string };
  format?: 'full' | 'long' | 'medium' | 'short' | 'relative';
  showTotal?: boolean;
  totalAmount?: number | DataBinding;
  showCount?: boolean;
  count?: number | DataBinding;
  sticky?: boolean;
  currency?: string;
}

export interface EmptyStateComponent {
  illustration?: 'search' | 'transactions' | 'notifications' | 'empty' | 'error';
  title: DataBinding | { literalString: string };
  description: DataBinding | { literalString: string };
  action?: {
    label: string;
    onClick: ActionBinding;
    variant?: 'primary' | 'secondary';
    icon?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: ActionBinding;
    variant?: 'primary' | 'secondary';
    icon?: string;
  };
  variant?: 'default' | 'error' | 'success';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Banking Component Interfaces - Phase 2 (High Priority)
 */

export interface SearchFieldComponent {
  value: DataBinding | { literalString: string };
  onChange: ActionBinding;
  suggestions?: Array<{
    id: string;
    label: string;
    description?: string;
    category?: string;
  }>;
  showRecentSearches?: boolean;
  recentSearches?: string[];
  onSuggestionSelect?: ActionBinding;
  onClearRecentSearches?: ActionBinding;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface CategoryBadgeComponent {
  content: DataBinding | { literalString: string };
  color?: 'blue' | 'purple' | 'pink' | 'yellow' | 'green' | 'red' | 'orange' | 'gray';
  variant?: 'filled' | 'outlined' | 'minimal';
  size?: 'small' | 'medium';
  icon?: string;
  onClick?: ActionBinding;
  disabled?: boolean;
}

export interface StatusBadgeComponent {
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'scheduled';
  label?: DataBinding | { literalString: string };
  size?: 'small' | 'medium';
  showIcon?: boolean;
  liveRegion?: boolean;
}

export interface TabBarComponent {
  tabs: Array<{
    id: string;
    label: string;
    badge?: number;
    disabled?: boolean;
  }>;
  activeTab: string | DataBinding;
  onTabChange: ActionBinding;
  variant?: 'default' | 'pills' | 'underline';
}

export interface ActionSheetComponent {
  isOpen: boolean;
  onClose: ActionBinding;
  title?: DataBinding | { literalString: string };
  description?: DataBinding | { literalString: string };
  actions: Array<{
    id: string;
    label: string;
    icon?: string;
    destructive?: boolean;
    disabled?: boolean;
    onSelect: ActionBinding;
  }>;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export interface DataBinding {
  path: string; // Path in data model, e.g., "/transaction/merchant"
}

export interface ActionBinding {
  eventType: 'click' | 'change' | 'dismiss';
  dataPath?: string; // Optional path to update in data model
  value?: string | number | boolean;
}

/**
 * Surface State
 * Maintains the current state of a rendered surface
 */
export interface SurfaceState {
  surfaceId: string;
  catalogId?: string;
  root?: string;
  components: Map<string, ComponentNode>;
  dataModel: Map<string, any>;
  rendering: boolean;
}
