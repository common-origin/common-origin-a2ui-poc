# Plan for A2UI-Powered Banking Experience Demo

This plan outlines how to evolve the existing proof-of-concept (POC) into a polished A2UI demo using the Common Origin Design System. The goal is to showcase an AI agent generating dynamic UI for enterprise banking tasks, all styled with a consistent, accessible design system.

## Objectives and Key Requirements

1. **Live Hosted Demo**: Deploy to Vercel with stable URL for demonstrations
2. **Agent-Driven UI (A2UI)**: AI agent generates UI components on the fly instead of plain text
3. **Common Design System Integration**: All UI through Common Origin Design System components
4. **Multiple Banking Scenarios**: Transaction search, expense summary, fund transfer, etc.
5. **Live User Input**: Natural language queries in real-time
6. **Realistic Data & Responses**: Plausible banking data (mocked but authentic)
7. **Polished UX**: Interview-ready, responsive, accessible, enterprise-quality

## Current POC Status

### ✅ Implemented
- Single scenario: Transaction Finder with search interface
- Streaming UI generation (5-phase incremental rendering)
- 12 catalog components (Text, Button, TextField, Chip variants, Card, List/ListItem, Stack, Alert, Divider)
- Security layer: Catalog mapping prevents arbitrary code execution
- Data binding: Literal strings and data model paths
- Basic surface rendering with state management
- Demo controls and visual polish

### ❌ Missing Features
- **Live user input**: No interactive search, filters don't toggle, no action routing
- **Multiple scenarios**: Only Transaction Finder exists
- **Real agent integration**: Mock-only, no streaming endpoint
- **Responsive layout**: Desktop-focused, no mobile optimization
- **Error handling**: No boundaries, retry logic, or validation feedback
- **Additional components**: Select/Dropdown, NumberField, Modal, Chart, etc.

## Implementation Roadmap

### Phase 1: Foundation & Deployment (Days 1-2)

1. **Deploy base POC to Vercel**
   - Connect GitHub repo to Vercel
   - Set up environment variables for API keys
   - Verify live deployment works

2. **Add environment variable support**
   - Create `.env.local` template
   - Add `NEXT_PUBLIC_GEMINI_API_KEY` placeholder
   - Document in README

3. **Implement action routing architecture**
   - Fix `onAction` callback system
   - Enable two-way communication (client actions → surface state updates)
   - Wire up TextField onChange, Button onClick, Chip interactions

4. **Add error boundaries**
   - Wrap `A2UISurface` with React error boundary
   - Display fallback UI on component errors
   - Log errors for debugging

### Phase 2: Live User Input (Days 2-3)

1. **Build chat-style input interface**
   - Replace fixed buttons with TextField + submit button
   - Use Common Origin DS TextField component
   - Add input validation and character limits

2. **Wire up TextField interactions**
   - Connect rendered textfields to update data model
   - Implement action callbacks for form inputs
   - Test data binding updates

3. **Add loading states**
   - Create Skeleton component for catalog
   - Show spinner/shimmer while "agent thinking"
   - Disable input during processing

4. **Implement query routing**
   - Parse user input to determine scenario
   - Route to appropriate mock agent function
   - Handle ambiguous queries gracefully

### Phase 3: Expand Component Catalog (Days 3-4)

1. **Add form components**
   - `Select` - Account dropdown selector
   - `NumberField` - Currency input with formatting
   - `RadioGroup` - Transfer type selection
   - Update `types.ts` and `catalog.ts`

2. **Add feedback components**
   - `Modal` - Confirmation dialogs
   - `Toast` - Success/error notifications
   - `Progress` - Multi-step indicators
   - Map to Common Origin DS equivalents

3. **Add data visualization**
   - Simple `BarChart` or `PieChart` wrapper
   - Use recharts or nivo with DS theming
   - Create custom component if needed
   - Keep styling consistent with DS

4. **Register in catalog**
   - Define TypeScript interfaces in `types.ts`
   - Add rendering logic in `catalog.ts`
   - Update `isValidComponent()` validation
   - Document each component's props

### Phase 4: Implement Banking Scenarios (Days 4-6)

#### Scenario 1: Transaction Search (enhance existing)
- Accept user queries: "Show Starbucks transactions", "Find all transactions over $50"
- Filter by merchant, date, amount in mock agent logic
- Dynamic result rendering based on query
- Empty state when no results
- Test variations: date ranges, categories, amounts

#### Scenario 2: Spending Summary
- Mock agent generates category breakdown UI
- Components: Header, date range selector, BarChart, summary cards
- Support queries: "How much did I spend last month?", "Show spending by category"
- Display: Total, per-category breakdown, trend indicator
- Add percentage comparisons

#### Scenario 3: Fund Transfer
- Multi-step form flow:
  1. Select from/to accounts (Select components)
  2. Enter amount (NumberField with currency formatting)
  3. Add memo/note (TextField optional)
  4. Review and confirm (Modal with summary)
- Validation: Sufficient funds, valid amount, required fields
- Success state: Confirmation Modal with transaction ID
- Error handling: Display validation errors via Alert

#### Testing Each Scenario
- Write test queries for each
- Verify UI renders correctly
- Check responsive layout
- Test error cases
- Validate accessibility

### Phase 5: Real Agent Integration (Days 6-8)

1. **Install Gemini SDK**
   ```bash
   pnpm add @google/generative-ai
   ```

2. **Create `/app/api/agent/route.ts` endpoint**
   - Next.js API route with streaming support
   - Use Server-Sent Events (SSE) for streaming
   - Handle errors and timeouts
   - Rate limiting considerations

3. **Build system prompt**
   - Include catalog documentation
   - Provide example A2UI messages for each scenario
   - Specify JSONL output format
   - Add component prop schemas
   - Include banking domain context

4. **Implement streaming parser**
   - Parse JSONL lines from agent response
   - Forward valid A2UI messages to `A2UISurface`
   - Handle incomplete/malformed JSON
   - Buffer partial messages if needed

5. **Add fallback mode**
   - Toggle between mock/real agent
   - Environment variable or UI switch
   - Pre-cached responses for demo reliability
   - Graceful degradation if API fails

### Phase 6: Polish & UX (Days 8-10)

1. **Responsive layout**
   - Mobile breakpoints (320px, 768px, 1024px)
   - Touch-friendly tap targets (44px minimum)
   - Reflow components on small screens
   - Test on actual devices

2. **Smooth animations**
   - Fade-in for new components
   - Transition between scenarios
   - Loading spinner with subtle rotation
   - Avoid jarring layout shifts

3. **Example prompts**
   - Quick-action buttons:
     - "Find my Starbucks transactions"
     - "Show me spending summary"
     - "Transfer $100 to savings"
   - Display as chips or suggestion pills
   - Auto-populate input on click

4. **Accessibility audit**
   - Keyboard navigation (tab order)
   - ARIA labels on interactive elements
   - Focus indicators visible
   - Color contrast meets WCAG 2.2 AA
   - Screen reader testing with VoiceOver/NVDA

5. **Visual refinement**
   - Consistent spacing (use DS tokens)
   - Typography hierarchy (h1/h2/body scales)
   - Apply Common Origin DS theming
   - Color palette for banking context (blues/grays)
   - Icon usage (if DS includes icons)

### Phase 7: Testing & Demo Prep (Days 10-11)

1. **Cross-browser testing**
   - Chrome, Firefox, Safari (latest versions)
   - Desktop and mobile viewports
   - Test all interactions in each browser
   - Document any browser-specific issues

2. **Performance optimization**
   - Memoize component renders with `React.memo`
   - Cache common agent queries
   - Lazy load heavy components (charts)
   - Monitor bundle size
   - Test on slower connections

3. **Rehearse demo flow**
   - Script 3-4 minute walkthrough
   - Hit all three scenarios
   - Practice talking points:
     - "Agent generates UI using design system"
     - "Maintains consistency and accessibility"
     - "Secure catalog prevents code injection"
   - Time the demo

4. **Backup plan**
   - Pre-cached agent responses
   - Toggle to mock mode if live agent fails
   - Have screenshots as absolute fallback
   - Test backup mode before interview

## Demo Narrative (Talking Points)

### Introduction (30 seconds)
"This is a proof-of-concept showing how AI agents can generate user interfaces dynamically while maintaining design system consistency and security. The agent responds to natural language queries by outputting A2UI messages—a declarative JSON format—which are then rendered through our Common Origin Design System."

### Scenario Walkthrough (2 minutes)

**Transaction Search:**
"Let me ask the agent to find a transaction. [Type query] Notice how it generates a search interface with filters, all using components from our design system. The UI appears progressively as the agent streams its response."

**Spending Summary:**
"Now I'll ask for a spending summary. [Type query] The agent generates a completely different interface—charts, category breakdowns—but still using our design system components, so it feels cohesive."

**Fund Transfer:**
"Finally, let's see it handle an action. [Type transfer query] The agent creates a multi-step form with validation, dropdowns, and confirmation—all the pieces needed for a real transaction flow."

### Technical Points (1 minute)
- "The security model is key: the agent can only reference components from our approved catalog, preventing code injection attacks."
- "Everything is accessible by default because we're using design system components built to WCAG 2.2 standards."
- "This pattern scales: as we add components to the design system, the agent can use them without code changes."

### Future Vision (30 seconds)
"This approach enables personalized UIs at scale—the same agent could generate different interfaces for retail vs. business banking, or adapt to user preferences, all while maintaining brand consistency."

## Further Considerations

### Component Streaming (Optional Enhancement)
- Show progressive UI rendering (skeleton → populated)
- Visually impressive but adds complexity
- Only implement if time permits and doesn't destabilize demo

### Conversation Context (Future)
- Multi-turn: "Show spending" → "How about last month?"
- Requires session state management
- Agent needs to remember previous queries
- Consider for post-interview iteration

### Chart Library Decision
- **Recharts**: Feature-rich, heavier bundle, widely used
- **Nivo**: Modern, themeable, good docs
- **Custom SVG**: Lightest, full control, more work
- **Recommendation**: Start with Recharts, optimize later

### Security Narrative for Interview
- Emphasize catalog-only rendering
- Contrast with traditional agent UIs (plain text or risky HTML)
- Explain how design teams maintain control
- Discuss role of Principal Designer in bridging design and AI

## Success Metrics

### Before Interview
- [ ] All three scenarios working end-to-end
- [ ] Deployed to Vercel with stable URL
- [ ] Responsive on mobile and desktop
- [ ] No console errors in production build
- [ ] Accessibility audit passing
- [ ] Demo rehearsed and timed

### During Demo
- [ ] All scenarios demonstrate successfully
- [ ] Clear articulation of A2UI benefits
- [ ] Questions about design system integration handled confidently
- [ ] Backup mode ready if needed

### After Interview
- [ ] Feedback collected on demo
- [ ] Next iteration priorities identified
- [ ] Code documented for future team handoff

## Resources

- [A2UI Specification](https://a2ui.org)
- [A2UI Blog Post](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [Common Origin Design System](https://github.com/common-origin/common-origin-design-system)
- [Google A2UI Repo](https://github.com/google/a2ui)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

## Timeline Summary

| Phase | Duration | Priority |
|-------|----------|----------|
| 1. Foundation & Deployment | 1-2 days | Critical |
| 2. Live User Input | 1-2 days | Critical |
| 3. Expand Catalog | 1-2 days | High |
| 4. Banking Scenarios | 2-3 days | Critical |
| 5. Real Agent Integration | 2-3 days | High |
| 6. Polish & UX | 2-3 days | High |
| 7. Testing & Demo Prep | 1-2 days | Critical |

**Total Estimated Time**: 10-17 days

**Minimum Viable Demo** (if time-constrained):
- Phases 1, 2, 4, 6, 7 (skip real agent, use enhanced mock)
- **Time**: 7-10 days

---

*This plan is a living document. Update as implementation progresses and priorities shift.*
