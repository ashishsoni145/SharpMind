# SharpMind Vercel Deployability Rules

**Status:** Mandatory engineering policy for Antigravity  
**Applies to:** Every code edit, dependency change, configuration change, refactor, and feature implementation in the SharpMind repository.

## 1. Non-negotiable rule

SharpMind must remain independently deployable after every meaningful change. Before editing, establish the current deployment baseline. After editing, verify the affected deployment target again.

Do not assume that a change is deployable because TypeScript passes, the development server starts, or a previous build succeeded. Do not claim deployment readiness unless the relevant checks were actually run and their results recorded.

If a required check cannot run because of missing secrets, unavailable services, or environment limitations, state that precisely. Do not fabricate successful results.

## 2. Required domain and deployment topology

Use three independent deployment targets and domains:

| Target | Domain | Deployment target | Responsibility |
|---|---|---|---|
| Public landing site | `sharpmind.live` | Separate Vercel project | Public marketing and product pages |
| Student web application | `app.sharpmind.live` | Separate Vercel project | Authenticated SharpMind workspace |
| Backend API | `api.sharpmind.live` | Separately deployed backend service; Vercel only if the existing backend is intentionally adapted and verified for it | API, authentication/authorization enforcement, domain logic, AI orchestration, persistence access |

The current repository may use `apps/web/` and `backend/`, while earlier plans may mention `landing/`, `web/`, and `backend/`. Inspect the actual checked-out branch and repository before deciding whether to move or rename directories. Do not assume that a proposed structure already exists.

The intended end state is three independently configured deployment projects, even if they live in one monorepo. Each project must have a clear root directory, install/build commands, output configuration, environment variables, and domain assignment.

### Deployment isolation rules

- Do not create a single multi-service `vercel.json` that tries to deploy or bind all three services together.
- Do not use Vercel rewrites or service bindings as a substitute for the public API domain.
- The web application must call the backend using a configured public API base URL, normally `NEXT_PUBLIC_API_URL=https://api.sharpmind.live` for browser-visible requests.
- Use `BACKEND_URL` only for server-side calls where appropriate. Never expose private server-only secrets through `NEXT_PUBLIC_*`.
- The landing site should not depend on the authenticated app being deployed to render public pages.
- The web app should not require the landing project to be available to build or run.
- The backend must be independently buildable and deployable, with its own runtime configuration and health endpoint.
- Do not silently change the chosen domains. If a domain or deployment decision genuinely needs to change, explain why and request approval before making the architectural change.

## 3. Before every code edit

Complete these steps before changing files:

1. **Inspect repository state**
   - Check the current branch, working tree, recent relevant changes, and actual directory structure.
   - Do not overwrite unrelated user changes.
   - Identify the current deployment targets and the root directory used by each target.

2. **Read only relevant project memory**
   - Read `AGENTS.md`, `.ai/CURRENT_STATE.md`, and the relevant part of `.ai/PROJECT_MAP.md`.
   - Check the latest session handoff only when it affects the current task.
   - Read relevant ADRs and deployment documentation for changes involving architecture, authentication, environment variables, routing, database, or hosting.
   - Reconcile documentation with actual code. Repository code and verified build output take precedence over stale status claims.

3. **Establish the deployment baseline**
   - Identify which of the landing site, web app, and backend are affected.
   - Inspect each affected `package.json`, lockfile/workspace setup, TypeScript configuration, framework config, environment-variable usage, output directory, and deployment settings.
   - Verify that the intended Vercel project root and build command match the actual repository structure.
   - Identify the exact validation commands available in the repository. Do not invent script names.
   - Run the relevant baseline checks when feasible and record any pre-existing failures separately from regressions.

4. **Plan the smallest safe change**
   - Prefer a focused change over a broad rewrite.
   - Identify deployment risks, affected domains, environment variables, authentication redirects, CORS origins, API paths, and shared package dependencies.
   - If the task is ambiguous or the deployment baseline is already broken, diagnose and report that before broad implementation.

## 4. During editing

- Preserve independent build and deployment boundaries between landing, web, and backend.
- Do not introduce imports that require one Vercel project to build another project at runtime.
- Avoid cross-project filesystem imports that break when a Vercel project is built from its configured root.
- If packages are shared, use a workspace setup that Vercel can reliably install and build from the configured root, or use a deliberately maintained standalone package strategy. Do not duplicate code casually.
- Keep `package-lock.json` and workspace metadata consistent with dependency changes.
- Never commit `.env`, `.env.local`, API keys, service-role keys, passwords, or other secrets.
- Keep server-only credentials out of browser bundles and `NEXT_PUBLIC_*` variables.
- Ensure API requests use the configured API base URL instead of hardcoded localhost or preview URLs.
- Preserve authentication callback URLs and allowed origins for `sharpmind.live`, `app.sharpmind.live`, and the configured backend.
- Ensure backend CORS explicitly allows the intended production web origins. Do not solve CORS by allowing every origin with credentials.
- Avoid changing `output: 'export'`, `output: 'standalone'`, rewrites, aliases, or build commands without checking how the app is deployed and which features those settings support.
- Keep migrations, security policies, API contracts, and environment-variable changes backward-compatible unless the task explicitly calls for a coordinated migration.
- Do not mark a feature complete merely because a placeholder, mock, or local fallback renders.

## 5. After every code edit

Before calling a task complete:

1. **Inspect the diff**
   - Review all changed files.
   - Look for unrelated edits, secrets, accidental generated files, broken imports, stale environment variables, hardcoded localhost URLs, and untracked required files.

2. **Run targeted checks**
   - Run the relevant lint, typecheck, unit tests, and integration tests for the affected project.
   - Run the affected production build.
   - If shared packages or root workspace configuration changed, validate every project that consumes those packages.

3. **Validate each affected deployment target**
   - **Landing:** production build succeeds from its configured Vercel root.
   - **Web:** production build succeeds from its configured Vercel root; all internal imports resolve; client-visible API requests use the production API base URL.
   - **Backend:** production build succeeds; server starts with validated environment configuration; health endpoint works when the runtime is available.
   - **Monorepo:** the configured install command and lockfile work in the same root context that Vercel will use. Do not rely on a developer machine's undeclared packages or pre-existing `node_modules`.

4. **Check environment configuration**
   - Document required variables and identify whether each is public or server-only.
   - Confirm no production variable is silently replaced by a development fallback.
   - Check Supabase URL/key usage, auth redirect/callback configuration, CORS allowlist, API base URL, and AI provider configuration when affected.
   - Never print secret values in logs or reports.

5. **Report truthfully**
   - State exactly which commands passed, failed, or could not run.
   - Distinguish a successful local production build from a successful real Vercel deployment.
   - Do not claim DNS, SSL, custom domains, production secrets, or live integrations are verified unless actually checked.
   - If a required check fails, fix it before continuing where in scope. Otherwise stop and provide the exact blocker and next step.

## 6. Minimum deployment acceptance criteria

A change is complete only when all applicable criteria below are satisfied:

- [ ] The change is scoped and the pre-edit baseline is understood.
- [ ] The affected project builds in production mode.
- [ ] Typecheck and relevant tests pass.
- [ ] Monorepo/workspace and lockfile behavior matches the configured Vercel root.
- [ ] No unresolved imports depend on files outside the deployment context.
- [ ] No browser-facing code relies on `localhost` or an unconfigured API URL.
- [ ] No secrets are committed or exposed in client bundles.
- [ ] Auth redirects and CORS are consistent with the production domains where applicable.
- [ ] The diff contains no unrelated or accidental changes.
- [ ] `.ai/CURRENT_STATE.md` and the session handoff are updated when deployment structure, architecture, status, blockers, or verification results materially change.

## 7. Deployment failure protocol

If a project is not deployable before work begins:

1. Record the existing failure and its evidence.
2. Do not present the failure as caused by the new change.
3. Make the smallest repair needed for the requested scope.
4. Re-run the failing check and all relevant regression checks.
5. If deployment readiness depends on missing credentials, DNS access, Vercel project settings, or an external service, report the exact manual action required.

If a change breaks a previously passing production build, do not leave the task in that state. Revert or repair the regression before moving on, unless the user explicitly authorizes a temporary breaking change.

## 8. Required end-of-task report

Every implementation response must include:

- **Changed:** concise list of files and behavior changed.
- **Deployment targets affected:** landing, web, backend, or shared configuration.
- **Checks run:** exact commands and pass/fail results.
- **Production builds:** one result per affected deployable project.
- **Unverified items:** external settings or checks that could not be verified.
- **Remaining blockers:** specific and actionable, or `None`.
- **Memory updated:** state whether the project snapshot and session handoff were updated.

## 9. Final instruction

Treat Vercel deployability as a continuous invariant, not a final cleanup phase. Inspect before editing, validate after editing, and never trade away deployability for implementation speed without explicit approval.
