'use client';

/**
 * A2UI Surface Component — v0.9
 * 
 * Processes v0.9 messages: createSurface, updateComponents, updateDataModel, deleteSurface
 * Also accepts legacy v0.8 message names for backward compatibility.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { renderNode, CATALOG_ID } from '../a2ui/catalog';
import { createLogger } from '../lib/logger';
import { useSurfaceRegistration, useSurfaceDispatch } from './SurfaceContext';
import type {
  A2UIMessage,
  SurfaceState,
  ComponentNode,
  UserActionMessage,
} from '../a2ui/types';

const log = createLogger('Surface');

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
  // Use context-based registration if available
  let contextRegistration: ReturnType<typeof useSurfaceRegistration> | null = null;
  try {
    contextRegistration = useSurfaceRegistration();
  } catch {
    // Not inside provider — will fall back to window global
  }

  const [surface, setSurface] = useState<SurfaceState>({
    surfaceId,
    components: new Map(),
    dataModel: new Map(),
    rendering: false,
  });

  /**
   * Handle actions from rendered components.
   * Supports both:
   * - v0.9 spec UserActionMessage (from buttons with action.name + context)
   * - Legacy action objects (eventType-based, for backward compat)
   */
  const handleAction = useCallback((action: any) => {
    log.debug('Action received', { action });

    // Check if this is a v0.9 spec UserActionMessage (resolved by catalog)
    if (action?.userAction?.name) {
      console.log('[A2UISurface] UserAction:', action.userAction.name, action.userAction.context);
      // Pass the full UserActionMessage to parent — the page will send it to the agent
      if (onAction) {
        onAction(action as UserActionMessage);
      }
      return;
    }

    // Legacy: Update data model if action includes data updates
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
   * Process an A2UI message (v0.9 + v0.8 compat) and update surface state
   */
  const processMessage = useCallback((message: A2UIMessage) => {
    setSurface((prev) => {
      const next = { ...prev };
      const msg = message as Record<string, any>;

      // ── v0.9: createSurface (sent FIRST to initialise the surface) ──
      if ('createSurface' in msg) {
        const { surfaceId: msgSurfaceId, catalogId } = msg.createSurface;
        if (msgSurfaceId !== surfaceId) return prev;
        next.catalogId = catalogId;
        next.root = 'root'; // v0.9 convention: root component always has id "root"
        next.rendering = true;
        return next;
      }

      // ── v0.9: updateComponents ── (also accepts legacy "surfaceUpdate")
      if ('updateComponents' in msg || 'surfaceUpdate' in msg) {
        const body = msg.updateComponents || msg.surfaceUpdate;
        const { surfaceId: msgSurfaceId, components } = body;
        if (msgSurfaceId !== surfaceId) return prev;

        const newComponents = new Map(prev.components);
        for (const component of components) {
          newComponents.set(component.id, component);
        }
        next.components = newComponents;
        return next;
      }

      // ── v0.9: updateDataModel ── (also accepts legacy "dataModelUpdate")
      if ('updateDataModel' in msg || 'dataModelUpdate' in msg) {
        const body = msg.updateDataModel || msg.dataModelUpdate;
        const { surfaceId: msgSurfaceId } = body;
        if (msgSurfaceId !== surfaceId) return prev;

        const newDataModel = new Map(prev.dataModel);

        // v0.9 format: { value: {...}, path?, op? }
        if (body.value && typeof body.value === 'object') {
          const op = body.op || 'replace';
          if (op === 'replace' || op === 'add') {
            for (const [key, val] of Object.entries(body.value as Record<string, unknown>)) {
              newDataModel.set(key, val);
            }
          } else if (op === 'remove' && body.path) {
            const key = body.path.split('/').filter(Boolean).pop();
            if (key) newDataModel.delete(key);
          }
        }

        // Legacy v0.8 format: { contents: [{key, valueString|valueInt|...}] }
        if (Array.isArray(body.contents)) {
          for (const entry of body.contents) {
            if (entry.valueString !== undefined) {
              newDataModel.set(entry.key, entry.valueString);
            } else if (entry.valueInt !== undefined) {
              newDataModel.set(entry.key, entry.valueInt);
            } else if (entry.valueNumber !== undefined) {
              newDataModel.set(entry.key, entry.valueNumber);
            } else if (entry.valueBool !== undefined) {
              newDataModel.set(entry.key, entry.valueBool);
            } else if (entry.valueMap !== undefined) {
              const mapValue: Record<string, unknown> = {};
              for (const mapEntry of entry.valueMap) {
                if (mapEntry.valueString !== undefined) mapValue[mapEntry.key] = mapEntry.valueString;
                else if (mapEntry.valueInt !== undefined) mapValue[mapEntry.key] = mapEntry.valueInt;
                else if (mapEntry.valueBool !== undefined) mapValue[mapEntry.key] = mapEntry.valueBool;
              }
              newDataModel.set(entry.key, mapValue);
            }
          }
        }

        next.dataModel = newDataModel;
        return next;
      }

      // ── Legacy v0.8: beginRendering (now replaced by createSurface) ──
      if ('beginRendering' in msg) {
        const { surfaceId: msgSurfaceId, root, catalogId } = msg.beginRendering;
        if (msgSurfaceId !== surfaceId) return prev;
        next.root = root;
        next.catalogId = catalogId;
        next.rendering = true;
        return next;
      }

      // ── deleteSurface (same in v0.8 and v0.9) ──
      if ('deleteSurface' in msg) {
        const { surfaceId: msgSurfaceId } = msg.deleteSurface;
        if (msgSurfaceId !== surfaceId) return prev;
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
   * Register this surface via React context (preferred) or window global (fallback)
   */
  useEffect(() => {
    const handler = { processMessage, processMessages };

    // Context-based registration (preferred)
    if (contextRegistration) {
      contextRegistration.register(surfaceId, handler);
      return () => contextRegistration!.unregister(surfaceId);
    }

    // Fallback: window global (for use without provider)
    if (typeof window !== 'undefined') {
      (window as any).__a2uiSurfaces = (window as any).__a2uiSurfaces || {};
      (window as any).__a2uiSurfaces[surfaceId] = handler;

      return () => {
        delete (window as any).__a2uiSurfaces[surfaceId];
      };
    }
  }, [surfaceId, processMessage, processMessages, contextRegistration]);

  /**
   * Render the surface
   */
  const renderSurface = () => {
    if (!surface.rendering || !surface.root) {
      return (
        <div className={className} role="status" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted, #666)' }}>
          Waiting for UI generation...
        </div>
      );
    }

    const rootNode = surface.components.get(surface.root);
    if (!rootNode) {
      return (
        <div className={className} role="status" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted, #666)' }}>
          Root component not found: {surface.root}
        </div>
      );
    }

    return (
      <div 
        className={className}
        style={{
          animation: 'fadeInUp 0.4s ease-out',
        }}
      >
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        {renderNode(rootNode, surface, handleAction)}
      </div>
    );
  };

  return renderSurface();
}

/**
 * Helper hook to interact with a surface from parent components.
 * Now delegates to SurfaceContext when available, falls back to window global.
 */
export function useA2UISurface(surfaceId: string = 'main') {
  return useSurfaceDispatch(surfaceId);
}
