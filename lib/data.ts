import { and, eq, gte, lte } from "drizzle-orm";

import { db, dbReady } from "@/lib/db";
import { blockedTimes, rosters, visits } from "@/lib/db/schema";
import type { BlockedDTO, RosterDTO, VisitDTO } from "@/lib/types";

export type RosterRow = typeof rosters.$inferSelect;

export async function getRosterByPublicToken(
  publicToken: string
): Promise<RosterRow | null> {
  await dbReady();
  const rows = await db
    .select()
    .from(rosters)
    .where(eq(rosters.publicToken, publicToken))
    .limit(1);
  return rows[0] ?? null;
}

export function toRosterDTO(roster: RosterRow): RosterDTO {
  return {
    publicToken: roster.publicToken,
    title: roster.title,
    pinnedNote: roster.pinnedNote,
    startMin: roster.startMin,
    endMin: roster.endMin,
    slotMinutes: roster.slotMinutes,
    maxConcurrent: roster.maxConcurrent,
    daysAhead: roster.daysAhead,
  };
}

export async function getVisitsInRange(
  rosterId: string,
  fromISO: string,
  toISO: string
): Promise<VisitDTO[]> {
  await dbReady();
  const rows = await db
    .select()
    .from(visits)
    .where(
      and(
        eq(visits.rosterId, rosterId),
        gte(visits.date, fromISO),
        lte(visits.date, toISO)
      )
    );
  return rows.map((v) => ({
    id: v.id,
    date: v.date,
    startMin: v.startMin,
    endMin: v.endMin,
    name: v.name,
    note: v.note,
  }));
}

export async function getBlockedInRange(
  rosterId: string,
  fromISO: string,
  toISO: string
): Promise<BlockedDTO[]> {
  await dbReady();
  const rows = await db
    .select()
    .from(blockedTimes)
    .where(
      and(
        eq(blockedTimes.rosterId, rosterId),
        gte(blockedTimes.date, fromISO),
        lte(blockedTimes.date, toISO)
      )
    );
  return rows.map((b) => ({
    id: b.id,
    date: b.date,
    startMin: b.startMin,
    endMin: b.endMin,
    label: b.label,
  }));
}
