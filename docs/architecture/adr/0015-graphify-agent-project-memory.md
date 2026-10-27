# ADR 0015: Graphify for Shared Agent Project Context

- Status: Accepted
- Date: 2026-10-27

## Context

Repository agents need repeatable architecture context across sessions. The existing `.ai/` files record project state and durable decisions, but do not provide a navigable graph of code and document relationships. Graphify provides a local code and project-content graph with source-linked relationships and query commands.

## Decision

- Install Graphify's project skill under `.agents/skills/graphify` and make its use a repository-wide agent requirement through `AGENTS.md`.
- Agents must query the graph before codebase exploration when a graph exists, and run `graphify update .` before each final repository response so shared project context stays current.
- Agents must verify consequential graph findings against repository source and actual build/deployment evidence. Graph output is not authoritative over source code.
- Keep product requirements, durable decisions, and session handoffs in `.ai/`; Graphify is a code/project graph, not a transcript or personal-memory store.
- Do not index secrets or student records.

## Consequences

- Project agents that read `AGENTS.md` receive the same Graphify workflow and query the shared project graph.
- The graph must be generated locally once, then incrementally refreshed; current CI/deploy roots are unaffected because Graphify is outside application package workspaces.
- As of this ADR, the project skill is installed but the CLI install timed out downloading Python wheels, so `graphify-out/` has not yet been generated. The install/build remains a follow-up checkpoint.
