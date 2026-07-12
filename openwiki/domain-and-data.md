# Domain and data

## Core concepts

### Roster

A roster is the coordination space and capability root. It owns public/admin tokens, display copy, visiting hours, slot granularity, maximum simultaneous visits, and planning horizon. Defaults live in `lib/db/schema.ts`.

### Visit

A visit belongs to one roster and one date, with exact start/end minutes, a first name, optional note, and a private edit capability. Multi-hour visits are represented as one interval, not multiple slots.

### Blocked time

An admin-created block marks a dated interval unavailable, usually for rest or treatment. It may have a short label. Blocks affect free-slot generation and new visit validation.

## Physical model

`lib/db/schema.ts` defines the roster-domain tables, `lib/db/auth-schema.ts` defines Better Auth storage, and `lib/db/index.ts` contains matching runtime DDL.

| Table | Important fields |
| --- | --- |
| `rosters` | `id`, unique `public_token`, `admin_token`, title/note, `start_min`, `end_min`, `slot_minutes`, `max_concurrent`, `days_ahead`, `created_at` |
| `visits` | `id`, `roster_id`, date, start/end minutes, name/note, `edit_token`, created/updated timestamps |
| `blocked_times` | `id`, `roster_id`, date, start/end minutes, label, `created_at` |
| `roster_admins` | composite key `(roster_id, user_id)`, `created_at`; links a proven admin capability to an account |
| `user`, `session`, `account`, `verification` | Better Auth identity, 30-day sessions, provider records, and temporary OTP verification state |

Range indexes exist on `(roster_id, date)` for visits and blocks. The database does not declare foreign keys, cascades, booking uniqueness, or check constraints. Application actions therefore carry most integrity responsibility.

## Public DTO boundary

`lib/data.ts` is intentionally narrower than the row model:

- roster DTOs expose the public token and settings but not the admin token;
- visit DTOs expose schedule/name/note but not edit tokens;
- block DTOs expose only display/scheduling fields.

Do not pass raw roster or visit rows to public Client Components.

## Time and date rules

`lib/dates.ts` centralizes the fixed `Europe/Amsterdam` assumption:

- `todayISO()` and `nowMinutes()` use `Intl` with the Amsterdam zone;
- date arithmetic parses at UTC noon to avoid ordinary DST/date-boundary shifts;
- UI formatting uses `nl-NL`;
- persisted dates are ISO strings, and times are integer minutes since midnight.

Valid action time ranges are five-minute-aligned integers between 00:00 and 24:00 with `start < end`. Displayed free slots step by `max(15, slotMinutes)`, so corrupt values below 15 do not produce a finer UI grid.

## Visit invariants

`validateVisitSlot` in `app/actions.ts` enforces:

- syntactically and semantically valid ISO date;
- date from today through `today + daysAhead`;
- valid time range inside roster visiting hours;
- for today, an end time still in the future;
- no overlap with a blocked range;
- fewer than `maxConcurrent` intersecting visits, excluding the visit being edited.

Text limits are applied by actions: roster title 80, visitor name 50, visit note 300, pinned note 500, and block label 60 characters. Empty optional text becomes `null`.

## Slot construction

`buildDayItems` in `lib/slots.ts` starts with persisted visits and blocks, iterates the roster grid, then omits slots that have started, intersect a block, or are at capacity. Results sort by start time and then block, visit, free.

The overlap predicate is half-open:

```text
aStart < bEnd && bStart < aEnd
```

`capacityLeft` counts every visit that overlaps any portion of the requested interval. That is stricter than true peak concurrency for long visits: with capacity 2, separate existing visits at 10:00–11:00 and 12:00–13:00 cause a proposed 10:00–13:00 visit to be rejected even though occupancy never exceeds two. A correct validator must evaluate occupancy at relevant interval boundaries, and it must still account for the freshness of the preceding range query.

## Integrity and evolution risks

- **Race conditions:** capacity validation and insert/update are not transactional; the schema cannot prevent concurrent overbooking.
- **Weak relational enforcement:** orphaned visits/blocks and invalid values are possible through direct database writes.
- **Admin conflicts:** blocks and policy updates can conflict with existing visits.
- **Schema evolution:** bootstrap DDL creates missing tables, and a small `COLUMN_MIGRATIONS` list currently adds the post-release `rosters.pinned_note_level` column when absent. This is not a general migration system and cannot transform arbitrary existing data. Drizzle Kit is configured, but no generated migration set or migration script exists.
- **Token lifecycle:** capabilities are plaintext and non-expiring. The public token is unique, but admin/edit tokens have no unique index; rotation is not implemented.

For model changes, update both `lib/db/schema.ts` and the runtime/bootstrap strategy. Do not assume editing the Drizzle schema upgrades an existing deployment.
