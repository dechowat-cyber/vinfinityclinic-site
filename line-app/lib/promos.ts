import { q, one } from "./db";
import { logTouch } from "./crm";
import { image, broadcastText } from "./messages";
import { absImages } from "./campaignMedia";
import { bookUrl } from "./link";
import { thaiDate, thaiTime } from "./time";
import { notifyStaff } from "./notify";
import type { Msg } from "./line";
import { refEventKb } from "./referral";
import { GIFTS, GIFT_ASK, GIFT_CLAIM, GIFT_PAGE, GIFT_USE_BY, GIFT_START, GIFT_YEAR_END, todayGift } from "./gifts";

// Time-boxed promotions that work without the LINE message quota (every message here is a reply, which is free):
//  1) a customer who asks about the product, taps "โปรเดือนนี้" in the rich menu, or adds the OA gets the promo;
//  2) limited promos have a "กดรับสิทธิ์" button: a live counter of seats, held 48 h until the person books;
//  3) the team sends it one by one in LINE OA Manager chat (also free) from /staff/leads#promo.
// A promo runs only between `from` and `until`, so an expired price is never sent or quoted.

export type PromoCard = { hero: string; title: string; price: string; was?: string; lines: string[]; claimText: string; detailUrl?: string };
export type Promo = {
  key: string; label: string; from?: string; until: string;
  trigger: RegExp; image: string; preview: string;
  text: string; ask: string;
  /** limited seats: how many, how long a seat is held before the person books */
  limit?: number; holdHours?: number; maxPer?: string;
  card?: PromoCard;
  /** one line for น้องวิน / the lead agent while the promo runs */
  kb: string;
  /** who is worth a personal message: treatment categories and words in what they asked */
  categories: string[]; interest: string;
};

const NAVY = "#1E3470", MUTED = "#5A6480";

/** Never answer a complaint or an after-care problem with an offer. */
const NOT_SALES = /บวม|ช้ำ|ปวด|เจ็บ|แดง|ร้อน|คัน|ผิดปกติ|แพ้|สลาย|ไม่พอใจ|ร้องเรียน|คืนเงิน|เป็นก้อน|ไข้/;
/** Asking about promotions in general → the running one(s). */
const GENERIC = /^(โปร(เดือนนี้|โมชั่น)?|มีโปร.*|โปรอะไร.*|โปรโมชั่น.*)$/;
/** "สนใจ" alone while a promo runs almost always means the promo. */
const BARE = /^(สนใจ|ขอรายละเอียด|ขอข้อมูล|ขอราคา|interested)/i;
/** Wants the seat: the card's button posts "ขอรับสิทธิ์ …". */
const CLAIM = /รับสิทธิ์/;

const SITE = "https://vinfinity-line.vercel.app";
/** One promo per December day from the gift calendar; only that day's box is live, so a bare "รับสิทธิ์" means today's gift. */
const GIFT_PROMOS: Promo[] = GIFTS.map((g) => ({
  key: g.key,
  label: `ของขวัญวันที่ ${g.day} ธ.ค. · ${g.title} · ${g.limit} สิทธิ์`,
  from: g.from, until: g.until,
  trigger: GIFT_ASK,
  image: g.image, preview: g.preview,
  limit: g.limit, holdHours: 48, maxPer: `คนละ 1 สิทธิ์ · ใช้ได้ถึง ${GIFT_USE_BY}`,
  card: {
    hero: g.image,
    title: `🎁 ของขวัญวันที่ ${g.day} ธ.ค. · ${g.title}`,
    price: g.price, ...(g.was ? { was: `ปกติ ${g.was}` } : {}),
    lines: [g.cond, `เพียง ${g.limit} สิทธิ์ · กดรับได้วันนี้วันเดียว · คนละ 1 สิทธิ์ · ใช้ได้ถึง ${GIFT_USE_BY}`, "แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปร/แพ็กเกจอื่นไม่ได้"],
    claimText: g.claimText,
    detailUrl: `${SITE}${GIFT_PAGE}?s=line`,
  },
  text: `🎁 ปฏิทินของขวัญ สวยก่อนปีใหม่ · กล่องวันที่ ${g.day} ธ.ค.
${g.title} ${g.price}${g.was ? ` (ปกติ ${g.was})` : ""}
${g.cond}

เพียง ${g.limit} สิทธิ์ กดรับได้วันนี้วันเดียว · ใช้ได้ถึง ${GIFT_USE_BY}
แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปรอื่นไม่ได้`,
  ask: g.claimText,
  kb: `December gift calendar 'ปฏิทินของขวัญ สวยก่อนปีใหม่' (one box per day, 1–31 Dec 2026, same offer for everyone that day, not a lucky draw). Today's box (${g.day} December): ${g.kb}. Only ${g.limit} places today, 1 per person, claim today in LINE by tapping 'กดรับสิทธิ์' (or typing '${g.claimText}'), choose an appointment within 48 hours, use by 31 January 2027. Not combined with other promotions. Calendar page: ${SITE}${GIFT_PAGE}. Do not reveal future days' gifts. Results vary.`,
  categories: g.categories,
  interest: "ปฏิทิน|ของขวัญ|ปีใหม่|ฟิลเลอร์|filler|ยกกระชับ|ผิว|ดริป|คอลลาเจน|em lift|สกินบูสเตอร์",
}));

/** Replies about the calendar that are not today's box: a claim for another day, or a question before 1 Dec / after 31 Dec. */
export function giftNotice(text: string, now = new Date()): Msg[] | null {
  const today = todayGift(now);
  const link = `${SITE}${GIFT_PAGE}?s=line`;
  const c = GIFT_CLAIM.exec(text);
  if (c && (!today || today.day !== Number(c[1]))) {
    const head = now.getTime() < new Date(GIFT_START).getTime() ? `กล่องวันที่ ${c[1]} ธ.ค. ยังไม่เปิดค่ะ 🎁` : `กล่องวันที่ ${c[1]} ธ.ค. หมดเวลากดรับแล้วค่ะ 🙏`;
    return [{ type: "text", text: today ? `${head}
วันนี้เปิดกล่องวันที่ ${today.day} ธ.ค. แล้ว: ${today.title} ${today.price}
พิมพ์ “รับสิทธิ์” เพื่อรับของขวัญวันนี้ หรือดูปฏิทินที่ ${link}` : `${head}
เปิดดูปฏิทินของขวัญได้ที่ ${link}` }];
  }
  if (today || !/ปฏิทิน|เปิดกล่อง|สวยก่อนปีใหม่|ของขวัญ\s*ปีใหม่/.test(text)) return null;
  if (now.getTime() < new Date(GIFT_START).getTime() && now.getTime() > new Date("2026-11-20T00:00:00+07:00").getTime())
    return [{ type: "text", text: `🎁 ปฏิทินของขวัญ สวยก่อนปีใหม่ เปิดกล่องแรก 1 ธ.ค. นี้ค่ะ\nเปิดได้วันละ 1 กล่อง ทุกคนได้ของขวัญเดียวกันในวันนั้น สิทธิ์มีจำนวนจำกัดต่อวัน\nกดดูปฏิทินและชวนเพื่อนได้ที่ ${link}` }];
  if (now.getTime() > new Date(GIFT_YEAR_END).getTime() && now.getTime() < new Date("2027-01-31T23:59:59+07:00").getTime())
    return [{ type: "text", text: `ปฏิทินของขวัญปิดแล้วค่ะ ขอบคุณที่ร่วมสนุกนะคะ 💙 ใครรับสิทธิ์ไว้แล้ว ใช้ได้ถึง ${GIFT_USE_BY} ค่ะ` }];
  return null;
}

export const PROMOS: Promo[] = [...GIFT_PROMOS, {
  // December filler check (doctor's decision 2026-11-24), replaced the same afternoon by the December gift calendar (lib/gifts.ts)
  key: "fillercheck-2612",
  label: "เช็กฟิลเลอร์ก่อนปีใหม่ 8,990/cc · 20 สิทธิ์ (24 พ.ย.–31 ธ.ค. 69)",
  from: "2026-11-24T00:00:00+07:00",
  until: "2026-11-24T17:00:00+07:00",
  trigger: /เช็[กค]\s*ฟิลเลอร์|ฟิลเลอร์\s*ก่อนปีใหม่|ฟิลเลอร์ปีใหม่|8,?990|ฟิลเลอร์|filler/i,
  image: "/campaign/fillercheck-2612/1-1x1.jpg",
  preview: "/campaign/fillercheck-2612/1-1x1-p.jpg",
  limit: 20, holdHours: 48, maxPer: "คนละ 1 สิทธิ์ · จำนวน cc ตามที่แพทย์ประเมิน",
  card: {
    hero: "/campaign/fillercheck-2612/1-1x1.jpg",
    title: "เช็กฟิลเลอร์ก่อนปีใหม่",
    price: "8,990 บาท / cc",
    was: "ปกติ 9,990 บาท / cc",
    lines: ["โปรแกรมฉีดฟิลเลอร์ HA · คุณหมอประเมินฟิลเลอร์เดิมก่อนเติมทุกครั้ง", "เพียง 20 สิทธิ์ · คนละ 1 สิทธิ์ · ถึง 31 ธ.ค. · เลือกวันนัดภายใน 48 ชม.", "จำนวน cc และตำแหน่งตามการประเมินของแพทย์ · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปร/แพ็กเกจอื่นไม่ได้"],
    claimText: "ขอรับสิทธิ์เช็กฟิลเลอร์ 8,990 ค่ะ",
  },
  text: `✨ เช็กฟิลเลอร์ก่อนปีใหม่ · โปรแกรมฉีดฟิลเลอร์ HA

ฟิลเลอร์เดิมอาจยังอยู่มากกว่าที่คิด
คุณหมอประเมินก่อนเติมทุกครั้ง บางคนคำตอบคือยังไม่ต้องเติม
1) เล่าประวัติ เคยฉีดที่ไหน กี่ cc เมื่อไหร่
2) ถ่ายภาพมาตรฐาน ประเมินทีละจุด
3) เติมเท่าที่จำเป็นตามแผนของคุณหมอ

💙 8,990.- / cc (ปกติ 9,990.-) เพียง 20 สิทธิ์ ถึง 31 ธ.ค. นี้
คนละ 1 สิทธิ์ · จำนวน cc และตำแหน่งตามการประเมินของแพทย์ · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปรอื่นไม่ได้
👉 กดปุ่ม “กดรับสิทธิ์” ในการ์ดด้านล่าง หรือพิมพ์ “รับสิทธิ์เช็กฟิลเลอร์” ได้เลยค่ะ`,
  ask: "ขอรับสิทธิ์เช็กฟิลเลอร์ 8,990 ค่ะ",
  kb: "December filler check 'เช็กฟิลเลอร์ก่อนปีใหม่' (24 November – 31 December 2026): HA filler programme 8,990 THB per cc (regular 9,990 THB per cc). The doctor first reviews the patient's previous filler (where, how many cc, when) with standard photos and only adds what is needed; for some patients the answer is no filler needed yet. Number of cc and areas are decided by the doctor. Only 20 places, 1 per person, not combined with other promotions. Claim in the clinic's LINE by typing 'เช็กฟิลเลอร์' and tapping 'กดรับสิทธิ์', then choose an appointment within 48 hours. Results vary; do not promise specific results or duration.",
  categories: ["ฟิลเลอร์"],
  interest: "ฟิลเลอร์|filler|ร่องแก้ม|ใต้ตา|คาง|จมูก|ขมับ|ปาก|กรอบหน้า|แก้มตอบ|harmony|haca|sculptra",
}, {
  // 11.11 one-day offer (doctor's decision 2026-11-11): first in the list so a bare "รับสิทธิ์" today means this one
  key: "1111-2611",
  label: "11.11 สวยครบ 2 จุด 11,111 · 11 สิทธิ์",
  from: "2026-11-11T00:00:00+07:00",
  until: "2026-11-11T23:59:59+07:00",
  trigger: /11[.\/]11|11,?111|2\s*จุด|สองจุด|doublo|ดับโบล|ดูโบล|ดับเบิ้ลโล|hifu|ไฮฟู|vitaran|ไวทาแรน|วิทาแรน/i,
  image: "/campaign/1111-2611/1-1x1.jpg",
  preview: "/campaign/1111-2611/1-1x1-p.jpg",
  limit: 11, holdHours: 48, maxPer: "คนละ 1 สิทธิ์",
  card: {
    hero: "/campaign/1111-2611/1-1x1.jpg",
    title: "11.11 สวยครบ 2 จุด",
    price: "11,111 บาท",
    lines: ["คุณหมอเลือกให้ 2 จาก 3: ฟิลเลอร์ HA 1 cc · New Doublo 2.0 หัว Pen ไม่จำกัดช็อต · Vitaran 1 cc", "เพียง 11 สิทธิ์ · กดรับสิทธิ์ภายในวันนี้ (11 พ.ย.) · คนละ 1 สิทธิ์ · เลือกวันนัดภายใน 48 ชม. · เข้ารับบริการได้ถึง 30 พ.ย.", "แพทย์เป็นผู้เลือก 2 จุดและจำนวนช็อตตามการประเมิน · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปร/แพ็กเกจอื่นไม่ได้"],
    claimText: "ขอรับสิทธิ์ 11.11 ค่ะ",
  },
  text: `🎉 11.11 สวยครบ 2 จุด วันนี้วันเดียว

คุณหมอประเมินรายเคส แล้วเลือกให้ 2 จาก 3
• ฟิลเลอร์ HA 1 cc
• New Doublo 2.0 หัว Pen ไม่จำกัดช็อต
• Vitaran 1 cc
💙 11,111.- เพียง 11 สิทธิ์

กดรับสิทธิ์ภายในวันนี้ แล้วเลือกวันนัดภายใน 48 ชม. เข้ารับบริการได้ถึง 30 พ.ย.
แพทย์เป็นผู้เลือก 2 จุดและจำนวนช็อตตามการประเมิน · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปร/แพ็กเกจอื่นไม่ได้
👉 กดปุ่ม “กดรับสิทธิ์” ในการ์ดด้านล่าง หรือพิมพ์ “รับสิทธิ์ 11.11” ได้เลยค่ะ`,
  ask: "ขอรับสิทธิ์ 11.11 ค่ะ",
  kb: "11.11 one-day offer 'สวยครบ 2 จุด' (claim on 11 November 2026 only): 11,111 THB for 2 of these 3, chosen by the doctor after assessing the face: HA filler 1 cc, New Doublo 2.0 Pen handpiece with no shot limit (the doctor sets the number of shots), Vitaran 1 cc. Only 11 places, 1 per person, not combined with other promotions. Claim in the clinic's LINE by typing '11.11' and tapping 'กดรับสิทธิ์', choose an appointment within 48 hours, visit by 30 November 2026. Results vary.",
  categories: ["ยกกระชับ", "สกินบูสเตอร์", "ผิว", "ฟิลเลอร์"],
  interest: "doublo|hifu|ไฮฟู|ยกกระชับ|กระชับ|หย่อน|vitaran|ไวทาแรน|สกินบูสเตอร์|booster|รูขุมขน|ผิว|ฟิลเลอร์|filler|ร่องแก้ม|ใต้ตา|คาง",
}, {
  // EM Lift launch (doctor's brief 2026-11-15): early bird 4,500 per area, regular 5,990 after; end date 30 Nov is an assumption to confirm
  key: "emlift-2611",
  label: "EM Lift Early Bird 4,500/จุด/ครั้ง · คอร์ส 4 ครั้ง 18,000 (ถึง 30 พ.ย. 69)",
  from: "2026-11-15T00:00:00+07:00",
  until: "2026-11-30T23:59:59+07:00",
  trigger: /em\s*-?\s*lift|อีเอ็ม\s*ลิ[ฟฟ]ท์?|early\s*bird|เออร์ลี่|electromagnetic|แม่เหล็ก/i,
  image: "/campaign/emlift-2611/1-1x1.jpg",
  preview: "/campaign/emlift-2611/1-1x1-p.jpg",
  text: `✨ โปรแกรมใหม่ที่ Vinfinity · โปรแกรม EM Lift
โปรแกรมคลื่นแม่เหล็กไฟฟ้า ไม่ใช้เข็ม ทำได้ทั้งผู้หญิงและผู้ชาย

💙 Early Bird 4,500.- ต่อจุด ต่อครั้ง (ปกติ 5,990.-) ถึง 30 พ.ย. นี้
เลือกจุดได้: หน้าผาก · ใต้ตา · แก้ม · ใต้คาง · คอ · บ่า
(ใต้ตาและแก้มนับข้างละ 1 จุด)
คอร์ส 4 ครั้งตามโปรแกรม (สัปดาห์ละครั้ง) 18,000.- ต่อจุด · ปกติ 23,960.-

แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล
กดปุ่มด้านล่าง หรือพิมพ์วัน-เวลาที่สะดวกได้เลยค่ะ`,
  ask: "สนใจ EM Lift Early Bird ขอจองคิวค่ะ",
  kb: "EM Lift (new, non-needle electromagnetic treatment; pads are placed on the chosen areas; for women and men). Early Bird until 30 November 2026: 4,500 THB per area per session (regular 5,990 THB per area per session afterwards); the full 4-session programme is 18,000 THB per area at the Early Bird price (regular 23,960 THB). Areas: forehead, under-eye (each side counts as 1 area), cheek (each side counts as 1 area), under the chin, neck, shoulders. Recommended programme: 4 sessions, one week apart. For several areas, multiply per area; hand over to staff to confirm the total. Do not state specific results, duration of effect or downtime; the doctor assesses first; results vary.",
  categories: ["ยกกระชับ"],
  interest: "em lift|emlift|ยกกระชับ|กระชับ|หย่อน|ไม่ใช้เข็ม|กลัวเข็ม|hifu|ไฮฟู|doublo|กรอบหน้า|เหนียง|ใต้คาง",
}, {
  key: "haca-2610",
  label: "HArmonyCa Early Bird (จองภายใน 31 ต.ค. 69)",
  until: "2026-10-31T23:59:59+07:00",
  trigger: /harmony\s*ca|\bha\s*\+\s*ca|\bhaca\b|ฮาร์โมนี|ฮาโมนี|เฮอโมนิ|ฮาร์โมนิ|ฮาก้า|ยกกระชับ|ฟิลเลอร์|filler/i,
  image: "/campaign/haca-2610/1-1x1.jpg",
  preview: "/campaign/haca-2610/1-1x1-p.jpg",
  text: `✨ HArmonyCa (HA + CaHA) ฟิลเลอร์ไฮบริด
เติมเต็ม + กระชับ ในเข็มเดียว

💙 Early Bird จองภายใน 31 ต.ค. นี้
2 cc เหลือ 36,900.- (ปกติ 59,800.-)
1 cc 29,900.-
หลัง 31 ต.ค. 2 cc ราคา 39,990.-

แพทย์ประเมินโครงหน้าก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล
กดปุ่มด้านล่าง หรือพิมพ์วัน-เวลาที่สะดวกได้เลยค่ะ`,
  ask: "สนใจโปร HArmonyCa Early Bird ขอจองคิวค่ะ",
  kb: "HArmonyCa (HA + CaHA) Early Bird: book by 31 October 2026 → 2 cc 36,900 THB (regular 59,800 THB). 1 cc 29,900 THB. From 1 November 2026, 2 cc is 39,990 THB. The doctor assesses the face first; results vary.",
  categories: ["ฟิลเลอร์", "ยกกระชับ", "กระตุ้นคอลลาเจน"],
  interest: "ฟิลเลอร์|filler|harmony|haca|ฮาร์โมนี|เฮอโมนิ|ยกกระชับ|กระชับ|หย่อน|ร่องแก้ม|แก้มตอบ|ขมับ|คาง|กรอบหน้า|sculptra|สกัลป์|hifu|ไฮฟู|lift",
}, {
  key: "sculptra-2611",
  label: "Sculptra 15,990 · 10 สิทธิ์ (1–15 พ.ย. 69)",
  from: "2026-11-01T00:00:00+07:00",
  until: "2026-11-15T23:59:59+07:00",
  trigger: /sculptra|สกัลป์|สคัลป์|สกัลพ์|กระตุ้นคอลลาเจน|คอลลาเจน|plla|ผิวหย่อน|หน้าหย่อน|ยกกระชับ|ฟิลเลอร์|filler/i,
  image: "/campaign/sculptra-2611/1-1x1.jpg",
  preview: "/campaign/sculptra-2611/1-1x1-p.jpg",
  limit: 10, holdHours: 48, maxPer: "คนละไม่เกิน 2 ขวด",
  card: {
    hero: "/campaign/sculptra-2611/1-1x1.jpg",
    title: "Sculptra กระตุ้นคอลลาเจน",
    price: "15,990 บาท / ขวด",
    was: "ปกติ 24,995 บาท",
    lines: ["เพียง 10 สิทธิ์ · คนละไม่เกิน 2 ขวด · 1–15 พ.ย.", "กดรับสิทธิ์ แล้วเลือกวันนัดภายใน 48 ชม.", "แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปร/แพ็กเกจอื่นไม่ได้"],
    claimText: "ขอรับสิทธิ์ Sculptra 15,990 ค่ะ",
    detailUrl: "https://vinfinityclinic.com/sculptra/?utm_source=line&utm_medium=promo",
  },
  text: `✨ SCULPTRA กระตุ้นคอลลาเจนของผิวเอง ผิวแน่นขึ้นแบบค่อยเป็นค่อยไป

💙 15,990.- / ขวด (ปกติ 24,995.-)
เพียง 10 สิทธิ์ · คนละไม่เกิน 2 ขวด · 1–15 พ.ย. หรือจนกว่าสิทธิ์จะหมด
กดรับสิทธิ์ แล้วเลือกวันนัดภายใน 48 ชม.

แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ใช้ร่วมกับโปร/แพ็กเกจอื่นไม่ได้
👉 ตอบกลับคำว่า “รับสิทธิ์” ระบบจะแจ้งทันทีว่าได้สิทธิ์ที่เท่าไรค่ะ`,
  ask: "ขอรับสิทธิ์ Sculptra 15,990 ค่ะ",
  kb: "Sculptra promotion 1–15 November 2026: 15,990 THB per vial (regular 24,995 THB), only 10 places, at most 2 vials per person, not combined with other promotions or packages. To get a place, tap 'กดรับสิทธิ์' in the clinic's LINE (@vinfinityclinic) and book within 48 hours. The doctor assesses first; results build gradually and vary.",
  categories: ["กระตุ้นคอลลาเจน", "ยกกระชับ", "ฟิลเลอร์"],
  interest: "sculptra|สกัลป์|สคัลป์|คอลลาเจน|plla|หย่อน|ริ้วรอย|ผิวบาง|กระชับ|ยกกระชับ|ร่องแก้ม|แก้มตอบ|ขมับ|ฟิลเลอร์|filler|hifu|ไฮฟู|lift",
}];

export const activePromos = (now = new Date()) =>
  PROMOS.filter((p) => (!p.from || now.getTime() >= new Date(p.from).getTime()) && now.getTime() <= new Date(p.until).getTime());
/** Running promos plus those that ended in the last 3 weeks (their held seats still need the staff panel). */
export const panelPromos = (now = new Date()) =>
  PROMOS.filter((p) => (!p.from || now.getTime() >= new Date(p.from).getTime()) && now.getTime() <= new Date(p.until).getTime() + 21 * 864e5);
export const promoByKey = (key: string | null | undefined) => PROMOS.find((p) => p.key === key) ?? null;

/** Lines for the AI prompt (web chat and lead drafts); empty when nothing runs. */
export function promoKb(now = new Date()) {
  const lines = [...activePromos(now).map((p) => `- ${p.kb}`), refEventKb(now)].filter(Boolean);
  return lines.length ? `Current promotions (valid now, quote exactly):\n${lines.join("\n")}` : "";
}

const t = (text: string, o: Record<string, unknown> = {}) => ({ type: "text", text, wrap: true, ...o });

/** A promo as LINE messages: a card with a claim button for limited promos, otherwise image + text with a reply button. */
export function promoMessages(p: Promo, left?: number | null): Msg[] {
  if (p.card) {
    const [hero] = absImages([p.card.hero]);
    const c = p.card;
    const urgent = left != null && p.limit ? [t(`🔥 เหลืออีก ${left} สิทธิ์ จาก ${p.limit}`, { weight: "bold", size: "sm", color: "#F2622A" })] : [];
    return [{ type: "flex", altText: `${c.title} ${c.price} · สิทธิ์จำกัด`, contents: { type: "bubble",
      ...(hero ? { hero: { type: "image", url: hero, size: "full", aspectRatio: "1:1", aspectMode: "cover", action: { type: "message", label: "รับสิทธิ์", text: c.claimText } } } : {}),
      body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
        t(c.title, { weight: "bold", size: "md", color: NAVY }),
        ...urgent,
        { type: "box", layout: "baseline", spacing: "sm", contents: [t(c.price, { weight: "bold", size: "xl", color: NAVY, flex: 0 }), ...(c.was ? [t(c.was, { size: "xs", color: MUTED, decoration: "line-through", flex: 0 })] : [])] },
        ...c.lines.map((l) => t(l, { size: "xs", color: MUTED })),
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
        { type: "button", style: "primary", color: NAVY, action: { type: "message", label: "กดรับสิทธิ์", text: c.claimText } },
        ...(c.detailUrl ? [{ type: "button", style: "link", action: { type: "uri", label: "ดูรายละเอียด", uri: c.detailUrl } }] : []),
        { type: "button", style: "link", action: { type: "message", label: "🎁 ชวนเพื่อน รับเครดิต", text: "ชวนเพื่อน" } },
      ] } } }];
  }
  const [img] = absImages([p.image]);
  const [pre] = absImages([p.preview]);
  return [...(img ? [image(img, pre)] : []), broadcastText(p.text, true, p.ask)];
}

const LIVE = `(pc.status = 'confirmed' or (pc.status = 'held' and (pc.expires_at > $2 or exists (select 1 from appointments a
  where a.client_id = pc.client_id and a.created_at between pc.created_at and pc.expires_at and a.status not in ('cancelled','no_show')))))`;

/** Seats taken right now (held and not expired, booked, or confirmed by staff). */
export async function seatsUsed(p: Promo, now = new Date()) {
  return Number((await one(`select count(*)::int n from promo_claims pc where pc.promo_key = $1 and ${LIVE}`, [p.key, now.toISOString()]))?.n ?? 0);
}

/** "กดรับสิทธิ์": takes a seat for `holdHours`, or says it is already theirs, or that all seats are gone. */
export async function claimPromo(clientId: number, userId: string, p: Promo, now = new Date()): Promise<Msg[]> {
  const limit = p.limit ?? 0;
  const nowIso = now.toISOString();
  const book = bookUrl(userId, { src: `promo_${p.key}` });
  const fmt = (d: Date) => `${thaiDate(d)} ${thaiTime(d)}`;
  const mine = await one(`select pc.*, ${LIVE} as live from promo_claims pc where pc.promo_key = $1 and pc.client_id = $3 and pc.status <> 'released' order by pc.id desc limit 1`, [p.key, nowIso, clientId]);
  const card = (title: string, lines: string[], buttons: unknown[]): Msg => ({ type: "flex", altText: title, contents: { type: "bubble",
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [t(title, { weight: "bold", size: "md", color: NAVY }), ...lines.map((l) => t(l, { size: "sm", color: MUTED }))] },
    footer: { type: "box", layout: "vertical", spacing: "sm", contents: buttons } } });
  const bookBtn = { type: "button", style: "primary", color: NAVY, action: { type: "uri", label: "เลือกวันนัด", uri: book } };
  const callBtn = { type: "button", style: "link", action: { type: "message", label: "ให้ทีมติดต่อกลับ", text: "สะดวกให้ทีมติดต่อกลับค่ะ" } };
  const shareBtn = { type: "button", style: "link", action: { type: "message", label: "🎁 ชวนเพื่อน รับเครดิต", text: "ชวนเพื่อน" } };
  if (mine?.live) {
    return [card(`สิทธิ์ที่ ${mine.seat} เป็นของคุณอยู่แล้วค่ะ`, [`${p.card?.title ?? p.label} ${p.card?.price ?? ""}`.trim(), mine.status === "held" ? `เลือกวันนัดได้ถึง ${fmt(new Date(mine.expires_at))}` : "ทีมยืนยันสิทธิ์แล้ว แล้วพบกันที่คลินิกค่ะ"], [bookBtn, callBtn])];
  }
  if (mine && !mine.live) await q("update promo_claims set status = 'released', done_at = now() where id = $1", [mine.id]);
  const used = await seatsUsed(p, now);
  if (used >= limit) {
    await logTouch(clientId, "out", "promo_full", p.key);
    return [card("สิทธิ์ครบแล้วค่ะ 🙏", [`${p.card?.title ?? p.label} ${p.card?.price ?? ""} ครบ ${limit} สิทธิ์แล้ว`, "ถ้ามีสิทธิ์คืน ทีมจะทักกลับมาตามลำดับค่ะ หรือนัดปรึกษาคุณหมอก่อนได้เลย"], [{ ...bookBtn, action: { type: "uri", label: "นัดปรึกษาคุณหมอ", uri: book } }])];
  }
  const expires = new Date(now.getTime() + (p.holdHours ?? 48) * 3600e3);
  const seat = used + 1;
  await q("insert into promo_claims(promo_key, client_id, seat, expires_at, created_at) values ($1,$2,$3,$4,$5)", [p.key, clientId, seat, expires.toISOString(), nowIso]);
  await logTouch(clientId, "in", "promo_claim", p.key);
  if (!(await one("select 1 from touchpoints where client_id = $1 and kind in ('promo','promo_manual') and body = $2", [clientId, p.key]))) await logTouch(clientId, "out", "promo", p.key);
  await notifyStaff(`🎁 มีคนกดรับสิทธิ์ ${p.label} · สิทธิ์ที่ ${seat}/${limit} · ${process.env.APP_URL || ""}/staff/leads#promo`, `claim:${p.key}:${clientId}`).catch(() => false);
  return [card(`🎉 สิทธิ์ที่ ${seat} จาก ${limit} เป็นของคุณแล้วค่ะ`, [
    `${p.card?.title ?? p.label} ${p.card?.price ?? ""}${p.maxPer ? ` (${p.maxPer})` : ""}`.trim(),
    `กรุณาเลือกวันนัดภายใน ${fmt(expires)} ถ้าเลยเวลา สิทธิ์จะส่งต่อให้คนถัดไปค่ะ`,
    `เหลืออีก ${Math.max(0, limit - seat)} สิทธิ์`,
  ], [bookBtn, callBtn, shareBtn])];
}

/**
 * Free replies for a running promo. Shows the promo once per person when they ask about it (always when they ask for
 * "โปร" directly, e.g. the rich-menu tile), takes a seat when they press the claim button. Never to a complaint.
 */
export async function promoReply(clientId: number, text: string, now = new Date(), userId = ""): Promise<Msg[] | null> {
  const x = (text || "").trim();
  if (!x || x.length > 300 || NOT_SALES.test(x)) return null;
  const gn = giftNotice(x, now);
  if (gn) return gn;
  const act = activePromos(now);
  const generic = GENERIC.test(x);
  if (!act.length) return generic ? [{ type: "text", text: "ตอนนี้ยังไม่มีโปรใหม่ค่ะ ติดตามได้ที่เมนูนี้เร็วๆ นี้นะคะ 😊 ระหว่างนี้ปรึกษาคุณหมอหรือดูราคาได้จากเมนูด้านล่างเลยค่ะ" }] : null;
  const p = act.find((y) => y.trigger.test(x)) ?? (generic || CLAIM.test(x) || (x.length <= 24 && BARE.test(x)) ? act.find((y) => y.limit) ?? act[0] : undefined);
  if (!p) return null;
  if (p.limit && CLAIM.test(x)) return claimPromo(clientId, userId, p, now);
  if (generic) { // asked for the promos: show every running one (max 2 so the reply stays within 5 messages)
    const out = act.slice(0, 2).flatMap((y) => promoMessages(y));
    for (const y of act.slice(0, 2)) await logTouch(clientId, "out", "promo", y.key);
    return out;
  }
  if (await one("select 1 from touchpoints where client_id = $1 and kind in ('promo','promo_manual') and body = $2", [clientId, p.key])) return null;
  await logTouch(clientId, "out", "promo", p.key);
  return promoMessages(p);
}

/** Added to the welcome message for new friends while a promo runs (max 2 messages). */
export async function promoForWelcome(clientId: number, now = new Date()): Promise<Msg[]> {
  const p = activePromos(now).find((y) => y.limit) ?? activePromos(now)[0];
  if (!p) return [];
  await logTouch(clientId, "out", "promo", p.key);
  return promoMessages(p).slice(-2);
}

/** Claims for the staff panel. */
export async function promoClaims(p: Promo, now = new Date()) {
  return q(`select pc.*, ${LIVE} as live, c.name, c.display_name, c.phone, c.line_user_id,
      exists (select 1 from appointments a where a.client_id = pc.client_id and a.created_at >= pc.created_at and a.status not in ('cancelled','no_show')) as booked
    from promo_claims pc left join clients c on c.id = pc.client_id where pc.promo_key = $1 order by pc.id`, [p.key, now.toISOString()]);
}

/**
 * People worth a personal message, best first: those who asked about it themselves (a direct follow-up),
 * then past clients of the same kind of treatment who agreed to marketing. Anyone who declined marketing is left out.
 */
export async function promoProspects(p: Promo, limit = 50) {
  return q(`with base as (
      select c.id, c.name, c.display_name, c.phone, c.line_user_id,
        (select k.granted from consents k where k.client_id = c.id and k.type = 'marketing' order by k.created_at desc, k.id desc limit 1) as mk,
        (select string_agg(distinct t.name, ', ') from treatments t left join catalog k on k.id = t.catalog_id
          where t.client_id = c.id and (k.category = any($2) or t.name ~* $3)) as did,
        (select max(t.done_at) from treatments t left join catalog k on k.id = t.catalog_id
          where t.client_id = c.id and (k.category = any($2) or t.name ~* $3)) as did_at,
        (select max(x.created_at) from touchpoints x where x.client_id = c.id and x.direction = 'in' and x.kind = 'message' and x.body ~* $3) as asked_at,
        (select x.body from touchpoints x where x.client_id = c.id and x.direction = 'in' and x.kind = 'message' and x.body ~* $3 order by x.created_at desc limit 1) as asked,
        (select l.interest from leads l where l.client_id = c.id and l.interest ~* $3 order by l.id desc limit 1) as interest,
        (select max(x.created_at) from touchpoints x where x.client_id = c.id and x.direction = 'in') as last_in,
        (select max(x.created_at) from touchpoints x where x.client_id = c.id and x.kind in ('promo','promo_manual') and x.body = $1) as sent_at,
        (select x.kind from touchpoints x where x.client_id = c.id and x.kind in ('promo','promo_manual') and x.body = $1 order by x.created_at desc limit 1) as sent_how
      from clients c where c.line_user_id is not null and c.followed)
    select b.*, (b.asked_at is not null or b.interest is not null) as inquired,
      exists (select 1 from appointments a where a.client_id = b.id and a.status not in ('cancelled','no_show') and a.created_at >= b.sent_at) as booked
    from base b
    where coalesce(b.mk, true) and (b.asked_at is not null or b.interest is not null or (b.did is not null and b.mk))
    order by (b.sent_at is not null), (b.asked_at is not null or b.interest is not null) desc, greatest(b.asked_at, b.did_at, b.last_in) desc nulls last
    limit $4`, [p.key, p.categories, p.interest, limit]);
}

/** Sent / replied / booked for one promo, counting both the auto-reply and the manual sends. */
export async function promoStats(p: Promo) {
  return (await one(`with s as (select client_id, min(created_at) at, bool_or(kind = 'promo') auto from touchpoints
      where kind in ('promo','promo_manual') and body = $1 group by client_id)
    select count(*)::int sent, count(*) filter (where auto)::int auto,
      count(*) filter (where exists (select 1 from touchpoints t where t.client_id = s.client_id and t.direction = 'in' and t.created_at > s.at))::int replied,
      count(*) filter (where exists (select 1 from appointments a where a.client_id = s.client_id and a.created_at >= s.at and a.status not in ('cancelled','no_show')))::int booked
    from s`, [p.key])) ?? { sent: 0, auto: 0, replied: 0, booked: 0 };
}

/** Placeholder in a campaign message that becomes the live number of seats left when it is sent. */
export const LEFT_TOKEN = "{เหลือ}";

/**
 * Campaign images may carry a promo marker: "promo:<key>" (card) or "promo:<key>@left" (card + live seats left).
 * At send time "@left" becomes the real number ("@7") and {เหลือ} in the text is filled in. Throws promo_full / promo_closed.
 */
export async function resolvePromoMarker(images: string[], message: string, now = new Date()) {
  const m = images.find((u) => u.startsWith("promo:"));
  if (!m) return { images, message };
  const [key, flag] = m.slice(6).split("@");
  const p = promoByKey(key);
  if (!p || !activePromos(now).includes(p)) throw new Error("promo_closed");
  if (flag !== "left" || !p.limit) return { images: [`promo:${p.key}`], message: message.split(LEFT_TOKEN).join("") };
  const left = Math.max(0, p.limit - (await seatsUsed(p, now)));
  if (left <= 0) throw new Error("promo_full");
  return { images: [`promo:${p.key}@${left}`], message: message.split(LEFT_TOKEN).join(String(left)) };
}

/** "promo:<key>@7" → the promo and its seats-left number (null when none). */
export function parsePromoMarker(images: unknown): { promo: Promo; left: number | null } | null {
  const m = (Array.isArray(images) ? images : []).find((u): u is string => typeof u === "string" && u.startsWith("promo:"));
  if (!m) return null;
  const [key, n] = m.slice(6).split("@");
  const promo = promoByKey(key);
  return promo ? { promo, left: n && /^\d+$/.test(n) ? Number(n) : null } : null;
}

/** A seat taken outside the button (chat, phone, walk-in): recorded by staff so the counter and "เหลือ X" stay true. */
export async function addManualClaim(p: Promo, o: { clientId?: number | null; note?: string; staffId?: number | null }, now = new Date()) {
  if (!p.limit) throw new Error("not_limited");
  const used = await seatsUsed(p, now);
  if (used >= p.limit) throw new Error("promo_full");
  await q(`insert into promo_claims(promo_key, client_id, seat, status, expires_at, done_at, done_by, note, created_at) values ($1,$2,$3,'confirmed',$4,$7,$5,$6,$7)`,
    [p.key, o.clientId ?? null, used + 1, new Date(now.getTime() + 30 * 864e5).toISOString(), o.staffId ?? null, (o.note || "").slice(0, 120) || null, now.toISOString()]);
  return used + 1;
}
