# Developer Getting Started

This guide is the repeatable local workflow for the Zoom Clone monorepo.

## Prerequisites

| Tool | Version |
| --- | --- |
| Python | 3.12 or newer |
| Node.js | 20 or newer |
| npm | Included with Node.js |
| Browser | WebRTC-capable, with camera/microphone permission support |

## Install the repository

```bash
git clone https://github.com/aditya-raj9125/Zoom-Clone.git
cd Zoom-Clone
npm install
```

## Configure the backend

### PowerShell

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
Copy-Item .env.example .env
$env:PYTHONPATH = "."
python -m alembic upgrade head
python scripts/seed_db.py
```

### macOS/Linux

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
export PYTHONPATH=.
python -m alembic upgrade head
python scripts/seed_db.py
```

The seed script creates deterministic development records. Treat the generated credentials as local demo data only.

## Start the services

API terminal:

```bash
cd apps/api
# Activate .venv and set PYTHONPATH=.
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Web terminal from the repository root:

```bash
npm run dev:web
```

| Service | URL |
| --- | --- |
| Web app | `http://localhost:3000` |
| Swagger UI | `http://127.0.0.1:8000/docs` |
| ReDoc | `http://127.0.0.1:8000/redoc` |
| Health check | `http://127.0.0.1:8000/api/v1/health` |

## Environment variables

Backend settings are loaded from `apps/api/.env` by Pydantic Settings.

```env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./data/zoom_clone.db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
JWT_SECRET_KEY=replace-this-locally
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Frontend URL overrides are optional for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
```

## Quality commands

Run from `apps/api` with the virtual environment active:

```bash
export PYTHONPATH=.
python -m pytest -q
python -m ruff check .
python -m ruff format --check .
python -m mypy app
```

Run from the repository root:

```bash
npm --prefix apps/web run lint
npx tsc -p apps/web/tsconfig.json --noEmit
npm run build:web
```

## Troubleshooting

### Camera or microphone is unavailable

Use a secure context (`localhost` is allowed), grant browser permissions, and close other applications using the device. The client has a synthetic media fallback for restricted environments, but real browser devices are required for an actual call.

### WebSocket does not connect

Confirm the API is running on port `8000`, the frontend URL is included in `CORS_ORIGINS`, and the WebSocket URL uses `ws://` locally or `wss://` in HTTPS production.

### Database changes are not visible

Run the latest Alembic migration and confirm `DATABASE_URL` points at the database you expect:

```bash
python -m alembic upgrade head
```

### Two participants appear with the same name

Participant sessions are identified by opaque participant IDs. The UI filters stale same-name sessions for convenience, but production identity should use authenticated user IDs rather than display names.
