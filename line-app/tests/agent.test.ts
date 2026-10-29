import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { detectLang, templateDraft, draftFor, nudgeTick, pendingDrafts, leadLangStats } from "../lib/agent";
import { getClientByLine } from "../lib/crm";
import { q } from "../lib/db";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
delete process.env.ANTHROPIC_API_KEY; delete process.env.AI_GATEWAY_API_KEY; delete process.env.VERCEL;
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const wed11 = new Date("2026-10-28T04:00:00Z");

test("language from the message script", () => {
  assert.equal(detectLang("สนใจฟิลเลอร์ใต้ตาค่ะ"), "th");
  assert.equal(detectLang("Hi, how much is lip filler?"), "en");
  assert.equal(detectLang("你好，我想咨询玻尿酸"), "zh");
  assert.equal(detectLang("こんにちは"), "ja");
  assert.equal(detectLang("ສະບາຍດີ"), "lo");
  assert.equal(detectLang("ok"), null);
  assert.equal(detectLang("สวัสดีค่ะ filler price"), "th");
});

test("template drafts never quote a price and offer the free times", () => {
  const t = templateDraft({ lang: "en", kind: "reply", name: "Lee", slots: ["2026-10-29T06:00:00.000Z"], link: "https://x/b" });
  assert.match(t, /Hello Lee/); assert.match(t, /https:\/\/x\/b/); assert.doesNotMatch(t, /฿|baht|\d,\d{3}/i);
  assert.match(templateDraft({ lang: "th", kind: "nudge", slots: [], link: "L" }), /ยังสนใจ/);
});

test("a foreign lead writes → draft in English, language saved; ack gets no draft; one pending per person", async () => {
  await handleEvent(msg("UAG1", "Hello, I would like to ask about tear trough filler"), wed11, DEFAULTS);
  const c = (await getClientByLine("UAG1"))!;
  const id = await draftFor(c.id, "reply", wed11, DEFAULTS);
  assert.ok(id);
  const d = (await q("select * from agent_drafts where id = $1", [id]))[0];
  assert.deepEqual([d.lang, d.engine, d.status], ["en", "template", "pending"]);
  assert.equal((await getClientByLine("UAG1"))!.language, "en");
  const id2 = await draftFor(c.id, "reply", wed11, DEFAULTS);
  assert.equal((await q("select count(*)::int n from agent_drafts where client_id = $1 and status = 'pending'", [c.id]))[0].n, 1);
  assert.notEqual(id, id2);
  await handleEvent(msg("UAG2", "ขอบคุณค่ะ"), wed11, DEFAULTS);
  assert.equal(await draftFor((await getClientByLine("UAG2"))!.id, "reply", wed11, DEFAULTS), null);
  assert.ok((await pendingDrafts()).some((x) => Number(x.client_id) === c.id));
  assert.ok((await leadLangStats(wed11)).some((x) => x.lang === "en"));
});

test("proactive nudge: answered lead quiet for a day, no booking → one follow-up draft, not repeated", async () => {
  await handleEvent(msg("UAG3", "สนใจ Vitaran ค่ะ"), wed11, DEFAULTS);
  const c = (await getClientByLine("UAG3"))!;
  await q("update leads set last_inbound_at = $2, replied_at = $3 where client_id = $1", [c.id, "2026-10-27T04:00:00Z", "2026-10-27T04:10:00Z"]);
  const later = new Date("2026-10-28T05:00:00Z");
  assert.ok((await nudgeTick(later)) >= 1);
  const d = (await q("select kind from agent_drafts where client_id = $1 and status = 'pending'", [c.id]))[0];
  assert.equal(d.kind, "nudge");
  assert.equal(await nudgeTick(later), 0);
});
