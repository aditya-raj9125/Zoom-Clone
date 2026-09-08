# Auto-Deploy Pipeline: Direct Push to Production (Vercel & Render)

This repository is configured to **skip test checks** and immediately deploy to production on **Vercel** and **Render** upon every commit to `main`.

---

## How It Works

```
       Git Commit & Push to 'main'
                   │
                   ▼
       ┌───────────────────────┐
       │ GitHub Actions Deploy │
       └───────────┬───────────┘
                   │ (Immediate - No Blocking Checks)
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ Render Deploy │     │ Vercel Deploy │
│ (Backend API) │     │  (Web App)    │
└───────────────┘     └───────────────┘
```

1. **Vercel Frontend (`zoom-clone-web`):**
   - Live URL: `https://zoom-clone-web-gamma.vercel.app`
   - Every push to `main` is automatically built and deployed to production by Vercel.

2. **Render Backend (`zoom-api`):**
   - Live URL: `https://zoom-clone-hvoi.onrender.com`
   - Auto-deploys branch `main` automatically.
   - For immediate webhook triggering, you can add `RENDER_DEPLOY_HOOK_URL` in GitHub Repository Secrets.

---

## Fixing the "Vercel – web" Failing Check

If you see a red check named **"Vercel – web"** failing in GitHub while **"Vercel – zoom-clone-web"** is green:
- You have an older or duplicate project named `web` in your Vercel account.
- **To remove it:**
  1. Open [vercel.com/dashboard](https://vercel.com/dashboard).
  2. Click on the project named `web`.
  3. Go to **Settings** → scroll to the bottom → click **Delete Project**.
  4. Now only `zoom-clone-web` will track the repository, keeping all your commit checks 100% green!
