"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { deleteVisitAction, updateVisitAction } from "@/app/actions";
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
import { removeEditToken } from "@/lib/client-tokens";
import { formatDayLong } from "@/lib/dates";
import type { RosterDTO, VisitDTO } from "@/lib/types";

export function EditVisitDialog({
  roster,
  visit,
  token,
  open,
  onOpenChange,
}: {
  roster: RosterDTO;
  visit: VisitDTO | null;
  /** The visit's editToken (own visit) or the roster adminToken. */
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [startMin, setStartMin] = useState(0);
  const [endMin, setEndMin] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open && visit) {
      setName(visit.name);
      setNote(visit.note ?? "");
      setStartMin(visit.startMin);
      setEndMin(visit.endMin);
      setError(null);
      setConfirmDelete(false);
    }
  }, [open, visit]);

  if (!visit || !token) return null;

  const save = () => {
    startTransition(async () => {
      const res = await updateVisitAction({
        publicToken: roster.publicToken,
        visitId: visit.id,
        token,
        date: visit.date,
        startMin,
        endMin: Math.max(endMin, startMin + roster.slotMinutes),
        name,
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

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      const res = await deleteVisitAction({
        publicToken: roster.publicToken,
        visitId: visit.id,
        token,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      removeEditToken(roster.publicToken, visit.id);
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bezoek aanpassen</DialogTitle>
          <DialogDescription>{formatDayLong(visit.date)}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Naam</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-start">Van</Label>
              <TimeSelect
                id="edit-start"
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
              <Label htmlFor="edit-end">Tot</Label>
              <TimeSelect
                id="edit-end"
                value={endMin}
                onChange={setEndMin}
                from={startMin + roster.slotMinutes}
                to={roster.endMin}
                step={roster.slotMinutes}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-note">Opmerking</Label>
            <Textarea
              id="edit-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={remove} disabled={pending}>
            {confirmDelete ? "Zeker weten? Klik nogmaals" : "Bezoek annuleren"}
          </Button>
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
