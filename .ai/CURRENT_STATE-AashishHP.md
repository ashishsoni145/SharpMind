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
- `npm run build`: 16/16 landing static pages, 38/38 web static pages (including new `/app/profile` and `/profile`), and backend `tsc` compilation succeeded cleanly (exit code 0).
- `npm --prefix backend run test`: 25 test suites, 239/239 tests passed with 0 failures.
- **TopBar Dropdown & Unified Single-Page Profile Route:**
  - Removed "Settings & Routine" and obsolete onboarding links from TopBar dropdown.
  - User menu routes directly to `/app/profile`.
  - Replaced 5-tab settings view with a dedicated, single-page Profile page containing Name, Username, Email, Current Class (Class 11, Class 12, Dropper), conditionally rendered Education Board (shown for Class 11/12, hidden for Droppers), seamless Dark/Light theme toggle, and a secure Password Change section requiring verification of the current password before updating.
  - Redirects established for `/profile` and `/app/settings` to `/app/profile`.
- **Feature Cleanup & Database Deprecation:**
  - Removed Focus Mode (`/app/focus`), Tests & Diagnostics (`/app/tests`), Mistake Notebook (`/app/mistakes`), Spaced Revision (`/app/revision`), and Exam Readiness (`/app/readiness`).
  - Removed all residue from left Sidebar navigation, TopBar route titles, Command Palette, and Dashboard launcher cards.
  - Deprecated routes redirect to `/app`.
  - Migration `20261014000001_remove_focus_tests_mistakes_revision_readiness.sql` created to drop unused tables: `study_sessions`, `mistakes`, `exam_readiness_snapshots`, `spaced_repetition_items`, `revision_items`, `assessment_submissions`, `question_attempts`, `assessments`.
- **Fixed Sidebar & Single Animated Toggle:**
  - Pinned sidebar to `position: fixed; height: 100vh;` preventing it from scrolling with the right content column.
  - Replaced dual collapse buttons with a single TopBar button whose 3 lines smoothly animate into an 'X' cross icon.
- **Home Navigation & Webpack Runtime Error Fix:**
  - Fixed `/` root page to render public home page sections rather than forcing a redirect to `/login` when unauthenticated.
  - Resolved `__webpack_modules__[moduleId] is not a function` by eliminating client metadata export conflicts and cleaning stale dev server webpack chunks.
  - Dev server verified: `GET /` (HTTP 200) and `GET /app/profile` (HTTP 200).

---

## 5. Security Action Items

- **Credential Rotation:** Test credentials previously committed in repo memory (`alpmlaapmp@gmail.com`) should be rotated in remote Supabase Auth.

