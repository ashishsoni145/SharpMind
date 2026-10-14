# Last Session Handoff

**Session:** Domain Separation, Web App Architecture & Continuous Vercel Deployability  
**Completed On:** 2026-10-11  
**Status:** Completed & Fully Verified  

---

### What Was Accomplished:

1. **Independent Tri-Project Topology Established:**
   - Established three decoupled projects in the monorepo matching the required domain topology:
     - `landing/` → `https://sharpmind.live` (Public marketing, product pages, CTAs)
     - `web/` → `https://app.sharpmind.live` (Student workspace, onboarding, dashboard, classrooms, tutor, tests)
     - `backend/` → `https://api.sharpmind.live` (API server, domain logic, AI orchestrator, persistence)
   - Updated root `package.json` workspaces to `["landing", "web", "backend", "packages/*", "apps/*"]` with unified orchestration scripts (`dev`, `build`, `typecheck:all`).

2. **Public Landing Project (`landing/`):**
   - Created standalone Next.js 15 project in `landing/` with static export configuration (`output: 'export'`).
   - Self-contained UI components, styles, design tokens, and metadata.
   - Primary CTAs ("Log In", "Get Started Free") configured to route directly to `https://app.sharpmind.live` via `NEXT_PUBLIC_APP_URL`.
   - Verified independent static export: 16/16 pages exported cleanly with zero authentication or database dependencies.

3. **Student Web Application (`web/`):**
   - Restructured from `apps/web` to `web/` preserving 100% of existing components, adapters, simulations, and routes.
   - Root route (`/`) configured to automatically route authenticated users to `/app` (Dashboard) and unauthenticated visitors to `/login`.
   - Centralized API base URL resolution in `web/src/lib/api.ts` to use `NEXT_PUBLIC_API_URL` (defaulting to `https://api.sharpmind.live/api/v1` in production, with `http://localhost:4000/api/v1` dev fallback).
   - Dynamic monorepo root resolution in `web/next.config.ts` supporting both monorepo and hoisted/standalone Vercel builds.
   - Verified independent static export: 36/36 pages exported cleanly.

4. **Backend API Server & Vercel Serverless Function (`backend/`):**
   - Created Vercel serverless function entrypoint (`backend/api/index.ts`) and `backend/vercel.json` with route rewrites.
   - Preserved `src/server.ts` (`dist/server.js`) for long-running Node.js/Docker/Render server deployments.
   - Production health endpoints verified: `GET /health` and `GET /api/v1/health`.
   - CORS origin validation updated in `backend/src/config/env.ts` to allow `https://sharpmind.live` and `https://app.sharpmind.live` in production.
   - Updated `visual-learning.test.ts` to resolve simulation contracts from `web/`.

5. **Architecture Documentation & Deployment Policy:**
   - Created `docs/architecture/DEPLOYMENT_ARCHITECTURE.md` specifying roots, commands, domains, runtime assumptions, and environment variables.
   - Enforced `docs/architecture/VERCEL_DEPLOYABILITY_RULES.md` as continuous before/after edit policy.
   - Reconciled `.ai/CURRENT_STATE.md`, `.ai/PROJECT_MAP.md`, and `.ai/PROJECT_CONTEXT.md`.
   - Flagged legacy test credentials in documentation and recommended rotation.

---

### Verification Results:

- **TypeScript Compilation (`npm run typecheck:all`):**
  - `npm --prefix landing run typecheck`: Passed (0 errors).
  - `npm --prefix web run typecheck`: Passed (0 errors).
  - `npm --prefix backend run typecheck`: Passed (0 errors).
- **Automated Test Suite (`npm --prefix backend run test`):**
  - 25/25 test suites passed, 239/239 tests passed with 0 failures in 36.42s.
- **Production Builds (`npm run build`):**
  - Landing: Next.js 15 production build completed cleanly (16/16 static pages exported).
  - Web: Next.js 15 production build completed cleanly (36/36 static pages exported).
  - Backend: TypeScript compilation succeeded (`dist/server.js` and `dist/api/index.js` generated).

---

### Visual Presentation & UI/UX Enhancement (Matrix Modern Engineering Aesthetic):
- **Design Tokens & Theme System**: Replaced cartoon claymorphic tokens with disciplined dark engineering surfaces, precision radii (4px-18px), and restrained Matrix emerald accents (`#10b981`, `rgba(16, 185, 129, 0.18)`).
- **Stable Interaction States**: Eliminated layout-shifting `scale(1.03)` / `scale(1.02)` hover transforms in favor of stable 1-2px lifts, crisp border highlights, and non-jittery transitions.
- **Accessibility & Focus**: Added WCAG AA compliant `:focus-visible` emerald rings on all interactive components (`Button`, `Input`, `searchBtn`, navigation) and added a global `prefers-reduced-motion` block.
- **Component Polish**: Refined `Button`, `Card`, `Badge`, `Input`, `Sidebar`, `TopBar`, `CommandPalette`, `NotificationsDrawer`, `LoginPage`, and `WorkspaceDashboard` across `web/` and `landing/`.
- **Zero Business Logic/API/Route/Dependency Changes**: Strictly scoped to visual CSS and design tokens. All tests (239/239) and production builds (36/36 web, 16/16 landing) pass with 0 errors.

---

### Local Development Server Execution & Windows OneDrive Reparse Point Patch:
- **Root Cause & Diagnosis:** When launching `next dev` on Windows within a OneDrive-synced folder, OneDrive assigns reparse points (`IO_REPARSE_TAG_ONEDRIVE`) to generated build folders (e.g. `.next/static/<buildId>`). Node.js libuv flagged these entries as `UV_DIRENT_LINK` (`dirent.isSymbolicLink() === true`), causing Next.js `recursiveDelete` to invoke `fs.promises.readlink`, which threw unhandled `EINVAL: invalid argument` (-4071) errors.
- **Resolution:** Enhanced `web/patch-fs.js` and `landing/patch-fs.js` to intercept `fs.Dirent.prototype.isSymbolicLink` and `fs.Dirent.prototype.isDirectory` on Windows, falling back to `fs.lstatSync` to distinguish real symbolic links from OneDrive directory reparse points.
- **Local Dev Server Verified:** `npm --prefix web run dev` started cleanly on `http://localhost:3000`, serving:
  - `GET /` → HTTP 200 OK
  - `GET /login/` → HTTP 200 OK
  - `GET /app/` → HTTP 200 OK
  - `GET /onboarding/` → HTTP 200 OK
  - `GET /app/classroom/` → HTTP 200 OK

---

### Remaining External Blockers:

- **DNS & Vercel Dashboard Linking:** Project domains (`sharpmind.live`, `app.sharpmind.live`, `api.sharpmind.live`) must be added to their respective Vercel projects in the Vercel dashboard and DNS records pointed.
- **Supabase Allowed Redirect URLs:** Add `https://app.sharpmind.live/**` and `https://sharpmind.live/**` to the Supabase Authentication Redirect URLs in the Supabase management console.
- **Credential Rotation:** Rotate the test user password in Supabase Auth to ensure integrity.

---

### Next Checkpoint:

- Verify live production deployments on `https://sharpmind.live` and `https://app.sharpmind.live`.

