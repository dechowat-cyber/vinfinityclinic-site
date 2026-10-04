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
