# ADR 0013: Retire the Legacy Academic Onboarding UI

- Status: Accepted
- Date: 2026-10-19

## Context

The multi-step `/onboarding` page is obsolete. New student accounts use `/complete-profile` for the required name, unique username, and class setup, and the workspace profile page remains the place to edit current profile details. Keeping links to the old wizard exposes a stale route and misleading setup prompt.

## Decision

- Remove the web `/onboarding` page and its page stylesheet, with no redirect or alias for that path.
- Remove workspace UI entry points and dashboard branching that target or depend on completion of the retired wizard.
- Keep the required `/complete-profile` flow and shared profile/domain types intact.
- Retain existing backend onboarding draft APIs and stored academic-onboarding data for compatibility; this decision removes the obsolete web experience, not persisted user data or backend API contracts.

## Consequences

- `/onboarding` is no longer exported by the web static build and should return the hosting platform's not-found response after deployment.
- Academic subjects and class remain editable through the existing profile page; diagnostic/dashboard behavior no longer waits on legacy wizard completion.
- No database migration or production data change is required.
