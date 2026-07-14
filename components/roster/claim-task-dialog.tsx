"use client";

import { CheckIcon, CopyIcon, HandHeartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { claimTaskAction } from "@/app/actions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddToCalendar } from "@/components/roster/add-to-calendar";
import { TimeSelect } from "@/components/roster/time-select";
import {
  copyText,
  getSavedName,
  saveName,
  saveTaskToken,
} from "@/lib/client-tokens";
import { formatDayLong, formatMin } from "@/lib/dates";
import type { RosterDTO, TaskDTO } from "@/lib/types";

const TASK_TIME_FROM = 7 * 60;
const TASK_TIME_TO = 21 * 60 + 30;
const TASK_TIME_STEP = 30;

export function ClaimTaskDialog({
  roster,
  task,
  open,
  onOpenChange,
}: {
  roster: RosterDTO;
  task: TaskDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [startMin, setStartMin] = useState<number>(17 * 60);
  const [error, setError] = useState<string | null>(null);
  const [personalLink, setPersonalLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open && task) {
      setName(getSavedName());
      setNote("");
      setStartMin(task.startMin ?? 17 * 60);
      setError(null);
      setPersonalLink(null);
      setCopied(false);
    }
  }, [open, task]);

  if (!task) return null;

  const submit = () => {
    startTransition(async () => {
      const res = await claimTaskAction({
        publicToken: roster.publicToken,
        taskId: task.id,
        name,
        note,
        startMin: task.needsTime ? startMin : null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      saveTaskToken(roster.publicToken, res.taskId, res.editToken);
      saveName(name.trim());
      setPersonalLink(
        `${window.location.origin}/r/${roster.publicToken}/t/${res.taskId}/${res.editToken}`
      );
      router.refresh();
    });
  };

  const copyLink = async () => {
    if (!personalLink) return;
    if (await copyText(personalLink)) setCopied(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {personalLink ? (
          <>
            <DialogHeader>
              <DialogTitle>Wat fijn, jij doet dit! 💛</DialogTitle>
              <DialogDescription>
                De taak staat op jouw naam. Op dit apparaat kun je hem altijd
                aanpassen of teruggeven. Wil je dat ook op een ander apparaat
                kunnen? Bewaar dan deze persoonlijke link.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input readOnly value={personalLink} className="text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
            <AddToCalendar
              filename="bezoekje-taak.ics"
              event={{
                uid: personalLink,
                title: `${task.label} — ${roster.title}`,
                dateISO: task.date,
                startMin: task.needsTime ? startMin : null,
                description: [
                  task.note?.trim(),
                  note.trim(),
                  `Je persoonlijke link om deze taak aan te passen of terug te geven:\n${personalLink}`,
                ]
                  .filter(Boolean)
                  .join("\n\n"),
              }}
            />
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Klaar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Ik pak dit op</DialogTitle>
              <DialogDescription className="capitalize-first">
                <Badge variant="secondary" className="font-normal">
                  <HandHeartIcon />
                  {task.label} · {formatDayLong(task.date)}
                  {task.needsTime && task.startMin != null
                    ? ` · ${formatMin(task.startMin)}`
                    : null}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {task.note ? (
                <p className="rounded-md bg-secondary/50 p-3 text-sm text-muted-foreground">
                  {task.note}
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                <Label htmlFor="claim-name">Je naam</Label>
                <Input
                  id="claim-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="Bijv. Anneke"
                />
              </div>
              {task.needsTime ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="claim-time">Hoe laat kun je?</Label>
                  <TimeSelect
                    id="claim-time"
                    value={startMin}
                    onChange={setStartMin}
                    from={TASK_TIME_FROM}
                    to={TASK_TIME_TO}
                    step={TASK_TIME_STEP}
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-2">
                <Label htmlFor="claim-note">Opmerking (niet verplicht)</Label>
                <Textarea
                  id="claim-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={200}
                  placeholder="Bijv. ik breng ook soep mee 🍲"
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Terug
              </Button>
              <Button onClick={submit} disabled={pending || !name.trim()}>
                {pending ? "Even geduld…" : "Ja, ik doe dit"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
