---
id: T-003
name: UI: repeat select, recurring badge, series-aware delete + quality gate
status: done
workstream: WS-A
created: 2026-07-14T10:48:26Z
updated: 2026-07-14T10:58:02Z
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

# Task: UI: repeat select, recurring badge, series-aware delete + quality gate

## Description

## Acceptance Criteria

- [x] Task dialog offers Herhalen: een keer / elke dag / elke week op deze dag
- [x] Recurring occurrences show a repeat indicator; admin delete on a recurring occurrence offers alleen-deze-dag vs stop-herhaling
- [x] typecheck/build pass and dev-server smoke shows materialized occurrences across dates

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

- 2026-07-14T10:58:02Z: Herhalen select in task dialog (een keer/elke dag/elke week), Repeat2 indicator on occurrences, series-aware delete dialog (alleen deze dag = tombstone so re-materialization cannot resurrect it; stop de herhaling removes series + future unclaimed occurrences). typecheck/build green. Dev-server e2e: weekly Huishouden series materialized 14/21/28 jul + 4 aug, tombstone survived reload, stop-series left 0 rows after reload

- 2026-07-14T10:50:36Z: UI + quality gate
- 2026-07-14T10:48:26Z: Created from .project/templates/task.md by `delano task add`.
