import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const rosters = sqliteTable("rosters", {
  id: text("id").primaryKey(),
  publicToken: text("public_token").notNull().unique(),
  adminToken: text("admin_token").notNull(),
  title: text("title").notNull(),
  pinnedNote: text("pinned_note"),
  pinnedNoteLevel: text("pinned_note_level").notNull().default("warning"),
  startMin: integer("start_min").notNull().default(600),
  endMin: integer("end_min").notNull().default(1200),
  slotMinutes: integer("slot_minutes").notNull().default(60),
  maxConcurrent: integer("max_concurrent").notNull().default(1),
  daysAhead: integer("days_ahead").notNull().default(21),
  createdAt: integer("created_at").notNull(),
});

export const visits = sqliteTable("visits", {
  id: text("id").primaryKey(),
  rosterId: text("roster_id").notNull(),
  date: text("date").notNull(),
  startMin: integer("start_min").notNull(),
  endMin: integer("end_min").notNull(),
  name: text("name").notNull(),
  note: text("note"),
  editToken: text("edit_token").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Which account (Better Auth user) administers which roster. Links are only
// created by actions that verified the roster's adminToken.
export const rosterAdmins = sqliteTable(
  "roster_admins",
  {
    rosterId: text("roster_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.rosterId, t.userId] })]
);

// Practical care tasks (cooking, transport, …) coordinated next to visits.
// Label and needsTime are snapshotted from the chosen task type so deleting a
// type never affects existing tasks. Claim fields are null while a task is
// open; editToken is issued at claim time and cleared again on release.
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  rosterId: text("roster_id").notNull(),
  date: text("date").notNull(),
  label: text("label").notNull(),
  needsTime: integer("needs_time", { mode: "boolean" }).notNull().default(false),
  startMin: integer("start_min"),
  note: text("note"),
  claimedName: text("claimed_name"),
  claimedNote: text("claimed_note"),
  editToken: text("edit_token"),
  // Set when this row is an occurrence of a recurring series; a partial unique
  // index on (series_id, date) makes concurrent materialization idempotent.
  seriesId: text("series_id"),
  // Tombstone for a deleted series occurrence: the row must stay to occupy its
  // (series_id, date) slot, or materialization would resurrect the task.
  cancelled: integer("cancelled", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// A recurring task rule. Occurrences are materialized lazily as `tasks` rows
// within the roster's rolling horizon, so each day stays individually
// claimable. The anchor date is the first occurrence; weekly series repeat on
// the anchor's weekday.
export const taskSeries = sqliteTable("task_series", {
  id: text("id").primaryKey(),
  rosterId: text("roster_id").notNull(),
  label: text("label").notNull(),
  needsTime: integer("needs_time", { mode: "boolean" }).notNull().default(false),
  startMin: integer("start_min"),
  note: text("note"),
  freq: text("freq").notNull(), // 'daily' | 'weekly'
  anchorDate: text("anchor_date").notNull(),
  createdAt: integer("created_at").notNull(),
});

// Admin-defined task types offered next to the built-in defaults
// (lib/task-types.ts). Per roster.
export const taskTypes = sqliteTable("task_types", {
  id: text("id").primaryKey(),
  rosterId: text("roster_id").notNull(),
  name: text("name").notNull(),
  needsTime: integer("needs_time", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});

export const blockedTimes = sqliteTable("blocked_times", {
  id: text("id").primaryKey(),
  rosterId: text("roster_id").notNull(),
  date: text("date").notNull(),
  startMin: integer("start_min").notNull(),
  endMin: integer("end_min").notNull(),
  label: text("label"),
  createdAt: integer("created_at").notNull(),
});
