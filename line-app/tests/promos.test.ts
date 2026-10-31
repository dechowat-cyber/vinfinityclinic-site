import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { getClientByLine, logTouch } from "../lib/crm";
import { q } from "../lib/db";
import { PROMOS, activePromos, promoKb, promoProspects, promoStats, seatsUsed, promoClaims } from "../lib/promos";
import { campaignMessages } from "../lib/segments";
import { mediaImages, mediaSet } from "../lib/campaignMedia";
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
  assert.ok(!activePromos(nov).some((p) => p.key === "haca-2610"));
  assert.match(promoKb(fri), /36,900/);
  assert.doesNotMatch(promoKb(nov), /36,900/);
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

test("a bare 'สนใจ' gets the running promo", async () => {
  const r = await handleEvent(msg("UPR3", "สนใจ"), fri, DEFAULTS);
  assert.match(JSON.stringify(r?.messages ?? []), /36,900/);
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

// ---- Sculptra: limited seats, rich-menu tile, welcome, broadcast card ----
const nov2 = new Date("2026-11-02T05:00:00Z"); // Mon 12:00 Bangkok
const S = PROMOS.find((p) => p.key === "sculptra-2611")!;
const J = (x: unknown) => JSON.stringify(x ?? null);

test("Sculptra runs 1–15 Nov only; HArmonyCa gone by then", () => {
  assert.deepEqual(activePromos(fri).map((p) => p.key), ["haca-2610"]);
  assert.deepEqual(activePromos(nov2).map((p) => p.key), ["sculptra-2611"]);
  assert.equal(activePromos(new Date("2026-11-15T17:00:01Z")).length, 0);
});

test("rich-menu tile 'โปรเดือนนี้' always shows the running promo card; nothing running → a polite line", async () => {
  const r1 = await handleEvent(msg("USC1", "โปรเดือนนี้"), nov2, DEFAULTS);
  assert.match(J(r1?.messages), /กดรับสิทธิ์/);
  assert.match(J(r1?.messages), /sculptra-2611\/1-1x1\.jpg/);
  const r2 = await handleEvent(msg("USC1", "โปรเดือนนี้"), nov2, DEFAULTS); // again → still shown (they asked)
  assert.match(J(r2?.messages), /กดรับสิทธิ์/);
  const none = await handleEvent(msg("USC1", "โปรเดือนนี้"), new Date("2026-11-20T05:00:00Z"), DEFAULTS);
  assert.match(J(none?.messages), /ยังไม่มีโปรใหม่/);
});

test("claim: seat numbers count up, same person keeps their seat, held seats expire after 48 h, full at 10", async () => {
  const a = await handleEvent(msg("USC10", "ขอรับสิทธิ์ Sculptra 15,990 ค่ะ"), nov2, DEFAULTS);
  assert.match(J(a?.messages), /สิทธิ์ที่ 1 จาก 10/);
  const again = await handleEvent(msg("USC10", "รับสิทธิ์"), nov2, DEFAULTS);
  assert.match(J(again?.messages), /สิทธิ์ที่ 1 เป็นของคุณอยู่แล้ว/);
  const b = await handleEvent(msg("USC11", "รับสิทธิ์"), nov2, DEFAULTS);
  assert.match(J(b?.messages), /สิทธิ์ที่ 2 จาก 10/);
  // USC11 books within 48 h → stays; USC10 does not → released after 48 h
  const cb = (await getClientByLine("USC11"))!;
  await q(`insert into appointments(client_id, doctor, start_at, end_at, created_at) values ($1,'D',$2,$3,$4)`,
    [cb.id, "2026-11-05T05:00:00Z", "2026-11-05T05:30:00Z", "2026-11-02T08:00:00Z"]);
  const later = new Date("2026-11-04T06:00:00Z");
  assert.equal(await seatsUsed(S, later), 1);
  for (let i = 0; i < 9; i++) await handleEvent(msg(`USC2${i}`, "รับสิทธิ์"), later, DEFAULTS);
  assert.equal(await seatsUsed(S, later), 10);
  const full = await handleEvent(msg("USC99", "รับสิทธิ์"), later, DEFAULTS);
  assert.match(J(full?.messages), /สิทธิ์ครบแล้ว/);
  const list = await promoClaims(S, later);
  assert.ok(list.find((c) => c.client_id == cb.id)?.booked);
});

test("new friend gets the welcome plus the running promo (≤5 messages)", async () => {
  const r = await handleEvent({ type: "follow", replyToken: "t", source: { type: "user", userId: "USC50" } }, nov2, DEFAULTS);
  assert.ok(r!.messages.length <= 5);
  assert.match(J(r!.messages), /กดรับสิทธิ์/);
});

test("promo broadcast/campaign sends text + claim card", () => {
  const m = campaignMessages("U1", { message: "สวัสดีค่ะ", with_booking: true, campaign_id: 1, images: ["promo:sculptra-2611"] });
  assert.equal(m[0].type, "text");
  assert.match(J(m[1]), /ขอรับสิทธิ์ Sculptra/);
  assert.deepEqual(mediaImages(mediaSet("sculptra-2611-card", nov2)), ["promo:sculptra-2611"]);
  assert.equal(mediaSet("sculptra-2611-card", fri), null);
});
