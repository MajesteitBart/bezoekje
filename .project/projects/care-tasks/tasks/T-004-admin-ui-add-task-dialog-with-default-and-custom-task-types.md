---
id: T-004
name: Admin UI: add-task dialog with default and custom task types
status: done
workstream: WS-A
created: 2026-07-14T07:22:01Z
updated: 2026-07-14T07:30:49Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002]
conflicts_with: [components/roster/**]
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-002, AC-007]
---

# Task: Admin UI: add-task dialog with default and custom task types

## Description

New components/roster/task-dialog.tsx: admin picks a type (default chips + custom
types), optionally creates a custom type inline (name + needs-time toggle, saved
for reuse), sets the time when the type needs one, and an optional note. Wire a
"Taak toevoegen" button into the day panel header for admins.

## Acceptance Criteria
- [x] Default types shown with emoji; custom types listed after them; admin can delete a custom type without affecting existing tasks (AC-007)
- [x] Time selector only shown for needs-time types (AC-002)
- [x] Dialog follows existing keyboard-safe Dialog/TimeSelect patterns and Dutch copy

## Traceability
- Story: US-002
- Acceptance criteria: AC-002, AC-007

## Technical Notes

Type list = DEFAULT_TASK_TYPES + taskTypes DTOs from the server page; selection
snapshots label/needsTime into the create action input.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass (typecheck/lint/build gate)
- [x] Review complete
- [x] Docs updated (covered by T-006)

## Evidence Log

- 2026-07-14T07:30:49Z: components/roster/task-dialog.tsx: default type chips with emoji, custom type chips with admin delete, inline own-type creation with needs-time + save-as-type toggles, TimeSelect only for timed types, Dutch copy

- 2026-07-14T07:29:55Z: admin add-task dialog
- 2026-07-14T07:22:00Z: Created from .project/templates/task.md by delano task add.
