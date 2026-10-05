import { test } from "node:test";
import assert from "node:assert/strict";
import { upsertClientByLine, recordConsent } from "../lib/crm";
import { recordPayment } from "../lib/payments";
import { topUp, payWithWallet, balance, creditsFor, reverseForVoid, expireWallets } from "../lib/wallet";
import { afterPayment, spend12m } from "../lib/loyalty";
import { createEvent, rsvp } from "../lib/events";
import { totals } from "../lib/finance";
import { q, one } from "../lib/db";
import { todayBkk } from "../lib/time";

test("wallet: top-up, tier, pay with wallet (not counted twice), cashback, void rules, expiry", async () => {
  const c = await upsertClientByLine("UWAL1", {});
  const day = todayBkk(), before = await totals(day, day);
  const t = await topUp({ clientId: c.id, pkg: "gold", method: "transfer", staffId: 1 });
  assert.equal(await balance(c.id), 82_500);
  assert.equal((await afterPayment(c.id, new Date(), t.id))!.to, "gold");
  assert.equal((await creditsFor(t.id)).cashback, 0); // no credit back on a top-up
  const w = await payWithWallet({ clientId: c.id, amount: 10_000, staffId: 1 });
  assert.equal(await balance(c.id), 72_500);
  assert.equal(await spend12m(c.id), 75_000); // wallet use is not new money
  assert.equal((await creditsFor(w.id)).cashback, 0);
  await assert.rejects(payWithWallet({ clientId: c.id, amount: 100_000, staffId: 1 }), /wallet_low/);
  const cash = await recordPayment({ clientId: c.id, amount: 10_000, method: "cash", staffId: 1 });
  assert.equal((await creditsFor(cash.id)).cashback, 400); // gold 4%
  assert.equal((await creditsFor(cash.id)).cashback, 0); // once per payment
  assert.equal(await balance(c.id), 72_900);
  const after = await totals(day, day);
  assert.equal(after.total - before.total, 85_000); // 75k top-up + 10k cash; the 10k wallet use is not money received
  await assert.rejects(reverseForVoid(t.id, 1), /wallet_used/); // top-up partly used
  await reverseForVoid(w.id, 1); // voiding a wallet receipt gives the credit back
  assert.equal(await balance(c.id), 82_900);
  await q("update clients set wallet_expires_at = now() - interval '1 day' where id = $1", [c.id]);
  assert.equal(await expireWallets(), 1);
  assert.equal(await balance(c.id), 0);
});

test("V Circle: both get 1,000 when the friend first pays 5,000+, only once", async () => {
  const a = await upsertClientByLine("UREF_A", {}), b = await upsertClientByLine("UREF_B", {});
  await q("update clients set referred_by = $2 where id = $1", [b.id, a.id]);
  const small = await recordPayment({ clientId: b.id, amount: 1_000, method: "cash", staffId: 1 });
  assert.equal((await creditsFor(small.id)).referral, false);
  const p = await recordPayment({ clientId: b.id, amount: 6_000, method: "cash", staffId: 1 });
  assert.equal((await creditsFor(p.id)).referral, true);
  const p2 = await recordPayment({ clientId: b.id, amount: 6_000, method: "cash", staffId: 1 });
  assert.equal((await creditsFor(p2.id)).referral, false);
  assert.equal(await balance(a.id), 1_000); assert.equal(await balance(b.id), 1_000);
});

test("Circle Talk: seats in reply order, then waiting list", async () => {
  const m1 = await upsertClientByLine("UEV1", {}), m2 = await upsertClientByLine("UEV2", {});
  for (const m of [m1, m2]) { await recordConsent(m.id, "marketing", true, "t"); await q("update clients set tier = 'gold', followed = true where id = $1", [m.id]); }
  const { event } = await createEvent({ title: "Circle Talk", detail: "ทดสอบ", startsAt: new Date(Date.now() + 7 * 864e5), capacity: 1, minTier: "gold", staffId: 1 });
  assert.equal((await rsvp(Number(event.id), m1.id, true)).status, "going");
  assert.equal((await rsvp(Number(event.id), m2.id, true)).status, "waitlist");
  assert.equal((await rsvp(Number(event.id), m1.id, false)).status, "declined");
  const outsider = await upsertClientByLine("UEV3", {});
  assert.equal((await rsvp(Number(event.id), outsider.id, true)).status, "not_invited");
  // m1 gave up the seat → m2 moved up from the waiting list
  assert.equal((await one("select status from event_rsvps where event_id = $1 and client_id = $2", [event.id, m2.id]))!.status, "going");
});
