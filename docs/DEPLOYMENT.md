# Deployment Guide

This covers running Brief.ai locally with Docker Compose (already working) and
taking it to production. It reflects what's actually built today — MySQL 8,
NestJS API, Next.js frontend, DeepSeek for AI — not the earlier aspirational
stack described in the root README.

## Architecture

- **`apps/web`** — Next.js 14 (App Router). Static/SSR pages, deploys well to
  Vercel. Talks to the API over HTTP using `NEXT_PUBLIC_API_URL`.
- **`apps/api`** — NestJS. Needs a real container, not a serverless function:
  it shells out to `soffice` (LibreOffice, for Office↔PDF conversion) and
  `qpdf` (password protect/remove), both installed system-side in
  `apps/api/Dockerfile`.
- **MySQL 8** — audit-log tables (`ConversionJob`, `PasswordJob`, `AiJob`) plus
  opt-in accounts and the personal library (`User`, `LibraryDocument`). No
  document content is ever persisted outside the opt-in library feature.
- **DeepSeek** — the LLM provider, called via the OpenAI-compatible SDK. Any
  OpenAI-compatible endpoint works by swapping `LLM_BASE_URL`/`LLM_MODEL`.

Most PDF operations (merge, split, rotate, organize, compress, OCR, sign,
images↔PDF) run entirely client-side in the browser — the API is only needed
for AI features, Office↔PDF conversion, password protect/remove, auth, and the
library.

## Local development (Docker Compose)

Already verified working end-to-end against a live database.

```bash
cd docker
cp .env.example .env
# Fill in LLM_API_KEY, JWT_SECRET (openssl rand -hex 48), ADMIN_TOKEN (openssl rand -hex 32)
docker compose -f docker-compose.dev.yml up --build
```

This starts MySQL + the API (migrations run automatically via
`prisma migrate deploy` before the server boots — see the `command:` in
`docker-compose.dev.yml`). Then run the frontend separately:

```bash
cd apps/web
npm install
npm run dev
```

Frontend at `http://localhost:3000`, API at `http://localhost:3001`
(`/health` for a liveness check, `/docs` for the Swagger UI, `/admin/stats`
with the `x-admin-token` header for the ops dashboard).

## Production

### 1. Database

Provision managed MySQL 8 (PlanetScale, RDS, Cloud SQL, etc.). Get a
connection string in the form:

```
mysql://user:password@host:3306/briefai
```

Run migrations once against it before first deploy:

```bash
cd apps/api
DATABASE_URL="mysql://..." npx prisma migrate deploy
```

Repeat this (or wire it into your deploy pipeline as a release step) every
time a new migration is added under `apps/api/prisma/migrations/`.

### 2. API (`apps/api`)

Needs a container host, not a serverless platform — Railway, Render, Fly.io,
or a container on AWS/GCP/Azure all work. Build with the existing
`apps/api/Dockerfile` (it already installs LibreOffice, qpdf, and fonts).

Required environment variables:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | from step 1 |
| `PORT` | usually set by the host; the app reads it, defaults to 3001 |
| `CORS_ORIGIN` | the deployed frontend's origin, e.g. `https://briefai.app` |
| `SOFFICE_BIN` | `soffice` (already on PATH in the image) |
| `QPDF_BIN` | `qpdf` (already on PATH in the image) |
| `CONVERSION_TIMEOUT_MS` | `60000` is a reasonable default |
| `LLM_API_KEY` | DeepSeek API key |
| `LLM_BASE_URL` | `https://api.deepseek.com` |
| `LLM_MODEL` | `deepseek-v4-flash` |
| `JWT_SECRET` | `openssl rand -hex 48` — used for account/library auth |
| `JWT_EXPIRES_IN` | `7d` |
| `STORAGE_DIR` | writable path for library file storage, e.g. `/app/storage` — mount a persistent volume here or library uploads won't survive a restart |
| `ADMIN_TOKEN` | `openssl rand -hex 32` — shared secret for `/admin/stats`, not a user account |

Rate limiting is already enabled app-wide (60 req/min per IP, 10 req/min on
`/ai/*`) via `@nestjs/throttler` — no extra config needed, but be aware of it
if load-testing.

### 3. Frontend (`apps/web`)

Deploy to Vercel (or any Next.js host). Set:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | the deployed API's public URL, e.g. `https://api.briefai.app` |

### 4. Post-deploy checklist

- `GET /health` on the API returns `{ "status": "ok" }`
- `GET /docs` serves the Swagger UI
- Sign up a test account through the frontend, confirm `/auth/me` works and a
  row lands in the `User` table
- Run one AI operation (e.g. Summarize) and confirm a row lands in `AiJob`
  with `status: SUCCESS`, and that it shows up under Settings → Activity when
  signed in
- Confirm `CORS_ORIGIN` on the API matches the frontend's real origin —
  mismatches fail silently as CORS errors in the browser console
- Delete the test account via Settings → Delete all my data, confirm cascade
  deletes its `LibraryDocument` rows

### Not yet implemented

- **Billing/subscriptions** — deliberately deferred (see `/pricing`, which is
  informational-only with a "Billing isn't live yet" notice). Pick a
  provider (Paddle, Lemon Squeezy, or similar) before enabling paid plans.
- **File auto-deletion cron** — conversion/password endpoints already avoid
  persisting file contents (temp files are cleaned up per-request), so there
  is no stale-file cleanup job to run.
