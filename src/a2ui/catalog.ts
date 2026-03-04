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
  Box,
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
export function resolveBinding(
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
export function resolveNumber(
  binding: NumberOrPath | undefined,
  dataModel: Map<string, unknown>
): number {
  if (binding === undefined || binding === null) return 0;
  if (typeof binding === 'number') return binding;
  return parseFloat(resolveBinding(binding, dataModel)) || 0;
}

export function resolveBoolean(
  binding: boolean | StringOrPath | undefined,
  dataModel: Map<string, unknown>
): boolean {
  if (binding === undefined || binding === null) return false;
  if (typeof binding === 'boolean') return binding;

  const raw = resolveBinding(binding, dataModel).trim().toLowerCase();
  if (raw === 'true' || raw === '1' || raw === 'yes') return true;
  if (raw === 'false' || raw === '0' || raw === 'no' || raw === '') return false;

  return Boolean(raw);
}

function normalizeDataPath(dataPath?: string): string | undefined {
  if (!dataPath) return undefined;
  return (dataPath.startsWith('/') ? dataPath.slice(1) : dataPath).replace(/\//g, '.');
}

function setNestedValue(target: Record<string, unknown>, pathSegments: string[], value: unknown): Record<string, unknown> {
  if (pathSegments.length === 0) return target;

  const [head, ...tail] = pathSegments;
  if (!head) return target;

  if (tail.length === 0) {
    return { ...target, [head]: value };
  }

  const next = target[head];
  const nextObj = next && typeof next === 'object' && !Array.isArray(next)
    ? (next as Record<string, unknown>)
    : {};

  return {
    ...target,
    [head]: setNestedValue(nextObj, tail, value),
  };
}

function toDataModelUpdate(
  dataPath: string | undefined,
  value: unknown,
  dataModel: Map<string, unknown>
): Record<string, unknown> | undefined {
  const key = normalizeDataPath(dataPath);
  if (!key) return undefined;

  const segments = key.split('.').filter(Boolean);
  if (segments.length === 0) return undefined;

  if (segments.length === 1) {
    return { [segments[0]]: value };
  }

  const [root, ...tail] = segments;
  const existingRoot = dataModel.get(root);
  const baseRoot = existingRoot && typeof existingRoot === 'object' && !Array.isArray(existingRoot)
    ? (existingRoot as Record<string, unknown>)
    : {};

  return {
    [root]: setNestedValue(baseRoot, tail, value),
  };
}

function resolveSelectValue(selected: unknown): string {
  if (typeof selected === 'string') return selected;
  if (typeof selected === 'number' || typeof selected === 'boolean') return String(selected);
  if (selected && typeof selected === 'object') {
    const obj = selected as Record<string, unknown>;
    if (typeof obj.value === 'string' || typeof obj.value === 'number' || typeof obj.value === 'boolean') {
      return String(obj.value);
    }
    if (typeof obj.id === 'string' || typeof obj.id === 'number' || typeof obj.id === 'boolean') {
      return String(obj.id);
    }
  }
  return '';
}

function resolveSearchValue(nextValue: unknown): string {
  if (typeof nextValue === 'string') return nextValue;
  if (nextValue && typeof nextValue === 'object') {
    const candidate = nextValue as Record<string, unknown>;
    if (typeof candidate.value === 'string') return candidate.value;
    const target = candidate.target;
    if (target && typeof target === 'object' && typeof (target as Record<string, unknown>).value === 'string') {
      return (target as Record<string, unknown>).value as string;
    }
  }
  return '';
}

function isTransactionVisible(node: ComponentNode, dataModel: Map<string, unknown>): boolean {
  const query = String(dataModel.get('query') ?? '').trim().toLowerCase();
  const amount = resolveNumber(node.amount as NumberOrPath, dataModel);
  const merchant = resolveBinding(node.merchant as StringOrPath, dataModel).toLowerCase();
  const category = String(node.category ?? '').toLowerCase();
  const date = resolveBinding(node.date as StringOrPath, dataModel).toLowerCase();

  if (query) {
    const amountText = Number.isFinite(amount) ? amount.toFixed(2) : '';
    const matches = merchant.includes(query) || category.includes(query) || date.includes(query) || amountText.includes(query);
    if (!matches) return false;
  }

  const filters = dataModel.get('filters');
  const filterObj = filters && typeof filters === 'object' && !Array.isArray(filters)
    ? (filters as Record<string, unknown>)
    : undefined;

  if (filterObj) {
    const moneyOut = Boolean(filterObj.moneyOut);
    const moneyIn = Boolean(filterObj.moneyIn);
    const last7Days = Boolean(filterObj.last7Days);
    const last30Days = Boolean(filterObj.last30Days);

    if (last7Days || last30Days) {
      const txDate = new Date(resolveBinding(node.date as StringOrPath, dataModel));
      if (!Number.isNaN(txDate.getTime())) {
        const now = new Date();
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
        const maxDays = last7Days ? 7 : 30;
        if (diffDays > maxDays) return false;
      }
    }

    if (moneyOut && amount >= 0) return false;
    if (moneyIn && amount <= 0) return false;
  }

  return true;
}

/**
 * Resolve a v0.9 spec ActionDefinition into a UserActionMessage.
 *
 * This is the core of the action-to-agent feedback loop: when a Button
 * has an `action` with `name` + `context`, we resolve all context paths
 * from the local data model and produce a fully-resolved UserActionMessage.
 */
export function resolveAction(
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
export function isSpecAction(action: unknown): action is ActionDefinition {
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
            updateDataModel: toDataModelUpdate(onChange.dataPath, e.target.value, dm),
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
        onChange: (nextValue: unknown) => {
          const resolvedValue = resolveSearchValue(nextValue);
          onAction?.({
            ...onChange,
            value: resolvedValue,
            updateDataModel: toDataModelUpdate(onChange?.dataPath, resolvedValue, dm),
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
        fieldProps.onChange = (newValue: number | '') => {
          const resolvedValue = newValue === '' ? 0 : newValue;
          onAction?.({
            ...onChange,
            value: resolvedValue,
            updateDataModel: toDataModelUpdate(onChange.dataPath, resolvedValue, dm),
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
        onChange: onChange ? (selectedValue: unknown) => {
          const resolvedValue = resolveSelectValue(selectedValue);
          onAction?.({
            ...onChange,
            value: resolvedValue,
            updateDataModel: toDataModelUpdate(onChange.dataPath, resolvedValue, dm),
          });
        } : () => {},
      });
    }

    case 'Checkbox': {
      const label = resolveBinding(node.label as StringOrPath, dm);
      const onChange = node.onChange as any;
      const checked = resolveBoolean(node.checked as boolean | StringOrPath | undefined, dm);
      return React.createElement(Checkbox, {
        key: id,
        label,
        checked,
        disabled: node.disabled || false,
        onChange: onChange ? (event: React.ChangeEvent<HTMLInputElement>) => {
          const isChecked = event.target.checked;
          onAction?.({
            ...onChange,
            value: isChecked,
            updateDataModel: toDataModelUpdate(onChange.dataPath, isChecked, dm),
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
      
      const VALID_BUTTON_VARIANTS = ['primary', 'secondary', 'naked', 'emphasis', 'danger'] as const;
      const rawVariant = node.variant as string | undefined;
      const safeVariant: typeof VALID_BUTTON_VARIANTS[number] =
        VALID_BUTTON_VARIANTS.includes(rawVariant as any) ? rawVariant as any : 'primary';
      return React.createElement(Button, {
        key: id,
        variant: safeVariant,
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
      const selected = resolveBoolean(node.selected as boolean | StringOrPath | undefined, dm);
      return React.createElement(BooleanChip, {
        key: id,
        selected,
        onClick: onClick ? () => {
          onAction?.({
            ...onClick,
            value: !selected,
            updateDataModel: toDataModelUpdate(onClick.dataPath, !selected, dm),
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
            updateDataModel: toDataModelUpdate(onTabChange?.dataPath, tabId, dm),
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

      // Card with children → use Box as a styled container
      // CardLarge doesn't accept children, so we use Box with card-like styling
      if (childElements.length > 0) {
        const isOutlined = node.variant === 'outlined';
        const isFilled = node.variant === 'filled';
        const containerChildren = title
          ? [React.createElement(Typography, { key: `${id}-title`, variant: 'h3', children: title }), ...childElements]
          : childElements;
        return React.createElement(Box, {
          key: id,
          p: 'lg' as any,
          borderRadius: '4' as any,
          border: isOutlined ? 'default' as any : undefined,
          bg: isFilled ? 'subtle' as any : 'surface' as any,
        }, ...containerChildren);
      }

      // Card without children → use CardLarge (for media/summary cards)
      const image = node.image ? resolveBinding(node.image as StringOrPath, dm) : '';
      const sanitizedImage = image ? sanitizeUrl(image) : '';
      const cardProps: React.ComponentProps<typeof CardLarge> = {
        title: title || '',
        excerpt,
        picture: sanitizedImage || '',
        subtitle,
        labels: node.labels as string[],
      };

      return React.createElement(CardLarge, { key: id, ...cardProps });
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
      const visibleTxNodes = (childIds as string[])
        .map((childId) => surface.components.get(childId))
        .filter((child): child is ComponentNode => Boolean(child))
        .filter((child) => child.component === 'TransactionListItem')
        .filter((child) => isTransactionVisible(child, dm));

      const hasTransactionChildren = visibleTxNodes.length > 0;
      const totalAmount = hasTransactionChildren
        ? visibleTxNodes.reduce((sum, tx) => sum + resolveNumber(tx.amount as NumberOrPath, dm), 0)
        : node.totalAmount !== undefined
          ? resolveNumber(node.totalAmount as NumberOrPath, dm)
          : undefined;

      const count = hasTransactionChildren
        ? visibleTxNodes.length
        : node.count !== undefined
          ? (typeof node.count === 'number' ? node.count : parseInt(resolveBinding(node.count as StringOrPath, dm)))
          : undefined;

      if ((childIds as string[]).length > 0 && childElements.length === 0) {
        return null;
      }

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
      if (!isTransactionVisible(node, dm)) {
        return null;
      }

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

      const VALID_TX_STATUSES = ['completed', 'pending', 'failed'];
      const status = VALID_TX_STATUSES.includes(node.status) ? node.status : undefined;
      const VALID_TX_CATEGORIES = ['shopping', 'dining', 'transport', 'entertainment', 'bills', 'other'];
      const category = VALID_TX_CATEGORIES.includes(node.category) ? node.category : undefined;
      
      return React.createElement(TransactionListItem, {
        key: id,
        merchant,
        amount,
        date,
        status,
        category,
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

      const onClick = node.onClick as any;
      let handleClick: (() => void) | undefined;
      if (onClick && isSpecAction(onClick)) {
        handleClick = () => {
          const resolved = resolveAction(onClick, id, surface.surfaceId, dm);
          onAction?.(resolved);
        };
      } else if (onClick) {
        handleClick = () => onAction?.(onClick);
      }

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
        onClick: handleClick,
      });
    }

    case 'CategoryBadge': {
      const text = resolveBinding(node.label as StringOrPath, dm);
      const VALID_COLORS = ['blue', 'purple', 'pink', 'yellow', 'green', 'red', 'orange', 'gray'];
      const rawColor = node.color === 'grey' ? 'gray' : node.color;
      const color = VALID_COLORS.includes(rawColor) ? rawColor : 'blue';

      const variantMap: Record<string, string> = {
        outline: 'outlined',
        subtle: 'minimal',
      };
      const rawVariant = variantMap[node.variant] || node.variant;
      const VALID_VARIANTS = ['filled', 'outlined', 'minimal'];
      const variant = VALID_VARIANTS.includes(rawVariant) ? rawVariant : 'filled';

      const size = node.size === 'small' ? 'small' : 'medium';

      return React.createElement(CategoryBadge, {
        key: id,
        color,
        variant,
        size,
        icon: node.icon as any,
        children: text,
      });
    }

    case 'StatusBadge': {
      const VALID_STATUSES = ['pending', 'completed', 'failed', 'cancelled', 'processing', 'scheduled'];
      const status = VALID_STATUSES.includes(node.status) ? node.status : 'pending';
      const label = node.label ? resolveBinding(node.label as StringOrPath, dm) : undefined;
      return React.createElement(StatusBadge, {
        key: id,
        status,
        label,
        size: node.size === 'small' ? 'small' : 'medium',
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
    version: '2.8.2',
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
