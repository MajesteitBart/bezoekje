import { and, eq, gte, lte } from "drizzle-orm";

import { addDaysISO } from "@/lib/dates";
import { db, dbReady } from "@/lib/db";
import { taskSeries, tasks } from "@/lib/db/schema";
import { newId } from "@/lib/tokens";
import type { RepeatFreq } from "@/lib/types";

// Weekday from a plain ISO date, independent of server timezone.
function isoWeekday(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

/** Occurrence dates of a series within [fromISO, toISO], anchor included. */
export function seriesDatesInRange(
  series: { freq: string; anchorDate: string },
  fromISO: string,
  toISO: string
): string[] {
  const dates: string[] = [];
  const anchorDay = isoWeekday(series.anchorDate);
  let d = series.anchorDate > fromISO ? series.anchorDate : fromISO;
  for (; d <= toISO; d = addDaysISO(d, 1)) {
    if (series.freq === "daily" || isoWeekday(d) === anchorDay) dates.push(d);
  }
  return dates;
}

/**
 * Materialize missing occurrences of all recurring series of a roster within
 * the given window. Runs on roster page loads so occurrences keep appearing as
 * the planning horizon rolls forward. The partial unique index on
 * (series_id, date) plus ON CONFLICT DO NOTHING makes concurrent calls safe.
 */
export async function ensureRecurringTasks(
  rosterId: string,
  fromISO: string,
  toISO: string
): Promise<void> {
  await dbReady();
  const series = await db
    .select()
    .from(taskSeries)
    .where(eq(taskSeries.rosterId, rosterId));
  if (series.length === 0) return;

  for (const s of series) {
    const wanted = seriesDatesInRange(s, fromISO, toISO);
    if (wanted.length === 0) continue;
    const existing = await db
      .select({ date: tasks.date })
      .from(tasks)
      .where(
        and(
          eq(tasks.seriesId, s.id),
          gte(tasks.date, fromISO),
          lte(tasks.date, toISO)
        )
      );
    const have = new Set(existing.map((r) => r.date));
    const missing = wanted.filter((d) => !have.has(d));
    if (missing.length === 0) continue;
    const now = Date.now();
    await db
      .insert(tasks)
      .values(
        missing.map((date) => ({
          id: newId(),
          rosterId,
          date,
          label: s.label,
          needsTime: s.needsTime,
          startMin: s.startMin,
          note: s.note,
          seriesId: s.id,
          createdAt: now,
          updatedAt: now,
        }))
      )
      .onConflictDoNothing();
  }
}

export function isRepeatFreq(value: unknown): value is RepeatFreq {
  return value === "daily" || value === "weekly";
}
