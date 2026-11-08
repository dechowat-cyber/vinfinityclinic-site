import { test } from "node:test";
import assert from "node:assert/strict";
import { upsertClientByLine } from "../lib/crm";
import { recordPayment } from "../lib/payments";
import { creditsFor } from "../lib/wallet";
import { q, one } from "../lib/db";
import { personalize, sinceText, comebackBoard, COMEBACK } from "../lib/comeback";
import { campaignMessages, segmentMembers } from "../lib/segments";
import { mediaImages, mediaSet } from "../lib/campaignMedia";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
process.env.APP_URL = "https://app.test";
const J = (x: unknown) => JSON.stringify(x ?? null);
const now = new Date("2026-11-09T05:00:00Z");

test("{ชื่อ} and {ห่าง} are filled per person", () => {
  assert.equal(sinceText(null, now), "สักพัก");
  assert.equal(sinceText("2026-07-01T00:00:00Z", now), "4 เดือน");
  assert.equal(sinceText("2025-09-01T00:00:00Z", now), "ปีกว่า");
  assert.equal(personalize("{ชื่อ} ห่างไป {ห่าง}", "แนน ทดสอบ", "2026-07-01T00:00:00Z", now), "คุณแนน ห่างไป 4 เดือน");
  assert.equal(personalize("{ชื่อ}", "คุณมด", null, now), "คุณมด");
  assert.equal(personalize("{ชื่อ}", null, null, now), "คุณลูกค้า");
});

test("comeback sets: card with gift, own booking link, invite button; no brand names, no banned words", () => {
  for (const k of ["comeback-a", "comeback-b", "comeback-c"]) {
    const m = mediaSet(k, now)!;
    assert.ok(m?.comeback, k);
    const msgs = campaignMessages("U_CB", { message: m.message, with_booking: true, campaign_id: 7, images: mediaImages(m), name: "แนน", last_visit: "2026-05-01T00:00:00Z" });
    const s = J(msgs);
    assert.equal(msgs.length, 1);
    assert.match(s, /คุณแนน/);
    assert.doesNotMatch(s, /\{ชื่อ\}|\{ห่าง\}/);
    assert.match(s, /โบทูลินัม Standard 1 จุด/);
    assert.match(s, /comeback_7/);
    assert.match(s, /ชวนเพื่อน/);
    assert.doesNotMatch(s, /botox|โบท็อกซ์|ดีที่สุด|การันตี|100%|ถาวร|ไม่เจ็บ/i);
  }
});

test("quiet=14 drops anyone messaged by a campaign in the last 14 days", async () => {
  const a = await upsertClientByLine("U_CBQ1", "Q1");
  const b = await upsertClientByLine("U_CBQ2", "Q2");
  const k = await one("insert into campaigns(name, message, created_at) values ('old', 'x', $1) returning id", [new Date(now.getTime() - 5 * 864e5).toISOString()]);
  await q("insert into campaign_recipients(campaign_id, client_id, sent_at) values ($1,$2,$3)", [k.id, a.id, new Date(now.getTime() - 5 * 864e5).toISOString()]);
  const ids = (await segmentMembers({ quietDays: 14 }, now)).map((r) => Number(r.id));
  assert.ok(!ids.includes(Number(a.id)));
  assert.ok(ids.includes(Number(b.id)));
});

test("paying 5,000+ within 30 days of the comeback message → gift pending once; staff board shows it", async () => {
  const c = await upsertClientByLine("U_CBG", "G");
  const sent = new Date(Date.now() - 2 * 864e5).toISOString();
  const k = await one(`insert into campaigns(name, message, images, created_at) values ('คิดถึงนะ A', 'x', '["comeback:a"]', $1) returning id`, [sent]);
  await q("insert into campaign_recipients(campaign_id, client_id, sent_at) values ($1,$2,$3)", [k.id, c.id, sent]);
  const small = await recordPayment({ clientId: c.id, amount: 3_000, method: "cash", staffId: 1 });
  assert.ok(!(await creditsFor(small.id)).comeback);
  const big = await recordPayment({ clientId: c.id, amount: COMEBACK.minPayment, method: "cash", staffId: 1 });
  assert.ok((await creditsFor(big.id)).comeback);
  const again = await recordPayment({ clientId: c.id, amount: 9_000, method: "cash", staffId: 1 });
  assert.ok(!(await creditsFor(again.id)).comeback);
  const g = await q("select * from comeback_gifts where client_id = $1", [c.id]);
  assert.equal(g.length, 1);
  assert.equal(g[0].status, "pending");
  const row = (await comebackBoard()).find((r) => Number(r.client_id) === Number(c.id))!;
  assert.equal(row.gift, "pending");
  assert.equal(Number(row.paid), 17_000);
});

test("no gift without a comeback message, or when the message is older than 30 days", async () => {
  const c = await upsertClientByLine("U_CBN", "N");
  const p1 = await recordPayment({ clientId: c.id, amount: 8_000, method: "cash", staffId: 1 });
  assert.ok(!(await creditsFor(p1.id)).comeback);
  const old = new Date(Date.now() - 40 * 864e5).toISOString();
  const k = await one(`insert into campaigns(name, message, images, created_at) values ('คิดถึงนะ B', 'x', '["comeback:b"]', $1) returning id`, [old]);
  await q("insert into campaign_recipients(campaign_id, client_id, sent_at) values ($1,$2,$3)", [k.id, c.id, old]);
  const p2 = await recordPayment({ clientId: c.id, amount: 8_000, method: "cash", staffId: 1 });
  assert.ok(!(await creditsFor(p2.id)).comeback);
});
