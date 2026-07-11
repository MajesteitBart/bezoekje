import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { SaveEditToken } from "@/components/roster/save-edit-token";
import { getRosterByPublicToken } from "@/lib/data";
import { db, dbReady } from "@/lib/db";
import { visits } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

// Personal "manage my visit" link: stores the edit token in this browser's
// localStorage, then forwards to the roster.
export default async function VisitLinkPage({
  params,
}: {
  params: Promise<{ token: string; visitId: string; editToken: string }>;
}) {
  const { token, visitId, editToken } = await params;
  const roster = await getRosterByPublicToken(token);
  if (!roster) notFound();
  await dbReady();
  const rows = await db
    .select({ id: visits.id, editToken: visits.editToken })
    .from(visits)
    .where(and(eq(visits.id, visitId), eq(visits.rosterId, roster.id)))
    .limit(1);
  if (!rows[0] || rows[0].editToken !== editToken) notFound();

  return (
    <SaveEditToken publicToken={token} visitId={visitId} editToken={editToken} />
  );
}
