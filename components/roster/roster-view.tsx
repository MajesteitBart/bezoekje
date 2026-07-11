"use client";

import { ClockIcon, MessageCircleIcon, PinIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { nl } from "react-day-picker/locale";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { AdminBar } from "@/components/roster/admin-bar";
import { DayPanel } from "@/components/roster/day-panel";
import { getEditTokens } from "@/lib/client-tokens";
import {
  addDaysISO,
  dateToISO,
  formatMin,
  isoToLocalDate,
  todayISO,
} from "@/lib/dates";
import type { BlockedDTO, RosterDTO, VisitDTO } from "@/lib/types";

export function RosterView({
  roster,
  visits,
  blocked,
  adminToken,
  justCreated,
}: {
  roster: RosterDTO;
  visits: VisitDTO[];
  blocked: BlockedDTO[];
  adminToken: string | null;
  justCreated?: boolean;
}) {
  const todayIso = todayISO();
  const horizonIso = addDaysISO(todayIso, roster.daysAhead);
  const [selectedISO, setSelectedISO] = useState(todayIso);
  const [month, setMonth] = useState(() => isoToLocalDate(todayIso));

  // Edit tokens live in localStorage; read them after mount so server and
  // client render the same initial HTML.
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});
  useEffect(() => {
    setMyTokens(getEditTokens(roster.publicToken));
  }, [roster.publicToken, visits]);

  const dayVisits = useMemo(
    () =>
      visits
        .filter((v) => v.date === selectedISO)
        .sort((a, b) => a.startMin - b.startMin),
    [visits, selectedISO]
  );
  const dayBlocked = useMemo(
    () => blocked.filter((b) => b.date === selectedISO),
    [blocked, selectedISO]
  );
  const bookedDates = useMemo(
    () =>
      Array.from(new Set(visits.map((v) => v.date))).map((d) =>
        isoToLocalDate(d)
      ),
    [visits]
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-3 p-3 md:p-6">
      {adminToken ? (
        <AdminBar
          roster={roster}
          adminToken={adminToken}
          justCreated={justCreated}
        />
      ) : null}

      <div className="grid overflow-hidden rounded-lg border bg-background lg:grid-cols-[260px_minmax(300px,360px)_minmax(0,1fr)]">
        <InfoPanel
          roster={roster}
          todayVisits={visits.filter((v) => v.date === todayIso)}
        />

        <div className="flex justify-center border-t p-3 lg:border-t-0 lg:border-l">
          <Calendar
            mode="single"
            locale={nl}
            selected={isoToLocalDate(selectedISO)}
            onSelect={(date) => {
              if (date) setSelectedISO(dateToISO(date));
            }}
            month={month}
            onMonthChange={setMonth}
            disabled={[
              { before: isoToLocalDate(todayIso) },
              { after: isoToLocalDate(horizonIso) },
            ]}
            showOutsideDays
            modifiers={{ booked: bookedDates }}
            modifiersClassNames={{
              booked:
                "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:rounded-full after:bg-primary after:content-['']",
            }}
            className="w-full border-none shadow-none"
            classNames={{
              month: "w-full space-y-1",
              month_caption:
                "mb-4 flex h-10 items-center justify-start rounded-md bg-secondary px-3 capitalize",
              nav: "absolute top-4 right-4 flex items-center justify-center gap-2",
              button_previous: "relative left-auto",
              button_next: "relative right-auto",
              month_grid: "w-full",
              weekdays: "flex w-full justify-center gap-1 uppercase",
              weekday: "w-full text-foreground",
              week: "flex w-full justify-center gap-1",
              day: "relative h-11 w-full border border-transparent bg-secondary hover:border-primary lg:h-auto lg:aspect-square",
              day_button: "size-full",
              selected: "after:bg-primary-foreground!",
            }}
          />
        </div>

        <div className="border-t lg:border-t-0 lg:border-l">
          <DayPanel
            roster={roster}
            dateISO={selectedISO}
            visits={dayVisits}
            blocked={dayBlocked}
            myTokens={myTokens}
            adminToken={adminToken}
          />
        </div>
      </div>
    </main>
  );
}

function InfoPanel({
  roster,
  todayVisits,
}: {
  roster: RosterDTO;
  todayVisits: VisitDTO[];
}) {
  const [shareHref, setShareHref] = useState<string | null>(null);

  useEffect(() => {
    const link = `${window.location.origin}/r/${roster.publicToken}`;
    setShareHref(
      `https://wa.me/?text=${encodeURIComponent(
        `📅 ${roster.title} — plan je bezoek via deze link: ${link}`
      )}`
    );
  }, [roster.publicToken, roster.title]);

  const names = Array.from(new Set(todayVisits.map((v) => v.name)));

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold">{roster.title}</h1>

      {roster.pinnedNote ? (
        <Alert>
          <PinIcon />
          <AlertTitle>Even opletten</AlertTitle>
          <AlertDescription>{roster.pinnedNote}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center gap-2 text-sm">
        <ClockIcon className="size-4 text-muted-foreground" />
        Bezoek kan van {formatMin(roster.startMin)} tot{" "}
        {formatMin(roster.endMin)}
      </div>

      <div className="text-sm">
        <p className="text-muted-foreground">Vandaag komen:</p>
        <p className="font-medium">
          {names.length > 0 ? names.join(", ") : "nog niemand 🕊️"}
        </p>
      </div>

      {shareHref ? (
        <Button
          variant="outline"
          nativeButton={false}
          render={<a href={shareHref} target="_blank" rel="noreferrer" />}
        >
          <MessageCircleIcon data-icon="inline-start" />
          Deel in WhatsApp
        </Button>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Kies een dag, tik op een vrij tijdstip en zet je naam erbij — klaar.
        Je eigen bezoeken kun je hier altijd aanpassen of annuleren.
      </p>
    </div>
  );
}
