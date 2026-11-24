// "ปฏิทินของขวัญ สวยก่อนปีใหม่" (doctor's decision 2026-11-24): one box per day. Launched the same night (24 Nov 23:00):
// first box (25 พ.ย.) opens at launch, then one box per Bangkok day to 31 Dec 2026 — 37 boxes.
// Not a lucky draw: every person who opens a given day's box gets the same offer (no random prizes, no computer draw),
// so it stays outside the Gambling Act's lucky-draw licence. Every gift is tied to a programme and has written conditions
// (MOPH ad rules: "ฟรี/ส่วนลด" always with conditions, services written as "โปรแกรม…", no drug or device brand names here).
// Seat numbers and which gift falls on which day are the doctor's to change: edit GIFT_TYPES / SCHEDULE only.

export const GIFT_YEAR_END = "2026-12-31T23:59:59+07:00";
export const GIFT_START = "2026-11-24T23:00:00+07:00";
export const GIFT_RANGE = "25 พ.ย. – 31 ธ.ค.";
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
  laser: { title: "โปรแกรมเลเซอร์กำจัดขน", price: "ทดลองฟรี 1 ครั้ง", cond: "เฉพาะบริเวณใต้วงแขน · สำหรับผู้ที่ยังไม่เคยทำโปรแกรมนี้ที่คลินิก · แพทย์ประเมินสภาพผิวก่อน", limit: 20, icon: "✨",
    kb: "one free laser hair removal trial session, underarms only, for people who have not had this programme at the clinic; the doctor checks the skin first", categories: ["เลเซอร์กำจัดขน"] },
  redlight: { title: "โปรแกรมฉายแสง Red Light", price: "ฟรี 1 ครั้ง", cond: "เมื่อทำโปรแกรมใดก็ได้ในวันเดียวกัน (ไม่มีขั้นต่ำ) · แพทย์ประเมินความเหมาะสมก่อน", limit: 30, icon: "🔴",
    kb: "one free red light (LED) session added on the same day as any programme, no minimum spend", categories: ["ผิว"] },
  consult: { title: "ประเมินโครงหน้า + ถ่ายภาพมาตรฐาน", price: "ฟรี", cond: "เฉพาะการปรึกษาและถ่ายภาพ ไม่รวมค่าหัตถการ · ไม่มีขั้นต่ำ", limit: 30, icon: "📸",
    kb: "free face assessment with the doctor plus standard photos (consultation only, no treatment included)", categories: ["ฟิลเลอร์", "ยกกระชับ", "ผิว"] },
} satisfies Record<string, GiftType>;

export type GiftKey = keyof typeof GIFT_TYPES;

// Big boxes: 25 พ.ย. (launch), 1 ธ.ค., 12.12, 25 ธ.ค. (Christmas), 31 ธ.ค. (year end). Weekends carry the bigger offers.
const SCHEDULE: [string, GiftKey][] = [
  ["11-25", "laser"], ["11-26", "redlight"], ["11-27", "off1000"], ["11-28", "filler"], ["11-29", "consult"], ["11-30", "off2000"],
  ["12-01", "off5000"], ["12-02", "redlight"], ["12-03", "off1000"], ["12-04", "drip"], ["12-05", "filler"], ["12-06", "booster"], ["12-07", "emlift"],
  ["12-08", "off2000"], ["12-09", "laser"], ["12-10", "lift"], ["12-11", "off1000"], ["12-12", "collagen"], ["12-13", "drip"], ["12-14", "filler"],
  ["12-15", "off2000"], ["12-16", "booster"], ["12-17", "redlight"], ["12-18", "emlift"], ["12-19", "off1000"], ["12-20", "drip"], ["12-21", "off5000"],
  ["12-22", "filler"], ["12-23", "off2000"], ["12-24", "lift"], ["12-25", "drip"], ["12-26", "booster"], ["12-27", "laser"], ["12-28", "emlift"],
  ["12-29", "off2000"], ["12-30", "filler"], ["12-31", "off5000"],
];
const BIG = new Set(["11-25", "12-01", "12-12", "12-25", "12-31"]);
const LIMIT_OVERRIDE: Record<string, number> = { "12-25": 25 };
const MON: Record<string, string> = { "11": "พ.ย.", "12": "ธ.ค." };

export type Gift = GiftType & { n: number; md: string; day: number; mon: string; label: string; type: GiftKey; key: string; from: string; until: string; big: boolean; claimText: string; image: string; preview: string };

export const GIFTS: Gift[] = SCHEDULE.map(([md, type], i) => {
  const [m, d] = md.split("-"), day = Number(d), mon = MON[m], label = `${day} ${mon}`, folder = `gift-26${m}-${d}`;
  return { ...GIFT_TYPES[type], ...(LIMIT_OVERRIDE[md] ? { limit: LIMIT_OVERRIDE[md] } : {}), n: i + 1, md, day, mon, label, type, key: folder,
    from: i === 0 ? GIFT_START : `2026-${md}T00:00:00+07:00`, until: `2026-${md}T23:59:59+07:00`, big: BIG.has(md),
    claimText: `ขอรับสิทธิ์ของขวัญวันที่ ${label} ค่ะ`,
    image: `/campaign/${folder}/1-1x1.jpg`, preview: `/campaign/${folder}/1-1x1-p.jpg` };
});

/** The box that is open right now, or null. */
export const todayGift = (now = new Date()) => GIFTS.find((g) => Date.parse(g.from) <= now.getTime() && now.getTime() <= Date.parse(g.until)) ?? null;
/** Position (1-based) of the open box, or null. */
export const giftDay = (now = new Date()) => todayGift(now)?.n ?? null;
/** The box a claim text names ("…ของขวัญวันที่ 5 ธ.ค."), or null. */
export function giftNamed(text: string): Gift | null {
  const c = GIFT_CLAIM.exec(text);
  if (!c) return null;
  const mon = /พ/.test(c[2]) ? "พ.ย." : "ธ.ค.";
  return GIFTS.find((g) => g.day === Number(c[1]) && g.mon === mon) ?? null;
}

export const GIFT_RULES = [
  "เปิดได้วันละ 1 กล่อง กดรับสิทธิ์ใน LINE ภายในวันนั้น (ถึง 23:59 น.)",
  "คนละ 1 สิทธิ์ต่อกล่อง · สิทธิ์มีจำนวนจำกัดต่อวัน",
  "กดรับแล้วเลือกวันนัดภายใน 48 ชม. · ใช้สิทธิ์ได้ถึง " + GIFT_USE_BY,
  "แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง",
  "ใช้ร่วมกับโปรโมชั่นหรือแพ็กเกจอื่นไม่ได้ · ไม่สามารถแลกเป็นเงินสด",
];

/** "ขอรับสิทธิ์ของขวัญวันที่ 5 ธ.ค." → ["5", "ธ.ค"] */
export const GIFT_CLAIM = /ของขวัญ\s*(?:วันที่)?\s*(\d{1,2})\s*(พ\.?\s*ย|ธ\.?\s*ค)/;
export const GIFT_ASK = /ปฏิทิน|ของขวัญ|เปิดกล่อง|สวยก่อนปีใหม่|gift/i;
