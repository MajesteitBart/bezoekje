"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  createTaskAction,
  createTaskTypeAction,
  deleteTaskTypeAction,
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
import { formatDayLong } from "@/lib/dates";
import { DEFAULT_TASK_TYPES } from "@/lib/task-types";
import type { RosterDTO, TaskTypeDTO } from "@/lib/types";

// Tasks can happen outside visiting hours (cooking, transport), so the time
// picker spans a broad day window instead of the roster's visit window.
const TASK_TIME_FROM = 7 * 60;
const TASK_TIME_TO = 21 * 60 + 30;
const TASK_TIME_STEP = 30;

type TypeChoice =
  | { kind: "default"; index: number }
  | { kind: "custom"; id: string }
  | { kind: "own" };

export function TaskDialog({
  roster,
  adminToken,
  dateISO,
  customTypes,
  open,
  onOpenChange,
}: {
  roster: RosterDTO;
  adminToken: string;
  dateISO: string;
  customTypes: TaskTypeDTO[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [choice, setChoice] = useState<TypeChoice>({ kind: "default", index: 0 });
  const [ownName, setOwnName] = useState("");
  const [ownNeedsTime, setOwnNeedsTime] = useState(false);
  const [saveOwnType, setSaveOwnType] = useState(false);
  const [startMin, setStartMin] = useState(17 * 60);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setChoice({ kind: "default", index: 0 });
      setOwnName("");
      setOwnNeedsTime(false);
      setSaveOwnType(false);
      setStartMin(17 * 60);
      setNote("");
      setError(null);
    }
  }, [open]);

  const selected =
    choice.kind === "default"
      ? {
          label: DEFAULT_TASK_TYPES[choice.index].name,
          needsTime: DEFAULT_TASK_TYPES[choice.index].needsTime,
        }
      : choice.kind === "custom"
        ? (() => {
            const t = customTypes.find((c) => c.id === choice.id);
            return t
              ? { label: t.name, needsTime: t.needsTime }
              : { label: "", needsTime: false };
          })()
        : { label: ownName, needsTime: ownNeedsTime };

  const submit = () => {
    startTransition(async () => {
      if (choice.kind === "own" && saveOwnType && ownName.trim()) {
        const typeRes = await createTaskTypeAction({
          publicToken: roster.publicToken,
          adminToken,
          name: ownName,
          needsTime: ownNeedsTime,
        });
        if (!typeRes.ok) {
          setError(typeRes.error);
          return;
        }
      }
      const res = await createTaskAction({
        publicToken: roster.publicToken,
        adminToken,
        date: dateISO,
        label: selected.label,
        needsTime: selected.needsTime,
        startMin: selected.needsTime ? startMin : null,
        note,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onOpenChange(false);
    });
  };

  const removeType = (t: TaskTypeDTO) => {
    startTransition(async () => {
      const res = await deleteTaskTypeAction({
        publicToken: roster.publicToken,
        adminToken,
        typeId: t.id,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (choice.kind === "custom" && choice.id === t.id)
        setChoice({ kind: "default", index: 0 });
      router.refresh();
    });
  };

  const chipClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
      active
        ? "border-primary bg-primary/10 font-medium"
        : "bg-secondary hover:border-primary"
    }`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Taak toevoegen</DialogTitle>
          <DialogDescription className="first-letter:uppercase">
            {formatDayLong(dateISO)} — iedereen met de link kan deze taak
            oppakken.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Wat is er nodig?</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TASK_TYPES.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  className={chipClass(
                    choice.kind === "default" && choice.index === i
                  )}
                  onClick={() => setChoice({ kind: "default", index: i })}
                >
                  <span aria-hidden>{t.emoji}</span>
                  {t.name}
                </button>
              ))}
              {customTypes.map((t) => (
                <span
                  key={t.id}
                  className={chipClass(
                    choice.kind === "custom" && choice.id === t.id
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setChoice({ kind: "custom", id: t.id })}
                  >
                    {t.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`Taaktype ${t.name} verwijderen`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeType(t)}
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                className={chipClass(choice.kind === "own")}
                onClick={() => setChoice({ kind: "own" })}
              >
                <PlusIcon className="size-3.5" />
                Anders…
              </button>
            </div>
          </div>

          {choice.kind === "own" ? (
            <div className="flex flex-col gap-3 rounded-md border bg-secondary/50 p-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-own-name">Naam van de taak</Label>
                <Input
                  id="task-own-name"
                  value={ownName}
                  onChange={(e) => setOwnName(e.target.value)}
                  maxLength={40}
                  placeholder="Bijv. hond uitlaten"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={ownNeedsTime}
                  onChange={(e) => setOwnNeedsTime(e.target.checked)}
                />
                Deze taak heeft een vast tijdstip nodig
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={saveOwnType}
                  onChange={(e) => setSaveOwnType(e.target.checked)}
                />
                Bewaar als taaktype voor later
              </label>
            </div>
          ) : null}

          {selected.needsTime ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-time">Hoe laat?</Label>
              <TimeSelect
                id="task-time"
                value={startMin}
                onChange={setStartMin}
                from={TASK_TIME_FROM}
                to={TASK_TIME_TO}
                step={TASK_TIME_STEP}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-note">Toelichting (niet verplicht)</Label>
            <Textarea
              id="task-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="Bijv. afspraak cardioloog om 14:00, UZ Leuven"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Terug
          </Button>
          <Button onClick={submit} disabled={pending || !selected.label.trim()}>
            {pending ? "Even geduld…" : "Zet op het rooster"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
