# A2UI + Common Origin Design System POC

A demonstration of agent-generated UI using [A2UI](https://a2ui.org) (Agent to UI) principles, rendered through a trusted component catalog mapped to the [Common Origin Design System](https://github.com/common-origin/common-origin-design-system).

## Overview

This project implements a secure, declarative approach to agent-generated interfaces where:
- **Agents send data, not code**: UI is described in declarative JSON (A2UI messages), preventing code injection
- **Catalog-based rendering**: Only pre-approved components from a trusted catalog can be rendered
- **Framework mapping**: A2UI components map to Common Origin React components
- **Incremental updates**: UI streams progressively as the agent generates it

### Demo: Transaction Finder

The demo showcases a "Transaction Finder" UI that includes:
- Search input field
- Filter chips (Last 30 days, Money out, Card)
- Transaction results list
- Empty state handling

## Architecture

```
┌─────────────────┐
│   Mock Agent    │  Generates A2UI JSONL messages
└────────┬────────┘
         │ A2UI Messages (JSON)
         ▼
┌─────────────────┐
│  A2UI Surface   │  Parses messages, maintains state
└────────┬────────┘
         │ Component references
         ▼
┌─────────────────┐
│ Catalog Layer   │  Security boundary - whitelisted components
└────────┬────────┘
         │ Maps to
         ▼
┌─────────────────┐
│ Common Origin   │  Actual React components rendered
│ Design System   │
└─────────────────┘
```

### Key Files

- **`src/a2ui/types.ts`**: A2UI message type definitions (surfaceUpdate, dataModelUpdate, beginRendering)
- **`src/a2ui/catalog.ts`**: Component catalog and mapping layer (security boundary)
- **`src/components/A2UISurface.tsx`**: A2UI renderer surface with state management
- **`src/server/mockAgent.ts`**: Mock agent simulating incremental UI generation
- **`app/page.tsx`**: Demo page with UI generation triggers
- **`vendor/a2ui/`**: Reference A2UI repository (not directly imported)

## Setup

### Requirements

- Node.js 18+
- pnpm (or npm)

### Installation

```bash
# Clone and navigate to project
cd ~/common-origin-a2ui-poc

# Install dependencies
pnpm install

# Set up environment variables (optional for Phase 5)
cp .env.local.example .env.local
# Edit .env.local and add your GEMINI_API_KEY if using real agent

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

### Environment Variables

For real agent integration (Phase 5), create a `.env.local` file:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_AGENT_MODE=mock  # or 'real' for live agent
```

See `.env.local.example` for the template.

### Build for Production

```bash
pnpm build
pnpm start
```

## How the Catalog Works

### Security Rationale

The catalog is the **critical security boundary** in agent-generated UI:

1. **No arbitrary code execution**: Agents can only reference components by name, not send executable code
2. **Strict prop schemas**: Each component has a defined interface with typed, validated props
3. **Client-controlled rendering**: The client owns all rendering logic and styling decisions
4. **Whitelist approach**: Only explicitly defined components can be used

### Example: Button Component

```typescript
// Agent sends this A2UI message:
{
  "surfaceUpdate": {
    "surfaceId": "main",
    "components": [{
      "id": "submit-btn",
      "component": {
        "Button": {
          "label": {"literalString": "Submit"},
          "variant": "primary",
          "size": "medium"
        }
      }
    }]
  }
}

// Catalog maps it to Common Origin Button:
import { Button } from '@common-origin/design-system';

return (
  <Button variant="primary" size="medium">
    Submit
  </Button>
);
```

### Catalog Components

Current catalog includes:

| A2UI Component | Common Origin Component | Props |
|---------------|------------------------|-------|
| `Text` | `Typography` | text, variant (h1/h2/h3/body/caption) |
| `Button` | `Button` | label, variant, size, action, disabled |
| `TextField` | `TextField` | label, value, helperText, error, type, required |
| `Chip` | `Chip` | content, variant, size, onClick |
| `FilterChip` | `FilterChip` | content, selected, onDismiss |
| `BooleanChip` | `BooleanChip` | content, selected, onClick |
| `Card` | `CardLarge` | title, excerpt, subtitle, labels, onClick |
| `List` | `List` | dividers, spacing |
| `ListItem` | `ListItem` | primary, secondary, badge, interactive, onClick |
| `Stack` | `Stack` | direction, gap, align |
| `Alert` | `Alert` | content, variant, title |
| `Divider` | `Divider` | orientation |

## Adding a New Catalog Component

To add a new component to the catalog:

### 1. Define the Component Interface

In `src/a2ui/types.ts`, add the component type:

```typescript
export interface MyNewComponent {
  title: DataBinding | { literalString: string };
  description?: DataBinding | { literalString: string };
  variant?: 'default' | 'special';
}

// Add to CatalogComponent union type:
export type CatalogComponent =
  | { Text: TextComponent }
  | { MyNew: MyNewComponent }  // Add this
  | ...
```

### 2. Add Rendering Logic

In `src/a2ui/catalog.ts`, add the rendering case:

```typescript
import { MyNewComponentFromCommonOrigin } from '@common-origin/design-system';

export function renderNode(node: ComponentNode, surface: SurfaceState, onAction?: (action: any) => void): React.ReactElement | null {
  const { component } = node;
  
  // ... existing components ...
  
  if ('MyNew' in component) {
    const { title, description, variant = 'default' } = component.MyNew;
    const titleText = resolveDataBinding(title, surface.dataModel);
    const descText = description ? resolveDataBinding(description, surface.dataModel) : undefined;
    
    return React.createElement(MyNewComponentFromCommonOrigin, {
      key: node.id,
      title: titleText,
      description: descText,
      variant,
    });
  }
  
  return null;
}
```

### 3. Update Validation

Add the component name to `isValidComponent()`:

```typescript
export function isValidComponent(component: CatalogComponent): boolean {
  const validTypes = [
    'Text',
    'MyNew',  // Add this
    // ...
  ];
  
  return validTypes.some((type) => type in component);
}
```

### 4. Update Agent

Modify `src/server/mockAgent.ts` to use the new component:

```typescript
{
  id: 'my-element',
  component: {
    MyNew: {
      title: { literalString: 'Hello' },
      variant: 'special'
    }
  }
}
```

## Swapping Mock Agent for Real AI

To integrate a real AI agent (e.g., Gemini via Google AI SDK):

### High-Level Steps

1. **Install AI SDK**:
   ```bash
   pnpm add @google/generative-ai
   ```

2. **Create Real Agent Module** (`src/server/realAgent.ts`):
   ```typescript
   import { GoogleGenerativeAI } from '@google/generative-ai';
   
   export async function streamUIFromGemini(
     prompt: string,
     onMessage: (message: A2UIMessage) => void
   ) {
     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
     const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
     
     // System instruction: "You are a UI generator. Output A2UI JSONL messages..."
     const stream = await model.generateContentStream({
       contents: [{ role: 'user', parts: [{ text: prompt }] }],
       generationConfig: {
         // Configure for JSONL output
       }
     });
     
     for await (const chunk of stream.stream) {
       const text = chunk.text();
       // Parse JSONL lines and call onMessage() for each
       text.split('\n').forEach(line => {
         if (line.trim()) {
           const message = JSON.parse(line);
           onMessage(message);
         }
       });
     }
   }
   ```

3. **Update Page Component**:
   ```typescript
   import { streamUIFromGemini } from '@/src/server/realAgent';
   
   const handleGenerate = async () => {
     await streamUIFromGemini(
       'Generate a transaction finder UI with search, filters, and results list',
       (message) => sendMessage(message)
     );
   };
   ```

4. **Agent Prompt Engineering**:
   - Provide catalog documentation in system prompt
   - Include examples of valid A2UI messages
   - Specify JSONL output format requirements
   - Include component prop schemas

### A2A/AG-UI Integration

For production, consider using standardized agent protocols:

- **[AG-UI (Agent-UI Protocol)](https://developers.googleblog.com/)**: Google's protocol for agent-generated interfaces
- **A2A (Agent-to-Agent)**: For multi-agent coordination with shared UI

These provide:
- Standardized message formats
- Built-in streaming
- Error handling
- State synchronization
- Multi-turn conversations

## Project Structure

```
common-origin-a2ui-poc/
├── app/
│   ├── layout.tsx          # Root layout with styled-components registry
│   ├── page.tsx            # Demo page
│   └── globals.css         # Global styles
├── src/
│   ├── a2ui/
│   │   ├── types.ts        # A2UI message type definitions
│   │   └── catalog.ts      # Component catalog and mapping
│   ├── components/
│   │   └── A2UISurface.tsx # A2UI renderer surface
│   ├── server/
│   │   └── mockAgent.ts    # Mock agent for demo
│   └── lib/
│       └── registry.tsx    # Styled-components setup
├── vendor/
│   └── a2ui/              # Reference A2UI repo (not imported)
├── package.json
├── tsconfig.json
└── README.md
```

## A2UI Message Flow

### 1. Surface Update
Define components:
```json
{
  "surfaceUpdate": {
    "surfaceId": "main",
    "components": [
      {
        "id": "search",
        "component": {
          "TextField": {
            "label": {"literalString": "Search"}
          }
        }
      }
    ]
  }
}
```

### 2. Data Model Update
Populate data:
```json
{
  "dataModelUpdate": {
    "surfaceId": "main",
    "contents": [
      {
        "key": "query",
        "valueString": "groceries"
      }
    ]
  }
}
```

### 3. Begin Rendering
Trigger render:
```json
{
  "beginRendering": {
    "surfaceId": "main",
    "root": "search",
    "catalogId": "common-origin.design-system:v2.0"
  }
}
```

## Next Steps

- [ ] Add more catalog components (Modal, Tabs, Navigation)
- [ ] Implement data binding with live updates
- [ ] Add action handlers for interactive components
- [ ] Integrate real AI agent (Gemini)
- [ ] Add A2A protocol support for multi-agent scenarios
- [ ] Implement error boundaries and validation
- [ ] Add accessibility testing
- [ ] Create component playground

## Resources

- [A2UI Quickstart](https://a2ui.org/quickstart/)
- [A2UI Blog Post](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [Common Origin Design System](https://github.com/common-origin/common-origin-design-system)
- [Google A2UI Repo](https://github.com/google/a2ui)

## License

MIT
