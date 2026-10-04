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
export const formUrl = (userId: string | null | undefined) => bookUrl(userId, { view: "form" });
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
      btn("กรอกแบบฟอร์มก่อนมา", { type: "uri", uri: formUrl(userId) }),
      btn("นัดของฉัน / เลื่อนนัด", { type: "uri", uri: myUrl(userId) }, "secondary"),
      btn("ดูแผนที่", { type: "uri", uri: s.mapsUrl }, "secondary"),
    ], "นัดปรึกษาไม่ต้องวางมัดจำ รบกวนมาก่อนเวลา 10 นาทีนะคะ"),
  };
}

export function reminder(a: Appt, s: ClinicSettings, userId: string | null = a.line_user_id ?? null, formMissing = false) {
  const d = new Date(a.start_at);
  return {
    type: "flex", altText: `เตือนนัดพรุ่งนี้ ${thaiTime(d)}`,
    contents: card(`พรุ่งนี้ ${thaiTime(d)}`, "REMINDER · D-1", [["วัน", thaiDate(d)], ["สาขา", "อุดรธานี"], ["แพทย์", a.doctor]], [
      btn("ยืนยันมาตามนัด", { type: "postback", data: `appt=confirm&id=${a.id}`, displayText: "ยืนยันมาตามนัดค่ะ" }),
      btn("เลื่อนนัด", { type: "postback", data: `resched=${a.id}`, displayText: "ขอเลื่อนนัดค่ะ" }, "secondary"),
      ...(formMissing ? [btn("กรอกแบบฟอร์มก่อนมา (ยังไม่ครบ)", { type: "uri", uri: formUrl(userId) }, "secondary")] : []),
    ], `รบกวนมาก่อนเวลา 10 นาทีนะคะ ติดต่อ ${s.phone}`),
  };
}

export const confirmedReply = (a: Appt) => txt(`ขอบคุณที่ยืนยันนะคะ พรุ่งนี้พบกันค่ะ ${thaiTime(new Date(a.start_at))} รบกวนมาก่อนเวลา 10 นาทีนะคะ`);
export const declinedDataReply = () => txt("รับทราบค่ะ คุยกับทีมต่อได้ตามปกตินะคะ ทีมจะไม่บันทึกข้อมูลสุขภาพหรือรูปถ่ายจนกว่าคุณจะยินยอมค่ะ");
export const thanksMarketing = (yes: boolean) => txt(yes ? "ขอบคุณค่ะ เล่าเรื่องที่อยากปรึกษาได้เลยนะคะ หรือกดจองคิวจากเมนูด้านล่างค่ะ" : "รับทราบค่ะ จะไม่ส่งข่าวสารนะคะ เล่าเรื่องที่อยากปรึกษาได้เลยค่ะ");


// ---------- Phase 1 completion ----------
const money = (n: number) => `${Math.round(n).toLocaleString("en-US")} บาท`;

/** FR-15: T-2h reminder. */
export function reminder2h(a: Appt, s: ClinicSettings, userId: string | null, formMissing = false) {
  const d = new Date(a.start_at);
  return {
    type: "flex", altText: `อีก 2 ชั่วโมงพบกันค่ะ ${thaiTime(d)}`,
    contents: card(`วันนี้ ${thaiTime(d)}`, "SEE YOU SOON", [["สาขา", "อุดรธานี"], ["แพทย์", a.doctor]], [
      btn("เปิดแผนที่", { type: "uri", uri: s.mapsUrl }),
      btn("เลื่อนนัด", { type: "postback", data: `resched=${a.id}`, displayText: "ขอเลื่อนนัดค่ะ" }, "secondary"),
      ...(formMissing ? [btn("กรอกแบบฟอร์มก่อนมา", { type: "uri", uri: formUrl(userId) }, "secondary")] : []),
    ], `ถ้ามาช้ากว่าเวลานัด รบกวนโทรแจ้ง ${s.phone} นะคะ`),
  };
}

/** FR-15: three nearest free slots as one-tap choices (reply, not push). */
export function reschedOptions(apptId: number, slots: { start: string }[], userId: string | null) {
  if (!slots.length) return txt("ช่วงนี้คิวเต็มค่ะ เลือกวันอื่นได้ที่ปุ่มด้านล่าง หรือพิมพ์บอกเวลาที่สะดวก ทีมจะหาให้ค่ะ", {
    quickReply: { items: [{ type: "action", action: { type: "uri", label: "ดูวันอื่น", uri: myUrl(userId) } }] } });
  return {
    type: "text", text: "เลือกเวลาใหม่ได้เลยค่ะ หรือกด ดูวันอื่น",
    quickReply: { items: [
      ...slots.slice(0, 3).map((x) => { const d = new Date(x.start); return { type: "action", action: {
        type: "postback", label: `${thaiDate(d).replace(/^วัน/, "").replace(/ \d{4}$/, "")} ${thaiTime(d)}`.slice(0, 20),
        data: `resched_to=${apptId}&t=${encodeURIComponent(x.start)}`, displayText: `เลื่อนเป็น ${thaiDate(d)} ${thaiTime(d)}` } }; }),
      { type: "action", action: { type: "uri", label: "ดูวันอื่น", uri: myUrl(userId) } },
    ] },
  };
}

/** FR-16: missed appointment, invite to rebook (sent once). */
export function noShow(userId: string | null) {
  return { type: "flex", altText: "วันนี้ไม่ได้มาตามนัด จองเวลาใหม่ได้เลยค่ะ",
    contents: { type: "bubble", body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "18px", contents: [
      txt("วันนี้คลาดกันนะคะ", { weight: "bold", size: "md", color: NAVY }),
      txt("ไม่เป็นไรเลยค่ะ ถ้ายังสนใจปรึกษาคุณหมอ เลือกเวลาใหม่ที่สะดวกได้เลย", { size: "sm", color: MUTED }),
    ] }, footer: { type: "box", layout: "vertical", contents: [btn("จองเวลาใหม่", { type: "uri", uri: bookUrl(userId, { src: "noshow" }) })] } } };
}

/** Recall: the same treatment is coming due again. Draft wording, sent only with marketing consent. */
export function recall(userId: string | null, treatment: string, lastDate: string) {
  return { type: "flex", altText: `ใกล้ครบรอบ${treatment}แล้วค่ะ จองคิวได้เลย`,
    contents: { type: "bubble", body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "18px", contents: [
      txt(`ใกล้ครบรอบ${treatment}แล้วนะคะ`, { weight: "bold", size: "md", color: NAVY }),
      txt(`ครั้งล่าสุดทำเมื่อ ${lastDate} ถ้าอยากให้ผลต่อเนื่อง คุณหมอแนะนำให้มาประเมินและทำซ้ำตามรอบค่ะ เลือกเวลาที่สะดวกได้เลย`, { size: "sm", color: MUTED }),
    ] }, footer: { type: "box", layout: "vertical", contents: [btn("จองคิว", { type: "uri", uri: bookUrl(userId, { src: "recall" }) })] } } };
}

/** FR-09: nurture D1/D3/D7. Gentle, no pressure, stops when the person replies. */
export function nurture(step: 1 | 3 | 7, userId: string | null) {
  const body = step === 1
    ? "สวัสดีค่ะ เมื่อวานคุยกันเรื่องที่อยากปรึกษาไว้ ถ้ามีคำถามเพิ่มเติม พิมพ์มาได้เลยนะคะ หรือจองคิวให้คุณหมอประเมินก่อนก็ได้ค่ะ นัดปรึกษาไม่ต้องวางมัดจำค่ะ"
    : step === 3
    ? "แชร์ข้อมูลเผื่อเป็นประโยชน์ค่ะ คุณหมอจะประเมินโครงหน้าและผิวก่อนทุกครั้ง แล้วอธิบายทางเลือกพร้อมค่าใช้จ่ายให้ตัดสินใจเอง ดูเคสจริงได้ที่เว็บไซต์คลินิกค่ะ"
    : "ทีมขอทักครั้งสุดท้ายนะคะ ถ้าพร้อมเมื่อไหร่ ทักมาหรือกดจองคิวได้ตลอดค่ะ ขอบคุณที่สนใจ Vinfinity Clinic ค่ะ";
  return { type: "flex", altText: body.slice(0, 60),
    contents: { type: "bubble", body: { type: "box", layout: "vertical", paddingAll: "18px", contents: [txt(body, { size: "sm", color: NAVY })] },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
        btn("จองคิวปรึกษา", { type: "uri", uri: bookUrl(userId, { src: `nurture_d${step}` }) }),
        ...(step === 3 ? [btn("ดูเคสจริง", { type: "uri", uri: "https://vinfinityclinic.com/#results" }, "secondary")] : []),
      ] } } };
}

export type PlanItem = { catalog_id: number; name: string; qty: number; unit: string; unit_price: number };
export type PlanRow = { id: number; goal: string | null; items: PlanItem[]; subtotal: number; discount: number; total: number; valid_until: string | Date | null };

/** FR-23 / L07: plan summary card. Treatment names and prices only, no health details. */
export function planCard(p: PlanRow, userId: string | null) {
  const until = p.valid_until ? thaiDate(new Date(`${String(p.valid_until).slice(0, 10)}T05:00:00Z`)) : "-";
  const rows: [string, string][] = p.items.map((i) => [`${i.name}${i.qty > 1 ? ` × ${i.qty}` : ""}`, money(Number(i.unit_price) * Number(i.qty))]);
  if (Number(p.discount) > 0) rows.push(["ส่วนลด", `-${money(Number(p.discount))}`]);
  rows.push(["รวม", money(Number(p.total))]);
  return {
    type: "flex", altText: `สรุปแผนการรักษา ${money(Number(p.total))}`,
    contents: {
      type: "bubble",
      header: { type: "box", layout: "vertical", backgroundColor: NAVY, paddingAll: "18px", contents: [
        txt("TREATMENT PLAN", { size: "xxs", color: SILVER, weight: "bold" }),
        txt(p.goal || "แผนการรักษาของคุณ", { size: "lg", color: "#FFFFFF", weight: "bold", margin: "sm" }),
      ] },
      body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
        ...rows.map(([k, v], i) => ({ type: "box", layout: "baseline", spacing: "md", contents: [
          txt(k, { size: "sm", color: i === rows.length - 1 ? NAVY : MUTED, flex: 5, weight: i === rows.length - 1 ? "bold" : "regular" }),
          txt(v, { size: "sm", color: NAVY, flex: 3, align: "end", weight: "bold" }) ] })),
        txt(`ราคานี้ใช้ได้ถึง ${until} · ผลลัพธ์ขึ้นกับแต่ละบุคคล แพทย์จะยืนยันแผนอีกครั้งก่อนทำ`, { size: "xs", color: MUTED, margin: "lg" }),
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "14px", contents: [
        btn("จองคิวทำตามแผน", { type: "uri", uri: bookUrl(userId, { src: "plan", plan: String(p.id) }) }),
        btn("มีคำถาม คุยกับทีม", { type: "message", text: "มีคำถามเรื่องแผนการรักษาค่ะ" }, "secondary"),
      ] },
    },
  };
}

/** FR-32: aftercare message. D1 asks how they feel (L09). */
export function aftercare(body: string, day: number, treatmentId: number, s: ClinicSettings) {
  if (day === 1) return { type: "text", text: `${body}\n\nถ้ามีอาการ ปวดมากขึ้นเรื่อยๆ ผิวซีดหรือคล้ำเป็นปื้น ตามัว หรือหายใจลำบาก โทร ${s.phone} ทันทีนะคะ`,
    quickReply: { items: [
      { type: "action", action: { type: "postback", label: "ปกติดีค่ะ", data: `care=ok&t=${treatmentId}`, displayText: "ปกติดีค่ะ" } },
      { type: "action", action: { type: "postback", label: "อยากให้หมอดู", data: `care=ask&t=${treatmentId}`, displayText: "อยากให้คุณหมอดูอาการค่ะ" } },
    ] } };
  return txt(body);
}

export function careAsk(open: boolean, s: ClinicSettings) {
  return [txt(`ส่งรูปบริเวณที่ทำมาในแชทนี้ได้เลยค่ะ ถ่ายในที่แสงสว่าง ${open ? "พยาบาลจะดูและตอบกลับภายใน 1 ชั่วโมง" : "พยาบาลเวรจะดูและตอบกลับภายใน 1 ชั่วโมง"}\n\nถ้ามีอาการรุนแรง โทร ${s.phone} ทันทีนะคะ`)];
}
export const carePhotoThanks = () => txt("ขอบคุณที่ส่งรูปมานะคะ พยาบาลกำลังดูให้ จะตอบกลับภายใน 1 ชั่วโมงค่ะ");
export const careOk = () => txt("ดีใจด้วยค่ะ ดูแลตามคำแนะนำต่อได้เลย มีอะไรทักมาได้ตลอดนะคะ");

/** FR-34/35 (L10): CSAT + review link for everyone (no review gating). */
export function csat(treatmentId: number, reviewUrl: string) {
  return { type: "flex", altText: "ครบ 2 สัปดาห์แล้ว ให้คะแนนการดูแลของเราหน่อยนะคะ",
    contents: { type: "bubble", body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "18px", contents: [
      txt("ครบ 2 สัปดาห์แล้วค่ะ", { weight: "bold", size: "md", color: NAVY }),
      txt("ให้คะแนนการดูแลของเราโดยรวมหน่อยนะคะ (1 = ต้องปรับปรุง, 5 = ดีมาก)", { size: "sm", color: MUTED }),
      { type: "box", layout: "horizontal", spacing: "sm", contents: [1, 2, 3, 4, 5].map((n) => ({ type: "button", style: "secondary", height: "sm",
        action: { type: "postback", label: String(n), data: `csat=${n}&t=${treatmentId}`, displayText: `ให้ ${n} คะแนน` } })) },
      txt("ถ้าสะดวก ช่วยเล่าประสบการณ์บน Google ได้ด้วยนะคะ รีวิวของคุณช่วยให้คนที่กำลังเลือกคลินิกตัดสินใจได้ง่ายขึ้น", { size: "xs", color: MUTED, margin: "md" }),
    ] }, footer: { type: "box", layout: "vertical", contents: [btn("เขียนรีวิวบน Google", { type: "uri", uri: reviewUrl }, "secondary")] } } };
}
export const csatThanks = (score: number, refCode: string | null) => txt(score <= 3
  ? "ขอบคุณที่บอกเรานะคะ ทีมจะติดต่อกลับเพื่อดูแลเรื่องนี้ให้เร็วที่สุดค่ะ"
  : `ขอบคุณมากค่ะ${refCode ? `\n\nรหัสแนะนำเพื่อนของคุณคือ ${refCode} ส่งให้เพื่อนพิมพ์รหัสนี้ตอนทักแชทได้เลยค่ะ` : ""}`);
