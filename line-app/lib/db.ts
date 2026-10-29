import { SCHEMA } from "./schema";
import { seedWith } from "./seed";

type Row = Record<string, any>;
type Runner = { query: (text: string, params?: unknown[]) => Promise<Row[]>; exec: (text: string) => Promise<void> };

// Held on globalThis so dev hot-reload and concurrent first requests share one connection / one in-memory DB.
const g = globalThis as unknown as { __vf?: { runner: Promise<Runner> | null; ready: Promise<void> | null } };
const st = (g.__vf ??= { runner: null, ready: null });

async function makeRunner(): Promise<Runner> {
  const url = process.env.DATABASE_URL || "";
  if (!url || url.startsWith("pglite")) {
    // Local dev and tests: in-memory Postgres (WASM). Never used in production.
    if (process.env.VERCEL_ENV === "production") throw new Error("DATABASE_URL is not set");
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite();
    return {
      query: async (t, p) => (await db.query(t, p as any[])).rows as Row[],
      exec: async (t) => { await db.exec(t); },
    };
  }
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  return {
    query: async (t, p) => (await sql.query(t, p as any[])) as Row[],
    // All statements in ONE HTTP round trip (a non-interactive transaction); one-by-one took >30 s on a cold start.
    exec: async (t) => {
      const stmts = t.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
      if (stmts.length === 1) { await sql.query(stmts[0]); return; }
      await sql.transaction(stmts.map((x) => sql.query(x)));
    },
  };
}

/** Runs the schema + seed only when they changed since the last run (one cheap check per cold start).
 *  Before this, every cold serverless instance replayed the whole schema statement by statement over HTTP (~25 s). */
async function migrate(runner: Runner) {
  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256").update(SCHEMA).update(String(seedWith)).digest("hex").slice(0, 16);
  await runner.exec("create table if not exists _meta (k text primary key, v text not null)");
  const cur = await runner.query("select v from _meta where k = 'schema'");
  if (cur[0]?.v === hash) return;
  await runner.exec(SCHEMA);
  await seedWith(runner);
  await runner.query("insert into _meta(k, v) values ('schema', $1) on conflict (k) do update set v = excluded.v", [hash]);
}

export async function db(): Promise<Runner> {
  const runner = await (st.runner ??= makeRunner());
  await (st.ready ??= migrate(runner).catch((e) => { st.ready = null; throw e; }));
  return runner;
}

export async function q<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await db()).query(text, params) as Promise<T[]>;
}

export async function one<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

/** test helper: start from an empty in-memory database */
export function _resetForTests() { st.runner = null; st.ready = null; }
