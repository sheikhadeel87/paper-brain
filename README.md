# Paper Brain

AI-assisted receipt capture: **upload → OCR → Gemini structured parse → human review → persist as an expense**. The UI is a single-page React app; the API is Express + MongoDB. Product scope and acceptance criteria live in the MVP docs linked below.

---

## Contents

- [Stack](#stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Local development](#local-development)
- [HTTP API](#http-api)
- [Observability & performance](#observability--performance)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## Stack

| Layer | Technology |
|--------|------------|
| UI | React 19, Vite 8, Tailwind CSS |
| API | Node.js (ESM), Express 5 |
| Data | MongoDB via Mongoose |
| OCR | Tesseract.js |
| LLM | Google Gemini (`@google/generative-ai`) |

---

## Repository layout

```
paper-brain/
├── backend/           # Express API, Mongoose models, OCR + Gemini
│   ├── src/
│   │   ├── app.js             # Express app, CORS, route mounting
│   │   ├── server.js          # HTTP server + Mongo connect
│   │   ├── routes/            # receipt, expenses
│   │   ├── models/            # Expense, Receipt (schema only until optional MVP step)
│   │   ├── lib/               # shared validation
│   │   └── middleware/        # e.g. response timing
├── .env.example       # copy → `.env` at repo root (backend loads it first)
├── frontend/          # Vite + React SPA (`App.jsx` holds main UI)
├── MVP_REQUIREMENTS.md
├── MVP_PROGRESS.md
└── PERFORMANCE.md     # §14 spot-check notes + `X-Process-Time-Ms`
```

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **MongoDB** reachable from the machine running the API (local default: `mongodb://127.0.0.1:27017/paper-brain`)
- **Google AI Studio** API key for Gemini (free tier is fine for development; see `.env.example` comments)

---

## Configuration

Copy `.env.example` → **`.env` in the project root** (same folder as `README.md`). The API loads that file first; if it is missing, it falls back to `backend/.env`. Set:

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGO_URI` | Yes* | Mongo connection string. *Defaults in code if unset—see server logs. |
| `PORT` | No | API port (default **8000**). |
| `JWT_SECRET` | Yes in production | Signing key for auth JWTs (`openssl rand -hex 32`). |
| `GEMINI_API_KEY` | Yes for AI parse | Gemini auth. |
| `GEMINI_MODEL` | No | Model id (e.g. `gemini-2.5-flash`, `gemini-2.5-flash-lite` for gentler quotas). |
| `ALLOWED_ORIGINS` | No | Comma-separated list of allowed browser origins (CORS). If unset, any origin is allowed. |
| `NODE_ENV` | No | Set to `production` on the **API host** only; enables stricter env checks and disables demo user seeding. |

Do not commit real secrets. Keep `.env` out of version control.

---

## Deployment (Vercel + MongoDB Atlas)

This repo is a **split** setup: the **React app** can live on Vercel; the **Express API** must run on a Node host that supports long-lived processes and file uploads (e.g. [Railway](https://railway.app), [Render](https://render.com), [Fly.io](https://fly.io)). **Atlas** is used as the database for that API.

### 1. MongoDB Atlas

Create a cluster, a database user, and **Network Access** → allow the API host’s egress IPs (or `0.0.0.0/0` only while testing). Copy the **Drivers** connection string into `MONGO_URI` on the API host.

### 2. API host (not Vercel for this template)

On the service dashboard, set:

- `MONGO_URI` — Atlas SRV string  
- `JWT_SECRET` — long random string  
- `GEMINI_API_KEY` — from Google AI Studio  
- `NODE_ENV` — `production`  
- `ALLOWED_ORIGINS` — your Vercel site origin(s), e.g. `https://your-app.vercel.app` (optional; recommended once stable)

Start with `node src/server.js` (or `npm run dev` without `NODE_ENV=production` for smoke tests). The server **exits on boot** if `NODE_ENV=production` and any of `MONGO_URI`, `JWT_SECRET`, or `GEMINI_API_KEY` is missing.

### 3. Vercel (frontend only)

1. Point the Vercel project at **`frontend/`** (root directory = `frontend` in Vercel project settings).  
2. Under **Environment variables**, add **`VITE_API_BASE_URL`** = the **public HTTPS URL** of your API (no trailing slash), e.g. `https://paper-brain-api.up.railway.app`.  
3. Redeploy after changing env vars (Vite bakes this value at build time).

Local dev stays the same: leave `VITE_API_BASE_URL` unset and use the Vite proxy (`frontend/vite.config.js` → `127.0.0.1:8000`).

See **`frontend/.env.example`** for the frontend variable.

---

## Local development

Run **backend** and **frontend** in two terminals. Order: start Mongo, then API, then UI.

### 1. API (`backend/`)

```bash
cd backend && npm install && npm run dev
```

- Listens on `http://127.0.0.1:8000` (or `PORT`).
- Health: `GET http://127.0.0.1:8000/health` → `{ "status": "OK" }`.

### 2. UI (`frontend/`)

```bash
cd frontend && npm install && npm run dev
```

- Vite prints a local URL (commonly `http://localhost:5173`).
- **`/api` is proxied** to the backend (`frontend/vite.config.js` → `http://127.0.0.1:8000`). The browser only talks to Vite during dev; no manual CORS setup needed for that path.

If the API is not on `127.0.0.1:8000`, change `server.proxy` in `frontend/vite.config.js`.

### Scripts (reference)

| Location | Command | Use |
|----------|---------|-----|
| `backend/` | `npm run dev` | Nodemon reload on `src/server.js` |
| `backend/` | `npm run test:gemini` | Quick Gemini connectivity (requires key) |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production bundle |
| `frontend/` | `npm run lint` | ESLint |
| `frontend/` | `npm run preview` | Serve production build locally |

---

## HTTP API

Base URL in dev (via proxy): **`/api/...`** (same origin as the Vite app).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness (not under `/api`). |
| `POST` | `/api/receipt/upload` | **Bearer auth required.** Multipart field **`receipt`**: image → OCR → Gemini JSON. Persists a **`Receipt`** draft and returns **`receiptId`** (omit on pure OCR failure). Does **not** create an `Expense` until confirm; send **`receiptId`** with `POST /api/expenses` to link. |
| `GET` | `/api/expenses` | Paginated list; query: `limit`, `skip`, `from`, `to` (ISO dates on `createdAt`), `vendor` (substring). Returns `expenses`, `totalCount`, `summary`. |
| `GET` | `/api/expenses/export` | CSV export (same filter query params as list). |
| `POST` | `/api/expenses` | Create expense after review (`finalData`, `originalAiData`, `rawText`, `confirmReview` when required). |
| `PATCH` | `/api/expenses/:id` | Update expense (same validation as create). |
| `DELETE` | `/api/expenses/:id` | Remove expense. |

**Response timing:** JSON and `send()` responses from receipt and expense routers include header **`X-Process-Time-Ms`** (server-side duration in milliseconds). See [PERFORMANCE.md](./PERFORMANCE.md) for MVP §14 targets and how to read it in DevTools.

---

## Observability & performance

- **§14 targets** (from [MVP_REQUIREMENTS.md](./MVP_REQUIREMENTS.md)): receipt pipeline ~**10s**, dashboard list ~**2s**—environment-dependent; verify with Network tab + `X-Process-Time-Ms`.
- Details: [PERFORMANCE.md](./PERFORMANCE.md).

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `pixReadStream` / `Unknown format` in server logs | Tesseract could not decode the image (e.g. **HEIC**, corrupt file, or non-image data). Prefer **JPEG/PNG** for uploads. |
| `GEMINI_API_KEY` / 429 / quota | Missing key, model quota, or wrong model; try `GEMINI_MODEL=gemini-2.5-flash-lite` and retry after cooldown. |
| UI cannot reach API | Backend not running, wrong `PORT`, or Vite **proxy** target mismatch. |
| Empty dashboard | Mongo empty, filters too strict, or wrong `MONGO_URI`. |
| Worked on **local Mongo**, fails after **Atlas** `mongodb+srv://` | **Network Access** in Atlas must allow where the API runs (your home IP changes—add current IP or `0.0.0.0/0` only while testing). Wrong DB user/password in the URI. Password characters like `@ # : / ?` must be [percent-encoded](https://www.mongodb.com/docs/manual/reference/connection-string/) in the URI. Corporate VPN/DNS can block SRV lookups (`querySrv` errors). Append `?retryWrites=true&w=majority` if Atlas gave you that in the official connection string. |
| API exits immediately on start with `[env] Production requires:` | `NODE_ENV=production` is set; add `JWT_SECRET`, `MONGO_URI`, and `GEMINI_API_KEY` on that host, or use development locally without `NODE_ENV=production`. |
| Browser shows CORS error after deploy | Set **`ALLOWED_ORIGINS`** on the API to your real front-end origin(s) (e.g. `https://….vercel.app`). If unset, all origins are allowed—mis-typed `ALLOWED_ORIGINS` can block `http://localhost:5173`. |

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [MVP_REQUIREMENTS.md](./MVP_REQUIREMENTS.md) | Product source of truth |
| [MVP_PROGRESS.md](./MVP_PROGRESS.md) | Implementation checklist / status |
| [PERFORMANCE.md](./PERFORMANCE.md) | §14 timing verification |

---

## License

Backend `package.json` declares **ISC** (adjust if you standardize on another license for the whole repo).
