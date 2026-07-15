---
id: T-002
name: Server actions: task CRUD, claim, release, task types
status: done
workstream: WS-A
created: 2026-07-14T07:22:01Z
updated: 2026-07-14T07:29:23Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001]
conflicts_with: [app/actions.ts]
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-002, AC-003, AC-004]
---

# Task: Server actions: task CRUD, claim, release, task types

## Description

Add server actions in app/actions.ts: createTaskAction / deleteTaskAction /
releaseTaskAction (admin or claim owner), claimTaskAction (public link),
updateTaskClaimAction (claim edit token or admin), createTaskTypeAction /
deleteTaskTypeAction (admin). All follow the existing Err/Ok result shape,
cleanText limits, date-window validation, and revalidateRoster.

## Acceptance Criteria
- [x] Admin token required for create/delete task and type management; claim edits accept claim edit token or admin token
- [x] Claiming an already-claimed task returns a Dutch error; claiming issues a fresh edit token and returns it (AC-003)
- [x] Releasing clears claimed_name, claimed_note, and edit_token so old personal links stop working (AC-004)
- [x] needs_time tasks require a valid start time (admin sets at creation; claimer may adjust)
- [x] Custom types capped at 12 per roster; labels/notes length-capped

## Traceability
- Story: US-002
- Acceptance criteria: AC-002, AC-003, AC-004

## Technical Notes

Reuse isValidISODate/todayISO/addDaysISO window checks from visits. Tasks do not
touch capacityLeft or blocked_times. Time validated as 0..1440, 5-min steps.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass (typecheck/lint/build gate)
- [x] Review complete
- [x] Docs updated (covered by T-006)

## Evidence Log

- 2026-07-14T07:29:23Z: 7 server actions added to app/actions.ts (create/delete task, claim/update/release claim, create/delete task type) reusing Err/Ok, cleanText, date-window checks, revalidateRoster; claim issues fresh token, release clears it; custom types capped at 12

- 2026-07-14T07:28:36Z: implementing server actions
- 2026-07-14T07:22:00Z: Created from .project/templates/task.md by delano task add.
