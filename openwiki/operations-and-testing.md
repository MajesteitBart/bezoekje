# Operations and testing

## Local development

Use Node.js 20 or newer:

```bash
npm install
npm run dev
```

Without configuration, libSQL opens `file:local.db` in the repository. The file is ignored. The first data access runs idempotent table/index DDL (`lib/db/index.ts`). Do not commit local database files or inspect/document secret environment files.

For phone testing, expose the Next dev server on the appropriate interface. `next.config.ts` allows several LAN/ZeroTier/Tailscale origins so `/_next` assets hydrate cross-device; update these development-only values if the developer network changes. On insecure HTTP origins, `lib/client-tokens.ts` falls back from the Clipboard API to a temporary textarea and `execCommand`.

## Production deployment

The documented target is Vercel with Turso/libSQL (`README.md`). Configure the environment names shown in `.env.example` through the deployment platform:

- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN` when required by the remote database

Do not put values in source or wiki pages. Production must use HTTPS because URL paths are bearer credentials. `app/layout.tsx` emits `noindex, nofollow`; retain it unless the privacy model intentionally changes.

The database client opens lazily. This is required because `next build` imports application modules while a runtime database path or mounted volume may not exist. Avoid moving connection creation back to module scope.

## Database runbook

### Fresh database

The first query calls `dbReady()`, which creates the three tables and range indexes. A process caches the initialization promise on `globalThis`.

### Schema changes

Runtime DDL uses `CREATE TABLE IF NOT EXISTS`; it cannot evolve an existing table. Although `drizzle.config.ts` points to a migration output directory, the repository has no migration command or committed migrations.

Before deploying a schema change:

1. design an explicit migration and backup/rollback path for the existing libSQL database;
2. update `lib/db/schema.ts` and any bootstrap assumptions;
3. update actions, DTOs, and readers together;
4. test both a fresh database and an upgraded copy;
5. verify `next build` still works without opening a runtime-only database.

### Incident considerations

- There is no implemented token rotation, roster deletion, or automated backup/restore runbook.
- A leaked admin or personal URL remains valid indefinitely unless data is changed directly.
- Simultaneous bookings can exceed capacity because enforcement is not transactional.
- Direct writes can bypass all application checks; the schema has few constraints and no foreign keys.

## Available checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint with Next + TypeScript rules
npm run build       # production Next build
npm run format      # writes Prettier changes; use intentionally
```

There is no test script, test framework, application CI workflow, or coverage configuration. `.github/workflows/openwiki-update.yml` only maintains documentation.

## Manual regression checklist

Until automated tests exist, run at least these scenarios for relevant changes:

### Access and privacy

- Public, admin, and personal URLs accept valid capabilities and return 404 for mismatched roster/visit/token combinations.
- Public Client Component props contain no admin/edit tokens.
- A personal URL imports rights on a fresh browser and returns to the roster.
- Clearing local storage removes own-visit controls; retained personal URL restores them.

### Scheduling

- Book at visiting-hour boundaries and reject outside ranges.
- Verify adjacent visits do not overlap, while partially overlapping and long visits count toward capacity.
- Verify blocks suppress intersecting slots and reject new visits.
- Check today/past behavior around Amsterdam midnight and daylight-saving transitions.
- Exercise maximum concurrency with two browsers; note that this does not eliminate the known race.

### Admin

- Update title, note, hours, capacity, and horizon; confirm both public/admin pages refresh.
- Add/remove blocks and edit/delete another visitor's visit.
- Inspect behavior when settings or a new block conflict with existing visits.

### Mobile and cross-device

- Test the roster from a real narrow phone opened via a shared link.
- Open every dialog with the virtual keyboard visible; footer actions must remain reachable.
- Confirm calendar touch targets and dialog scrolling at small heights.
- Confirm selects render above dialogs.
- Test copy/share on HTTPS and plain-HTTP LAN development.
- If changing the uncommitted landing redesign, check the three absolutely positioned phone mocks on narrow screens for overlap/clipping.

## Highest-value automated tests to add

1. Unit tests for `overlaps`, `capacityLeft`, and `buildDayItems`, including long visits and half-open boundaries.
2. Clock-controlled tests for Amsterdam dates, midnight, and DST transitions.
3. Server Action integration tests for every capability role, validation limit, block interaction, and roster isolation.
4. A concurrency test around booking capacity, paired with transactional/database enforcement.
5. Database tests for fresh bootstrap and real schema upgrades.
6. Browser tests for personal-link import, local token ownership, mobile bottom sheets, keyboard resize, and select stacking.
7. Application CI that installs dependencies and runs typecheck, lint, tests, and build.

## Troubleshooting map

- Build tries to access a missing runtime database: inspect `lib/db/index.ts` for accidental eager connection access.
- Phone page renders but buttons do nothing: verify the dev host is in `allowedDevOrigins` and `/_next` assets load.
- Copy fails on a phone over HTTP: verify the `copyText` fallback path.
- Dialog action is hidden by keyboard: inspect viewport metadata and bottom-sheet `100dvh`/overflow styles.
- A slot appears free but booking fails: rendered data may be stale; the Server Action is authoritative and may see a newer visit/block.
