import { test } from "node:test";
import assert from "node:assert/strict";
import { q, one } from "../lib/db";
import { captureSlip } from "../lib/slips";
import { dailyReport } from "../lib/finance";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
const now = new Date("2026-10-24T08:00:00Z");
const realFetch = globalThis.fetch;
const fakeAI = (json: object) => {
  process.env.ANTHROPIC_API_KEY = "test";
  globalThis.fetch = (async (url: any, init: any) => String(url).includes("anthropic.com")
    ? new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(json) }] }), { status: 200 })
    : realFetch(url, init)) as typeof fetch;
};
const img = { data: Buffer.from("not-a-real-jpeg"), mime: "image/jpeg" };

test("slip from a client who chatted this week: AI reads the amount, cashier sees it, report flags it", async () => {
  const c = Number((await one("insert into clients(line_user_id, name) values ('USLIP1','ลูกค้าสลิป') returning id"))!.id);
  await q("insert into leads(client_id, last_inbound_at) values ($1, $2)", [c, new Date(now.getTime() - 3600_000).toISOString()]);
  fakeAI({ is_slip: true, amount: 12990, paid_at: "2026-10-24 14:31", to_name: "VINFINITY CLINIC", ref: "X1" });
  assert.equal(await captureSlip(c, img, now), "slip");
  const s = (await one("select amount_read::float a, paid_at_read, status from slips where client_id = $1", [c]))!;
  assert.deepEqual([s.a, s.paid_at_read, s.status], [12990, "2026-10-24 14:31", "pending"]);
  assert.match(await dailyReport(now), /สลิปโอนรอยืนยัน 1 ใบ \(ระบบอ่านได้ 12,990 บาท\) ยังไม่นับในยอด/);
  // a selfie from the same client is left alone
  fakeAI({ is_slip: false, amount: null });
  assert.equal(await captureSlip(c, img, now), null);
  globalThis.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY;
});

test("without AI the old rule still applies (owes money or active), nothing breaks", async () => {
  const c = Number((await one("insert into clients(line_user_id) values ('USLIP2') returning id"))!.id);
  assert.equal(await captureSlip(c, img, now), null, "no relationship: ignored");
  await q("insert into appointments(client_id, doctor, start_at, end_at) values ($1,'หมอ',$2,$2)", [c, new Date(now.getTime() + 864e5).toISOString()]);
  assert.equal(await captureSlip(c, img, now), "slip", "booked client: kept for the cashier");
});
