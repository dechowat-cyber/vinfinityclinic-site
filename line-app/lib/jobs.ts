import { one } from "./db";

/** Idempotency: returns true only the first time a key is claimed. */
export async function once(key: string) {
  const r = await one("insert into jobs(key) values ($1) on conflict (key) do nothing returning key", [key]);
  return !!r;
}
