"use client";

import { CalendarPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  downloadIcs,
  googleCalendarUrl,
  outlookCalendarUrl,
  type CalendarEvent,
} from "@/lib/calendar";

// Shown on the booking/claim confirmation next to the personal link: one tap
// stores the event (with that link in the description) in a calendar, which
// doubles as link backup when localStorage is wiped. Direct links for Google
// and Outlook, an .ics download for Apple and every other calendar app.
export function AddToCalendar({
  event,
  filename,
}: {
  event: CalendarEvent;
  filename: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CalendarPlusIcon
        aria-hidden
        className="size-4 text-muted-foreground"
      />
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
          />
        }
      >
        Google Agenda
      </Button>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <a
            href={outlookCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
          />
        }
      >
        Outlook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadIcs(filename, event)}
      >
        Apple / andere (.ics)
      </Button>
    </div>
  );
}
