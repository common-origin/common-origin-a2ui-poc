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
      { key: node.id, variant },
      content
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
      },
      content
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
        onClick: onClick ? () => onAction?.(onClick) : undefined,
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
      },
      ...childElements
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
      },
      ...childElements
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
      },
      contentText
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
    
    return React.createElement(Dropdown, {
      key: node.id,
      label: labelText,
      value: valueText || '',
      options: options,
      placeholder: placeholder || 'Select...',
      required,
      disabled,
      onChange: onChange ? (selectedValue: string) => {
        const action = {
          ...onChange,
          value: selectedValue,
          updateDataModel: onChange.dataPath ? { [onChange.dataPath]: selectedValue } : undefined,
        };
        onAction?.(action);
      } : undefined,
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
      onChange: onChange ? (isChecked: boolean) => {
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
        open,
        onClose: onClose ? () => onAction?.(onClose) : undefined,
      },
      ...childElements
    );
  }

  if ('Progress' in component) {
    const { value, variant = 'linear', size = 'medium', label } = component.Progress;
    const labelText = label ? resolveDataBinding(label, surface.dataModel) : undefined;
    
    if (variant === 'linear') {
      return React.createElement(
        'div',
        { key: node.id, style: { width: '100%' } },
        labelText && React.createElement(Typography, { variant: 'caption' }, labelText),
        React.createElement(ProgressBar, {
          value,
          size,
        })
      );
    }
    // For circular variant, use ProgressBar with appropriate styling
    return React.createElement(ProgressBar, {
      key: node.id,
      value,
      size,
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
  ];
  
  return validTypes.some((type) => type in component);
}

/**
 * Get catalog metadata
 */
export function getCatalogMetadata() {
  return {
    catalogId: CATALOG_ID,
    version: '2.0',
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
    ],
  };
}
