"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "./db";
import { requireStaff } from "./session";
import { push } from "./line";
import { logTouch } from "./crm";

const ROLES = ["BM", "AD", "CS", "MK"];

async function finish(id: number, staffId: number, status: "sent" | "copied" | "dismissed") {
  const d = await one("update agent_drafts set status = $2, done_at = now(), done_by = $3 where id = $1 and status = 'pending' returning client_id", [id, status, staffId]);
  if (d && status !== "dismissed")
    await q(`update leads set replied_at = now(), status = case when status = 'New' then 'Contacted' else status end, owner_staff_id = coalesce(owner_staff_id, $2)
      where id = (select id from leads where client_id = $1 order by id desc limit 1)`, [d.client_id, staffId]);
  return d;
}

/** Sends the (possibly edited) draft from the system: one push, counts against the OA quota. */
export async function sendDraft(fd: FormData) {
  const me = await requireStaff(ROLES);
  const id = Number(fd.get("id"));
  const body = String(fd.get("body") || "").trim().slice(0, 1800);
  const d = await one("select d.id, c.id client_id, c.line_user_id from agent_drafts d join clients c on c.id = d.client_id where d.id = $1 and d.status = 'pending'", [id]);
  if (!d || !body || !d.line_user_id) redirect("/staff/leads?agent=gone#agent");
  try {
    await push(d.line_user_id, [{ type: "text", text: body }], `draft:${id}`);
  } catch (e) {
    redirect(`/staff/leads?agent=${encodeURIComponent(/429|quota|limit/i.test((e as Error).message) ? "quota" : "fail")}#agent`);
  }
  await q("update agent_drafts set body = $2 where id = $1", [id, body]);
  await finish(id, me.id, "sent");
  await logTouch(Number(d.client_id), "out", "message", body, me.name);
  revalidatePath("/staff/leads");
}

/** The team sent it in LINE OA Manager (free); just record that it was answered. */
export async function doneDraft(fd: FormData) {
  const me = await requireStaff(ROLES);
  await finish(Number(fd.get("id")), me.id, "copied");
  revalidatePath("/staff/leads");
}

export async function dismissDraft(fd: FormData) {
  const me = await requireStaff(ROLES);
  await finish(Number(fd.get("id")), me.id, "dismissed");
  revalidatePath("/staff/leads");
}

/** The team sent the running promo to this client in LINE OA Manager chat (free); recorded for the promo's results. */
export async function promoSent(fd: FormData) {
  const me = await requireStaff(ROLES);
  const id = Number(fd.get("client"));
  const key = String(fd.get("key") || "");
  if (id && key && !(await one("select 1 from touchpoints where client_id = $1 and kind in ('promo','promo_manual') and body = $2", [id, key])))
    await logTouch(id, "out", "promo_manual", key, me.name);
  revalidatePath("/staff/leads");
}
