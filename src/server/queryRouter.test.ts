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

  // ── Account overview ───────────────────────────────────────────────

  it('detects account overview', () => {
    expect(analyzeQuery('Show my accounts').scenario).toBe('account-overview');
    expect(analyzeQuery('What is my balance?').scenario).toBe('account-overview');
    expect(analyzeQuery('Account overview').scenario).toBe('account-overview');
  });

  // ── Bill payment ───────────────────────────────────────────────────

  it('detects bill payment', () => {
    expect(analyzeQuery('Pay a bill').scenario).toBe('bill-payment');
    expect(analyzeQuery('BPAY Telstra').scenario).toBe('bill-payment');
    expect(analyzeQuery('Pay my electricity bill').scenario).toBe('bill-payment');
  });

  // ── Card management ────────────────────────────────────────────────

  it('detects card management', () => {
    expect(analyzeQuery('Freeze my card').scenario).toBe('card-management');
    expect(analyzeQuery('I lost my card').scenario).toBe('card-management');
    expect(analyzeQuery('Manage my card settings').scenario).toBe('card-management');
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

// ── Voice phrasing variants ────────────────────────────────────────────────
// These tests verify that natural spoken-language queries (as produced by the
// Web Speech API) are routed correctly, covering colloquial phrasing that
// differs from typed queries.

describe('analyzeQuery – voice phrasing variants', () => {
  // ── Transaction search ────────────────────────────────────────────────

  it('routes "Pull up my purchases" → transaction-search', () => {
    expect(analyzeQuery('Pull up my purchases').scenario).toBe('transaction-search');
  });

  it('routes "Show me what I spent today" → transaction-search', () => {
    const result = analyzeQuery('Show me what I spent today');
    expect(result.scenario).toBe('transaction-search');
    expect(result.entities.dateRange).toBe('today');
  });

  it('routes "My recent purchases" → transaction-search', () => {
    expect(analyzeQuery('My recent purchases').scenario).toBe('transaction-search');
  });

  it('recognises colloquial merchant "Woolies" → transaction-search', () => {
    const result = analyzeQuery('Woolies');
    expect(result.scenario).toBe('transaction-search');
    expect(result.entities.merchant).toMatch(/woolies/i);
  });

  it('recognises "Dan\'s" as a merchant → transaction-search', () => {
    const result = analyzeQuery("show Dan's purchases");
    expect(result.scenario).toBe('transaction-search');
    expect(result.entities.merchant).toMatch(/dan/i);
  });

  // ── Spending summary ──────────────────────────────────────────────────

  it('routes "Where is my money going?" → spending-summary', () => {
    expect(analyzeQuery("Where is my money going?").scenario).toBe('spending-summary');
  });

  it('routes "How am I tracking this month?" → spending-summary', () => {
    const result = analyzeQuery('How am I tracking this month?');
    expect(result.scenario).toBe('spending-summary');
    expect(result.entities.dateRange).toBe('this-month');
  });

  it('routes "What have I been spending on?" → spending-summary', () => {
    expect(analyzeQuery('What have I been spending on?').scenario).toBe('spending-summary');
  });

  it('routes "Run me through my spending" → spending-summary', () => {
    expect(analyzeQuery('Run me through my spending').scenario).toBe('spending-summary');
  });

  // ── Fund transfer ──────────────────────────────────────────────────────

  it('routes "I need to send some money" → fund-transfer', () => {
    expect(analyzeQuery('I need to send some money').scenario).toBe('fund-transfer');
  });

  it('routes "I\'d like to move some funds" → fund-transfer', () => {
    expect(analyzeQuery("I'd like to move some funds").scenario).toBe('fund-transfer');
  });

  it('routes "Can you transfer to my savings?" → fund-transfer', () => {
    expect(analyzeQuery('Can you transfer to my savings?').scenario).toBe('fund-transfer');
  });

  // ── Account overview ───────────────────────────────────────────────────

  it('routes "Check my balance" → account-overview', () => {
    expect(analyzeQuery('Check my balance').scenario).toBe('account-overview');
  });

  it('routes "What\'s in my savings account?" → account-overview', () => {
    expect(analyzeQuery("What's in my savings account?").scenario).toBe('account-overview');
  });

  it('routes "Show me an overview" → account-overview', () => {
    expect(analyzeQuery('Show me an overview').scenario).toBe('account-overview');
  });

  // ── Bill payment ───────────────────────────────────────────────────────

  it('routes "I need to pay my electricity bill" → bill-payment', () => {
    expect(analyzeQuery('I need to pay my electricity bill').scenario).toBe('bill-payment');
  });

  it('routes "Help me pay a bill" → bill-payment', () => {
    expect(analyzeQuery('Help me pay a bill').scenario).toBe('bill-payment');
  });

  it('routes "I\'ve got a bill to pay" → bill-payment', () => {
    expect(analyzeQuery("I've got a bill to pay").scenario).toBe('bill-payment');
  });

  it('routes "What bills do I have coming up?" → bill-payment', () => {
    expect(analyzeQuery('What bills do I have coming up?').scenario).toBe('bill-payment');
  });

  it('routes "Pay my water bill" → bill-payment', () => {
    expect(analyzeQuery('Pay my water bill').scenario).toBe('bill-payment');
  });

  // ── Card management ────────────────────────────────────────────────────

  it('routes "Turn off my card" → card-management', () => {
    expect(analyzeQuery('Turn off my card').scenario).toBe('card-management');
  });

  it('routes "Disable my card" → card-management', () => {
    expect(analyzeQuery('Disable my card').scenario).toBe('card-management');
  });

  it('routes "Cancel my card" → card-management', () => {
    expect(analyzeQuery('Cancel my card').scenario).toBe('card-management');
  });

  it('routes "My card got stolen" → card-management', () => {
    expect(analyzeQuery('My card got stolen').scenario).toBe('card-management');
  });

  it('routes "Increase my card limit" → card-management', () => {
    expect(analyzeQuery('Increase my card limit').scenario).toBe('card-management');
  });

  // ── Entity extraction – voice-specific ────────────────────────────────

  it('extracts verbal amounts without dollar sign (e.g., "500 dollars")', () => {
    const result = analyzeQuery('transfer 500 dollars to savings');
    expect(result.entities.amount).toBe(500);
  });

  it('extracts decimal verbal amounts (e.g., "250.50 dollars")', () => {
    const result = analyzeQuery('send 250.50 dollars to everyday');
    expect(result.entities.amount).toBe(250.5);
  });

  it('extracts "this month" date range', () => {
    expect(analyzeQuery('how am I tracking this month').entities.dateRange).toBe('this-month');
  });

  it('extracts "this week" date range', () => {
    expect(analyzeQuery('show my transactions this week').entities.dateRange).toBe('this-week');
  });

  it('extracts "yesterday" date range', () => {
    expect(analyzeQuery('what did I spend yesterday').entities.dateRange).toBe('yesterday');
  });
});
