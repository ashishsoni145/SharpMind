# Next

## Windows desktop release checkpoint

On a network-enabled Windows x64 host, install root and `apps/desktop` lockfiles separately, set only public production Supabase/API build settings, and run `npm --prefix apps/desktop run package:win`. Verify `.exe`/`.msi`, installation/uninstallation, and packaged auth/file flows. Configure exact Supabase callbacks and append `sharpmind://app` to production backend `CORS_ORIGIN`. Sign installers with protected organization credentials; keep automatic updates disabled until a signed feed is configured.

Await User Approval of Phase 01 Completion and instruction to begin Phase 02 (Knowledge Engine & Vector Ingestion) with explicit `START PHASE 02`.
