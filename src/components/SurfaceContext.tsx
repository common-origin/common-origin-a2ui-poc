'use client';

/**
 * A2UI Surface Context
 *
 * Provides React-idiomatic surface messaging instead of the
 * window.__a2uiSurfaces global. Surfaces register their message
 * handlers; parent components send messages via the context.
 *
 * Usage:
 *   <A2UISurfaceProvider>
 *     <A2UISurface surfaceId="main" />
 *     <MyControls />           ← calls useSurfaceDispatch('main')
 *   </A2UISurfaceProvider>
 */

import React, { createContext, useContext, useCallback, useRef } from 'react';
import type { A2UIMessage } from '../a2ui/types';

// ── Types ─────────────────────────────────────────────────────────────────

interface SurfaceHandler {
  processMessage: (message: A2UIMessage) => void;
  processMessages: (messages: A2UIMessage[]) => void;
}

interface SurfaceRegistry {
  register: (surfaceId: string, handler: SurfaceHandler) => void;
  unregister: (surfaceId: string) => void;
  dispatch: (surfaceId: string, message: A2UIMessage) => void;
  dispatchMany: (surfaceId: string, messages: A2UIMessage[]) => void;
}

// ── Context ───────────────────────────────────────────────────────────────

const SurfaceContext = createContext<SurfaceRegistry | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────

export function A2UISurfaceProvider({ children }: { children: React.ReactNode }) {
  const handlers = useRef<Map<string, SurfaceHandler>>(new Map());

  const register = useCallback((surfaceId: string, handler: SurfaceHandler) => {
    handlers.current.set(surfaceId, handler);
  }, []);

  const unregister = useCallback((surfaceId: string) => {
    handlers.current.delete(surfaceId);
  }, []);

  const dispatch = useCallback((surfaceId: string, message: A2UIMessage) => {
    const handler = handlers.current.get(surfaceId);
    if (handler) {
      handler.processMessage(message);
    }
  }, []);

  const dispatchMany = useCallback((surfaceId: string, messages: A2UIMessage[]) => {
    const handler = handlers.current.get(surfaceId);
    if (handler) {
      handler.processMessages(messages);
    }
  }, []);

  const registry: SurfaceRegistry = { register, unregister, dispatch, dispatchMany };

  return (
    <SurfaceContext.Provider value={registry}>
      {children}
    </SurfaceContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────

/**
 * Hook for surface components to register their message handlers.
 * Called internally by A2UISurface.
 */
export function useSurfaceRegistration() {
  const ctx = useContext(SurfaceContext);
  if (!ctx) throw new Error('useSurfaceRegistration must be inside A2UISurfaceProvider');
  return { register: ctx.register, unregister: ctx.unregister };
}

/**
 * Hook for parent components to send messages to a surface.
 * Replaces the old useA2UISurface hook.
 */
export function useSurfaceDispatch(surfaceId: string = 'main') {
  const ctx = useContext(SurfaceContext);

  const sendMessage = useCallback((message: A2UIMessage) => {
    // Support both context and legacy global fallback
    if (ctx) {
      ctx.dispatch(surfaceId, message);
    } else if (typeof window !== 'undefined') {
      const surfaces = (window as any).__a2uiSurfaces;
      surfaces?.[surfaceId]?.processMessage(message);
    }
  }, [ctx, surfaceId]);

  const sendMessages = useCallback((messages: A2UIMessage[]) => {
    if (ctx) {
      ctx.dispatchMany(surfaceId, messages);
    } else if (typeof window !== 'undefined') {
      const surfaces = (window as any).__a2uiSurfaces;
      surfaces?.[surfaceId]?.processMessages(messages);
    }
  }, [ctx, surfaceId]);

  return { sendMessage, sendMessages };
}
