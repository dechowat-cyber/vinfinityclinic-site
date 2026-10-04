import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { upsertClientByLine, recordConsent } from "../lib/crm";
import { parseSource, deepLink } from "../lib/source";
import { deriveSource, recordVisit } from "../lib/attribution";
import { mergeClients, possibleDuplicates, duplicateGroups } from "../lib/identity";
import { segmentCounts, segmentMembers, createCampaign, campaignResults, filtersFrom, filtersQuery } from "../lib/segments";
import { enqueueConversions, sendConversions, sha256, metaEvent } from "../lib/capi";
import { recordPayment } from "../lib/payments";
import { q, one } from "../lib/db";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
const msg = (u: string, text: string) => ({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", text } });
const mon10 = new Date("2026-10-05T03:00:00Z");

test("web visit → LINE message code → client gets the ad channel", async () => {
  assert.equal(deriveSource({ gclid: "abc" }), "gads");
  assert.equal(deriveSource({ utm_source: "facebook", utm_medium: "paid_social" }), "fbads");
  assert.equal(deriveSource({ utm_source: "ig" }), "ig");
  assert.equal(deriveSource({ ttclid: "x" }), "ttads");
  assert.equal(deriveSource({ referrer: "https://www.google.co.th/" }), "seo");
  assert.equal(deriveSource({}), "web");
  const { code, src } = await recordVisit("K7M2QX", { utm_source: "facebook", utm_medium: "cpc", utm_campaign: "tear-trough-oct", fbclid: "FBCLID1", landing: "/filler/" });
  assert.deepEqual([code, src], ["K7M2QX", "fbads"]);
  assert.match(decodeURIComponent(deepLink("web", undefined, code)), /\(จากเว็บไซต์ #K7M2QX\)/);
  assert.deepEqual(parseSource("สวัสดีค่ะ สนใจปรึกษาคุณหมอ (จากเว็บไซต์ #K7M2QX)"), { source: "web", visitCode: "K7M2QX" });
  assert.deepEqual(parseSource("สวัสดีค่ะ สนใจปรึกษาคุณหมอ (จากเว็บไซต์)"), { source: "web" });
  await handleEvent(msg("UWEB1", "สวัสดีค่ะ สนใจปรึกษาคุณหมอ (จากเว็บไซต์ #K7M2QX)"), mon10, DEFAULTS);
  const c = await one("select c.id, c.source, l.source as lsrc from clients c join leads l on l.client_id = c.id where c.line_user_id = 'UWEB1'");
  assert.deepEqual([c!.source, c!.lsrc], ["fbads", "fbads"]);
  assert.equal(Number((await one("select client_id from web_visits where code = 'K7M2QX'"))!.client_id), Number(c!.id));
  // a code can only be claimed once
  await handleEvent(msg("UWEB2", "สวัสดีค่ะ (จากเว็บไซต์ #K7M2QX)"), mon10, DEFAULTS);
  assert.equal((await one("select source from clients where line_user_id = 'UWEB2'"))!.source, "web");
});

test("merge: walk-in by phone + LINE client become one, history moves, LINE id kept", async () => {
  const line = await upsertClientByLine("UMRG1", { displayName: "Ploy" });
  const walk = Number((await one("insert into clients(name, phone, source) values ('พลอย', '+66 81 999 8888', 'walkin') returning id"))!.id);
  await q("update clients set phone = '081-999-8888' where id = $1", [line.id]);
  await q("insert into appointments(client_id, doctor, start_at, end_at, status) values ($1,'DR','2026-10-06T03:00:00Z','2026-10-06T03:30:00Z','done')", [walk]);
  await recordPayment({ clientId: walk, amount: 5000, method: "cash", staffId: 1 });
  await q("insert into leads(client_id, source) values ($1, 'walkin')", [walk]); // both have an open lead
  await q("insert into leads(client_id, source) values ($1, 'line')", [line.id]);
  assert.deepEqual((await possibleDuplicates(line.id)).map((d) => Number(d.id)), [walk]);
  assert.ok((await duplicateGroups()).some((g) => g.length === 2 && g.some((c) => Number(c.id) === walk)));
  await mergeClients(line.id, walk, 1);
  assert.equal(await one("select id from clients where id = $1", [walk]), null);
  const p = await one("select line_user_id, name, phone from clients where id = $1", [line.id]);
  assert.deepEqual([p!.line_user_id, p!.name, p!.phone], ["UMRG1", "พลอย", "081-999-8888"]);
  assert.equal((await one("select count(*)::int n from appointments where client_id = $1", [line.id]))!.n, 1);
  assert.equal((await one("select sum(amount)::int n from payments where client_id = $1", [line.id]))!.n, 5000);
  assert.equal((await one("select count(*)::int n from leads where client_id = $1 and status not in ('Lost','Consult-Booked')", [line.id]))!.n, 1);
  assert.ok(await one("select id from client_merges where secondary_id = $1", [walk]));
  const other = await upsertClientByLine("UMRG2", {});
  await q("update clients set phone = '0819998888' where id = $1", [other.id]);
  await assert.rejects(mergeClients(line.id, other.id, 1), /two_line_accounts/);
});

test("segments: filters, reachability needs marketing consent, campaign sends and measures", async () => {
  const mk = async (u: string, consent: boolean, spend: number, lastIso: string) => {
    const c = await upsertClientByLine(u, {});
    await recordConsent(c.id, "marketing", consent, "v1");
    await q("insert into treatments(client_id, catalog_id, name, done_at) select $1, id, name, $2 from catalog where code = 'SKB'", [c.id, lastIso]);
    if (spend) await recordPayment({ clientId: c.id, amount: spend, method: "transfer", staffId: 1, now: new Date(lastIso) });
    return c.id;
  };
  const a = await mk("USEG1", true, 30000, "2026-01-10T05:00:00Z");
  const b = await mk("USEG2", false, 30000, "2026-01-10T05:00:00Z");
  const c = await mk("USEG3", true, 1000, "2026-09-20T05:00:00Z");
  const now = new Date("2026-10-05T05:00:00Z");
  const f = filtersFrom((k) => ({ lapsed: "180", min_spend: "20000" } as Record<string, string>)[k] ?? null, () => []);
  assert.deepEqual(f, { lapsedDays: 180, minSpend: 20000 });
  assert.equal(filtersQuery(f), "lapsed=180&min_spend=20000");
  const ids = (await segmentMembers(f, now)).map((m) => Number(m.id));
  assert.ok(ids.includes(a) && ids.includes(b) && !ids.includes(c));
  const n = await segmentCounts({ ...f }, now);
  assert.ok(n.reachable >= 1 && n.reachable < n.total);
  const camp = await createCampaign({ name: "ชวนกลับ", filters: f, message: "คิดถึงค่ะ", withBooking: true, staffId: 1, now });
  const rec = await q("select client_id, sent_at from campaign_recipients where campaign_id = $1", [camp.id]);
  assert.ok(rec.every((r) => r.sent_at) && rec.some((r) => Number(r.client_id) === a) && !rec.some((r) => Number(r.client_id) === b));
  await q("insert into appointments(client_id, doctor, start_at, end_at) values ($1,'DR', now() + interval '3 days', now() + interval '3 days 30 minutes')", [a]);
  const res = (await campaignResults()).find((r) => Number(r.id) === camp.id)!;
  assert.equal(res.booked, 1);
  await assert.rejects(createCampaign({ name: "x", filters: { minSpend: 99999999 }, message: "hi", withBooking: false, staffId: 1 }), /no_recipients/);
});

test("conversion API: hashed, consent-gated, idempotent", async () => {
  assert.deepEqual(await sendConversions(new Date()), { sent: 0, skipped: 0, platforms: [] }); // nothing configured
  const now = new Date("2026-10-05T05:00:00Z");
  const yes = await upsertClientByLine("UCAPI1", {});
  const no = await upsertClientByLine("UCAPI2", {});
  await recordConsent(yes.id, "marketing", true, "v1");
  await q("update clients set phone = '0812345678' where id = $1", [yes.id]);
  await recordVisit("CAPX22", { fbclid: "FBX", utm_source: "facebook", utm_medium: "cpc" });
  await q("update web_visits set client_id = $1 where code = 'CAPX22'", [yes.id]);
  for (const id of [yes.id, no.id]) await recordPayment({ clientId: id, amount: 1500, method: "card", staffId: 1, now: new Date("2026-10-04T05:00:00Z") });
  await enqueueConversions(now); await enqueueConversions(now);
  assert.equal((await one("select count(*)::int n from conversions where event = 'purchase' and client_id = any($1::bigint[])", [[yes.id, no.id]]))!.n, 2);
  process.env.META_PIXEL_ID = "123"; process.env.META_CAPI_TOKEN = "tok";
  const calls: any[] = [];
  const r = await sendConversions(now, async (url, init) => { calls.push({ url, body: JSON.parse(String(init.body)) }); return { ok: true, status: 200, text: async () => "" }; });
  delete process.env.META_PIXEL_ID; delete process.env.META_CAPI_TOKEN;
  assert.ok(r.sent >= 1 && r.skipped >= 1);
  const purchase = calls.map((c) => c.body.data[0]).find((d) => d.event_name === "Purchase" && d.user_data.ph);
  assert.equal(purchase.user_data.ph[0], sha256("66812345678"));
  assert.match(purchase.user_data.fbc, /^fb\.1\.\d+\.FBX$/);
  assert.deepEqual(purchase.custom_data, { currency: "THB", value: 1500 });
  assert.equal(purchase.action_source, "physical_store");
  assert.equal((await one("select status from conversions where event_id like 'purchase:%' and client_id = $1", [no.id]))!.status, "skipped_consent");
  assert.equal(metaEvent({ event_id: "lead:1", event: "lead", value: null, event_at: now.toISOString() }, { phone: null, ext: "vf-1" }).custom_data, undefined);
});
