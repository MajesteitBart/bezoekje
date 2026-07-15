"use client";

import { CalendarIcon, CheckIcon, CopyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { createVisitAction } from "@/app/actions";
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
import { copyText, getSavedName, saveEditToken, saveName } from "@/lib/client-tokens";
import { formatDayLong, formatMin } from "@/lib/dates";
import type { RosterDTO } from "@/lib/types";

export function BookDialog({
  roster,
  dateISO,
  slot,
  open,
  onOpenChange,
}: {
  roster: RosterDTO;
  dateISO: string;
  slot: { startMin: number; endMin: number } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [endMin, setEndMin] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [personalLink, setPersonalLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open && slot) {
      setName(getSavedName());
      setNote("");
      setEndMin(slot.endMin);
      setError(null);
      setPersonalLink(null);
      setCopied(false);
    }
  }, [open, slot]);

  if (!slot) return null;

  const submit = () => {
    startTransition(async () => {
      const res = await createVisitAction({
        publicToken: roster.publicToken,
        date: dateISO,
        startMin: slot.startMin,
        endMin,
        name,
        note,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      saveEditToken(roster.publicToken, res.visitId, res.editToken);
      saveName(name.trim());
      setPersonalLink(
        `${window.location.origin}/r/${roster.publicToken}/v/${res.visitId}/${res.editToken}`
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
              <DialogTitle>Je bezoek staat gepland 🎉</DialogTitle>
              <DialogDescription>
                Fijn dat je komt! Op dit apparaat kun je je bezoek altijd
                aanpassen. Wil je dat ook op een ander apparaat kunnen? Bewaar
                dan deze persoonlijke link (stuur hem bijvoorbeeld naar jezelf
                op WhatsApp).
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input readOnly value={personalLink} className="text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
            <AddToCalendar
              filename="bezoekje.ics"
              event={{
                uid: personalLink,
                title: roster.title,
                dateISO,
                startMin: slot.startMin,
                endMin,
                description: [
                  note.trim(),
                  `Je persoonlijke link om je bezoek aan te passen of te annuleren:\n${personalLink}`,
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
              <DialogTitle>Ik kom op bezoek</DialogTitle>
              <DialogDescription className="capitalize-first">
                <Badge variant="secondary" className="font-normal">
                  <CalendarIcon />
                  {formatDayLong(dateISO)} · {formatMin(slot.startMin)}–
                  {formatMin(endMin)}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="book-name">Je naam</Label>
                <Input
                  id="book-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="Bijv. Anneke"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="book-end">Tot hoe laat blijf je?</Label>
                <TimeSelect
                  id="book-end"
                  value={endMin}
                  onChange={setEndMin}
                  from={slot.startMin + roster.slotMinutes}
                  to={roster.endMin}
                  step={roster.slotMinutes}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="book-note">Opmerking (niet verplicht)</Label>
                <Textarea
                  id="book-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  placeholder="Bijv. ik neem de hond mee 🐕"
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
                {pending ? "Even geduld…" : "Plan mijn bezoek"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
