import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { activePromos, promoByKey, seatsUsed, promoMessages } from "../lib/promos";
import { GIFTS, giftDay } from "../lib/gifts";
import { mediaSet } from "../lib/campaignMedia";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
process.env.APP_URL = "https://app.test";
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const J = (x: unknown) => JSON.stringify(x ?? null);
const d12 = new Date("2026-12-12T03:00:00Z"); // 10:00 Bangkok
const BANNED = /ดีที่สุด|ที่สุด|100%|หายขาด|การันตี|เห็นผลทันที|เชี่ยวชาญ|ไม่เจ็บ|ถาวร|ชำนาญ|sculptra|vitaran|botox|best|guarantee/i;

test("31 boxes, exactly one live per Bangkok day, none outside December; filler-check promo is retired", () => {
  assert.equal(GIFTS.length, 31);
  for (const g of GIFTS) {
    const noon = new Date(`2026-12-${String(g.day).padStart(2, "0")}T12:00:00+07:00`);
    assert.equal(giftDay(noon), g.day);
    assert.deepEqual(activePromos(noon).filter((p) => p.key.startsWith("gift-")).map((p) => p.key), [g.key]);
  }
  assert.ok(activePromos(new Date("2026-12-01T00:00:01+07:00")).some((p) => p.key === "gift-2612-01"));
  assert.ok(!activePromos(new Date("2026-11-30T23:59:00+07:00")).some((p) => p.key.startsWith("gift-")));
  assert.ok(!activePromos(new Date("2027-01-01T00:00:01+07:00")).some((p) => p.key.startsWith("gift-")));
  assert.ok(!activePromos(new Date("2026-11-25T10:00:00+07:00")).some((p) => p.key === "fillercheck-2612"));
});

test("every box's copy has conditions, โปรแกรม wording and no banned words or brand names", () => {
  for (const g of GIFTS) {
    const s = J(promoMessages(promoByKey(g.key)!)) + promoByKey(g.key)!.text;
    assert.doesNotMatch(s, BANNED, g.key);
    assert.match(s, /ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล/, g.key);
    assert.ok(g.cond.length > 10, g.key);
    assert.match(g.title, /^(โปรแกรม|ส่วนลด|ประเมิน)/, g.key);
    if (/ฟรี/.test(g.price)) assert.match(g.cond, /เมื่อ|เฉพาะ/, g.key);
  }
});

test("on 12 Dec: 'ปฏิทิน' → today's card; claim takes a seat of 5; a claim for another day takes nothing", async () => {
  const card = J((await handleEvent(msg("UGF_1", "ปฏิทินของขวัญ"), d12, DEFAULTS))?.messages);
  assert.match(card, /ของขวัญวันที่ 12 ธ\.ค\./);
  assert.match(card, /gift-2612-12\/1-1x1\.jpg/);
  const p = promoByKey("gift-2612-12")!;
  const got = J((await handleEvent(msg("UGF_1", "ขอรับสิทธิ์ของขวัญวันที่ 12 ธ.ค. ค่ะ (จากปฏิทินของขวัญ)"), d12, DEFAULTS))?.messages);
  assert.match(got, /จาก 5 เป็นของคุณแล้ว/);
  assert.equal(await seatsUsed(p, d12), 1);
  const old = J((await handleEvent(msg("UGF_2", "ขอรับสิทธิ์ของขวัญวันที่ 5 ธ.ค. ค่ะ"), d12, DEFAULTS))?.messages);
  assert.match(old, /หมดเวลากดรับแล้ว/);
  assert.match(old, /วันที่ 12 ธ\.ค\./);
  assert.equal(await seatsUsed(p, d12), 1);
  assert.equal(await seatsUsed(promoByKey("gift-2612-05")!, d12), 0);
});

test("before 1 Dec the calendar question gets the teaser with the page link", async () => {
  const s = J((await handleEvent(msg("UGF_3", "ปฏิทินของขวัญคืออะไรคะ"), new Date("2026-11-28T05:00:00Z"), DEFAULTS))?.messages);
  assert.match(s, /เปิดกล่องแรก 1 ธ\.ค\./);
  assert.match(s, /\/gifts\?s=line/);
});

test("broadcast sets: teaser until 30 Nov, live-seat cards on 1 · 12 · 21 · 25 · 31", () => {
  assert.ok(mediaSet("gift-2612-teaser", new Date("2026-11-30T05:00:00Z")));
  assert.ok(!mediaSet("gift-2612-teaser", new Date("2026-12-01T05:00:00Z")));
  for (const d of ["01", "12", "21", "25", "31"]) assert.ok(mediaSet(`gift-2612-${d}-card`, new Date(`2026-12-${d}T10:00:00+07:00`)), d);
  assert.ok(!mediaSet("fillercheck-2612-card", new Date("2026-11-25T05:00:00Z")));
});
