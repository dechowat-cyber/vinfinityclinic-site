import { test } from "node:test";
import assert from "node:assert/strict";
import { upsertClientByLine, recordConsent } from "../lib/crm";
import { reviewAsk, csat } from "../lib/tick";
import { reviewAsk as reviewMsg, csat as csatMsg } from "../lib/messages";
import { seedOnce } from "../lib/seed";
import { q, one } from "../lib/db";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";

test("day-3 review ask: once per client, daytime only, then the D14 CSAT drops its review link", async () => {
  await seedOnce();
  const c = await upsertClientByLine("UREV", {});
  await recordConsent(c.id, "data", true, "t");
  await q("update clients set followed = true where id = $1", [c.id]);
  const cat = await one("select id from catalog where code = 'FIL-HA'");
  // two treatments the same visit: one message only
  for (const n of ["ฟิลเลอร์คาง", "ฟิลเลอร์ปาก"])
    await q("insert into treatments(client_id, catalog_id, name, aftercare_key, done_at) values ($1,$2,$3,'filler',$4)", [c.id, cat!.id, n, "2026-10-04T05:00:00Z"]);

  assert.equal(await reviewAsk(new Date("2026-10-06T05:00:00Z")), 0, "day 2 is too early");
  assert.equal(await reviewAsk(new Date("2026-10-07T02:00:00Z")), 0, "09:00 is before 11:00");
  assert.equal(await reviewAsk(new Date("2026-10-07T05:00:00Z")), 1, "day 3 at 12:00");
  assert.equal(await reviewAsk(new Date("2026-10-07T08:00:00Z")), 0, "not twice");
  assert.equal((await one("select count(*)::int n from touchpoints where client_id = $1 and kind = 'review_ask'", [c.id]))!.n, 1);

  // a new visit a month later is not asked again (120-day cap)
  await q("insert into treatments(client_id, catalog_id, name, aftercare_key, done_at) values ($1,$2,'ฟิลเลอร์ใต้ตา','filler',$3)", [c.id, cat!.id, "2026-11-04T05:00:00Z"]);
  assert.equal(await reviewAsk(new Date("2026-11-07T05:00:00Z")), 0);

  // D14 CSAT still goes out, without a second review link
  assert.equal(await csat(new Date("2026-10-18T03:00:00Z")), 1);
  assert.ok(!JSON.stringify(csatMsg(1, null)).includes("writereview"));
  assert.ok(JSON.stringify(csatMsg(1, "https://search.google.com/local/writereview?placeid=x")).includes("writereview"));
  const m = JSON.stringify(reviewMsg("https://search.google.com/local/writereview?placeid=x"));
  assert.ok(m.includes("writereview") && !/ส่วนลด|เครดิต|ของรางวัล/.test(m), "no incentive for reviews");
});
