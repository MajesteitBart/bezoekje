import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { SaveTaskToken } from "@/components/roster/save-task-token";
import { getRosterByPublicToken } from "@/lib/data";
import { db, dbReady } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

// Personal "manage my task" link: stores the claim's edit token in this
// browser's localStorage, then forwards to the roster. A released claim has
// editToken NULL, so its old links 404 here.
export default async function TaskLinkPage({
  params,
}: {
  params: Promise<{ token: string; taskId: string; editToken: string }>;
}) {
  const { token, taskId, editToken } = await params;
  const roster = await getRosterByPublicToken(token);
  if (!roster) notFound();
  await dbReady();
  const rows = await db
    .select({ id: tasks.id, editToken: tasks.editToken })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.rosterId, roster.id)))
    .limit(1);
  if (!rows[0] || rows[0].editToken === null || rows[0].editToken !== editToken)
    notFound();

  return (
    <SaveTaskToken publicToken={token} taskId={taskId} editToken={editToken} />
  );
}
