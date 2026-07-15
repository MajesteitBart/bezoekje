---
name: Care tasks alongside visits
slug: care-tasks
owner: bart
status: complete
created: 2026-07-14T07:20:28Z
updated: 2026-07-14T08:10:44Z
outcome: A roster can coordinate practical care tasks (cooking, transport, groceries) next to visits, claimable without an account
uncertainty: low
probe_required: false
probe_status: skipped
probe_decision_rationale: GitHub issue #1 comments already answered the open product questions; scope is a bounded extension of proven visit patterns
operating_mode: feature
---

# Spec: Care tasks alongside visits

## Executive Summary

Bezoekje coordinates visits through one shared capability URL. LinkedIn feedback
(GitHub issue #1) showed families also coordinate practical tasks around visits —
who drives to the hospital, who cooks — and currently fall back to group chats,
recreating the uncertainty Bezoekje removes for visits. This project adds
admin-created care tasks to the existing day view. Anyone with the public link can
claim a task with just their name, receive a personal edit link (the same
capability pattern as visits), and later adjust or release the claim. Task types
come from a small built-in default set plus admin-defined custom types; a type
declares whether a task needs a specific time or only a day.

## Problem and Users

- **Admins (family organizers)** need practical help to be visible and claimable
  in the same place visits are planned, without teaching visitors a new tool.
- **Helpers (friends/family with the public link)** want to say "I'll do it" in
  one tap, without an account, and be able to change their mind later.
- Today these tasks live in WhatsApp groups: unclear ownership, double claims,
  and repeated "who was doing X?" messages.

## Outcome and Success Metrics

- Outcome: a roster can coordinate care tasks next to visits, claimable without an account.
- Success metrics:
  - An admin can create a task (default or custom type) in under 30 seconds.
  - A helper can claim an open task from the public link in one dialog.
  - A claimed task can be edited or released via the personal link from another device.
  - The default visit-only experience is unchanged when a roster has no tasks.

## User Stories

- US-001: As an admin, I want to put a practical task on a day, so that helpers can see what is needed besides visits.
- US-002: As an admin, I want default task types plus my own custom types (with or without a time), so that the roster matches our family's real needs.
- US-003: As a helper, I want to claim an open task with just my name, so that everyone sees it is covered.
- US-004: As a helper, I want a personal link for my claim, so that I can edit or release it later from any device.
- US-005: As an admin, I want to release or delete any task, so that I can fix mistakes and reassign.

## Acceptance Scenarios

- AC-001: Given a live database with existing rosters, when the new schema bootstraps, then no existing table is altered and existing behavior is unchanged.
- AC-002: Given an admin on the day view, when they add a task with a type that needs a time, then the task appears at that time; with a day-only type it appears in the day's task section without a time.
- AC-003: Given a helper on the public link, when they claim an open task, then the task shows their name to everyone and the claim button disappears.
- AC-004: Given a claimed task, when the claimer releases it, then the task is open again and the old personal link stops working.
- AC-005: Given a claim's personal link opened on a new device, when the page loads, then that browser can edit the claim.
- AC-006: Given a day with an unclaimed task, when the calendar renders, then the day shows an open-task indicator.
- AC-007: Given an admin, when they add a custom task type, then it is offered next to the defaults on subsequent tasks; deleting it does not affect existing tasks.
- AC-008: Given the feature branch, when `npm run typecheck && npm run lint && npm run build` run, then all pass; a manual GUI smoke covers create → claim → release.

## Scope

### In Scope

- New `tasks` and `task_types` tables (additive bootstrap DDL only).
- Admin task creation/deletion on a specific day; optional time; optional note.
- Built-in default task types (code constants) + per-roster custom types.
- Claim/edit/release by helpers via edit-token capability, personal link route
  `/r/[token]/t/[taskId]/[editToken]`, and localStorage memory.
- Task rendering in the existing day panel (timed tasks interleaved with visits,
  day tasks in a section above), open-task calendar dot.

## Out of Scope

- Tasks created by non-admin visitors.
- Recurring tasks, reminders, or notifications.
- Tasks consuming visit capacity or interacting with blocked times.
- Time ranges for tasks (a single "at HH:MM" is enough for v1).
- Hiding/renaming the built-in default types.
- "You're visiting anyway, could you also…" cross-suggestions (idea from the
  issue comments; revisit after v1 feedback).

## Functional Requirements

- FR-1: A task belongs to a roster and a date; it snapshots its label and
  needs-time flag from the chosen type so type deletion never breaks tasks.
- FR-2: A task with `needsTime` requires a start time (set by admin at creation,
  adjustable by the claimer); day-only tasks never show a time.
- FR-3: Claiming stores the helper's name (+ optional note), issues a fresh edit
  token, and returns the personal link; releasing clears claim fields and the
  token (old links 404 into no-access errors).
- FR-4: The roster admin token authorizes every task mutation; the task edit
  token authorizes only editing/releasing that claim.
- FR-5: Public DTOs never contain edit tokens or admin tokens.
- FR-6: Default types ship as code constants (Dutch labels + emoji); custom types
  are per-roster rows with a needs-time flag, max 12 per roster.
- FR-7: Task dates follow the same window rules as visits (today … daysAhead).

## Non-Functional Requirements

- Mobile-first: dialogs reuse existing keyboard-safe bottom-sheet primitives.
- Dutch copy throughout, same warm tone as existing UI.
- No new dependencies; additive-only runtime DDL, safe for the live database.
- Amsterdam-timezone date logic reused from `lib/dates.ts`.

## Assumptions

- One person may claim any number of tasks (confirmed in issue comments).
- Admin-only task creation keeps the public experience simple (issue: "Keep the
  default visit-planning experience simple").
- A single time point ("om 17:00") is sufficient; ranges can come later.

## Needs Clarification

- None blocking; issue comments answered the four open questions.

## Hypotheses and Unknowns

- Hypothesis: interleaving timed tasks with visits (rather than a separate tab)
  keeps coordination glanceable — supported by issue comment preference.
- Unknown: whether families want helpers to propose tasks; deferred.

## Touchpoints to Exercise

- Roster creation → admin day view → add task (timed + day-only, default + custom type).
- Public link → claim → personal link on second browser → edit → release.
- Admin release/delete; calendar dot for open tasks; empty-roster regression.

## Probe Findings

- Probe skipped; see rationale in frontmatter.

## Footguns Discovered

- `CREATE TABLE IF NOT EXISTS` does not evolve tables — new tables only, no ALTERs needed.
- Booking capacity is checked without a transaction today; task claiming has the
  same benign race (last write wins on `claimed_name`) — accepted, documented.

## Remaining Unknowns

- Helper-proposed tasks and visit/task cross-suggestions (out of scope).

## Dependencies

- None external. Builds on existing capability-token, DTO, and dialog patterns.

## Approval Notes

- Derived from GitHub issue #1 and its maintainer comments (defaults + custom
  types; multiple claims per person; per-type time requirement; render in the
  existing day view).
