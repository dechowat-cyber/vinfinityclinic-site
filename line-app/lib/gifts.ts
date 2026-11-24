// "ปฏิทินของขวัญ สวยก่อนปีใหม่" (doctor's decision 2026-11-24): one box per day, 1–31 Dec 2026.
// Not a lucky draw: every person who opens a given day's box gets the same offer (no random prizes, no computer draw),
// so it stays outside the Gambling Act's lucky-draw licence. Every gift is tied to a programme and has written conditions
// (MOPH ad rules: "ฟรี/ส่วนลด" always with conditions, services written as "โปรแกรม…", no drug or device brand names here).
// Seat numbers and which gift falls on which day are the doctor's to change: edit GIFT_TYPES / SCHEDULE only.

export const GIFT_MONTH = "2026-12";
export const GIFT_YEAR_END = "2026-12-31T23:59:59+07:00";
export const GIFT_START = "2026-12-01T00:00:00+07:00";
export const GIFT_USE_BY = "31 ม.ค. 70";
export const GIFT_PAGE = "/gifts";

export type GiftType = {
  title: string;      // headline on the box and the LINE card
  price: string;      // big line
  was?: string;       // struck-through regular price
  cond: string;       // the one condition that makes it a gift, not a giveaway
  limit: number;      // seats that day
  kb: string;         // English line for the AI prompt
  categories: string[];
  icon: string;       // emoji on the opened box
};

export const GIFT_TYPES = {
  off5000: { title: "ส่วนลด 5,000 บาท", price: "ลด 5,000.-", cond: "เมื่อทำโปรแกรมใดก็ได้ครบ 30,000 บาท ในบิลเดียว", limit: 10, icon: "💎",
    kb: "5,000 THB off a bill of 30,000 THB or more (any programme, one bill)", categories: ["ฟิลเลอร์", "ยกกระชับ", "กระตุ้นคอลลาเจน", "ผิว"] },
  off2000: { title: "ส่วนลด 2,000 บาท", price: "ลด 2,000.-", cond: "เมื่อทำโปรแกรมใดก็ได้ครบ 15,000 บาท ในบิลเดียว", limit: 20, icon: "🎀",
    kb: "2,000 THB off a bill of 15,000 THB or more (any programme, one bill)", categories: ["ฟิลเลอร์", "ยกกระชับ", "ผิว"] },
  off1000: { title: "ส่วนลด 1,000 บาท", price: "ลด 1,000.-", cond: "เมื่อทำโปรแกรมใดก็ได้ครบ 8,000 บาท ในบิลเดียว", limit: 30, icon: "✨",
    kb: "1,000 THB off a bill of 8,000 THB or more (any programme, one bill)", categories: ["ฟิลเลอร์", "ยกกระชับ", "ผิว"] },
  filler: { title: "โปรแกรมฉีดฟิลเลอร์ HA", price: "8,990.- / cc", was: "9,990.-", cond: "จำนวน cc และตำแหน่งตามการประเมินของแพทย์ · คุณหมอเช็กฟิลเลอร์เดิมก่อนเติม", limit: 20, icon: "💉",
    kb: "HA filler programme 8,990 THB per cc (regular 9,990); the doctor reviews existing filler first and decides cc and areas", categories: ["ฟิลเลอร์"] },
  drip: { title: "โปรแกรมดริปผิว 1 ครั้ง", price: "ฟรี", cond: "เมื่อทำโปรแกรมใดก็ได้ครบ 5,000 บาท ในบิลเดียว · แพทย์ประเมินความเหมาะสมก่อน", limit: 15, icon: "💧",
    kb: "one skin drip session free with any programme bill of 5,000 THB or more; the doctor checks suitability first", categories: ["ผิว"] },
  collagen: { title: "โปรแกรมกระตุ้นคอลลาเจน", price: "ซื้อ 1 แถม 1", cond: "ซื้อ 1 ขวดราคาปกติ รับเพิ่ม 1 ขวด ใช้ในแผนการรักษาของคุณหมอ", limit: 5, icon: "🎁",
    kb: "collagen-stimulator (PLLA) programme buy 1 vial at regular price, get 1 more vial for the doctor's treatment plan", categories: ["กระตุ้นคอลลาเจน", "ยกกระชับ"] },
  emlift: { title: "โปรแกรม EM Lift ราคา Early Bird", price: "18,000.- / คอร์ส", was: "23,960.-", cond: "กลับมา 1 วัน · คอร์ส 4 ครั้งต่อ 1 จุด (สัปดาห์ละครั้ง) · โปรแกรมคลื่นแม่เหล็กไฟฟ้า ไม่ใช้เข็ม", limit: 10, icon: "⚡",
    kb: "EM Lift (non-needle electromagnetic programme) 4-session course 18,000 THB per area (regular 23,960)", categories: ["ยกกระชับ"] },
  booster: { title: "โปรแกรมสกินบูสเตอร์ PN", price: "8,990.- / กล่อง", was: "9,990.-", cond: "ไม่ต้องซื้อ 4 กล่อง · กล่องละ 2 cc · แพทย์ประเมินผิวก่อน", limit: 15, icon: "🌿",
    kb: "PN skin booster programme 8,990 THB per box (2 cc) without the usual 4-box minimum (regular 9,990)", categories: ["สกินบูสเตอร์", "ผิว"] },
  lift: { title: "โปรแกรม New Doublo 2.0 แถมดริปผิว", price: "แถมดริปผิว 1 ครั้ง", cond: "เมื่อทำโปรแกรม New Doublo 2.0 ราคาปกติ · จำนวนช็อตตามการประเมินของแพทย์", limit: 10, icon: "🌟",
    kb: "with a New Doublo 2.0 lifting programme at the regular price, one skin drip session is included", categories: ["ยกกระชับ", "ผิว"] },
  consult: { title: "ประเมินโครงหน้า + ถ่ายภาพมาตรฐาน", price: "ฟรี", cond: "เฉพาะการปรึกษาและถ่ายภาพ ไม่รวมค่าหัตถการ · ไม่มีขั้นต่ำ", limit: 30, icon: "📸",
    kb: "free face assessment with the doctor plus standard photos (consultation only, no treatment included)", categories: ["ฟิลเลอร์", "ยกกระชับ", "ผิว"] },
} satisfies Record<string, GiftType>;

export type GiftKey = keyof typeof GIFT_TYPES;

// Big days: 1 (opening), 12 (12.12), 25 (Christmas), 31 (year end). Weekends carry the bigger offers.
const SCHEDULE: GiftKey[] = [
  "off5000", "consult", "off1000", "drip", "filler", "booster", "emlift",       // 1–7
  "off2000", "consult", "lift", "off1000", "collagen", "drip", "filler",        // 8–14
  "off2000", "booster", "consult", "emlift", "off1000", "drip", "off5000",      // 15–21
  "filler", "off2000", "lift", "drip", "booster", "off1000", "emlift",          // 22–28
  "off2000", "filler", "off5000",                                               // 29–31
];
const BIG = new Set([1, 12, 25, 31]);
const LIMIT_OVERRIDE: Record<number, number> = { 25: 25 };

export type Gift = GiftType & { day: number; type: GiftKey; key: string; from: string; until: string; big: boolean; claimText: string; image: string; preview: string };

const pad = (n: number) => String(n).padStart(2, "0");
export const GIFTS: Gift[] = SCHEDULE.map((type, i) => {
  const day = i + 1, d = pad(day);
  return { ...GIFT_TYPES[type], ...(LIMIT_OVERRIDE[day] ? { limit: LIMIT_OVERRIDE[day] } : {}), day, type, key: `gift-2612-${d}`,
    from: `${GIFT_MONTH}-${d}T00:00:00+07:00`, until: `${GIFT_MONTH}-${d}T23:59:59+07:00`, big: BIG.has(day),
    claimText: `ขอรับสิทธิ์ของขวัญวันที่ ${day} ธ.ค. ค่ะ`,
    image: `/campaign/gift-2612-${d}/1-1x1.jpg`, preview: `/campaign/gift-2612-${d}/1-1x1-p.jpg` };
});

/** Bangkok calendar day (1–31) of December 2026, or null outside it. */
export function giftDay(now = new Date()): number | null {
  const bkk = new Date(now.getTime() + 7 * 3600e3);
  if (bkk.getUTCFullYear() !== 2026 || bkk.getUTCMonth() !== 11) return null;
  return bkk.getUTCDate();
}
export const todayGift = (now = new Date()) => { const d = giftDay(now); return d ? GIFTS[d - 1] : null; };

export const GIFT_RULES = [
  "เปิดได้วันละ 1 กล่อง กดรับสิทธิ์ใน LINE ภายในวันนั้น (ถึง 23:59 น.)",
  "คนละ 1 สิทธิ์ต่อกล่อง · สิทธิ์มีจำนวนจำกัดต่อวัน",
  "กดรับแล้วเลือกวันนัดภายใน 48 ชม. · ใช้สิทธิ์ได้ถึง " + GIFT_USE_BY,
  "แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง",
  "ใช้ร่วมกับโปรโมชั่นหรือแพ็กเกจอื่นไม่ได้ · ไม่สามารถแลกเป็นเงินสด",
];

/** "ขอรับสิทธิ์ของขวัญวันที่ 5 ธ.ค." → 5 */
export const GIFT_CLAIM = /ของขวัญ\s*(?:วันที่)?\s*(\d{1,2})\s*ธ\.?\s*ค/;
export const GIFT_ASK = /ปฏิทิน|ของขวัญ|เปิดกล่อง|สวยก่อนปีใหม่|gift/i;
