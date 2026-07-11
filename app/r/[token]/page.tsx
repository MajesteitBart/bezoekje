import { notFound } from "next/navigation";

import { RosterView } from "@/components/roster/roster-view";
import {
  getBlockedInRange,
  getRosterByPublicToken,
  getVisitsInRange,
  toRosterDTO,
} from "@/lib/data";
import { addDaysISO, todayISO } from "@/lib/dates";

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
  const [visits, blocked] = await Promise.all([
    getVisitsInRange(roster.id, from, to),
    getBlockedInRange(roster.id, from, to),
  ]);

  return (
    <RosterView
      roster={toRosterDTO(roster)}
      visits={visits}
      blocked={blocked}
      adminToken={null}
    />
  );
}
