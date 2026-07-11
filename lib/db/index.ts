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
  start_min INTEGER NOT NULL DEFAULT 600,
  end_min INTEGER NOT NULL DEFAULT 1200,
  slot_minutes INTEGER NOT NULL DEFAULT 60,
  max_concurrent INTEGER NOT NULL DEFAULT 2,
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
`;

export function dbReady(): Promise<void> {
  g.__visitsDbReady ??= getClient().executeMultiple(DDL);
  return g.__visitsDbReady;
}
