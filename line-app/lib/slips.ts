import jpeg from "jpeg-js";
import jsQR from "jsqr";
import { q, one } from "./db";
import { recordPayment } from "./payments";

// Thai bank transfer slips carry a small QR (bank "slip verification" mini-QR). Its payload holds the bank
// code and the transaction reference, which is enough to recognise a slip and to catch the same slip twice.
// The amount is NOT in the QR: a person confirms it before a receipt is issued.

/** TLV fields of an EMV-style QR payload. */
function tlv(s: string) {
  const out: Record<string, string> = {};
  let i = 0;
  while (i + 4 <= s.length) {
    const tag = s.slice(i, i + 2), len = Number(s.slice(i + 2, i + 4));
    if (!Number.isFinite(len)) break;
    out[tag] = s.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return out;
}

export function parseSlipQr(text: string | null | undefined): { ref: string; bank: string | null } | null {
  if (!text || !/^00\d{2}/.test(text) || !text.includes("5102TH")) return null;
  const inner = tlv(tlv(text)["00"] ?? "");
  const ref = inner["02"];
  return ref ? { ref, bank: inner["01"] ?? null } : null;
}

export function readQr(img: Buffer): string | null {
  try {
    const raw = jpeg.decode(img, { useTArray: true, maxResolutionInMP: 40, maxMemoryUsageInMB: 512 });
    const r = jsQR(new Uint8ClampedArray(raw.data.buffer, raw.data.byteOffset, raw.data.length), raw.width, raw.height, { inversionAttempts: "dontInvert" });
    return r?.data ?? null;
  } catch { return null; }
}

/** Money this client still owes on recent plans (60 days). */
export async function outstanding(clientId: number) {
  const r = await one(`select coalesce(sum(greatest(p.total - coalesce((select sum(amount) from payments x where x.plan_id = p.id and x.voided_at is null), 0), 0)), 0)::float as due
    from plans p where p.client_id = $1 and p.created_at > now() - interval '60 days'`, [clientId]);
  return Number(r?.due ?? 0);
}

/**
 * Decides whether an image a client sent is a payment slip. A slip QR is decisive; without one, the image counts
 * only when the client owes money or is in the clinic today (so selfies and questions are left alone).
 */
const SLIP_PROMPT = `Is this image a Thai bank transfer / PromptPay payment slip (a receipt screenshot from a banking app)? Return ONLY JSON:
{"is_slip":true|false,"amount":number|null,"paid_at":"YYYY-MM-DD HH:MM"|null,"to_name":"receiver name"|null,"ref":"transaction ref"|null}
Dates on slips are often Buddhist era (2569 = 2026). Amount is the transferred amount, a plain number. Never guess a value you cannot read.`;

/** Reads amount / time / receiver from a slip image. null when the AI is not available. */
export async function readSlip(img: { data: Buffer; mime: string }) {
  const { askAI, jsonIn, AiUnavailable } = await import("./ai");
  try {
    const o = jsonIn(await askAI({ messages: [{ role: "user", content: SLIP_PROMPT }], images: [img], maxTokens: 300, fast: true }));
    if (!o) return null;
    const amount = Number(o.amount);
    return { isSlip: o.is_slip === true, amount: amount > 0 ? amount : null, paidAt: typeof o.paid_at === "string" ? o.paid_at.slice(0, 16) : null,
      toName: typeof o.to_name === "string" ? o.to_name.slice(0, 80) : null };
  } catch (e) {
    if (!(e instanceof AiUnavailable)) console.error("[slip] read", e);
    return null;
  }
}

export async function captureSlip(clientId: number, img: { data: Buffer; mime: string }, now = new Date()): Promise<"slip" | "duplicate" | null> {
  const qr = parseSlipQr(/jpe?g/i.test(img.mime) ? readQr(img.data) : null);
  let read: Awaited<ReturnType<typeof readSlip>> = null;
  if (!qr) {
    // a client in an active relationship: owes money, visited today, has a booking around now, or chatted recently
    const due = await outstanding(clientId);
    const active = await one(`select 1 where exists (select 1 from appointments where client_id = $1 and start_at between $2 and $3 and status not in ('cancelled'))
      or exists (select 1 from leads where client_id = $1 and last_inbound_at > $4)`,
      [clientId, new Date(now.getTime() - 3 * 864e5).toISOString(), new Date(now.getTime() + 45 * 864e5).toISOString(), new Date(now.getTime() - 14 * 864e5).toISOString()]);
    if (due <= 0 && !active) return null;
    read = await readSlip(img);
    if (read && !read.isSlip) return null; // the AI says it is a photo, not a slip: leave it alone
  } else read = await readSlip(img);
  if (qr && (await one("select id from slips where qr_ref = $1 and status <> 'duplicate'", [qr.ref]))) {
    await q("insert into slips(client_id, mime, data, qr_ref, bank, status) values ($1,$2,$3,null,$4,'duplicate')", [clientId, img.mime, img.data, qr.bank]);
    return "duplicate";
  }
  await q("insert into slips(client_id, mime, data, qr_ref, bank, amount_read, paid_at_read, to_name_read) values ($1,$2,$3,$4,$5,$6,$7,$8)",
    [clientId, img.mime, img.data, qr?.ref ?? null, qr?.bank ?? null, read?.amount ?? null, read?.paidAt ?? null, read?.toName ?? null]);
  return "slip";
}

export async function confirmSlip(id: number, o: { amount: number; planId: number | null; staffId: number; method?: string }) {
  const s = await one("select id, client_id, qr_ref, status from slips where id = $1", [id]);
  if (!s || s.status !== "pending") throw new Error("slip_done");
  const pay = await recordPayment({ clientId: Number(s.client_id), planId: o.planId, amount: o.amount, method: o.method ?? "transfer",
    note: `สลิป #${id}${s.qr_ref ? ` ref ${String(s.qr_ref).slice(-8)}` : ""}`, staffId: o.staffId });
  await q("update slips set status = 'confirmed', payment_id = $2, decided_by = $3, decided_at = now() where id = $1", [id, pay.id, o.staffId]);
  return pay;
}

export async function rejectSlip(id: number, staffId: number) {
  await q("update slips set status = 'rejected', decided_by = $2, decided_at = now() where id = $1 and status in ('pending','duplicate')", [id, staffId]);
}
