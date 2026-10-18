# Changelog

## 2026-09-14

- Bootstrapped canonical repository structure and persistent AI memory.
- Added initial cloud-first architecture ADR.

## 2026-10-18

- Added responsive monochrome Tailwind visual refresh across the marketing site and existing student web UI, including tactile buttons, a typewriter hero, illustrative knowledge model, numbered feature cards, process steps, and accessible FAQ accordion.
- Added Tailwind/PostCSS configuration at both independent frontend roots; removed build-time Google Font downloads and retained scientific visualization colors.
- Validation passed: all workspace typechecks, full monorepo production build (landing 16 routes, web 40 routes, backend build/template copy), final landing typecheck/build, and `git diff --check`. `npm run lint` remains blocked by the existing interactive `next lint` setup prompt. npm install reported nine audit advisories requiring separate review. No deploy or push.
