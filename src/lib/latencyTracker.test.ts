/**
 * Latency Tracker Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PipelineTimer, pipelineTimer } from './latencyTracker';

describe('PipelineTimer', () => {
  let timer: PipelineTimer;

  beforeEach(() => {
    timer = new PipelineTimer();
  });

  // ── mark() ───────────────────────────────────────────────────────────────

  it('records a mark for a stage', () => {
    const before = Date.now();
    timer.mark('submit');
    const after = Date.now();

    const marks = timer.getMarks();
    expect(marks.submit).toBeGreaterThanOrEqual(before);
    expect(marks.submit).toBeLessThanOrEqual(after);
  });

  it('first-win: does not overwrite a stage that was already marked', async () => {
    timer.mark('submit');
    const first = timer.getMarks().submit!;

    await new Promise((r) => setTimeout(r, 5));
    timer.mark('submit'); // Should be ignored

    expect(timer.getMarks().submit).toBe(first);
  });

  it('records multiple stages independently', () => {
    timer.mark('submit');
    timer.mark('apiStart');
    timer.mark('firstMsg');
    const marks = timer.getMarks();
    expect(marks.submit).toBeDefined();
    expect(marks.apiStart).toBeDefined();
    expect(marks.firstMsg).toBeDefined();
  });

  // ── elapsed() ─────────────────────────────────────────────────────────────

  it('elapsed returns ms between two marked stages', async () => {
    timer.mark('submit');
    await new Promise((r) => setTimeout(r, 10));
    timer.mark('apiStart');

    const ms = timer.elapsed('submit', 'apiStart');
    expect(ms).toBeGreaterThanOrEqual(5);
    expect(ms).toBeLessThan(200);
  });

  it('elapsed returns null when a stage has not been marked', () => {
    timer.mark('submit');
    expect(timer.elapsed('submit', 'apiStart')).toBeNull();
    expect(timer.elapsed('apiStart', 'firstMsg')).toBeNull();
  });

  // ── report() ──────────────────────────────────────────────────────────────

  it('report includes durations for consecutive marked stages', async () => {
    timer.mark('submit');
    await new Promise((r) => setTimeout(r, 5));
    timer.mark('apiStart');
    await new Promise((r) => setTimeout(r, 5));
    timer.mark('firstMsg');

    const { durations } = timer.report();
    expect(durations['submit→apiStart']).toBeGreaterThanOrEqual(0);
    expect(durations['apiStart→firstMsg']).toBeGreaterThanOrEqual(0);
  });

  it('report totalMs is the span from first to last mark', async () => {
    timer.mark('submit');
    await new Promise((r) => setTimeout(r, 10));
    timer.mark('complete');

    const { totalMs } = timer.report();
    expect(totalMs).toBeGreaterThanOrEqual(5);
  });

  it('report totalMs is 0 when only one stage is marked', () => {
    timer.mark('submit');
    expect(timer.report().totalMs).toBe(0);
  });

  it('report startedAt is an ISO string', () => {
    timer.mark('submit');
    const { startedAt } = timer.report();
    expect(() => new Date(startedAt)).not.toThrow();
    expect(startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('report skips intermediate unmarked stages gracefully', async () => {
    // Mark submit and complete, skip apiStart/firstMsg/firstRender
    timer.mark('submit');
    await new Promise((r) => setTimeout(r, 5));
    timer.mark('complete');

    const { durations } = timer.report();
    // Should only have submit→complete (no gaps for unmarked stages)
    expect(Object.keys(durations)).toEqual(['submit→complete']);
  });

  // ── reset() ───────────────────────────────────────────────────────────────

  it('reset clears all marks', () => {
    timer.mark('submit');
    timer.mark('apiStart');
    timer.reset();
    expect(timer.getMarks()).toEqual({});
  });

  it('allows re-marking stages after reset', () => {
    timer.mark('submit');
    timer.reset();
    timer.mark('submit');
    expect(timer.getMarks().submit).toBeDefined();
  });

  // ── logReport ────────────────────────────────────────────────────────────

  it('logReport does not throw', () => {
    timer.mark('submit');
    timer.mark('complete');
    expect(() => timer.logReport('Test')).not.toThrow();
  });

  // ── Singleton ─────────────────────────────────────────────────────────────

  it('pipelineTimer singleton is a PipelineTimer instance', () => {
    expect(pipelineTimer).toBeInstanceOf(PipelineTimer);
  });
});
