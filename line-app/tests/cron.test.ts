import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { book } from "../lib/booking";
import { upsertClientByLine } from "../lib/crm";
import { sendReminders, eveningRun } from "../lib/cron";
import { noShows } from "../lib/tick";
import { q } from "../lib/db";
import { bkk } from "../lib/time";

test("reminder targets tomorrow only, skips clients without LINE, evening marks stale no-shows", async () => {
  const now = new Date("2026-10-05T11:00:00Z"); // Mon 18:00
  const noLine = await upsertClientByLine("UC1", {}); await q("update clients set line_user_id = null where id = $1", [noLine.id]);
  await book({ clientId: noLine.id, startIso: bkk("2026-10-07", "10:00").toISOString(), s: DEFAULTS, now, skipRules: true }); // Wed = day after tomorrow
  await book({ clientId: noLine.id, startIso: bkk("2026-10-06", "10:00").toISOString(), s: DEFAULTS, now, skipRules: true }); // Tue (staff override) = tomorrow
  const r = await sendReminders(now);
  assert.equal(r.due, 1); assert.equal(r.noLine, 1); assert.equal(r.sent, 0);
  await book({ clientId: noLine.id, startIso: bkk("2026-10-05", "13:00").toISOString(), s: DEFAULTS, now, skipRules: true });
  const n = await noShows(new Date("2026-10-05T13:00:00Z"));
  assert.ok(n >= 1);
  const e = await eveningRun(new Date("2026-10-05T13:00:00Z"));
  assert.equal(e.unconfirmed, 1);
});
