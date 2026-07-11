export type RosterDTO = {
  publicToken: string;
  title: string;
  pinnedNote: string | null;
  startMin: number;
  endMin: number;
  slotMinutes: number;
  maxConcurrent: number;
  daysAhead: number;
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
