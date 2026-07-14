---
id: T-003
name: UI: repeat select in block dialog, indicator, series-aware delete + gate
status: done
workstream: WS-A
created: 2026-07-14T13:14:18Z
updated: 2026-07-14T13:22:13Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002]
conflicts_with: [components/roster/**]
parallel: true
priority: high
estimate: M
operating_mode: scoped-change
story_id: 
acceptance_criteria_ids: []
---

# Task: UI: repeat select in block dialog, indicator, series-aware delete + gate

## Description

## Acceptance Criteria

- [x] Block dialog offers Herhalen; recurring blocks show repeat indicator
- [x] Deleting a recurring block offers alleen-deze-dag vs stop-herhaling; booking validation ignores cancelled blocks
- [x] typecheck/build pass; dev-server e2e verifies daily nap across dates, tombstone, stop

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

- 2026-07-14T13:22:13Z: Herhalen select in block dialog; Repeat2 indicator on recurring blocks; generalized series-delete dialog covers tasks and blocks. typecheck/build green. Dev-server e2e: daily 'middagdutje' 13:00-14:00 materialized 15 occurrences across the roster's 14-day horizon, alleen-deze-dag tombstone survived re-materialization, stop-herhaling left 0 series/0 occurrences after reload; booking validation ignores cancelled blocks via shared getBlockedInRange filter

- 2026-07-14T13:17:09Z: UI + gate
- 2026-07-14T13:14:18Z: Created from .project/templates/task.md by `delano task add`.
