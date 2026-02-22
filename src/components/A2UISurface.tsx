'use client';

/**
 * A2UI Surface Component — v0.9
 * 
 * Processes v0.9 messages: createSurface, updateComponents, updateDataModel, deleteSurface
 * Also accepts legacy v0.8 message names for backward compatibility.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { renderNode, CATALOG_ID } from '../a2ui/catalog';
import { renderSkeleton } from '../a2ui/skeleton';
import { createLogger } from '../lib/logger';
import { useSurfaceRegistration, useSurfaceDispatch } from './SurfaceContext';
import type {
  A2UIMessage,
  SurfaceState,
  ComponentNode,
  UserActionMessage,
} from '../a2ui/types';

const log = createLogger('Surface');

/**
 * Surface transition phases (state machine):
 *
 *   idle ──[startTransition]──▸ exiting ──[timeout 300ms]──▸ loading ──[components arrive]──▸ entering ──[timeout 400ms]──▸ idle
 *
 * - idle:     Normal render of current content
 * - exiting:  Old content fades/blurs out (300ms CSS transition)
 * - loading:  Skeleton placeholder while agent generates
 * - entering: New content fades in (400ms animation)
 */
type TransitionPhase = 'idle' | 'exiting' | 'loading' | 'entering';

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

  // ── Transition state machine ──────────────────────────────────────────
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const prevContentRef = useRef<React.ReactNode>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const enterTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const surfaceRef = useRef(surface);
  surfaceRef.current = surface;
  const handleActionRef = useRef<(action: any) => void>(null!);

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
  handleActionRef.current = handleAction;

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
        // Clear old state when a new surface is created (removes need for deleteSurface)
        next.components = new Map();
        next.dataModel = new Map();
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
   * Begin the exit transition. Captures current rendered content and starts
   * the exiting → loading → entering → idle sequence.
   */
  const startTransition = useCallback(() => {
    // Only transition if we have content to transition away from
    const snap = surfaceRef.current;
    if (snap.rendering && snap.components.size > 0) {
      const rootNode = snap.components.get(snap.root || 'root');
      if (rootNode) {
        prevContentRef.current = renderNode(rootNode, snap, handleActionRef.current);
      }
    }
    setPhase('exiting');
    // After exit animation completes, move to loading phase
    clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setPhase('loading');
    }, 300);
  }, []); // stable — reads current values from refs

  // When new components arrive during loading phase → transition to entering
  useEffect(() => {
    if (phase === 'loading' && surface.components.size > 0 && surface.components.has(surface.root || 'root')) {
      prevContentRef.current = null;
      setPhase('entering');
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = setTimeout(() => {
        setPhase('idle');
      }, 400);
    }
  }, [phase, surface.components, surface.root]);

  // If components arrive while still in exiting phase, skip straight to entering
  useEffect(() => {
    if (phase === 'exiting' && surface.components.size > 0 && surface.components.has(surface.root || 'root')) {
      clearTimeout(exitTimerRef.current);
      prevContentRef.current = null;
      setPhase('entering');
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = setTimeout(() => {
        setPhase('idle');
      }, 400);
    }
  }, [phase, surface.components, surface.root]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearTimeout(exitTimerRef.current);
      clearTimeout(enterTimerRef.current);
    };
  }, []);

  /**
   * Register this surface via React context (preferred) or window global (fallback)
   */
  useEffect(() => {
    const handler = { processMessage, processMessages, startTransition };

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
  }, [surfaceId, processMessage, processMessages, startTransition, contextRegistration]);

  /**
   * Render the surface — single persistent wrapper div across all phases.
   *
   * IMPORTANT: We must return the SAME wrapper <div> in every branch so that
   * React preserves the DOM element. This is what makes CSS transitions work —
   * when phase changes from idle → exiting, the SAME element gets new style
   * values and the browser can animate between them. If we returned different
   * elements per branch, React would unmount/remount and cause a visible flash.
   */
  const renderSurface = () => {
    const isExiting = phase === 'exiting';
    const isLoading = phase === 'loading';
    const isEntering = phase === 'entering';

    // ── Determine content based on phase ────────────────────────────────
    let content: React.ReactNode;

    if (isExiting) {
      // During exit: show captured snapshot so content stays visually stable
      // even as createSurface clears the live component map underneath
      content = prevContentRef.current || renderSkeleton('card', '100%', '20px', 3, 'exit-skeleton');
    } else if (isLoading) {
      content = renderSkeleton('card', '100%', '20px', 3, 'transition-skeleton');
    } else if (!surface.rendering || !surface.root) {
      content = (
        <div role="status" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted, #666)' }}>
          Waiting for UI generation...
        </div>
      );
    } else {
      const rootNode = surface.components.get(surface.root);
      if (!rootNode) {
        content = renderSkeleton('card', '100%', '20px', 3, 'loading-skeleton');
      } else {
        content = renderNode(rootNode, surface, handleAction);
      }
    }

    // ── Single persistent wrapper — CSS transitions work across phases ──
    return (
      <div
        className={className}
        data-phase={phase}
        role={isLoading ? 'status' : undefined}
        aria-label={isLoading ? 'Loading new content' : undefined}
        style={{
          // Transition is ALWAYS present so the browser can animate between values
          transition: 'opacity 0.3s ease-out, filter 0.3s ease-out, transform 0.3s ease-out',
          opacity: isExiting ? 0 : 1,
          filter: isExiting ? 'blur(4px)' : 'none',
          transform: isExiting ? 'scale(0.98)' : 'none',
          pointerEvents: isExiting || isLoading ? 'none' : undefined,
          animation: isEntering ? 'surfaceEnter 0.35s ease-out' : undefined,
        }}
      >
        <style>{`
          @keyframes surfaceEnter {
            from {
              opacity: 0.2;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        {content}
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
