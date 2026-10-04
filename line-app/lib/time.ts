// Bangkok has no DST: UTC+7 all year, so plain offset maths is safe.
export const TZ_OFFSET_MIN = 7 * 60;

/** "2026-10-05" + "14:30" (Bangkok) -> Date (UTC instant) */
export function bkk(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+07:00`);
}

/** Date -> { date: "YYYY-MM-DD", time: "HH:MM", weekday: 0-6 (Sun=0) } in Bangkok */
export function parts(d: Date) {
  const t = new Date(d.getTime() + TZ_OFFSET_MIN * 60000);
  const iso = t.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16), weekday: t.getUTCDay() };
}

export function todayBkk(now = new Date()) { return parts(now).date; }

export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const TH_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "วันจันทร์ 5 ต.ค. 2569" */
export function thaiDate(d: Date) {
  const p = parts(d);
  const [y, m, day] = p.date.split("-").map(Number);
  return `วัน${TH_DAYS[p.weekday]} ${day} ${TH_MONTHS[m - 1]} ${y + 543}`;
}

export function thaiTime(d: Date) { return `${parts(d).time} น.`; }

export function minutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function hhmm(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}
