# Bezoekje code wiki

Bezoekje is a small Dutch, mobile-first visit roster. A family shares one unguessable visitor URL in WhatsApp; visitors can see coverage gaps and book a time without an account. A personal capability URL controls one visit, while a separate admin capability controls the roster. Administrators may optionally link that admin URL to an email-OTP account so they can recover it from `/account`; the admin capability remains the authority for roster mutations (`README.md`, `SPEC.md`, `app/account-actions.ts`).

## Start here

- [Architecture](architecture/overview.md) — runtime boundaries, data flow, capability security, and architectural history.
- [Key workflows](workflows.md) — create a roster, book or edit a visit, and administer settings/blocks.
- [Domain and data](domain-and-data.md) — concepts, schema, scheduling rules, and integrity caveats.
- [Source map](source-map.md) — where to make each kind of change and the main integration points.
- [Operations and testing](operations-and-testing.md) — local setup, deployment, database bootstrap, checks, and test gaps.

## Run locally

Requirements: Node.js 20 or newer. The default development database is the ignored `file:local.db`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, enter a roster name, and submit. Creation redirects to the new admin URL. Useful checks are:

```bash
npm run typecheck
npm run lint
npm run build
```

There is currently no automated test suite. See [Operations and testing](operations-and-testing.md) for manual scenarios and deployment configuration.

## Access model and routes

| Capability | Route | Effective rights |
| --- | --- | --- |
| Public roster token | `/r/[token]` | Read roster, visits, and blocks; create a visit |
| Per-visit edit token | `/r/[token]/v/[visitId]/[editToken]` | Import edit rights for one visit into this browser |
| Admin token | `/r/[token]/admin/[adminToken]` | Edit any visit; manage roster settings/blocks; optionally link the roster to an account |
| Email-OTP session | `/account` | List linked admin URLs and link another roster after proving its admin capability |

Invalid capability combinations return 404. Tokens are credentials: do not log, expose, or place them in documentation. `noindex` metadata reduces discovery but is not authorization (`app/layout.tsx`).

## System shape

1. Dynamic route Server Components validate capabilities and load the current planning window from libSQL/SQLite (`app/r/**/page.tsx`, `lib/data.ts`).
2. They pass token-safe DTOs to the interactive `RosterView`; public DTOs omit admin and edit tokens.
3. Client components manage calendar/dialog state and locally remembered edit capabilities (`components/roster`, `lib/client-tokens.ts`).
4. Server Actions repeat authorization and scheduling validation before mutating data, then revalidate public and admin paths (`app/actions.ts`).
5. `lib/db/index.ts` lazily opens the database and runs idempotent bootstrap DDL on first access.

## Product rules worth knowing

- Dates and “now” are interpreted in `Europe/Amsterdam`; display text is Dutch (`lib/dates.ts`).
- Defaults are 10:00–20:00, 60-minute slots, one concurrent visit, and a 21-day horizon (`lib/db/schema.ts`).
- A visit may span multiple slots. Half-open overlap rules mean adjacent intervals do not conflict (`lib/slots.ts`).
- The public capability exposes visitor first names and notes to everyone holding the link. Keep notes free of medical or sensitive details, as advised by `SPEC.md`.
- The browser stores edit tokens in `localStorage`; retaining the personal link is the only cross-device/recovery mechanism.

## Current repository state

The implementation now combines the original capability-URL roster with a committed warm editorial landing page and optional email-OTP admin-account recovery. Earlier focused changes added cross-device development/clipboard fallback, Node 20 pinning, lazy runtime initialization, compact mobile calendar/dialog behavior, and keyboard-safe bottom sheets.

Important known gaps are documented rather than hidden: booking capacity is checked without a transaction, runtime DDL is not a migration system, block/settings changes can conflict with existing visits, and visitor-token rotation described in `SPEC.md` is not implemented.
