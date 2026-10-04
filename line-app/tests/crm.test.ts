import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { upsertClientByLine, recordConsent } from "../lib/crm";
import { recordPayment, voidPayment, paidByPlan, clientRevenue, nextReceiptNo } from "../lib/payments";
import { syncRecalls, recallTick, recallList, lapsedClients } from "../lib/recall";
import { funnel, periodKpis, periodRange } from "../lib/reports";
import { q, one } from "../lib/db";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
const catId = async (code: string) => Number((await one("select id from catalog where code = $1", [code]))!.id);
const treat = async (clientId: number, code: string, iso: string) =>
  Number((await one("insert into treatments(client_id, catalog_id, name, done_at) select $1, id, name, $3 from catalog where code = $2 returning id", [clientId, code, iso]))!.id);

test("payments: running receipt numbers per month, plan balance, voids keep the number", async () => {
  const c = await upsertClientByLine("UPAY1", {});
  const plan = Number((await one("insert into plans(client_id, items, subtotal, total) values ($1, '[]', 20000, 20000) returning id", [c.id]))!.id);
  const oct = new Date("2026-10-10T05:00:00Z");
  const a = await recordPayment({ clientId: c.id, planId: plan, amount: 5000, method: "transfer", staffId: 1, now: oct });
  const b = await recordPayment({ clientId: c.id, planId: plan, amount: 7000.5, method: "cash", staffId: 1, now: oct });
  assert.equal(a.receiptNo, "RC6910-0001");
  assert.equal(b.receiptNo, "RC6910-0002");
  assert.equal(await nextReceiptNo(new Date("2026-11-01T01:00:00Z")), "RC6911-0001"); // new month (Bangkok time)
  assert.equal((await paidByPlan(c.id)).get(plan), 12000.5);
  await assert.rejects(recordPayment({ clientId: c.id, amount: 0, method: "cash", staffId: 1 }), /bad_amount/);
  await assert.rejects(recordPayment({ clientId: c.id, amount: 10, method: "crypto", staffId: 1 }), /bad_method/);
  const other = await upsertClientByLine("UPAY2", {});
  await assert.rejects(recordPayment({ clientId: other.id, planId: plan, amount: 10, method: "cash", staffId: 1 }), /bad_plan/);
  await assert.rejects(voidPayment(b.id, " ", 1), /reason_required/);
  assert.equal(await voidPayment(b.id, "ลงยอดซ้ำ", 1), c.id);
  assert.equal(await voidPayment(b.id, "again", 1), null); // already void
  assert.deepEqual([(await paidByPlan(c.id)).get(plan), (await clientRevenue(c.id)).total], [5000, 5000]);
  assert.equal(await nextReceiptNo(oct), "RC6910-0003"); // void does not free its number
});

test("recall: newest treatment wins, LINE only with marketing consent and switch on, booking closes it", async () => {
  const s = { ...DEFAULTS, recallAuto: true, recallLeadDays: 7 };
  const a = await upsertClientByLine("UREC1", {});
  const b = await upsertClientByLine("UREC2", {});
  await recordConsent(a.id, "marketing", true, "v1");
  await recordConsent(b.id, "marketing", false, "v1");
  const old = await treat(a.id, "SKB", "2026-08-01T05:00:00Z");
  const newer = await treat(a.id, "SKB", "2026-09-10T05:00:00Z"); // due 2026-10-08 (28 days)
  await treat(b.id, "SKB", "2026-09-10T05:00:00Z");
  await treat(a.id, "CONSULT", "2026-09-10T05:00:00Z"); // no recall_days
  const now = new Date("2026-10-03T04:00:00Z"); // 11:00 BKK, 5 days before due
  await syncRecalls(now);
  assert.equal(await one("select id from recalls where treatment_id = $1", [old]), null);
  assert.equal((await q("select * from recalls where client_id = $1", [a.id])).length, 1);
  assert.equal(String((await one("select due_on::text d from recalls where treatment_id = $1", [newer]))!.d), "2026-10-08");
  assert.equal(await recallTick(now, s), 1); // a gets LINE, b is on the call list
  assert.equal(await recallTick(now, s), 0); // once a day
  const st = await q("select c.line_user_id u, r.status from recalls r join clients c on c.id = r.client_id where r.client_id = any($1::bigint[]) order by c.line_user_id", [[a.id, b.id]]);
  assert.deepEqual(st.map((r) => r.status), ["sent", "due"]);
  assert.ok((await recallList(now)).some((r) => Number(r.client_id) === b.id));
  // a books → booked; b gets the treatment again → superseded
  await q("insert into appointments(client_id, doctor, start_at, end_at, created_at) values ($1,'DR','2026-10-09T05:00:00Z','2026-10-09T05:30:00Z','2026-10-04T05:00:00Z')", [a.id]);
  await treat(b.id, "SKB", "2026-10-05T05:00:00Z");
  await syncRecalls(new Date("2026-10-05T06:00:00Z"));
  assert.equal((await one("select status from recalls where treatment_id = $1", [newer]))!.status, "booked");
  const bRows = await q("select status from recalls where client_id = $1 order by id", [b.id]);
  assert.deepEqual(bRows.map((r) => r.status), ["superseded", "due"]);
});

test("recall LINE stays off until the manager switches it on", async () => {
  const c = await upsertClientByLine("UREC3", {});
  await recordConsent(c.id, "marketing", true, "v1");
  await treat(c.id, "TOX", "2026-06-10T05:00:00Z"); // due 2026-10-08
  const r = await recallTick(new Date("2026-10-06T04:00:00Z"), { ...DEFAULTS, recallAuto: false });
  assert.equal(r, 0);
  assert.equal((await one("select r.status from recalls r where r.client_id = $1", [c.id]))!.status, "due");
});

test("lapsed list and funnel by source through to revenue", async () => {
  const now = new Date("2026-10-20T05:00:00Z");
  const gone = await upsertClientByLine("ULAP1", {});
  await treat(gone.id, "CONSULT", "2026-02-01T05:00:00Z");
  assert.ok((await lapsedClients(now, 180)).some((c) => Number(c.id) === gone.id));

  const mk = async (u: string, src: string) => { const c = await upsertClientByLine(u, {}); await q("update clients set source = $2, created_at = '2026-12-03T05:00:00Z' where id = $1", [c.id, src]); return c.id; };
  const f1 = await mk("UF1", "fb"), f2 = await mk("UF2", "fb"), f3 = await mk("UF3", "fb"), g1 = await mk("UF4", "gbp");
  for (const [i, id] of [f1, f2, g1].entries()) await q("insert into appointments(client_id, doctor, start_at, end_at, status, arrived_at) values ($1,'DR',$2,$2,'done',$2)", [id, `2026-12-05T0${i + 2}:00:00Z`]);
  await treat(f1, "SKB", "2026-12-05T06:00:00Z"); await treat(f1, "SKB", "2026-12-20T06:00:00Z");
  await treat(g1, "DOUBLO", "2026-12-05T06:00:00Z");
  await recordPayment({ clientId: f1, amount: 6000, method: "cash", staffId: 1, now: new Date("2026-12-05T07:00:00Z") });
  await recordPayment({ clientId: g1, amount: 22222, method: "card", staffId: 1, now: new Date("2026-12-05T07:00:00Z") });
  const rows = await funnel("2026-12-01", "2027-01-01");
  const fb = rows.find((r) => r.src === "fb")!, gbp = rows.find((r) => r.src === "gbp")!;
  assert.deepEqual([fb.clients, fb.booked, fb.arrived, fb.treated, fb.paid, fb.repeat, fb.revenue], [3, 2, 2, 1, 1, 1, 6000]);
  assert.deepEqual([gbp.clients, gbp.paid, gbp.revenue], [1, 1, 22222]);
  void f3;
  const k = await periodKpis("2026-12-01", "2027-01-01");
  assert.equal(k.revenue, 28222);
  assert.equal(k.payers, 2);
  assert.equal(k.newRevenue, 28222);
  assert.deepEqual(periodRange("last", new Date("2026-01-15T05:00:00Z")), ["2025-12-01", "2026-01-01"]);
});
