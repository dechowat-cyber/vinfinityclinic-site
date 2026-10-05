import { q, one } from "./db";
import { parts } from "./time";

// Revenue closes the CRM loop: every baht received is recorded against the client (and the plan when there
// is one), so the funnel can be measured from first contact to money, per channel.
// This records receipts for the clinic's own books; it is not a tax invoice.

export const METHODS: Record<string, string> = { transfer: "โอน", qr: "QR พร้อมเพย์", cash: "เงินสด", card: "บัตร", wallet: "Vinfinity Wallet" };
/** money actually received (Wallet use is paid out of a top-up already counted) */
export const CASH_METHODS = ["transfer", "qr", "cash", "card"];
/** who may take money / who may void */
export const CASHIER_ROLES = ["BM", "FD", "CS"];
export const VOID_ROLES = ["BM"];

/** RC6910-0001: Buddhist year (2 digits) + month + running number in that month. */
export async function nextReceiptNo(now = new Date()) {
  const [y, m] = parts(now).date.split("-");
  const prefix = `RC${String(Number(y) + 543).slice(-2)}${m}-`;
  const last = await one("select receipt_no from payments where receipt_no like $1 order by receipt_no desc limit 1", [`${prefix}%`]);
  const n = last ? Number(String(last.receipt_no).slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

export async function recordPayment(o: { clientId: number; planId?: number | null; amount: number; method: string; note?: string; staffId: number | null; now?: Date }) {
  const amount = Math.round(Number(o.amount) * 100) / 100;
  if (!(amount > 0) || amount > 10_000_000) throw new Error("bad_amount");
  if (!METHODS[o.method]) throw new Error("bad_method");
  if (!(await one("select id from clients where id = $1", [o.clientId]))) throw new Error("no_client");
  const planId = o.planId || null;
  if (planId && !(await one("select id from plans where id = $1 and client_id = $2", [planId, o.clientId]))) throw new Error("bad_plan");
  // two cashiers at once can race for the same number: retry on the unique index
  for (let i = 0; i < 5; i++) {
    const no = await nextReceiptNo(o.now);
    try {
      const row = await one(`insert into payments(receipt_no, client_id, plan_id, amount, method, note, received_by${o.now ? ", created_at" : ""})
        values ($1,$2,$3,$4,$5,$6,$7${o.now ? ",$8" : ""}) returning id, receipt_no`,
        [no, o.clientId, planId, amount, o.method, (o.note || "").slice(0, 300) || null, o.staffId, ...(o.now ? [o.now.toISOString()] : [])]);
      return { id: Number(row!.id), receiptNo: String(row!.receipt_no) };
    } catch (e) {
      if (!/unique|duplicate/i.test((e as Error).message)) throw e;
    }
  }
  throw new Error("receipt_busy");
}

/** Voids keep the row (and its number) so the books never have gaps. */
export async function voidPayment(id: number, reason: string, staffId: number) {
  if (!reason.trim()) throw new Error("reason_required");
  const row = await one("update payments set voided_at = now(), voided_by = $2, void_reason = $3 where id = $1 and voided_at is null returning client_id",
    [id, staffId, reason.trim().slice(0, 300)]);
  return row ? Number(row.client_id) : null;
}

/** plan id -> amount paid (voids excluded) */
export async function paidByPlan(clientId: number) {
  const rows = await q("select plan_id, sum(amount)::float as paid from payments where client_id = $1 and voided_at is null and plan_id is not null group by plan_id", [clientId]);
  return new Map(rows.map((r) => [Number(r.plan_id), Number(r.paid)]));
}

export async function clientRevenue(clientId: number) {
  const r = await one("select coalesce(sum(amount), 0)::float as total, count(*)::int as n, min(created_at) as first_at from payments where client_id = $1 and voided_at is null and method <> 'wallet'", [clientId]);
  return { total: Number(r!.total), count: Number(r!.n), firstAt: r!.first_at as string | null };
}

export const baht = (n: number) => `${Number(n).toLocaleString("th-TH", { maximumFractionDigits: 2 })} บาท`;
