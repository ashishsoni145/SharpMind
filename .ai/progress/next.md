# Next

## Windows desktop release checkpoint

Set GitHub repository Actions variables `SHARPMIND_DESKTOP_SUPABASE_URL`, `SHARPMIND_DESKTOP_SUPABASE_ANON_KEY`, and `SHARPMIND_DESKTOP_API_URL=https://api.sharpmind.live`. Push the workflow to `main` or run it manually from Actions, download the uploaded `.exe`/`.msi`, then verify install/uninstall and packaged auth/file flows. Configure exact Supabase callbacks and append `sharpmind://app` to production backend `CORS_ORIGIN`. Sign installers with protected organization credentials before broad distribution; keep automatic updates disabled until a signed feed is configured.

Await User Approval of Phase 01 Completion and instruction to begin Phase 02 (Knowledge Engine & Vector Ingestion) with explicit `START PHASE 02`.

## Graphify shared agent memory setup

Graphify full-project extraction is complete and query-tested. Continue using `graphify update .` through the uv venv Python fallback on this Windows host; the standalone shim currently fails in Codex. Optional next work: curate names for generic communities if useful, while keeping sessions/credentials/student records excluded.
