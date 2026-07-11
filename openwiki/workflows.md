# Key workflows

## Create and share a roster

1. The landing-page form submits a title to `createRosterAction` (`app/page.tsx`).
2. The action trims the title to 80 characters, generates a roster ID plus public/admin capabilities, inserts defaults, and redirects to `/r/{public}/admin/{admin}?welkom=1` (`app/actions.ts`).
3. The admin route passes `justCreated` to `RosterView`; `AdminBar` presents sharing/onboarding controls.
4. Share the public URL broadly within the intended group and keep the admin URL private.

The schema defaults are 10:00–20:00, 60-minute slots, two concurrent visits, and 21 days ahead. There is no delete-roster or public-token rotation workflow in the implementation.

## View and book a visit

1. The public route validates the public token and loads the planning window (`app/r/[token]/page.tsx`).
2. `RosterView` groups visits/blocks by date. `buildDayItems` combines booked visits and blocks with generated free slots (`lib/slots.ts`).
3. A visitor selects a free start slot. `BookDialog` gathers first name, end time, and optional note; longer visits can span multiple grid slots.
4. `createVisitAction` re-fetches the roster and validates the date, range, visiting hours, blocks, current time, and capacity.
5. On success, the action returns the visit ID and edit token. The browser saves both the token and name; the UI offers a personal manage URL and refreshes the route.

Free-slot generation is a convenience view, not the source of truth. The action validates again because another user may have changed the roster since render.

## Edit or cancel a personal visit

A visit renders personal edit controls only when `lib/client-tokens.ts` contains that visit's token for the current roster. `EditVisitDialog` submits the same date plus edited time/name/note to `updateVisitAction`; `deleteVisitAction` cancels after confirmation.

For another device, open `/r/{public}/v/{visitId}/{editToken}`. The server verifies the full tuple, `SaveEditToken` writes it to `localStorage`, and the browser replaces the URL with the public roster. It does not select or open the visit automatically.

There is no account-based recovery. Clearing storage loses local controls unless the personal URL was retained.

## Administer a roster

The admin URL renders the normal roster with an `adminToken`. The token is accepted by visit update/delete actions, so admins can manage any visit. `AdminBar` also calls admin-only actions to:

- update title and pinned note;
- change visiting start/end, maximum concurrency (1–6), and planning horizon (3–60 days);
- add a dated blocked range with an optional label;
- remove a blocked range;
- copy/share visitor and admin URLs.

Each mutation verifies the public/admin token pair server-side and revalidates both route variants.

### Admin consistency caveats

Current mutation rules do not fully reconcile old and new state:

- Narrowing visiting hours or concurrency can leave existing visits outside the new policy.
- Adding a block does not reject overlap with existing visits or blocks and does not enforce roster hours or `daysAhead`.
- `slotMinutes` exists in the model but is not editable by `updateRosterAction`.

When extending admin settings, decide explicitly whether to reject conflicting changes, migrate existing records, or display conflicts.

## Scheduling semantics

Intervals use half-open overlap: `[10:00, 11:00)` and `[11:00, 12:00)` are adjacent, not overlapping. A block suppresses any grid slot it intersects. Capacity counts every visit intersecting the proposed interval (`lib/slots.ts`).

Dates are `YYYY-MM-DD` strings interpreted against Amsterdam “today.” A same-day visit is rejected only once its end is no later than the current time; the free-slot UI separately hides slots whose start is already past (`app/actions.ts`, `lib/slots.ts`).

Capacity checking is read-then-write without a transaction or database constraint. Simultaneous requests can both pass validation and overbook; treat transactional enforcement as necessary before relying on strict capacity under load.

## Refresh behavior

After every successful mutation, `revalidateRoster` invalidates public and admin paths. Client dialogs also call `router.refresh()` so the current Server Component payload is fetched again. Preserve both sides when adding a mutation: revalidation keeps route caches coherent, while refresh updates the active browser immediately.
