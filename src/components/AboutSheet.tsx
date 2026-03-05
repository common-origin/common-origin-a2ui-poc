'use client';

import React from 'react';
import { Sheet, Typography, Stack, Divider, Tag } from '@common-origin/design-system';

interface AboutSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const sheetPadding: React.CSSProperties = { padding: '2rem 1.5rem' };

export function AboutSheet({ isOpen, onClose }: AboutSheetProps) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      variant="sheet"
      width="640px"
      title="About this project"
      aria-label="About this project"
    >
      <div style={sheetPadding}>
      <Stack direction="column" gap="2xl">

        {/* Header */}
        <Stack direction="column" gap="sm">
          <Typography variant="h2">Agent to UI (A2UI)</Typography>
          <Typography variant="subtitle" color="subdued">
            Proof of concept using Common Origin Design System
          </Typography>
          <Stack direction="row" gap="sm">
            <Tag variant="default">Enterprise banking</Tag>
            <Tag variant="default">March 2026</Tag>
          </Stack>
        </Stack>

        <Divider size="small" />

        {/* What is this & how does it work */}
        <Stack direction="column" gap="md">
          <Typography variant="h4">What is this &amp; how it works</Typography>
          <Typography variant="body" color="subdued">
            This demo shows an AI agent responding to natural-language banking queries
            by composing real interface components on the fly — not plain text. You type
            a query, the agent returns a stream of declarative A2UI v0.9 messages, each
            validated against a JSON Schema, and the UI builds progressively in the
            response area.
          </Typography>
          <Typography variant="body" color="subdued">
            The pipeline has five stages: <strong>submit → API start → first message →
            first render → complete</strong>. Every stage is instrumented so latency is
            transparent end-to-end. Actions within generated UI (e.g. clicking a
            transaction row) feed context back to the agent, enabling multi-turn
            conversational flows without any custom routing code.
          </Typography>
        </Stack>

        <Divider size="small" />

        {/* Why agentic is the future of banking */}
        <Stack direction="column" gap="md">
          <Typography variant="h4">Why agentic is the future of banking</Typography>
          <Typography variant="body" color="subdued">
            Banking customers increasingly expect instant, personalised service across
            any channel. <strong>73% of banking customers</strong> say they would switch
            providers for a better digital experience (Salesforce State of the Connected
            Customer, 2023). Meanwhile, <strong>McKinsey estimates generative AI could
            add $200–340 billion</strong> in annual value to global banking — primarily
            through productivity gains and personalised customer journeys.
          </Typography>
          <Typography variant="body" color="subdued">
            Agentic interfaces remove the gap between intent and action. Instead of
            navigating menus to find a transaction, a customer describes what they need
            and the agent assembles the right screen instantly.{' '}
            <strong>Juniper Research projects AI-driven interactions will handle 90% of
            banking customer queries by 2030</strong>, reducing resolution time from
            minutes to seconds.
          </Typography>
          <Typography variant="body" color="subdued">
            For NAB, this pattern positions the design system as infrastructure for AI
            — not just a visual library, but a governed runtime that ensures every
            agent-generated surface automatically meets brand, accessibility, and
            compliance standards.
          </Typography>
        </Stack>

        <Divider size="small" />

        {/* Security */}
        <Stack direction="column" gap="md">
          <Typography variant="h4">Security for banking experiences</Typography>
          <Typography variant="body" color="subdued">
            In financial services, security is non-negotiable. This architecture enforces
            it structurally, not through policy alone.
          </Typography>
          <Stack direction="column" gap="sm">
            <Typography variant="body" color="subdued">
              <strong>Agents send data, not code.</strong> All agent output is declarative
              JSON describing which whitelisted component to render and what data to bind
              — there is no mechanism for an agent to inject executable code.
            </Typography>
            <Typography variant="body" color="subdued">
              <strong>Catalog whitelist.</strong> Only 28 pre-approved components from
              the Common Origin catalog can appear in a response. Any unknown component
              name is rejected at the validation layer before it reaches the renderer.
            </Typography>
            <Typography variant="body" color="subdued">
              <strong>Schema validation.</strong> Every message is checked against a
              formal JSON Schema before rendering. Malformed, oversized, or structurally
              invalid payloads are blocked and surfaced as errors — never silently passed
              through.
            </Typography>
            <Typography variant="body" color="subdued">
              <strong>URL sanitisation &amp; depth limits.</strong> Props containing
              URLs are sanitised to prevent open-redirect or phishing vectors. Component
              trees are capped in depth to prevent denial-of-service payloads.
            </Typography>
          </Stack>
        </Stack>

        <Divider size="small" />

        {/* Design system importance */}
        <Stack direction="column" gap="md">
          <Typography variant="h4">Why the design system matters here</Typography>
          <Typography variant="body" color="subdued">
            Without a design system, every agent-generated screen would need its own
            styling decisions, interaction patterns, and accessibility implementation.
            At scale — across thousands of queries a day — that is unmanageable.
          </Typography>
          <Stack direction="column" gap="sm">
            <Typography variant="body" color="subdued">
              <strong>Patterns as contracts.</strong> The catalog maps A2UI component
              names 1-to-1 to Common Origin components. The agent names a pattern; the
              design system delivers the correct, tested implementation every time.
            </Typography>
            <Typography variant="body" color="subdued">
              <strong>Consistency at zero marginal cost.</strong> Brand tokens, spacing
              scales, and typography hierarchies are inherited automatically. Every
              AI-generated screen looks native to the product without the agent
              specifying a single style rule.
            </Typography>
            <Typography variant="body" color="subdued">
              <strong>Governed extensibility.</strong> Adding a new component to the AI
              surface requires an explicit catalog entry — creating a reviewed, auditable
              approval process for what agents are permitted to render.
            </Typography>
          </Stack>
        </Stack>

        <Divider size="small" />

        {/* Accessibility */}
        <Stack direction="column" gap="md">
          <Typography variant="h4">Accessibility &amp; assistive technology</Typography>
          <Typography variant="body" color="subdued">
            In Australia, <strong>1 in 6 people live with disability</strong> (ABS,
            2018). For a major bank like NAB, accessible digital services are both a
            legal requirement under the Disability Discrimination Act and a competitive
            advantage.
          </Typography>
          <Stack direction="column" gap="sm">
            <Typography variant="body" color="subdued">
              <strong>Inherited WCAG compliance.</strong> Every generated component comes
              from the Common Origin Design System, built to WCAG 2.1 AA. Accessibility
              is guaranteed by the catalog — the AI never needs to set ARIA roles, focus
              order, or contrast ratios.
            </Typography>
            <Typography variant="body" color="subdued">
              <strong>Screen reader semantics.</strong> Component names in the catalog
              correspond to semantic HTML elements — headings, lists, tables, alerts.
              A screen reader user navigating an AI-generated banking summary gets
              correct document structure automatically.
            </Typography>
            <Typography variant="body" color="subdued">
              <strong>Keyboard &amp; switch navigation.</strong> Rendered components
              maintain standard focus flows. Agentic surfaces are navigable by keyboard
              and switch-access devices out of the box, making the experience equally
              usable for motor-impaired customers.
            </Typography>
            <Typography variant="body" color="subdued">
              <strong>Voice input first-class.</strong> The AgentInput component supports
              voice queries natively, lowering the barrier for customers who find typed
              interaction difficult — turning natural speech directly into a banking
              action.
            </Typography>
          </Stack>
        </Stack>

      </Stack>
      </div>
    </Sheet>
  );
}
