import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { getClientByLine, upsertClientByLine } from "../lib/crm";
import { recordPayment } from "../lib/payments";
import { creditsFor, balance } from "../lib/wallet";
import { ensureRefCode } from "../lib/source";
import { q, one } from "../lib/db";
import { REF_EVENT, refEventActive, referralBoard } from "../lib/referral";
import { campaignMessages } from "../lib/segments";
import { mediaImages, mediaSet } from "../lib/campaignMedia";
import { promoKb } from "../lib/promos";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
process.env.APP_URL = "https://app.test";
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const J = (x: unknown) => JSON.stringify(x ?? null);
const inEvent = new Date("2026-11-20T05:00:00Z");
const before = new Date("2026-11-02T05:00:00Z");

test("event window 3 Nov – 15 Dec; น้องวิน knows it only while it runs", () => {
  assert.ok(!refEventActive(before));
  assert.ok(refEventActive(inEvent));
  assert.ok(!refEventActive(new Date("2026-12-15T17:00:01Z")));
  assert.match(promoKb(inEvent), /1500 THB/);
  assert.doesNotMatch(promoKb(before), /1500 THB/);
});

test("'ชวนเพื่อน' → own link + progress; friend arrives with the code → welcome naming the inviter, once", async () => {
  await handleEvent(msg("URF_A", "สวัสดีค่ะ"), inEvent, DEFAULTS);
  const share = await handleEvent(msg("URF_A", "ชวนเพื่อน"), inEvent, DEFAULTS);
  const a = (await getClientByLine("URF_A"))!;
  const code = await ensureRefCode(a.id);
  assert.match(J(share?.messages), new RegExp(`/r/ref_${code}`));
  assert.match(J(share?.messages), /0\/3/);
  await q("update clients set name = 'แนน ทดสอบ' where id = $1", [a.id]);
  const w = await handleEvent(msg("URF_B", `สวัสดีค่ะ สนใจปรึกษาคุณหมอ (รหัสแนะนำ ${code})`), inEvent, DEFAULTS);
  assert.match(J(w?.messages), /สิทธิ์เพื่อนใหม่/);
  assert.match(J(w?.messages), /คุณแนน ชวนคุณมา/);
  const b = (await getClientByLine("URF_B"))!;
  assert.equal(Number((await one("select referred_by from clients where id = $1", [b.id]))!.referred_by), Number(a.id));
  const again = await handleEvent(msg("URF_B", `สวัสดีค่ะ สนใจปรึกษาคุณหมอ (รหัสแนะนำ ${code})`), inEvent, DEFAULTS);
  assert.doesNotMatch(J(again?.messages), /สิทธิ์เพื่อนใหม่/);
});

test("a client who already paid cannot be bound to a code", async () => {
  const a = await upsertClientByLine("URF_C", {}); const code = await ensureRefCode(a.id);
  const old = await upsertClientByLine("URF_OLD", {});
  await recordPayment({ clientId: old.id, amount: 3_000, method: "cash", staffId: 1 });
  const r = await handleEvent(msg("URF_OLD", `สวัสดีค่ะ สนใจปรึกษาคุณหมอ (รหัสแนะนำ ${code})`), inEvent, DEFAULTS);
  assert.doesNotMatch(J(r?.messages), /สิทธิ์เพื่อนใหม่/);
  assert.equal((await one("select referred_by from clients where id = $1", [old.id]))!.referred_by, null);
});

test("during the event the inviter gets 1,500, the friend 1,000; 3 paid friends → one pending reward", async () => {
  const a = await upsertClientByLine("URF_M", {});
  for (let i = 0; i < 3; i++) {
    const f = await upsertClientByLine(`URF_F${i}`, {});
    await q("update clients set referred_by = $2 where id = $1", [f.id, a.id]);
    const p = await recordPayment({ clientId: f.id, amount: 8_000, method: "cash", staffId: 1 });
    const r = await creditsFor(p.id, inEvent);
    assert.equal(r.referral, true);
    assert.equal((r as any).referrerAmount, 1_500);
    assert.equal((r as any).milestone, i === 2);
    assert.equal(await balance(f.id), 1_000);
  }
  assert.equal(await balance(a.id), 4_500);
  const w = await one("select status, reward from referral_rewards where client_id = $1 and event_key = $2", [a.id, REF_EVENT.key]);
  assert.equal(w?.status, "pending"); assert.equal(w?.reward, "Vitaran 1 cc");
  const board = await referralBoard();
  assert.ok(board.some((r) => Number(r.id) === Number(a.id) && r.paid === 3 && r.reward === "pending"));
});

test("launch broadcast: text + generic invite card; its button asks for the person's own link", () => {
  const set = mediaSet("friends-2611", inEvent)!;
  assert.deepEqual(mediaImages(set), ["invite:friends"]);
  assert.equal(mediaSet("friends-2611", before), null);
  const m = campaignMessages("U1", { message: set.message, with_booking: false, campaign_id: 9, images: ["invite:friends"] });
  assert.equal(m[0].type, "text");
  assert.match(J(m[1]), /friends-2611\/1-1x1\.jpg/);
  assert.match(J(m[1]), /"text":"ชวนเพื่อน"/);
});

test("Sculptra last places ride along: invite card says how many are left, the friend gets the claim card", async () => {
  const d = new Date("2026-11-05T05:00:00Z");
  await handleEvent(msg("URF_S", "สวัสดีค่ะ"), d, DEFAULTS);
  const share = await handleEvent(msg("URF_S", "ชวนเพื่อน"), d, DEFAULTS);
  assert.match(J(share?.messages), /สิทธิ์สุดท้าย/);
  const s = (await getClientByLine("URF_S"))!; const code = await ensureRefCode(s.id);
  const w = await handleEvent(msg("URF_SF", `สวัสดีค่ะ สนใจปรึกษาคุณหมอ (รหัสแนะนำ ${code})`), d, DEFAULTS);
  assert.match(J(w?.messages), /สิทธิ์เพื่อนใหม่/);
  assert.match(J(w?.messages), /กดรับสิทธิ์/);
  assert.match(J(w?.messages), /🔥 เหลืออีก \d+ สิทธิ์/);
});

test("broadcast can leave out an audience (promo seat holders)", async () => {
  const { narrowBody } = await import("../lib/line");
  const b: any = narrowBody([{ type: "text", text: "x" }], { excludeAudience: 123 });
  assert.deepEqual(b.recipient, { type: "operator", not: { type: "audience", audienceGroupId: 123 } });
  assert.equal(b.filter, undefined); assert.equal(b.limit, undefined);
});

test("day-7 invite: only when recovery went fine, at most once in 60 days", async () => {
  const { referralNudge, nudgeEligible } = await import("../lib/referral");
  const { logTouch } = await import("../lib/crm");
  assert.match(J(referralNudge(inEvent)), /1,500 บาท/);
  assert.match(J(referralNudge(new Date("2026-12-20T05:00:00Z"))), /1,000 บาท เมื่อเพื่อนมาทำ"/);
  const ok = await upsertClientByLine("URF_N1", {}), bad = await upsertClientByLine("URF_N2", {});
  const done = new Date("2026-11-13T05:00:00Z");
  assert.equal(await nudgeEligible(ok.id, done, inEvent), true);
  await q("insert into care_requests(client_id, created_at) values ($1, $2)", [bad.id, "2026-11-14T05:00:00Z"]);
  assert.equal(await nudgeEligible(bad.id, done, inEvent), false);
  await logTouch(ok.id, "out", "ref_nudge", "1", "system");
  assert.equal(await nudgeEligible(ok.id, done, new Date()), false);
});

test("event funnel counts link requests and friends who came in", async () => {
  const { referralStats } = await import("../lib/referral");
  const s = await referralStats(new Date());
  assert.ok(s.asked >= 2 && s.friends >= 2);
});
