# Source map

Use this page to find the smallest authoritative surface for a change.

## Product intent and existing guidance

- `README.md` — concise current behavior, stack, setup, and deployment.
- `SPEC.md` — original product rationale, UX goals, privacy posture, and deliberately excluded features. Some planned behavior, notably public-link rotation, is not implemented.
- `docs/reference/9ui-calendar-example.tsx` — upstream-style calendar layout reference, not production behavior.
- `.claude/skills/` — imported next-forge/shadcn implementation guidance; consult when changing framework or UI patterns, but prefer current source when they differ.

## Entrypoints and routes

- `app/page.tsx` — creation form and polished landing page.
- `app/r/[token]/page.tsx` — public roster loader.
- `app/r/[token]/admin/[adminToken]/page.tsx` — admin capability validation and loader.
- `app/r/[token]/v/[visitId]/[editToken]/page.tsx` — personal-link validation/import.
- `app/layout.tsx` — Dutch document shell, robots metadata, and keyboard-resizing viewport behavior.
- `app/globals.css` — Tailwind/theme globals.

## Mutations and domain logic

- `app/actions.ts` — all writes, capability authorization, input limits, scheduling validation, and path revalidation. Start here for any business-rule change.
- `lib/slots.ts` — overlap, capacity, and displayed day/free-slot construction.
- `lib/dates.ts` — Amsterdam clock/date arithmetic and Dutch formatting.
- `lib/tokens.ts` — capability and ID generation.
- `lib/types.ts` — client-safe DTO shapes.

## UI surface

- `components/roster/roster-view.tsx` — top-level interactive composition and selected-date/edit-token state.
- `components/roster/day-panel.tsx` — visit/block/free rendering and ownership/admin controls.
- `components/roster/book-dialog.tsx` — create-visit form and personal-link result.
- `components/roster/edit-visit-dialog.tsx` — edit/cancel flow.
- `components/roster/admin-bar.tsx` — sharing and roster settings.
- `components/roster/block-dialog.tsx` — admin block creation.
- `components/roster/save-edit-token.tsx` — cross-device capability import bridge.
- `components/roster/time-select.tsx` — time input choices.
- `components/ui/` — local 9ui/shadcn primitives. `dialog.tsx` and `select.tsx` contain important mobile/stacking fixes; preserve those adaptations when updating generated components.
- `lib/client-tokens.ts` — local edit rights, remembered name, and clipboard compatibility.

## Data and persistence

- `lib/db/schema.ts` — Drizzle schema and defaults.
- `lib/db/index.ts` — lazy libSQL client, runtime DDL, and first-query initialization.
- `lib/data.ts` — read queries and safe row-to-DTO conversion.
- `drizzle.config.ts` — Drizzle Kit configuration; there are currently no migration scripts/artifacts.

A schema change usually requires coordinated edits to schema, bootstrap/migration behavior, action validation, DTOs, and UI.

## Configuration and integrations

- `package.json` — Node 20+, Next/React/libSQL/Drizzle dependencies, and developer commands.
- `next.config.ts` — development origins for LAN, ZeroTier, and Tailscale phone access. These are development-only integration points and currently include machine-specific addresses.
- `.env.example` — placeholder names for `DATABASE_URL` and `DATABASE_AUTH_TOKEN`; never document real values.
- `tsconfig.json`, `eslint.config.mjs`, `.prettierrc` — strict TypeScript and code-quality conventions.
- `.github/workflows/openwiki-update.yml` — scheduled/manual documentation update automation only; it is not application CI or deployment.

## Change guide

| Change | Start with | Also verify |
| --- | --- | --- |
| Booking rule or capacity | `app/actions.ts`, `lib/slots.ts` | all three route roles, long visits, boundary overlap |
| Capability/access behavior | route pages, `app/actions.ts`, `lib/client-tokens.ts` | token-safe DTOs, URL leakage, 404 behavior |
| Calendar/date behavior | `lib/dates.ts`, `roster-view.tsx` | Amsterdam DST and mobile calendar |
| Admin setting/block | `admin-bar.tsx`, `block-dialog.tsx`, actions | conflicts with existing visits and schema defaults |
| Database/schema | `lib/db/schema.ts`, `lib/db/index.ts` | existing-production migration, build without runtime DB |
| Dialog/form UI | relevant roster component, `components/ui/dialog.tsx` | Android keyboard, `100dvh`, safe area, select stacking |
| Landing page | `app/page.tsx` | preserve direct server-action creation and responsive phone mocks |
| Deployment | `README.md`, `package.json`, DB config | Node version, Turso credentials, noindex metadata |
