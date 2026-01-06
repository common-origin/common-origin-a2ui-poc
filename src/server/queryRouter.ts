/**
 * Query Router for A2UI Mock Agent
 * 
 * Analyzes user queries and routes them to appropriate UI generation scenarios.
 * This enables a chat-like interface where users can ask for different banking tasks.
 */

export type ScenarioType = 'transaction-search' | 'spending-summary' | 'fund-transfer' | 'unknown';

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
    /\b(starbucks|amazon|netflix|whole foods|shell)\b/i,
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

  // Check for empty state keywords
  const isEmptyState = /empty.*state|no.*result|nothing|clear/i.test(lowerQuery);

  // Determine scenario
  let scenario: ScenarioType = 'unknown';
  let intent = '';

  if (transferPatterns.some(pattern => pattern.test(lowerQuery))) {
    scenario = 'fund-transfer';
    intent = 'User wants to transfer money between accounts';
  } else if (spendingPatterns.some(pattern => pattern.test(lowerQuery))) {
    scenario = 'spending-summary';
    intent = 'User wants to see spending summary';
  } else if (transactionPatterns.some(pattern => pattern.test(lowerQuery)) || isEmptyState) {
    scenario = 'transaction-search';
    intent = isEmptyState ? 'User wants to see empty state' : 'User wants to search transactions';
  }

  // Extract entities
  const entities: QueryAnalysis['entities'] = {};

  // Extract merchant name
  const merchantMatch = lowerQuery.match(/\b(starbucks|amazon|netflix|whole foods|shell|target|walmart|costco)\b/i);
  if (merchantMatch) {
    entities.merchant = merchantMatch[1];
  }

  // Extract category
  const categoryMatch = lowerQuery.match(/\b(groceries|food|entertainment|transportation|shopping|dining)\b/i);
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
• Finding transactions (e.g., "Show my Starbucks transactions")
• Viewing spending summaries (e.g., "How much did I spend last month?")
• Transferring money (e.g., "Transfer $100 to savings")

What would you like to do?`;
}
