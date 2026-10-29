// Ready-made image sets for LINE campaigns. Files live in /public/campaign/<key>/ so LINE can fetch them over https.
// Add a set here when marketing hands over a new broadcast; staff pick it on the segments page.

export type MediaSet = { key: string; label: string; images: string[]; previews: string[]; message: string; segment?: string };

const set = (key: string, label: string, dir: string, n: number, size: string, message: string, segment?: string): MediaSet => ({
  key, label, message, segment,
  images: Array.from({ length: n }, (_, i) => `/campaign/${dir}/${i + 1}-${size}.jpg`),
  previews: Array.from({ length: n }, (_, i) => `/campaign/${dir}/${i + 1}-${size}-p.jpg`),
});

const VITARAN_MSG = `✨ งานผิวตัวดังไตรมาสนี้ — VITARAN (PN Skin Booster)
ผิวโทรม รูขุมขนกว้าง ผิวบางแห้ง ให้ PN ช่วยฟื้นฟูผิวจากภายใน

💙 โปรพิเศษ ซื้อ 4 กล่องขึ้นไป เหลือกล่องละ 8,990.- (2 cc/กล่อง)
ซื้อ 1 กล่อง 9,990.-

แพทย์ประเมินผิวก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล
กดจองคิว หรือพิมพ์ทักแชทนี้ได้เลยค่ะ`;

export const MEDIA: MediaSet[] = [
  set("vitaran-2610-1x1", "Vitaran ต.ค. 69 · 3 รูป 1:1", "vitaran-2610", 3, "1x1", VITARAN_MSG, "skin=1&reachable=1"),
  set("vitaran-2610-4x5", "Vitaran ต.ค. 69 · 3 รูป 4:5", "vitaran-2610", 3, "4x5", VITARAN_MSG, "skin=1&reachable=1"),
];

export const mediaSet = (key: string | null | undefined) => MEDIA.find((m) => m.key === key) ?? null;

/** Absolute https URLs (LINE refuses relative or http). Max 4 images so the text still fits in one push (5 objects). */
export function absImages(paths: string[], base = process.env.APP_URL || "") {
  return paths.slice(0, 4).map((p) => (/^https:\/\//.test(p) ? p : `${base.replace(/\/$/, "")}${p}`)).filter((u) => /^https:\/\//.test(u));
}
