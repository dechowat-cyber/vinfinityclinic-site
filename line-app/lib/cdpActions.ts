"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q } from "./db";
import { requireStaff } from "./session";
import { mergeClients } from "./identity";
import { mediaSet, absImages, mediaImages } from "./campaignMedia";
import { filtersFrom, createCampaign, createBroadcast, SEGMENT_ROLES, SEND_ROLES } from "./segments";
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
      withBooking: fd.get("with_booking") === "on", staffId: me.id, images: mediaImages(mediaSet(String(fd.get("media") || ""))) });
  } catch (e) {
    redirect(`/staff/segments?err=${encodeURIComponent((e as Error).message)}`);
  }
  revalidatePath("/staff/segments");
  redirect(`/staff/segments?sent=${r.id}#campaigns`);
}

export async function sendBroadcastAction(fd: FormData) {
  const me = await requireStaff(SEND_ROLES);
  const m = fd.get("media") ? `&media=${encodeURIComponent(String(fd.get("media")))}` : "";
  if (fd.get("confirm_all") !== "on") redirect(`/staff/segments?berr=confirm${m}#broadcast`);
  if ((await getSettings()).paused) redirect(`/staff/segments?berr=paused${m}#broadcast`);
  let r: { id: number };
  try {
    r = await createBroadcast({ name: String(fd.get("campaign_name") || ""), message: String(fd.get("message") || ""), withBooking: fd.get("with_booking") === "on",
      staffId: me.id, images: mediaImages(mediaSet(String(fd.get("media") || ""))), reach: Number(fd.get("reach")) || null,
      narrow: { max: Number(fd.get("max")) || undefined, gender: fd.get("gender") === "female" || fd.get("gender") === "male" ? (fd.get("gender") as "female" | "male") : undefined,
        ageFrom: Number(fd.get("age_from")) || undefined, ageTo: Number(fd.get("age_to")) || undefined } });
  } catch (e) {
    redirect(`/staff/segments?berr=${encodeURIComponent((e as Error).message.slice(0, 120))}${m}#broadcast`);
  }
  revalidatePath("/staff/segments");
  redirect(`/staff/segments?bsent=${r.id}#campaigns`);
}
