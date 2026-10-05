// Pick-lists used across the booking form, pre-visit form, walk-in and consult, so nobody has to type
// what can be tapped. Values are stored as readable Thai text joined with ", ".

export const CONCERNS = [
  "ใต้ตาคล้ำ / ร่องใต้ตา", "ร่องแก้ม", "แก้มตอบ / ขมับตอบ", "คางสั้น / คางถอย", "กรอบหน้าไม่ชัด / เหนียง",
  "กรามใหญ่", "ปาก", "จมูก", "ริ้วรอยหน้าผาก / หางตา", "ผิวหย่อนคล้อย", "ผิวหมอง / รูขุมขน / หลุมสิว",
];
export const GOALS = [
  "ดูสดชื่น เป็นธรรมชาติ", "ดูอ่อนเยาว์ขึ้น", "หน้าเรียว กรอบหน้าชัด", "ยกกระชับ", "ผิวเรียบเนียน กระจ่างใส", "ปรับสัดส่วนให้สมดุล", "แก้ไขงานเดิม",
];
export const PREVIOUS = ["ไม่เคยทำ", "ฟิลเลอร์", "โบท็อกซ์", "Sculptra / กระตุ้นคอลลาเจน", "ร้อยไหม", "HIFU / เครื่องยกกระชับ", "เลเซอร์ / ทรีตเมนต์ผิว", "ศัลยกรรม"];
export const MEDS = ["ไม่มี", "ยาละลายลิ่มเลือด / แอสไพริน", "วิตามินอี / น้ำมันปลา / แปะก๊วย", "ยารักษาสิว (isotretinoin)", "ยาสเตียรอยด์ / ยากดภูมิ"];
export const CONDITIONS = ["ไม่มี", "เบาหวาน", "ความดันโลหิตสูง", "โรคภูมิคุ้มกัน / SLE", "เลือดออกง่าย", "เริมที่ปากบ่อย", "แผลเป็นนูน / คีลอยด์"];
export const ALLERGIES = ["ไม่มี", "ยาชา", "ยาปฏิชีวนะ", "อาหารทะเล", "ไข่ / โปรตีนไข่"];
export const ASSESS = ["เหมาะกับการรักษาวันนี้", "ควรทำเป็นขั้นตอน (หลายครั้ง)", "ส่งตรวจ / ปรึกษาเพิ่มก่อน", "ยังไม่แนะนำให้ทำตอนนี้"];

export const joinPick = (xs: string[], other = "") => [...xs, other.trim()].filter(Boolean).join(", ");
export function splitPick(v: string | null | undefined, options: string[]) {
  const parts = String(v ?? "").split(/,\s*/).map((x) => x.trim()).filter(Boolean);
  return { picked: parts.filter((p) => options.includes(p)), other: parts.filter((p) => !options.includes(p)).join(", ") };
}
/** Buddhist-era birth years, youngest first (age 18 to 80). */
export const birthYears = (now = new Date()) => { const be = now.getFullYear() + 543; return Array.from({ length: 63 }, (_, i) => String(be - 18 - i)); };
