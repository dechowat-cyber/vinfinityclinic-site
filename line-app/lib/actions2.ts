"use server";
import { revalidatePath } from "next/cache";
import { q, one } from "./db";
import { requireStaff } from "./session";
import { push } from "./line";
import { planCard, PlanItem } from "./messages";
import { logTouch } from "./crm";
import { saveSettings } from "./settings";
import { notifyStaff } from "./notify";

const CLINICAL = ["BM", "DR", "NS", "CS"];
const back = (clientId: number) => revalidatePath(`/staff/clients/${clientId}`);

/** FR-20: consult form, pre-filled from the pre-visit form. */
export async function saveConsult(fd: FormData) {
  const me = await requireStaff(CLINICAL);
  const clientId = Number(fd.get("client_id")), id = Number(fd.get("id")) || null;
  const v = ["concerns", "goals", "assessment", "notes"].map((k) => String(fd.get(k) || "").slice(0, 4000));
  if (id) await q("update consults set concerns=$2, goals=$3, assessment=$4, notes=$5, updated_at=now() where id=$1", [id, ...v]);
  else await q("insert into consults(client_id, appointment_id, concerns, goals, assessment, notes, created_by) values ($1,$2,$3,$4,$5,$6,$7)",
    [clientId, Number(fd.get("appointment_id")) || null, ...v, me.id]);
  back(clientId);
}

/** FR-22: plan from the catalog. Prices always come from the catalog; staff cannot type a price. */
export async function savePlan(fd: FormData) {
  const me = await requireStaff(CLINICAL);
  const clientId = Number(fd.get("client_id"));
  const raw: { catalog_id: number; qty: number }[] = JSON.parse(String(fd.get("items") || "[]"));
  const ids = raw.map((r) => Number(r.catalog_id)).filter(Boolean);
  const cat = ids.length ? await q("select id, name, unit, price from catalog where id = any($1::bigint[]) and active", [ids]) : [];
  const items: PlanItem[] = raw.flatMap((r) => {
    const c = cat.find((x) => Number(x.id) === Number(r.catalog_id));
    const qty = Math.max(1, Math.min(20, Number(r.qty) || 1));
    return c ? [{ catalog_id: Number(c.id), name: c.name, qty, unit: c.unit, unit_price: Number(c.price) }] : [];
  });
  if (!items.length) return;
  const subtotal = items.reduce((a, i) => a + i.unit_price * i.qty, 0);
  const discount = Math.max(0, Math.min(subtotal, Number(fd.get("discount")) || 0));
  // FR-22: any discount needs BM approval (A13); a BM's own discount is approved by them.
  const dStatus = discount === 0 ? "none" : me.role === "BM" ? "approved" : "pending";
  const validDays = Math.max(1, Math.min(90, Number(fd.get("valid_days")) || 30));
  const row = await one(`insert into plans(client_id, consult_id, goal, items, subtotal, discount, discount_status, discount_by, total, valid_until, created_by)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9, (now() at time zone 'Asia/Bangkok')::date + $10::int, $11) returning id`,
    [clientId, Number(fd.get("consult_id")) || null, String(fd.get("goal") || "").slice(0, 120), JSON.stringify(items), subtotal, discount, dStatus,
      dStatus === "approved" ? me.id : null, subtotal - discount, validDays, me.id]);
  if (dStatus === "pending") await notifyStaff(`💬 ขออนุมัติส่วนลดแผนการรักษา #${row!.id} (${discount.toLocaleString()} บาท) · BM อนุมัติได้ที่ ${process.env.APP_URL || ""}/staff/clients/${clientId}`);
  back(clientId);
}

export async function decideDiscount(fd: FormData) {
  const me = await requireStaff(["BM"]);
  const id = Number(fd.get("id")), ok = fd.get("ok") === "1";
  const p = await one(`update plans set discount_status = $2, discount_by = $3, total = case when $2 = 'approved' then subtotal - discount else subtotal end,
    discount = case when $2 = 'approved' then discount else 0 end where id = $1 and discount_status = 'pending' returning client_id`, [id, ok ? "approved" : "rejected", me.id]);
  if (p) back(p.client_id);
}

/** FR-23 (A09): one button sends the plan card to the client's LINE. */
export async function sendPlan(fd: FormData) {
  await requireStaff(CLINICAL);
  const p = await one("select p.*, c.line_user_id from plans p join clients c on c.id = p.client_id where p.id = $1", [Number(fd.get("id"))]);
  if (!p || p.discount_status === "pending" || !p.line_user_id) return;
  await push(p.line_user_id, [planCard(p as any, p.line_user_id)]);
  await q("update plans set status = case when status = 'draft' then 'sent' else status end, card_sent_at = now() where id = $1", [p.id]);
  await logTouch(p.client_id, "out", "plan_card", String(p.id), "line");
  back(p.client_id);
}

/** Records a treatment as done (starts aftercare, FR-32). Full treatment record with lot numbers is phase 2. */
export async function markDone(fd: FormData) {
  const me = await requireStaff(["BM", "DR", "NS"]);
  const clientId = Number(fd.get("client_id")), catId = Number(fd.get("catalog_id"));
  const c = await one("select id, name, aftercare_key from catalog where id = $1", [catId]);
  if (!c) return;
  await q("insert into treatments(client_id, plan_id, catalog_id, name, aftercare_key, done_by) values ($1,$2,$3,$4,$5,$6)",
    [clientId, Number(fd.get("plan_id")) || null, c.id, c.name, c.aftercare_key, me.id]);
  // the plan is done only when every item in it has been recorded
  const planId = Number(fd.get("plan_id")) || 0;
  if (planId) await q(`update plans p set status = 'done' where p.id = $1 and not exists (
      select 1 from jsonb_array_elements(p.items) i where not exists (
        select 1 from treatments t where t.plan_id = p.id and t.catalog_id = (i->>'catalog_id')::bigint))`, [planId]);
  await q("update appointments set status = 'done' where client_id = $1 and status in ('arrived','in_consult') ", [clientId]);
  back(clientId);
}

export async function ackCare(fd: FormData) {
  const me = await requireStaff(["BM", "DR", "NS"]);
  await q("update care_requests set ack_by = $2, ack_at = now(), status = $3 where id = $1", [Number(fd.get("id")), me.id, fd.get("close") ? "closed" : "in_review"]);
  revalidatePath("/staff/care");
}

export async function issueUpdate(fd: FormData) {
  await requireStaff(["BM", "DR"]);
  await q("update issues set status = $2, closed_at = case when $2 = 'closed' then now() else null end where id = $1", [Number(fd.get("id")), String(fd.get("status"))]);
  revalidatePath("/staff/care");
}

export async function openIssue(fd: FormData) {
  await requireStaff();
  const level = ["L1", "L2", "L3", "L4"].includes(String(fd.get("level"))) ? String(fd.get("level")) : "L1";
  const owner = { L1: "BM", L2: "DR", L3: "DR", L4: "BM" }[level];
  await q("insert into issues(client_id, level, source, summary, owner_role) values ($1,$2,'staff',$3,$4)",
    [Number(fd.get("client_id")) || null, level, String(fd.get("summary") || "").slice(0, 500), owner]);
  await notifyStaff(`📌 เปิดเรื่องใหม่ระดับ ${level} · ${process.env.APP_URL || ""}/staff/care`);
  revalidatePath("/staff/care");
}

export async function saveCatalog(fd: FormData) {
  await requireStaff(["BM"]);
  const id = Number(fd.get("id")) || null;
  const v = [String(fd.get("name") || "").trim(), String(fd.get("category") || ""), String(fd.get("unit") || "ครั้ง"), Math.max(0, Number(fd.get("price")) || 0),
    String(fd.get("aftercare_key") || "general"), fd.get("active") === "on", Math.max(0, Math.round(Number(fd.get("recall_days")) || 0)) || null];
  if (!v[0]) return;
  if (id) await q("update catalog set name=$2, category=$3, unit=$4, price=$5, aftercare_key=$6, active=$7, recall_days=$8, updated_at=now() where id=$1", [id, ...v]);
  else await q("insert into catalog(name, category, unit, price, aftercare_key, active, recall_days) values ($1,$2,$3,$4,$5,$6,$7)", v);
  revalidatePath("/staff/catalog");
}

export async function saveTemplate(fd: FormData) {
  await requireStaff(["BM", "DR", "NS"]);
  const key = String(fd.get("key")), day = Number(fd.get("day")), body = String(fd.get("body") || "").trim();
  if (!key || !body) return;
  await q("insert into aftercare_templates(key, day, body) values ($1,$2,$3) on conflict (key, day) do update set body = excluded.body, updated_at = now()", [key, day, body]);
  // any edit needs a fresh approval from the doctor
  await saveSettings({ aftercareApproved: false });
  revalidatePath("/staff/aftercare");
}

export async function approveAftercare(fd: FormData) {
  const me = await requireStaff(["DR", "BM"]);
  const on = fd.get("on") === "1";
  const { CARE_VERSION } = await import("./careCards");
  await saveSettings({ aftercareApproved: on, aftercareApprovedBy: on ? me.name : null, aftercareApprovedAt: on ? new Date().toISOString() : null, aftercareVersion: on ? CARE_VERSION : undefined });
  revalidatePath("/staff/aftercare");
}

export async function togglePause(fd: FormData) {
  await requireStaff(["BM"]);
  await saveSettings({ paused: fd.get("on") === "1" });
  revalidatePath("/staff/settings");
}


/** Saves all four days of one treatment type at once (only the ones that changed reset the approval). */
export async function saveTemplates(fd: FormData) {
  await requireStaff(["BM", "DR", "NS"]);
  const key = String(fd.get("key"));
  if (!key) return;
  let changed = false;
  for (const d of [0, 1, 3, 7]) {
    const body = String(fd.get(`body_${d}`) ?? "").trim();
    if (!body) continue;
    const r = await q("insert into aftercare_templates(key, day, body) values ($1,$2,$3) on conflict (key, day) do update set body = excluded.body, updated_at = now() where aftercare_templates.body <> excluded.body returning key", [key, d, body]);
    if (r.length) changed = true;
  }
  if (changed) await saveSettings({ aftercareApproved: false });
  revalidatePath("/staff/aftercare");
}
