# Architecture overview

## Design intent

Bezoekje optimizes for a link opened from a family WhatsApp group: minimal data entry, no identity system, and an obvious view of unfilled days. Security is capability-based rather than account-based. The architecture therefore keeps authentication checks close to route loading and mutations, while the browser remembers only per-visit edit capabilities (`SPEC.md`, `README.md`).

## Runtime layers

### Routes and server rendering

- `/` renders the roster-creation landing page and posts directly to `createRosterAction` (`app/page.tsx`). The current working tree contains an extensive uncommitted marketing redesign around the same form.
- `/r/[token]` resolves the public capability and loads visits/blocks from today through `daysAhead` (`app/r/[token]/page.tsx`).
- `/r/[token]/admin/[adminToken]` verifies both capabilities before passing the admin token to the UI (`app/r/[token]/admin/[adminToken]/page.tsx`).
- `/r/[token]/v/[visitId]/[editToken]` verifies the roster/visit/token tuple, then renders a client bridge that saves the token and redirects to the public roster (`app/r/[token]/v/[visitId]/[editToken]/page.tsx`).

Roster routes are `force-dynamic`; each request sees database state rather than a statically generated page.

### Interactive client

`components/roster/roster-view.tsx` owns selected-date and dialog state and composes the information panel, calendar, and day schedule. `day-panel.tsx` distinguishes booked visits, blocked ranges, and generated free slots. Booking, editing, blocking, and admin controls live in focused dialogs.

The first client render does not read `localStorage`; edit capabilities are loaded after mount to avoid hydration mismatch. `lib/client-tokens.ts` stores a `visitId -> editToken` map per public roster and a reusable visitor name. It also provides a legacy clipboard fallback for plain-HTTP phone testing.

### Server Actions and domain enforcement

`app/actions.ts` is the mutation boundary. Client components import actions directly; there are no API routes or auth library. Actions:

- normalize and truncate text;
- validate dates, time ranges, horizon, visiting hours, blocks, and capacity;
- verify either the visit capability or admin capability for visit changes;
- require the admin capability for settings and blocked-time changes;
- mutate through Drizzle and revalidate both roster URLs.

The UI is not trusted: server-side checks are repeated even when the client only presents valid choices.

### Data access and persistence

`lib/data.ts` provides roster/range queries and converts rows to public DTOs. `toRosterDTO` intentionally omits `adminToken`; visit DTOs omit `editToken`.

`lib/db/index.ts` wraps Drizzle/libSQL in a lazy proxy. The connection opens on first method access, not module import, because Next.js imports modules during `next build` when a runtime-mounted database may not exist. `dbReady()` runs bootstrap DDL once per process. See [Domain and data](../domain-and-data.md) for schema details and [Operations](../operations-and-testing.md) for migration caveats.

## End-to-end read/mutation flow

```text
capability URL
  -> dynamic Server Component validates token(s)
  -> lib/data waits for DB bootstrap and queries range
  -> token-safe DTOs render RosterView
  -> user invokes imported Server Action
  -> action revalidates capability + domain constraints
  -> Drizzle mutation
  -> revalidate public and admin paths
  -> client router.refresh() displays current data
```

## Capability security boundary

Tokens from `lib/tokens.ts` are random URL-safe credentials. Public possession grants roster visibility and booking; a visit token grants mutation of one roster-scoped visit; an admin token grants broad control. Server checks bind visit IDs to roster IDs before accepting a token (`app/actions.ts`). Invalid routes return 404 to avoid distinguishing missing and unauthorized resources.

Operational implications:

- Require HTTPS in production; capability paths may otherwise leak through transport, logs, browser history, or sharing.
- Tokens are plaintext in the database and URLs, have no expiry, and are not hashed.
- Anyone with the public link sees names and notes.
- `localStorage` edit rights are available to scripts and users of the same browser profile.
- `noindex, nofollow` is privacy hygiene, not access control.
- `SPEC.md` calls for public-token rotation, but no rotation action/UI exists.

## Mobile-first constraints

The roster is single-column below `lg` and three-panel on desktop. Dialogs become bottom sheets on mobile, use `100dvh`, safe-area padding, and internal scrolling (`components/ui/dialog.tsx`). `app/layout.tsx` sets `interactiveWidget: "resizes-content"` so Android keyboards resize the viewport rather than cover the anchored footer. These details came from the two latest mobile-fix commits and should be regression-tested when changing dialogs or global viewport metadata.

## Architectural evolution

- The baseline commit supplied the product spec, UI skills, and 9ui reference.
- The main implementation commit established the capability-route/server-action architecture and three-table model.
- Cross-device fixes added `allowedDevOrigins` and insecure-context copy fallback after phone testing exposed hydration/clipboard issues.
- The database was changed from eager to lazy connection opening so deployment builds do not require runtime storage.
- Node 20+ was pinned for deploy platforms.
- Recent mobile commits compacted calendar/dialog layouts and then fixed virtual-keyboard clipping through bottom anchoring and viewport resizing.

This history explains several seemingly unusual choices: hard-coded development origins, legacy clipboard code, lazy database proxying, and explicit mobile viewport behavior.
