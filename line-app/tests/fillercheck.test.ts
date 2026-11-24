import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { activePromos, promoByKey, seatsUsed, promoKb } from "../lib/promos";
import { mediaSet } from "../lib/campaignMedia";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
process.env.APP_URL = "https://app.test";
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const J = (x: unknown) => JSON.stringify(x ?? null);
const dec = new Date("2026-12-02T05:00:00Z"), jan = new Date("2027-01-01T05:00:00Z");
const p = promoByKey("fillercheck-2612")!;

test("filler check runs 24 Nov – 31 Dec (Bangkok) with a 20-seat broadcast card", () => {
  assert.ok(activePromos(new Date("2026-11-24T05:00:00Z")).includes(p));
  assert.ok(activePromos(new Date("2026-12-31T16:30:00Z")).includes(p));
  assert.ok(!activePromos(jan).includes(p));
  assert.equal(p.limit, 20);
  assert.match(promoKb(dec), /8,990 THB per cc/);
  assert.ok(mediaSet("fillercheck-2612-card", dec));
  assert.ok(!mediaSet("fillercheck-2612-card", jan));
});

test("'เช็กฟิลเลอร์' → card with โปรแกรม wording; button takes a seat; no banned words", async () => {
  for (const [u, t] of [["UFC_1", "เช็กฟิลเลอร์"], ["UFC_2", "สนใจฟิลเลอร์ค่ะ"]] as const) {
    const s = J((await handleEvent(msg(u, t), dec, DEFAULTS))?.messages);
    assert.match(s, /8,990 บาท \/ cc/, t);
    assert.match(s, /โปรแกรมฉีดฟิลเลอร์/, t);
    assert.doesNotMatch(s, /ดีที่สุด|การันตี|100%|ถาวร|ไม่เจ็บ|เห็นผลทันที|เชี่ยวชาญ|ชำนาญ|หายขาด/);
  }
  const got = await handleEvent(msg("UFC_1", "ขอรับสิทธิ์เช็กฟิลเลอร์ 8,990 ค่ะ"), dec, DEFAULTS);
  assert.match(J(got?.messages), /จาก 20 เป็นของคุณแล้ว/);
  assert.equal(await seatsUsed(p, dec), 1);
});
