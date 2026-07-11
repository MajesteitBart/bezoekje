"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { saveEditToken } from "@/lib/client-tokens";

export function SaveEditToken({
  publicToken,
  visitId,
  editToken,
}: {
  publicToken: string;
  visitId: string;
  editToken: string;
}) {
  const router = useRouter();

  useEffect(() => {
    saveEditToken(publicToken, visitId, editToken);
    router.replace(`/r/${publicToken}`);
  }, [publicToken, visitId, editToken, router]);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p className="text-muted-foreground">Je bezoek wordt geopend…</p>
    </main>
  );
}
