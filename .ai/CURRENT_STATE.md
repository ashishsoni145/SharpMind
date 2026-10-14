# Current State — SharpMind

**Last Verified:** 2026-10-11  
**Architecture:** Tri-Project Monorepo with Strict Domain Separation & Continuous Vercel Deployability  
**Topology:**
- `landing/` → `https://sharpmind.live` (Public Marketing & Landing Site)
- `web/` → `https://app.sharpmind.live` (Student Academic OS Workspace)
- `backend/` → `https://api.sharpmind.live` (Express API Server & Vercel Serverless Function)

---

## 1. Verified Deployment Status

All three deployment targets build independently from their configured project roots:

| Project | Configured Vercel Root | Build Command | Output Mode | Status |
|---|---|---|---|---|
| **Landing** | `landing` | `npm run build` | Next.js 15 Static Export (16/16 routes) | ✅ Verified (Exit Code 0) |
| **Web** | `web` | `npm run build` | Next.js 15 Static Export (36/36 routes) | ✅ Verified (Exit Code 0) |
| **Backend** | `backend` | `npm run build` | Node CommonJS / `@vercel/node` | ✅ Verified (Exit Code 0, 239/239 tests pass) |

---

## 2. Domain & API Architecture

- **Public Landing (`landing/`):**
  - Completely decoupled from Supabase client authentication and backend databases.
  - CTAs point directly to `https://app.sharpmind.live/signup` and `https://app.sharpmind.live/login`.
- **Student Web Application (`web/`):**
  - Root route (`/`): Dynamically routes authenticated sessions to `/app` (Dashboard) and unauthenticated visitors to `/login`.
  - API Client: Centralized in `web/src/lib/api.ts`, using `NEXT_PUBLIC_API_URL=https://api.sharpmind.live`.
  - Supabase Auth: Sessions hydrated via remote Supabase instance (`https://vscprtuinxopistikpcs.supabase.co`).
- **Backend API (`backend/`):**
  - Dual deployment: Vercel serverless function entrypoint (`api/index.ts` with `vercel.json`) + standalone long-running server (`src/server.ts`).
  - Production health checks: `GET /health` and `GET /api/v1/health` (status, uptime, version), `GET /api/v1/health/db` (live Supabase connection ping).
  - CORS Allowlist: Restricts browser requests strictly to `https://sharpmind.live` and `https://app.sharpmind.live` in production.

---

## 3. Implemented Capabilities Baseline

- **Phases 01–07 Completed:**
  - Authenticated Web Shell, Command Palette (`Cmd+K`), Theme Switcher.
  - Supabase Database (41 tables with 100% Row Level Security).
  - Curriculum Engine (NCERT Class 11-12 across Physics, Chemistry, Math, Biology).
  - Academic Knowledge Graph with DAG cycle detection.
  - Verified PYQ Question Bank (JEE Main, JEE Advanced, NEET).
  - Persistent Student Model (BKT + exponential retention decay).
  - Diagnostic Cold-Start Assessment & Adaptive Backlog.
  - Adaptive Study Planner & SM-2 Spaced Repetition Engine.
  - NTA-Style Test Runner & Behavioral Post-Test Diagnostics.
  - Mistake Notebook with 10 root-cause error classifications.
  - Grounded 8-Factor Exam Readiness Gauge & Target Simulator.
  - Socratic AI Tutor Engine (10 modes with anti-answer-leak guardrails).
  - Provider-Agnostic Model Router (Gemini, Groq, OpenRouter).
  - Pre-signed Direct Storage Uploads (`sharpmind_files` bucket).
  - Distraction-Free Focus Studio & Academic Health Score.
  - 14 Interactive STEM Visual Simulations.

---

## 4. Verification Baseline (2026-10-14)

- `npm run typecheck:all`: 0 errors across landing, web, and backend.
- `npm run build`: 16/16 landing static pages, 39/39 web static pages (including `/dashboard`, `/verify-email`, `/app/profile`, `/profile`), and backend `tsc` compilation with automated email template asset copying succeeded cleanly (exit code 0).
- `npm --prefix backend run test`: 26 test suites, 257/257 tests passed with 0 failures (including 18 email integration tests).
- **Review Issue Fixes (2026-10-14)**:
  - Immediate in-memory idempotency key reservation before `await` in `EmailService`, with automatic failure-release on dispatch errors.
  - Functional test flow restoration in `/app/tests` for active dashboard links.
  - OS `prefers-color-scheme` resolution for `system` theme in layout anti-flash script.
  - Viewport-aware hamburger/cross toggle in `TopBar` using 900px breakpoint and accurate ARIA attributes.
  - Secure password hashing and strict persistence validation in local settings and auth adapters.
- **Email System Integration (2026-10-14)**:
  - Created responsive HTML templates: `backend/src/emails/templates/welcome.html` (7-day notice, verify button to `app.sharpmind.live/verify-email`, non-automatic notice, fallback URL) and `backend/src/emails/templates/verification-success.html` (success confirmation, open button to `app.sharpmind.live/dashboard`).
  - Implemented `EmailService` (`backend/src/emails/email.service.ts`): Resend client integration, authoritative Supabase Auth verification gating (`email_confirmed_at`), safe PII log masking, dual-layer idempotency (in-memory TTL + Supabase user metadata), and robust fallback template resolution.
  - Implemented `/api/v1/auth/welcome-email`, `/api/v1/auth/verification-success-email`, and `/api/v1/auth/webhook` in `backend/src/modules/auth/`.
  - Added seamless `/dashboard` redirect page (`web/src/app/dashboard/page.tsx`) routing directly into the active student workspace (`/app`).
- **Dev Server Active (`npm run dev:web`)**:
  - `GET /` → HTTP 200 OK
  - `GET /app/profile` → HTTP 200 OK
  - `GET /app` → HTTP 200 OK
  - `GET /login` → HTTP 200 OK
  - `GET /profile` → HTTP 307 redirect to `/app/profile`
- **Bug Fixes (2026-10-14 Morning)**:
  - **OneDrive Sync Conflict Resolution**: Restored 21 files that were renamed to `*-AashishHP.*` during directory relocation and removed all duplicate conflict copies.
  - **Windows `fs.Dirent` Reparse Tag Patch**: In `web/patch-fs.js` and `landing/patch-fs.js`, patched `fs.Dirent.prototype.isFile` to fall back to `statSync(path).isFile()` when libuv flags reparse tags as `UV_DIRENT_LINK`, allowing Next.js `getFilesInDir` to reliably discover all app router pages on Windows.
  - **Static Export Suspense Bailout**: Replaced top-level `useSearchParams()` call in `useProtectedRoute` with safe `window.location.search` inside `useEffect`, preventing static generation CSR bailout errors across all `/app` pages.

---

## 5. Security Action Items

- **Credential Rotation:** Test credentials previously committed in repo memory (`alpmlaapmp@gmail.com`) should be rotated in remote Supabase Auth.


