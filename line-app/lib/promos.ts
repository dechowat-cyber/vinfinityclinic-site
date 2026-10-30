import { q, one } from "./db";
import { logTouch } from "./crm";
import { image, broadcastText } from "./messages";
import { absImages } from "./campaignMedia";

// Time-boxed promotions that work without the LINE message quota:
//  1) auto-reply: a customer who asks about the product gets the promo once, as a reply (reply messages are free);
//  2) manual list: the team sends it one by one in LINE OA Manager chat (also free), from /staff/leads#promo.
// A promo switches itself off after `until`, so an expired price is never sent or quoted.

export type Promo = {
  key: string; label: string; until: string;
  trigger: RegExp; image: string; preview: string;
  text: string; ask: string;
  /** one line for น้องวิน / the lead agent while the promo runs */
  kb: string;
  /** who is worth a personal message: treatment categories and words in what they asked */
  categories: string[]; interest: string;
};

/** Never answer a complaint or an after-care problem with an offer. */
const NOT_SALES = /บวม|ช้ำ|ปวด|เจ็บ|แดง|ร้อน|คัน|ผิดปกติ|แพ้|สลาย|ไม่พอใจ|ร้องเรียน|คืนเงิน|เป็นก้อน|ไข้/;

export const PROMOS: Promo[] = [{
  key: "haca-2610",
  label: "HArmonyCa Early Bird (จองภายใน 31 ต.ค. 69)",
  until: "2026-10-31T23:59:59+07:00",
  trigger: /harmony\s*ca|\bha\s*\+\s*ca|\bhaca\b|ฮาร์โมนี|ฮาโมนี|เฮอโมนิ|ฮาร์โมนิ|ฮาก้า|ยกกระชับ|ฟิลเลอร์|filler|โปรโมชั่น|มีโปร|โปรอะไร/i,
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
}];

export const activePromos = (now = new Date()) => PROMOS.filter((p) => now.getTime() <= new Date(p.until).getTime());
export const promoByKey = (key: string | null | undefined) => PROMOS.find((p) => p.key === key) ?? null;

/** Lines for the AI prompt (web chat and lead drafts); empty when nothing runs. */
export function promoKb(now = new Date()) {
  const a = activePromos(now);
  return a.length ? `Current promotions (valid now, quote exactly):\n${a.map((p) => `- ${p.kb}`).join("\n")}` : "";
}

/** The two promo messages (image + text with a reply button). Image skipped when APP_URL is not https. */
export function promoMessages(p: Promo) {
  const [img] = absImages([p.image]);
  const [pre] = absImages([p.preview]);
  return [...(img ? [image(img, pre)] : []), broadcastText(p.text, true, p.ask)];
}

/** Free auto-reply: once per client per promo, only while it runs, never to a complaint. */
export async function promoReply(clientId: number, text: string, now = new Date()) {
  if (!text || text.length > 300 || NOT_SALES.test(text)) return null;
  // a bare "สนใจ" / "ขอรายละเอียด" while a promo runs almost always means the promo
  const bare = text.trim().length <= 24 && /^(สนใจ|ขอรายละเอียด|ขอข้อมูล|ขอราคา|มีโปร|interested)/i.test(text.trim());
  const p = activePromos(now).find((x) => x.trigger.test(text)) ?? (bare ? activePromos(now)[0] : undefined);
  if (!p) return null;
  if (await one("select 1 from touchpoints where client_id = $1 and kind in ('promo','promo_manual') and body = $2", [clientId, p.key])) return null;
  await logTouch(clientId, "out", "promo", p.key);
  return promoMessages(p);
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
