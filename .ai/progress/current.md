# Current
 
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
