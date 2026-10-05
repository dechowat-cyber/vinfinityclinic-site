import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { slotsFor, book, availableSlots, SlotTakenError, reschedule, takenFor } from "../lib/booking";
import { upsertClientByLine, ensureLead, recordConsent, consentState } from "../lib/crm";
import { q } from "../lib/db";
import { bkk, thaiDate } from "../lib/time";

const now = new Date("2026-10-04T03:00:00Z"); // Sun 10:00 Bangkok

test("slots follow hours, Tuesday closed, lead time", () => {
  const sun = slotsFor("2026-10-04", DEFAULTS, new Set(), DEFAULTS.doctors[0], now);
  assert.equal(sun[0].time, "10:00");
  assert.equal(sun.at(-1)!.time, "18:30");
  assert.equal(sun.find((s) => s.time === "11:30")!.available, false); // < 2h from now
  assert.equal(sun.find((s) => s.time === "12:00")!.available, true);
  assert.deepEqual(slotsFor("2026-10-06", DEFAULTS, new Set(), DEFAULTS.doctors[0], now), []); // Tuesday
  assert.equal(thaiDate(bkk("2026-10-05", "14:00")), "วันจันทร์ 5 ต.ค. 2569");
});

test("booking locks a slot, double booking rejected, reschedule frees old slot", async () => {
  const c1 = await upsertClientByLine("U1", { displayName: "A" }, "web");
  const c2 = await upsertClientByLine("U2", { displayName: "B" });
  await ensureLead(c1.id, "web", "ใต้ตา");
  const start = bkk("2026-10-05", "14:00").toISOString();
  const id = await book({ clientId: c1.id, startIso: start, s: DEFAULTS, now });
  assert.ok(id > 0);
  await assert.rejects(book({ clientId: c2.id, startIso: start, s: DEFAULTS, now }), SlotTakenError);
  const lead = await q("select status from leads where client_id = $1", [c1.id]);
  assert.equal(lead[0].status, "Consult-Booked");
  const slots = await availableSlots("2026-10-05", DEFAULTS, undefined, now);
  assert.equal(slots.find((s) => s.time === "14:00")!.available, false);
  const newId = await reschedule(id, c1.id, bkk("2026-10-05", "15:00").toISOString(), DEFAULTS, now);
  const taken = await takenFor("2026-10-05");
  assert.equal(taken.size, 1);
  assert.ok(newId !== id);
  await assert.rejects(book({ clientId: c2.id, startIso: bkk("2026-10-06", "14:00").toISOString(), s: DEFAULTS, now }), /outside_hours/);
});

test("consent keeps latest decision per type", async () => {
  const c = await upsertClientByLine("U3");
  assert.deepEqual(await consentState(c.id), { data: undefined, marketing: undefined });
  await recordConsent(c.id, "data", true, "v1");
  await recordConsent(c.id, "marketing", true, "v1");
  await recordConsent(c.id, "marketing", false, "v1");
  assert.deepEqual(await consentState(c.id), { data: true, marketing: false });
});
