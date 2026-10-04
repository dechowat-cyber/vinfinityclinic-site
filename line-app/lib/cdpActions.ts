"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q } from "./db";
import { requireStaff } from "./session";
import { mergeClients } from "./identity";
import { filtersFrom, createCampaign, SEGMENT_ROLES, SEND_ROLES } from "./segments";
import { getSettings } from "./settings";

export async function mergeAction(fd: FormData) {
  const me = await requireStaff(["BM"]);
  const primary = Number(fd.get("primary")), secondary = Number(fd.get("secondary"));
  try {
    await mergeClients(primary, secondary, me.id);
  } catch (e) {
    redirect(`/staff/clients/duplicates?err=${encodeURIComponent((e as Error).message)}`);
  }
  revalidatePath("/staff/clients");
  redirect(`/staff/clients/${primary}?merged=${secondary}`);
}

const form = (fd: FormData) => filtersFrom((k) => (fd.get(k) as string | null), (k) => fd.getAll(k).map(String));

export async function saveSegment(fd: FormData) {
  const me = await requireStaff(SEGMENT_ROLES);
  const name = String(fd.get("name") || "").trim().slice(0, 80);
  if (!name) return;
  await q("insert into segments(name, filters, created_by) values ($1,$2,$3)", [name, JSON.stringify(form(fd)), me.id]);
  revalidatePath("/staff/segments");
}

export async function deleteSegment(fd: FormData) {
  await requireStaff(SEGMENT_ROLES);
  await q("delete from segments where id = $1", [Number(fd.get("id"))]);
  revalidatePath("/staff/segments");
}

export async function sendCampaignAction(fd: FormData) {
  const me = await requireStaff(SEND_ROLES);
  if (fd.get("confirm") !== "on") redirect(`/staff/segments?err=confirm`);
  if ((await getSettings()).paused) redirect(`/staff/segments?err=paused`);
  let r: { id: number; recipients: number };
  try {
    r = await createCampaign({ name: String(fd.get("campaign_name") || ""), filters: form(fd), message: String(fd.get("message") || ""),
      withBooking: fd.get("with_booking") === "on", staffId: me.id });
  } catch (e) {
    redirect(`/staff/segments?err=${encodeURIComponent((e as Error).message)}`);
  }
  revalidatePath("/staff/segments");
  redirect(`/staff/segments?sent=${r.id}#campaigns`);
}
