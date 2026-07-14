// Client-side calendar export for booked visits and claimed tasks. Events use
// floating local times (no timezone suffix): the audience plans in
// Europe/Amsterdam on devices set to that zone, and floating times avoid
// shipping a full VTIMEZONE block.

export type CalendarEvent = {
  /** Stable unique id for the event (the personal link works well). */
  uid: string;
  title: string;
  dateISO: string;
  /** Null start makes an all-day event (e.g. a day-only task). */
  startMin: number | null;
  /** Defaults to one hour after start for timed events. */
  endMin?: number | null;
  description: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function compactDate(iso: string): string {
  return iso.replaceAll("-", "");
}

function compactDateTime(iso: string, min: number): string {
  return `${compactDate(iso)}T${pad(Math.floor(min / 60))}${pad(min % 60)}00`;
}

function nextDayISO(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Commas, semicolons, backslashes, and newlines are special in ICS text.
function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll(/\r?\n/g, "\\n");
}

// RFC 5545 asks for lines of at most 75 octets, continued with CRLF + space.
function foldIcsLine(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  parts.push(rest);
  return parts.join("\r\n");
}

export function buildIcs(event: CalendarEvent): string {
  const stamp = new Date()
    .toISOString()
    .replaceAll(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const timed = event.startMin != null;
  const endMin =
    event.endMin ?? (event.startMin != null ? event.startMin + 60 : null);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bezoekje//NL",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(event.uid)}`,
    `DTSTAMP:${stamp}`,
    timed
      ? `DTSTART:${compactDateTime(event.dateISO, event.startMin as number)}`
      : `DTSTART;VALUE=DATE:${compactDate(event.dateISO)}`,
    timed
      ? `DTEND:${compactDateTime(event.dateISO, endMin as number)}`
      : `DTEND;VALUE=DATE:${compactDate(nextDayISO(event.dateISO))}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const dates =
    event.startMin != null
      ? `${compactDateTime(event.dateISO, event.startMin)}/${compactDateTime(
          event.dateISO,
          event.endMin ?? event.startMin + 60
        )}`
      : `${compactDate(event.dateISO)}/${compactDate(nextDayISO(event.dateISO))}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
    // Pins the wall time even when the user's Google Calendar is set to
    // another timezone; visits happen in Amsterdam time.
    ctz: "Europe/Amsterdam",
    details: event.description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function isoTime(min: number): string {
  return `T${pad(Math.floor(min / 60))}:${pad(min % 60)}:00`;
}

export function outlookCalendarUrl(event: CalendarEvent): string {
  const timed = event.startMin != null;
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    body: event.description,
    startdt: timed
      ? `${event.dateISO}${isoTime(event.startMin as number)}`
      : event.dateISO,
    enddt: timed
      ? `${event.dateISO}${isoTime(
          event.endMin ?? (event.startMin as number) + 60
        )}`
      : nextDayISO(event.dateISO),
    allday: timed ? "false" : "true",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function downloadIcs(filename: string, event: CalendarEvent): void {
  const blob = new Blob([buildIcs(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
