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
  - `GET /app/profile/` → HTTP 200 OK
  - `GET /onboarding/` → HTTP 200 OK
  - `GET /app/classroom/` → HTTP 200 OK

---

### Single-Page Profile Route & Menu Dropdown Refactor (2026-10-13):

1. **TopBar Menu Dropdown (`TopBar.tsx`)**:
   - Replaced old "Academic Profile" link to `/onboarding` with dedicated "Profile" link directly targeting `/app/profile`.
   - Removed obsolete "Settings & Routine" button completely from the dropdown.
   - Updated top-right academic status pill to route to `/app/profile`.
   - Updated `ROUTE_TITLES` to map `/app/profile` and `/profile` to "Student Profile".

2. **Sidebar & Command Palette**:
   - Updated `Sidebar.tsx` navigation footer to link to `/app/profile` (with user icon) instead of `/app/settings`.
   - Updated `CommandPalette.tsx` to search for `/app/profile` ("Student Profile").

3. **Unified Single-Page Profile Route (`web/src/app/app/profile/page.tsx` & `profile.module.css`)**:
   - Single clean page layout wrapped in `WorkspaceShell`.
   - Fields strictly restricted to requested items:
     - Name (Full Name input, editable)
     - Username (Username handle input with `@` prefix, editable)
     - Email (Authenticated email input, disabled, with Verified badge)
     - Current Class (Interactive buttons: Class 11, Class 12, Dropper)
     - Education Board (Shown ONLY when Class 11 or Class 12 is active; hidden when Dropper is selected)
     - Dark / Light Theme Toggle (Interactive toggle connected directly to `useTheme()` and persistent across sessions)
     - Password Option ("Change Password" section requiring verification of current password before allowing updates)
     - Save Profile Changes CTA with instant visual feedback
   - No extra clutter, no 5 phases, no unnecessary tabs or telemetry cards.

4. **Redirects & Compatibility**:
   - `web/src/app/profile/page.tsx`: Redirects `/profile` to `/app/profile`.
   - `web/src/app/app/settings/page.tsx`: Redirects legacy `/app/settings` to `/app/profile`.

5. **Adapters & Password Verification**:
   - `SupabaseSettingsAdapter`: Verifies current password via Supabase Auth before updating password; persists grade and board.
   - `LocalSettingsAdapter`: Verifies current password against stored credentials; persists changes across sessions.

6. **Complete Feature Cleanup & Database Migration (2026-10-14)**:
   - Completely removed Focus Mode (`/app/focus`), Tests & Diagnostics (`/app/tests`), Mistake Notebook (`/app/mistakes`), Spaced Revision (`/app/revision`), and Exam Readiness (`/app/readiness`).
   - Cleaned out all residues from `Sidebar.tsx` (navigation items), `TopBar.tsx` (breadcrumbs & route titles), `CommandPalette.tsx`, and `app/page.tsx` (launcher cards).
   - Generated SQL migration `20261014000001_remove_focus_tests_mistakes_revision_readiness.sql` dropping tables: `study_sessions`, `mistakes`, `exam_readiness_snapshots`, `spaced_repetition_items`, `revision_items`, `assessment_submissions`, `question_attempts`, `assessments`.

7. **Sidebar Fixed Positioning & Animated 3-Line-to-X Toggle**:
   - Locked Sidebar to `position: fixed; height: 100vh;` preventing it from scrolling with the right content column.
   - Removed the second duplicate collapse button. Replaced with single TopBar toggle with 3 lines animating smoothly into an X cross icon.

8. **Home Page & Webpack Runtime Error Resolution**:
   - Resolved `__webpack_modules__[moduleId] is not a function` by eliminating client metadata export conflicts and cleaning stale dev server webpack chunks.
   - Fixed `/` root page to render public home page sections rather than forcing a redirect to `/login` when unauthenticated.
   - Restarted `npm run dev:web` and verified both `http://localhost:3000/` and `http://localhost:3000/app/profile` return `HTTP 200 OK`.

---

### Verification Summary (2026-10-14):

- **TypeScript Typecheck:** `npm --prefix web run typecheck` passed (exit code 0).
- **Web Production Build:** `npm --prefix web run build` passed cleanly (38/38 static pages exported with exit code 0).
- **Backend Test Suite:** `npm --prefix backend run test` passed (25 test suites, 239/239 tests passed with exit code 0).
- **Dev Server Active:** `http://localhost:3000/` (HTTP 200), `http://localhost:3000/app/profile` (HTTP 200).

---

### Remaining External Blockers:

- **DNS & Vercel Dashboard Linking:** Project domains (`sharpmind.live`, `app.sharpmind.live`, `api.sharpmind.live`) must be added to their respective Vercel projects in the Vercel dashboard and DNS records pointed.
- **Supabase Allowed Redirect URLs:** Add `https://app.sharpmind.live/**` and `https://sharpmind.live/**` to the Supabase Authentication Redirect URLs in the Supabase management console.
- **Credential Rotation:** Rotate the test user password in Supabase Auth to ensure integrity.

---

### Next Checkpoint:

- Verify live production deployments on `https://sharpmind.live` and `https://app.sharpmind.live`.


