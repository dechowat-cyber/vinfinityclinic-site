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
    exec: async (t) => {
      for (const stmt of t.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) await sql.query(stmt);
    },
  };
}

export async function db(): Promise<Runner> {
  const runner = await (st.runner ??= makeRunner());
  await (st.ready ??= runner.exec(SCHEMA).then(() => seedWith(runner)));
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
