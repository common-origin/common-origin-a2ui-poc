import { describe, expect, it } from 'vitest';
import { getAccountOverviewPrompt } from './accountOverview';
import { getBillPaymentPrompt } from './billPayment';
import { getFundTransferPrompt } from './fundTransfer';
import { getGeneralPrompt } from './general';
import { getSpendingSummaryPrompt } from './spendingSummary';
import { getCardManagementPrompt } from './cardManagement';

describe('Prompt consistency', () => {
  const prompts = [
    getAccountOverviewPrompt(),
    getBillPaymentPrompt(),
    getFundTransferPrompt(),
    getGeneralPrompt(),
  ];

  it('does not use legacy accountType "transaction" in AccountCard examples', () => {
    for (const prompt of prompts) {
      expect(prompt).not.toContain('"accountType":"transaction"');
    }
  });

  it('uses Australian accountType "everyday" in AccountCard examples', () => {
    for (const prompt of prompts) {
      expect(prompt).toContain('"accountType":"everyday"');
    }
  });

  it('uses schema-valid MoneyDisplay size tokens in spending summary prompt', () => {
    const prompt = getSpendingSummaryPrompt();
    expect(prompt).toContain('"size":"small"|"medium"|"large"');
    expect(prompt).not.toContain('"size":"lg"|"md"|"sm"');
  });

  it('includes TransactionListItem definition and category drilldown example in spending summary prompt', () => {
    const prompt = getSpendingSummaryPrompt();
    expect(prompt).toContain('## TransactionListItem — Transaction display (clickable for drill-down)');
    expect(prompt).toContain('The user performed action "view_category_transactions"');
  });

  it('includes review and success examples for bill payment flow', () => {
    const prompt = getBillPaymentPrompt();
    expect(prompt).toContain('# EXAMPLE 3 — Review screen (after review_payment)');
    expect(prompt).toContain('# EXAMPLE 4 — Success screen (after confirm_payment)');
  });

  it('uses required bill payment action names across steps', () => {
    const prompt = getBillPaymentPrompt();
    expect(prompt).toContain('"name":"select_biller"');
    expect(prompt).toContain('"name":"review_payment"');
    expect(prompt).toContain('"name":"confirm_payment"');
    expect(prompt).toContain('"name":"back_to_form"');
  });

  it('includes unfreeze and lost-card recovery examples for card management', () => {
    const prompt = getCardManagementPrompt();
    expect(prompt).toContain('# EXAMPLE 4 — Unfreeze success');
    expect(prompt).toContain('# EXAMPLE 6 — Lost card reported success');
  });

  it('uses required card management action names across risk flows', () => {
    const prompt = getCardManagementPrompt();
    expect(prompt).toContain('"name":"freeze_card"');
    expect(prompt).toContain('"name":"confirm_freeze"');
    expect(prompt).toContain('"name":"unfreeze_card"');
    expect(prompt).toContain('"name":"report_lost"');
    expect(prompt).toContain('"name":"confirm_report_lost"');
  });
});
