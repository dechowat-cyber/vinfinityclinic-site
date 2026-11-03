import { q, one } from "./db";
import { ensureRefCode } from "./source";
import { bookUrl } from "./link";
import type { Msg } from "./line";
import { absImages } from "./campaignMedia";

// "ชวนเพื่อนมาสวยด้วยกัน": a time-boxed boost on top of the always-on V Circle referral (wallet.ts).
// Always: the friend's first payment of 5,000+ gives 1,000 credit to each side.
// During the event: the person who invited gets 1,500, and 3 friends who paid within the event earn a milestone reward
// (handed out by staff, tracked in referral_rewards). Every message here is a reply to the person who asked, so no quota.

export const REF_EVENT = {
  key: "friends-2611",
  label: "ชวนเพื่อนมาสวยด้วยกัน",
  from: "2026-11-16T00:00:00+07:00",
  until: "2026-12-15T23:59:59+07:00",
  friendCredit: 1_000,
  referrerCredit: 1_500,
  milestone: 3,
  milestoneReward: "Vitaran 1 cc",
  minPayment: 5_000,
};

const NAVY = "#0B142E", ROYAL = "#1E3470", MUTED = "#5A6480", ORANGE = "#F2622A";
const t = (text: string, o: Record<string, unknown> = {}) => ({ type: "text", text, wrap: true, ...o });
const baht = (n: number) => `${n.toLocaleString("en-US")} บาท`;

export const refEventActive = (now = new Date()) => now >= new Date(REF_EVENT.from) && now <= new Date(REF_EVENT.until);
/** Credit for the person who invited, at the time the friend pays. */
export const referrerCreditAt = (now = new Date()) => (refEventActive(now) ? REF_EVENT.referrerCredit : REF_EVENT.friendCredit);

/** The person's own invite link (opens LINE with their code typed in). */
export const inviteLink = (code: string, base = process.env.APP_URL || "") => `${base.replace(/\/$/, "")}/r/ref_${code}`;

/** Friends this person invited who paid during the event (milestone progress). */
export async function eventPaidCount(referrerId: number) {
  return Number((await one(`select count(*)::int n from clients where referred_by = $1 and referral_paid_at between $2 and $3`,
    [referrerId, REF_EVENT.from, REF_EVENT.until]))?.n ?? 0);
}

/** After a referral credit: record the milestone reward once (staff hand it out). Returns true when it was just reached. */
export async function checkMilestone(referrerId: number, now = new Date()) {
  if (!refEventActive(now)) return false;
  if ((await eventPaidCount(referrerId)) < REF_EVENT.milestone) return false;
  const r = await one(`insert into referral_rewards(event_key, client_id, reward) values ($1,$2,$3) on conflict do nothing returning id`,
    [REF_EVENT.key, referrerId, REF_EVENT.milestoneReward]);
  return !!r;
}

/** "ชวนเพื่อน": the person's own share card (link + progress). */
export async function shareCard(clientId: number, userId: string, now = new Date()): Promise<Msg> {
  const code = await ensureRefCode(clientId);
  const link = inviteLink(code);
  const ev = refEventActive(now);
  const mine = referrerCreditAt(now);
  const shareText = `มาลองปรึกษาคุณหมอที่ Vinfinity Clinic อุดรธานีด้วยกันนะ 😊 กดลิงก์นี้รับสิทธิ์เพื่อนใหม่ ปรึกษาฟรี และรับเครดิต ${baht(REF_EVENT.friendCredit)} เมื่อทำครั้งแรก 👉 ${link}`;
  const done = ev ? await eventPaidCount(clientId) : 0;
  return { type: "flex", altText: `ชวนเพื่อน รับเครดิต ${baht(mine)}`, contents: { type: "bubble",
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
      t(ev ? REF_EVENT.label.toUpperCase() : "V CIRCLE · ชวนเพื่อน", { size: "xxs", color: MUTED, weight: "bold" }),
      t("ส่งลิงก์นี้ให้เพื่อนได้เลยค่ะ", { weight: "bold", size: "md", color: NAVY }),
      t(`เพื่อนได้ปรึกษาฟรี + เครดิต ${baht(REF_EVENT.friendCredit)} · คุณได้เครดิต ${baht(mine)} เมื่อเพื่อนมาทำครั้งแรก ${baht(REF_EVENT.minPayment)} ขึ้นไป`, { size: "sm", color: MUTED }),
      ...(ev ? [t(`ชวนสำเร็จครบ ${REF_EVENT.milestone} คน รับ ${REF_EVENT.milestoneReward} ฟรี · ตอนนี้ ${Math.min(done, REF_EVENT.milestone)}/${REF_EVENT.milestone} · ถึง 15 ธ.ค.`, { size: "sm", color: ORANGE, weight: "bold" })] : []),
      t(`รหัสของคุณ ${code}`, { size: "xs", color: MUTED }),
    ] },
    footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
      { type: "button", style: "primary", color: ROYAL, action: { type: "uri", label: "ส่งให้เพื่อนใน LINE", uri: `https://line.me/R/share?text=${encodeURIComponent(shareText)}` } },
      { type: "button", style: "link", action: { type: "uri", label: "เปิดลิงก์ของฉัน (ไว้แชร์ FB/IG)", uri: link } },
    ] } } };
}

/** The welcome a new friend gets when they arrive with someone's code. */
export function friendWelcome(userId: string, inviter: string | null): Msg {
  return { type: "flex", altText: "สิทธิ์เพื่อนใหม่ Vinfinity Clinic", contents: { type: "bubble",
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
      t("สิทธิ์เพื่อนใหม่ 🎁", { weight: "bold", size: "lg", color: NAVY }),
      t(inviter ? `คุณ${inviter} ชวนคุณมา ยินดีต้อนรับค่ะ` : "ยินดีต้อนรับค่ะ", { size: "sm", color: MUTED }),
      t(`• ปรึกษาและวิเคราะห์ผิวกับคุณหมอฟรี\n• เครดิต ${baht(REF_EVENT.friendCredit)} เมื่อทำครั้งแรก ${baht(REF_EVENT.minPayment)} ขึ้นไป ใช้ได้ทุกบริการ`, { size: "sm", color: NAVY }),
      t("แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล", { size: "xxs", color: MUTED }),
    ] },
    footer: { type: "box", layout: "vertical", contents: [
      { type: "button", style: "primary", color: ROYAL, action: { type: "uri", label: "จองคิวปรึกษาฟรี", uri: bookUrl(userId, { src: "ref" }) } },
    ] } } };
}

/** Tells the inviter their friend arrived (push: counts one message). */
export function friendArrived(inviteeFirstName: string, now = new Date()): Msg {
  return t(`🎉 ${inviteeFirstName} รับสิทธิ์เพื่อนใหม่จากลิงก์ของคุณแล้วค่ะ เมื่อเพื่อนมาทำครั้งแรก ${baht(REF_EVENT.minPayment)} ขึ้นไป คุณจะได้เครดิต ${baht(referrerCreditAt(now))}${refEventActive(now) ? ` · ครบ ${REF_EVENT.milestone} คน รับ ${REF_EVENT.milestoneReward} ฟรี` : ""}`) as Msg;
}

/** Line for น้องวิน / lead drafts while the event runs. */
export function refEventKb(now = new Date()) {
  return refEventActive(now)
    ? `- Friend referral event ${REF_EVENT.label}, 16 Nov – 15 Dec 2026: an existing client types "ชวนเพื่อน" in the clinic's LINE to get a personal invite link. The new friend gets a free consultation and ${REF_EVENT.friendCredit} THB credit on a first treatment of ${REF_EVENT.minPayment} THB or more; the inviter gets ${REF_EVENT.referrerCredit} THB credit per friend, and ${REF_EVENT.milestoneReward} free after 3 friends.`
    : "";
}

/** Staff view: who invited whom during the event, and rewards to hand out. */
export async function referralBoard(limit = 30) {
  const rows = await q(`select r.id, coalesce(r.name, r.display_name) n, r.phone, r.line_user_id,
      count(f.id) filter (where f.created_at >= $1)::int invited,
      count(f.id) filter (where f.referral_paid_at between $1 and $2)::int paid,
      (select w.status from referral_rewards w where w.client_id = r.id and w.event_key = $3) reward,
      (select w.id from referral_rewards w where w.client_id = r.id and w.event_key = $3) reward_id
    from clients r join clients f on f.referred_by = r.id
    group by r.id having count(f.id) filter (where f.created_at >= $1) > 0 or count(f.id) filter (where f.referral_paid_at between $1 and $2) > 0
    order by paid desc, invited desc limit $4`, [REF_EVENT.from, REF_EVENT.until, REF_EVENT.key, limit]);
  return rows;
}

/** The launch card for a broadcast: same for everyone; "ชวนเพื่อน" returns each person's own link as a free reply. */
export function inviteBroadcastCard(): Msg {
  const [hero] = absImages(["/campaign/friends-2611/1-1x1.jpg"]);
  return { type: "flex", altText: `${REF_EVENT.label}: เพื่อนได้ 1,000 คุณได้ 1,500 ครบ 3 คนรับ ${REF_EVENT.milestoneReward}`, contents: { type: "bubble",
    ...(hero ? { hero: { type: "image", url: hero, size: "full", aspectRatio: "1:1", aspectMode: "cover", action: { type: "message", label: "ชวนเพื่อน", text: "ชวนเพื่อน" } } } : {}),
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "18px", contents: [
      t(REF_EVENT.label, { weight: "bold", size: "md", color: NAVY }),
      t(`เพื่อนใหม่ได้ปรึกษาฟรี + เครดิต ${baht(REF_EVENT.friendCredit)} · คุณได้ ${baht(REF_EVENT.referrerCredit)} ต่อเพื่อน 1 คน · ครบ ${REF_EVENT.milestone} คน รับ ${REF_EVENT.milestoneReward} ฟรี`, { size: "sm", color: MUTED }),
      t(`16 พ.ย. – 15 ธ.ค. · เครดิตเมื่อเพื่อนทำครั้งแรก ${baht(REF_EVENT.minPayment)} ขึ้นไป`, { size: "xs", color: MUTED }),
    ] },
    footer: { type: "box", layout: "vertical", contents: [
      { type: "button", style: "primary", color: ROYAL, action: { type: "message", label: "รับลิงก์ชวนเพื่อนของฉัน", text: "ชวนเพื่อน" } },
    ] } } };
}
