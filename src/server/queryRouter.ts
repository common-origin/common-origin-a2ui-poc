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
    /\b(woolworths|woolies|coles|bunnings|jb hi-?fi|kmart|caltex|netflix|the coffee club|aldi|officeworks|big w|myer|dan murphy'?s|dan'?s|ampol)\b/i,
    // Voice-phrasing variants
    /show.*purchases?/i,
    /pull up.*(my )?(transactions?|purchases?)/i,
    /my.*purchases?/i,
    /what.*i.*(spent|bought)/i,
    /recent.*purchases?/i,
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
    // Voice-phrasing variants
    /where.*money.*going/i,
    /how am i tracking/i,
    /what.*spending on/i,
    /what.*i.*spending/i,
    /give.*breakdown.*spending/i,
    /run.*through.*spending/i,
    /what.*my.*spend/i,
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
    // Voice-phrasing variants
    /i need to send/i,
    /i('d| would) like to (send|transfer|move)/i,
    /can (you|i) (send|transfer|move).*to/i,
    /send.*to [a-z]/i,         // "send two hundred to savings"
    /move.*to (my )?(savings|everyday|checking)/i,
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
    // Voice-phrasing variants
    /check.*balance/i,
    /what.*in.*my.*(account|savings|everyday)/i,
    /how much.*in.*(my|savings|everyday|checking)/i,
    /show.*(me )?an? overview/i,
    /what.*my.*accounts?.*look/i,
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
    // Voice-phrasing variants
    /i need to pay my.*bill/i,
    /help me pay/i,
    /what bills.*(do i have|are due|are coming)/i,
    /i('ve| have) got a bill/i,
    /pay.*water.*bill/i,
    /pay.*phone.*bill/i,
    /pay.*rates/i,
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
    // Voice-phrasing variants
    /turn off.*card/i,
    /disable.*card/i,
    /cancel.*card/i,
    /card.*(got |is )?(lost|stolen|missing)/i,
    /my card (is|got|has been)/i,
    /increase.*card.*limit/i,
    /change.*card.*limit/i,
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

  // Extract merchant name (Australian retailers, including colloquial voice variants)
  const merchantMatch = lowerQuery.match(/\b(woolworths|woolies|coles|bunnings|jb hi-?fi|kmart|caltex|netflix|the coffee club|aldi|officeworks|big w|myer|dan murphy'?s|dan'?s|ampol)\b/i);
  if (merchantMatch) {
    entities.merchant = merchantMatch[1];
  }

  // Extract category
  const categoryMatch = lowerQuery.match(/\b(groceries|food|entertainment|transport(?:ation)?|shopping|dining|bills|utilities|health)\b/i);
  if (categoryMatch) {
    entities.category = categoryMatch[1];
  }

  // Extract amount — dollar-sign form ($250) or verbal form (250 dollars)
  const amountMatch = lowerQuery.match(/\$(\d+(?:\.\d{2})?)/) || lowerQuery.match(/(\d+(?:\.\d{2})?)\s+dollars?/);
  if (amountMatch) {
    entities.amount = parseFloat(amountMatch[1]);
  }

  // Extract date range (typed and voice-spoken variants)
  if (/last.*month|past.*month/i.test(lowerQuery)) {
    entities.dateRange = 'last-month';
  } else if (/this month/i.test(lowerQuery)) {
    entities.dateRange = 'this-month';
  } else if (/last.*week|past.*week/i.test(lowerQuery)) {
    entities.dateRange = 'last-week';
  } else if (/this week/i.test(lowerQuery)) {
    entities.dateRange = 'this-week';
  } else if (/last.*30.*days|past.*30.*days/i.test(lowerQuery)) {
    entities.dateRange = 'last-30-days';
  } else if (/\byesterday\b/i.test(lowerQuery)) {
    entities.dateRange = 'yesterday';
  } else if (/\btoday\b/i.test(lowerQuery)) {
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
