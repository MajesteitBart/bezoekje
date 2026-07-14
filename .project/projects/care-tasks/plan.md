---
name: Care tasks alongside visits
status: done
lead: bart
created: 2026-07-14T07:20:28Z
updated: 2026-07-14T08:10:44Z
linear_project_id: 
risk_level: low
spec_status_at_plan_time: active
operating_mode: feature
---

# Delivery Plan: Care tasks alongside visits

## What Changed After Probe

- Probe skipped (low uncertainty; issue comments resolved the product questions).

## Technical Context

- Next.js App Router with Server Components validating capability URLs, Server
  Actions for all writes (`app/actions.ts`), libSQL/SQLite with runtime bootstrap
  DDL (`lib/db/index.ts`), token-safe DTOs (`lib/types.ts`, `lib/data.ts`), and
  client dialogs under `components/roster/`.
- The live database evolves only through idempotent `CREATE TABLE IF NOT EXISTS`
  plus explicit column migrations; this feature needs new tables only.
- Visits already prove the whole capability pattern this feature reuses:
  create → edit token → localStorage → personal link route → edit/delete.

## Architecture Decisions

- **Snapshot type onto task rows** (`label`, `needs_time`): deleting a custom
  type must never orphan or mutate existing tasks. Reversible, low cost.
- **Default types as code constants, custom types as rows**: avoids backfilling
  default rows into existing live rosters and keeps defaults updatable in code.
- **Single time point (`start_min` nullable), no end time**: matches "wie kookt
  om 17:00"; a range adds two selects of friction for no coordination value yet.
- **Tasks are orthogonal to visit capacity and blocked times**: driving someone
  to the hospital during a rest hour is normal; tasks never consume visit slots.
- **Claim token issued at claim time and cleared on release**: releasing revokes
  the personal link, so a re-claimed task never inherits a stale capability.
- **New route `/r/[token]/t/[taskId]/[editToken]`** mirrors the visit link route
  so cross-device behavior is identical for visits and tasks.

## Policy and Contract Checks

- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit (skipped, rationale in spec frontmatter)
- [x] Evidence gates are defined before handoff (AC-008 quality gate task)
- [x] External sync writes require operator approval (branch push + PR only; never main)

## Generated Artifact Map

- `spec.md`: written from GitHub issue #1 body + maintainer comments.
- `plan.md`: this file.
- `workstreams/`: single workstream WS-A (no parallel streams needed).
- `tasks/`: T-001…T-006, sequenced data → actions → capability → UI → quality.

## Complexity Exceptions

- None. No new dependencies, no framework changes.

## Probe-Driven Architecture Changes

- Not applicable (probe skipped).

## Workstream Design

- WS-A "Care tasks end-to-end": one stream, sequential tasks with explicit
  `depends_on`; conflict zones declared per task (schema/db files, actions file,
  roster components).

## Milestone Strategy

- M1 (T-001–T-003): data + actions + capability route — feature is exercisable
  through server actions.
- M2 (T-004–T-005): admin and helper UI in the day view.
- M3 (T-006): quality gate, docs, PR.

## Rollout Strategy

- Ship behind nothing: rosters without tasks render exactly as before (tasks
  arrays empty). Additive DDL runs on first query after deploy.
- Merge via PR from `feature/care-tasks`; never push to `main` directly (live app).

## Test Strategy

- Repo has no automated test suite; gate is `npm run typecheck`, `npm run lint`,
  `npm run build`, plus a manual GUI smoke on a dev server with a scratch DB:
  create roster → add timed + day-only tasks (default + custom type) → claim from
  public link → personal link in a second context → edit → release → admin delete.

## Rollback Strategy

- Revert the merge commit. New tables are ignored by reverted code; no data
  migration to unwind. No existing table is touched.

## Remaining Delivery Risks

- Claim race (two helpers claim simultaneously): last write wins, same class of
  benign race as visit capacity today; noted in spec footguns.
- `local.db` in the deploy volume grows two tables on first request; bootstrap
  DDL failure would surface as a 500 — mitigated by identical pattern already in
  production for six tables.
