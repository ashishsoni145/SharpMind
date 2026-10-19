# ADR 0012: Persistent Workspace Navigation and App Entry

**Status:** Accepted  
**Date:** 2026-10-19

## Context

The `web/` project is the installed student application at `app.sharpmind.live`; public marketing lives in the independent `landing/` deployment. The workspace shell was rendered inside each individual `/app` page, so internal Next.js navigation remounted the shell and repeated the full-screen auth/profile setup state. The app root also still rendered the marketing homepage, and the PWA manifest launched at `/`.

## Decision

- Render `WorkspaceShell` from the shared `/app` layout and keep page contents below a route-level skeleton boundary. Authentication and required profile setup remain enforced by the existing shell.
- Route the web app root to `/app` when an auth session exists and `/login` otherwise; show a skeleton while the session is restored.
- Set the installed PWA start URL to `/app/`, so Chrome launches into the workspace route and lets the existing auth gate route signed-out users to login.
- Use high-contrast dark foreground text for controls whose monochrome primary surface is white.

## Consequences

- Sidebar, top bar, and workspace profile checks persist across client-side navigation. Route loading replaces only page content with a skeleton.
- Public marketing remains available at `sharpmind.live`; the app domain root no longer renders marketing content.
- No backend, API, auth policy, database, or deployment topology change is required.
