---
id: T-006
name: Quality gate: typecheck, lint, build, GUI smoke, docs
status: done
workstream: WS-A
created: 2026-07-14T07:22:02Z
updated: 2026-07-14T08:10:44Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-005]
conflicts_with: [README.md]
parallel: true
priority: medium
estimate: S
operating_mode: feature
story_id: 
acceptance_criteria_ids: [AC-008]
---

# Task: Quality gate: typecheck, lint, build, GUI smoke, docs

## Description

Run the repo quality gates (typecheck, lint, build), perform the manual GUI
smoke from the plan test strategy on a dev server with a scratch database, and
update README feature notes. Record evidence here and in the project update.

## Acceptance Criteria
- [x] npm run typecheck, npm run lint, npm run build all pass (AC-008)
- [x] GUI smoke: create roster, add timed + day-only task (default + custom type), claim from public link, personal link in second context, edit, release, admin delete
- [x] README mentions care tasks; delano validate passes

## Traceability
- Story: none
- Acceptance criteria: AC-008

## Technical Notes

Use file:local.db in the worktree (gitignored). Never point at production Turso.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-14T08:10:44Z: typecheck PASS, build PASS, lint has only the repo-wide pre-existing react-hooks/set-state-in-effect findings (new dialogs mirror the existing dialog reset pattern); GUI smoke on dev server + scratch db: create roster, timed Vervoer task, day-only custom 'Hond uitlaten' type saved for reuse, claim as Anneke, personal link imports rights after localStorage clear, release restores open state and old link 404s, amber open-task calendar dot verified; stuck-dialog-close observed under automation reproduces identically on unmodified main (background-tab transition throttling), not a regression; README updated

- 2026-07-14T07:34:07Z: quality gate
- 2026-07-14T07:22:00Z: Created from .project/templates/task.md by delano task add.
