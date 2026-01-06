/**
 * A2UI Catalog: Component Mapping Layer
 * 
 * This module provides the security boundary between agent-generated UI descriptions
 * and actual rendered components. Only components defined in this catalog can be
 * rendered, preventing arbitrary code execution and UI injection attacks.
 * 
 * Architecture:
 * - Agent sends declarative JSON (A2UI messages)
 * - Messages reference components by name (e.g., "Button", "TextField")
 * - This catalog maps those names to trusted Common Origin components
 * - All props are validated against component schemas
 */

import React from 'react';
import {
  Button,
  TextField,
  Chip,
  FilterChip,
  BooleanChip,
  CardLarge,
  List,
  ListItem,
  Stack,
  Alert,
  Divider,
  Typography,
  Dropdown,
  NumberInput,
  Checkbox,
  Sheet,
  ProgressBar,
  // Banking Components - Phase 1 (Critical)
  MoneyDisplay,
  TransactionListItem,
  AccountCard,
  DateGroup,
  EmptyState,
  // Banking Components - Phase 2 (High Priority)
  SearchField,
  CategoryBadge,
  StatusBadge,
  TabBar,
  ActionSheet,
} from '@common-origin/design-system';
import { renderSkeleton } from './skeleton';
import type {
  ComponentNode,
  CatalogComponent,
  DataBinding,
  SurfaceState,
} from './types';

/**
 * Catalog ID for this implementation
 */
export const CATALOG_ID = 'common-origin.design-system:v2.0';

/**
 * Resolve a data binding to an actual value from the data model
 */
function resolveDataBinding(
  binding: DataBinding | { literalString: string },
  dataModel: Map<string, any>
): string {
  if ('literalString' in binding) {
    return binding.literalString;
  }
  
  if ('path' in binding) {
    const path = binding.path.split('/').filter(Boolean);
    let value: any = Object.fromEntries(dataModel);
    
    for (const segment of path) {
      value = value?.[segment];
    }
    
    return value?.toString() || '';
  }
  
  return '';
}

/**
 * Render a catalog component node to a React element
 * 
 * This is the core security boundary: only components defined here can be rendered.
 * Agent messages can only reference these components with their defined props.
 */
export function renderNode(
  node: ComponentNode,
  surface: SurfaceState,
  onAction?: (action: any) => void
): React.ReactElement | null {
  const { component, children = [] } = node;
  
  // Resolve child components
  const childElements = children
    .map((childId) => {
      const childNode = surface.components.get(childId);
      return childNode ? renderNode(childNode, surface, onAction) : null;
    })
    .filter(Boolean);

  // Map catalog component types to Common Origin components
  if ('Text' in component) {
    const { text, variant = 'body' } = component.Text;
    const content = resolveDataBinding(text, surface.dataModel);
    
    return React.createElement(
      Typography,
      { key: node.id, variant, children: content }
    );
  }

  if ('Button' in component) {
    const { label, variant = 'primary', size = 'medium', action, disabled = false } = component.Button;
    const content = resolveDataBinding(label, surface.dataModel);
    
    return React.createElement(
      Button,
      {
        key: node.id,
        variant,
        size,
        disabled,
        onClick: action ? () => onAction?.(action) : undefined,
        children: content,
      }
    );
  }

  if ('TextField' in component) {
    const { label, value, helperText, error, type = 'text', required = false, disabled = false, onChange } = component.TextField;
    const labelText = resolveDataBinding(label, surface.dataModel);
    const helperTextValue = helperText ? resolveDataBinding(helperText, surface.dataModel) : undefined;
    const errorText = error ? resolveDataBinding(error, surface.dataModel) : undefined;
    const valueText = value ? resolveDataBinding(value, surface.dataModel) : undefined;
    
    // If no onChange is provided, use defaultValue (uncontrolled)
    const fieldProps: any = {
      key: node.id,
      label: labelText,
      type,
      helperText: helperTextValue || '',
      error: errorText || '',
      required,
      disabled,
    };
    
    if (onChange) {
      fieldProps.value = valueText || '';
      fieldProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Build action with updated value and data path for data model update
        const action = {
          ...onChange,
          value: e.target.value,
          updateDataModel: onChange.dataPath ? { [onChange.dataPath]: e.target.value } : undefined,
        };
        onAction?.(action);
      };
    } else if (valueText !== undefined) {
      fieldProps.defaultValue = valueText;
    }
    
    return React.createElement(TextField, fieldProps);
  }

  if ('Chip' in component) {
    const { content, variant = 'default', size = 'medium', onClick } = component.Chip;
    const text = resolveDataBinding(content, surface.dataModel);
    
    return React.createElement(
      Chip,
      {
        key: node.id,
        variant,
        size,
        onClick: onClick ? () => onAction?.(onClick) : undefined,
      },
      text
    );
  }

  if ('FilterChip' in component) {
    const { content, selected = false, onDismiss } = component.FilterChip;
    const text = resolveDataBinding(content, surface.dataModel);
    
    return React.createElement(
      FilterChip,
      {
        key: node.id,
        selected,
        onDismiss: onDismiss ? () => onAction?.(onDismiss) : () => {},
      },
      text
    );
  }

  if ('BooleanChip' in component) {
    const { content, selected = false, onClick } = component.BooleanChip;
    const text = resolveDataBinding(content, surface.dataModel);
    
    return React.createElement(
      BooleanChip,
      {
        key: node.id,
        selected,
        onClick: onClick ? () => {
          // Toggle the selected state in data model if dataPath is provided
          const action = {
            ...onClick,
            value: !selected,
            updateDataModel: onClick.dataPath ? { [onClick.dataPath]: !selected } : undefined,
          };
          onAction?.(action);
        } : () => {},
      },
      text
    );
  }

  if ('Card' in component) {
    const { title, excerpt, subtitle, labels, onClick } = component.Card;
    const titleText = resolveDataBinding(title, surface.dataModel);
    const excerptText = excerpt ? resolveDataBinding(excerpt, surface.dataModel) : '';
    const subtitleText = subtitle ? resolveDataBinding(subtitle, surface.dataModel) : '';
    
    return React.createElement(
      CardLarge,
      {
        key: node.id,
        title: titleText,
        excerpt: excerptText,
        subtitle: subtitleText,
        labels,
        picture: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e9ecef" width="100" height="100"/%3E%3C/svg%3E', // Placeholder SVG
      }
    );
  }

  if ('List' in component) {
    const { dividers = true, spacing = 'comfortable' } = component.List;
    
    return React.createElement(
      List,
      {
        key: node.id,
        dividers,
        spacing,
        children: childElements,
      }
    );
  }

  if ('ListItem' in component) {
    const { primary, secondary, badge, interactive = false, onClick } = component.ListItem;
    const primaryText = resolveDataBinding(primary, surface.dataModel);
    const secondaryText = secondary ? resolveDataBinding(secondary, surface.dataModel) : undefined;
    
    // If badge is specified, it's a component ID - render it
    let badgeElement;
    if (badge) {
      const badgeNode = surface.components.get(badge);
      badgeElement = badgeNode ? renderNode(badgeNode, surface, onAction) : undefined;
    }
    
    return React.createElement(
      ListItem,
      {
        key: node.id,
        primary: primaryText,
        secondary: secondaryText || '',
        badge: badgeElement,
        interactive,
        onClick: onClick ? () => onAction?.(onClick) : undefined,
      },
      ...childElements
    );
  }

  if ('Stack' in component) {
    const { direction, gap = 'md' } = component.Stack;
    // Note: Common Origin Stack doesn't have align prop in current version
    
    return React.createElement(
      Stack,
      {
        key: node.id,
        direction,
        gap,
        children: childElements,
      }
    );
  }

  if ('Alert' in component) {
    const { content, variant = 'info', title } = component.Alert;
    const contentText = resolveDataBinding(content, surface.dataModel);
    const titleText = title ? resolveDataBinding(title, surface.dataModel) : undefined;
    
    return React.createElement(
      Alert,
      {
        key: node.id,
        variant,
        title: titleText || '',
        children: contentText,
      }
    );
  }

  if ('Divider' in component) {
    const { orientation = 'horizontal' } = component.Divider;
    
    return React.createElement(Divider, {
      key: node.id,
      orientation,
    });
  }

  if ('Skeleton' in component) {
    const { variant = 'rect', width = '100%', height = '20px', count = 1 } = component.Skeleton;
    
    return renderSkeleton(variant, width, height, count, node.id);
  }

  if ('Select' in component) {
    const { label, value, options, placeholder, required = false, disabled = false, onChange } = component.Select;
    const labelText = resolveDataBinding(label, surface.dataModel);
    const valueText = value ? resolveDataBinding(value, surface.dataModel) : undefined;
    
    // Map options to include required 'id' field
    const mappedOptions = options.map(opt => ({
      id: opt.value,
      value: opt.value,
      label: opt.label,
    }));
    
    return React.createElement(Dropdown, {
      key: node.id,
      label: labelText,
      value: valueText || '',
      options: mappedOptions,
      placeholder: placeholder || 'Select...',
      disabled,
      onChange: onChange ? (selectedValue: string) => {
        const action = {
          ...onChange,
          value: selectedValue,
          updateDataModel: onChange.dataPath ? { [onChange.dataPath]: selectedValue } : undefined,
        };
        onAction?.(action);
      } : () => {},
    });
  }

  if ('NumberField' in component) {
    const { label, value, helperText, error, min, max, step, required = false, disabled = false, onChange } = component.NumberField;
    const labelText = resolveDataBinding(label, surface.dataModel);
    const helperTextValue = helperText ? resolveDataBinding(helperText, surface.dataModel) : undefined;
    const errorText = error ? resolveDataBinding(error, surface.dataModel) : undefined;
    const valueText = value ? resolveDataBinding(value, surface.dataModel) : undefined;
    
    const fieldProps: Record<string, any> = {
      key: node.id,
      label: labelText,
      helperText: helperTextValue || '',
      error: errorText || '',
      min,
      max,
      step,
      required,
      disabled,
    };
    
    if (onChange) {
      fieldProps.value = valueText !== undefined ? Number(valueText) : undefined;
      fieldProps.onChange = (newValue: number) => {
        const action = {
          ...onChange,
          value: newValue,
          updateDataModel: onChange.dataPath ? { [onChange.dataPath]: newValue } : undefined,
        };
        onAction?.(action);
      };
    } else if (valueText !== undefined) {
      fieldProps.defaultValue = Number(valueText);
    }
    
    return React.createElement(NumberInput, fieldProps);
  }

  if ('Checkbox' in component) {
    const { label, checked = false, disabled = false, onChange } = component.Checkbox;
    const labelText = resolveDataBinding(label, surface.dataModel);
    
    return React.createElement(Checkbox, {
      key: node.id,
      label: labelText,
      checked,
      disabled,
      onChange: onChange ? (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        const action = {
          ...onChange,
          value: isChecked,
          updateDataModel: onChange.dataPath ? { [onChange.dataPath]: isChecked } : undefined,
        };
        onAction?.(action);
      } : undefined,
    });
  }

  if ('Modal' in component) {
    const { title, open, onClose } = component.Modal;
    const titleText = resolveDataBinding(title, surface.dataModel);
    
    return React.createElement(
      Sheet,
      {
        key: node.id,
        title: titleText,
        isOpen: open,
        onClose: onClose ? () => onAction?.(onClose) : () => {},
        children: childElements,
      }
    );
  }

  if ('Progress' in component) {
    const { value, variant = 'linear', size = 'medium', label } = component.Progress;
    const labelText = label ? resolveDataBinding(label, surface.dataModel) : undefined;
    
    if (variant === 'linear') {
      return React.createElement(
        'div',
        { key: node.id, style: { width: '100%' } },
        labelText && React.createElement(Typography, { variant: 'caption', children: labelText }),
        React.createElement(ProgressBar, {
          value,
        })
      );
    }
    // For circular variant, use ProgressBar with appropriate styling
    return React.createElement(ProgressBar, {
      key: node.id,
      value,
    });
  }

  // Banking Components - Phase 1 (Critical)
  
  if ('MoneyDisplay' in component) {
    const { 
      amount, 
      currency = 'USD', 
      variant = 'default', 
      showSign = false, 
      size = 'medium', 
      weight = 'regular', 
      locale = 'en-US',
      align = 'left'
    } = component.MoneyDisplay;
    
    const amountValue = typeof amount === 'number' ? amount : parseFloat(resolveDataBinding(amount, surface.dataModel));
    
    return React.createElement(MoneyDisplay, {
      key: node.id,
      amount: amountValue,
      currency,
      variant,
      showSign,
      size,
      weight,
      locale,
      align,
    });
  }

  if ('TransactionListItem' in component) {
    const { 
      merchant, 
      amount, 
      date, 
      status, 
      category, 
      merchantLogo, 
      description, 
      hasReceipt, 
      hasNote, 
      currency = 'USD', 
      onClick 
    } = component.TransactionListItem;
    
    const merchantText = resolveDataBinding(merchant, surface.dataModel);
    const amountValue = typeof amount === 'number' ? amount : parseFloat(resolveDataBinding(amount, surface.dataModel));
    const dateValue = resolveDataBinding(date, surface.dataModel);
    const descriptionText = description ? resolveDataBinding(description, surface.dataModel) : undefined;
    
    return React.createElement(TransactionListItem, {
      key: node.id,
      merchant: merchantText,
      amount: amountValue,
      date: dateValue,
      status,
      category,
      merchantLogo,
      description: descriptionText,
      hasReceipt,
      hasNote,
      currency,
      onClick: onClick ? () => onAction?.(onClick) : undefined,
    });
  }

  if ('AccountCard' in component) {
    const { 
      accountType, 
      accountName, 
      balance, 
      accountNumber, 
      trend, 
      trendValue, 
      action, 
      secondaryAction, 
      currency = 'USD', 
      onClick 
    } = component.AccountCard;
    
    const accountNameText = resolveDataBinding(accountName, surface.dataModel);
    const balanceValue = typeof balance === 'number' ? balance : parseFloat(resolveDataBinding(balance, surface.dataModel));
    const trendValueText = trendValue ? resolveDataBinding(trendValue, surface.dataModel) : undefined;
    
    return React.createElement(AccountCard, {
      key: node.id,
      accountType,
      accountName: accountNameText,
      balance: balanceValue,
      accountNumber,
      trend,
      trendValue: trendValueText,
      action: action ? {
        label: action.label,
        onClick: () => onAction?.(action.onClick),
        icon: action.icon as any,
        variant: action.variant,
      } : undefined,
      secondaryAction: secondaryAction ? {
        label: secondaryAction.label,
        onClick: () => onAction?.(secondaryAction.onClick),
        icon: secondaryAction.icon as any,
        variant: secondaryAction.variant,
      } : undefined,
      currency,
      onClick: onClick ? () => onAction?.(onClick) : undefined,
    });
  }

  if ('DateGroup' in component) {
    const { 
      date, 
      format = 'medium', 
      showTotal = false, 
      totalAmount, 
      showCount = false, 
      count, 
      sticky = false, 
      currency = 'USD' 
    } = component.DateGroup;
    
    const dateValue = resolveDataBinding(date, surface.dataModel);
    const totalAmountValue = totalAmount !== undefined 
      ? (typeof totalAmount === 'number' ? totalAmount : parseFloat(resolveDataBinding(totalAmount, surface.dataModel)))
      : undefined;
    const countValue = count !== undefined 
      ? (typeof count === 'number' ? count : parseInt(resolveDataBinding(count, surface.dataModel)))
      : undefined;
    
    return React.createElement(
      DateGroup,
      {
        key: node.id,
        date: dateValue,
        format: format as any,
        showTotal,
        totalAmount: totalAmountValue,
        showCount,
        count: countValue,
        sticky,
        currency,
        children: childElements,
      }
    );
  }

  if ('EmptyState' in component) {
    const { 
      illustration, 
      title, 
      description, 
      action, 
      secondaryAction, 
      variant = 'default', 
      size = 'medium' 
    } = component.EmptyState;
    
    const titleText = resolveDataBinding(title, surface.dataModel);
    const descriptionText = resolveDataBinding(description, surface.dataModel);
    
    return React.createElement(EmptyState, {
      key: node.id,
      illustration,
      title: titleText,
      description: descriptionText,
      action: action ? {
        label: action.label,
        onClick: () => onAction?.(action.onClick),
        variant: action.variant,
        icon: action.icon as any,
      } : undefined,
      secondaryAction: secondaryAction ? {
        label: secondaryAction.label,
        onClick: () => onAction?.(secondaryAction.onClick),
        variant: secondaryAction.variant,
        icon: secondaryAction.icon as any,
      } : undefined,
      variant,
      size,
    });
  }

  // Banking Components - Phase 2 (High Priority)
  
  if ('SearchField' in component) {
    const { 
      value, 
      onChange, 
      suggestions, 
      showRecentSearches, 
      recentSearches, 
      onSuggestionSelect, 
      onClearRecentSearches, 
      debounceMs = 300, 
      placeholder = 'Search...', 
      disabled = false, 
      loading = false 
    } = component.SearchField;
    
    const valueText = resolveDataBinding(value, surface.dataModel);
    
    return React.createElement(SearchField, {
      key: node.id,
      value: valueText,
      onChange: (newValue: string) => {
        const action = {
          ...onChange,
          value: newValue,
          updateDataModel: onChange.dataPath ? { [onChange.dataPath]: newValue } : undefined,
        };
        onAction?.(action);
      },
      suggestions,
      showRecentSearches,
      recentSearches,
      onSuggestionSelect: onSuggestionSelect ? (suggestion: any) => {
        const action = {
          ...onSuggestionSelect,
          value: typeof suggestion === 'string' ? suggestion : suggestion.id,
        };
        onAction?.(action);
      } : undefined,
      onClearRecentSearches: onClearRecentSearches ? () => onAction?.(onClearRecentSearches) : undefined,
      debounceMs,
      placeholder,
      disabled,
      loading,
    });
  }

  if ('CategoryBadge' in component) {
    const { 
      content, 
      color = 'blue', 
      variant = 'filled', 
      size = 'medium', 
      icon, 
      onClick, 
      disabled = false 
    } = component.CategoryBadge;
    
    const contentText = resolveDataBinding(content, surface.dataModel);
    
    return React.createElement(
      CategoryBadge,
      {
        key: node.id,
        color,
        variant,
        size,
        icon: icon as any,
        onClick: onClick ? () => onAction?.(onClick) : undefined,
        disabled,
        children: contentText,
      }
    );
  }

  if ('StatusBadge' in component) {
    const { 
      status, 
      label, 
      size = 'medium', 
      showIcon = true, 
      liveRegion = true 
    } = component.StatusBadge;
    
    const labelText = label ? resolveDataBinding(label, surface.dataModel) : undefined;
    
    return React.createElement(StatusBadge, {
      key: node.id,
      status,
      label: labelText,
      size,
      showIcon,
      liveRegion,
    });
  }

  if ('TabBar' in component) {
    const { 
      tabs, 
      activeTab, 
      onTabChange, 
      variant = 'default' 
    } = component.TabBar;
    
    const activeTabValue = typeof activeTab === 'string' ? activeTab : resolveDataBinding(activeTab, surface.dataModel);
    
    return React.createElement(TabBar, {
      key: node.id,
      tabs,
      activeTab: activeTabValue,
      onTabChange: (tabId: string) => {
        const action = {
          ...onTabChange,
          value: tabId,
          updateDataModel: onTabChange.dataPath ? { [onTabChange.dataPath]: tabId } : undefined,
        };
        onAction?.(action);
      },
      variant,
    });
  }

  if ('ActionSheet' in component) {
    const { 
      isOpen, 
      onClose, 
      title, 
      description, 
      actions, 
      closeOnOverlayClick = true, 
      closeOnEscape = true, 
      showCloseButton = true 
    } = component.ActionSheet;
    
    const titleText = title ? resolveDataBinding(title, surface.dataModel) : undefined;
    const descriptionText = description ? resolveDataBinding(description, surface.dataModel) : undefined;
    
    return React.createElement(ActionSheet, {
      key: node.id,
      isOpen,
      onClose: () => onAction?.(onClose),
      title: titleText,
      description: descriptionText,
      actions: actions.map(action => ({
        id: action.id,
        label: action.label,
        icon: action.icon as any,
        destructive: action.destructive,
        disabled: action.disabled,
        onSelect: () => onAction?.(action.onSelect),
      })),
      closeOnOverlayClick,
      closeOnEscape,
      showCloseButton,
    });
  }

  return null;
}

/**
 * Validate that a component reference is in the catalog
 */
export function isValidComponent(component: CatalogComponent): boolean {
  const validTypes = [
    'Text',
    'Button',
    'TextField',
    'Chip',
    'FilterChip',
    'BooleanChip',
    'Card',
    'List',
    'ListItem',
    'Stack',
    'Alert',
    'Divider',
    'Skeleton',
    'Select',
    'NumberField',
    'Checkbox',
    'Modal',
    'Progress',
    // Banking Components - Phase 1 (Critical)
    'MoneyDisplay',
    'TransactionListItem',
    'AccountCard',
    'DateGroup',
    'EmptyState',
    // Banking Components - Phase 2 (High Priority)
    'SearchField',
    'CategoryBadge',
    'StatusBadge',
    'TabBar',
    'ActionSheet',
  ];
  
  return validTypes.some((type) => type in component);
}

/**
 * Get catalog metadata
 */
export function getCatalogMetadata() {
  return {
    catalogId: CATALOG_ID,
    version: '2.3',
    components: [
      { name: 'Text', description: 'Render text with typography variants' },
      { name: 'Button', description: 'Interactive button with variants' },
      { name: 'TextField', description: 'Text input field with validation' },
      { name: 'Chip', description: 'Display chip component' },
      { name: 'FilterChip', description: 'Dismissible filter chip' },
      { name: 'BooleanChip', description: 'Toggle chip for filters' },
      { name: 'Card', description: 'Content card with title and excerpt' },
      { name: 'List', description: 'Container for list items' },
      { name: 'ListItem', description: 'Individual list item with primary/secondary text' },
      { name: 'Stack', description: 'Layout container with flex direction' },
      { name: 'Alert', description: 'Alert message with variants' },
      { name: 'Divider', description: 'Visual separator' },
      { name: 'Skeleton', description: 'Loading placeholder with multiple variants' },
      { name: 'Select', description: 'Dropdown selection with options' },
      { name: 'NumberField', description: 'Numeric input with min/max validation' },
      { name: 'Checkbox', description: 'Toggle checkbox for boolean inputs' },
      { name: 'Modal', description: 'Modal dialog for confirmations' },
      { name: 'Progress', description: 'Progress indicator with percentage' },
      // Banking Components - Phase 1 (Critical)
      { name: 'MoneyDisplay', description: 'Display formatted monetary amounts with currency, color variants (positive/negative), and localization' },
      { name: 'TransactionListItem', description: 'Rich transaction display with merchant info, amount, date, status badge, category, and optional receipt/note indicators' },
      { name: 'AccountCard', description: 'Account summary card showing account type, name, balance, trend indicator, and action buttons' },
      { name: 'DateGroup', description: 'Date-grouped list container with formatted date header, optional total amount and item count' },
      { name: 'EmptyState', description: 'Engaging empty state with illustration, title, description, and call-to-action buttons' },
      // Banking Components - Phase 2 (High Priority)
      { name: 'SearchField', description: 'Advanced search input with autocomplete suggestions, recent searches, and debouncing' },
      { name: 'CategoryBadge', description: 'Category indicator badge with 8 color options, icons, and multiple visual variants' },
      { name: 'StatusBadge', description: 'Transaction status badge with 6 status types (pending, completed, failed, etc.) and semantic colors' },
      { name: 'TabBar', description: 'Accessible tab navigation with 3 visual variants (default, pills, underline) and badge counts' },
      { name: 'ActionSheet', description: 'Mobile-optimized bottom sheet modal for displaying action menus with icons and destructive actions' },
    ],
  };
}
