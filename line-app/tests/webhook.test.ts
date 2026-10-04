import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { DEFAULTS } from "../lib/settings";
import { handleEvent, isOpen } from "../lib/webhook";
import { verifySignature } from "../lib/line";
import { book } from "../lib/booking";
import { getClientByLine, consentState, upsertClientByLine } from "../lib/crm";
import { q } from "../lib/db";
import { bkk } from "../lib/time";

process.env.LINE_CHANNEL_ACCESS_TOKEN = ""; // profile() must not call out
const open = new Date("2026-10-05T05:00:00Z"); // Mon 12:00
const night = new Date("2026-10-05T16:00:00Z"); // Mon 23:00
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });

test("signature check", () => {
  const body = '{"events":[]}', secret = "s3";
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64");
  assert.equal(verifySignature(body, sig, secret), true);
  assert.equal(verifySignature(body, "bad", secret), false);
  assert.equal(verifySignature(body, null, secret), false);
});

test("opening hours and Tuesday", () => {
  assert.equal(isOpen(DEFAULTS, open), true);
  assert.equal(isOpen(DEFAULTS, night), false);
  assert.equal(isOpen(DEFAULTS, new Date("2026-10-06T05:00:00Z")), false);
});

test("follow creates client and asks consent; consent postback stored", async () => {
  const out = await handleEvent({ type: "follow", replyToken: "t", source: { type: "user", userId: "UW1" } }, open, DEFAULTS);
  assert.ok(out && out.messages.length >= 1);
  const c = (await getClientByLine("UW1"))!;
  await handleEvent({ type: "postback", replyToken: "t", source: { type: "user", userId: "UW1" }, postback: { data: "consent=data&v=1" } }, open, DEFAULTS);
  assert.equal((await consentState(c.id)).data, true);
});

test("off-hours auto reply only once per 12h", async () => {
  const a = await handleEvent(msg("UW2", "สนใจฟิลเลอร์"), night, DEFAULTS);
  assert.ok(a);
  await q("update touchpoints set created_at = $1 where kind = 'off_hours'", [night.toISOString()]); // test clock
  const b = await handleEvent(msg("UW2", "ราคาเท่าไหร่"), new Date(night.getTime() + 600000), DEFAULTS);
  assert.notDeepEqual(b?.messages, a.messages);
  const n = await q("select count(*)::int n from touchpoints t join clients c on c.id=t.client_id where c.line_user_id='UW2' and t.kind='off_hours'");
  assert.equal(n[0].n, 1);
});

test("message marks lead waiting; appointment confirm postback", async () => {
  await handleEvent(msg("UW3", "อยากปรึกษา"), open, DEFAULTS);
  const l = await q("select last_inbound_at, replied_at from leads l join clients c on c.id=l.client_id where c.line_user_id='UW3'");
  assert.ok(l[0].last_inbound_at && !l[0].replied_at);
  const c = (await getClientByLine("UW3"))!;
  const id = await book({ clientId: c.id, startIso: bkk("2026-10-07", "11:00").toISOString(), s: DEFAULTS, now: open });
  const out = await handleEvent({ type: "postback", replyToken: "t", source: { type: "user", userId: "UW3" }, postback: { data: `appt=confirm&id=${id}` } }, open, DEFAULTS);
  assert.ok(out);
  const a = await q("select status from appointments where id=$1", [id]);
  assert.equal(a[0].status, "confirmed");
  // someone else's appointment cannot be confirmed
  const o = await upsertClientByLine("UW4", {});
  const out2 = await handleEvent({ type: "postback", replyToken: "t", source: { type: "user", userId: "UW4" }, postback: { data: `appt=confirm&id=${id}` } }, open, DEFAULTS);
  assert.ok(JSON.stringify(out2).includes("ไม่พบนัด") && o.id);
});
