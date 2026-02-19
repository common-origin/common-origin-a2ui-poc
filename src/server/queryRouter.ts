/**
 * Query Router for A2UI Mock Agent
 * 
 * Analyzes user queries and routes them to appropriate UI generation scenarios.
 * This enables a chat-like interface where users can ask for different banking tasks.
 */

export type ScenarioType = 'transaction-search' | 'spending-summary' | 'fund-transfer' | 'account-overview' | 'bill-payment' | 'card-management' | 'unknown';

export interface QueryAnalysis {
  scenario: ScenarioType;
  intent: string;
  entities: {
    merchant?: string;
    category?: string;
    amount?: number;
    dateRange?: string;
    accountType?: string;
  };
}

/**
 * Analyze a user query and determine the scenario
 */
export function analyzeQuery(query: string): QueryAnalysis {
  const lowerQuery = query.toLowerCase();

  // Transaction search patterns
  const transactionPatterns = [
    /find.*transaction/i,
    /show.*transaction/i,
    /search.*transaction/i,
    /recent.*transaction/i,
    /list.*transaction/i,
    /transaction.*from/i,
    /\b(woolworths|coles|bunnings|jb hi-?fi|kmart|caltex|netflix|the coffee club|aldi|officeworks)\b/i,
  ];

  // Spending summary patterns
  const spendingPatterns = [
    /spending.*summary/i,
    /how much.*spend/i,
    /spending.*breakdown/i,
    /show.*spending/i,
    /spending.*by.*category/i,
    /spending.*report/i,
    /spending.*analytics/i,
  ];

  // Fund transfer patterns
  const transferPatterns = [
    /transfer/i,  // Match any mention of "transfer"
    /send.*money/i,
    /move.*money/i,
    /move.*fund/i,
    /pay.*from/i,
    /transfer.*\$\d+/i,
    /send.*\$\d+/i,
  ];

  // Account overview patterns
  const accountPatterns = [
    /show.*account/i,
    /my.*account/i,
    /account.*balance/i,
    /account.*overview/i,
    /what.*balance/i,
    /how much.*have/i,
    /dashboard/i,
    /account.*summary/i,
  ];

  // Bill payment patterns
  const billPatterns = [
    /pay.*bill/i,
    /bpay/i,
    /bill.*pay/i,
    /pay.*telstra/i,
    /pay.*agl/i,
    /pay.*electricity/i,
    /pay.*gas/i,
    /pay.*internet/i,
    /upcoming.*bill/i,
    /due.*bill/i,
    /scheduled.*payment/i,
  ];

  // Card management patterns
  const cardPatterns = [
    /freeze.*card/i,
    /unfreeze.*card/i,
    /block.*card/i,
    /lock.*card/i,
    /manage.*card/i,
    /card.*limit/i,
    /lost.*card/i,
    /stolen.*card/i,
    /card.*detail/i,
    /card.*setting/i,
    /replace.*card/i,
  ];

  // Check for empty state keywords
  const isEmptyState = /empty.*state|no.*result|nothing|clear/i.test(lowerQuery);

  // Determine scenario
  let scenario: ScenarioType = 'unknown';
  let intent = '';

  if (cardPatterns.some(pattern => pattern.test(lowerQuery))) {
    scenario = 'card-management';
    intent = 'User wants to manage their card';
  } else if (billPatterns.some(pattern => pattern.test(lowerQuery))) {
    scenario = 'bill-payment';
    intent = 'User wants to pay a bill';
  } else if (transferPatterns.some(pattern => pattern.test(lowerQuery))) {
    scenario = 'fund-transfer';
    intent = 'User wants to transfer money between accounts';
  } else if (spendingPatterns.some(pattern => pattern.test(lowerQuery))) {
    scenario = 'spending-summary';
    intent = 'User wants to see spending summary';
  } else if (transactionPatterns.some(pattern => pattern.test(lowerQuery)) || isEmptyState) {
    scenario = 'transaction-search';
    intent = isEmptyState ? 'User wants to see empty state' : 'User wants to search transactions';
  } else if (accountPatterns.some(pattern => pattern.test(lowerQuery))) {
    scenario = 'account-overview';
    intent = 'User wants to see their accounts';
  }

  // Extract entities
  const entities: QueryAnalysis['entities'] = {};

  // Extract merchant name (Australian retailers)
  const merchantMatch = lowerQuery.match(/\b(woolworths|coles|bunnings|jb hi-?fi|kmart|caltex|netflix|the coffee club|aldi|officeworks|big w|myer|dan murphy'?s|ampol)\b/i);
  if (merchantMatch) {
    entities.merchant = merchantMatch[1];
  }

  // Extract category
  const categoryMatch = lowerQuery.match(/\b(groceries|food|entertainment|transport(?:ation)?|shopping|dining|bills|utilities|health)\b/i);
  if (categoryMatch) {
    entities.category = categoryMatch[1];
  }

  // Extract amount
  const amountMatch = lowerQuery.match(/\$(\d+(?:\.\d{2})?)/);
  if (amountMatch) {
    entities.amount = parseFloat(amountMatch[1]);
  }

  // Extract date range
  if (/last.*month|past.*month/i.test(lowerQuery)) {
    entities.dateRange = 'last-month';
  } else if (/last.*week|past.*week/i.test(lowerQuery)) {
    entities.dateRange = 'last-week';
  } else if (/last.*30.*days|past.*30.*days/i.test(lowerQuery)) {
    entities.dateRange = 'last-30-days';
  } else if (/today/i.test(lowerQuery)) {
    entities.dateRange = 'today';
  }

  return {
    scenario,
    intent,
    entities,
  };
}

/**
 * Get a user-friendly response for unknown queries
 */
export function getUnknownQueryResponse(): string {
  return `I can help you with:
• Finding transactions (e.g., "Show my Woolworths transactions")
• Viewing spending summaries (e.g., "How much did I spend this month?")
• Transferring money (e.g., "Transfer $200 to savings")
• Viewing your accounts (e.g., "Show my accounts")
• Paying bills (e.g., "Pay a bill")
• Managing your cards (e.g., "Freeze my card")

What would you like to do?`;
}
