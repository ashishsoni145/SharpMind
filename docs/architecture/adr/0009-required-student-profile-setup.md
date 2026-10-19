# ADR 0009: Require Minimum Student Profile Setup Before Workspace Access

- Status: Accepted
- Date: 2026-10-17

## Context

New student accounts must supply a display name, a globally unique username, and an academic class after email verification and before entering the workspace. The former optional academic onboarding wizard UI has been retired; this minimum profile setup remains the only required first-run setup gate.

## Decision

- Track this one-time gate with `student_profiles.profile_setup_completed`, independently from `onboarding_completed`.
- Store usernames on `profiles` and enforce global case-insensitive uniqueness with a PostgreSQL unique index.
- Complete name, username, and grade atomically through a backend-authenticated RPC. The RPC is executable only by the backend service role; the user ID comes from the verified request identity.
- Redirect verified students to a required profile setup page until completion. Non-student roles are not asked for a student class.
- Mark students who already completed academic onboarding as having completed the minimum profile setup during migration backfill.

## Consequences

- Migration `20261017000001_required_student_profile_setup.sql` must be applied before deploying the backend and frontend changes.
- The global unique index is the authority for race-safe username availability; UI prechecks alone are insufficient.
- Existing profile settings can update usernames and receive a conflict response when another profile already owns the normalized name.
