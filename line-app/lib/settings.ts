import { q, one } from "./db";

export type Hours = { open: string; close: string } | null; // null = closed
export type ClinicSettings = {
  clinicName: string;
  branch: string;
  /** index 0 = Sunday */
  hours: Hours[];
  slotMinutes: number;
  consultMinutes: number;
  /** earliest bookable time from now, in hours */
  leadHours: number;
  /** how many days ahead clients can book */
  horizonDays: number;
  doctors: string[];
  closedDates: string[];
  staffGroupId: string | null;
  consentVersion: string;
  phone: string;
  mapsUrl: string;
  website: string;
  richMenuId?: string;
  aftercareApproved?: boolean;
  aftercareApprovedBy?: string | null;
  aftercareApprovedAt?: string | null;
  /** CARE_VERSION the doctor approved; a newer card text needs a fresh approval */
  aftercareVersion?: string;
  paused?: boolean;
  /** recall LINE messages (marketing): off until the manager switches them on */
  recallAuto?: boolean;
  /** send the recall message this many days before the due date */
  recallLeadDays?: number;
};

// Defaults match the Udon Thani branch as published on Google Maps (closed on Tuesdays).
export const DEFAULTS: ClinicSettings = {
  clinicName: "Vinfinity Clinic อุดรธานี",
  branch: "UDN",
  hours: [
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
    null,
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
    { open: "10:00", close: "19:00" },
  ],
  slotMinutes: 30,
  consultMinutes: 30,
  leadHours: 2,
  horizonDays: 30,
  doctors: ["นพ.เดโชวัต พรมดา"],
  closedDates: [],
  staffGroupId: null,
  consentVersion: "draft-2026-10",
  phone: "082-462-2963",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Vinfinity+Clinic&query_place_id=ChIJ2z9FVIedIzERYDruDs_3xeU",
  website: "https://vinfinityclinic.com",
};

export async function getSettings(): Promise<ClinicSettings> {
  const row = await one<{ value: Partial<ClinicSettings> }>("select value from settings where key = 'clinic'");
  return { ...DEFAULTS, ...(row?.value ?? {}) };
}

export async function saveSettings(patch: Partial<ClinicSettings>) {
  const cur = await getSettings();
  const next = { ...cur, ...patch };
  await q(
    `insert into settings(key, value, updated_at) values ('clinic', $1, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(next)],
  );
  return next;
}
