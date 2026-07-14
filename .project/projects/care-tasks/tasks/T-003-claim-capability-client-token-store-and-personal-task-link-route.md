---
id: T-003
name: Claim capability: client token store and personal task link route
status: done
workstream: WS-A
created: 2026-07-14T07:22:01Z
updated: 2026-07-14T07:29:55Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002]
conflicts_with: [lib/client-tokens.ts, app/r/**]
parallel: true
priority: medium
estimate: S
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-005]
---

# Task: Claim capability: client token store and personal task link route

## Description

Extend lib/client-tokens.ts with a task-token namespace (tasks:{publicToken}:tokens)
and add route app/r/[token]/t/[taskId]/[editToken]/page.tsx that validates the
capability server-side, stores it in localStorage via a small client component,
and forwards to the roster, mirroring the visit personal-link route.

## Acceptance Criteria
- [x] getTaskTokens/saveTaskToken/removeTaskToken stored separately from visit tokens
- [x] Route 404s on unknown roster/task or token mismatch (including released claims)
- [x] Valid link imports edit rights into the browser and redirects to /r/[token] (AC-005)

## Traceability
- Story: US-004
- Acceptance criteria: AC-005

## Technical Notes

Reuse the SaveEditToken pattern with a task-specific client component; released
tasks have edit_token NULL, which can never equal a supplied token.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass (typecheck/lint/build gate)
- [x] Review complete
- [x] Docs updated (covered by T-006)

## Evidence Log

- 2026-07-14T07:29:55Z: Task-token namespace in lib/client-tokens.ts, SaveTaskToken client bridge, and /r/[token]/t/[taskId]/[editToken] route validating editToken server-side (NULL-safe for released claims)

- 2026-07-14T07:29:24Z: claim capability plumbing
- 2026-07-14T07:22:00Z: Created from .project/templates/task.md by delano task add.
