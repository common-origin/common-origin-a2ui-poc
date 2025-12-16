# A2UI + Common Origin Setup Guide

## Commands to Run

### 1. Navigate to project directory
```bash
cd ~/common-origin-a2ui-poc
```

### 2. Install dependencies (if not already done)
```bash
pnpm install
```

### 3. Start development server
```bash
pnpm dev
```

### 4. Open in browser
Navigate to: http://localhost:3000

### 5. Build for production
```bash
pnpm build
pnpm start
```

## Project Structure

```
common-origin-a2ui-poc/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx          # Root layout with styled-components registry
│   └── page.tsx            # Demo page with Generate UI button
├── src/
│   ├── a2ui/
│   │   ├── catalog.ts      # Component catalog and mapping layer (SECURITY BOUNDARY)
│   │   └── types.ts        # A2UI message type definitions
│   ├── components/
│   │   └── A2UISurface.tsx # A2UI renderer surface with state management
│   ├── lib/
│   │   └── registry.tsx    # Styled-components Next.js integration
│   └── server/
│       └── mockAgent.ts    # Mock agent with JSONL streaming
├── vendor/
│   └── a2ui/              # Reference A2UI repository (not directly imported)
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md              # Comprehensive documentation
├── SETUP.md              # This file
├── tailwind.config.ts
└── tsconfig.json

```

## File Changes Made

### Created Files:
1. **src/a2ui/types.ts** - A2UI message type definitions (SurfaceUpdate, DataModelUpdate, BeginRendering, DeleteSurface)
2. **src/a2ui/catalog.ts** - Component catalog mapping A2UI components to Common Origin
3. **src/components/A2UISurface.tsx** - A2UI renderer surface component
4. **src/server/mockAgent.ts** - Mock agent generating Transaction Finder UI
5. **src/lib/registry.tsx** - Styled-components SSR registry for Next.js
6. **README.md** - Complete documentation
7. **SETUP.md** - This setup guide

### Modified Files:
1. **app/page.tsx** - Replaced default Next.js page with A2UI demo
2. **app/layout.tsx** - Added styled-components registry wrapper
3. **tsconfig.json** - Excluded vendor/ directory from compilation
4. **.gitignore** - Added vendor/ to ignore list

## Dependencies Added

```json
{
  "dependencies": {
    "@common-origin/design-system": "^2.0.1",
    "styled-components": "^6.1.19"
  },
  "devDependencies": {
    "@types/styled-components": "^5.1.36"
  }
}
```

## What to Test

1. **Click "Generate UI" button** - Should stream a transaction finder UI with:
   - Title "Transaction Finder"
   - Search input field
   - Three filter chips (Last 30 days, Money out, Card)
   - List of 5 transactions with amounts
   - Status indicator showing streaming progress

2. **Click "Show Empty State" button** - Should show:
   - Search form and filters
   - Alert message "No transactions found"

## Key Architecture Points

- **Security**: Agent sends JSON, not code. Only catalog components can render.
- **Incremental**: UI streams progressively (skeleton → form → results).
- **Catalog**: `src/a2ui/catalog.ts` is the trust boundary mapping A2UI → Common Origin.
- **State**: `A2UISurface` maintains component tree and data model.
- **Messages**: JSONL format with `surfaceUpdate`, `dataModelUpdate`, `beginRendering`.

## TypeScript Compilation

Note: There may be minor TypeScript warnings related to React.createElement with children.
These can be resolved by adjusting how children are passed to React.createElement.

To check for errors:
```bash
pnpm tsc --noEmit
```

## Next Steps

See README.md for:
- Adding new catalog components
- Swapping mock agent for real AI (Gemini)
- A2A/AG-UI integration guidance
- Component catalog expansion
