"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "./db";
import { requireStaff } from "./session";
import { push } from "./line";
import { logTouch } from "./crm";
import { draftFromForm, reportReadyMsg } from "./faceReport";

const DOCTORS = ["BM", "DR"];

export async function saveFaceReport(fd: FormData) {
  await requireStaff(DOCTORS);
  const id = Number(fd.get("id"));
  await q("update face_reports set report = $2, status = case when status in ('waiting_doctor','drafting') then 'drafting' else status end, updated_at = now() where id = $1",
    [id, JSON.stringify(draftFromForm(fd))]);
  revalidatePath(`/staff/face-reports/${id}`);
  if (fd.get("preview")) redirect(`/api/staff/face-report/${id}`);
}

export async function sendFaceReport(fd: FormData) {
  const me = await requireStaff(DOCTORS);
  const id = Number(fd.get("id"));
  const r = await one(`select f.*, c.line_user_id, c.name, c.display_name from face_reports f join clients c on c.id = f.client_id where f.id = $1`, [id]);
  if (!r || !r.report?.summary || !r.line_user_id) return;
  await push(r.line_user_id, [reportReadyMsg(id, r.line_user_id, r.name || r.display_name)]);
  await q("update face_reports set status = 'sent', sent_by = $2, sent_at = now(), updated_at = now() where id = $1", [id, me.id]);
  await logTouch(r.client_id, "out", "face_report_sent", String(id));
  revalidatePath(`/staff/face-reports/${id}`);
  revalidatePath("/staff/face-reports");
}

export async function closeFaceReport(fd: FormData) {
  await requireStaff(DOCTORS);
  await q("update face_reports set status = 'cancelled', updated_at = now() where id = $1", [Number(fd.get("id"))]);
  revalidatePath("/staff/face-reports");
}
