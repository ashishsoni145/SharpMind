# ADR 0010: Signup Availability Feedback and Transient Notices

- Status: Accepted
- Date: 2026-10-18

## Context

The signup UI could request an OTP immediately after Supabase `signUp` had already sent the signup confirmation code. Users then received duplicate OTP messages. Signup also lacked timely feedback when an email was already registered, and required notices were rendered through mixed inline banners and status text.

## Decision

- Treat Supabase signup as the initial OTP dispatch. Successful remote signup opens the OTP entry step directly; a new OTP is sent only from the explicit rate-limited resend action.
- Expose a public email-availability endpoint that returns only an availability boolean, with request data in the body rather than the URL. Debounce browser checks and still handle Supabase's obfuscated-existing-user response and database uniqueness races.
- Require authentication for username-availability checks. The database's case-insensitive unique index and signup-profile completion RPC remain authoritative.
- Use a shared app-wide toast for user-facing errors, successes, and action notices. Toasts dismiss after five seconds, show a draining progress indicator, can be dismissed immediately, and may include a short-lived action button.

## Consequences

- Email availability intentionally reveals whether an address is registered, as requested for inline signup feedback. The endpoint returns no profile data; platform-level abuse limits should be enabled and monitored.
- No database migration is required for these changes; the existing `profiles.email` uniqueness and username migration/index remain required for authoritative writes.
- The OTP send rate-limit endpoint and its atomic database function remain unchanged.
