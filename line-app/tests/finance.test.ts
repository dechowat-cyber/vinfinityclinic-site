import { test } from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import jpeg from "jpeg-js";
import { upsertClientByLine } from "../lib/crm";
import { parseSlipQr, readQr, captureSlip, confirmSlip, rejectSlip } from "../lib/slips";
import { recordPayment } from "../lib/payments";
import { totals, saveDayClose, dailyReport, weekStart, monthStart } from "../lib/finance";
import { financeReport } from "../lib/tick";
import { DEFAULTS } from "../lib/settings";
import { q, one } from "../lib/db";
import { todayBkk } from "../lib/time";

const REF = "202610051234567890ABCDE12";
const PAYLOAD = `0048000600000101030140225${REF}5102TH9104ABCD`;

/** A JPEG with the slip QR drawn on a white page, like a bank slip screenshot. */
function slipJpeg(text: string) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const size = qr.modules.size, scale = 8, pad = 40, W = size * scale + pad * 2, H = W + 200;
  const buf = Buffer.alloc(W * H * 4, 255);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (qr.modules.get(x, y))
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const i = ((pad + y * scale + dy) * W + (pad + x * scale + dx)) * 4; buf[i] = buf[i + 1] = buf[i + 2] = 0;
    }
  return jpeg.encode({ data: buf, width: W, height: H }, 90).data;
}

test("slip QR: parse the bank mini-QR and read it from a JPEG", () => {
  assert.deepEqual(parseSlipQr(PAYLOAD), { ref: REF, bank: "014" });
  assert.equal(parseSlipQr("https://example.com"), null);
  assert.equal(readQr(slipJpeg(PAYLOAD)), PAYLOAD);
});

test("slips: QR slip queued once, same slip again flagged duplicate, plain photo ignored, confirm issues a receipt", async () => {
  const c = await upsertClientByLine("USLIP", {});
  const plain = jpeg.encode({ data: Buffer.alloc(64 * 64 * 4, 200), width: 64, height: 64 }, 80).data;
  assert.equal(await captureSlip(c.id, { data: plain, mime: "image/jpeg" }), null); // owes nothing, no QR
  assert.equal(await captureSlip(c.id, { data: slipJpeg(PAYLOAD), mime: "image/jpeg" }), "slip");
  assert.equal(await captureSlip(c.id, { data: slipJpeg(PAYLOAD), mime: "image/jpeg" }), "duplicate");
  // owing money: a photo without QR is still offered to the cashier
  await q("insert into plans(client_id, goal, items, total, status) values ($1,'t','[]',5000,'sent')", [c.id]);
  assert.equal(await captureSlip(c.id, { data: plain, mime: "image/jpeg" }), "slip");
  const [s1, s2] = await q("select id from slips where client_id = $1 and status = 'pending' order by id", [c.id]);
  const pay = await confirmSlip(Number(s1.id), { amount: 5000, planId: null, staffId: 1 });
  assert.ok(pay.receiptNo.startsWith("RC"));
  await assert.rejects(confirmSlip(Number(s1.id), { amount: 5000, planId: null, staffId: 1 }), /slip_done/);
  await rejectSlip(Number(s2.id), 1);
  assert.equal((await one("select status from slips where id = $1", [s2.id]))!.status, "rejected");
});

test("finance: totals by method, close diff in the 19:00 report, week starts Monday", async () => {
  assert.equal(weekStart("2026-10-05"), "2026-10-05"); // Monday
  assert.equal(weekStart("2026-10-11"), "2026-10-05"); // Sunday
  assert.equal(monthStart("2026-10-05"), "2026-10-01");
  const c = await upsertClientByLine("UFIN", {});
  const day = todayBkk();
  const before = await totals(day, day);
  await recordPayment({ clientId: c.id, amount: 12000, method: "card", staffId: 1 });
  await recordPayment({ clientId: c.id, amount: 3000, method: "cash", staffId: 1 });
  const t = await totals(day, day);
  assert.equal(t.by.card.amt - (before.by.card?.amt ?? 0), 12000);
  await saveDayClose(day, t.by.card.amt, t.by.cash.amt - 200, "ทอนผิด", 1);
  const text = await dailyReport();
  assert.ok(text.includes("เครื่องรูดบัตร") && text.includes("ตรง ✓"), text);
  assert.ok(text.includes("ขาด 200"), text);
  assert.ok(text.includes("สัปดาห์นี้") && text.includes("เดือนนี้"));
  assert.equal(await financeReport(new Date(), { ...DEFAULTS, execGroupId: null }), 0); // no management group → nothing sent
});
