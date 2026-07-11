export const NOTE_LEVELS = ["info", "warning", "urgent"] as const;
export type NoteLevel = (typeof NOTE_LEVELS)[number];

export type RosterDTO = {
  publicToken: string;
  title: string;
  pinnedNote: string | null;
  pinnedNoteLevel: NoteLevel;
  startMin: number;
  endMin: number;
  slotMinutes: number;
  maxConcurrent: number;
  daysAhead: number;
};

export type AccountInfoDTO = {
  sessionEmail: string | null;
  linkedEmails: string[];
  sessionLinked: boolean;
};

export type VisitDTO = {
  id: string;
  date: string;
  startMin: number;
  endMin: number;
  name: string;
  note: string | null;
};

export type BlockedDTO = {
  id: string;
  date: string;
  startMin: number;
  endMin: number;
  label: string | null;
};
