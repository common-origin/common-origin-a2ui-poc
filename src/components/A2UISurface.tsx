'use client';

/**
 * A2UI Surface Component
 * 
 * This component implements an A2UI renderer "surface" that:
 * 1. Accepts A2UI JSONL messages (surfaceUpdate, dataModelUpdate, beginRendering)
 * 2. Maintains surface state (component tree, data model)
 * 3. Handles incremental updates as messages arrive
 * 4. Renders components through the catalog security layer
 * 
 * Security model:
 * - Only catalog-approved components can be rendered
 * - No arbitrary code execution
 * - All props validated through catalog
 */

import React, { useState, useCallback, useEffect } from 'react';
import { renderNode, CATALOG_ID } from '../a2ui/catalog';
import type {
  A2UIMessage,
  SurfaceState,
  ComponentNode,
} from '../a2ui/types';

interface A2UISurfaceProps {
  surfaceId?: string;
  onAction?: (action: any) => void;
  className?: string;
}

export function A2UISurface({ 
  surfaceId = 'main', 
  onAction,
  className,
}: A2UISurfaceProps) {
  const [surface, setSurface] = useState<SurfaceState>({
    surfaceId,
    components: new Map(),
    dataModel: new Map(),
    rendering: false,
  });

  /**
   * Handle actions from rendered components
   * This enables two-way communication: UI -> State -> Agent
   */
  const handleAction = useCallback((action: any) => {
    console.log('[A2UISurface] Action received:', action);

    // Update data model if action includes data updates
    if (action.updateDataModel) {
      setSurface((prev) => {
        const newDataModel = new Map(prev.dataModel);
        Object.entries(action.updateDataModel).forEach(([key, value]) => {
          newDataModel.set(key, value);
        });
        return { ...prev, dataModel: newDataModel };
      });
    }

    // Call parent onAction handler if provided
    if (onAction) {
      onAction(action);
    }
  }, [onAction]);

  /**
   * Process an A2UI message and update surface state
   */
  const processMessage = useCallback((message: A2UIMessage) => {
    setSurface((prev) => {
      const next = { ...prev };

      if ('surfaceUpdate' in message) {
        const { surfaceId: msgSurfaceId, components } = message.surfaceUpdate;
        if (msgSurfaceId !== surfaceId) return prev;

        // Add or update components
        const newComponents = new Map(prev.components);
        for (const component of components) {
          newComponents.set(component.id, component);
        }
        next.components = newComponents;
      }

      if ('dataModelUpdate' in message) {
        const { surfaceId: msgSurfaceId, contents } = message.dataModelUpdate;
        if (msgSurfaceId !== surfaceId) return prev;

        // Update data model
        const newDataModel = new Map(prev.dataModel);
        for (const entry of contents) {
          if (entry.valueString !== undefined) {
            newDataModel.set(entry.key, entry.valueString);
          } else if (entry.valueInt !== undefined) {
            newDataModel.set(entry.key, entry.valueInt);
          } else if (entry.valueBool !== undefined) {
            newDataModel.set(entry.key, entry.valueBool);
          } else if (entry.valueMap !== undefined) {
            const mapValue: Record<string, any> = {};
            for (const mapEntry of entry.valueMap) {
              if (mapEntry.valueString !== undefined) {
                mapValue[mapEntry.key] = mapEntry.valueString;
              } else if (mapEntry.valueInt !== undefined) {
                mapValue[mapEntry.key] = mapEntry.valueInt;
              } else if (mapEntry.valueBool !== undefined) {
                mapValue[mapEntry.key] = mapEntry.valueBool;
              }
            }
            newDataModel.set(entry.key, mapValue);
          }
        }
        next.dataModel = newDataModel;
      }

      if ('beginRendering' in message) {
        const { surfaceId: msgSurfaceId, root, catalogId } = message.beginRendering;
        if (msgSurfaceId !== surfaceId) return prev;

        next.root = root;
        next.catalogId = catalogId;
        next.rendering = true;
      }

      if ('deleteSurface' in message) {
        const { surfaceId: msgSurfaceId } = message.deleteSurface;
        if (msgSurfaceId !== surfaceId) return prev;

        // Reset surface
        return {
          surfaceId,
          components: new Map(),
          dataModel: new Map(),
          rendering: false,
        };
      }

      return next;
    });
  }, [surfaceId]);

  /**
   * Process multiple messages (e.g., from a stream)
   */
  const processMessages = useCallback((messages: A2UIMessage[]) => {
    messages.forEach(processMessage);
  }, [processMessage]);

  /**
   * Expose methods to parent via ref or global registration
   */
  useEffect(() => {
    // Register this surface globally so messages can be routed to it
    if (typeof window !== 'undefined') {
      (window as any).__a2uiSurfaces = (window as any).__a2uiSurfaces || {};
      (window as any).__a2uiSurfaces[surfaceId] = {
        processMessage,
        processMessages,
      };

      return () => {
        delete (window as any).__a2uiSurfaces[surfaceId];
      };
    }
  }, [surfaceId, processMessage, processMessages]);

  /**
   * Render the surface
   */
  const renderSurface = () => {
    if (!surface.rendering || !surface.root) {
      return (
        <div className={className} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          Waiting for UI generation...
        </div>
      );
    }

    const rootNode = surface.components.get(surface.root);
    if (!rootNode) {
      return (
        <div className={className} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          Root component not found: {surface.root}
        </div>
      );
    }

    return (
      <div className={className}>
        {renderNode(rootNode, surface, handleAction)}
      </div>
    );
  };

  return renderSurface();
}

/**
 * Helper hook to interact with a surface from parent components
 */
export function useA2UISurface(surfaceId: string = 'main') {
  const sendMessage = useCallback((message: A2UIMessage) => {
    if (typeof window !== 'undefined') {
      const surfaces = (window as any).__a2uiSurfaces;
      const surface = surfaces?.[surfaceId];
      if (surface) {
        surface.processMessage(message);
      }
    }
  }, [surfaceId]);

  const sendMessages = useCallback((messages: A2UIMessage[]) => {
    if (typeof window !== 'undefined') {
      const surfaces = (window as any).__a2uiSurfaces;
      const surface = surfaces?.[surfaceId];
      if (surface) {
        surface.processMessages(messages);
      }
    }
  }, [surfaceId]);

  return { sendMessage, sendMessages };
}
