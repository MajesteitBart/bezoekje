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
import { TimeSelect } from "@/components/roster/time-select";
import { formatDayLong } from "@/lib/dates";
import type { RosterDTO } from "@/lib/types";

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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setLabel("");
      setStartMin(roster.startMin);
      setEndMin(roster.startMin + roster.slotMinutes);
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
