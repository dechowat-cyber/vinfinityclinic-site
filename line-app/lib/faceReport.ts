import { q, one } from "./db";
import { logTouch } from "./crm";
import { notifyStaff } from "./notify";
import { linkToken } from "./link";
import type * as line from "./line";

// Face Architecture Report intake: three quick questions, three photos, then the doctor writes the report.
// Answers and photos are health data: they stay in the database and the staff page (login + health roles).
// The staff LINE group only ever gets a link, never what the person asked about.

export const TRIGGER = /face\s*architecture|face\s*(analysis|report|assessment)|analy[sz]e\s*my\s*face|วิเคราะห์(ใบ)?หน้า|รายงานใบหน้า|ประเมินหน้า(ฟรี)?|ขอรับรายงาน/i;

export const QUESTIONS: { key: string; text: string; options: string[] }[] = [
  { key: "concern", text: "อยากปรับเรื่องไหนมากที่สุดคะ", options: ["ใต้ตา / ดูเหนื่อย", "แก้มตอบ / ขมับ", "คาง / กราม / โครงหน้า", "ร่องแก้ม / หย่อนคล้อย", "ผิว / ริ้วรอย", "ยังไม่แน่ใจ"] },
  { key: "history", text: "เคยฉีดฟิลเลอร์หรือทำหัตถการบนใบหน้ามาก่อนไหมคะ", options: ["ไม่เคย", "เคย ภายใน 1 ปี", "เคย นานกว่า 1 ปี"] },
  { key: "budget", text: "งบประมาณโดยประมาณที่ตั้งไว้คะ (ช่วยให้หมอเรียงลำดับแผนได้)", options: ["ไม่เกิน 15,000", "15,000–40,000", "40,000–80,000", "มากกว่า 80,000", "ขอดูแผนก่อน"] },
];
export const PHOTOS = [
  { key: "front", label: "หน้าตรง", hint: "มองตรงเข้ากล้อง หน้านิ่ง ผมเก็บหลังหู" },
  { key: "oblique", label: "เอียง 45°", hint: "หันข้างครึ่งหนึ่ง จนปลายจมูกชนแนวแก้มอีกข้าง" },
  { key: "profile", label: "ด้านข้าง", hint: "หันข้างเต็มที่ เห็นตาข้างเดียว" },
];
const ACTIVE = ["need_consent", "asking", "waiting_photo"];
const STALE_DAYS = 7;

export type FaceReportRow = { id: number; client_id: number; status: string; step: number; answers: Record<string, string> };

export async function activeReport(clientId: number, now = new Date()) {
  return one<FaceReportRow>(
    `select * from face_reports where client_id = $1 and status = any($2) and updated_at > $3 order by id desc limit 1`,
    [clientId, ACTIVE, new Date(now.getTime() - STALE_DAYS * 86400_000).toISOString()]);
}

const text = (t: string): line.Msg => ({ type: "text", text: t } as line.Msg);

export function questionMsg(i: number): line.Msg {
  const qn = QUESTIONS[i];
  return {
    type: "text",
    text: `(${i + 1}/${QUESTIONS.length}) ${qn.text}`,
    quickReply: { items: qn.options.map((o, v) => ({ type: "action", action: { type: "postback", label: o.slice(0, 20), data: `fr=a&k=${qn.key}&v=${v}`, displayText: o } })) },
  } as line.Msg;
}

export function photoMsg(i: number): line.Msg {
  const p = PHOTOS[i];
  const intro = i === 0 ? "ขั้นสุดท้ายค่ะ ส่งรูป 3 มุม ทีละรูป ถ่ายในที่แสงสว่างจากด้านหน้า ไม่แต่งหน้าหนัก ไม่ใช้ฟิลเตอร์\n\n" : "";
  return text(`${intro}📷 รูปที่ ${i + 1}/3 · ${p.label}\n${p.hint}`);
}

/** Start (or resume) a request. hasDataConsent = the person already agreed to health-data use. */
export async function startFaceReport(clientId: number, hasDataConsent: boolean, source: string | null, now = new Date()): Promise<line.Msg[]> {
  let r = await activeReport(clientId, now);
  if (!r) {
    r = (await one<FaceReportRow>(`insert into face_reports(client_id, status, source) values ($1,$2,$3) returning *`,
      [clientId, hasDataConsent ? "asking" : "need_consent", source]))!;
    await logTouch(clientId, "in", "face_report_start", String(r.id));
  }
  const hello = text("Face Architecture Report ✨\nคุณหมอจะอ่านใบหน้าคุณทีละชั้นจากรูปถ่าย แล้วส่งรายงานพร้อมแผนการรักษาและเอกสารอ้างอิงให้ทางแชทนี้ค่ะ\nใช้เวลาตอบ 3 คำถาม + ส่งรูป 3 มุม ประมาณ 2 นาที");
  if (!hasDataConsent) {
    if (r.status !== "need_consent") await q("update face_reports set status = 'need_consent', updated_at = now() where id = $1", [r.id]);
    return [hello, text("รูปใบหน้าและข้อมูลที่ตอบถือเป็นข้อมูลสุขภาพ ก่อนเริ่มขออนุญาตเก็บและใช้ข้อมูลเพื่อการประเมินก่อนนะคะ 🙏")];
  }
  if (r.status === "need_consent") await q("update face_reports set status = 'asking', step = 0, updated_at = now() where id = $1", [r.id]);
  if (r.status === "waiting_photo") return [photoMsg(r.step)];
  return [hello, questionMsg(r.status === "asking" ? r.step : 0)];
}

/** Called after the data-consent "yes" postback: continue a request that was waiting for it. */
export async function resumeAfterConsent(clientId: number, now = new Date()): Promise<line.Msg[] | null> {
  const r = await activeReport(clientId, now);
  if (!r || r.status !== "need_consent") return null;
  await q("update face_reports set status = 'asking', step = 0, updated_at = now() where id = $1", [r.id]);
  return [text("ขอบคุณค่ะ เริ่มกันเลยนะคะ"), questionMsg(0)];
}

export async function answerFaceReport(clientId: number, key: string, v: number, now = new Date()): Promise<line.Msg[]> {
  const r = await activeReport(clientId, now);
  if (!r || r.status !== "asking") return [text("คำขอนี้หมดเวลาแล้วค่ะ พิมพ์ “วิเคราะห์หน้า” เพื่อเริ่มใหม่ได้เลยนะคะ")];
  const i = QUESTIONS.findIndex((x) => x.key === key);
  if (i < 0 || i !== r.step) return [r.step < QUESTIONS.length ? questionMsg(r.step) : photoMsg(0)];
  const answer = QUESTIONS[i].options[v] ?? "";
  const answers = { ...r.answers, [key]: answer };
  const next = i + 1;
  if (next < QUESTIONS.length) {
    await q("update face_reports set answers = $2, step = $3, updated_at = now() where id = $1", [r.id, JSON.stringify(answers), next]);
    return [questionMsg(next)];
  }
  await q("update face_reports set answers = $2, step = 0, status = 'waiting_photo', updated_at = now() where id = $1", [r.id, JSON.stringify(answers)]);
  return [photoMsg(0)];
}

/** An image arrived while a request waits for photos. Returns null when no request is waiting. */
export async function addFaceReportPhoto(clientId: number, img: { mime: string; data: Buffer } | null, now = new Date()): Promise<line.Msg[] | null> {
  const r = await activeReport(clientId, now);
  if (!r || r.status !== "waiting_photo") return null;
  if (!img) return [text("รับรูปไม่สำเร็จค่ะ ลองส่งอีกครั้งนะคะ")];
  const p = PHOTOS[r.step];
  await q("insert into photos(client_id, angle, mime, data, face_report_id) values ($1,$2,$3,$4,$5)", [clientId, `fr_${p.key}`, img.mime, img.data, r.id]);
  const next = r.step + 1;
  if (next < PHOTOS.length) {
    await q("update face_reports set step = $2, updated_at = now() where id = $1", [r.id, next]);
    return [photoMsg(next)];
  }
  await q("update face_reports set step = $2, status = 'waiting_doctor', updated_at = now() where id = $1", [r.id, next]);
  await logTouch(clientId, "in", "face_report_photos", String(r.id));
  await notifyStaff(`📝 มีคำขอ Face Architecture Report ใหม่ (#${r.id})\nเปิดดูในระบบ: ${process.env.APP_URL || ""}/staff/face-reports/${r.id}`, `fr:${r.id}`).catch(() => {});
  return [text("ได้รับรูปครบแล้วค่ะ 🙏\nคุณหมอจะอ่านใบหน้าทีละชั้นและส่งรายงานให้ในแชทนี้ภายใน 2 วันทำการนะคะ\nระหว่างนี้ถ้ามีคำถามพิมพ์มาได้เลยค่ะ")];
}

export async function cancelFaceReport(clientId: number, now = new Date()) {
  const r = await activeReport(clientId, now);
  if (!r) return false;
  await q("update face_reports set status = 'cancelled', updated_at = now() where id = $1", [r.id]);
  return true;
}

/** Personal link the client opens to read their finished report. */
export function reportUrl(id: number, userId: string) {
  return `${process.env.APP_URL || ""}/report/face/${id}?t=${encodeURIComponent(linkToken(userId))}`;
}

export function reportReadyMsg(id: number, userId: string, name?: string | null): line.Msg {
  return {
    type: "flex", altText: "Face Architecture Report ของคุณพร้อมแล้ว",
    contents: {
      type: "bubble",
      body: { type: "box", layout: "vertical", spacing: "md", backgroundColor: "#0B142E", paddingAll: "20px", contents: [
        { type: "text", text: "FACE ARCHITECTURE REPORT", size: "xs", color: "#D5DDEE", weight: "bold" },
        { type: "text", text: `รายงานของ${name ? `คุณ${name}` : "คุณ"}พร้อมแล้ว`, size: "lg", color: "#FFFFFF", weight: "bold", wrap: true },
        { type: "text", text: "คุณหมออ่านใบหน้าทีละชั้น พร้อมแผนการรักษา ค่าใช้จ่ายโดยประมาณ และเอกสารอ้างอิง", size: "sm", color: "#B4BED3", wrap: true },
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
        { type: "button", style: "primary", color: "#1E3470", action: { type: "uri", label: "เปิดอ่านรายงาน", uri: reportUrl(id, userId) } },
        { type: "button", style: "link", action: { type: "postback", label: "นัดตรวจที่คลินิก", data: "menu=book", displayText: "นัดตรวจที่คลินิก" } },
      ] },
    },
  } as line.Msg;
}

// ---- staff side: the doctor's draft (stored as report jsonb) and the data the document renders ----
import type { ReportData, LayerKey, LayerStatus } from "./faceReportDoc";
import { LAYERS } from "./faceReportDoc";

export type Draft = {
  summary: string; layers: { key: LayerKey; status: LayerStatus; finding: string }[];
  plan: ReportData["plan"]; notNow: string[]; priceRange: string; priceNote: string; refs: { label: string; url?: string }[];
};

const lines = (v: FormDataEntryValue | null) => String(v ?? "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

export function draftFromForm(fd: FormData): Draft {
  return {
    summary: String(fd.get("summary") ?? "").trim(),
    layers: LAYERS.map((L) => ({
      key: L.key,
      status: (["good", "watch", "treat"].includes(String(fd.get(`st_${L.key}`))) ? String(fd.get(`st_${L.key}`)) : "good") as LayerStatus,
      finding: String(fd.get(`fd_${L.key}`) ?? "").trim(),
    })),
    plan: lines(fd.get("plan")).map((l) => {
      const [when, layer, treatment, why, sessions] = l.split("|").map((x) => x.trim());
      return { when: when ?? "", layer: layer ?? "", treatment: treatment ?? "", why: why ?? "", sessions: sessions || undefined };
    }),
    notNow: lines(fd.get("notNow")),
    priceRange: String(fd.get("priceRange") ?? "").trim(),
    priceNote: String(fd.get("priceNote") ?? "").trim(),
    refs: lines(fd.get("refs")).map((l) => { const [label, url] = l.split("|").map((x) => x.trim()); return { label, url: url || undefined }; }),
  };
}

export const planToText = (d?: Partial<Draft> | null) => (d?.plan ?? []).map((p) => [p.when, p.layer, p.treatment, p.why, p.sessions ?? ""].join(" | ")).join("\n");
export const refsToText = (d?: Partial<Draft> | null) => (d?.refs ?? []).map((r) => (r.url ? `${r.label} | ${r.url}` : r.label)).join("\n");

const thDate = (d: Date) => d.toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "long", year: "numeric" });

export function reportData(row: Record<string, any>,
  clientName: string, photos: { angle: string; src: string }[]): ReportData {
  const d = (row.report ?? null) as Draft | null;
  const a = row.answers || {};
  const concern = [a.concern, a.history && `ประวัติ: ${a.history}`].filter(Boolean).join(" · ") || "—";
  return {
    clientName, date: thDate(new Date(row.created_at)), reportNo: `FAR-${String(row.id).padStart(4, "0")}`,
    concern, summary: d?.summary || "—",
    photos: PHOTOS.map((p) => ({ label: p.label, src: photos.find((x) => x.angle === `fr_${p.key}`)?.src })),
    layers: d?.layers ?? LAYERS.map((L) => ({ key: L.key, status: "good" as LayerStatus, finding: "" })),
    plan: d?.plan ?? [], notNow: d?.notNow?.length ? d.notNow : undefined,
    priceRange: d?.priceRange || undefined, priceNote: d?.priceNote || undefined, refs: d?.refs ?? [],
  };
}

export const FR_STATUS: Record<string, [string, string]> = {
  need_consent: ["รอความยินยอม", ""], asking: ["กำลังตอบคำถาม", ""], waiting_photo: ["รอรูปจากลูกค้า", ""],
  waiting_doctor: ["รูปครบ รอหมอ", "warn"], drafting: ["หมอกำลังเขียน", "warn"], sent: ["ส่งแล้ว", "ok"], cancelled: ["ยกเลิก", ""],
};
