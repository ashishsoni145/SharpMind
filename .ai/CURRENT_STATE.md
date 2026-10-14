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

## 4. Verification Baseline (2026-10-11)

- `npm run typecheck:all`: 0 errors across landing, web, and backend.
- `npm run build`: 16/16 landing static pages, 36/36 web static pages, and backend `tsc` compilation succeeded cleanly (exit code 0).
- `npm --prefix backend run test`: 25 test suites, 239/239 tests passed with 0 failures.
- **Local Dev Server & Windows OneDrive Reparse Point Patch:** Fixed `patch-fs.js` to normalize `fs.Dirent.prototype.isSymbolicLink` and `isDirectory` against OneDrive reparse points on Windows. Web dev server (`npm --prefix web run dev`) actively running and serving `http://localhost:3000` with HTTP 200 on `/`, `/login`, `/app`, `/onboarding`, and `/app/classroom`.
- **UI/UX Visual Presentation Verification:** Transformed theme from cartoon claymorphism to disciplined dark Matrix-inspired engineering UI with restrained emerald accents, precision radii, stable hover feedback, and accessibility compliance. Zero business logic, API, routing, or dependency changes.

---

## 5. Security Action Items

- **Credential Rotation:** Test credentials previously committed in repo memory (`alpmlaapmp@gmail.com`) should be rotated in remote Supabase Auth.
