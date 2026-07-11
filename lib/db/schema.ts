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

export const blockedTimes = sqliteTable("blocked_times", {
  id: text("id").primaryKey(),
  rosterId: text("roster_id").notNull(),
  date: text("date").notNull(),
  startMin: integer("start_min").notNull(),
  endMin: integer("end_min").notNull(),
  label: text("label"),
  createdAt: integer("created_at").notNull(),
});
