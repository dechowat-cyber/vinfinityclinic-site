import { test } from "node:test";
import assert from "node:assert/strict";
import { linkToken, readLinkToken, bookUrl } from "../lib/link";
import { handleEvent } from "../lib/webhook";
import { DEFAULTS } from "../lib/settings";

test("personal link token round-trips, rejects tampering and expiry", () => {
  const t = linkToken("Uabc");
  assert.equal(readLinkToken(t), "Uabc");
  assert.equal(readLinkToken(t.replace("Uabc", "Uxyz")), null);
  assert.equal(readLinkToken(t, Date.now() + 46 * 86400_000), null);
  assert.equal(readLinkToken("junk"), null);
  process.env.APP_URL = "https://x.test";
  assert.match(bookUrl("Uabc", { view: "my" }), /^https:\/\/x\.test\/liff\?view=my&t=Uabc\./);
  assert.match(bookUrl(null), /line\.me\/R\/ti\/p\/@230eeqvl/);
});

test("rich menu postback replies with a personal booking link", async () => {
  const out = await handleEvent({ type: "postback", replyToken: "t", source: { type: "user", userId: "ULINK" }, postback: { data: "menu=book" } }, new Date("2026-10-05T05:00:00Z"), DEFAULTS);
  assert.ok(JSON.stringify(out).includes("t=ULINK."));
});
