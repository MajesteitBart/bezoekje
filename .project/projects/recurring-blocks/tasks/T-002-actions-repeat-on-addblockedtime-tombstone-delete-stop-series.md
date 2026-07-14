---
id: T-002
name: Actions: repeat on addBlockedTime, tombstone delete, stop series
status: done
workstream: WS-A
created: 2026-07-14T13:14:17Z
updated: 2026-07-14T13:17:08Z
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

# Task: Actions: repeat on addBlockedTime, tombstone delete, stop series

## Description

## Acceptance Criteria

- [x] addBlockedTimeAction accepts repeat none/daily/weekly
- [x] deleteBlockedTimeAction tombstones series occurrences; stopBlockedSeriesAction removes future occurrences and the series

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

- 2026-07-14T13:17:08Z: addBlockedTimeAction accepts repeat and creates blocked_series + materializes horizon; deleteBlockedTimeAction tombstones series occurrences; stopBlockedSeriesAction deletes occurrences from today onward, detaches past ones, removes series

- 2026-07-14T13:15:40Z: actions
- 2026-07-14T13:14:17Z: Created from .project/templates/task.md by `delano task add`.
