"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "./session";
import { recordPayment, voidPayment, CASHIER_ROLES, VOID_ROLES } from "./payments";
import { setRecallStatus } from "./recall";
import { saveSettings } from "./settings";
import { logTouch } from "./crm";

/** Takes a payment at the counter and opens the receipt. */
export async function takePayment(fd: FormData) {
  const me = await requireStaff(CASHIER_ROLES);
  const clientId = Number(fd.get("client_id"));
  let r: { id: number; receiptNo: string };
  try {
    r = await recordPayment({ clientId, planId: Number(fd.get("plan_id")) || null, amount: Number(String(fd.get("amount") || "").replace(/,/g, "")),
      method: String(fd.get("method")), note: String(fd.get("note") || ""), staffId: me.id });
  } catch (e) {
    redirect(`/staff/clients/${clientId}?pay=${encodeURIComponent((e as Error).message)}#payments`);
  }
  await logTouch(clientId, "in", "payment", r.receiptNo, "frontdesk");
  const { redeemCode, afterPayment } = await import("./loyalty");
  const codeId = Number(fd.get("code_id"));
  if (codeId) await redeemCode(codeId, clientId, r.id, me.id).catch((e) => console.warn("[offer] redeem", e));
  await afterPayment(clientId).catch((e) => console.error("[tier]", e));
  revalidatePath(`/staff/clients/${clientId}`);
  redirect(`/staff/receipts/${r.id}`);
}

export async function voidPaymentAction(fd: FormData) {
  const me = await requireStaff(VOID_ROLES);
  const clientId = await voidPayment(Number(fd.get("id")), String(fd.get("reason") || ""), me.id).catch(() => null);
  if (clientId) revalidatePath(`/staff/clients/${clientId}`);
  redirect(clientId ? `/staff/clients/${clientId}#payments` : `/staff/receipts/${Number(fd.get("id"))}?void=reason`);
}

export async function recallAction(fd: FormData) {
  const me = await requireStaff();
  const status = String(fd.get("status")) as "contacted" | "dismissed" | "due";
  if (!["contacted", "dismissed", "due"].includes(status)) return;
  await setRecallStatus(Number(fd.get("id")), status, me.id, String(fd.get("note") || ""));
  revalidatePath("/staff/recall");
}

export async function saveRecallSettings(fd: FormData) {
  await requireStaff(["BM"]);
  await saveSettings({ recallAuto: fd.get("auto") === "on", recallLeadDays: Math.min(30, Math.max(0, Number(fd.get("lead")) || 7)) });
  revalidatePath("/staff/recall");
}

// ---- finance: slips + day close ----
export async function slipConfirm(fd: FormData) {
  const me = await requireStaff(CASHIER_ROLES);
  const { confirmSlip } = await import("./slips");
  const id = Number(fd.get("id"));
  try {
    await confirmSlip(id, { amount: Number(String(fd.get("amount") || "").replace(/,/g, "")), planId: Number(fd.get("plan_id")) || null, staffId: me.id, method: String(fd.get("method") || "transfer") });
    const s = await (await import("./db")).one("select client_id from slips where id = $1", [id]);
    if (s) await (await import("./loyalty")).afterPayment(Number(s.client_id)).catch((e) => console.error("[tier]", e));
  } catch (e) { redirect(`/staff/finance?err=${encodeURIComponent((e as Error).message)}`); }
  revalidatePath("/staff/finance");
}

export async function slipReject(fd: FormData) {
  const me = await requireStaff(CASHIER_ROLES);
  const { rejectSlip } = await import("./slips");
  await rejectSlip(Number(fd.get("id")), me.id);
  revalidatePath("/staff/finance");
}

export async function closeDay(fd: FormData) {
  const me = await requireStaff(CASHIER_ROLES);
  const { saveDayClose, totals, closeLine, dayClose } = await import("./finance");
  const { todayBkk } = await import("./time");
  const num = (k: string) => { const v = String(fd.get(k) ?? "").replace(/,/g, "").trim(); return v === "" ? null : Math.max(0, Number(v) || 0); };
  const day = todayBkk();
  await saveDayClose(day, num("edc"), num("cash"), String(fd.get("note") || ""), me.id);
  // the 19:00 report may already be out: send the close as a short follow-up to the management group
  const reported = await (await import("./db")).one("select 1 from jobs where key = $1", [`finreport:${day}`]);
  if (reported) {
    const { notifyExec } = await import("./notify");
    const t = await totals(day, day);
    await notifyExec(`🔒 ปิดยอดวันนี้แล้ว (${me.name ?? "พนักงาน"})\n${closeLine(await dayClose(day), t)}${String(fd.get("note") || "").trim() ? `\nหมายเหตุ: ${String(fd.get("note")).trim().slice(0, 200)}` : ""}`).catch(() => {});
  }
  revalidatePath("/staff/finance");
}

// ---- Vinfinity Circle: secret offers ----
export async function createOfferAction(fd: FormData) {
  const me = await requireStaff(["BM", "MK"]);
  const { createOffer } = await import("./loyalty");
  try {
    const r = await createOffer({ title: String(fd.get("title") || ""), detail: String(fd.get("detail") || ""),
      minTier: (["member", "silver", "gold", "platinum"].includes(String(fd.get("min_tier"))) ? String(fd.get("min_tier")) : "member") as any,
      lapsedDays: Number(fd.get("lapsed")) || null, validDays: Math.max(3, Math.min(90, Number(fd.get("valid")) || 30)), staffId: me.id });
    const { sendOfferBatch } = await import("./tick");
    await sendOfferBatch(60).catch(() => 0); // first batch now, the scheduler sends the rest
    revalidatePath("/staff/loyalty");
    redirect(`/staff/loyalty?ok=${r.recipients}`);
  } catch (e) {
    if ((e as any)?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    redirect(`/staff/loyalty?err=${encodeURIComponent((e as Error).message)}`);
  }
}

/** Manager sets a tier by hand (customers from before the system, Wallet holders): held 12 months, upgrade message sent. */
export async function setTierAction(fd: FormData) {
  await requireStaff(["BM"]);
  const id = Number(fd.get("client_id")), tier = String(fd.get("tier"));
  if (!["member", "silver", "gold", "platinum"].includes(tier)) return;
  const { q, one } = await import("./db");
  const { RANK, tierInfo } = await import("./loyalty");
  const cur = await one("select tier, line_user_id, followed from clients where id = $1", [id]);
  if (!cur) return;
  await q("update clients set tier = $2, tier_until = $3 where id = $1", [id, tier, tier === "member" ? null : new Date(Date.now() + 365 * 864e5).toISOString()]);
  if (RANK[tier as "gold"] > RANK[(cur.tier || "member") as "gold"] && cur.line_user_id && cur.followed) {
    const { push } = await import("./line");
    const M = await import("./messages");
    const t = tierInfo(tier);
    await push(cur.line_user_id, [M.tierUp(cur.line_user_id, t.name, t.perks)], `tier:${id}:${tier}:manual`).catch((e) => console.error("[tier] push", e));
  }
  revalidatePath(`/staff/clients/${id}`);
}
