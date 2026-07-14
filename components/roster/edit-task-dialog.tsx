"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  deleteTaskAction,
  releaseTaskAction,
  updateTaskClaimAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimeSelect } from "@/components/roster/time-select";
import { removeTaskToken } from "@/lib/client-tokens";
import { formatDayLong } from "@/lib/dates";
import type { RosterDTO, TaskDTO } from "@/lib/types";

const TASK_TIME_FROM = 7 * 60;
const TASK_TIME_TO = 21 * 60 + 30;
const TASK_TIME_STEP = 30;

export function EditTaskDialog({
  roster,
  task,
  /** The claim's editToken (own claim) or the roster adminToken. */
  token,
  isAdmin,
  open,
  onOpenChange,
}: {
  roster: RosterDTO;
  task: TaskDTO | null;
  token: string | null;
  isAdmin: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [startMin, setStartMin] = useState<number>(17 * 60);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open && task) {
      setName(task.claimedName ?? "");
      setNote(task.claimedNote ?? "");
      setStartMin(task.startMin ?? 17 * 60);
      setError(null);
      setConfirmDelete(false);
    }
  }, [open, task]);

  if (!task || !token) return null;

  const save = () => {
    startTransition(async () => {
      const res = await updateTaskClaimAction({
        publicToken: roster.publicToken,
        taskId: task.id,
        token,
        name,
        note,
        startMin: task.needsTime ? startMin : null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onOpenChange(false);
    });
  };

  const release = () => {
    startTransition(async () => {
      const res = await releaseTaskAction({
        publicToken: roster.publicToken,
        taskId: task.id,
        token,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      removeTaskToken(roster.publicToken, task.id);
      router.refresh();
      onOpenChange(false);
    });
  };

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      const res = await deleteTaskAction({
        publicToken: roster.publicToken,
        adminToken: token,
        taskId: task.id,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.label} aanpassen</DialogTitle>
          <DialogDescription className="first-letter:uppercase">
            {formatDayLong(task.date)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-edit-name">Naam</Label>
            <Input
              id="task-edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
          {task.needsTime ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-edit-time">Hoe laat?</Label>
              <TimeSelect
                id="task-edit-time"
                value={startMin}
                onChange={setStartMin}
                from={TASK_TIME_FROM}
                to={TASK_TIME_TO}
                step={TASK_TIME_STEP}
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-edit-note">Opmerking</Label>
            <Textarea
              id="task-edit-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={release} disabled={pending}>
              Taak teruggeven
            </Button>
            {isAdmin ? (
              <Button variant="destructive" onClick={remove} disabled={pending}>
                {confirmDelete ? "Zeker weten?" : "Verwijder"}
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Terug
            </Button>
            <Button onClick={save} disabled={pending || !name.trim()}>
              {pending ? "Even geduld…" : "Opslaan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
