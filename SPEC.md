# Visits — a simple visit roster for Dad

A tiny, warm web app so family and friends can coordinate visits, making sure he's
never alone for a whole day. One link in the WhatsApp group is the entire product.

## The core idea: the link is the key

No accounts, no passwords, no email verification. Access works like a Google Docs
"anyone with the link" URL — a **capability URL**:

- **Visitor link** (shared in the WhatsApp group)
  `https://visits.example.com/r/x7Kq9mP2vTzLbW4d`
  Anyone with this link can see the roster and add a visit. The token is a random
  128-bit ID (nanoid) — unguessable, served over HTTPS. That's the whole security
  model, and it's the right amount for this.

- **Per-visit edit rights**
  When someone adds a visit, the server generates a secret `editToken` for that
  visit. It's stored in the visitor's browser (localStorage) so on the same phone
  they can always edit or cancel their own visit with zero friction. They also get
  a personal "manage my visit" link they can keep (e.g. forward to themselves on
  WhatsApp) in case they switch devices.

- **Admin link** (for one or a few family members)
  `https://visits.example.com/r/x7Kq9mP2vTzLbW4d/admin/aJ3nRw8sYqPk`
  A second, separate secret. Admins can edit or remove any visit, block out times,
  and change settings. Share it privately with whoever co-manages the roster.

If a link ever leaks beyond the group, the admin can rotate the visitor token and
post the new link in WhatsApp.

## What visitors see (mobile-first — it opens from WhatsApp)

The UI is based on the 9ui calendar-interface example (Cal.com-style booking
screen) — reference copy with adaptation notes in
`docs/reference/9ui-calendar-example.tsx`. Three panels on desktop, stacked
vertically on mobile:

```
  ┌───────────────┬──────────────────┬───────────────────────────┐
  │ INFO PANEL    │  MONTH CALENDAR  │  SELECTED DAY             │
  │               │                  │  za 5 juli                │
  │ Bezoek voor   │   juli 2026      │                           │
  │ papa          │  ma di wo do …   │  10:00  Anneke 🐕         │
  │               │   • = bezoek     │  11:00  [ nog vrij ]      │
  │ 📌 Vandaag is │   ○ = nog leeg   │  ──── middagrust ────     │
  │ hij wat moe — │                  │  15:00  Tom & Els         │
  │ korte bezoek- │  (past days      │  16:00  [ nog vrij ]      │
  │ jes graag.    │   disabled)      │  19:00  [ nog vrij ]      │
  │               │                  │                           │
  │ Vandaag komen:│                  │  ⚠ 's avonds nog niemand  │
  │ Anneke, Tom   │                  │                           │
  └───────────────┴──────────────────┴───────────────────────────┘
```

Adaptations from the 9ui example (it's built for online meetings — we keep the
skeleton, swap the content):

- **Left panel**: host avatar / "30 Min Meeting" / Google Meet / timezone picker
  all go. Instead: roster title, the pinned admin note, visiting hours, and a
  "who's coming today" summary. No timezone select — everyone is in `nl-NL`.
- **Month calendar**: keep, but don't disable weekends (only past dates). Add
  per-day indicators: a dot on days that already have visits, a soft warning
  accent on upcoming days with **no visits yet** — gaps are the feature; the
  goal is that someone spots "nobody Tuesday" and fills it.
- **Day panel**: instead of a wall of bookable meeting slots, show the day's
  *roster*: booked visits inline with names ("15:00 — Tom & Els"), free slots
  as tappable "nog vrij" buttons, blocked ranges (rest, treatment) as
  non-interactive dividers. Free slots = visiting hours − blocked times − slots
  at `maxConcurrent` capacity. Drop the 12h/24h toggle — always 24h.
- **Confirm dialog**: keep the pattern, shrink the form: first name + optional
  note ("I'll bring the dog"). **No email**, no "add guests". Nothing else asked.
- Visits aren't fixed 30-minute meetings: default one-hour slots, and the dialog
  lets you stretch the end time ("I'll stay 14:00–16:00").
- Your own visits render **edit / cancel** buttons instead of a book button
  (matched via the stored editToken).
- A **share button** with a prefilled WhatsApp message for nudging the group.

## What admins can do extra

- Edit or remove any visit (people call to cancel; grandma will never edit her own).
- Pin a note at the top of the page ("doctor comes at 14:00 Monday").
- Block time ranges (rest hours, treatments) so no one books them.
- Settings: visiting hours (e.g. 10:00–20:00), max visitors at the same time
  (hospice rooms are small — default 2), how many days ahead people can book.
- Rotate the visitor link if needed.

## Deliberately NOT in v1

- Accounts, email, phone numbers, notifications (WhatsApp *is* the notification
  channel), recurring visits, waiting lists, photos. Keep it small; it can ship
  in a day and it should feel calm.

## Tech

- **next-forge** (Next.js App Router) + **shadcn/ui** — the two skills in
  `.claude/skills/` cover both.
- UI components from **9ui** (https://9ui.dev) — a shadcn-style registry built on
  Base UI instead of Radix; installs via the shadcn CLI. Needed: Calendar,
  Dialog, Button, Input, Textarea, Badge, Label. Layout reference:
  `docs/reference/9ui-calendar-example.tsx`.
- Server components + a handful of server actions (create/edit/delete visit,
  admin mutations). No API routes needed, no auth library at all.
- DB: anything tiny — SQLite via Turso, or Vercel Postgres. Two tables.
- Deploy on Vercel; `noindex` header so search engines never see it.
- UI language: Dutch (dates via `Intl.DateTimeFormat('nl-NL')`).

## Data model

```
rosters
  id            pk
  publicToken   unique, nanoid(16)   -- the visitor link
  adminToken    nanoid(16)           -- the admin link
  title         text                 -- "Bezoek voor papa"
  pinnedNote    text nullable
  settings      json                 -- visiting hours, maxConcurrent, daysAhead
  createdAt

visits
  id            pk
  rosterId      fk
  name          text                 -- first name is enough
  date          date
  startMin      int                  -- minutes since midnight, or null = daypart
  endMin        int nullable
  daypart       enum? (morning/afternoon/evening) -- alternative to exact times
  note          text nullable
  editToken     nanoid(16)           -- personal edit capability
  createdAt, updatedAt

blocked_times   (admin-created rest/treatment blocks)
  id, rosterId, date, startMin, endMin, label
```

## A note on "encrypted URL"

What you want is an **unguessable** URL, not literally an encrypted one — the
random token over HTTPS gives you exactly the "no password mess" experience.
Privacy hygiene that fits the sensitivity: first names only, no medical details
in the app, noindex, and the ability to rotate the link.
