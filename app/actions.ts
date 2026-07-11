"use server";

import { and, eq } from "drizzle-orm";
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
import { blockedTimes, rosters, visits } from "@/lib/db/schema";
import { capacityLeft, overlaps } from "@/lib/slots";
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

  await db.insert(blockedTimes).values({
    id: newId(),
    rosterId: roster.id,
    date: input.date,
    startMin: input.startMin,
    endMin: input.endMin,
    label: cleanText(input.label, 60),
    createdAt: Date.now(),
  });
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
  await db
    .delete(blockedTimes)
    .where(
      and(
        eq(blockedTimes.id, input.blockedId),
        eq(blockedTimes.rosterId, roster.id)
      )
    );
  revalidateRoster(roster);
  return { ok: true };
}
