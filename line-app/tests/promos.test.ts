import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { getClientByLine, logTouch } from "../lib/crm";
import { q } from "../lib/db";
import { PROMOS, activePromos, promoKb, promoProspects, promoStats } from "../lib/promos";
import { systemPrompt } from "../lib/webchat";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
process.env.APP_URL = "https://app.test";
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const fri = new Date("2026-10-30T05:00:00Z"); // Fri 12:00 Bangkok
const nov = new Date("2026-11-01T05:00:00Z");
const P = PROMOS.find((p) => p.key === "haca-2610")!;

test("promo runs until 31 Oct 23:59 Bangkok, then switches itself off", () => {
  assert.equal(activePromos(fri).length, 1);
  assert.equal(activePromos(new Date("2026-10-31T16:59:00Z")).length, 1);
  assert.equal(activePromos(nov).length, 0);
  assert.match(promoKb(fri), /36,900/);
  assert.equal(promoKb(nov), "");
  assert.match(systemPrompt("kb", DEFAULTS, fri), /36,900/);
  assert.doesNotMatch(systemPrompt("kb", DEFAULTS, nov), /36,900/);
});

test("asking about HArmonyCa → image + promo as a free reply, once per person", async () => {
  const r = await handleEvent(msg("UPR1", "สนใจ HArmonyCa ค่ะ ราคาเท่าไหร่"), fri, DEFAULTS);
  assert.ok(r);
  assert.equal(r!.messages[0].type, "image");
  assert.match((r!.messages[0] as any).originalContentUrl, /^https:\/\/app\.test\/campaign\/haca-2610\/1-1x1\.jpg$/);
  assert.match(JSON.stringify(r!.messages[1]), /36,900/);
  const again = await handleEvent(msg("UPR1", "ฟิลเลอร์ยกกระชับ 2cc ได้กี่จุดคะ"), fri, DEFAULTS);
  assert.ok(!again || !JSON.stringify(again.messages).includes("36,900"));
});

test("no promo for complaints, unrelated chat, or after the deadline", async () => {
  for (const t of ["ฉีดฟิลเลอร์ไปแล้วบวมแดงค่ะ", "สลายฟิลเลอร์ราคาเท่าไหร่", "พรุ่งนี้เปิดกี่โมงคะ"]) {
    const r = await handleEvent(msg(`UPR-${t.length}`, t), fri, DEFAULTS);
    assert.ok(!r || !JSON.stringify(r.messages).includes("36,900"), t);
  }
  const late = await handleEvent(msg("UPR9", "สนใจ HArmonyCa"), nov, DEFAULTS);
  assert.ok(!late || !JSON.stringify(late.messages).includes("36,900"));
});

test("manual list: people who asked first, declined marketing left out; sent and booked are counted", async () => {
  await handleEvent(msg("UPR20", "อยากแก้ร่องแก้มค่ะ"), new Date("2026-11-05T05:00:00Z"), DEFAULTS); // asked (promo off then → no auto reply)
  await handleEvent(msg("UPR21", "อยากแก้ร่องแก้มเหมือนกัน"), new Date("2026-11-05T05:00:00Z"), DEFAULTS);
  const a = (await getClientByLine("UPR20"))!; const b = (await getClientByLine("UPR21"))!;
  await q("insert into consents(client_id, type, version, granted) values ($1,'marketing','v1',false)", [b.id]);
  const list = await promoProspects(P, 200);
  const ids = list.map((r) => Number(r.id));
  assert.ok(ids.includes(Number(a.id)));
  assert.ok(!ids.includes(Number(b.id)));
  const auto = (await getClientByLine("UPR1"))!;
  assert.ok(list.find((r) => Number(r.id) === Number(auto.id))?.sent_at, "auto-replied person shows as sent");
  await logTouch(a.id, "out", "promo_manual", P.key);
  await q(`insert into appointments(client_id, doctor, start_at, end_at) values ($1,'D', now() + interval '2 day', now() + interval '2 day 30 min')`, [a.id]);
  const s = await promoStats(P);
  assert.ok(s.sent >= 2 && s.auto >= 1 && s.booked >= 1);
});
