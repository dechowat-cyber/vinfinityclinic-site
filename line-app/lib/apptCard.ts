import type { ClinicSettings } from "./settings";
import { thaiDate, thaiTime } from "./time";

// Appointment card a staff member sends from the client page, in the client's language.
// The purpose line goes only to the client's own LINE chat (never to a staff group).

export const APPT_KINDS: Record<string, { th: string; en: string }> = {
  consult: { th: "ปรึกษาแพทย์", en: "Consultation" },
  followup: { th: "นัดติดตามผล", en: "Follow-up review" },
  treatment: { th: "ทำหัตถการ", en: "Treatment" },
};
export const LANGS: Record<string, string> = { th: "ไทย", en: "English" };

const NAVY = "#0B142E", SILVER = "#D5DDEE", MUTED = "#5A6480";
const txt = (text: string, o: Record<string, unknown> = {}) => ({ type: "text", text, wrap: true, ...o });
const btn = (label: string, action: Record<string, unknown>, style = "primary") =>
  ({ type: "button", style, height: "sm", color: style === "primary" ? "#1E3470" : undefined, action: { label, ...action } });

const tz = "Asia/Bangkok";
export const enDate = (d: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
export const enTime = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
/** "082-462-2963" → "+66 82 462 2963" for clients abroad. */
export const intlPhone = (p: string) => { const d = p.replace(/\D/g, ""); return /^0\d{9}$/.test(d) ? `+66 ${d.slice(1, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : p; };

type A = { id: number; start_at: string | Date; doctor: string; kind?: string | null };

export function apptCard(a: A, lang: string, s: ClinicSettings, purpose?: string | null) {
  const d = new Date(a.start_at), kind = APPT_KINDS[a.kind ?? "consult"] ?? APPT_KINDS.consult, en = lang === "en";
  const rows: [string, string][] = en
    ? [["Date", enDate(d)], ["Time", enTime(d)], ["For", purpose || kind.en], ["Clinic", "Vinfinity Clinic, Udon Thani"], ["Doctor", a.doctor]]
    : [["วัน", thaiDate(d)], ["เวลา", thaiTime(d)], ["นัดเพื่อ", purpose || kind.th], ["สาขา", "อุดรธานี"], ["แพทย์", a.doctor]];
  const title = en ? (a.kind === "followup" ? "Your follow-up is booked" : "Your appointment is booked") : (a.kind === "followup" ? "ลงนัดติดตามผลแล้ว" : "ลงนัดเรียบร้อยแล้ว");
  const note = en
    ? `Please arrive 10 minutes early. Need a different time? Just reply here or call ${intlPhone(s.phone)}.`
    : `รบกวนมาก่อนเวลา 10 นาทีนะคะ ต้องการเลื่อนนัด ตอบกลับในแชทนี้หรือโทร ${s.phone} ได้เลยค่ะ`;
  return {
    type: "flex",
    altText: en ? `${kind.en}: ${enDate(d)}, ${enTime(d)}` : `${kind.th} ${thaiDate(d)} ${thaiTime(d)}`,
    contents: {
      type: "bubble",
      header: { type: "box", layout: "vertical", backgroundColor: NAVY, paddingAll: "18px", contents: [
        txt(en ? "APPOINTMENT · VINFINITY CLINIC" : "APPOINTMENT", { size: "xxs", color: SILVER, weight: "bold" }),
        txt(title, { size: "lg", color: "#FFFFFF", weight: "bold", margin: "sm" }) ] },
      body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
        ...rows.map(([k, v]) => ({ type: "box", layout: "baseline", spacing: "md", contents: [
          txt(k, { size: "sm", color: MUTED, flex: 2 }), txt(v, { size: "sm", color: NAVY, flex: 5, weight: "bold" }) ] })),
        txt(note, { size: "xs", color: MUTED, margin: "lg" }) ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "14px", contents: [
        btn(en ? "Open map" : "ดูแผนที่", { type: "uri", uri: s.mapsUrl }),
        btn(en ? "Reschedule" : "เลื่อนนัด", { type: "postback", data: `resched=${a.id}`, displayText: en ? "I'd like to reschedule" : "ขอเลื่อนนัดค่ะ" }, "secondary"),
      ] },
    },
  };
}

/** English D-1 / 2-hour reminders for clients whose language is English. */
export function reminderEn(a: A, s: ClinicSettings, hours: "d1" | "2h") {
  const d = new Date(a.start_at);
  const title = hours === "d1" ? `Tomorrow at ${enTime(d)}` : `Today at ${enTime(d)}`;
  return {
    type: "flex", altText: hours === "d1" ? `Reminder: tomorrow ${enTime(d)}` : `See you at ${enTime(d)}`,
    contents: { type: "bubble",
      header: { type: "box", layout: "vertical", backgroundColor: NAVY, paddingAll: "18px", contents: [
        txt(hours === "d1" ? "REMINDER" : "SEE YOU SOON", { size: "xxs", color: SILVER, weight: "bold" }),
        txt(title, { size: "lg", color: "#FFFFFF", weight: "bold", margin: "sm" }) ] },
      body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
        ...([["Date", enDate(d)], ["Clinic", "Vinfinity Clinic, Udon Thani"], ["Doctor", a.doctor]] as [string, string][]).map(([k, v]) => ({ type: "box", layout: "baseline", spacing: "md", contents: [
          txt(k, { size: "sm", color: MUTED, flex: 2 }), txt(v, { size: "sm", color: NAVY, flex: 5, weight: "bold" }) ] })),
        txt(`Please arrive 10 minutes early. Running late? Call ${intlPhone(s.phone)}.`, { size: "xs", color: MUTED, margin: "lg" }) ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "14px", contents: [
        ...(hours === "d1" ? [btn("I'll be there", { type: "postback", data: `appt=confirm&id=${a.id}`, displayText: "I'll be there" })] : [btn("Open map", { type: "uri", uri: s.mapsUrl })]),
        btn("Reschedule", { type: "postback", data: `resched=${a.id}`, displayText: "I'd like to reschedule" }, "secondary"),
      ] } },
  };
}
