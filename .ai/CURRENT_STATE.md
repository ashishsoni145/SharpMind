# Current State — SharpMind

**Last Verified:** 2026-10-15
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
| **Backend** | `backend` | `npm run build` | Node CommonJS / `@vercel/node` | ✅ Verified (Exit Code 0, 276/276 tests pass at 2026-10-14 local verification) |

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
- `npm run build`: 16/16 landing static pages, 39/39 web static pages (including `/verify-email`, `/dashboard`, `/app/profile`), and backend `tsc` compilation with automated email template asset copying succeeded cleanly (exit code 0).
- `npm --prefix backend run test`: 27 test suites, 276/276 tests passed with 0 failures (including email, OTP, authorization, webhook, and retention regression coverage).
- **Phases 1, 2 & 3 Completed (2026-10-14)**:
  - **Phase 1 (Complete Email OTP Verification)**: Modernized `web/src/app/verify-email/page.tsx` with a Continue button requesting OTP through the backend rate-limited endpoint, 6-digit numeric OTP inputs with auto-advance and paste support, Supabase Auth `verifyOtp` integration across `AuthAdapter`, `SupabaseAuthAdapter`, `LocalAuthAdapter`, and `AuthContext`. Removed simulated confirmation button and demo token behavior. Added persistent, accessible verification notice banner in `WorkspaceShell` when `user && !user.isEmailVerified`, updating immediately upon authoritative session refresh.
  - **Phase 2 (OTP Rate Limiting & Verified-User Authorization)**: Implemented `20261014000002_otp_rate_limiting.sql` migration creating `otp_send_logs` with advisory-locked atomic procedure. Added `OtpRateLimitService` enforcing rolling 60-minute maximum 3 requests, 60s cooldown, case-insensitive email normalization, and neutral responses preventing user enumeration. Created `requireVerifiedEmail` middleware deriving verification status strictly from authoritative Supabase Auth data (`authUser.email_confirmed_at`), applied to AI tutor sessions, study materials, and assessment submissions.
  - **Phase 3 (Seven-Day Unverified Account Retention)**: Implemented `RetentionService.cleanupUnverifiedAccounts` with authoritative Supabase Auth cutoff (> 7 days), immediate pre-deletion verification re-check preventing race conditions, and safe batch deletion via Supabase Admin API (`supabase.auth.admin.deleteUser`). Cascades cleanly through Postgres foreign keys. Added protected `POST /api/v1/auth/retention-cleanup` endpoint.
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

## 6. Email/Auth Hardening Follow-up (2026-10-14)

- Browser email/OTP requests now use the shared API base URL resolver, so production builds target `api.sharpmind.live` instead of falling back to localhost.
- OTP limiting is fail-closed and uses only the atomic database RPC; Supabase resend failures return a retryable service error while preserving neutral account-existence messaging on successful requests.
- Resend receives stable per-user idempotency keys. Email templates escape interpolated HTML; persistent idempotency markers are written to admin-controlled `app_metadata` (legacy `user_metadata` markers remain recognized during rollout).
- Auth webhook calls require a separate `SUPABASE_AUTH_WEBHOOK_SECRET`; unsigned requests are rejected.
- Assessment routes require verified email before profile resolution. Cleanup age is fixed at seven days, checked again before deletion, and dry-run reports no longer count candidates as deleted.
- Apply `infra/supabase/migrations/20261014000003_secure_otp_rate_limiting.sql` after `20261014000002_otp_rate_limiting.sql`. OTP sending intentionally returns 503 until the atomic RPC is installed.
- No retention scheduler is configured. Configure the documented daily job only after the backend has a separate `RETENTION_SECRET` and dry-run results have been reviewed.
- Local validation: full backend suite 276/276; all workspace typechecks; backend build and template copy; web production export 39/39. `npm run lint` remains blocked because no ESLint configuration exists and `next lint` enters its first-run prompt. Production dashboards, DNS, migration application, Resend, and Supabase SMTP settings were not accessible for verification.

### Next Checkpoint

Apply migrations `20261014000002` and `20261014000003` in order, confirm Supabase Auth six-digit OTP/template and SMTP settings, configure backend email/webhook secrets and Resend sender verification, then run a controlled production signup/verification. Configure daily retention scheduling only after a reviewed dry run.



## Verification Continue Failure Follow-up (2026-10-15)

- Continue calls `POST /api/v1/auth/request-otp`; this exact unavailable message is emitted when atomic RPC `public.check_and_record_otp_send` errors or returns no row, before Supabase resend. Local route reproduction with a PostgREST `PGRST202` missing-function response returns HTTP 503 and does not call resend.
- Production migration state, logs, and deployed settings were inaccessible. A missing/unexposed RPC or a backend URL targeting a different Supabase project is the likely external cause; confirm against the backend's configured project. Apply `20261014000002` then `20261014000003` only if the RPC/table/privileges are absent.
- Added safe RPC name/code diagnostics and strengthened the exact HTTP 503 test. Verification now requires a refreshed Supabase session for the same verified user before dashboard navigation or success-email request; removed local session mutation that could mark an unrelated user verified.
- Local checks: focused OTP flow 14/14; full backend 276/276; all workspace typechecks; backend build/template copy; web production export 39/39; `git diff --check` passed. Lint is blocked by missing ESLint config and the `next lint` setup prompt. No frontend test script exists.
- Retention remains fixed at seven days with Admin API eligibility rechecks. No scheduler is configured; keep scheduling a documented manual step pending `RETENTION_SECRET` and a reviewed dry run.

### Next Checkpoint

Inspect live `/api/v1/auth/request-otp` status and safe PostgREST error code; confirm backend `SUPABASE_URL` matches the app project; apply both OTP migrations in order if needed; run controlled production signup/verification. Configure retention scheduling only after its separate secret and dry-run review.

