---
id: T-003
name: Outlook deeplink and Google timezone pin (post-research)
status: done
workstream: WS-A
created: 2026-07-14T14:01:09Z
updated: 2026-07-14T14:02:43Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002]
conflicts_with: []
parallel: true
priority: medium
estimate: S
operating_mode: scoped-change
story_id: 
acceptance_criteria_ids: []
---

# Task: Outlook deeplink and Google timezone pin (post-research)

## Description

## Acceptance Criteria

- [x] Outlook.com compose deeplink button (timed + all-day)
- [x] Google link carries ctz=Europe/Amsterdam so wall time is correct for users whose Google zone differs

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

- 2026-07-14T14:02:43Z: outlookCalendarUrl deeplink (timed + all-day) added as third button; Google URL pinned with ctz=Europe/Amsterdam; browser smoke confirms ctz, outlook startdt shape, personal link in outlook body, ics button present. Research basis: Google+Outlook direct links plus ics for Apple/other is the standard trio

- 2026-07-14T14:01:09Z: research follow-up
- 2026-07-14T14:01:09Z: Created from .project/templates/task.md by `delano task add`.
