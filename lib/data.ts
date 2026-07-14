import { and, eq, gte, lte } from "drizzle-orm";

import { db, dbReady } from "@/lib/db";
import { user } from "@/lib/db/auth-schema";
import {
  blockedTimes,
  rosterAdmins,
  rosters,
  taskTypes,
  tasks,
  visits,
} from "@/lib/db/schema";
import {
  NOTE_LEVELS,
  type BlockedDTO,
  type NoteLevel,
  type RosterDTO,
  type TaskDTO,
  type TaskTypeDTO,
  type VisitDTO,
} from "@/lib/types";

function isNoteLevel(value: string): value is NoteLevel {
  return (NOTE_LEVELS as readonly string[]).includes(value);
}

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
    pinnedNoteLevel: isNoteLevel(roster.pinnedNoteLevel)
      ? roster.pinnedNoteLevel
      : "warning",
    startMin: roster.startMin,
    endMin: roster.endMin,
    slotMinutes: roster.slotMinutes,
    maxConcurrent: roster.maxConcurrent,
    daysAhead: roster.daysAhead,
  };
}

export async function linkRosterToUser(
  rosterId: string,
  userId: string
): Promise<void> {
  await dbReady();
  await db
    .insert(rosterAdmins)
    .values({ rosterId, userId, createdAt: Date.now() })
    .onConflictDoNothing();
}

export async function getRostersForUser(userId: string): Promise<RosterRow[]> {
  await dbReady();
  const rows = await db
    .select({ roster: rosters })
    .from(rosterAdmins)
    .innerJoin(rosters, eq(rosterAdmins.rosterId, rosters.id))
    .where(eq(rosterAdmins.userId, userId));
  return rows.map((r) => r.roster);
}

export async function getRosterAdminEmails(rosterId: string): Promise<string[]> {
  await dbReady();
  const rows = await db
    .select({ email: user.email })
    .from(rosterAdmins)
    .innerJoin(user, eq(rosterAdmins.userId, user.id))
    .where(eq(rosterAdmins.rosterId, rosterId));
  return rows.map((r) => r.email);
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

export async function getTasksInRange(
  rosterId: string,
  fromISO: string,
  toISO: string
): Promise<TaskDTO[]> {
  await dbReady();
  const rows = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.rosterId, rosterId),
        eq(tasks.cancelled, false),
        gte(tasks.date, fromISO),
        lte(tasks.date, toISO)
      )
    );
  return rows.map((t) => ({
    id: t.id,
    date: t.date,
    label: t.label,
    needsTime: t.needsTime,
    startMin: t.startMin,
    note: t.note,
    claimedName: t.claimedName,
    claimedNote: t.claimedNote,
    seriesId: t.seriesId,
  }));
}

export async function getTaskTypes(rosterId: string): Promise<TaskTypeDTO[]> {
  await dbReady();
  const rows = await db
    .select()
    .from(taskTypes)
    .where(eq(taskTypes.rosterId, rosterId));
  return rows.map((t) => ({
    id: t.id,
    name: t.name,
    needsTime: t.needsTime,
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
