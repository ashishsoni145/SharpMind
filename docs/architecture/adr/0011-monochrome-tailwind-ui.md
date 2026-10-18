# ADR 0011: Monochrome Tailwind UI Across Frontend Targets

**Status:** Accepted  
**Date:** 2026-10-18

## Context

SharpMind has independently deployed `landing/` and `web/` Next.js applications. The marketing site and authenticated student workspace need a consistent high-contrast visual system while preserving each app's deployment root, existing CSS-module components, routes, and academic interactions.

## Decision

- Install Tailwind CSS 3, PostCSS, and Autoprefixer as frontend workspace development dependencies, with a Tailwind and PostCSS configuration inside each deployment root. Do not import source files across deployment roots.
- Retain the existing CSS modules and design tokens for established screens. Use Tailwind utilities for the new marketing hero/FAQ and workspace utilities, and keep shared button behavior in the existing button components.
- Use a black, zinc, and white interface palette with mechanical push-down primary/secondary buttons and responsive layouts.
- Use system font stacks with editorial serif fallbacks so production builds do not need to fetch Google Fonts during compilation.
- Preserve color encodings inside scientific visualization components; monochrome changes apply to interface chrome and product content styling.
- Do not change backend services, API contracts, authentication, database schema, or deployment topology.

## Consequences

- The landing and web Vercel roots each own their Tailwind/PostCSS config and dependency declarations; the root lockfile records both workspaces.
- Interface styling remains incrementally adoptable without a wholesale CSS-module migration.
- Builds are independent of remote font downloads. Devices without Instrument Serif or Inter use Georgia/system sans fallbacks.
- Scientific plots retain their instructional color distinctions.
