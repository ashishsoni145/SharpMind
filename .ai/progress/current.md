# Current

## Cross-cutting Windows desktop client — 2026-10-20

Implemented the Electron shell, full web export integration, desktop auth session/deep-link bridge, Windows NSIS/MSI configuration, and docs (ADR 0014). Desktop tooling is isolated from root workspaces. Full monorepo build and typechecks passed; desktop security 5/5, focused email/OTP 37/37, and CORS 2/2 passed. Installer/runtime smoke remains unverified: one runtime fetch showed GitHub DNS failure; a later builder downloaded Electron but produced no artifacts before interruption. No `.exe`/`.msi` exists. See `.ai/CURRENT_STATE.md` for exact service settings and release checkpoint.

Graphify skill plus the Codex project hook are installed. Root `AGENTS.md` requires graph-first codebase exploration and a graph refresh before final repository responses. The full graph covers 484 code files, 41 documents, and 4 images (3,273 nodes, 7,007 links, 195 communities); all 45 semantic source coverage checks and source-linked query/explain checks passed. Graph integrity reports zero dangling endpoints and eight self-loops. Two sensitive CSS token files remain excluded. See `.ai/CURRENT_STATE.md` for limits and the Windows venv invocation.
 
Phase 03 — COMPLETED (Parts 01–04).
 
- **Part 01 (Curriculum & Syllabus Engine)**:
  - Database schema extension in `infra/supabase/migrations/20260918000002_curriculum_knowledge_graph_and_pyq.sql` applied to live Supabase project.
  - Extended `curriculum_nodes` with `unit` node type, `academic_year`, `version`, `status`, `learning_objectives`, and `target_exam_ids`.
  - Backend curriculum service, controller, Zod validation schemas, and routes (`/api/v1/curriculum`).
  - Unit/hierarchy integrity tests and versioning verification (`backend/src/__tests__/curriculum.test.ts`).
 
- **Part 02 (Academic Knowledge Graph Layer)**:
  - Standalone `concepts`, `concept_curriculum_mappings`, and `knowledge_graph_edges` tables.
  - PostgreSQL recursive CTE function `public.get_concept_prerequisites(target_concept_id)`.
  - Knowledge graph backend service, controller, schemas, and routes (`/api/v1/graph`).
  - Strict DAG cycle detection via `GraphService.hasPrerequisiteCycle(sourceId, targetId)` with automated tests verifying that circular prerequisite edges are rejected.
 
- **Part 03 (PYQ Data Model & Deduplication Foundation)**:
  - Extended `questions` with `concept_id`, `target_exam_id`, `marks`, `is_important`, `appearance_frequency`, `pattern_tags`, and paper codes.
  - Ingestion deduplication on `(subject_id, question_text, source_exam, source_year)` which increments `appearance_frequency` and sets `is_important = true` without duplicating rows.
  - Automated question pattern and frequency distribution analysis.
  - Seeded authentic, rationalised NCERT concepts, DAG edges, and past JEE Main, JEE Advanced, and NEET questions into live Supabase database with zero fabricated data.
 
- **Part 04 (Classroom UI Connection to Real Backend)**:
  - Enhanced `SupabaseCurriculumAdapter` in `apps/web` with live question querying, mapped concept retrieval, and authentic PYQs with fallback to canonical fixtures.
  - Enhanced `TopicDetailView`:
    - Added Academic Prerequisites & Diagnostic Readiness card with student calibration hooks (`masteryStatus`, `retentionPercent`).
    - Added interactive examination filter pills (All, JEE Main, NEET, JEE Advanced, CBSE Board).
    - Added visual badges for high-yield questions (`🔥 High Yield`), repeated question frequency (`Repeated 3x`), marks allocation (`4 Marks`), verified provenance, and pattern tags.
  - 22/22 backend integration tests passed across 4 test suites (`api`, `curriculum`, `graph`, `pyq`).
  - TypeScript compilation: 0 errors across backend and web.
  - Live dev servers verified and responding.
 
Next Checkpoint: Phase 04 — Student Model, continuous knowledge state calibration, forgetting curves, and diagnostic evidence logging.

## Cross-cutting email/auth maintenance (2026-10-14)

Completed a scoped auth/email hardening follow-up without changing the broader phase roadmap. Final local evidence: 276/276 backend tests, `npm run typecheck:all`, backend build/template copy, and web static production export 39/39 passed. Lint has no configured ESLint setup. Deployment follow-up is to apply OTP migrations `20261014000002` and `20261014000003` in order, verify Supabase Auth/SMTP and Resend settings, set server-only secrets, and perform a controlled production verification flow. No retention scheduler is currently configured.


## Verification Continue Failure Follow-up (2026-10-15)

The Continue request is `POST /api/v1/auth/request-otp`. If the atomic database RPC fails, backend returns HTTP 503 before Supabase resend. Reproduced via local Express/Supertest with a simulated PostgREST `PGRST202`; production error code and migration state remain unverified. Likely external cause: missing/unexposed limiter RPC or backend `SUPABASE_URL` targeting a different project. Added safe error-code logging and route assertions. Verification now requires refreshed verified session for the same user before dashboard redirect or success-email request. Backend 276/276 tests, all typechecks, both builds passed; lint has no ESLint config, web has no test script. Next: inspect live error/project URL, apply missing migrations in order, controlled production OTP flow. Retention scheduler remains unconfigured.

## Signup welcome-dispatch recovery follow-up — 2026-10-15

Signup now awaits the backend welcome-email result and routes the user to verification with a visible non-blocking warning if dispatch fails; signup no longer drops HTTP failure responses. Email/OTP focused tests (37/37), `npm run typecheck:all`, and web production build (39/39 static pages) passed. Production email/OTP behavior is still not confirmed. Supabase/Vercel plugins are installed/enabled but their APIs are absent from this execution context, and the browser inspector timed out; production backend URL, Resend config, and logs remain unknown. Next checkpoint: confirm backend Supabase URL and apply OTP migrations if missing, then controlled production flow.
- Signup normalizes and syntax-validates email before Supabase Auth. This does not block disposable domains; that requires a configured server-side Supabase before-user-created hook with an actively maintained domain source. The immediate authenticated dashboard requirement is incompatible with current `mailer_autoconfirm=false` behavior (signup returns no session), so no synthetic session or weakened confirmation was introduced.

## Production OTP 503 confirmation — 2026-10-16

Supabase production logs confirm POST to `check_and_record_otp_send` returned 404/PGRST202 during the reported window. SQL and migration ledger confirm the limiter RPC/table and migrations are absent on the same project. Resend shows the welcome and Supabase confirmation messages delivered; sender domain is verified. Applying existing migrations 00002 then 00003 was rejected by automatic review due to production schema/security-function impact; explicit approval is required before applying them. Vercel project/env/log reads return 403 for the current scope. Welcome CTA now opens `/verify-email?email=…&step=otp`; focused tests 37/37, typechecks, backend/web builds passed. Lint remains blocked by interactive missing ESLint config.

## OTP length alignment — 2026-10-17

- User reports the delivered Supabase OTP has 8 digits while the verification page accepted only six. Updated the page's inputs, paste handling, auto-advance, validation, and copy to accept eight digits; updated the local auth adapter and responsive box sizing.
- The Supabase adapter still forwards the submitted code unchanged to `verifyOtp`; verification type, session handling, rate limiting, and migrations are unchanged.
- `npm --prefix web run typecheck` passed. Initial production build failed with Windows `EPERM` creating `web/.next/server/app/app/library`; retry outside sandbox is required to confirm build status.
- Next checkpoint: complete the web production build, then commit/push and wait for the configured production deployment before validating with a new 8-digit OTP.

- Validation completion: the permitted retry of `npm --prefix web run build` exited 0 and exported all 39 static routes, including `/verify-email`. The earlier `EPERM` was sandbox write access only.

### Required student profile setup — 2026-10-17

Implemented OTP-success redirect to mandatory /complete-profile for student users. The page collects name, unique username, prefilled disabled email, and class. Backend endpoint accepts authenticated identity only, atomically writes profile and student grade, maps unique collisions to HTTP 409, and rejects invalid data. WorkspaceShell gates app access on completion; existing academic onboarding completion marks the profile setup flag. Added migration and ADR 0009. Migration is pending Supabase application. Focused backend tests (3/3), all workspace typechecks, backend build, and frontend production build (40 routes) pass. Full backend suite is inconclusive/fails under sandbox network restrictions; lint script prompts to configure ESLint and exits 1. No deployment or push.

### 2026-10-18 — signup duplicates, availability, and toast UX

Fixed the duplicate OTP flow by recognizing that Supabase `signUp` already sends the confirmation OTP, then entering the OTP form directly instead of calling resend through Continue. Added normalized POST email availability lookup (with safe existing-account response handling) and authenticated username availability check; database uniqueness remains authoritative. Added global 5-second dismissible toasts with countdown progress for status/error/action messaging and converted affected inline messages.

Validation: all workspace typechecks passed; focused backend regression suites passed 23/23; backend build and HTML email-template copy passed; web build exported 40 routes; `git diff --check` passed with only line-ending normalization warnings. Lint remains unavailable because the web script invokes interactive `next lint` with no ESLint config. No frontend test script, production E2E, deployment, push, production mutation, or full backend suite run. Public email availability reveals account existence; add platform edge/WAF rate limiting. Existing profile-setup migration remains pending unless already applied.

### 2026-10-18 — whole-app monochrome Tailwind UI

Built the marketing homepage requested in the design brief and applied a grayscale/tactile design-system update across the existing web workspace, auth, profile, settings, and content screens. Added Tailwind 3 + PostCSS per independent frontend root, kept CSS modules/routes, used system font stacks to remove build-time external font fetches, and preserved instructional colors in scientific simulation components. ADR 0011 records the decision. No backend/API/schema/deployment changes; no migration required.

Validation: `npm run typecheck:all` exit 0; full `npm run build` exit 0 (landing 16 routes, web 40 routes, backend build/template copy); after final landing FAQ/step changes, `npm --prefix landing run typecheck` and `npm --prefix landing run build` exit 0. `npm run lint` exits 1 at existing `next lint` ESLint configuration prompt. No frontend test script or browser E2E. `git diff --check` exit 0 (line-ending warnings). `npm install` reported nine audit advisories; status not yet investigated. No deployment, push, backend edit, or production setting change.

Next checkpoint: diff review and dependency-audit follow-up; commit/push only after review, then check preview at phone and desktop widths.

### UI navigation follow-up (2026-10-19)

In response to app UI feedback, fixed white-on-white primary controls, moved the app shell into the persistent `/app` layout, added route/content skeleton loading, and redirected the app root by auth state. PWA `start_url` now points to `/app/`. See ADR 0012. Validation passed web typecheck and production build (40 routes). Lint remains blocked by its existing interactive first-run prompt; local browser preview timed out. No backend or production configuration was changed.

## Legacy onboarding UI retirement — 2026-10-19

The requested old academic wizard at `/onboarding` has been removed with no redirect or alias. Dashboard and command-palette entry points were removed, profile actions now point to `/app/profile`, and stale classroom copy was corrected. The required `/complete-profile` setup remains. Backend onboarding APIs and profile storage types remain for compatibility and are not linked as a page. ADR 0013 records scope. Web typecheck and production build passed; the build exported 39 routes without `/onboarding`. Lint exits 1 at the existing interactive ESLint setup prompt; no web test script is configured. `git diff --check` passed. No deploy or push.
