"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { saveTaskToken } from "@/lib/client-tokens";

export function SaveTaskToken({
  publicToken,
  taskId,
  editToken,
}: {
  publicToken: string;
  taskId: string;
  editToken: string;
}) {
  const router = useRouter();

  useEffect(() => {
    saveTaskToken(publicToken, taskId, editToken);
    router.replace(`/r/${publicToken}`);
  }, [publicToken, taskId, editToken, router]);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p className="text-muted-foreground">Je taak wordt geopend…</p>
    </main>
  );
}
