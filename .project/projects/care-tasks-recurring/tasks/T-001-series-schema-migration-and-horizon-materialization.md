---
id: T-001
name: Series schema, migration, and horizon materialization
status: done
workstream: WS-A
created: 2026-07-14T10:48:26Z
updated: 2026-07-14T10:49:58Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: [lib/db/schema.ts, lib/db/index.ts, lib/data.ts, lib/recurrence.ts, app/r/**]
parallel: true
priority: high
estimate: M
operating_mode: scoped-change
story_id: 
acceptance_criteria_ids: []
---

# Task: Series schema, migration, and horizon materialization

## Description

## Acceptance Criteria

- [x] task_series table + tasks.series_id column via existing COLUMN_MIGRATIONS mechanism; partial unique index (series_id,date) created after column migration
- [x] ensureRecurringTasks materializes missing occurrences in range with ON CONFLICT DO NOTHING; both roster pages call it

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

- 2026-07-14T10:49:58Z: task_series table + tasks.series_id (COLUMN_MIGRATIONS + POST_MIGRATION_DDL partial unique index on (series_id,date)); lib/recurrence.ts with seriesDatesInRange + ensureRecurringTasks (ON CONFLICT DO NOTHING); both roster pages materialize before reads

- 2026-07-14T10:48:37Z: schema and materialization
- 2026-07-14T10:48:26Z: Created from .project/templates/task.md by `delano task add`.
