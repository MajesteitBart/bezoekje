import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { RosterView } from "@/components/roster/roster-view";
import { auth } from "@/lib/auth";
import {
  getBlockedInRange,
  getRosterAdminEmails,
  getRosterByPublicToken,
  getTaskTypes,
  getTasksInRange,
  getVisitsInRange,
  toRosterDTO,
} from "@/lib/data";
import { addDaysISO, todayISO } from "@/lib/dates";
import { ensureRecurringTasks } from "@/lib/recurrence";

export const dynamic = "force-dynamic";

export default async function RosterAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; adminToken: string }>;
  searchParams: Promise<{ welkom?: string }>;
}) {
  const { token, adminToken } = await params;
  const roster = await getRosterByPublicToken(token);
  if (!roster || roster.adminToken !== adminToken) notFound();

  const { welkom } = await searchParams;
  const from = todayISO();
  const to = addDaysISO(from, roster.daysAhead);
  await ensureRecurringTasks(roster.id, from, to);
  const [visits, blocked, tasks, taskTypes, session, linkedEmails] =
    await Promise.all([
      getVisitsInRange(roster.id, from, to),
      getBlockedInRange(roster.id, from, to),
      getTasksInRange(roster.id, from, to),
      getTaskTypes(roster.id),
      auth.api.getSession({ headers: await headers() }),
      getRosterAdminEmails(roster.id),
    ]);
  const account = {
    sessionEmail: session?.user.email ?? null,
    linkedEmails,
    sessionLinked: session ? linkedEmails.includes(session.user.email) : false,
  };

  return (
    <RosterView
      roster={toRosterDTO(roster)}
      visits={visits}
      blocked={blocked}
      tasks={tasks}
      taskTypes={taskTypes}
      adminToken={adminToken}
      justCreated={welkom === "1"}
      account={account}
    />
  );
}
