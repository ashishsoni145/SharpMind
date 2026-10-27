# Next

## Windows desktop release checkpoint

On a network-enabled Windows x64 host, install root and `apps/desktop` lockfiles separately, set only public production Supabase/API build settings, and run `npm --prefix apps/desktop run package:win`. Verify `.exe`/`.msi`, installation/uninstallation, and packaged auth/file flows. Configure exact Supabase callbacks and append `sharpmind://app` to production backend `CORS_ORIGIN`. Sign installers with protected organization credentials; keep automatic updates disabled until a signed feed is configured.

Await User Approval of Phase 01 Completion and instruction to begin Phase 02 (Knowledge Engine & Vector Ingestion) with explicit `START PHASE 02`.

## Graphify shared agent memory setup

Graphify full-project extraction is complete and query-tested. Continue using `graphify update .` through the uv venv Python fallback on this Windows host; the standalone shim currently fails in Codex. Optional next work: curate names for generic communities if useful, while keeping sessions/credentials/student records excluded.
