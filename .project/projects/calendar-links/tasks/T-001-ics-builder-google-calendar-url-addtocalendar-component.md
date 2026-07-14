---
id: T-001
name: ICS builder, Google Calendar URL, AddToCalendar component
status: done
workstream: WS-A
created: 2026-07-14T13:56:49Z
updated: 2026-07-14T13:57:29Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: [lib/calendar.ts, components/roster/add-to-calendar.tsx]
parallel: true
priority: high
estimate: S
operating_mode: scoped-change
story_id: 
acceptance_criteria_ids: []
---

# Task: ICS builder, Google Calendar URL, AddToCalendar component

## Description

## Acceptance Criteria

- [x] lib/calendar.ts builds valid ICS (timed + all-day, escaped text, folded lines, personal link in description) and a Google Calendar template URL
- [x] AddToCalendar renders ics-download and Google Agenda buttons

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

- 2026-07-14T13:57:29Z: lib/calendar.ts: buildIcs (timed + all-day, escaping, RFC5545 line folding, floating local times), googleCalendarUrl, downloadIcs via blob; components/roster/add-to-calendar.tsx with .ics and Google Agenda buttons

- 2026-07-14T13:56:49Z: calendar lib + component
- 2026-07-14T13:56:49Z: Created from .project/templates/task.md by `delano task add`.
