import { test } from "node:test";
import assert from "node:assert/strict";
import { q, one } from "../lib/db";
import { parseReply, webBook, freeDays, normPhone } from "../lib/webchat";
import { linkVisit } from "../lib/attribution";
import { DEFAULTS } from "../lib/settings";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
const now = new Date("2026-10-21T03:00:00Z"); // Wed 10:00 Bangkok

test("reply: booking tag split off, banned claims removed", () => {
  assert.deepEqual(parseReply("ได้เลยค่ะ [[BOOK:2026-10-24]]"), { reply: "ได้เลยค่ะ", book: { date: "2026-10-24" } });
  assert.deepEqual(parseReply("ได้เลยค่ะ [[BOOK]]").book, { date: null });
  assert.equal(parseReply("ผลดีที่สุด การันตี 100%").reply.includes("การันตี"), false);
  assert.equal(normPhone("+66 81 234 5678"), "0812345678");
});

test("web booking: consent required, books a free slot, then LINE chat with the code joins the records", async () => {
  const days = await freeDays(DEFAULTS, now);
  assert.ok(days.length > 0 && days[0].times.length > 0);
  const start = days[0].times[0].start;
  await assert.rejects(webBook({ name: "ทดสอบ", phone: "0812345678", start, consent: false, now }), /consent_required/);
  await assert.rejects(webBook({ name: "ทดสอบ", phone: "12", start, consent: true, now }), /bad_phone/);
  const r = await webBook({ name: "ทดสอบ เว็บ", phone: "081-234-5678", start, interest: "ใต้ตา", consent: true, marketing: false, now });
  assert.ok(r.apptId && /%23[A-Z2-9]{6}/.test(r.lineUrl));
  assert.equal((await one("select source from appointments where id = $1", [r.apptId]))!.source, "webchat");
  assert.equal((await one("select granted from consents where client_id = $1 and type = 'data'", [r.clientId]))!.granted, true);
  await assert.rejects(webBook({ name: "อีกคน", phone: "0899999999", start, consent: true, now }), /slot_taken/);
  // the visitor adds LINE and sends the pre-filled message
  const code = decodeURIComponent(r.lineUrl).match(/#([A-Z2-9]{6})/)![1];
  const line = Number((await one("insert into clients(line_user_id, display_name) values ('UWEB1','LINE name') returning id"))!.id);
  await linkVisit(code, line, null);
  assert.equal(await one("select 1 from clients where id = $1", [r.clientId]), null, "web record merged away");
  const c = (await one("select name, phone from clients where id = $1", [line]))!;
  assert.deepEqual([c.name, c.phone], ["ทดสอบ เว็บ", "0812345678"]);
  assert.equal(Number((await one("select client_id from appointments where id = $1", [r.apptId]))!.client_id), line);
});
