# Bezoekplanner (Visits)

A tiny, warm web app to coordinate visits so someone in care is never alone for
a whole day. One unguessable link goes in a WhatsApp group; people sign up for a
time, edit their own visit, and admins manage the roster. No accounts, no
passwords. See [`SPEC.md`](./SPEC.md) for the full design.

## How access works

Access is via **capability URLs** (like a Google Docs "anyone with the link"
link) — a random 128-bit token over HTTPS, no login:

- **Visitor link** `/r/<publicToken>` — view the roster and add a visit.
- **Personal visit link** `/r/<publicToken>/v/<visitId>/<editToken>` — saves an
  edit token in the browser so you can change or cancel your own visit. Also
  stored automatically in `localStorage` when you book on that device.
- **Admin link** `/r/<publicToken>/admin/<adminToken>` — edit any visit, pin a
  note, block rest/treatment times, change settings.

## Stack

- Next.js (App Router) + React, server actions only (no API routes, no auth lib)
- [9ui](https://9ui.dev) components (shadcn CLI, Base UI) + Tailwind
- Drizzle ORM over libSQL/SQLite (local file in dev, Turso in prod)
- UI in Dutch (`nl-NL`, Europe/Amsterdam)

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

The database auto-creates its tables on first query. In dev it writes to a local
`file:local.db` (gitignored). For production set `DATABASE_URL` (and
`DATABASE_AUTH_TOKEN`) to a Turso database — see `.env.example`.

```bash
npm run build        # production build
npm run typecheck    # tsc --noEmit
```

## Deploy

Deploy to Vercel. Set `DATABASE_URL` / `DATABASE_AUTH_TOKEN` to a Turso database.
The app sends a `noindex` robots directive so it never appears in search results.
