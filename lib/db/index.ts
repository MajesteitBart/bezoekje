import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import * as schema from "./schema";

type Db = LibSQLDatabase<typeof schema>;

const g = globalThis as typeof globalThis & {
  __visitsClient?: Client;
  __visitsDb?: Db;
  __visitsDbReady?: Promise<void>;
};

// The connection must be opened lazily (first query), not at module import:
// `next build` imports these modules while collecting page data, and on deploy
// platforms the database path (e.g. a mounted volume) only exists at runtime.
function getClient(): Client {
  g.__visitsClient ??= createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return g.__visitsClient;
}

function getDb(): Db {
  g.__visitsDb ??= drizzle(getClient(), { schema });
  return g.__visitsDb;
}

// Proxy keeps the `db.select()...` call-site API while deferring the actual
// connection until a method is first accessed.
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

const DDL = `
CREATE TABLE IF NOT EXISTS rosters (
  id TEXT PRIMARY KEY,
  public_token TEXT NOT NULL UNIQUE,
  admin_token TEXT NOT NULL,
  title TEXT NOT NULL,
  pinned_note TEXT,
  pinned_note_level TEXT NOT NULL DEFAULT 'warning',
  start_min INTEGER NOT NULL DEFAULT 600,
  end_min INTEGER NOT NULL DEFAULT 1200,
  slot_minutes INTEGER NOT NULL DEFAULT 60,
  max_concurrent INTEGER NOT NULL DEFAULT 1,
  days_ahead INTEGER NOT NULL DEFAULT 21,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  roster_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_min INTEGER NOT NULL,
  end_min INTEGER NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  edit_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_visits_roster_date ON visits(roster_id, date);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  roster_id TEXT NOT NULL,
  date TEXT NOT NULL,
  label TEXT NOT NULL,
  needs_time INTEGER NOT NULL DEFAULT 0,
  start_min INTEGER,
  note TEXT,
  claimed_name TEXT,
  claimed_note TEXT,
  edit_token TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_roster_date ON tasks(roster_id, date);
CREATE TABLE IF NOT EXISTS task_types (
  id TEXT PRIMARY KEY,
  roster_id TEXT NOT NULL,
  name TEXT NOT NULL,
  needs_time INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_task_types_roster ON task_types(roster_id);
CREATE TABLE IF NOT EXISTS blocked_times (
  id TEXT PRIMARY KEY,
  roster_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_min INTEGER NOT NULL,
  end_min INTEGER NOT NULL,
  label TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_blocked_roster_date ON blocked_times(roster_id, date);
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS roster_admins (
  roster_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (roster_id, user_id)
);
`;

// Columns added after the first release; CREATE TABLE IF NOT EXISTS does not
// evolve existing tables, so each is applied when missing.
const COLUMN_MIGRATIONS: Array<{ table: string; column: string; ddl: string }> =
  [
    {
      table: "rosters",
      column: "pinned_note_level",
      ddl: "ALTER TABLE rosters ADD COLUMN pinned_note_level TEXT NOT NULL DEFAULT 'warning'",
    },
  ];

async function migrate(): Promise<void> {
  const client = getClient();
  await client.executeMultiple(DDL);
  for (const m of COLUMN_MIGRATIONS) {
    const info = await client.execute(`PRAGMA table_info(${m.table})`);
    const exists = info.rows.some((r) => r.name === m.column);
    if (!exists) await client.execute(m.ddl);
  }
}

export function dbReady(): Promise<void> {
  g.__visitsDbReady ??= migrate();
  return g.__visitsDbReady;
}
