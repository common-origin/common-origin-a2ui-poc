# Deployment Guide: Vercel

This guide walks through deploying the A2UI Banking Demo to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository pushed to GitHub

## Step 1: Push to GitHub

```bash
cd /Users/olliemacky/Git/commonorigin/common-origin-a2ui-poc

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: A2UI Banking Demo with 3 scenarios"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/common-origin-a2ui-poc.git

# Push to GitHub
git push -u origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository: `common-origin-a2ui-poc`
4. Vercel will auto-detect Next.js configuration

## Step 3: Configure Build Settings

Vercel should automatically detect:
- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` (or `npm install`)

If using pnpm, ensure "Use pnpm" is enabled in settings.

## Step 4: Set Environment Variables

In the Vercel project settings, add:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_AGENT_MODE=mock
```

**For Phase 5 (Real Agent Integration):**
- Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Set `NEXT_PUBLIC_AGENT_MODE=real` to enable live agent

**For Demo/Backup:**
- Keep `NEXT_PUBLIC_AGENT_MODE=mock` to use mock agent
- No API key required for mock mode

## Step 5: Deploy

Click **Deploy**

Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the Next.js app
4. Deploy to a production URL

Deployment typically takes 2-3 minutes.

## Step 6: Verify Deployment

Once deployed, Vercel provides:
- **Production URL**: `https://common-origin-a2ui-poc.vercel.app`
- **Preview URLs**: For each branch/PR

Test all three scenarios:
1. "Find my Starbucks transactions" → Transaction Search
2. "Show spending summary" → Spending Summary
3. "Transfer $100 to savings" → Fund Transfer

## Step 7: Custom Domain (Optional)

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `a2ui-demo.yourdomain.com`)
3. Update DNS records as instructed by Vercel

## Continuous Deployment

Vercel automatically:
- **Deploys on push to main**: Production deployment
- **Deploys on pull requests**: Preview deployments
- **Redeploys on dependency updates**: Automatic rebuilds

## Environment Variables Per Environment

You can set different env vars for:
- **Production**: Live demo with real agent
- **Preview**: Testing with mock agent
- **Development**: Local development settings

## Monitoring & Logs

View deployment logs at:
- **Deployments tab**: Build logs, errors, warnings
- **Functions tab**: Serverless function logs (if using real agent API)
- **Analytics**: Traffic, performance metrics (requires Pro plan)

## Troubleshooting

### Build Fails

**Common issues:**
- Missing dependencies: Run `pnpm install` locally first
- TypeScript errors: Fix errors shown in build log
- Environment variables: Ensure all required vars are set

### Runtime Errors

**Check:**
- Browser console for client-side errors
- Vercel function logs for server-side errors
- Network tab for failed requests

### Performance

**Optimization tips:**
- Enable Vercel Analytics for insights
- Use Next.js Image optimization
- Monitor Core Web Vitals
- Consider Edge Functions for faster response times

## Rollback

To rollback to a previous deployment:
1. Go to Deployments tab
2. Find the working deployment
3. Click "..." → "Promote to Production"

## Next Steps

- Add real Gemini agent integration (Phase 5)
- Set up staging environment
- Configure custom domain
- Enable Vercel Analytics
- Set up monitoring alerts

---

**Demo URL**: Your URL will be at `https://YOUR_PROJECT.vercel.app`

Share this URL in interviews to demonstrate live A2UI capabilities! 🚀
