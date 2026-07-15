---
id: T-005
name: Day view UI: task rendering, claim and edit dialogs, calendar hint
status: done
workstream: WS-A
created: 2026-07-14T07:22:01Z
updated: 2026-07-14T07:34:06Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-003, T-004]
conflicts_with: [components/roster/**, lib/slots.ts]
parallel: true
priority: high
estimate: L
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: [AC-003, AC-004, AC-006]
---

# Task: Day view UI: task rendering, claim and edit dialogs, calendar hint

## Description

Render tasks in the day panel: day-only tasks in a task section above the
timeline, timed tasks interleaved with visits/blocks via buildDayItems. Open
tasks show a claim button (claim-task-dialog.tsx with name, optional time
adjust, note, personal-link result). Claimed tasks show the helper name with an
edit control for the claim owner/admin (edit-task-dialog.tsx: edit, release,
admin delete). Calendar shows a distinct dot on days with open tasks.

## Acceptance Criteria
- [x] Open task: label, optional time/note, claim button visible to everyone (AC-003)
- [x] Claimed task: helper name visible; edit only for token owner or admin; release restores open state (AC-004)
- [x] Claim result shows personal link with copy button, saved to localStorage, name remembered
- [x] Calendar open-task indicator distinct from the booked-visit dot (AC-006)
- [x] Roster without tasks renders exactly as before

## Traceability
- Story: US-003
- Acceptance criteria: AC-003, AC-004, AC-006

## Technical Notes

Extend DayItem with a task variant; pass tasks through both roster pages and
RosterView. Reuse getSavedName/saveName and copyText for the claim flow.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass (typecheck/lint/build gate)
- [x] Review complete
- [x] Docs updated (covered by T-006)

## Evidence Log

- 2026-07-14T07:34:06Z: Day panel renders day-only tasks in a 'Voor deze dag' section and timed tasks interleaved via buildDayItems task variant; claim-task-dialog with personal-link result, edit-task-dialog with release + admin delete; amber top-right calendar dot for days with open tasks; both roster pages pass tasks/taskTypes

- 2026-07-14T07:30:49Z: day view rendering and claim dialogs
- 2026-07-14T07:22:00Z: Created from .project/templates/task.md by delano task add.
