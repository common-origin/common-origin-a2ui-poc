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
  StringOrPath,
  NumberOrPath,
  DataBinding,
  SurfaceState,
  ActionDefinition,
  ActionContextItem,
  UserActionMessage,
} from './types';

// Re-export CATALOG_ID from constants for backward compatibility
export { CATALOG_ID } from './constants';
import { CATALOG_ID } from './constants';

// ── Security: URL Sanitization ────────────────────────────────────────────
const SAFE_URL_PREFIXES = ['http://', 'https://', 'data:image/'];

/**
 * Sanitize a URL value from agent data.
 * Prevents javascript: URIs, data: URIs (except images), and other injection vectors.
 * Returns empty string for unsafe URLs.
 */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim().toLowerCase();
  if (SAFE_URL_PREFIXES.some(prefix => trimmed.startsWith(prefix))) {
    return url; // Return original (not lowered) if safe
  }
  // Allow relative paths (no protocol)
  if (!trimmed.includes(':')) return url;
  // Block everything else (javascript:, data:text/html, etc.)
  return '';
}


/**
 * Resolve a v0.9 stringOrPath binding to an actual value.
 *
 * v0.9 format:
 *   - Plain string: "Hello" → used as-is
 *   - Path object:  { path: "/key" } → resolved from data model
 *   - Legacy literalString: { literalString: "Hello" } → still accepted for compat
 */
function resolveBinding(
  binding: StringOrPath | NumberOrPath | undefined,
  dataModel: Map<string, unknown>
): string {
  if (binding === undefined || binding === null) return '';

  // Plain string (v0.9 primary format)
  if (typeof binding === 'string') return binding;

  // Plain number
  if (typeof binding === 'number') return String(binding);

  // Path reference
  if (typeof binding === 'object' && 'path' in binding) {
    const path = (binding as DataBinding).path.split('/').filter(Boolean);
    let value: unknown = Object.fromEntries(dataModel);
    for (const segment of path) {
      value = (value as Record<string, unknown>)?.[segment];
    }
    return value?.toString() || '';
  }

  // Legacy { literalString } compat
  if (typeof binding === 'object' && 'literalString' in binding) {
    return (binding as { literalString: string }).literalString;
  }

  return '';
}

/** Resolve a numeric binding. */
function resolveNumber(
  binding: NumberOrPath | undefined,
  dataModel: Map<string, unknown>
): number {
  if (binding === undefined || binding === null) return 0;
  if (typeof binding === 'number') return binding;
  return parseFloat(resolveBinding(binding, dataModel)) || 0;
}

/**
 * Resolve a v0.9 spec ActionDefinition into a UserActionMessage.
 *
 * This is the core of the action-to-agent feedback loop: when a Button
 * has an `action` with `name` + `context`, we resolve all context paths
 * from the local data model and produce a fully-resolved UserActionMessage.
 */
function resolveAction(
  action: ActionDefinition,
  sourceComponentId: string,
  surfaceId: string,
  dataModel: Map<string, unknown>
): UserActionMessage {
  const resolvedContext: Record<string, unknown> = {};

  if (action.context) {
    for (const item of action.context) {
      if (item.value && typeof item.value === 'object' && 'path' in item.value) {
        // Resolve data-model path
        resolvedContext[item.key] = resolveBinding(item.value as DataBinding, dataModel);
      } else {
        // Literal value
        resolvedContext[item.key] = item.value;
      }
    }
  }

  return {
    userAction: {
      name: action.name,
      surfaceId,
      sourceComponentId,
      timestamp: new Date().toISOString(),
      context: resolvedContext,
    },
  };
}

/**
 * Check if a value looks like a v0.9 spec ActionDefinition
 * (has `name` string property, distinguishing it from legacy eventType-based actions)
 */
function isSpecAction(action: unknown): action is ActionDefinition {
  return (
    action !== null &&
    typeof action === 'object' &&
    'name' in action &&
    typeof (action as ActionDefinition).name === 'string'
  );
}

/**
 * Render a catalog component node to a React element
 *
 * v0.9 format: node.component is a string type name, props sit on the node itself.
 * This is the core security boundary: only components defined here can be rendered.
 */
const MAX_TREE_DEPTH = 10;

export function renderNode(
  node: ComponentNode,
  surface: SurfaceState,
  onAction?: (action: any) => void,
  depth: number = 0
): React.ReactElement | null {
  // DoS protection: cap tree depth
  if (depth > MAX_TREE_DEPTH) {
    return React.createElement('span', { key: node.id, style: { display: 'none' } }, `[max depth ${MAX_TREE_DEPTH}]`);
  }

  const { id, component: componentType, children: childIds = [] } = node;
  const dm = surface.dataModel;

  // Resolve child components
  const childElements = (childIds as string[])
    .map((childId) => {
      const childNode = surface.components.get(childId);
      return childNode ? renderNode(childNode, surface, onAction, depth + 1) : null;
    })
    .filter(Boolean);

  switch (componentType) {
    // ── Typography & Content ──────────────────────────────────────────
    case 'Text': {
      const content = resolveBinding(node.text as StringOrPath, dm);
      return React.createElement(Typography, { key: id, variant: node.variant || 'body', children: content });
    }

    case 'Alert': {
      const content = resolveBinding(node.content as StringOrPath, dm);
      const title = node.title ? resolveBinding(node.title as StringOrPath, dm) : '';
      return React.createElement(Alert, { key: id, variant: node.variant || 'info', title, children: content });
    }

    case 'EmptyState': {
      const title = resolveBinding(node.title as StringOrPath, dm);
      const description = resolveBinding(node.description as StringOrPath, dm);
      return React.createElement(EmptyState, {
        key: id,
        illustration: node.illustration,
        title,
        description,
        action: node.action ? {
          label: (node.action as any).label,
          onClick: () => onAction?.((node.action as any).onClick),
          variant: (node.action as any).variant,
          icon: (node.action as any).icon,
        } : undefined,
        secondaryAction: node.secondaryAction ? {
          label: (node.secondaryAction as any).label,
          onClick: () => onAction?.((node.secondaryAction as any).onClick),
          variant: (node.secondaryAction as any).variant,
          icon: (node.secondaryAction as any).icon,
        } : undefined,
        variant: node.variant || 'default',
        size: node.size || 'medium',
      });
    }

    // ── Layout ────────────────────────────────────────────────────────
    case 'Stack': {
      return React.createElement(Stack, {
        key: id,
        direction: node.direction,
        gap: node.gap || 'md',
        children: childElements,
      });
    }

    case 'Divider': {
      return React.createElement(Divider, {
        key: id,
        orientation: node.orientation || 'horizontal',
      });
    }

    // ── Form Controls ─────────────────────────────────────────────────
    case 'TextField': {
      const label = resolveBinding(node.label as StringOrPath, dm);
      const helperText = node.helperText ? resolveBinding(node.helperText as StringOrPath, dm) : '';
      const errorText = node.error ? resolveBinding(node.error as StringOrPath, dm) : '';
      const valueText = node.value ? resolveBinding(node.value as StringOrPath, dm) : undefined;
      const onChange = node.onChange as any;

      const fieldProps: any = {
        key: id,
        label,
        type: (node.type as string) || 'text',
        helperText,
        error: errorText,
        required: node.required || false,
        disabled: node.disabled || false,
      };

      if (onChange) {
        fieldProps.value = valueText || '';
        fieldProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onAction?.({
            ...onChange,
            value: e.target.value,
            updateDataModel: onChange.dataPath ? { [onChange.dataPath]: e.target.value } : undefined,
          });
        };
      } else if (valueText !== undefined) {
        fieldProps.defaultValue = valueText;
      }

      return React.createElement(TextField, fieldProps);
    }

    case 'SearchField': {
      const value = resolveBinding(node.value as StringOrPath, dm);
      const onChange = node.onChange as any;
      return React.createElement(SearchField, {
        key: id,
        value,
        onChange: (newValue: string) => {
          onAction?.({
            ...onChange,
            value: newValue,
            updateDataModel: onChange?.dataPath ? { [onChange.dataPath]: newValue } : undefined,
          });
        },
        suggestions: node.suggestions as any,
        showRecentSearches: node.showRecentSearches as boolean,
        recentSearches: node.recentSearches as string[],
        onSuggestionSelect: node.onSuggestionSelect ? (s: any) => onAction?.(node.onSuggestionSelect) : undefined,
        onClearRecentSearches: node.onClearRecentSearches ? () => onAction?.(node.onClearRecentSearches) : undefined,
        debounceMs: (node.debounceMs as number) || 300,
        placeholder: (node.placeholder as string) || 'Search...',
        disabled: node.disabled || false,
        loading: node.loading || false,
      });
    }

    case 'NumberField': {
      const label = resolveBinding(node.label as StringOrPath, dm);
      const helperText = node.helperText ? resolveBinding(node.helperText as StringOrPath, dm) : '';
      const errorText = node.error ? resolveBinding(node.error as StringOrPath, dm) : '';
      const valueText = node.value ? resolveBinding(node.value as StringOrPath, dm) : undefined;
      const onChange = node.onChange as any;

      const fieldProps: Record<string, any> = {
        key: id,
        label,
        helperText,
        error: errorText,
        min: node.min as number,
        max: node.max as number,
        step: node.step as number,
        required: node.required || false,
        disabled: node.disabled || false,
      };

      if (onChange) {
        fieldProps.value = valueText !== undefined ? Number(valueText) : undefined;
        fieldProps.onChange = (newValue: number) => {
          onAction?.({
            ...onChange,
            value: newValue,
            updateDataModel: onChange.dataPath ? { [onChange.dataPath]: newValue } : undefined,
          });
        };
      } else if (valueText !== undefined) {
        fieldProps.defaultValue = Number(valueText);
      }

      return React.createElement(NumberInput, fieldProps);
    }

    case 'Select': {
      const label = resolveBinding(node.label as StringOrPath, dm);
      const valueText = node.value ? resolveBinding(node.value as StringOrPath, dm) : '';
      const options = ((node.options as any[]) || []).map((opt: any) => ({
        id: opt.value,
        value: opt.value,
        label: opt.label,
      }));
      const onChange = node.onChange as any;

      return React.createElement(Dropdown, {
        key: id,
        label,
        value: valueText,
        options,
        placeholder: (node.placeholder as string) || 'Select...',
        disabled: node.disabled || false,
        onChange: onChange ? (selectedValue: string) => {
          onAction?.({
            ...onChange,
            value: selectedValue,
            updateDataModel: onChange.dataPath ? { [onChange.dataPath]: selectedValue } : undefined,
          });
        } : () => {},
      });
    }

    case 'Checkbox': {
      const label = resolveBinding(node.label as StringOrPath, dm);
      const onChange = node.onChange as any;
      return React.createElement(Checkbox, {
        key: id,
        label,
        checked: node.checked || false,
        disabled: node.disabled || false,
        onChange: onChange ? (event: React.ChangeEvent<HTMLInputElement>) => {
          const isChecked = event.target.checked;
          onAction?.({
            ...onChange,
            value: isChecked,
            updateDataModel: onChange.dataPath ? { [onChange.dataPath]: isChecked } : undefined,
          });
        } : undefined,
      });
    }

    // ── Interactive ───────────────────────────────────────────────────
    case 'Button': {
      const label = resolveBinding(node.label as StringOrPath, dm);
      const action = (node.action || node.onClick) as any;
      
      let handleClick: (() => void) | undefined;
      if (action && isSpecAction(action)) {
        // v0.9 spec: resolve context paths and produce UserActionMessage
        handleClick = () => {
          const resolved = resolveAction(action, id, surface.surfaceId, dm);
          onAction?.(resolved);
        };
      } else if (action) {
        // Legacy format: pass through as-is
        handleClick = () => onAction?.(action);
      }
      
      return React.createElement(Button, {
        key: id,
        variant: node.variant || 'primary',
        size: node.size || 'medium',
        disabled: node.disabled || false,
        onClick: handleClick,
        children: label,
      });
    }

    case 'Chip': {
      const text = resolveBinding(node.content as StringOrPath, dm);
      return React.createElement(Chip, {
        key: id,
        variant: node.variant || 'default',
        size: node.size || 'medium',
        onClick: node.onClick ? () => onAction?.(node.onClick) : undefined,
      }, text);
    }

    case 'FilterChip': {
      const text = resolveBinding(node.content as StringOrPath, dm);
      return React.createElement(FilterChip, {
        key: id,
        selected: node.selected || false,
        onDismiss: node.onDismiss ? () => onAction?.(node.onDismiss) : () => {},
      }, text);
    }

    case 'BooleanChip': {
      const text = resolveBinding(node.content as StringOrPath, dm);
      const onClick = node.onClick as any;
      return React.createElement(BooleanChip, {
        key: id,
        selected: node.selected || false,
        onClick: onClick ? () => {
          onAction?.({
            ...onClick,
            value: !node.selected,
            updateDataModel: onClick.dataPath ? { [onClick.dataPath]: !node.selected } : undefined,
          });
        } : () => {},
      }, text);
    }

    case 'TabBar': {
      const activeTabValue = typeof node.activeTab === 'string'
        ? node.activeTab
        : resolveBinding(node.activeTab as StringOrPath, dm);
      const onTabChange = node.onTabChange as any;
      return React.createElement(TabBar, {
        key: id,
        tabs: node.tabs as any[],
        activeTab: activeTabValue,
        onTabChange: (tabId: string) => {
          onAction?.({
            ...onTabChange,
            value: tabId,
            updateDataModel: onTabChange?.dataPath ? { [onTabChange.dataPath]: tabId } : undefined,
          });
        },
        variant: node.variant || 'default',
      });
    }

    // ── Cards & Lists ─────────────────────────────────────────────────
    case 'Card': {
      const title = resolveBinding(node.title as StringOrPath, dm);
      const excerpt = node.excerpt ? resolveBinding(node.excerpt as StringOrPath, dm) : '';
      const subtitle = node.subtitle ? resolveBinding(node.subtitle as StringOrPath, dm) : '';
      // v0.9 Card with children support
      if (childElements.length > 0) {
        return React.createElement(CardLarge, {
          key: id,
          title,
          excerpt,
          subtitle,
          labels: node.labels as string[],
          picture: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e9ecef" width="100" height="100"/%3E%3C/svg%3E',
        }, ...childElements);
      }
      return React.createElement(CardLarge, {
        key: id,
        title,
        excerpt,
        subtitle,
        labels: node.labels as string[],
        picture: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e9ecef" width="100" height="100"/%3E%3C/svg%3E',
      });
    }

    case 'List': {
      return React.createElement(List, {
        key: id,
        dividers: node.dividers !== false,
        spacing: node.spacing || 'comfortable',
        children: childElements,
      });
    }

    case 'ListItem': {
      const primary = resolveBinding(node.primary as StringOrPath, dm);
      const secondary = node.secondary ? resolveBinding(node.secondary as StringOrPath, dm) : '';
      let badgeElement;
      if (node.badge) {
        const badgeNode = surface.components.get(node.badge as string);
        badgeElement = badgeNode ? renderNode(badgeNode, surface, onAction, depth + 1) : undefined;
      }
      return React.createElement(ListItem, {
        key: id,
        primary,
        secondary,
        badge: badgeElement,
        interactive: node.interactive || false,
        onClick: node.onClick ? () => onAction?.(node.onClick) : undefined,
      }, ...childElements);
    }

    case 'DateGroup': {
      const dateValue = resolveBinding(node.date as StringOrPath, dm);
      const totalAmount = node.totalAmount !== undefined ? resolveNumber(node.totalAmount as NumberOrPath, dm) : undefined;
      const count = node.count !== undefined
        ? (typeof node.count === 'number' ? node.count : parseInt(resolveBinding(node.count as StringOrPath, dm)))
        : undefined;
      return React.createElement(DateGroup, {
        key: id,
        date: dateValue,
        format: (node.format as any) || 'medium',
        showTotal: node.showTotal || false,
        totalAmount,
        showCount: node.showCount || false,
        count,
        sticky: node.sticky || false,
        currency: (node.currency as string) || 'AUD',
        children: childElements,
      });
    }

    // ── Banking ───────────────────────────────────────────────────────
    case 'MoneyDisplay': {
      const amount = resolveNumber(node.amount as NumberOrPath, dm);
      return React.createElement(MoneyDisplay, {
        key: id,
        amount,
        currency: node.currency || 'AUD',
        variant: node.variant || 'default',
        showSign: node.showSign || false,
        size: node.size || 'medium',
        weight: node.weight || 'regular',
        locale: node.locale || 'en-AU',
        align: node.align || 'left',
      });
    }

    case 'TransactionListItem': {
      const merchant = resolveBinding(node.merchant as StringOrPath, dm);
      const amount = resolveNumber(node.amount as NumberOrPath, dm);
      const date = resolveBinding(node.date as StringOrPath, dm);
      const description = node.description ? resolveBinding(node.description as StringOrPath, dm) : undefined;
      
      // TransactionListItem uses onClick (per catalog schema), not action.
      // onClick can carry the spec action format (name + context) for drill-down.
      const onClick = node.onClick as any;
      let handleClick: (() => void) | undefined;
      if (onClick && isSpecAction(onClick)) {
        // v0.9 spec format on onClick: resolve context paths and produce UserActionMessage
        handleClick = () => {
          const resolved = resolveAction(onClick, id, surface.surfaceId, dm);
          onAction?.(resolved);
        };
      } else if (onClick) {
        // Legacy format: pass through as-is
        handleClick = () => onAction?.(onClick);
      }
      
      return React.createElement(TransactionListItem, {
        key: id,
        merchant,
        amount,
        date,
        status: node.status,
        category: node.category,
        merchantLogo: node.merchantLogo ? sanitizeUrl(node.merchantLogo) : undefined,
        description,
        hasReceipt: node.hasReceipt,
        hasNote: node.hasNote,
        currency: node.currency || 'AUD',
        onClick: handleClick,
      });
    }

    case 'AccountCard': {
      const accountName = resolveBinding(node.accountName as StringOrPath, dm);
      const balance = resolveNumber(node.balance as NumberOrPath, dm);
      const trendValue = node.trendValue ? resolveBinding(node.trendValue as StringOrPath, dm) : undefined;
      const action = node.action as any;
      const secondaryAction = node.secondaryAction as any;
      return React.createElement(AccountCard, {
        key: id,
        accountType: node.accountType,
        accountName,
        balance,
        accountNumber: node.accountNumber,
        trend: node.trend,
        trendValue,
        action: action ? {
          label: action.label,
          onClick: () => onAction?.(action.onClick),
          icon: action.icon,
          variant: action.variant,
        } : undefined,
        secondaryAction: secondaryAction ? {
          label: secondaryAction.label,
          onClick: () => onAction?.(secondaryAction.onClick),
          icon: secondaryAction.icon,
          variant: secondaryAction.variant,
        } : undefined,
        currency: node.currency || 'AUD',
        onClick: node.onClick ? () => onAction?.(node.onClick) : undefined,
      });
    }

    case 'CategoryBadge': {
      const text = resolveBinding((node.content || node.label) as StringOrPath, dm);
      return React.createElement(CategoryBadge, {
        key: id,
        color: node.color || 'blue',
        variant: node.variant || 'filled',
        size: node.size || 'medium',
        icon: node.icon as any,
        onClick: node.onClick ? () => onAction?.(node.onClick) : undefined,
        disabled: node.disabled || false,
        children: text,
      });
    }

    case 'StatusBadge': {
      const label = node.label ? resolveBinding(node.label as StringOrPath, dm) : undefined;
      return React.createElement(StatusBadge, {
        key: id,
        status: node.status,
        label,
        size: node.size || 'medium',
        showIcon: node.showIcon !== false,
        liveRegion: node.liveRegion !== false,
      });
    }

    // ── Modals ────────────────────────────────────────────────────────
    case 'Modal': {
      const title = resolveBinding(node.title as StringOrPath, dm);
      return React.createElement(Sheet, {
        key: id,
        title,
        isOpen: node.open as boolean,
        onClose: node.onClose ? () => onAction?.(node.onClose) : () => {},
        children: childElements,
      });
    }

    case 'ActionSheet': {
      const title = node.title ? resolveBinding(node.title as StringOrPath, dm) : undefined;
      const description = node.description ? resolveBinding(node.description as StringOrPath, dm) : undefined;
      const actions = ((node.actions as any[]) || []).map((action: any) => ({
        id: action.id,
        label: action.label,
        icon: action.icon,
        destructive: action.destructive,
        disabled: action.disabled,
        onSelect: () => onAction?.(action.onSelect),
      }));
      return React.createElement(ActionSheet, {
        key: id,
        isOpen: node.isOpen as boolean,
        onClose: () => onAction?.(node.onClose),
        title,
        description,
        actions,
        closeOnOverlayClick: node.closeOnOverlayClick !== false,
        closeOnEscape: node.closeOnEscape !== false,
        showCloseButton: node.showCloseButton !== false,
      });
    }

    // ── Utility ───────────────────────────────────────────────────────
    case 'Progress': {
      const label = node.label ? resolveBinding(node.label as StringOrPath, dm) : undefined;
      const value = (node.value as number) || 0;
      const variant = (node.variant as string) || 'linear';
      if (variant === 'linear') {
        return React.createElement(
          'div',
          { key: id, style: { width: '100%' } },
          label && React.createElement(Typography, { variant: 'caption', children: label }),
          React.createElement(ProgressBar, { value })
        );
      }
      return React.createElement(ProgressBar, { key: id, value });
    }

    case 'Skeleton': {
      return renderSkeleton(
        node.variant || 'rect',
        node.width || '100%',
        node.height || '20px',
        node.count || 1,
        id
      );
    }

    default:
      return null;
  }
}

/**
 * Set of valid component type names in this catalog.
 */
export const VALID_COMPONENT_TYPES = new Set([
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
  // Banking Components - Phase 1
  'MoneyDisplay',
  'TransactionListItem',
  'AccountCard',
  'DateGroup',
  'EmptyState',
  // Banking Components - Phase 2
  'SearchField',
  'CategoryBadge',
  'StatusBadge',
  'TabBar',
  'ActionSheet',
]);

/**
 * Validate that a component type name is in the catalog.
 * v0.9: accepts a string (the component type name).
 * Also accepts legacy v0.8 object format for backward compat.
 */
export function isValidComponent(component: unknown): boolean {
  // v0.9: string discriminator
  if (typeof component === 'string') {
    return VALID_COMPONENT_TYPES.has(component);
  }
  // Legacy v0.8: { Text: {...} }
  if (component && typeof component === 'object') {
    return Object.keys(component).some((key) => VALID_COMPONENT_TYPES.has(key));
  }
  return false;
}

/**
 * Get catalog metadata
 */
export function getCatalogMetadata() {
  return {
    catalogId: CATALOG_ID,
    version: '2.4',
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
