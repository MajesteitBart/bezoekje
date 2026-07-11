"use client";

import {
  BanIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteBlockedTimeAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlockDialog } from "@/components/roster/block-dialog";
import { BookDialog } from "@/components/roster/book-dialog";
import { EditVisitDialog } from "@/components/roster/edit-visit-dialog";
import { formatDayLong, formatMin, nowMinutes, todayISO } from "@/lib/dates";
import { buildDayItems } from "@/lib/slots";
import type { BlockedDTO, RosterDTO, VisitDTO } from "@/lib/types";

export function DayPanel({
  roster,
  dateISO,
  visits,
  blocked,
  myTokens,
  adminToken,
}: {
  roster: RosterDTO;
  dateISO: string;
  visits: VisitDTO[];
  blocked: BlockedDTO[];
  myTokens: Record<string, string>;
  adminToken: string | null;
}) {
  const router = useRouter();
  const [bookSlot, setBookSlot] = useState<{
    startMin: number;
    endMin: number;
  } | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [editVisit, setEditVisit] = useState<VisitDTO | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [, startTransition] = useTransition();

  const isToday = dateISO === todayISO();
  const items = buildDayItems({
    roster,
    visits,
    blocked,
    nowMin: isToday ? nowMinutes() : null,
  });

  const tokenFor = (visit: VisitDTO): string | null =>
    adminToken ?? myTokens[visit.id] ?? null;

  const removeBlocked = (b: BlockedDTO) => {
    if (!adminToken) return;
    startTransition(async () => {
      await deleteBlockedTimeAction({
        publicToken: roster.publicToken,
        adminToken,
        blockedId: b.id,
      });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium first-letter:uppercase">
          {formatDayLong(dateISO)}
        </h2>
        {adminToken ? (
          <Button variant="ghost" size="sm" onClick={() => setBlockOpen(true)}>
            <BanIcon data-icon="inline-start" />
            Blokkeer tijd
          </Button>
        ) : null}
      </div>

      {visits.length === 0 ? (
        <Alert>
          <MoonIcon />
          <AlertTitle>Nog niemand op deze dag</AlertTitle>
          <AlertDescription>Kom jij? Kies hieronder een tijd.</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {isToday
              ? "Voor vandaag zijn er geen tijden meer."
              : "Geen beschikbare tijden op deze dag."}
          </p>
        ) : null}
        {items.map((item) => {
          if (item.type === "visit") {
            const token = tokenFor(item.visit);
            return (
              <div
                key={`v-${item.visit.id}`}
                className="flex items-center gap-3 rounded-md border bg-card p-3"
              >
                <Badge variant="secondary" className="shrink-0 font-normal">
                  {formatMin(item.visit.startMin)}–{formatMin(item.visit.endMin)}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.visit.name}
                  </p>
                  {item.visit.note ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {item.visit.note}
                    </p>
                  ) : null}
                </div>
                {token ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Bezoek aanpassen"
                    onClick={() => {
                      setEditVisit(item.visit);
                      setEditOpen(true);
                    }}
                  >
                    <PencilIcon />
                  </Button>
                ) : null}
              </div>
            );
          }
          if (item.type === "blocked") {
            return (
              <div
                key={`b-${item.blocked.id}`}
                className="flex items-center gap-3 rounded-md border border-dashed bg-secondary/50 p-3 text-muted-foreground"
              >
                <MoonIcon className="size-4 shrink-0" />
                <p className="flex-1 text-sm">
                  {formatMin(item.blocked.startMin)}–
                  {formatMin(item.blocked.endMin)} ·{" "}
                  {item.blocked.label || "geen bezoek"}
                </p>
                {adminToken ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Blokkade verwijderen"
                    onClick={() => removeBlocked(item.blocked)}
                  >
                    <Trash2Icon />
                  </Button>
                ) : null}
              </div>
            );
          }
          return (
            <Button
              key={`f-${item.startMin}`}
              variant="outline"
              className="justify-between bg-secondary hover:border-primary"
              onClick={() => {
                setBookSlot({ startMin: item.startMin, endMin: item.endMin });
                setBookOpen(true);
              }}
            >
              <span>
                {formatMin(item.startMin)}–{formatMin(item.endMin)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <PlusIcon className="size-3.5" />
                nog vrij
              </span>
            </Button>
          );
        })}
      </div>

      <BookDialog
        roster={roster}
        dateISO={dateISO}
        slot={bookSlot}
        open={bookOpen}
        onOpenChange={setBookOpen}
      />
      <EditVisitDialog
        roster={roster}
        visit={editVisit}
        token={editVisit ? tokenFor(editVisit) : null}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      {adminToken ? (
        <BlockDialog
          roster={roster}
          adminToken={adminToken}
          dateISO={dateISO}
          open={blockOpen}
          onOpenChange={setBlockOpen}
        />
      ) : null}
    </div>
  );
}
