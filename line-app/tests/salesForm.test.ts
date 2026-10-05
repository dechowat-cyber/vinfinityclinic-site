import { test } from "node:test";
import assert from "node:assert/strict";
import { parseReply, addRows, reconcile, importOct69, listManual } from "../lib/salesForm";
import { totals, dailyReport, salesTarget } from "../lib/finance";
import { upsertClientByLine } from "../lib/crm";
import { q } from "../lib/db";
import { bkk } from "../lib/time";

test("form reader: JSON reply becomes rows (money types mapped, bad rows dropped)", () => {
  const p = parseReply('```json\n{"kind":"sales_list","rows":[{"day":"2026-10-04","hn":"HN 126","amount":8000,"method":"โอน"},{"day":"4/10/69","amount":5,"method":"cash"},{"day":"2026-10-04","amount":0,"method":"cash"}]}\n```');
  assert.equal(p.kind, "sales_list");
  assert.deepEqual(p.rows!.map((r) => [r.day, r.method, r.amount]), [["2026-10-04", "transfer", 8000]]);
  assert.equal(parseReply("ไม่ใช่ฟอร์ม").kind, "other");
  const g = parseReply('{"kind":"daily_grid","grid":[{"day":"2026-10-03","seller":"ยุ","channel":"Line OA","amount":2000}]}');
  assert.equal(g.grid![0].amount, 2000);
});

test("October 2569 pre-bot form: 10,000 in the month, re-posting the form adds nothing, targets skip Tuesdays", async () => {
  const now = new Date("2026-10-04T12:30:00Z"); // 19:30 Bangkok, 4 Oct
  await importOct69();
  const m = await totals("2026-10-01", "2026-10-04");
  assert.equal(m.total, 10000);
  assert.equal(m.by.transfer.amt, 10000);
  assert.equal(m.manual.n, 3);
  // the same form posted again next day (read slightly differently) is not counted twice
  const again = await addRows([{ day: "2026-10-04", hn: "126", method: "transfer", amount: 8000, item: "Doublo 400 line" }], "form", null, null);
  assert.equal(again, 0);
  const tg = await salesTarget("2026-10-04");
  assert.equal(tg.day, 50000);
  assert.equal(tg.month, 27 * 50000); // October 2569 has 4 Tuesdays off → 1,350,000 as on the form
  const text = await dailyReport(now);
  assert.match(text, /เป้าเดือน 1,350,000/);
  assert.match(text, /คุณหมอ 8,000/);
  assert.match(text, /ฟอร์มพนักงาน 1 รายการ 8,000/);
});

test("re-check: a form row that is already a receipt in the system is counted once; receipts missing from the form are listed", async () => {
  const c = await upsertClientByLine("UFORM", {});
  await q(`insert into payments(receipt_no, client_id, amount, method, created_at) values ('T-1', $1, 3000, 'cash', $2)`, [c.id, bkk("2026-10-08", "11:00").toISOString()]);
  await q(`insert into payments(receipt_no, client_id, amount, method, created_at) values ('T-2', $1, 700, 'transfer', $2)`, [c.id, bkk("2026-10-08", "15:00").toISOString()]);
  await addRows([{ day: "2026-10-08", hn: "HN 7", method: "cash", amount: 3000 }, { day: "2026-10-08", hn: "HN 8", method: "card", amount: 1500 }], "form", null, null);
  const r = await reconcile("2026-10-08", "2026-10-08");
  assert.equal(r.matched, 1);
  assert.deepEqual(r.systemOnly, [{ day: "2026-10-08", amount: 700, method: "transfer" }]);
  const t = await totals("2026-10-08", "2026-10-08");
  assert.equal(t.total, 3000 + 700 + 1500); // cash once, transfer from the system, card from the form
  const rows = await listManual("2026-10-08", "2026-10-08");
  assert.equal(rows.filter((x: any) => x.payment_id).length, 1);
});
