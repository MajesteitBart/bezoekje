"use client";

import {
  CheckIcon,
  CopyIcon,
  Settings2Icon,
  ShieldIcon,
  UserRoundCheckIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { linkRosterToMyAccountAction } from "@/app/account-actions";
import { updateRosterAction } from "@/app/actions";
import { OtpSignIn } from "@/components/account/otp-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { TimeSelect } from "@/components/roster/time-select";
import { copyText } from "@/lib/client-tokens";
import { cn } from "@/lib/utils";
import type { AccountInfoDTO, NoteLevel, RosterDTO } from "@/lib/types";

const NO_ACCOUNT: AccountInfoDTO = {
  sessionEmail: null,
  linkedEmails: [],
  sessionLinked: false,
};

const NOTE_LEVEL_OPTIONS: Array<{
  value: NoteLevel;
  label: string;
  dotClass: string;
}> = [
  {
    value: "info",
    label: "Goed om te weten",
    dotClass: "bg-muted-foreground/40",
  },
  { value: "warning", label: "Even opletten", dotClass: "bg-warning-border" },
  { value: "urgent", label: "Belangrijk", dotClass: "bg-danger-border" },
];

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <Input readOnly value={value} className="text-xs" />
        <Button
          variant="outline"
          size="icon"
          aria-label={`${label} kopiëren`}
          onClick={copy}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
    </div>
  );
}

export function AdminBar({
  roster,
  adminToken,
  justCreated,
  account = NO_ACCOUNT,
}: {
  roster: RosterDTO;
  adminToken: string;
  justCreated?: boolean;
  account?: AccountInfoDTO;
}) {
  const [origin, setOrigin] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(Boolean(justCreated));

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const visitorLink = `${origin}/r/${roster.publicToken}`;
  const adminLink = `${origin}/r/${roster.publicToken}/admin/${adminToken}`;

  return (
    <div className="flex flex-col gap-3">
      {justCreated ? (
        <>
          <Alert>
            <ShieldIcon />
            <AlertTitle>Het rooster staat klaar! 🎉</AlertTitle>
            <AlertDescription>
              Deel de bezoekerslink in je WhatsApp-groep. Bewaar de beheer-link
              goed en deel hem alleen met wie mag meebeheren — het is de enige
              &quot;sleutel&quot; tot het beheer.
            </AlertDescription>
          </Alert>
          {account.linkedEmails.length === 0 ? (
            <div className="rounded-lg border bg-card p-4">
              <AccountOffer
                publicToken={roster.publicToken}
                adminToken={adminToken}
              />
            </div>
          ) : null}
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldIcon className="size-4" />
          Je bekijkt dit rooster als beheerder
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLinksOpen(true)}>
            <UsersIcon data-icon="inline-start" />
            Links delen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2Icon data-icon="inline-start" />
            Instellingen
          </Button>
        </div>
      </div>

      <Dialog open={linksOpen} onOpenChange={setLinksOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Links delen</DialogTitle>
            <DialogDescription>
              De bezoekerslink is voor iedereen. De beheer-link alleen voor
              beheerders.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <CopyRow label="Bezoekerslink (voor de WhatsApp-groep)" value={visitorLink} />
            <Button
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `📅 ${roster.title} — plan je bezoek via deze link: ${visitorLink}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Deel bezoekerslink via WhatsApp
            </Button>
            <CopyRow label="Beheer-link (bewaar goed!)" value={adminLink} />
            <AccountSection
              roster={roster}
              adminToken={adminToken}
              account={account}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinksOpen(false)}>
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SettingsDialog
        roster={roster}
        adminToken={adminToken}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}

function AccountOffer({
  publicToken,
  adminToken,
}: {
  publicToken: string;
  adminToken: string;
}) {
  const [choice, setChoice] = useState<"vraag" | "ja" | "nee">("vraag");

  if (choice === "nee")
    return (
      <p className="text-sm text-muted-foreground">
        Oké! Bewaar de beheer-link dan extra goed — zonder link is er geen
        andere weg terug naar het beheer.
      </p>
    );

  if (choice === "ja")
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          Koppel je e-mailadres — dan kun je de beheer-link altijd terugvinden.
        </p>
        <OtpSignIn publicToken={publicToken} adminToken={adminToken} />
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">
        Wil je een account aanmaken, zodat je de toegang nooit verliest?
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setChoice("ja")}>
          <UserRoundCheckIcon data-icon="inline-start" />
          Ja, koppel mijn e-mail
        </Button>
        <Button size="sm" variant="outline" onClick={() => setChoice("nee")}>
          Nee, bedankt
        </Button>
      </div>
    </div>
  );
}

function AccountSection({
  roster,
  adminToken,
  account,
}: {
  roster: RosterDTO;
  adminToken: string;
  account: AccountInfoDTO;
}) {
  const router = useRouter();
  const [showLink, setShowLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const linkToMyAccount = () => {
    startTransition(async () => {
      const res = await linkRosterToMyAccountAction({
        publicToken: roster.publicToken,
        adminToken,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <p className="text-sm font-medium">Account</p>
      {account.linkedEmails.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Gekoppeld aan {account.linkedEmails.join(", ")}. Op een ander
          apparaat log je in via de pagina /account.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nog geen account gekoppeld. Met een account vind je de beheer-link
          altijd terug, ook als je hem kwijtraakt.
        </p>
      )}
      {account.sessionEmail ? (
        account.sessionLinked ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href="/account" />}
          >
            Naar mijn account
          </Button>
        ) : (
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={linkToMyAccount}
              disabled={pending}
            >
              <UserRoundCheckIcon data-icon="inline-start" />
              {pending
                ? "Even geduld…"
                : `Koppel aan ${account.sessionEmail}`}
            </Button>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
        )
      ) : showLink ? (
        <OtpSignIn publicToken={roster.publicToken} adminToken={adminToken} />
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowLink(true)}>
          <UserRoundCheckIcon data-icon="inline-start" />
          Account koppelen
        </Button>
      )}
    </div>
  );
}

function SettingsDialog({
  roster,
  adminToken,
  open,
  onOpenChange,
}: {
  roster: RosterDTO;
  adminToken: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(roster.title);
  const [pinnedNote, setPinnedNote] = useState(roster.pinnedNote ?? "");
  const [pinnedNoteLevel, setPinnedNoteLevel] = useState<NoteLevel>(
    roster.pinnedNoteLevel
  );
  const [startMin, setStartMin] = useState(roster.startMin);
  const [endMin, setEndMin] = useState(roster.endMin);
  const [maxConcurrent, setMaxConcurrent] = useState(roster.maxConcurrent);
  const [daysAhead, setDaysAhead] = useState(roster.daysAhead);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setTitle(roster.title);
      setPinnedNote(roster.pinnedNote ?? "");
      setPinnedNoteLevel(roster.pinnedNoteLevel);
      setStartMin(roster.startMin);
      setEndMin(roster.endMin);
      setMaxConcurrent(roster.maxConcurrent);
      setDaysAhead(roster.daysAhead);
      setError(null);
    }
  }, [open, roster]);

  const save = () => {
    startTransition(async () => {
      const res = await updateRosterAction({
        publicToken: roster.publicToken,
        adminToken,
        title,
        pinnedNote,
        pinnedNoteLevel,
        startMin,
        endMin,
        maxConcurrent,
        daysAhead,
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
          <DialogTitle>Instellingen</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="set-title">Titel</Label>
            <Input
              id="set-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="set-note">Bericht bovenaan het rooster</Label>
            <Textarea
              id="set-note"
              value={pinnedNote}
              onChange={(e) => setPinnedNote(e.target.value)}
              maxLength={500}
              placeholder="Bijv. Vandaag is hij wat moe — korte bezoekjes graag."
            />
            {pinnedNote.trim() ? (
              <>
                <Label>Hoe belangrijk is dit?</Label>
                <RadioGroup
                  value={pinnedNoteLevel}
                  onValueChange={(v) => setPinnedNoteLevel(v as NoteLevel)}
                  className="gap-2"
                >
                  {NOTE_LEVEL_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 font-normal has-data-checked:border-primary"
                    >
                      <RadioGroupItem value={option.value} />
                      <span
                        className={cn(
                          "size-2.5 rounded-full",
                          option.dotClass
                        )}
                      />
                      {option.label}
                    </Label>
                  ))}
                </RadioGroup>
              </>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="set-start">Bezoek vanaf</Label>
              <TimeSelect
                id="set-start"
                value={startMin}
                onChange={(v) => {
                  setStartMin(v);
                  if (endMin <= v) setEndMin(v + roster.slotMinutes);
                }}
                from={6 * 60}
                to={22 * 60}
                step={30}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="set-end">Bezoek tot</Label>
              <TimeSelect
                id="set-end"
                value={endMin}
                onChange={setEndMin}
                from={startMin + roster.slotMinutes}
                to={23 * 60}
                step={30}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="set-max">Max. bezoeken tegelijk</Label>
              <Select
                value={String(maxConcurrent)}
                onValueChange={(v) => setMaxConcurrent(Number(v))}
              >
                <SelectTrigger id="set-max" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="set-days">Vooruit te plannen</Label>
              <Select
                value={String(daysAhead)}
                onValueChange={(v) => setDaysAhead(Number(v))}
              >
                <SelectTrigger id="set-days" className="w-full">
                  <SelectValue>
                    {(v) => (v == null ? "" : `${v} dagen`)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[7, 14, 21, 30, 60].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} dagen
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Terug
          </Button>
          <Button onClick={save} disabled={pending || !title.trim()}>
            {pending ? "Even geduld…" : "Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
