# Deploying Zoom Clone (Frontend + Backend) on Railway

Railway allows you to deploy both the **FastAPI Backend** and the **Next.js Frontend** within the exact same project from your single GitHub repository (`aditya-raj9125/Zoom-Clone`).

Railway also supports WebSockets out of the box with zero additional configuration.

---

## Architecture on Railway

```
                     ┌────────────────────────────────┐
                     │   Railway Project              │
                     │                                │
                     │  ┌──────────────────────────┐  │
User Browser ────────┼─>│ Service 1: Frontend      │  │
                     │  │ (Next.js - apps/web)     │  │
                     │  └────────────┬─────────────┘  │
                     │               │ HTTP / WS      │
                     │  ┌────────────▼─────────────┐  │
                     │  │ Service 2: Backend       │  │
                     │  │ (FastAPI - apps/api)     │  │
                     │  └──────────────────────────┘  │
                     └────────────────────────────────┘
```

---

## Step 1: Create a Railway Project
1. Log in to [railway.app](https://railway.app).
2. Click **"New Project"** $\rightarrow$ select **"Deploy from GitHub repo"**.
3. Choose your repository: **`aditya-raj9125/Zoom-Clone`**.

---

## Step 2: Configure Service 1 — FastAPI Backend (`apps/api`)
1. Click on the newly created service in your Railway canvas.
2. Go to **Settings**:
   - **Service Name**: rename to `zoom-api` (or `backend`).
   - **Root Directory**: set to `/apps/api`.
3. Go to **Variables** and add:
   ```env
   PORT=8000
   JWT_SECRET_KEY=railway-production-secret-key-change-this-min-32-chars
   FRONTEND_URL=https://${{zoom-web.RAILWAY_PUBLIC_DOMAIN}}
   CORS_ORIGINS=*
   ```
4. Go to **Networking**:
   - Click **"Generate Domain"** (e.g. `zoom-api-production.up.railway.app`).
   - Copy this URL!

---

## Step 3: Configure Service 2 — Next.js Frontend (`apps/web`)
1. On the same Railway project canvas, click **"+ New"** $\rightarrow$ **"GitHub Repo"** $\rightarrow$ choose `aditya-raj9125/Zoom-Clone` again.
2. Click on the new service and go to **Settings**:
   - **Service Name**: rename to `zoom-web` (or `frontend`).
   - **Build Command**: `npm install && npm run build:web`
   - **Start Command**: `npm run start:web`
3. Go to **Variables** and add:
   ```env
   NEXT_PUBLIC_API_URL=https://<your-backend-domain>.up.railway.app/api/v1
   NEXT_PUBLIC_WS_URL=wss://<your-backend-domain>.up.railway.app/api/v1/ws
   ```
   *(Replace `<your-backend-domain>` with the backend domain generated in Step 2).*
4. Go to **Networking**:
   - Click **"Generate Domain"** (e.g. `zoom-web-production.up.railway.app`).

---

## Step 4: Verify Deployment
1. Visit your frontend URL: `https://<your-frontend-domain>.up.railway.app`.
2. Test signing up, creating a meeting, joining via invite link, audio/video streaming, and chat.
3. Submit both the GitHub URL and the Railway frontend URL for your assignment!
