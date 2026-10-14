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

9. **OneDrive Relocation Conflict Resolution & Dirent `isFile` Patch**:
   - Following directory relocation to `C:\Users\aashi\Desktop\mind`, restored 21 modified files that were quarantined into `*-AashishHP.*` copies by OneDrive sync, and removed duplicate conflict files.
   - Diagnosed and fixed Windows filesystem Dirent behavior: patched `fs.Dirent.prototype.isFile` in `web/patch-fs.js` and `landing/patch-fs.js` so `next-app-loader`'s `getFilesInDir` correctly recognizes app router page files even when tagged with `UV_DIRENT_LINK`.
   - Replaced top-level `useSearchParams()` in `useProtectedRoute` with `window.location.search` inside `useEffect`, enabling seamless static export.
   - Restarted `npm run dev:web` and verified `http://localhost:3000/`, `http://localhost:3000/app/profile`, `http://localhost:3000/app`, and `http://localhost:3000/login` all return `HTTP 200 OK`.

### Email Template Creation & Resend Integration (2026-10-14):

1. **Email Templates Created**:
   - `backend/src/emails/templates/welcome.html`:
     - Responsive table layout with inline CSS for cross-client compatibility.
     - Brand name: SharpMind with gradient header.
     - Heading: "Welcome to SharpMind".
     - Message with clear notice: verification must be completed within **7 days**.
     - Prominent CTA button: **Verify your account** linking to `https://app.sharpmind.live/verify-email?email={{email}}`.
     - Fallback plain-text URL block.
     - Note explaining that opening the link alone does not verify the account (must complete verification on the portal).
     - Footer linking to `https://sharpmind.live`.
   - `backend/src/emails/templates/verification-success.html`:
     - Responsive table layout with inline CSS.
     - Brand name: SharpMind with verified badge.
     - Heading: "Email verified successfully".
     - Confirmation message that account is active and secure.
     - Prominent CTA button: **Open SharpMind** linking to `https://app.sharpmind.live/dashboard`.
     - Footer linking to `https://sharpmind.live`.

2. **Template Asset Loading & Build Architecture**:
   - Created `backend/scripts/copy-templates.js` to automatically copy HTML templates from `src/emails/templates/` to `dist/emails/templates/` on `npm run build`.
   - Updated `backend/package.json` build script: `"build": "tsc && node scripts/copy-templates.js"`.
   - Implemented multi-location template discovery in `EmailService` with embedded inline HTML fallbacks so template loading never fails regardless of environment.

3. **Reusable Email Service (`backend/src/emails/email.service.ts`)**:
   - Server-only Resend SDK integration via `RESEND_API_KEY`.
   - Default sender `SharpMind <noreply@sharpmind.live>` (configurable via `EMAIL_FROM`).
   - Non-blocking email dispatch: failure to deliver email never causes signup or verification to fail.
   - PII log masking (`maskEmail`) preventing exposure of sensitive email addresses or credentials.
   - Dual-layer idempotency (in-memory TTL cache + persistent Supabase `user_metadata` markers `welcome_email_sent_at` and `verification_success_email_sent_at`) preventing duplicate email dispatch on retries.
   - Authoritative Supabase Auth verification gating:
     - `sendWelcomeEmail` checks `supabase.auth.admin.getUserById(userId)` ensuring only real Supabase users receive emails (rejects arbitrary unauthenticated requests).
     - `sendVerificationSuccessEmail` checks authoritative `user.email_confirmed_at` from Supabase Auth; never trusts frontend flags.

4. **API Endpoints & Web Integration**:
   - Created `backend/src/modules/auth/auth.controller.ts` and `auth.routes.ts` mounted at `/api/v1/auth`.
   - Endpoints: `POST /api/v1/auth/welcome-email`, `POST /api/v1/auth/verification-success-email`, and `POST /api/v1/auth/webhook`.
   - Added `web/src/app/dashboard/page.tsx` redirecting `/dashboard` to the main student app at `/app`.
   - Added non-blocking dispatch triggers in `web/src/app/signup/page.tsx` and `web/src/app/verify-email/page.tsx`.

---

### Verification Summary (2026-10-14):

- **TypeScript Typecheck:**
  - `npm --prefix web run typecheck`: Passed (exit code 0).
  - `npm --prefix backend run typecheck`: Passed (exit code 0).
  - `npm run typecheck:all`: Passed across all packages.
- **Backend Build & Asset Copying:** `npm --prefix backend run build` passed (`tsc && node scripts/copy-templates.js` copied all templates to `dist/emails/templates/`).
- **Web Production Build:** `npm --prefix web run build` passed cleanly (39/39 static pages exported with exit code 0).
- **Backend Test Suite:** `npm --prefix backend run test` passed (26 test suites, 260/260 tests passed with exit code 0, including 21 email integration tests).
- **Review Issues Resolved:**
  1. Removed `sendRawEmail` failure-path calls to `releaseIdempotent` so concurrent caller reservations are preserved.
  2. Implemented `inFlightDispatches` pending-result tracking in `sendWelcomeEmail` and `sendVerificationSuccessEmail` to propagate exact outcome to concurrent callers without premature duplicate success.
  3. Added recipient name normalization (`.trim()`) and pre-dispatch exception cleanup releasing reservations on render/pipeline errors.
  4. Derived dynamic marking scheme text in `web/src/app/app/tests/page.tsx` from `test.markingScheme` and `currentQ.negativeMarks` / `activeSession.assessment.markingScheme`.
  5. Decoupled timer countdown loop into a pure updater and triggered auto-submission in a separate ref-guarded effect with in-flight submission guard (`isSubmittingRef`).
  6. Added autosave for blank numerical inputs (`numericalAnswer: null`, `status: 'unanswered'`) and explicit clear-response submissions.
  7. Resolved Webpack runtime error `Cannot find module './157.js'` by clearing `.next` cache and verified live HTTP 200 responses on `/app` and `/app/tests`.
- **Dev Server Active:** `http://localhost:3000/` (HTTP 200), `http://localhost:3000/app/tests` (HTTP 200), `http://localhost:3000/app` (HTTP 200), `http://localhost:3000/app/profile` (HTTP 200), `http://localhost:3000/login` (HTTP 200).

---

### Email Verification System Phases 1, 2 & 3 Completed (2026-10-14):

1. **Phase 1: Complete Email OTP Verification**:
   - `web/src/app/verify-email/page.tsx`:
     - Clean heading "Verify your email", email display, and Continue button triggering OTP request through rate-limited backend endpoint `POST /api/v1/auth/request-otp`.
     - 6-digit numeric OTP inputs with auto-advance, backspace handling, and paste support.
     - Supabase Auth email verification integration (`verifyOtp`) with clear error messaging for incorrect, expired, and invalid codes.
     - Resend cooldown timer and rolling-window rate-limit feedback.
     - Non-blocking post-verification success email dispatch and automatic session refresh before redirecting to `/app`.
     - Completely removed simulated button and demo token behavior from production UI.
   - `web/src/lib/adapters/auth/`:
     - Updated `AuthAdapter` interface to include `verifyOtp`.
     - Implemented `verifyOtp` in `SupabaseAuthAdapter` via `supabase.auth.verifyOtp({ email, token, type: 'signup' })`.
     - Implemented `verifyOtp` in `LocalAuthAdapter` for consistent mock/local development.
     - Exposed `verifyOtp` and `refreshSession` in `useAuth()` (`auth-context.tsx`).
   - `web/src/components/workspace/WorkspaceShell.tsx`:
     - Persistent, responsive, and accessible (`role="alert"`) verification banner shown when `user && !user.isEmailVerified`.
     - Informs student that email verification is required within 7 days.
     - Direct CTA button linking to `/verify-email?email=...`.
     - Disappears immediately upon authoritative session refresh when Supabase confirms verification.

2. **Phase 2: OTP Rate Limiting & Verified-User Authorization**:
   - Database Migration (`infra/supabase/migrations/20261014000002_otp_rate_limiting.sql`):
     - Created `public.otp_send_logs` table with indices on `(email, requested_at DESC)` and `requested_at`.
     - Created atomic advisory-locked stored procedure `public.check_and_record_otp_send` preventing concurrent race condition bypasses across multiple server instances.
     - Stored procedure `public.cleanup_expired_otp_logs` for periodic pruning.
   - `OtpRateLimitService` (`backend/src/modules/auth/otp-rate-limit.service.ts`):
     - Enforces rolling 60-minute window (maximum 3 requests) and 60-second cooldown per normalized email.
     - Email normalization (`trim().toLowerCase()`).
     - Safe responses preventing user enumeration.
   - `requireVerifiedEmail` Authorization Guard (`backend/src/middleware/authorization.ts`):
     - Derives verification status strictly from authoritative Supabase Auth data (`authUser.email_confirmed_at`). Stale profile flags cannot bypass verification.
     - Applied to AI tutor routes (`/api/v1/tutor`), study material routes (`/api/v1/materials`), and assessment start/submit endpoints (`/api/v1/assessments/:id/start`, `/api/v1/assessments/submissions/:submissionId/submit`).
     - Preserves access to public routes, auth endpoints, and `/api/v1/users/me`.

3. **Phase 3: Seven-Day Unverified Account Retention**:
   - `RetentionService` (`backend/src/modules/auth/retention.service.ts`):
     - Scans Supabase Auth users via `supabase.auth.admin.listUsers`.
     - Filters for accounts older than 7 days where `email_confirmed_at === null`.
     - **Pre-deletion race-condition prevention**: performs an immediate authoritative check via `supabase.auth.admin.getUserById` immediately before deletion; if the student verified in the interim, deletion is aborted.
     - Deletes eligible expired accounts via Supabase Admin API `supabase.auth.admin.deleteUser` (never raw SQL on `auth.users`).
     - Cascades cleanly to `profiles` and dependent tables via Postgres foreign keys (`ON DELETE CASCADE`).
     - Idempotent execution with batching, dry-run support, and aggregate reporting.
   - Protected Route (`POST /api/v1/auth/retention-cleanup`):
     - Requires secret header `x-retention-secret` or authenticated admin session.

---

### Verification Summary (2026-10-14):

- **TypeScript Typecheck:**
  - `npm --prefix web run typecheck`: Passed (exit code 0).
  - `npm --prefix backend run typecheck`: Passed (exit code 0).
  - `npm run typecheck:all`: Passed across all packages.
- **Backend Build & Asset Copying:** `npm --prefix backend run build` passed (`tsc && node scripts/copy-templates.js` copied all templates to `dist/emails/templates/`).
- **Web Production Build:** `npm --prefix web run build` passed cleanly (39/39 static pages exported with exit code 0).
- **Backend Test Suite:** `npm --prefix backend run test` passed (27 test suites, 271/271 tests passed with exit code 0, including 11 tests in `otp-verification-flow.test.ts`).
- **Dev Server Active:** `http://localhost:3000/verify-email/` (HTTP 200), `http://localhost:3000/app/tests` (HTTP 200), `http://localhost:3000/app` (HTTP 200), `http://localhost:3000/app/profile` (HTTP 200), `http://localhost:3000/login` (HTTP 200).

---

### Remaining External Blockers:

- **Resend Domain Verification:** Verify domain `sharpmind.live` in the Resend dashboard (add DKIM, SPF, and DMARC DNS records). For local testing or before domain verification, `EMAIL_FROM=onboarding@resend.dev` can be used.
- **Environment Variable Configuration:** Set `RESEND_API_KEY` in `backend/.env` (and Vercel/backend hosting environment variables).
- **Scheduled Retention Trigger:** Configure cron job (e.g. GitHub Actions, Vercel Cron, or Supabase pg_cron) to invoke `POST /api/v1/auth/retention-cleanup` daily with the `x-retention-secret` header.
- **DNS & Vercel Dashboard Linking:** Project domains (`sharpmind.live`, `app.sharpmind.live`, `api.sharpmind.live`) must be added to their respective Vercel projects in the Vercel dashboard.

---

### Next Checkpoint:

- Verify live production deployments and test email delivery through Resend once `RESEND_API_KEY` is added to production.

### Email/Auth Error Diagnosis and Fixes (2026-10-14)

- **Root causes fixed:** browser auth-email calls used a localhost fallback rather than the centralized production API base; OTP database/RPC failures fell back to non-atomic in-memory/direct-table logic; Supabase resend failures were reported as success; email endpoints reported success for failed dispatches; Resend had no provider idempotency key; user-provided HTML template values were unescaped; auth webhook accepted unsigned calls; assessment routes did not gate every endpoint; retention accepted a caller-controlled age and did not recheck age immediately before deletion.
- **Changes:** shared API URL resolver used by signup/verification; fail-closed OTP RPC path and safe 503 responses; stable Resend idempotency keys; HTML escaping; idempotency marker writes to admin-controlled `app_metadata`; webhook shared-secret check; verified-email guard at the assessment router; fixed seven-day retention cutoff, pre-delete age check, safe batch cap, correct dry-run counts; deployment env and scheduler documentation.
- **Migrations:** apply `20261014000002_otp_rate_limiting.sql` if absent, then `20261014000003_secure_otp_rate_limiting.sql`. The second migration preserves already-applied history while restricting table/function permissions and setting safe function search paths.
- **Checks:** `npm --prefix backend run test` passed (27 suites, 276 tests); `npm run typecheck:all` passed; `npm --prefix backend run build` passed and copied both HTML templates; `npm --prefix web run build` passed with 39/39 static routes. `npm run lint` could not run because Next prompts for initial ESLint configuration and the repository has none. Frontend test script is not defined.
- **External blockers:** production Resend, Supabase Auth SMTP/OTP template, project environment variables, migration status, Vercel roots/domains, and backend host settings were not accessible. No retention scheduler is configured; a separate `RETENTION_SECRET`, a reviewed dry run, and a trusted daily schedule are required. Configure `SUPABASE_AUTH_WEBHOOK_SECRET` only if the optional webhook is used.

### Next Checkpoint

Apply both OTP migrations in order, verify Supabase Auth's six-digit `{{ .Token }}` email and SMTP settings, set the required server-only Resend/webhook/retention secrets on the backend host, verify the Resend sender domain, then run a controlled signup/OTP verification against the deployed environment. Enable retention scheduling only after reviewing a dry-run report.



