# CI/CD Automation Guide: Auto-Deploy to Vercel & Render

This repository uses **GitHub Actions** to automate continuous integration (CI) and continuous deployment (CD).

Every time code is pushed to `main` (or a pull request is opened), GitHub Actions runs automated tests for both the **FastAPI backend** and **Next.js frontend**. Once tests pass, deployments to **Render** and **Vercel** are automatically triggered.

---

## Architecture Overview

```
       Git Commit & Push to 'main'
                   │
                   ▼
       ┌───────────────────────┐
       │ GitHub Actions CI/CD  │
       └───────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ Backend Tests │     │ Frontend Build│
│  (Pytest 66)  │     │  (TypeScript) │
└───────┬───────┘     └───────┬───────┘
        └──────────┬──────────┘
                   ▼ (Both must pass)
        ┌─────────────────────┐
        │  Auto-Deploy Stage  │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ Render Deploy │     │ Vercel Deploy │
│ (Backend API) │     │  (Web App)    │
└───────────────┘     └───────────────┘
```

---

## 1. Backend Auto-Deploy on Render

Your backend is hosted on Render at:
`https://zoom-clone-hvoi.onrender.com`

### How to Enable Strict CI-Gated Deployment:
1. Open the [Render Dashboard](https://dashboard.render.com).
2. Select your `zoom-api` web service.
3. In the left sidebar, click **Settings**.
4. Scroll down to the **Deploy Hook** section.
5. Click **Create Deploy Hook** (or copy the existing URL). It looks like:
   ```
   https://api.render.com/deploy/srv-cxxxxxxxxxxxxxxx?key=yyyyyy
   ```
6. Open your GitHub repository on GitHub:
   `https://github.com/aditya-raj9125/Zoom-Clone`
7. Navigate to **Settings** → **Secrets and variables** → **Actions**.
8. Click **New repository secret**.
   - **Name:** `RENDER_DEPLOY_HOOK_URL`
   - **Secret:** *(Paste your Render Deploy Hook URL)*
9. Click **Add secret**.

Once set, every successful run of the CI pipeline on `main` will instantly trigger a production deployment on Render!

---

## 2. Frontend Auto-Deploy on Vercel

Your frontend is hosted on Vercel at:
`https://zoom-clone-web-gamma.vercel.app`

### How it Works:
- Since your Vercel project is directly connected to GitHub (`aditya-raj9125/Zoom-Clone`), every commit to `main` is automatically picked up and deployed to production.
- If you'd like to use a Deploy Hook for explicit webhook triggering:
  1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) → select project `zoom-clone-web` (or equivalent).
  2. Go to **Settings** → **Git** → scroll to **Deploy Hooks**.
  3. Create a hook named `github-actions-cd` targeting the `main` branch.
  4. In GitHub Repository Secrets, add `VERCEL_DEPLOY_HOOK_URL` with that URL.

---

## 3. Workflow File

The workflow is defined in [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml).

### Features:
- **Parallel Testing**: Runs backend test suite (66 tests) and frontend Next.js compilation simultaneously.
- **Fail-Fast Safety**: If any test fails, deployment jobs are cancelled, protecting production from regressions.
- **Concurrency Control**: Automatically cancels outdated in-progress runs if a newer commit is pushed to the same branch.
- **Manual Trigger**: Can be manually triggered at any time from the **Actions** tab in GitHub by selecting "CI/CD Pipeline" and clicking **Run workflow**.
