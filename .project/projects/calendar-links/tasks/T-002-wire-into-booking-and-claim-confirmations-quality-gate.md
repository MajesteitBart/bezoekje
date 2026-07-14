---
id: T-002
name: Wire into booking and claim confirmations + quality gate
status: done
workstream: WS-A
created: 2026-07-14T13:56:49Z
updated: 2026-07-14T13:59:50Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001]
conflicts_with: [components/roster/book-dialog.tsx, components/roster/claim-task-dialog.tsx]
parallel: true
priority: high
estimate: S
operating_mode: scoped-change
story_id: 
acceptance_criteria_ids: []
---

# Task: Wire into booking and claim confirmations + quality gate

## Description

## Acceptance Criteria

- [x] Booking result dialog and task claim result dialog show the calendar buttons with correct date/time and description
- [x] typecheck/build pass; dev-server smoke verifies the rendered calendar links

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

- 2026-07-14T13:59:50Z: AddToCalendar wired into booking and claim confirmation views (visit: timed event with chosen end; task: timed or all-day). typecheck/build green. Dev-server smoke: booked a visit, confirmation shows both buttons, Google Calendar URL has correct title/dates shape and personal link + edit hint in details, ics download click errors-free

- 2026-07-14T13:57:29Z: wire into dialogs
- 2026-07-14T13:56:49Z: Created from .project/templates/task.md by `delano task add`.
