"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyStaff } from "./notify";
import { q, one } from "./db";
import { requireStaff } from "./session";
import { getSettings, saveSettings, ClinicSettings } from "./settings";
import { book, setStatus, SlotTakenError } from "./booking";
import { ensureLead, logTouch, recordConsent } from "./crm";
import { bkk } from "./time";
import { confirmStaffGroup } from "./webhook";
import { installRichMenu } from "./line";
import { richMenuDefinition } from "./richmenu";
import fs from "node:fs/promises";
import path from "node:path";

const STATUS_TS: Record<string, "confirmed_at" | "arrived_at" | null> = { confirmed: "confirmed_at", arrived: "arrived_at" };

export async function apptStatus(fd: FormData) {
  const me = await requireStaff();
  const id = Number(fd.get("id")), status = String(fd.get("status"));
  if (!["booked", "confirmed", "arrived", "in_consult", "done", "cancelled", "no_show"].includes(status)) return;
  await setStatus(id, status, STATUS_TS[status] ?? null);
  const a = await one("select client_id from appointments where id = $1", [id]);
  if (a) await logTouch(a.client_id, "out", `staff_${status}`, `by ${me.name}`, "staff");
  revalidatePath("/staff"); revalidatePath("/staff/appointments");
}

/** FR-18: walk-in quick add (arrives now). */
export async function walkIn(fd: FormData) {
  const me = await requireStaff(["BM", "FD", "CS", "AD"]);
  const name = String(fd.get("name") || "").trim(), phone = String(fd.get("phone") || "").replace(/[^\d+]/g, "");
  const interest = String(fd.get("interest") || "").trim() || null;
  if (!name) return;
  const s = await getSettings();
  const existing = phone ? await one("select * from clients where phone = $1 order by id limit 1", [phone]) : null;
  const c = existing ?? (await one("insert into clients(name, phone, source) values ($1,$2,'walkin') returning *", [name, phone || null]));
  await ensureLead(c!.id, "walkin", interest);
  // Verbal consent at the counter is logged; the written form is signed on the iPad in phase 2.
  if (fd.get("consent") === "on") await recordConsent(c!.id, "data", true, s.consentVersion, "frontdesk");
  const start = new Date(Math.ceil(Date.now() / 60000) * 60000);
  try {
    const id = await book({ clientId: c!.id, startIso: start.toISOString(), s, source: "walkin", note: interest, createdBy: me.name, skipRules: true });
    await setStatus(id, "arrived", "arrived_at");
  } catch (e) { if (!(e instanceof SlotTakenError)) throw e; }
  revalidatePath("/staff");
}

/** Booking made by staff for someone who called or messaged. */
export async function staffBook(fd: FormData): Promise<void> {
  const me = await requireStaff(["BM", "FD", "CS", "AD"]);
  const name = String(fd.get("name") || "").trim(), phone = String(fd.get("phone") || "").replace(/[^\d+]/g, "");
  const date = String(fd.get("date")), time = String(fd.get("time"));
  if (!name || !date || !time) return;
  const s = await getSettings();
  const existing = phone ? await one("select * from clients where phone = $1 order by id limit 1", [phone]) : null;
  const c = existing ?? (await one("insert into clients(name, phone, source) values ($1,$2,'phone') returning *", [name, phone || null]));
  await ensureLead(c!.id, String(fd.get("source") || "phone"), String(fd.get("interest") || "") || null);
  try {
    await book({ clientId: c!.id, startIso: bkk(date, time).toISOString(), s, source: String(fd.get("source") || "phone"), createdBy: me.name, skipRules: true });
  } catch (e) {
    if (e instanceof SlotTakenError) throw new Error("เวลานี้มีนัดแล้ว เลือกเวลาอื่น");
    throw e;
  }
  revalidatePath("/staff/appointments"); revalidatePath("/staff");
}

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Consult-Booked", "Nurture", "Lost"];
export async function leadUpdate(fd: FormData) {
  const me = await requireStaff(["BM", "AD", "CS"]);
  const id = Number(fd.get("id"));
  const status = String(fd.get("status") || "");
  if (fd.get("replied")) {
    await q("update leads set replied_at = now(), status = case when status = 'New' then 'Contacted' else status end, owner_staff_id = coalesce(owner_staff_id, $2) where id = $1", [id, me.id]);
  } else if (LEAD_STATUSES.includes(status)) {
    await q(`update leads set status = $2, lost_reason = $3, owner_staff_id = coalesce(owner_staff_id, $4),
        nurture_started_at = case when $2 = 'Nurture' and status <> 'Nurture' then now() when $2 <> 'Nurture' then null else nurture_started_at end,
        nurture_step = case when $2 = 'Nurture' and status <> 'Nurture' then 0 else nurture_step end where id = $1`,
      [id, status, status === "Lost" ? String(fd.get("lost_reason") || "ไม่ระบุ") : null, me.id]);
  }
  revalidatePath("/staff/leads");
}

export async function saveClinic(fd: FormData) {
  await requireStaff(["BM"]);
  const cur = await getSettings();
  const hours: ClinicSettings["hours"] = [0, 1, 2, 3, 4, 5, 6].map((d) =>
    fd.get(`closed_${d}`) === "on" ? null : { open: String(fd.get(`open_${d}`) || "10:00"), close: String(fd.get(`close_${d}`) || "19:00") });
  await saveSettings({
    hours,
    slotMinutes: Math.max(10, Number(fd.get("slotMinutes")) || cur.slotMinutes),
    consultMinutes: Math.max(10, Number(fd.get("consultMinutes")) || cur.consultMinutes),
    leadHours: Math.max(0, Number(fd.get("leadHours")) || 0),
    horizonDays: Math.min(90, Math.max(1, Number(fd.get("horizonDays")) || cur.horizonDays)),
    doctors: String(fd.get("doctors") || "").split("\n").map((x) => x.trim()).filter(Boolean),
    closedDates: String(fd.get("closedDates") || "").split(/[\s,]+/).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)),
    phone: String(fd.get("phone") || cur.phone),
  });
  revalidatePath("/staff/settings");
}

export async function useStaffGroup() {
  await requireStaff(["BM"]);
  const gid = await confirmStaffGroup();
  if (gid) {
    // confirmation in the group itself, so the team sees the link works
    const waiting = (await q("select count(*)::int n from staff where not active and role <> 'OFF'"))[0]?.n ?? 0;
    const base = process.env.APP_URL || "";
    await notifyStaff(`✅ เชื่อมกลุ่มนี้กับระบบหน้าร้าน Vinfinity แล้ว\nกลุ่มนี้จะได้รับแจ้งเตือน: แชทรอตอบ · เคสขอให้หมอดู · นัดพรุ่งนี้ · พนักงานใหม่รออนุมัติ (ไม่มีข้อมูลสุขภาพลูกค้า)\nเข้าระบบ: ${base}/staff${waiting ? `\n\n👤 ตอนนี้มีพนักงานรออนุมัติ ${waiting} คน · ${base}/staff/team` : ""}`).catch(() => {});
  }
  revalidatePath("/staff/settings");
}

export async function setupRichMenu() {
  await requireStaff(["BM"]);
  let result = "ok";
  try {
    const img = await fs.readFile(path.join(process.cwd(), "public", "richmenu.jpg"));
    const users = (await q("select line_user_id from clients where line_user_id is not null")).map((r) => String(r.line_user_id));
    const id = await installRichMenu(richMenuDefinition(), img, "image/jpeg", (await getSettings()).richMenuId, users);
    await saveSettings({ richMenuId: id, richMenuAt: new Date().toISOString() } as Partial<ClinicSettings>);
    console.info("[richmenu] installed", id, "unlinked", users.length);
  } catch (e) {
    console.error("[richmenu] install failed", e);
    result = (e as Error).message.slice(0, 120);
  }
  revalidatePath("/staff/settings");
  redirect(`/staff/settings?rm=${encodeURIComponent(result)}#richmenu`);
}

export async function staffUpdate(fd: FormData) {
  const me = await requireStaff(["BM"]);
  const id = Number(fd.get("id"));
  const active = fd.getAll("active").includes("off") ? false : fd.get("active") === "on";
  if (id === me.id && !active) return; // a manager cannot lock themselves out
  await q("update staff set role = $2, active = $3 where id = $1", [id, String(fd.get("role")), active]);
  revalidatePath("/staff/team");
}

/** One tap: approve a waiting staff member with the chosen role (or decline = keep locked and hide). */
export async function staffApprove(fd: FormData) {
  await requireStaff(["BM"]);
  const id = Number(fd.get("id"));
  if (fd.get("decline")) await q("update staff set active = false, role = 'OFF' where id = $1", [id]);
  else await q("update staff set role = $2, active = true where id = $1", [id, String(fd.get("role") || "AD")]);
  revalidatePath("/staff", "layout");
}

export async function useExecGroup() {
  await requireStaff(["BM"]);
  const cand = await one<{ value: { groupId: string } }>("select value from settings where key = 'candidate_group'");
  if (!cand) return;
  const s = await getSettings();
  if (cand.value.groupId === s.staffGroupId) return; // never the whole-team group
  await saveSettings({ execGroupId: cand.value.groupId });
  const { notifyExec } = await import("./notify");
  await notifyExec(`✅ เชื่อมกลุ่มนี้เป็นกลุ่มผู้บริหารของระบบหน้าร้าน Vinfinity แล้ว\nทุกวันเวลา 19:00 จะได้รับสรุปยอดรายวัน + ยอดสัปดาห์ + ยอดเดือน`).catch(() => {});
  revalidatePath("/staff/settings");
}
