import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { activePromos, promoByKey, promoKb } from "../lib/promos";
import { mediaSet } from "../lib/campaignMedia";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
process.env.APP_URL = "https://app.test";
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const J = (x: unknown) => JSON.stringify(x ?? null);
const day = new Date("2026-11-18T05:00:00Z"), dec = new Date("2026-12-01T05:00:00Z");

test("EM Lift early bird runs 15–30 Nov and answers the keyword with image + price, no outcome claims", async () => {
  const p = promoByKey("emlift-2611")!;
  assert.ok(activePromos(day).includes(p));
  assert.ok(!activePromos(dec).includes(p));
  assert.ok(mediaSet("emlift-2611", day));
  assert.match(promoKb(day), /4,500 THB per area per session/);
  for (const [u, t] of [["UEM_1", "EM Lift"], ["UEM_2", "สนใจ em lift ค่ะ"], ["UEM_3", "early bird"]] as const) {
    const s = J((await handleEvent(msg(u, t), day, DEFAULTS))?.messages);
    assert.match(s, /emlift-2611/, t);
    assert.match(s, /4,500/, t);
    assert.doesNotMatch(s, /ดีที่สุด|การันตี|100%|ถาวร|ไม่เจ็บ|เห็นผลทันที|ไม่ต้องพักฟื้น/);
  }
});
