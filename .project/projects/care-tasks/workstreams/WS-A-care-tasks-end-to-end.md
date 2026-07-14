---
id: WS-A
name: WS-A Care tasks end-to-end
owner: bart
status: done
created: 2026-07-14T07:22:00Z
updated: 2026-07-14T08:10:44Z
operating_mode: feature
---

# Workstream: WS-A Care tasks end-to-end

## Objective

Deliver admin-created, helper-claimable care tasks in the existing day view,
end-to-end from schema to UI, per spec.md.

## Owned Files/Areas

- lib/db/schema.ts, lib/db/index.ts, lib/types.ts, lib/task-types.ts, lib/data.ts, lib/slots.ts, lib/client-tokens.ts
- app/actions.ts, app/r/[token]/** (pages + new task-link route)
- components/roster/** (day panel, roster view, new task dialogs)

## Dependencies

- None external; sequential task chain T-001 -> T-006 within this stream.

## Risks

- Concurrent claim race (last write wins), accepted and documented in spec footguns.
- Live-DB bootstrap: additive DDL only; no ALTERs.

## Handoff Criteria

- All tasks done with evidence; typecheck/lint/build green; GUI smoke recorded;
  branch pushed and PR open against main (no direct push to main).
