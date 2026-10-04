"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q, one } from "./db";
import { requireStaff } from "./session";
import { HEALTH_ROLES, logHealthAccess } from "./health";
import { consentState } from "./crm";
import { startSession, autoPairs } from "./photos";

/** Opens a photo session and goes straight to the camera. FR-11: no photos without data consent. */
export async function startPhotoSession(fd: FormData) {
  const me = await requireStaff(HEALTH_ROLES);
  const clientId = Number(fd.get("client_id"));
  if ((await consentState(clientId)).data !== true) redirect(`/staff/clients/${clientId}?photo=consent`);
  const id = await startSession({ clientId, kind: String(fd.get("kind")), protocol: String(fd.get("protocol")), note: String(fd.get("note") || ""), staffId: me.id });
  await logHealthAccess(me.id, clientId, `photo_session_start:${id}`);
  redirect(`/staff/clients/${clientId}/capture?session=${id}`);
}

/** Locks the session: no more retakes, it becomes part of the record. */
export async function completePhotoSession(fd: FormData) {
  await requireStaff(HEALTH_ROLES);
  const id = Number(fd.get("id"));
  const s = await one("update photo_sessions set completed_at = coalesce(completed_at, now()) where id = $1 returning client_id, kind", [id]);
  if (!s) redirect("/staff/clients");
  revalidatePath(`/staff/clients/${s.client_id}`);
  // after / follow-up: open the before & after slider straight away, paired automatically
  if (s.kind !== "before" && (await autoPairs(Number(s.client_id))).some((p) => p.after.id === id)) redirect(`/staff/clients/${s.client_id}/compare?b=${id}`);
  redirect(`/staff/clients/${s.client_id}#photos`);
}

/** An empty session opened by mistake can be removed; sessions with photos stay in the record. */
export async function discardPhotoSession(fd: FormData) {
  await requireStaff(HEALTH_ROLES);
  const id = Number(fd.get("id"));
  const s = await one("select client_id from photo_sessions where id = $1", [id]);
  if (!s) redirect("/staff/clients");
  await q("delete from photo_sessions where id = $1 and not exists (select 1 from photos where session_id = $1)", [id]);
  revalidatePath(`/staff/clients/${s.client_id}`);
  redirect(`/staff/clients/${s.client_id}#photos`);
}
