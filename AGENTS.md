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

## Graphify project memory (required for every agent)

- Use the Graphify skill in `.agents/skills/graphify/SKILL.md` for repository, architecture, and code relationship questions. Before searching or opening source files, query `graphify-out/graph.json` with `graphify query` when it exists. If it does not exist, install the official `graphifyy` CLI and build the project graph before answering codebase questions. If installation or graph creation is blocked, report that limitation instead of claiming Graphify was used.
- Before each final response on a repository task, run `graphify update .` so the shared graph reflects the latest repository state. The current Graphify 0.9.96 update command has no `--directed` option; the stored graph is undirected, while `path` and `explain` use directed source relationships. For a first run, use the full Graphify build flow. If no indexed files changed, Graphify may report a no-op.
- On this Windows setup, if the `graphify.exe` shim reports `ModuleNotFoundError: graphify`, invoke the installed package through `& (Join-Path (uv tool dir) 'graphifyy\Scripts\python.exe') -m graphify <arguments>` instead.
- Include this requirement in prompts to any subagent exploring SharpMind. All agents working in this repository must treat the graph as shared codebase memory.
- Graphify is a code and project-content graph, not conversational memory. Record durable product decisions and session handoffs in `.ai/` as already required. Treat graph findings as navigation evidence; verify consequential claims against source, tests, and deployment state.
- Do not put credentials, student records, or other secrets into Graphify inputs or outputs.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (code AST refresh; no external API needed for this code-only corpus).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
