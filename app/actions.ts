"use server";

import { and, eq, gte, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getRosterByPublicToken,
  getVisitsInRange,
  getBlockedInRange,
  type RosterRow,
} from "@/lib/data";
import { addDaysISO, isValidISODate, nowMinutes, todayISO } from "@/lib/dates";
import { db, dbReady } from "@/lib/db";
import {
  blockedSeries,
  blockedTimes,
  rosters,
  taskSeries,
  taskTypes,
  tasks,
  visits,
} from "@/lib/db/schema";
import {
  ensureRecurringBlocks,
  ensureRecurringTasks,
  isRepeatFreq,
} from "@/lib/recurrence";
import { capacityLeft, overlaps } from "@/lib/slots";
import { MAX_CUSTOM_TASK_TYPES } from "@/lib/task-types";
import { newId, newToken } from "@/lib/tokens";
import { NOTE_LEVELS, type NoteLevel } from "@/lib/types";

type Err = { ok: false; error: string };
type Ok<T = object> = { ok: true } & T;

function err(error: string): Err {
  return { ok: false, error };
}

function cleanText(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

function isValidTimeRange(startMin: unknown, endMin: unknown): boolean {
  return (
    typeof startMin === "number" &&
    typeof endMin === "number" &&
    Number.isInteger(startMin) &&
    Number.isInteger(endMin) &&
    startMin % 5 === 0 &&
    endMin % 5 === 0 &&
    startMin >= 0 &&
    endMin <= 24 * 60 &&
    startMin < endMin
  );
}

function revalidateRoster(roster: RosterRow) {
  revalidatePath(`/r/${roster.publicToken}`);
  revalidatePath(`/r/${roster.publicToken}/admin/${roster.adminToken}`);
}

async function requireAdmin(
  publicToken: string,
  adminToken: string
): Promise<RosterRow | null> {
  const roster = await getRosterByPublicToken(publicToken);
  if (!roster || roster.adminToken !== adminToken) return null;
  return roster;
}

export async function createRosterAction(formData: FormData) {
  const title = cleanText(formData.get("title"), 80);
  if (!title) return;
  await dbReady();
  const publicToken = newToken();
  const adminToken = newToken();
  await db.insert(rosters).values({
    id: newId(),
    publicToken,
    adminToken,
    title,
    // explicit: tables created before the default changed still carry DEFAULT 2
    maxConcurrent: 1,
    createdAt: Date.now(),
  });
  redirect(`/r/${publicToken}/admin/${adminToken}?welkom=1`);
}

type VisitInput = {
  publicToken: string;
  date: string;
  startMin: number;
  endMin: number;
  name: string;
  note?: string | null;
};

async function validateVisitSlot(
  roster: RosterRow,
  input: Pick<VisitInput, "date" | "startMin" | "endMin">,
  ignoreVisitId?: string
): Promise<Err | null> {
  if (!isValidISODate(input.date)) return err("Ongeldige datum.");
  const today = todayISO();
  if (input.date < today) return err("Deze datum is al voorbij.");
  if (input.date > addDaysISO(today, roster.daysAhead))
    return err("Deze datum ligt te ver vooruit.");
  if (!isValidTimeRange(input.startMin, input.endMin))
    return err("Ongeldig tijdstip.");
  if (input.startMin < roster.startMin || input.endMin > roster.endMin)
    return err("Buiten de bezoektijden.");
  if (input.date === today && input.endMin <= nowMinutes())
    return err("Dit tijdstip is al voorbij.");

  const [dayVisits, dayBlocked] = await Promise.all([
    getVisitsInRange(roster.id, input.date, input.date),
    getBlockedInRange(roster.id, input.date, input.date),
  ]);
  if (
    dayBlocked.some((b) =>
      overlaps(input.startMin, input.endMin, b.startMin, b.endMin)
    )
  )
    return err("Dit tijdstip is geblokkeerd (bijv. rustmoment).");
  if (
    !capacityLeft(
      dayVisits,
      input.startMin,
      input.endMin,
      roster.maxConcurrent,
      ignoreVisitId
    )
  )
    return err("Dit tijdstip is al volgeboekt. Kies een ander moment.");
  return null;
}

export async function createVisitAction(
  input: VisitInput
): Promise<Err | Ok<{ visitId: string; editToken: string }>> {
  const roster = await getRosterByPublicToken(input.publicToken);
  if (!roster) return err("Rooster niet gevonden.");

  const name = cleanText(input.name, 50);
  if (!name) return err("Vul je naam in.");
  const note = cleanText(input.note, 300);

  const slotError = await validateVisitSlot(roster, input);
  if (slotError) return slotError;

  const visitId = newId();
  const editToken = newToken();
  const now = Date.now();
  await db.insert(visits).values({
    id: visitId,
    rosterId: roster.id,
    date: input.date,
    startMin: input.startMin,
    endMin: input.endMin,
    name,
    note,
    editToken,
    createdAt: now,
    updatedAt: now,
  });
  revalidateRoster(roster);
  return { ok: true, visitId, editToken };
}

type VisitAuth = {
  publicToken: string;
  visitId: string;
  /** The visit's own editToken, or the roster adminToken. */
  token: string;
};

async function getAuthorizedVisit({ publicToken, visitId, token }: VisitAuth) {
  const roster = await getRosterByPublicToken(publicToken);
  if (!roster) return null;
  await dbReady();
  const rows = await db
    .select()
    .from(visits)
    .where(and(eq(visits.id, visitId), eq(visits.rosterId, roster.id)))
    .limit(1);
  const visit = rows[0];
  if (!visit) return null;
  if (visit.editToken !== token && roster.adminToken !== token) return null;
  return { roster, visit };
}

export async function updateVisitAction(
  input: VisitAuth & Omit<VisitInput, "publicToken">
): Promise<Err | Ok> {
  const found = await getAuthorizedVisit(input);
  if (!found) return err("Bezoek niet gevonden of geen toegang.");
  const { roster, visit } = found;

  const name = cleanText(input.name, 50);
  if (!name) return err("Vul je naam in.");
  const note = cleanText(input.note, 300);

  const slotError = await validateVisitSlot(roster, input, visit.id);
  if (slotError) return slotError;

  await db
    .update(visits)
    .set({
      date: input.date,
      startMin: input.startMin,
      endMin: input.endMin,
      name,
      note,
      updatedAt: Date.now(),
    })
    .where(eq(visits.id, visit.id));
  revalidateRoster(roster);
  return { ok: true };
}

export async function deleteVisitAction(input: VisitAuth): Promise<Err | Ok> {
  const found = await getAuthorizedVisit(input);
  if (!found) return err("Bezoek niet gevonden of geen toegang.");
  await db.delete(visits).where(eq(visits.id, found.visit.id));
  revalidateRoster(found.roster);
  return { ok: true };
}

type RosterSettingsInput = {
  publicToken: string;
  adminToken: string;
  title: string;
  pinnedNote?: string | null;
  pinnedNoteLevel: NoteLevel;
  startMin: number;
  endMin: number;
  maxConcurrent: number;
  daysAhead: number;
};

export async function updateRosterAction(
  input: RosterSettingsInput
): Promise<Err | Ok> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");

  const title = cleanText(input.title, 80);
  if (!title) return err("Vul een titel in.");
  const pinnedNote = cleanText(input.pinnedNote, 500);
  if (!(NOTE_LEVELS as readonly string[]).includes(input.pinnedNoteLevel))
    return err("Ongeldige urgentie.");
  if (!isValidTimeRange(input.startMin, input.endMin))
    return err("Ongeldige bezoektijden.");
  if (input.endMin - input.startMin < roster.slotMinutes)
    return err("Bezoektijden zijn te kort.");
  if (
    !Number.isInteger(input.maxConcurrent) ||
    input.maxConcurrent < 1 ||
    input.maxConcurrent > 6
  )
    return err("Ongeldig aantal gelijktijdige bezoekers.");
  if (
    !Number.isInteger(input.daysAhead) ||
    input.daysAhead < 3 ||
    input.daysAhead > 60
  )
    return err("Ongeldige planhorizon.");

  await db
    .update(rosters)
    .set({
      title,
      pinnedNote,
      pinnedNoteLevel: input.pinnedNoteLevel,
      startMin: input.startMin,
      endMin: input.endMin,
      maxConcurrent: input.maxConcurrent,
      daysAhead: input.daysAhead,
    })
    .where(eq(rosters.id, roster.id));
  revalidateRoster(roster);
  return { ok: true };
}

type BlockedInput = {
  publicToken: string;
  adminToken: string;
  date: string;
  startMin: number;
  endMin: number;
  label?: string | null;
  /** "none" (default) blocks a single day; otherwise a recurring series. */
  repeat?: "none" | "daily" | "weekly";
};

export async function addBlockedTimeAction(
  input: BlockedInput
): Promise<Err | Ok> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");
  if (!isValidISODate(input.date) || input.date < todayISO())
    return err("Ongeldige datum.");
  if (!isValidTimeRange(input.startMin, input.endMin))
    return err("Ongeldig tijdstip.");

  const label = cleanText(input.label, 60);
  if (isRepeatFreq(input.repeat)) {
    await db.insert(blockedSeries).values({
      id: newId(),
      rosterId: roster.id,
      startMin: input.startMin,
      endMin: input.endMin,
      label,
      freq: input.repeat,
      anchorDate: input.date,
      createdAt: Date.now(),
    });
    await ensureRecurringBlocks(
      roster.id,
      input.date,
      addDaysISO(todayISO(), roster.daysAhead)
    );
  } else {
    await db.insert(blockedTimes).values({
      id: newId(),
      rosterId: roster.id,
      date: input.date,
      startMin: input.startMin,
      endMin: input.endMin,
      label,
      createdAt: Date.now(),
    });
  }
  revalidateRoster(roster);
  return { ok: true };
}

// ---- Care tasks -----------------------------------------------------------
// Tasks are created by the admin and claimed by anyone with the public link.
// They are deliberately orthogonal to visit capacity and blocked times: driving
// someone to the hospital during a rest hour is normal.

function isValidTimePoint(min: unknown): min is number {
  return (
    typeof min === "number" &&
    Number.isInteger(min) &&
    min % 5 === 0 &&
    min >= 0 &&
    min < 24 * 60
  );
}

function validateTaskDate(roster: RosterRow, date: string): Err | null {
  if (!isValidISODate(date)) return err("Ongeldige datum.");
  const today = todayISO();
  if (date < today) return err("Deze datum is al voorbij.");
  if (date > addDaysISO(today, roster.daysAhead))
    return err("Deze datum ligt te ver vooruit.");
  return null;
}

type TaskAuth = {
  publicToken: string;
  taskId: string;
  /** The claim's editToken, or the roster adminToken. */
  token: string;
};

async function getAuthorizedTask({ publicToken, taskId, token }: TaskAuth) {
  const roster = await getRosterByPublicToken(publicToken);
  if (!roster) return null;
  await dbReady();
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.rosterId, roster.id)))
    .limit(1);
  const task = rows[0];
  if (!task) return null;
  // A released task has editToken NULL; only the admin may touch it then.
  const isOwner = task.editToken !== null && task.editToken === token;
  if (!isOwner && roster.adminToken !== token) return null;
  return { roster, task };
}

export async function createTaskAction(input: {
  publicToken: string;
  adminToken: string;
  date: string;
  label: string;
  needsTime: boolean;
  startMin?: number | null;
  note?: string | null;
  /** "none" (default) creates a single task; otherwise a recurring series. */
  repeat?: "none" | "daily" | "weekly";
}): Promise<Err | Ok> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");

  const label = cleanText(input.label, 40);
  if (!label) return err("Geef de taak een naam.");
  const dateError = validateTaskDate(roster, input.date);
  if (dateError) return dateError;
  if (input.needsTime && !isValidTimePoint(input.startMin))
    return err("Kies een tijdstip voor deze taak.");

  const now = Date.now();
  const needsTime = input.needsTime === true;
  const startMin = needsTime ? (input.startMin as number) : null;
  const note = cleanText(input.note, 300);

  if (isRepeatFreq(input.repeat)) {
    await db.insert(taskSeries).values({
      id: newId(),
      rosterId: roster.id,
      label,
      needsTime,
      startMin,
      note,
      freq: input.repeat,
      anchorDate: input.date,
      createdAt: now,
    });
    await ensureRecurringTasks(
      roster.id,
      input.date,
      addDaysISO(todayISO(), roster.daysAhead)
    );
  } else {
    await db.insert(tasks).values({
      id: newId(),
      rosterId: roster.id,
      date: input.date,
      label,
      needsTime,
      startMin,
      note,
      createdAt: now,
      updatedAt: now,
    });
  }
  revalidateRoster(roster);
  return { ok: true };
}

export async function stopTaskSeriesAction(input: {
  publicToken: string;
  adminToken: string;
  seriesId: string;
}): Promise<Err | Ok> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");
  await dbReady();
  const rows = await db
    .select({ id: taskSeries.id })
    .from(taskSeries)
    .where(
      and(eq(taskSeries.id, input.seriesId), eq(taskSeries.rosterId, roster.id))
    )
    .limit(1);
  if (!rows[0]) return err("Herhaling niet gevonden.");

  // Unclaimed occurrences from today onward disappear; claimed ones stay as
  // one-off tasks so nobody's commitment vanishes silently.
  await db
    .delete(tasks)
    .where(
      and(
        eq(tasks.seriesId, input.seriesId),
        gte(tasks.date, todayISO()),
        isNull(tasks.claimedName)
      )
    );
  await db
    .update(tasks)
    .set({ seriesId: null })
    .where(eq(tasks.seriesId, input.seriesId));
  await db.delete(taskSeries).where(eq(taskSeries.id, input.seriesId));
  revalidateRoster(roster);
  return { ok: true };
}

export async function deleteTaskAction(input: {
  publicToken: string;
  adminToken: string;
  taskId: string;
}): Promise<Err | Ok> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");
  const rows = await db
    .select({ id: tasks.id, seriesId: tasks.seriesId })
    .from(tasks)
    .where(and(eq(tasks.id, input.taskId), eq(tasks.rosterId, roster.id)))
    .limit(1);
  const task = rows[0];
  if (!task) return err("Taak niet gevonden.");
  if (task.seriesId) {
    // Tombstone a series occurrence: deleting the row would let the next
    // materialization pass recreate it.
    await db
      .update(tasks)
      .set({
        cancelled: true,
        claimedName: null,
        claimedNote: null,
        editToken: null,
        updatedAt: Date.now(),
      })
      .where(eq(tasks.id, task.id));
  } else {
    await db.delete(tasks).where(eq(tasks.id, task.id));
  }
  revalidateRoster(roster);
  return { ok: true };
}

export async function claimTaskAction(input: {
  publicToken: string;
  taskId: string;
  name: string;
  note?: string | null;
  startMin?: number | null;
}): Promise<Err | Ok<{ taskId: string; editToken: string }>> {
  const roster = await getRosterByPublicToken(input.publicToken);
  if (!roster) return err("Rooster niet gevonden.");
  await dbReady();
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, input.taskId), eq(tasks.rosterId, roster.id)))
    .limit(1);
  const task = rows[0];
  if (!task || task.cancelled) return err("Taak niet gevonden.");
  // A stale tab (open overnight, or after the horizon shrank) can still show
  // this task; reject claims for dates outside the current window.
  const dateError = validateTaskDate(roster, task.date);
  if (dateError) return dateError;
  if (task.claimedName)
    return err("Deze taak is net al door iemand anders opgepakt.");

  const name = cleanText(input.name, 50);
  if (!name) return err("Vul je naam in.");

  let startMin = task.startMin;
  if (task.needsTime) {
    if (input.startMin != null) {
      if (!isValidTimePoint(input.startMin)) return err("Ongeldig tijdstip.");
      startMin = input.startMin;
    }
    if (startMin == null) return err("Kies een tijdstip.");
  }

  const editToken = newToken();
  await db
    .update(tasks)
    .set({
      claimedName: name,
      claimedNote: cleanText(input.note, 200),
      startMin,
      editToken,
      updatedAt: Date.now(),
    })
    .where(eq(tasks.id, task.id));
  revalidateRoster(roster);
  return { ok: true, taskId: task.id, editToken };
}

export async function updateTaskClaimAction(
  input: TaskAuth & {
    name: string;
    note?: string | null;
    startMin?: number | null;
  }
): Promise<Err | Ok> {
  const found = await getAuthorizedTask(input);
  if (!found) return err("Taak niet gevonden of geen toegang.");
  const { roster, task } = found;
  if (!task.claimedName) return err("Deze taak is niet opgepakt.");

  const name = cleanText(input.name, 50);
  if (!name) return err("Vul je naam in.");

  let startMin = task.startMin;
  if (task.needsTime && input.startMin != null) {
    if (!isValidTimePoint(input.startMin)) return err("Ongeldig tijdstip.");
    startMin = input.startMin;
  }

  await db
    .update(tasks)
    .set({
      claimedName: name,
      claimedNote: cleanText(input.note, 200),
      startMin,
      updatedAt: Date.now(),
    })
    .where(eq(tasks.id, task.id));
  revalidateRoster(roster);
  return { ok: true };
}

export async function releaseTaskAction(input: TaskAuth): Promise<Err | Ok> {
  const found = await getAuthorizedTask(input);
  if (!found) return err("Taak niet gevonden of geen toegang.");
  // Clearing editToken revokes the personal link of the released claim.
  await db
    .update(tasks)
    .set({
      claimedName: null,
      claimedNote: null,
      editToken: null,
      updatedAt: Date.now(),
    })
    .where(eq(tasks.id, found.task.id));
  revalidateRoster(found.roster);
  return { ok: true };
}

export async function createTaskTypeAction(input: {
  publicToken: string;
  adminToken: string;
  name: string;
  needsTime: boolean;
}): Promise<Err | Ok<{ id: string }>> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");
  const name = cleanText(input.name, 40);
  if (!name) return err("Geef het taaktype een naam.");

  const existing = await db
    .select({ id: taskTypes.id })
    .from(taskTypes)
    .where(eq(taskTypes.rosterId, roster.id));
  if (existing.length >= MAX_CUSTOM_TASK_TYPES)
    return err("Je hebt al het maximale aantal eigen taaktypes.");

  const id = newId();
  await db.insert(taskTypes).values({
    id,
    rosterId: roster.id,
    name,
    needsTime: input.needsTime === true,
    createdAt: Date.now(),
  });
  revalidateRoster(roster);
  return { ok: true, id };
}

export async function deleteTaskTypeAction(input: {
  publicToken: string;
  adminToken: string;
  typeId: string;
}): Promise<Err | Ok> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");
  await db
    .delete(taskTypes)
    .where(
      and(eq(taskTypes.id, input.typeId), eq(taskTypes.rosterId, roster.id))
    );
  revalidateRoster(roster);
  return { ok: true };
}

export async function deleteBlockedTimeAction(input: {
  publicToken: string;
  adminToken: string;
  blockedId: string;
}): Promise<Err | Ok> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");
  const rows = await db
    .select({ id: blockedTimes.id, seriesId: blockedTimes.seriesId })
    .from(blockedTimes)
    .where(
      and(
        eq(blockedTimes.id, input.blockedId),
        eq(blockedTimes.rosterId, roster.id)
      )
    )
    .limit(1);
  const blockedRow = rows[0];
  if (!blockedRow) return err("Blokkade niet gevonden.");
  if (blockedRow.seriesId) {
    // Tombstone a series occurrence so materialization cannot recreate it.
    await db
      .update(blockedTimes)
      .set({ cancelled: true })
      .where(eq(blockedTimes.id, blockedRow.id));
  } else {
    await db.delete(blockedTimes).where(eq(blockedTimes.id, blockedRow.id));
  }
  revalidateRoster(roster);
  return { ok: true };
}

export async function stopBlockedSeriesAction(input: {
  publicToken: string;
  adminToken: string;
  seriesId: string;
}): Promise<Err | Ok> {
  const roster = await requireAdmin(input.publicToken, input.adminToken);
  if (!roster) return err("Geen toegang.");
  await dbReady();
  const rows = await db
    .select({ id: blockedSeries.id })
    .from(blockedSeries)
    .where(
      and(
        eq(blockedSeries.id, input.seriesId),
        eq(blockedSeries.rosterId, roster.id)
      )
    )
    .limit(1);
  if (!rows[0]) return err("Herhaling niet gevonden.");

  // Blocks have no claims, so everything from today onward simply disappears;
  // past occurrences stay for history and are detached from the series.
  await db
    .delete(blockedTimes)
    .where(
      and(
        eq(blockedTimes.seriesId, input.seriesId),
        gte(blockedTimes.date, todayISO())
      )
    );
  await db
    .update(blockedTimes)
    .set({ seriesId: null })
    .where(eq(blockedTimes.seriesId, input.seriesId));
  await db.delete(blockedSeries).where(eq(blockedSeries.id, input.seriesId));
  revalidateRoster(roster);
  return { ok: true };
}
