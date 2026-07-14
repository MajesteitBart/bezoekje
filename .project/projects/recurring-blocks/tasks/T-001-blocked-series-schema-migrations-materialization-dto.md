---
id: T-001
name: Blocked series schema, migrations, materialization, DTO
status: done
workstream: WS-A
created: 2026-07-14T13:14:17Z
updated: 2026-07-14T13:15:39Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: [lib/db/schema.ts, lib/db/index.ts, lib/recurrence.ts, lib/data.ts, lib/types.ts, app/r/**]
parallel: true
priority: high
estimate: M
operating_mode: scoped-change
story_id: 
acceptance_criteria_ids: []
---

# Task: Blocked series schema, migrations, materialization, DTO

## Description

## Acceptance Criteria

- [x] blocked_series table; blocked_times gains series_id + cancelled via COLUMN_MIGRATIONS (table exists in prod); partial unique index post-migration
- [x] ensureRecurring materializes tasks and blocks; getBlockedInRange filters cancelled and exposes seriesId

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-14T13:15:39Z: blocked_series table; blocked_times series_id+cancelled via COLUMN_MIGRATIONS (table exists in prod); partial unique index in POST_MIGRATION_DDL; ensureRecurringBlocks + combined ensureRecurring wired into both pages; BlockedDTO.seriesId; getBlockedInRange filters cancelled (booking validation and free slots inherit this via the same query)

- 2026-07-14T13:14:18Z: schema and materialization
- 2026-07-14T13:14:17Z: Created from .project/templates/task.md by `delano task add`.
