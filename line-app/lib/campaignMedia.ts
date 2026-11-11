// Ready-made image sets for LINE campaigns. Files live in /public/campaign/<key>/ so LINE can fetch them over https.
// Add a set here when marketing hands over a new broadcast; staff pick it on the segments page.

export type MediaSet = { key: string; label: string; images: string[]; previews: string[]; message: string; segment?: string; promo?: string; liveLeft?: boolean; invite?: boolean; comeback?: "A" | "B" | "C"; from?: string; until?: string };

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

const HACA_MSG = `✨ HArmonyCa (HA + CaHA) ฟิลเลอร์ไฮบริด
เติมเต็ม + กระชับ ในเข็มเดียว

💙 Early Bird จองภายใน 31 ต.ค. นี้
2 cc เหลือ 36,900.- (ปกติ 59,800.-)
1 cc 29,900.-
หลัง 31 ต.ค. 2 cc ราคา 39,990.-

แพทย์ประเมินโครงหน้าก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล
กดจองคิว หรือพิมพ์ทักแชทนี้ได้เลยค่ะ`;

const SCULPTRA_MSG = `✨ SCULPTRA 15,990.- / ขวด (ปกติ 24,995.-)
เพียง 10 สิทธิ์ · 1–15 พ.ย. นี้ · คนละไม่เกิน 2 ขวด
กด "กดรับสิทธิ์" ในการ์ดด้านล่าง ระบบจะบอกทันทีว่าได้สิทธิ์ที่เท่าไร 👇`;

const SCULPTRA_R2 = `🔥 Sculptra 15,990.- เหลืออีก {เหลือ} สิทธิ์ (จาก 10)
ถึง 15 พ.ย. นี้ หรือจนกว่าสิทธิ์จะหมด · คนละไม่เกิน 2 ขวด
ใครกดรับสิทธิ์ไว้แล้ว ไม่ต้องกดซ้ำนะคะ 🙏 ยังไม่ได้กด กด "กดรับสิทธิ์" ในการ์ดด้านล่าง ระบบจะบอกลำดับทันทีค่ะ 👇`;

const FRIENDS_MSG = `🎁 ชวนเพื่อนมาสวยด้วยกัน ตั้งแต่วันนี้ – 15 ธ.ค.
เพื่อนใหม่ได้ปรึกษาฟรี + เครดิต 1,000 บาท · คุณได้เครดิต 1,500 บาทต่อเพื่อน 1 คน
ชวนสำเร็จครบ 3 คน รับ Vitaran 1 cc ฟรี
กด "รับลิงก์ชวนเพื่อนของฉัน" ด้านล่าง แล้วส่งให้เพื่อนได้เลยค่ะ 👇`;

const CB = (group: "A" | "B" | "C", label: string, message: string): MediaSet =>
  ({ key: `comeback-${group.toLowerCase()}`, label: `คิดถึงนะ ${group} · ${label} (การ์ดส่วนตัว + ของขวัญ)`, images: [], previews: [], message, comeback: group });

const E11_MSG = `🎉 11.11 วันนี้วันเดียวค่ะ

New Doublo 2.0 ไม่จำกัดช็อต + Vitaran 1 cc
💙 11,111.- เพียง 11 สิทธิ์ (เหลือ {เหลือ} สิทธิ์)

กดรับสิทธิ์ภายในวันนี้ เข้ารับบริการได้ถึง 30 พ.ย.
จำนวนช็อตตามที่แพทย์ประเมิน · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปรอื่นไม่ได้
👉 กดปุ่ม “กดรับสิทธิ์” ในการ์ดด้านล่างได้เลยค่ะ`;

export const MEDIA: MediaSet[] = [
  CB("A", "ถึงรอบโบทูลินัม", `สวัสดีค่ะ {ชื่อ} 😊 ห่างหายไป {ห่าง} แล้ว ครบรอบโบทูลินัมพอดีเลยค่ะ ถ้าริ้วรอยเริ่มกลับมา คุณหมอมีคิวว่างสัปดาห์นี้ เลือกวันที่สะดวกได้เลยนะคะ`),
  CB("B", "ฟิลเลอร์ / ยกกระชับ", `สวัสดีค่ะ {ชื่อ} 😊 ห่างหายไป {ห่าง} แล้ว ถึงเวลาให้คุณหมอประเมินโครงหน้าอีกครั้ง ดูว่าตรงไหนควรเติมหรือดูแลต่อ เลือกวันที่สะดวกได้เลยนะคะ`),
  CB("C", "สกินบูสเตอร์ห่างหาย", `สวัสดีค่ะ {ชื่อ} 😊 ห่างหายไป {ห่าง} แล้ว สกินบูสเตอร์ได้ผลดีเมื่อทำต่อเนื่องเป็นคอร์สนะคะ กลับมาให้คุณหมอดูผิวและวางแผนรอบถัดไปได้เลยค่ะ`),
  { ...set("1111-2611-card", "11.11 Doublo + Vitaran 11,111 · ข้อความ + การ์ดกดรับสิทธิ์ (เหลือ X สิทธิ์จริงตอนส่ง)", "1111-2611", 1, "1x1", E11_MSG, "reachable=1"), promo: "1111-2611", liveLeft: true, from: "2026-11-11T00:00:00+07:00", until: "2026-11-11T23:59:59+07:00" },
  { ...set("friends-2611", "ชวนเพื่อนมาสวยด้วยกัน · ข้อความ + การ์ด (3 พ.ย. – 15 ธ.ค.)", "friends-2611", 1, "1x1", FRIENDS_MSG, "reachable=1"), invite: true, from: "2026-11-03T00:00:00+07:00", until: "2026-12-15T23:59:59+07:00" },
  { ...set("sculptra-2611-card", "Sculptra 15,990 · ข้อความ + การ์ดกดรับสิทธิ์ (10 สิทธิ์)", "sculptra-2611", 1, "1x1", SCULPTRA_MSG, "reachable=1"), promo: "sculptra-2611", from: "2026-11-01T00:00:00+07:00", until: "2026-11-15T23:59:59+07:00" },
  { ...set("sculptra-2611-r2", "Sculptra รอบ 2 · เหลือ X สิทธิ์ (ใส่ตัวเลขจริงตอนส่ง)", "sculptra-2611", 1, "1x1", SCULPTRA_R2, "reachable=1"), promo: "sculptra-2611", liveLeft: true, from: "2026-11-01T00:00:00+07:00", until: "2026-11-15T23:59:59+07:00" },
  { ...set("haca-2610-1x1", "HArmonyCa Early Bird (ถึง 31 ต.ค. 69) · 1:1", "haca-2610", 1, "1x1", HACA_MSG, "reachable=1"), until: "2026-10-31T23:59:59+07:00" },
  { ...set("haca-2610-4x5", "HArmonyCa Early Bird (ถึง 31 ต.ค. 69) · 4:5", "haca-2610", 1, "4x5", HACA_MSG, "reachable=1"), until: "2026-10-31T23:59:59+07:00" },
  set("vitaran-2610-1x1", "Vitaran ต.ค. 69 · 3 รูป 1:1", "vitaran-2610", 3, "1x1", VITARAN_MSG, "skin=1&reachable=1"),
  set("vitaran-2610-4x5", "Vitaran ต.ค. 69 · 3 รูป 4:5", "vitaran-2610", 3, "4x5", VITARAN_MSG, "skin=1&reachable=1"),
];

/** Sets that can be sent now (a promo's pictures disappear after its deadline). */
export const liveMedia = (now = new Date()) => MEDIA.filter((m) => (!m.from || now >= new Date(m.from)) && (!m.until || now <= new Date(m.until)));
export const mediaSet = (key: string | null | undefined, now = new Date()) => liveMedia(now).find((m) => m.key === key) ?? null;

/** What a campaign stores: a promo marker (sent as text + claim card) or the picture URLs. */
export const mediaImages = (m: MediaSet | null) => (m?.comeback ? [`comeback:${m.comeback}`] : m?.invite ? ["invite:friends"] : m?.promo ? [`promo:${m.promo}${m.liveLeft ? "@left" : ""}`] : absImages(m?.images ?? []));

/** Absolute https URLs (LINE refuses relative or http). Max 4 images so the text still fits in one push (5 objects). */
export function absImages(paths: string[], base = process.env.APP_URL || "") {
  return paths.slice(0, 4).map((p) => (/^https:\/\//.test(p) ? p : `${base.replace(/\/$/, "")}${p}`)).filter((u) => /^https:\/\//.test(u));
}
