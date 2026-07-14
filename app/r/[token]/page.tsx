import { notFound } from "next/navigation";

import { RosterView } from "@/components/roster/roster-view";
import {
  getBlockedInRange,
  getRosterByPublicToken,
  getTaskTypes,
  getTasksInRange,
  getVisitsInRange,
  toRosterDTO,
} from "@/lib/data";
import { addDaysISO, todayISO } from "@/lib/dates";
import { ensureRecurring } from "@/lib/recurrence";

export const dynamic = "force-dynamic";

export default async function RosterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const roster = await getRosterByPublicToken(token);
  if (!roster) notFound();

  const from = todayISO();
  const to = addDaysISO(from, roster.daysAhead);
  await ensureRecurring(roster.id, from, to);
  const [visits, blocked, tasks, taskTypes] = await Promise.all([
    getVisitsInRange(roster.id, from, to),
    getBlockedInRange(roster.id, from, to),
    getTasksInRange(roster.id, from, to),
    getTaskTypes(roster.id),
  ]);

  return (
    <RosterView
      roster={toRosterDTO(roster)}
      visits={visits}
      blocked={blocked}
      tasks={tasks}
      taskTypes={taskTypes}
      adminToken={null}
    />
  );
}
