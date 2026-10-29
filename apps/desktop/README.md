# SharpMind for Windows

The desktop client packages the existing `web/` production export in Electron. It uses the same Supabase project, public API, accounts, authorization, and persisted student data as the web app. It has no separate database, privileged credentials, or local student-data cache.

## Prerequisites

- Windows 10/11 x64 and Node.js/npm for development and packaging.
- Root npm workspace installed with `npm ci`, and desktop tooling installed separately with `npm ci --prefix apps/desktop`.
- Public production values for `SHARPMIND_DESKTOP_SUPABASE_URL` and `SHARPMIND_DESKTOP_SUPABASE_ANON_KEY`. These are client-safe Supabase settings, not service-role credentials. `SHARPMIND_DESKTOP_API_URL` defaults to the production API; package validation rejects non-production hosts.

Copy `.env.example` values into the current shell or a private local environment file that is not committed. `scripts/build-web.cjs` forwards them to Next.js at build time, refuses localhost/preview endpoints, and validates that the Supabase key is an anon JWT or `sb_publishable_` key. These values are embedded in the renderer as public settings by design; never place a service-role or secret key in them.

## Development and tests

- From the repository root, run `npm --prefix apps/desktop run dev`. This starts the existing Next.js development server and opens it in an isolated SharpMind desktop window. DevTools are available only in development.
- Run `npm --prefix apps/desktop test` for desktop security and URL regression tests.
- Run `npm --prefix apps/desktop run typecheck` for Electron JavaScript syntax checks.
- Run `npm --prefix apps/desktop run smoke:dev` to check the login route and launch the native desktop process.

## Windows builds

- `npm --prefix apps/desktop run build:web` creates the complete production web export after validating explicit production URLs.
- `npm --prefix apps/desktop run package:dir` creates an unpacked x64 app under `apps/desktop/release/win-unpacked`.
- `npm --prefix apps/desktop run package:win` creates versioned NSIS `.exe` and MSI installers under `apps/desktop/release/`.
- On a Windows test VM, install each artifact, launch, exercise authentication and file operations with a test account, confirm shortcuts, then uninstall and verify shortcut removal. Installer QA is not implied by a successful packaging build.

## Build installers with GitHub Actions

The repository workflow at `.github/workflows/windows-desktop.yml` builds the installers on a Windows x64 runner when relevant changes are pushed to `main`, or when started manually from the GitHub **Actions** tab. It uploads the `.exe` and `.msi` as a downloadable artifact; it does not publish a GitHub Release.

Before running the workflow, add these repository variables under **Settings → Secrets and variables → Actions → Variables**:

- `SHARPMIND_DESKTOP_SUPABASE_URL` — the production Supabase project URL.
- `SHARPMIND_DESKTOP_SUPABASE_ANON_KEY` — the public anon or publishable key for that project.
- `SHARPMIND_DESKTOP_API_URL` — `https://api.sharpmind.live`.

These values are embedded in the client build and are public configuration. Never add a service-role key, Resend key, or other backend secret. After a successful run, open its **Artifacts** section and download `SharpMind-Windows-<run number>`.

The NSIS installer creates Start Menu and optional desktop shortcuts, allows choosing an install folder, and leaves encrypted auth data in user app-data on uninstall. MSI is per-user. No code-signing certificate is embedded. A release owner must use a trusted certificate and protected `CSC_LINK`/`CSC_KEY_PASSWORD` build secrets before distributing signed installers. No automatic updater is included; design and verify a signed update feed before enabling one.

## One-time service configuration

1. In Supabase Auth URL configuration, allow exact redirects `sharpmind://app/auth/callback/` and `sharpmind://app/reset-password/`. Keep existing web redirects. Ensure the signup confirmation template uses `{{ .RedirectTo }}` so it respects the requested desktop URI. Keep email confirmation enabled.
2. In the backend host's existing `CORS_ORIGIN`, preserve both web origins and append `sharpmind://app` (comma-separated). An explicitly set production environment value overrides the development default and must be changed by the deployment owner. Do not use `*` with credentials.
3. Verify the packaged public Supabase/API endpoints point to production. The package script validates those hosts but does not read or modify Vercel settings.

No schema migration is required. Desktop uses existing APIs, Supabase RLS, and the existing schema. OAuth is not implemented in the current web auth adapter; if added later, register provider callback URLs and validate the same state/deep-link flow before enabling it on desktop.

## Security and limitations

- The renderer is sandboxed and isolated from Node. IPC is restricted to validated auth-storage operations and fixed redirects. Auth data is restricted to the Supabase session key and encrypted using `safeStorage` backed by Windows DPAPI. This protects at-rest data from other Windows accounts, not malware running as the same Windows user.
- Only allowlisted HTTPS links open in the default browser. Only fixed auth callback routes/parameters are accepted by the custom protocol. Downloads use the native save dialog.
- The client requires network access for the API and Supabase. Protected/API-backed features require a connection; sensitive student data is not presented from an offline cache.
- Windows installer existence and MSI support must be checked on the actual Windows build host. Unsigned builds are development artifacts and may show SmartScreen warnings.
