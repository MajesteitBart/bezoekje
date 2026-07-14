---
id: T-002
name: Actions: repeat option on create, stop-series
status: done
workstream: WS-A
created: 2026-07-14T10:48:26Z
updated: 2026-07-14T10:50:36Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001]
conflicts_with: [app/actions.ts]
parallel: true
priority: high
estimate: S
operating_mode: scoped-change
story_id: 
acceptance_criteria_ids: []
---

# Task: Actions: repeat option on create, stop-series

## Description

## Acceptance Criteria

- [x] createTaskAction accepts repeat none/daily/weekly and creates a series + materializes
- [x] stopTaskSeriesAction deletes future unclaimed occurrences, detaches claimed ones, removes the series

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

- 2026-07-14T10:50:36Z: createTaskAction accepts repeat none/daily/weekly, creates task_series + materializes horizon; stopTaskSeriesAction deletes future unclaimed occurrences, detaches claimed ones, removes the series

- 2026-07-14T10:49:58Z: actions
- 2026-07-14T10:48:26Z: Created from .project/templates/task.md by `delano task add`.
