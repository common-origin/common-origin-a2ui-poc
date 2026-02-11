/**
 * Structured Logger for A2UI Banking Demo
 *
 * Provides tagged, levelled logging with structured context data.
 * Controlled by NEXT_PUBLIC_LOG_LEVEL env var (debug | info | warn | error).
 *
 * Usage:
 *   import { createLogger } from '@/src/lib/logger';
 *   const log = createLogger('MyComponent');
 *   log.info('Something happened', { key: 'value' });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getConfiguredLevel(): LogLevel {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_LOG_LEVEL) {
    const level = process.env.NEXT_PUBLIC_LOG_LEVEL.toLowerCase() as LogLevel;
    if (level in LEVEL_PRIORITY) return level;
  }
  // Default: debug in development, info in production
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return 'info';
  }
  return 'debug';
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[getConfiguredLevel()];
}

function formatContext(ctx?: Record<string, unknown>): string {
  if (!ctx || Object.keys(ctx).length === 0) return '';
  try {
    return ' ' + JSON.stringify(ctx);
  } catch {
    return ' [unserializable context]';
  }
}

function truncate(value: unknown, maxLen = 200): string {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
}

export interface Logger {
  debug: (message: string, ctx?: Record<string, unknown>) => void;
  info: (message: string, ctx?: Record<string, unknown>) => void;
  warn: (message: string, ctx?: Record<string, unknown>) => void;
  error: (message: string, ctx?: Record<string, unknown>) => void;
  /** Log with a specific level */
  log: (level: LogLevel, message: string, ctx?: Record<string, unknown>) => void;
}

/**
 * Create a tagged logger instance.
 *
 * @param tag - Short identifier shown in brackets, e.g. 'APIRoute', 'Surface'
 */
export function createLogger(tag: string): Logger {
  const prefix = `[${tag}]`;

  const log = (level: LogLevel, message: string, ctx?: Record<string, unknown>) => {
    if (!shouldLog(level)) return;

    const contextStr = formatContext(ctx);
    const formatted = `${prefix} ${message}${contextStr}`;

    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  };

  return {
    debug: (msg, ctx?) => log('debug', msg, ctx),
    info: (msg, ctx?) => log('info', msg, ctx),
    warn: (msg, ctx?) => log('warn', msg, ctx),
    error: (msg, ctx?) => log('error', msg, ctx),
    log,
  };
}

/** Utility: truncate a value for safe logging */
export { truncate };
