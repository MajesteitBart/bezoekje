"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { addBlockedTimeAction } from "@/app/actions";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeSelect } from "@/components/roster/time-select";
import { formatDayLong } from "@/lib/dates";
import type { RosterDTO } from "@/lib/types";

type Repeat = "none" | "daily" | "weekly";

const REPEAT_LABELS: Record<Repeat, string> = {
  none: "Eén keer",
  daily: "Elke dag",
  weekly: "Elke week op deze dag",
};

export function BlockDialog({
  roster,
  adminToken,
  dateISO,
  open,
  onOpenChange,
}: {
  roster: RosterDTO;
  adminToken: string;
  dateISO: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [startMin, setStartMin] = useState(roster.startMin);
  const [endMin, setEndMin] = useState(roster.startMin + roster.slotMinutes);
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setLabel("");
      setStartMin(roster.startMin);
      setEndMin(roster.startMin + roster.slotMinutes);
      setRepeat("none");
      setError(null);
    }
  }, [open, roster.startMin, roster.slotMinutes]);

  const submit = () => {
    startTransition(async () => {
      const res = await addBlockedTimeAction({
        publicToken: roster.publicToken,
        adminToken,
        date: dateISO,
        startMin,
        endMin,
        label,
        repeat,
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
          <DialogTitle>Tijd blokkeren</DialogTitle>
          <DialogDescription>
            {formatDayLong(dateISO)} — bezoekers kunnen dit tijdstip dan niet
            meer kiezen (bijv. rustmoment of behandeling).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="block-start">Van</Label>
              <TimeSelect
                id="block-start"
                value={startMin}
                onChange={(v) => {
                  setStartMin(v);
                  if (endMin <= v) setEndMin(v + roster.slotMinutes);
                }}
                from={roster.startMin}
                to={roster.endMin - roster.slotMinutes}
                step={roster.slotMinutes}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="block-end">Tot</Label>
              <TimeSelect
                id="block-end"
                value={endMin}
                onChange={setEndMin}
                from={startMin + roster.slotMinutes}
                to={roster.endMin}
                step={roster.slotMinutes}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="block-repeat">Herhalen?</Label>
            <Select
              value={repeat}
              onValueChange={(v) => setRepeat(v as Repeat)}
            >
              <SelectTrigger id="block-repeat" className="w-full">
                <SelectValue>
                  {(v) => REPEAT_LABELS[(v as Repeat) ?? "none"]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(REPEAT_LABELS) as Repeat[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {REPEAT_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="block-label">Reden (niet verplicht)</Label>
            <Input
              id="block-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={60}
              placeholder="Bijv. middagrust"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Terug
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Even geduld…" : "Blokkeer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
