// Every customer-facing text lives here so it can be reviewed in one place.
// Wording follows the Front-of-House Playbook (section 05): no guarantees, no superlatives.
import { ClinicSettings } from "./settings";
import { bookUrl } from "./link";
import { thaiDate, thaiTime } from "./time";

const NAVY = "#0B142E", ROYAL = "#1E3470", SILVER = "#D5DDEE", MUTED = "#5A6480";

const txt = (text: string, o: Record<string, any> = {}) => ({ type: "text", text, wrap: true, ...o });
const btn = (label: string, action: Record<string, any>, style: "primary" | "secondary" | "link" = "primary") =>
  ({ type: "button", style, height: "sm", color: style === "primary" ? ROYAL : undefined, action: { label, ...action } });

function card(title: string, eyebrow: string, rows: [string, string][], buttons: any[], note?: string) {
  return {
    type: "bubble",
    header: { type: "box", layout: "vertical", backgroundColor: NAVY, paddingAll: "18px", contents: [
      txt(eyebrow, { size: "xxs", color: SILVER, weight: "bold" }),
      txt(title, { size: "lg", color: "#FFFFFF", weight: "bold", margin: "sm" }),
    ] },
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
      ...rows.map(([k, v]) => ({ type: "box", layout: "baseline", spacing: "md", contents: [
        txt(k, { size: "sm", color: MUTED, flex: 2 }), txt(v, { size: "sm", color: NAVY, flex: 5, weight: "bold" }) ] })),
      ...(note ? [txt(note, { size: "xs", color: MUTED, margin: "lg" })] : []),
    ] },
    footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "14px", contents: buttons },
  };
}

export const CONSENT_TEXT = {
  data: "ยินยอมให้ Vinfinity Clinic เก็บและใช้ชื่อ เบอร์โทร และข้อมูลที่แจ้งผ่านแชท เพื่อการนัดหมาย ปรึกษา และดูแลการรักษา",
  marketing: "ยินยอมรับข่าวสาร สิทธิพิเศษ และโปรแกรมใหม่ทาง LINE (ยกเลิกได้ทุกเมื่อ)",
};

export function welcome(s: ClinicSettings) {
  return [
    txt(`สวัสดีค่ะ ขอบคุณที่เพิ่มเพื่อน ${s.clinicName} ค่ะ\nพิมพ์เล่าเรื่องที่อยากปรึกษาได้เลย ทีมจะตอบภายใน 5 นาทีในเวลาทำการ หรือกดจองคิวปรึกษาคุณหมอได้ทันทีค่ะ`),
    consentAsk(s),
  ];
}

export function consentAsk(_s: ClinicSettings) {
  return {
    type: "text",
    text: `ก่อนเริ่มคุยกัน ขออนุญาตเรื่องข้อมูลส่วนตัวค่ะ\n\n1) ${CONSENT_TEXT.data}\n\nอ่านนโยบายความเป็นส่วนตัวได้ที่เว็บไซต์คลินิกค่ะ`,
    quickReply: { items: [
      { type: "action", action: { type: "postback", label: "ยินยอม", data: "consent=data&v=1", displayText: "ยินยอมให้เก็บข้อมูลเพื่อการรักษา" } },
      { type: "action", action: { type: "postback", label: "ไม่ยินยอม", data: "consent=data&v=0", displayText: "ไม่ยินยอม" } },
    ] },
  };
}

export function marketingAsk() {
  return {
    type: "text",
    text: `ขอบคุณค่ะ\n2) ${CONSENT_TEXT.marketing}`,
    quickReply: { items: [
      { type: "action", action: { type: "postback", label: "รับข่าวสาร", data: "consent=marketing&v=1", displayText: "รับข่าวสาร" } },
      { type: "action", action: { type: "postback", label: "ไม่รับ", data: "consent=marketing&v=0", displayText: "ไม่รับข่าวสาร" } },
    ] },
  };
}

export function bookingPrompt(userId: string | null, text = "เลือกวันและเวลาที่สะดวกได้เลยค่ะ ปรึกษาครั้งแรกใช้เวลาประมาณ 30 นาที") {
  return {
    type: "flex", altText: "จองคิวปรึกษาคุณหมอ",
    contents: { type: "bubble", body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "18px", contents: [
      txt("จองคิวปรึกษาคุณหมอ", { weight: "bold", size: "md", color: NAVY }), txt(text, { size: "sm", color: MUTED }),
    ] }, footer: { type: "box", layout: "vertical", contents: [btn("เลือกวันเวลา", { type: "uri", uri: bookUrl(userId, { src: "line_chat" }) })] } },
  };
}

export function offHours(s: ClinicSettings, userId: string | null) {
  const open = s.hours.map((h, i) => (h ? null : ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"][i])).filter(Boolean);
  return [
    txt(`ขอบคุณที่ทักมานะคะ ตอนนี้อยู่นอกเวลาทำการ ทีมจะตอบกลับในวันทำการถัดไปตั้งแต่ ${s.hours.find(Boolean)?.open ?? "10:00"} น. ค่ะ\nเวลาทำการ ${s.hours.find(Boolean)?.open}–${s.hours.find(Boolean)?.close} น.${open.length ? ` (ปิดวัน${open.join(", วัน")})` : ""}\n\nถ้ามีอาการผิดปกติหลังทำหัตถการ โทร ${s.phone} ได้ทันทีค่ะ`),
    bookingPrompt(userId, "ระหว่างนี้จองคิวปรึกษาคุณหมอได้เองตลอด 24 ชั่วโมงค่ะ"),
  ];
}

type Appt = { id: number; start_at: string | Date; doctor: string; line_user_id?: string | null };
export const myUrl = (userId: string | null | undefined) => bookUrl(userId, { view: "my" });
export function myPrompt(userId: string) {
  return { type: "flex", altText: "นัดของฉัน", contents: { type: "bubble", body: { type: "box", layout: "vertical", paddingAll: "18px", contents: [
    txt("นัดของฉัน", { weight: "bold", size: "md", color: NAVY }), txt("ดู เลื่อน หรือยกเลิกนัดได้ที่นี่ค่ะ", { size: "sm", color: MUTED })] },
    footer: { type: "box", layout: "vertical", contents: [btn("เปิดนัดของฉัน", { type: "uri", uri: myUrl(userId) })] } } };
}

export function confirmation(a: Appt, s: ClinicSettings, userId: string | null = a.line_user_id ?? null) {
  const d = new Date(a.start_at);
  return {
    type: "flex", altText: `ยืนยันนัดปรึกษา ${thaiDate(d)} ${thaiTime(d)}`,
    contents: card("ยืนยันนัดปรึกษาแล้ว", "APPOINTMENT", [["วัน", thaiDate(d)], ["เวลา", thaiTime(d)], ["สาขา", "อุดรธานี"], ["แพทย์", a.doctor]], [
      btn("นัดของฉัน / เลื่อนนัด", { type: "uri", uri: myUrl(userId) }),
      btn("ดูแผนที่", { type: "uri", uri: s.mapsUrl }, "secondary"),
    ], "นัดปรึกษาไม่ต้องวางมัดจำ รบกวนมาก่อนเวลา 10 นาทีนะคะ"),
  };
}

export function reminder(a: Appt, s: ClinicSettings, userId: string | null = a.line_user_id ?? null) {
  const d = new Date(a.start_at);
  return {
    type: "flex", altText: `เตือนนัดพรุ่งนี้ ${thaiTime(d)}`,
    contents: card(`พรุ่งนี้ ${thaiTime(d)}`, "REMINDER · D-1", [["วัน", thaiDate(d)], ["สาขา", "อุดรธานี"], ["แพทย์", a.doctor]], [
      btn("ยืนยันมาตามนัด", { type: "postback", data: `appt=confirm&id=${a.id}`, displayText: "ยืนยันมาตามนัดค่ะ" }),
      btn("เลื่อนนัด", { type: "uri", uri: myUrl(userId) }, "secondary"),
    ], `รบกวนมาก่อนเวลา 10 นาทีนะคะ ติดต่อ ${s.phone}`),
  };
}

export const confirmedReply = (a: Appt) => txt(`ขอบคุณที่ยืนยันนะคะ พรุ่งนี้พบกันค่ะ ${thaiTime(new Date(a.start_at))} รบกวนมาก่อนเวลา 10 นาทีนะคะ`);
export const declinedDataReply = () => txt("รับทราบค่ะ คุยกับทีมต่อได้ตามปกตินะคะ ทีมจะไม่บันทึกข้อมูลสุขภาพหรือรูปถ่ายจนกว่าคุณจะยินยอมค่ะ");
export const thanksMarketing = (yes: boolean) => txt(yes ? "ขอบคุณค่ะ เล่าเรื่องที่อยากปรึกษาได้เลยนะคะ หรือกดจองคิวจากเมนูด้านล่างค่ะ" : "รับทราบค่ะ จะไม่ส่งข่าวสารนะคะ เล่าเรื่องที่อยากปรึกษาได้เลยค่ะ");
