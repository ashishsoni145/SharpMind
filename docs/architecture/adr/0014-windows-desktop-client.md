# ADR 0014: Windows Desktop Client

- Status: Accepted
- Date: 2026-10-20

## Context

The existing student client is a complete Next.js static export with direct Supabase Auth/data access and a shared authenticated API. A desktop distribution must retain its routes and behavior without creating another application or changing the three existing web deployment roots. Confirmation and password-reset emails need to return to the desktop client.

## Decision

- Use Electron to package the `web/` production static export in a native SharpMind window, producing NSIS `.exe` and MSI installers.
- Keep `apps/desktop` outside the root npm workspaces and give it its own lockfile, so Electron's large build toolchain does not enter the existing landing, web, or backend deployment installs.
- Serve bundled assets through the standard secure `sharpmind://app` protocol with path containment checks and restrictive CSP. Disable Node integration, enable context isolation and renderer sandbox, and expose only validated auth-storage and redirect IPC.
- Persist only Supabase auth storage through Electron `safeStorage`; on Windows this uses OS-backed encryption. Keep student records and app state on the existing shared Supabase/API services.
- Register fixed authentication callback routes for the `sharpmind:` scheme and allowlist its exact origin in backend CORS. Existing web redirects remain unchanged.
- Require explicit client-safe production API/Supabase configuration at package time. Never bundle backend, Resend, or service-role credentials.
- Do not ship an auto-updater until a signed update feed and verification policy are provisioned.

## Consequences

- Desktop and web share accounts and persisted data; desktop does not create a separate database or backend.
- Supabase must allow the callback URLs and the deployed backend must allow `sharpmind://app`; these are manual settings, not changed by this task.
- Unsigned local installers may show Windows SmartScreen warnings. Signing requires an organization certificate and protected CI signing credentials.
- Windows installer generation requires a Windows build host and downloaded packages.
