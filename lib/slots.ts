import type { BlockedDTO, RosterDTO, TaskDTO, VisitDTO } from "@/lib/types";

export type DayItem =
  | { type: "visit"; visit: VisitDTO }
  | { type: "task"; task: TaskDTO }
  | { type: "free"; startMin: number; endMin: number }
  | { type: "blocked"; blocked: BlockedDTO };

export function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

const typeOrder: Record<DayItem["type"], number> = {
  blocked: 0,
  visit: 1,
  task: 2,
  free: 3,
};

function itemStart(item: DayItem): number {
  if (item.type === "visit") return item.visit.startMin;
  if (item.type === "blocked") return item.blocked.startMin;
  if (item.type === "task") return item.task.startMin ?? 0;
  return item.startMin;
}

/**
 * Free slots follow the roster grid (slotMinutes) within visiting hours,
 * minus blocked ranges, minus slots already at maxConcurrent capacity.
 * `nowMin` hides slots that already started (pass only for today).
 * Timed care tasks are interleaved for display but never affect free slots:
 * tasks are orthogonal to visit capacity and blocked times.
 */
export function buildDayItems({
  roster,
  visits,
  blocked,
  tasks = [],
  nowMin,
}: {
  roster: Pick<
    RosterDTO,
    "startMin" | "endMin" | "slotMinutes" | "maxConcurrent"
  >;
  visits: VisitDTO[];
  blocked: BlockedDTO[];
  tasks?: TaskDTO[];
  nowMin?: number | null;
}): DayItem[] {
  const items: DayItem[] = [
    ...visits.map((visit) => ({ type: "visit" as const, visit })),
    ...blocked.map((b) => ({ type: "blocked" as const, blocked: b })),
    ...tasks
      .filter((t) => t.startMin != null)
      .map((task) => ({ type: "task" as const, task })),
  ];

  const step = Math.max(15, roster.slotMinutes);
  for (let s = roster.startMin; s + step <= roster.endMin; s += step) {
    const e = s + step;
    if (nowMin != null && s < nowMin) continue;
    if (blocked.some((b) => overlaps(s, e, b.startMin, b.endMin))) continue;
    const occupancy = visits.filter((v) =>
      overlaps(s, e, v.startMin, v.endMin)
    ).length;
    if (occupancy >= roster.maxConcurrent) continue;
    items.push({ type: "free", startMin: s, endMin: e });
  }

  return items.sort(
    (a, b) => itemStart(a) - itemStart(b) || typeOrder[a.type] - typeOrder[b.type]
  );
}

/** True when nothing is booked yet on this day. */
export function dayIsEmpty(visits: VisitDTO[]): boolean {
  return visits.length === 0;
}

/** Overlapping-visit count check used by booking validation. */
export function capacityLeft(
  visits: VisitDTO[],
  startMin: number,
  endMin: number,
  maxConcurrent: number,
  ignoreVisitId?: string
): boolean {
  const overlapping = visits.filter(
    (v) =>
      v.id !== ignoreVisitId && overlaps(startMin, endMin, v.startMin, v.endMin)
  );
  return overlapping.length < maxConcurrent;
}
