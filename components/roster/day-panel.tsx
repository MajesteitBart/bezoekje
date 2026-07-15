"use client";

import {
  BanIcon,
  HandHeartIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  Repeat2Icon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteBlockedTimeAction,
  deleteTaskAction,
  stopBlockedSeriesAction,
  stopTaskSeriesAction,
} from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockDialog } from "@/components/roster/block-dialog";
import { BookDialog } from "@/components/roster/book-dialog";
import { ClaimTaskDialog } from "@/components/roster/claim-task-dialog";
import { EditTaskDialog } from "@/components/roster/edit-task-dialog";
import { EditVisitDialog } from "@/components/roster/edit-visit-dialog";
import { TaskDialog } from "@/components/roster/task-dialog";
import { formatDayLong, formatMin, nowMinutes, todayISO } from "@/lib/dates";
import { buildDayItems } from "@/lib/slots";
import type {
  BlockedDTO,
  RosterDTO,
  TaskDTO,
  TaskTypeDTO,
  VisitDTO,
} from "@/lib/types";

export function DayPanel({
  roster,
  dateISO,
  visits,
  blocked,
  tasks,
  taskTypes,
  myTokens,
  myTaskTokens,
  adminToken,
}: {
  roster: RosterDTO;
  dateISO: string;
  visits: VisitDTO[];
  blocked: BlockedDTO[];
  tasks: TaskDTO[];
  taskTypes: TaskTypeDTO[];
  myTokens: Record<string, string>;
  myTaskTokens: Record<string, string>;
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
  const [taskAddOpen, setTaskAddOpen] = useState(false);
  const [claimTask, setClaimTask] = useState<TaskDTO | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskDTO | null>(null);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [seriesDelete, setSeriesDelete] = useState<
    | { kind: "task"; label: string; id: string; seriesId: string }
    | { kind: "blocked"; label: string; id: string; seriesId: string }
    | null
  >(null);
  const [seriesDeleteOpen, setSeriesDeleteOpen] = useState(false);
  const [, startTransition] = useTransition();

  const isToday = dateISO === todayISO();
  const dayTasks = tasks.filter((t) => t.startMin == null);
  const items = buildDayItems({
    roster,
    visits,
    blocked,
    tasks,
    nowMin: isToday ? nowMinutes() : null,
  });

  const tokenFor = (visit: VisitDTO): string | null =>
    adminToken ?? myTokens[visit.id] ?? null;
  const taskTokenFor = (task: TaskDTO): string | null =>
    adminToken ?? myTaskTokens[task.id] ?? null;

  const removeBlocked = (b: BlockedDTO) => {
    if (!adminToken) return;
    // Recurring occurrence: let the admin choose day-only vs stop the series.
    if (b.seriesId) {
      setSeriesDelete({
        kind: "blocked",
        label: b.label || "geen bezoek",
        id: b.id,
        seriesId: b.seriesId,
      });
      setSeriesDeleteOpen(true);
      return;
    }
    startTransition(async () => {
      await deleteBlockedTimeAction({
        publicToken: roster.publicToken,
        adminToken,
        blockedId: b.id,
      });
      router.refresh();
    });
  };

  const removeTask = (t: TaskDTO) => {
    if (!adminToken) return;
    if (t.seriesId) {
      setSeriesDelete({
        kind: "task",
        label: t.label,
        id: t.id,
        seriesId: t.seriesId,
      });
      setSeriesDeleteOpen(true);
      return;
    }
    startTransition(async () => {
      await deleteTaskAction({
        publicToken: roster.publicToken,
        adminToken,
        taskId: t.id,
      });
      router.refresh();
    });
  };

  const removeOccurrence = () => {
    if (!adminToken || !seriesDelete) return;
    startTransition(async () => {
      if (seriesDelete.kind === "task") {
        await deleteTaskAction({
          publicToken: roster.publicToken,
          adminToken,
          taskId: seriesDelete.id,
        });
      } else {
        await deleteBlockedTimeAction({
          publicToken: roster.publicToken,
          adminToken,
          blockedId: seriesDelete.id,
        });
      }
      router.refresh();
      setSeriesDeleteOpen(false);
    });
  };

  const stopSeries = () => {
    if (!adminToken || !seriesDelete) return;
    startTransition(async () => {
      if (seriesDelete.kind === "task") {
        await stopTaskSeriesAction({
          publicToken: roster.publicToken,
          adminToken,
          seriesId: seriesDelete.seriesId,
        });
      } else {
        await stopBlockedSeriesAction({
          publicToken: roster.publicToken,
          adminToken,
          seriesId: seriesDelete.seriesId,
        });
      }
      router.refresh();
      setSeriesDeleteOpen(false);
    });
  };

  const renderTask = (task: TaskDTO) => (
    <div
      key={`t-${task.id}`}
      className="flex items-center gap-3 rounded-md border border-primary/25 bg-primary/5 p-3"
    >
      {task.startMin != null ? (
        <Badge variant="secondary" className="shrink-0 font-normal">
          {formatMin(task.startMin)}
        </Badge>
      ) : (
        <HandHeartIcon className="size-4 shrink-0 text-primary" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {task.label}
          {task.seriesId ? (
            <Repeat2Icon
              aria-label="Herhalende taak"
              className="ml-1.5 inline size-3.5 align-[-2px] text-muted-foreground"
            />
          ) : null}
          {task.claimedName ? (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {task.claimedName} doet dit
            </span>
          ) : null}
        </p>
        {task.note || task.claimedNote ? (
          <p className="truncate text-sm text-muted-foreground">
            {[task.note, task.claimedNote].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
      {task.claimedName ? (
        taskTokenFor(task) ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Taak aanpassen"
            onClick={() => {
              setEditTask(task);
              setEditTaskOpen(true);
            }}
          >
            <PencilIcon />
          </Button>
        ) : null
      ) : (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="border-primary/40"
            onClick={() => {
              setClaimTask(task);
              setClaimOpen(true);
            }}
          >
            Ik doe dit
          </Button>
          {adminToken ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Taak verwijderen"
              onClick={() => removeTask(task)}
            >
              <Trash2Icon />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium first-letter:uppercase">
          {formatDayLong(dateISO)}
        </h2>
        {adminToken ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTaskAddOpen(true)}
            >
              <HandHeartIcon data-icon="inline-start" />
              Taak
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setBlockOpen(true)}>
              <BanIcon data-icon="inline-start" />
              Blokkeer tijd
            </Button>
          </div>
        ) : null}
      </div>

      {dayTasks.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Voor deze dag
          </p>
          {dayTasks.map(renderTask)}
        </div>
      ) : null}

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
          if (item.type === "task") {
            return renderTask(item.task);
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
                  {item.blocked.seriesId ? (
                    <Repeat2Icon
                      aria-label="Herhalende blokkade"
                      className="ml-1.5 inline size-3.5 align-[-2px]"
                    />
                  ) : null}
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
      {adminToken ? (
        <TaskDialog
          roster={roster}
          adminToken={adminToken}
          dateISO={dateISO}
          customTypes={taskTypes}
          open={taskAddOpen}
          onOpenChange={setTaskAddOpen}
        />
      ) : null}
      <ClaimTaskDialog
        roster={roster}
        task={claimTask}
        open={claimOpen}
        onOpenChange={setClaimOpen}
      />
      <EditTaskDialog
        roster={roster}
        task={editTask}
        token={editTask ? taskTokenFor(editTask) : null}
        isAdmin={adminToken !== null}
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
      />
      <Dialog open={seriesDeleteOpen} onOpenChange={setSeriesDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {seriesDelete?.kind === "blocked"
                ? "Herhalende blokkade verwijderen"
                : "Herhalende taak verwijderen"}
            </DialogTitle>
            <DialogDescription>
              {seriesDelete
                ? `“${seriesDelete.label}” komt vaker terug. Wat wil je verwijderen?`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="destructive" onClick={stopSeries}>
              Stop de herhaling
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setSeriesDeleteOpen(false)}
              >
                Terug
              </Button>
              <Button variant="outline" onClick={removeOccurrence}>
                Alleen deze dag
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
