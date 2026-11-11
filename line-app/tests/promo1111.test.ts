import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { activePromos, promoByKey, seatsUsed, panelPromos, promoKb } from "../lib/promos";
import { mediaSet } from "../lib/campaignMedia";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
process.env.APP_URL = "https://app.test";
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const J = (x: unknown) => JSON.stringify(x ?? null);
const day = new Date("2026-11-11T05:00:00Z"), next = new Date("2026-11-12T05:00:00Z");
const p = promoByKey("1111-2611")!;

test("11.11 runs on 11 Nov only (Bangkok); the panel keeps it for held seats", () => {
  assert.ok(activePromos(day).includes(p));
  assert.ok(activePromos(new Date("2026-11-11T16:59:00Z")).includes(p));
  assert.ok(!activePromos(new Date("2026-11-10T16:59:00Z")).includes(p));
  assert.ok(!activePromos(next).includes(p));
  assert.ok(panelPromos(next).includes(p));
  assert.match(promoKb(day), /11,111 THB/);
  assert.doesNotMatch(promoKb(next), /11,111 THB/);
  assert.ok(mediaSet("1111-2611-card", day));
  assert.ok(!mediaSet("1111-2611-card", next));
});

test("'11.11' → card; its button takes an 11.11 seat; the Sculptra button still takes a Sculptra seat", async () => {
  const card = await handleEvent(msg("U11_A", "11.11"), day, DEFAULTS);
  assert.match(J(card?.messages), /11,111 บาท/);
  assert.match(J(card?.messages), /ขอรับสิทธิ์ 11\.11 ค่ะ/);
  assert.doesNotMatch(J(card?.messages), /botox|โบท็อกซ์|ดีที่สุด|การันตี|100%|ถาวร|ไม่เจ็บ|เห็นผลทันที/i);
  const s0 = await seatsUsed(promoByKey("sculptra-2611")!, day);
  const got = await handleEvent(msg("U11_A", "ขอรับสิทธิ์ 11.11 ค่ะ"), day, DEFAULTS);
  assert.match(J(got?.messages), /จาก 11 เป็นของคุณแล้ว/);
  assert.equal(await seatsUsed(p, day), 1);
  await handleEvent(msg("U11_B", "ขอรับสิทธิ์ Sculptra 15,990 ค่ะ"), day, DEFAULTS);
  assert.equal(await seatsUsed(p, day), 1);
  assert.equal(await seatsUsed(promoByKey("sculptra-2611")!, day), s0 + 1);
});

test("after 11 Nov the 11.11 button no longer gives a seat", async () => {
  await handleEvent(msg("U11_C", "ขอรับสิทธิ์ 11.11 ค่ะ"), next, DEFAULTS);
  assert.equal(await seatsUsed(p, next), 1);
});
