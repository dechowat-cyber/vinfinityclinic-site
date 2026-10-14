import { test } from "node:test";
import assert from "node:assert/strict";
import { q, one } from "../lib/db";
import { openFollowup, logAttempt, syncFollowups, followupList, importFollowups, parseDate, nextChannels } from "../lib/followups";
import { balance } from "../lib/wallet";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
const now = new Date("2026-10-14T03:00:00Z"); // 10:00 Bangkok
const mk = async (name: string, phone: string | null = null) => Number((await one("insert into clients(name, phone) values ($1,$2) returning id", [name, phone]))!.id);

test("dates: Buddhist two-digit, four-digit and ISO", () => {
  assert.equal(parseDate("06/06/69"), "2026-06-06");
  assert.equal(parseDate("6/6/2569"), "2026-06-06");
  assert.equal(parseDate("2026-10-17"), "2026-10-17");
  assert.equal(parseDate("31/13/69"), null);
});

test("misses switch channel and escalate; three in a row = unreachable for 14 days; booked closes", async () => {
  const c = await mk("ทดสอบ ตาม", "0812345678");
  const f = await openFollowup({ clientId: c, reason: "credit", nextOn: "2026-10-14" });
  assert.equal(await openFollowup({ clientId: c, reason: "credit", nextOn: "2026-10-20" }), f, "one open follow-up per client");
  let r = await logAttempt({ followupId: f, channel: "call", result: "no_answer", now });
  assert.deepEqual([r.status, r.next, r.fails], ["open", "2026-10-16", 1]);
  assert.equal(nextChannels({ phone: "081", line_user_id: "U1" }, ["call"])[0], "line", "suggests a channel not tried yet");
  r = await logAttempt({ followupId: f, channel: "line", result: "unread", now });
  assert.deepEqual([r.status, r.next], ["open", "2026-10-18"]);
  r = await logAttempt({ followupId: f, channel: "sms", result: "no_answer", now });
  assert.deepEqual([r.status, r.next], ["unreachable", "2026-10-28"]);
  r = await logAttempt({ followupId: f, channel: "doctor", result: "replied", now });
  assert.deepEqual([r.status, r.fails], ["open", 0], "a reply resets the misses");
  r = await logAttempt({ followupId: f, channel: "doctor", result: "booked", now });
  assert.equal(r.status, "booked");
  assert.equal((await q("select 1 from contact_attempts where followup_id = $1", [f])).length, 5);
});

test("system adds a follow-up when a treatment has no next appointment, and a booking closes it", async () => {
  const c = await mk("ทดสอบ ไม่มีนัด");
  await q("insert into treatments(client_id, name, done_at) values ($1, 'Filler', '2026-10-10T05:00:00Z')", [c]);
  await syncFollowups(now);
  const f = await one("select * from followups where client_id = $1", [c]);
  assert.equal(f?.reason, "next_visit");
  assert.ok((await followupList("due", now)).some((x) => Number(x.client_id) === c));
  await q("insert into appointments(client_id, doctor, start_at, end_at) values ($1, 'หมอ', '2026-10-20T04:00:00Z', '2026-10-20T04:30:00Z')", [c]);
  await syncFollowups(now);
  assert.equal((await one("select status from followups where id = $1", [f!.id]))!.status, "booked");
});

test("import: creates by HN, carries credit and prepaid items once, marks booked and unreachable", async () => {
  const rows = [
    "HN\tชื่อ\tรับบริการล่าสุด\tยอดสะสม\tวงเงินคงเหลือ\tค้างชำระ\tบริการคงเหลือ\tเหตุผล\tนัดแล้ว\tสถานะ\tการติดตาม",
    "T901\tคุณทดสอบหนึ่ง\t06/06/69\t50,000\t20,300\t\tFiller ขมับ 2cc;ปากยกมุม 1cc\tcredit\t\t\tยังไม่ได้ติดตาม",
    "T902\tคุณทดสอบสอง\t19/09/69\t235,740\t\t8,900\t\tvip\t17/10/69\t\tนัดแล้ว",
    "T903\tคุณทดสอบสาม\t04/07/69\t333,412\t\t\t\tvip\t\tunreachable\tโทรไม่รับ",
  ].join("\n");
  const a = await importFollowups(rows, 1, now);
  assert.deepEqual([a.followups, a.created, a.items, a.credit], [3, 3, 2, 20300]);
  const b = await importFollowups(rows, 1, now);
  assert.deepEqual([b.created, b.items, b.credit], [0, 0, 0], "running it twice adds nothing");
  const one1 = (await one("select id, legacy_spend::float s, legacy_last_visit::text d from clients where hn = 'T901'"))!;
  assert.deepEqual([one1.s, one1.d], [50000, "2026-06-06"]);
  assert.equal(await balance(Number(one1.id)), 20300);
  const two = (await one("select c.owed::float owed, f.status, f.next_on::text n from clients c join followups f on f.client_id = c.id where c.hn = 'T902'"))!;
  assert.deepEqual([two.owed, two.status, two.n], [8900, "booked", "2026-10-17"]);
  assert.equal((await one("select f.status from clients c join followups f on f.client_id = c.id where c.hn = 'T903'"))!.status, "unreachable");
});
