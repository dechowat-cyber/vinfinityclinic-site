import { q, one } from "./db";
import { logTouch } from "./crm";
import { image, broadcastText } from "./messages";
import { absImages } from "./campaignMedia";
import { bookUrl } from "./link";
import { thaiDate, thaiTime } from "./time";
import { notifyStaff } from "./notify";
import type { Msg } from "./line";

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

export const PROMOS: Promo[] = [{
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
export const promoByKey = (key: string | null | undefined) => PROMOS.find((p) => p.key === key) ?? null;

/** Lines for the AI prompt (web chat and lead drafts); empty when nothing runs. */
export function promoKb(now = new Date()) {
  const a = activePromos(now);
  return a.length ? `Current promotions (valid now, quote exactly):\n${a.map((p) => `- ${p.kb}`).join("\n")}` : "";
}

const t = (text: string, o: Record<string, unknown> = {}) => ({ type: "text", text, wrap: true, ...o });

/** A promo as LINE messages: a card with a claim button for limited promos, otherwise image + text with a reply button. */
export function promoMessages(p: Promo): Msg[] {
  if (p.card) {
    const [hero] = absImages([p.card.hero]);
    const c = p.card;
    return [{ type: "flex", altText: `${c.title} ${c.price} · สิทธิ์จำกัด`, contents: { type: "bubble",
      ...(hero ? { hero: { type: "image", url: hero, size: "full", aspectRatio: "1:1", aspectMode: "cover", action: { type: "message", label: "รับสิทธิ์", text: c.claimText } } } : {}),
      body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
        t(c.title, { weight: "bold", size: "md", color: NAVY }),
        { type: "box", layout: "baseline", spacing: "sm", contents: [t(c.price, { weight: "bold", size: "xl", color: NAVY, flex: 0 }), ...(c.was ? [t(c.was, { size: "xs", color: MUTED, decoration: "line-through", flex: 0 })] : [])] },
        ...c.lines.map((l) => t(l, { size: "xs", color: MUTED })),
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
        { type: "button", style: "primary", color: NAVY, action: { type: "message", label: "กดรับสิทธิ์", text: c.claimText } },
        ...(c.detailUrl ? [{ type: "button", style: "link", action: { type: "uri", label: "ดูรายละเอียด", uri: c.detailUrl } }] : []),
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
  await q("insert into promo_claims(promo_key, client_id, seat, expires_at) values ($1,$2,$3,$4)", [p.key, clientId, seat, expires.toISOString()]);
  await logTouch(clientId, "in", "promo_claim", p.key);
  if (!(await one("select 1 from touchpoints where client_id = $1 and kind in ('promo','promo_manual') and body = $2", [clientId, p.key]))) await logTouch(clientId, "out", "promo", p.key);
  await notifyStaff(`🎁 มีคนกดรับสิทธิ์ ${p.label} · สิทธิ์ที่ ${seat}/${limit} · ${process.env.APP_URL || ""}/staff/leads#promo`, `claim:${p.key}:${clientId}`).catch(() => false);
  return [card(`🎉 สิทธิ์ที่ ${seat} จาก ${limit} เป็นของคุณแล้วค่ะ`, [
    `${p.card?.title ?? p.label} ${p.card?.price ?? ""}${p.maxPer ? ` (${p.maxPer})` : ""}`.trim(),
    `กรุณาเลือกวันนัดภายใน ${fmt(expires)} ถ้าเลยเวลา สิทธิ์จะส่งต่อให้คนถัดไปค่ะ`,
    `เหลืออีก ${Math.max(0, limit - seat)} สิทธิ์`,
  ], [bookBtn, callBtn])];
}

/**
 * Free replies for a running promo. Shows the promo once per person when they ask about it (always when they ask for
 * "โปร" directly, e.g. the rich-menu tile), takes a seat when they press the claim button. Never to a complaint.
 */
export async function promoReply(clientId: number, text: string, now = new Date(), userId = ""): Promise<Msg[] | null> {
  const x = (text || "").trim();
  if (!x || x.length > 300 || NOT_SALES.test(x)) return null;
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
    from promo_claims pc join clients c on c.id = pc.client_id where pc.promo_key = $1 order by pc.id`, [p.key, now.toISOString()]);
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
