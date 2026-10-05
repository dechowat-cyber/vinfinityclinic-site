import { test } from "node:test";
import assert from "node:assert/strict";
import { upsertClientByLine, recordConsent } from "../lib/crm";
import { recordPayment } from "../lib/payments";
import { tierFor, refreshTier, expireTiers, progress, createOffer, activeCodes, redeemCode, offerResults, newCode } from "../lib/loyalty";
import { q, one } from "../lib/db";

test("tier thresholds follow the Wallet tiers", () => {
  assert.equal(tierFor(0), "member"); assert.equal(tierFor(29_999), "member");
  assert.equal(tierFor(30_000), "silver"); assert.equal(tierFor(75_000), "gold"); assert.equal(tierFor(150_000), "platinum");
  assert.deepEqual(progress(50_000, "silver"), { next: "Gold", need: 25_000, pct: 67 });
  assert.equal(progress(200_000, "platinum"), null);
  assert.match(newCode(), /^VC-[A-HJ-NP-Z2-9]{6}$/);
});

test("upgrade at once, kept 12 months, then falls back to what the spend earns", async () => {
  const c = await upsertClientByLine("ULOY1", {});
  const t0 = new Date("2026-01-10T05:00:00Z");
  await recordPayment({ clientId: c.id, amount: 80_000, method: "card", staffId: 1, now: t0 });
  const r = await refreshTier(c.id, t0);
  assert.equal(r!.to, "gold"); assert.equal(r!.up, true);
  // 11 months later the payment still counts → still gold
  assert.equal((await refreshTier(c.id, new Date("2026-12-01T05:00:00Z")))!.to, "gold");
  // still qualifying on 1 Dec renewed the hold to Dec 2027: kept even though the spend has left the window
  assert.equal(await expireTiers(new Date("2027-02-15T05:00:00Z")), 0);
  // after that hold ends → back to what 12-month spend earns
  assert.equal(await expireTiers(new Date("2027-12-05T05:00:00Z")), 1);
  assert.equal((await one("select tier from clients where id = $1", [c.id]))!.tier, "member");
});

test("secret offer: only consenting followers of the tier get a code; code is personal and single use", async () => {
  const gold = await upsertClientByLine("ULOY2", {}), mem = await upsertClientByLine("ULOY3", {}), noConsent = await upsertClientByLine("ULOY4", {});
  for (const c of [gold, mem]) await recordConsent(c.id, "marketing", true, "t");
  await q("update clients set tier = 'gold', followed = true where id in ($1,$2)", [gold.id, noConsent.id]);
  await q("update clients set followed = true where id = $1", [mem.id]);
  const o = await createOffer({ title: "Gold · ทดสอบ", detail: "Aqua Peel ฟรี 1 ครั้ง", minTier: "gold", validDays: 30, staffId: 1 });
  const got = await q("select client_id from offer_codes where offer_id = $1", [o.id]);
  assert.deepEqual(got.map((r) => Number(r.client_id)), [gold.id]);
  const [code] = await activeCodes(gold.id);
  const pay = await recordPayment({ clientId: gold.id, amount: 5000, method: "cash", staffId: 1 });
  await assert.rejects(redeemCode(Number(code.id), mem.id, pay.id, 1), /code_invalid/); // someone else's code
  await redeemCode(Number(code.id), gold.id, pay.id, 1);
  await assert.rejects(redeemCode(Number(code.id), gold.id, pay.id, 1), /code_invalid/); // used once
  assert.equal((await activeCodes(gold.id)).length, 0);
  const res = (await offerResults()).find((x) => Number(x.id) === o.id)!;
  assert.equal(res.redeemed, 1); assert.equal(res.revenue, 5000);
});
