# Developer Getting Started Guide

This guide walks through setting up the Zoom Clone monorepo locally.

---

## 1. Prerequisites

- **Python**: `3.12+`
- **Node.js**: `20+` or `22+`
- **Package Manager**: `npm` or `pnpm`

---

## 2. Monorepo Setup

Clone the repository and install frontend dependencies:
```bash
npm install
```

---

## 3. Backend Setup (`apps/api`)

1. Change into the API directory:
```bash
cd apps/api
```

2. Create virtual environment and activate:
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies in editable mode:
```bash
pip install -e ".[dev]"
```

4. Configure environment:
```bash
Copy-Item .env.example .env
```

5. Run database migrations and seed default data:
```bash
$env:PYTHONPATH = "."
.\.venv\Scripts\python -m alembic upgrade head
.\.venv\Scripts\python scripts/seed_db.py
```

6. Start FastAPI development server:
```bash
$env:PYTHONPATH = "."
.\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Swagger UI: `http://127.0.0.1:8000/docs`

---

## 4. Running Backend Tests & Quality Checks

Run all checks from `apps/api`:
```bash
# Run 66 unit, integration, and websocket tests
.\.venv\Scripts\python -m pytest -v

# Run linter
.\.venv\Scripts\python -m ruff check .

# Check formatting
.\.venv\Scripts\python -m ruff format --check .

# Run static type checker
.\.venv\Scripts\python -m mypy app
```

---

## 5. Frontend Setup (`apps/web`)

1. Start Next.js development server:
```bash
npm run dev:web
```
Or from the root:
```bash
cd apps/web
npm run dev
```
Next.js Web App: `http://localhost:3000`
