# Deployment Guide: Vercel

## Prerequisites

- GitHub account with the repo pushed
- Vercel account ([vercel.com](https://vercel.com))

## 1. Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `common-origin-a2ui-poc`
3. Vercel auto-detects the Next.js framework

Build settings are configured in `vercel.json`:
- **Framework**: Next.js
- **Build command**: `pnpm build`
- **Install command**: `pnpm install`
- **Agent API timeout**: 60s (for Gemini streaming)

## 2. Set Environment Variables

In Vercel project settings → Environment Variables, add:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_AGENT_MODE` | `mock` | Yes |
| `GEMINI_API_KEY` | Your API key | Only for real agent mode |
| `GEMINI_MODEL` | `gemini-2.0-flash` | No (default) |

**Mock mode** (no API key needed): Set `NEXT_PUBLIC_AGENT_MODE=mock`

**Real agent mode**: Set `NEXT_PUBLIC_AGENT_MODE=real` and provide `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/app/apikey).

## 3. Deploy

Click **Deploy**. Vercel will build and deploy in ~2 minutes.

After deployment, test all three scenarios:
1. "Find my Woolworths transactions" → Transaction search
2. "Show spending summary" → Spending summary
3. "Transfer $100 to savings" → Fund transfer

## Continuous Deployment

- **Push to main** → automatic production deployment
- **Pull requests** → automatic preview deployments

## Environment Per Branch

Set different variables per environment in Vercel:
- **Production**: `NEXT_PUBLIC_AGENT_MODE=real` with API key
- **Preview**: `NEXT_PUBLIC_AGENT_MODE=mock`

## Troubleshooting

### Build fails
- Run `pnpm build` locally to reproduce
- Check Vercel build logs for TypeScript or dependency errors

### Agent API times out
- The `vercel.json` sets a 60s function timeout for the agent route
- Gemini streaming typically responds in 5-15s
- If consistently slow, check Gemini API quotas

### Mock agent works but real agent fails
- Verify `GEMINI_API_KEY` is set correctly in Vercel env vars
- Check function logs in Vercel dashboard → Logs tab
- The app auto-falls back to mock agent on real agent failure

### Design system components not rendering
- Ensure `@common-origin/design-system` is accessible from Vercel's build environment
- Check if `.npmrc` is needed for private registry access
