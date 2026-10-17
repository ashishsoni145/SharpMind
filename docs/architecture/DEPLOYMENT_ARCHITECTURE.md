# SharpMind Deployment Architecture

**Status:** Production Standard  
**Date:** 2026-10-11  
**Repository:** `ashishsoni145/SharpMind`

---

## 1. Domain and Deployment Topology

SharpMind is configured into three independent deployment projects from a single monorepo. Each project operates with its own root directory, build configuration, environment variables, and custom domain:

| Target | Custom Domain | Project Root | Runtime Model | Responsibility |
|---|---|---|---|---|
| **Public Landing** | `https://sharpmind.live` | `landing/` | Next.js 15 Static Export | Public marketing, product information, and conversion CTAs |
| **Student Web Application** | `https://app.sharpmind.live` | `web/` | Next.js 15 Static Export / Client App | Authenticated student workspace, onboarding, classrooms, tutor, assessments, revision |
| **Backend API** | `https://api.sharpmind.live` | `backend/` | Vercel Serverless Function / Node Express | API endpoints, authentication/authorization, domain logic, AI orchestration, persistence |

---

## 2. Project Specifications

### 2.1 Public Landing Site (`landing/`)

- **Domain:** `https://sharpmind.live`
- **Vercel Root Directory:** `landing`
- **Install Command:** `npm install` (or default Vercel install in monorepo context)
- **Build Command:** `npm run build` (`node ./run-next.js build`)
- **Output / Runtime:** Static HTML/JS export in `landing/out` (configured via `output: 'export'` in `landing/next.config.ts`)
- **Independence Guarantee:**
  - Has zero runtime dependencies on the authenticated app or Supabase database.
  - Can build and deploy completely independently.
  - Primary conversion CTAs ("Log In", "Get Started Free", "Open Dashboard") navigate to `https://app.sharpmind.live`.
- **Environment Variables:**
  - `NEXT_PUBLIC_APP_URL` (Public, Optional): Base URL of student web application. Default: `https://app.sharpmind.live`.
- **Local Verification Commands:**
  - Typecheck: `npm --prefix landing run typecheck`
  - Production Build: `npm --prefix landing run build`
  - Dev Server: `npm --prefix landing run dev` (runs on `http://localhost:3001`)

---

### 2.2 Student Web Application (`web/`)

- **Domain:** `https://app.sharpmind.live`
- **Vercel Root Directory:** `web`
- **Install Command:** `npm install` (or default Vercel install in monorepo context)
- **Build Command:** `npm run build` (`node ./run-next.js build`)
- **Output / Runtime:** Static client application in `web/out` (configured via `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }` in `web/next.config.ts`)
- **Workspace Navigation:**
  - Root route (`/`): Fast client router automatically redirecting authenticated sessions to `/app` (Dashboard) and unauthenticated visitors to `/login`.
  - Authenticated shell (`/app/*`): All 13 core academic modules (`dashboard`, `classroom`, `library`, `tutor`, `focus`, `planner`, `tests`, `mistakes`, `revision`, `readiness`, `analytics`, `upgrade`, `settings`).
  - Auth routes: `/login`, `/signup`, `/onboarding`, `/forgot-password`, `/reset-password`, `/verify-email`.
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL` (Public, Required): Production API base origin: `https://api.sharpmind.live`. Automatically normalizes to `/api/v1` endpoints.
  - `NEXT_PUBLIC_SUPABASE_URL` (Public, Required): Remote Supabase instance URL (e.g. `https://vscprtuinxopistikpcs.supabase.co`).
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Public, Required): Supabase anon public key for client session management.
- **Local Verification Commands:**
  - Typecheck: `npm --prefix web run typecheck`
  - Production Build: `npm --prefix web run build`
  - Dev Server: `npm --prefix web run dev` (runs on `http://localhost:3000`)

---

### 2.3 Backend API (`backend/`)

- **Domain:** `https://api.sharpmind.live`
- **Vercel Root Directory:** `backend`
- **Install Command:** `npm install`
- **Build Command:** `npm run build` (`tsc && node scripts/copy-templates.js`)
- **Output / Runtime Configuration:**
  - **Vercel Serverless Function:** Entry point `backend/api/index.ts` with routing via `backend/vercel.json` rewrites (`/(.*)` -> `/api`). Express application is exported directly for `@vercel/node`.
  - **Long-Running Server (Node/Docker/Render):** `dist/server.js` (`npm start` executes `node dist/server.js`), listening on `PORT` (default 4000).
- **Runtime Compatibility Audit:**
  - **Cold Starts:** `createApp()` synchronously mounts all modular routes without top-level asynchronous blocking, ensuring cold-start times < 300ms.
  - **Payload Limits:** Vercel serverless gateway imposes a 4.5MB request limit. SharpMind mitigates this by generating pre-signed direct upload URLs to Supabase Storage (`POST /files/upload-url`), ensuring binary uploads never bottleneck the serverless function.
  - **Timeouts:** Configured with `maxDuration: 60` in `backend/vercel.json` for AI reasoning operations.
  - **Streaming:** Server-Sent Events and chunked transfer encoding for AI Tutor responses are supported via native Node response streaming.
- **Health Checks:**
  - `GET /health`: Core server health check returning status, uptime, environment, and version.
  - `GET /api/v1/health`: API-prefixed health check.
  - `GET /api/v1/health/db`: Active database ping verifying live Supabase connectivity and query latency.
- **CORS Allowlist:**
  - Production allowed origins: `https://sharpmind.live`, `https://app.sharpmind.live`.
  - Wildcard origins with credentials are strictly prohibited in production mode.
- **Environment Variables:**
  - `PORT` (Server-Only, Optional): Default `4000`.
  - `NODE_ENV` (Server-Only, Required): `production`, `development`, or `test`.
  - `SUPABASE_URL` (Server-Only, Required): Remote Supabase project URL.
  - `SUPABASE_SERVICE_ROLE_KEY` (Server-Only, Required, Secret): Never exposed to client bundles.
  - `CORS_ORIGIN` (Server-Only, Required): Comma-separated allowlist (e.g. `https://sharpmind.live,https://app.sharpmind.live`).
  - `API_PREFIX` (Server-Only, Optional): Default `/api/v1`.
  - `AI_PROVIDER_PRIMARY` (Server-Only, Required): `gemini`, `groq`, or `openrouter`.
  - `AI_GEMINI_API_KEY` / `AI_GROQ_API_KEY` / `AI_OPENROUTER_API_KEY` (Server-Only, Secret).
  - `RESEND_API_KEY` (Server-Only, Secret): Required for custom welcome and verification-success email delivery.
  - `EMAIL_FROM` (Server-Only): Sender identity; its domain must be verified in Resend. Defaults to `SharpMind <noreply@sharpmind.live>`.
  - `APP_URL` and `LANDING_URL` (Server-Only): Public link bases used in HTML email templates.
  - `RETENTION_SECRET` (Server-Only, Secret): Separate high-entropy secret required for scheduled retention cleanup; it must not reuse the Supabase service-role key.
  - `SUPABASE_AUTH_WEBHOOK_SECRET` (Server-Only, Secret): Separate high-entropy secret for the optional auth webhook. Configure the webhook to send it as `x-supabase-webhook-secret`.
- **Local Verification Commands:**
  - Typecheck: `npm --prefix backend run typecheck`
  - Automated Tests: `npm --prefix backend run test` (Vitest, 27 test suites, 276 tests at the 2026-10-14 local verification)
  - Production Build: `npm --prefix backend run build`
  - Dev Server: `npm --prefix backend run dev`

#### Manual scheduled task requirement

No retention-cleanup scheduler is configured in this repository. To enable seven-day cleanup, configure a trusted daily job in the backend host or an external scheduler to call `POST https://api.sharpmind.live/api/v1/auth/retention-cleanup` with `x-retention-secret` set to the backend-only `RETENTION_SECRET`. Use a dry-run request first and review its report before enabling deletion. Do not configure the scheduler until the separate secret is present in the backend environment and the endpoint has been tested against the intended Supabase project.

#### Supabase Auth and Resend settings to verify

- Keep Supabase email confirmation enabled. The confirmation email template must include the OTP token (`{{ .Token }}`); `/verify-email` accepts the configured eight-digit production code.
- Configure Supabase Auth email delivery/SMTP independently of the custom Resend templates; `RESEND_API_KEY` is used by the backend for the welcome and post-verification messages only.
- Verify `sharpmind.live` and the configured sender address in Resend, including its required DNS records, before expecting production delivery.

---

## 3. Monorepo Workspace Configuration

The root `package.json` configures npm workspaces across all three projects and shared packages:

```json
{
  "workspaces": [
    "landing",
    "web",
    "backend",
    "packages/*",
    "apps/*"
  ]
}
```

Root orchestration scripts:
- `npm run dev`: Starts the student web app development server.
- `npm run dev:landing`: Starts the public landing development server (port 3001).
- `npm run dev:web`: Starts the student web app development server (port 3000).
- `npm run dev:backend`: Starts the backend API development server (port 4000).
- `npm run build`: Sequentially executes production builds for landing, web, and backend.
- `npm run typecheck:all`: Validates TypeScript compilation across landing, web, and backend.
- `npm run test:backend`: Runs the full 25-suite backend test suite.

---

## 4. Supabase Authentication Redirects Configuration

In the Supabase Management Dashboard (**Authentication -> URL Configuration**), ensure the following redirect URLs are configured:

1. **Site URL:** `https://app.sharpmind.live`
2. **Redirect URLs:**
   - `https://app.sharpmind.live/**`
   - `https://app.sharpmind.live/app`
   - `https://app.sharpmind.live/reset-password`
   - `https://sharpmind.live/**`
   - `http://localhost:3000/**`
   - `http://localhost:3001/**`

---

## 5. Security & Credentials Notice

> [!CAUTION]
> **Credential Exposure Notice:**
> Test browser credentials (`alpmlaapmp@gmail.com`) previously committed in `AGENTS.md` and session logs should be considered compromised and rotated immediately in the remote Supabase Auth dashboard. Production credentials, service-role keys, and AI provider API keys must never be committed to source control or documented in markdown files.
