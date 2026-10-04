import { q } from "./db";
import type { Staff } from "./session";

export const HEALTH_FIELDS = ["birthYear", "allergies", "conditions", "medications", "pregnant", "previous", "concerns", "goals"] as const;
export const HEALTH_LABELS: Record<string, string> = {
  birthYear: "ปีเกิด (พ.ศ.)", allergies: "แพ้ยา / แพ้อาหาร / แพ้สารใด", conditions: "โรคประจำตัว", medications: "ยาหรืออาหารเสริมที่ใช้อยู่",
  pregnant: "ตั้งครรภ์หรือให้นมบุตร", previous: "เคยทำหัตถการความงามอะไรมาบ้าง และเมื่อไหร่", concerns: "เรื่องที่กังวล", goals: "อยากให้ผลลัพธ์ออกมาแบบไหน",
};
/** FR-14: health fields are visible to DR, NS, CS and BM only. */
export const HEALTH_ROLES = ["BM", "DR", "NS", "CS"];
export const canSeeHealth = (s: Staff) => HEALTH_ROLES.includes(s.role);

/** Every view of health data or photos is logged (who / when / which client). */
export async function logHealthAccess(staffId: number, clientId: number, what: string) {
  await q("insert into health_access(staff_id, client_id, what) values ($1,$2,$3)", [staffId, clientId, what]);
}
