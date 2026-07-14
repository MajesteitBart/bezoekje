---
id: T-001
name: Data layer: task and task_type tables, DTOs, defaults
status: done
workstream: WS-A
created: 2026-07-14T07:22:00Z
updated: 2026-07-14T07:28:36Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: [lib/db/schema.ts, lib/db/index.ts, lib/types.ts, lib/data.ts]
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001]
---

# Task: Data layer: task and task_type tables, DTOs, defaults

## Description

Add the persistence and type layer for care tasks: Drizzle tables `tasks` and
`task_types`, additive bootstrap DDL with a (roster_id, date) index, token-safe
DTOs, built-in default task types as code constants, and range/list queries in
lib/data.ts. Task rows snapshot label and needs_time from the chosen type.

## Acceptance Criteria
- [x] `tasks` table: id, roster_id, date, label, needs_time, start_min (nullable), note, claimed_name, claimed_note, edit_token (all claim fields nullable), created_at, updated_at
- [x] `task_types` table: id, roster_id, name, needs_time, created_at
- [x] DDL is CREATE TABLE IF NOT EXISTS + index only; no ALTER of existing tables (AC-001)
- [x] TaskDTO and TaskTypeDTO exclude edit_token; DEFAULT_TASK_TYPES exported with Dutch labels
- [x] getTasksInRange and getTaskTypes return DTOs

## Traceability
- Story: US-001
- Acceptance criteria: AC-001

## Technical Notes

Mirror the blocked_times/visits patterns exactly (lazy dbReady, idempotent DDL).
Defaults live in lib/task-types.ts so no backfill is needed for live rosters.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass (typecheck/lint/build gate; repo has no test suite)
- [x] Review complete
- [x] Docs updated (covered by T-006)

## Evidence Log

- 2026-07-14T07:28:36Z: Added tasks/task_types Drizzle tables + additive DDL with indexes (lib/db/schema.ts, lib/db/index.ts), TaskDTO/TaskTypeDTO (lib/types.ts), DEFAULT_TASK_TYPES (lib/task-types.ts), getTasksInRange/getTaskTypes (lib/data.ts); no ALTERs to existing tables

- 2026-07-14T07:27:44Z: beginning data layer
- 2026-07-14T07:22:00Z: Created from .project/templates/task.md by delano task add.
