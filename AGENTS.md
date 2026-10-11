# SharpMind Agent Constitution

Before every coding session, read this file, `.ai/PROJECT_CONTEXT.md`, `.ai/CURRENT_STATE.md`, `.ai/PROJECT_MAP.md`, the current phase file, and relevant ADRs. Inspect the actual repository and compare memory with code. Never assume missing work from model context.

During coding, work only on the requested phase and part, reuse existing code, preserve deployment boundaries, avoid duplicated business logic, and do not silently change database, API, auth, billing, security, or AI architecture. Significant changes require an ADR. Never fabricate data or sources, expose student data, or claim completion without verification.

After coding, run relevant tests, lint/type checks/builds and E2E where applicable; inspect the diff; update `.ai/CURRENT_STATE.md`, progress files, bugs, decisions, and `.ai/session/LAST_SESSION.md`; state the next checkpoint. If context is insufficient, stop safely and write a resumable handoff.

Notion is the source for product requirements and roadmap. Git plus `.ai/` is the source for implementation and technical state. Chat is temporary.

Required workflow: READ MEMORY → INSPECT REPOSITORY → IDENTIFY PHASE/PART → VERIFY CHECKPOINT → PLAN → IMPLEMENT → TEST → DIFF → UPDATE MEMORY → CHECKPOINT. Do not start Phase 01 without explicit `START PHASE 01`.

## Browser Verification Credentials

Whenever opening the browser to verify implementations, use the following credentials to sign in:

- Email: `alpmlaapmp@gmail.com`
- Password: `Asdfghjkl;0`

## Mandatory Vercel Deployability Policy

Before making any code edit, you MUST read `docs/architecture/VERCEL_DEPLOYABILITY_RULES.md` and follow its instructions.

Before editing:

- Inspect the current repository state and deployment configuration.
- Identify affected deployment targets and establish the relevant build/test baseline.

After every meaningful code or configuration change:

- Review the diff.
- Run relevant typechecks, tests, and production builds.
- Verify that every affected deployment target remains deployable from its configured root.
- Fix regressions before continuing.

Before finishing a task:

- Report the exact checks run and their results.
- Clearly identify any unverified deployment settings or blockers.
- Never claim deployment success without evidence.

If the rules file is missing or unreadable, stop and report the problem. Do not silently skip this policy.
