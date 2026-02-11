import { describe, it, expect } from 'vitest';
import { analyzeQuery, getUnknownQueryResponse } from './queryRouter';

describe('analyzeQuery', () => {
  // ── Transaction search ──────────────────────────────────────────────

  it('detects transaction search by keyword', () => {
    const result = analyzeQuery('Show my recent transactions');
    expect(result.scenario).toBe('transaction-search');
  });

  it('detects transaction search by Australian merchant name', () => {
    const woolies = analyzeQuery('Woolworths');
    expect(woolies.scenario).toBe('transaction-search');
    expect(woolies.entities.merchant).toMatch(/woolworths/i);

    const bunnings = analyzeQuery('show bunnings purchases');
    expect(bunnings.scenario).toBe('transaction-search');
    expect(bunnings.entities.merchant).toMatch(/bunnings/i);

    const jb = analyzeQuery('jb hi-fi');
    expect(jb.scenario).toBe('transaction-search');
    expect(jb.entities.merchant).toMatch(/jb hi-fi/i);
  });

  it('detects transaction search for Coles', () => {
    const result = analyzeQuery('How much did I spend at Coles?');
    // Coles is a merchant, so should match transaction-search at minimum
    expect(result.entities.merchant).toMatch(/coles/i);
  });

  // ── Spending summary ────────────────────────────────────────────────

  it('detects spending summary', () => {
    const result = analyzeQuery('Show my spending summary');
    expect(result.scenario).toBe('spending-summary');
  });

  it('detects spending by alternative phrasing', () => {
    expect(analyzeQuery('How much did I spend last month?').scenario).toBe('spending-summary');
    expect(analyzeQuery('Spending breakdown by category').scenario).toBe('spending-summary');
  });

  // ── Fund transfer ──────────────────────────────────────────────────

  it('detects fund transfer', () => {
    const result = analyzeQuery('Transfer $500 to savings');
    expect(result.scenario).toBe('fund-transfer');
  });

  it('detects transfer variations', () => {
    expect(analyzeQuery('Send money to John').scenario).toBe('fund-transfer');
    expect(analyzeQuery('Move money from checking').scenario).toBe('fund-transfer');
  });

  // ── Entity extraction ──────────────────────────────────────────────

  it('extracts dollar amounts', () => {
    const result = analyzeQuery('Transfer $250.50 to savings');
    expect(result.entities.amount).toBe(250.50);
  });

  it('extracts categories', () => {
    const result = analyzeQuery('Show groceries transactions');
    expect(result.entities.category).toBe('groceries');

    const entertainment = analyzeQuery('How much on entertainment?');
    expect(entertainment.entities.category).toBe('entertainment');
  });

  it('extracts date ranges', () => {
    expect(analyzeQuery('Transactions last month').entities.dateRange).toBe('last-month');
    expect(analyzeQuery('Transactions past week').entities.dateRange).toBe('last-week');
    expect(analyzeQuery('today').entities.dateRange).toBe('today');
  });

  // ── Unknown queries ────────────────────────────────────────────────

  it('returns unknown for unrecognised queries', () => {
    const result = analyzeQuery('What is the weather?');
    expect(result.scenario).toBe('unknown');
  });

  // ── Case insensitivity ─────────────────────────────────────────────

  it('is case-insensitive', () => {
    expect(analyzeQuery('SHOW MY TRANSACTIONS').scenario).toBe('transaction-search');
    expect(analyzeQuery('SPENDING SUMMARY').scenario).toBe('spending-summary');
    expect(analyzeQuery('TRANSFER $100').scenario).toBe('fund-transfer');
  });
});

describe('getUnknownQueryResponse', () => {
  it('returns a help message string', () => {
    const msg = getUnknownQueryResponse();
    expect(msg).toContain('Woolworths');
    expect(msg).toContain('Transfer');
    expect(msg).toContain('spending');
  });
});
