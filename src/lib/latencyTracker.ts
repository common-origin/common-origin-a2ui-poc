/**
 * Pipeline Latency Tracker — Phase 6.5
 *
 * Lightweight client-side instrumentation for the A2UI generation pipeline.
 * Measures time between named stages without any external dependencies.
 *
 * Pipeline stages (in order):
 *   submit      — User submits a query (text or voice)
 *   apiStart    — HTTP request to /api/agent begins
 *   firstMsg    — First valid A2UI message received by the client
 *   firstRender — Surface renders its first visible component
 *   complete    — Agent stream closes
 *
 * Usage:
 *   import { pipelineTimer } from '@/src/lib/latencyTracker';
 *
 *   pipelineTimer.mark('submit');
 *   // ... later ...
 *   pipelineTimer.mark('apiStart');
 *   pipelineTimer.mark('firstMsg');
 *   console.log(pipelineTimer.report());
 *   // → { submit→apiStart: 12ms, apiStart→firstMsg: 380ms, ... }
 */

export type PipelineStage =
  | 'submit'       // User submits query
  | 'apiStart'     // Fetch begins
  | 'firstMsg'     // First A2UI msg dispatched to surface
  | 'firstRender'  // Surface paints first component
  | 'complete';    // Stream done / agent resolved

export interface LatencyReport {
  /** Raw timestamps keyed by stage (ms since Unix epoch). */
  marks: Partial<Record<PipelineStage, number>>;
  /**
   * Human-readable durations between consecutive marked stages.
   * e.g. { 'submit→apiStart': 8, 'apiStart→firstMsg': 422 }
   */
  durations: Record<string, number>;
  /** Total elapsed from first mark to last mark (ms). */
  totalMs: number;
  /** ISO timestamp of the `submit` mark, or the first mark taken. */
  startedAt: string;
}

const STAGE_ORDER: PipelineStage[] = [
  'submit',
  'apiStart',
  'firstMsg',
  'firstRender',
  'complete',
];

/**
 * Singleton pipeline timer. Re-used across requests; call `reset()` at the
 * start of each new user query.
 */
export class PipelineTimer {
  private marks: Partial<Record<PipelineStage, number>> = {};

  /** Record the current timestamp for a named pipeline stage. */
  mark(stage: PipelineStage): void {
    // Don't overwrite — first win keeps the most accurate time.
    if (this.marks[stage] !== undefined) return;
    this.marks[stage] = Date.now();
  }

  /**
   * Time elapsed between two stages (ms).
   * Returns `null` if either stage hasn't been marked yet.
   */
  elapsed(from: PipelineStage, to: PipelineStage): number | null {
    const t0 = this.marks[from];
    const t1 = this.marks[to];
    if (t0 === undefined || t1 === undefined) return null;
    return t1 - t0;
  }

  /** Generate a summary report of all measured durations. */
  report(): LatencyReport {
    const marks = { ...this.marks };
    const durations: Record<string, number> = {};

    const markedStages = STAGE_ORDER.filter((s) => marks[s] !== undefined);

    for (let i = 1; i < markedStages.length; i++) {
      const from = markedStages[i - 1];
      const to = markedStages[i];
      const delta = marks[to]! - marks[from]!;
      durations[`${from}→${to}`] = delta;
    }

    const timestamps = Object.values(marks);
    const totalMs =
      timestamps.length >= 2
        ? Math.max(...timestamps) - Math.min(...timestamps)
        : 0;

    const firstMark = markedStages[0];
    const startedAt = firstMark
      ? new Date(marks[firstMark]!).toISOString()
      : new Date().toISOString();

    return { marks, durations, totalMs, startedAt };
  }

  /** Log the report to the console (dev only). */
  logReport(label = 'Pipeline'): void {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return;
    const r = this.report();
    const parts = Object.entries(r.durations).map(([k, v]) => `${k}: ${v}ms`);
    if (parts.length > 0) {
      console.info(`[${label}] ${parts.join(' | ')} | total: ${r.totalMs}ms`);
    }
  }

  /** Reset all marks — call at the start of each new query. */
  reset(): void {
    this.marks = {};
  }

  /** Snapshot of current marks (for testing). */
  getMarks(): Partial<Record<PipelineStage, number>> {
    return { ...this.marks };
  }
}

/** App-wide singleton. Import this in page.tsx, agentClient.ts, and A2UISurface.tsx. */
export const pipelineTimer = new PipelineTimer();
