import { mediaSet, mediaImages } from "./campaignMedia";
import { createBroadcast } from "./segments";
import { once } from "./jobs";

// Broadcasts the doctor approved to go out automatically at a set time (LINE broadcast to every friend of the OA).
// Each runs at most once (jobs key), only inside its window, so a late or repeated tick never double-sends or sends at night.
// Add an entry only on the doctor's explicit instruction; staff can still send anything else by hand on the segments page.
export type ScheduledBroadcast = { id: string; set: string; at: string; until: string; approvedBy: string };

export const SCHEDULED_BROADCASTS: ScheduledBroadcast[] = [
  // doctor 25 Nov 2026 00:55: "ตั้งบอร์ดแคสพรุ่งนี้เช้าอัตโนมัติ" — launch of the gift calendar, box 25 Nov (laser) closes 23:59 the same day
  { id: "gift-launch-2611-25", set: "gift-2611-25-card", at: "2026-11-25T10:00:00+07:00", until: "2026-11-25T12:30:00+07:00", approvedBy: "นพ.เดโชวัต (แชต 25 พ.ย. 00:55)" },
];

export async function scheduledBroadcastTick(now = new Date(), list = SCHEDULED_BROADCASTS) {
  const sent: string[] = [];
  for (const s of list) {
    const t = now.getTime();
    if (t < Date.parse(s.at) || t > Date.parse(s.until)) continue;
    const m = mediaSet(s.set, now);
    if (!m) { console.error("[scheduled-broadcast] set not live", s.id, s.set); continue; }
    if (!(await once(`sbc:${s.id}`))) continue; // claimed before sending: never twice, even if two ticks overlap
    try {
      const r = await createBroadcast({ name: `อัตโนมัติ · ${m.label}`.slice(0, 120), message: m.message, withBooking: false, staffId: null, images: mediaImages(m), now });
      console.log("[scheduled-broadcast] sent", s.id, r.id);
      sent.push(s.id);
    } catch (e) { console.error("[scheduled-broadcast] failed", s.id, e); }
  }
  return sent;
}
