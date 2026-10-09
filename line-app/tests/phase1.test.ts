import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, saveSettings } from "../lib/settings";
import { parseSource, deepLink, ensureRefCode, applySource } from "../lib/source";
import { handleEvent } from "../lib/webhook";
import { upsertClientByLine, ensureLead, recordConsent } from "../lib/crm";
import { book } from "../lib/booking";
import { sla, nurture, aftercare, csat, reminder2h, noShows, careEscalation } from "../lib/tick";
import { seedOnce } from "../lib/seed";
import { CARE_VERSION } from "../lib/careCards";
import { q, one } from "../lib/db";
import { bkk } from "../lib/time";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const pb = (u: string, data: string) => ({ type: "postback", replyToken: "t", source: { type: "user", userId: u }, postback: { data } });
const mon10 = new Date("2026-10-05T03:00:00Z"); // Mon 10:00 BKK

test("FR-01/02 source tag and referral from the pre-filled message", async () => {
  assert.deepEqual(parseSource("สวัสดีค่ะ สนใจปรึกษาคุณหมอ (จาก Facebook)"), { source: "fb" });
  assert.deepEqual(parseSource("สวัสดีค่ะ (รหัสแนะนำ vab3cd9)"), { source: "ref", refCode: "VAB3CD9" });
  assert.match(deepLink("web"), /^https:\/\/line\.me\/R\/oaMessage\/%40vinfinityclinic\/\?/);
  const a = await upsertClientByLine("UREF1", {});
  const code = await ensureRefCode(a.id);
  assert.equal(await ensureRefCode(a.id), code);
  await handleEvent(msg("UREF2", `สวัสดีค่ะ สนใจปรึกษาคุณหมอ (รหัสแนะนำ ${code})`), mon10, DEFAULTS);
  const l = await one("select l.source, l.referred_by from leads l join clients c on c.id = l.client_id where c.line_user_id = 'UREF2'");
  assert.equal(l!.source, "ref"); assert.equal(Number(l!.referred_by), a.id);
  // self referral is ignored
  const lead = await ensureLead(a.id);
  assert.equal(await applySource(a.id, lead, { source: "ref", refCode: code }), null);
});

test("FR-07 SLA alerts once per inbound, only in opening hours", async () => {
  await handleEvent(msg("USLA", "สอบถามค่ะ"), mon10, DEFAULTS);
  const t1030 = new Date(mon10.getTime() + 30 * 60000);
  await q("update leads set last_inbound_at = $1 from clients c where c.id = leads.client_id and c.line_user_id = 'USLA'", [new Date(t1030.getTime() - 12 * 60000).toISOString()]);
  assert.ok((await sla(t1030, DEFAULTS)) >= 1);
  assert.equal(await sla(new Date(t1030.getTime() + 60000), DEFAULTS), 0); // no repeat at level 10
  assert.equal(await sla(new Date(t1030.getTime() + 20 * 60000), DEFAULTS), 1); // 30 min → BM
  assert.equal(await sla(new Date("2026-10-05T15:00:00Z"), DEFAULTS), 0); // 22:00 closed
});

test("FR-09 nurture D1 → D3 → D7 → Lost, stops on reply", async () => {
  const c = await upsertClientByLine("UNUR", {});
  const lid = await ensureLead(c.id);
  await q("update leads set status = 'Nurture', nurture_started_at = $2, nurture_step = 0 where id = $1", [lid, "2026-10-01T03:00:00Z"]);
  assert.equal(await nurture(new Date("2026-10-02T03:30:00Z")), 1);
  assert.equal(await nurture(new Date("2026-10-02T04:00:00Z")), 0); // same step not resent
  assert.equal(await nurture(new Date("2026-10-04T03:30:00Z")), 1); // D3
  assert.equal(await nurture(new Date("2026-10-08T03:30:00Z")), 1); // D7
  await nurture(new Date("2026-10-09T03:30:00Z"));
  assert.equal((await one("select status from leads where id = $1", [lid]))!.status, "Lost");
  // reply stops nurture
  const c2 = await upsertClientByLine("UNUR2", {});
  const l2 = await ensureLead(c2.id);
  await q("update leads set status = 'Nurture', nurture_started_at = now() where id = $1", [l2]);
  await handleEvent(msg("UNUR2", "ขอถามเพิ่มค่ะ"), mon10, DEFAULTS);
  assert.equal((await one("select status from leads where id = $1", [l2]))!.status, "Contacted");
});

test("FR-15/16 reminder 2h, reschedule options, no-show", async () => {
  const c = await upsertClientByLine("UAPT", {});
  const now = new Date("2026-10-05T03:00:00Z");
  const id = await book({ clientId: c.id, startIso: bkk("2026-10-05", "12:00").toISOString(), s: DEFAULTS, now: new Date("2026-10-01T03:00:00Z") });
  await q("update appointments set created_at = '2026-10-01T03:00:00Z' where id = $1", [id]);
  assert.equal(await reminder2h(now, DEFAULTS), 1);
  assert.equal(await reminder2h(now, DEFAULTS), 0);
  const out = await handleEvent(pb("UAPT", `resched=${id}`), now, DEFAULTS);
  const qr = (out!.messages[0] as any).quickReply.items;
  assert.equal(qr.length, 4); // 3 slots + other days
  const data = new URLSearchParams(qr[0].action.data);
  const moved = await handleEvent(pb("UAPT", qr[0].action.data), now, DEFAULTS);
  assert.ok(JSON.stringify(moved).includes("ยืนยันนัด"));
  assert.equal((await one("select status from appointments where id = $1", [id]))!.status, "cancelled");
  const newAppt = await one("select id from appointments where client_id = $1 and status = 'booked'", [c.id]);
  assert.equal(new Date((await one("select start_at from appointments where id = $1", [newAppt!.id]))!.start_at).toISOString(), data.get("t"));
  await q("update appointments set start_at = $2 where id = $1", [newAppt!.id, new Date(now.getTime() - 40 * 60000).toISOString()]);
  assert.ok((await noShows(now)) >= 1);
  assert.equal((await one("select status from appointments where id = $1", [newAppt!.id]))!.status, "no_show");
});

test("FR-32-35 aftercare only after approval, care request, CSAT ≤3 opens an issue", async () => {
  await seedOnce();
  const c = await upsertClientByLine("UAC", {});
  await recordConsent(c.id, "data", true, "t");
  const cat = await one("select id from catalog where code = 'FIL-TT'");
  const t = await one("insert into treatments(client_id, catalog_id, name, aftercare_key, done_at) values ($1,$2,'ฟิลเลอร์ใต้ตา','filler',$3) returning id", [c.id, cat!.id, "2026-10-04T05:00:00Z"]);
  const day1 = new Date("2026-10-05T03:30:00Z");
  assert.equal(await aftercare(day1, DEFAULTS), 0); // not approved yet
  assert.equal(await aftercare(day1, { ...DEFAULTS, aftercareApproved: true }), 0); // approved an older version
  assert.equal(await aftercare(day1, { ...DEFAULTS, aftercareApproved: true, aftercareVersion: CARE_VERSION }), 1);
  assert.equal(await aftercare(day1, { ...DEFAULTS, aftercareApproved: true, aftercareVersion: CARE_VERSION }), 0);
  const ask = await handleEvent(pb("UAC", `care=ask&t=${t!.id}`), day1, DEFAULTS);
  assert.ok(JSON.stringify(ask).includes("ส่งรูป"));
  assert.equal((await one("select status from care_requests where client_id = $1", [c.id]))!.status, "waiting_photo");
  assert.equal(await careEscalation(new Date(Date.now() + 20 * 60000)), 1);
  assert.equal(await csat(new Date("2026-10-18T03:00:00Z")), 1);
  const r = await handleEvent(pb("UAC", `csat=2&t=${t!.id}`), day1, DEFAULTS);
  assert.ok(JSON.stringify(r).includes("ขอบคุณที่บอกเรา"));
  assert.equal((await one("select count(*)::int n from issues where client_id = $1 and level = 'L2'", [c.id]))!.n, 1);
  const again = await handleEvent(pb("UAC", `csat=5&t=${t!.id}`), day1, DEFAULTS);
  assert.ok(JSON.stringify(again).includes("ได้รับคะแนนแล้ว"));
});
