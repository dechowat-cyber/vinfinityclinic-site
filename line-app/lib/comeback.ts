import { q, one } from "./db";
import { bookUrl } from "./link";
import type { Msg } from "./line";

// "คิดถึงนะ กลับมาสวยต่อ": win back past clients who have not been in for a while, in three groups sent as separate
// segment campaigns (personal pushes, each with the person's own booking link). Whoever comes back and pays 5,000+
// within 30 days of the message gets a treatment gift that staff give at the visit (tracked in comeback_gifts).

export const COMEBACK = {
  key: "comeback-2611",
  gift: "โบทูลินัม Standard 1 จุด (ระหว่างคิ้วหรือหางตา มูลค่า 1,900 บาท)",
  giftShort: "โบทูลินัม Standard 1 จุด",
  minPayment: 5_000,
  windowDays: 30,
};

export type ComebackGroup = "A" | "B" | "C";
export const GROUP_LABEL: Record<ComebackGroup, string> = { A: "ถึงรอบโบทูลินัม", B: "ฟิลเลอร์ / ยกกระชับ", C: "สกินบูสเตอร์ห่างหาย" };

const NAVY = "#0B142E", ROYAL = "#1E3470", MUTED = "#5A6480", ORANGE = "#F2622A";
const t = (text: string, o: Record<string, unknown> = {}) => ({ type: "text", text, wrap: true, ...o });

/** "3 เดือน", "ปีกว่า" … for {ห่าง}. */
export function sinceText(last: Date | string | null | undefined, now = new Date()) {
  if (!last) return "สักพัก";
  const months = Math.floor((now.getTime() - new Date(last).getTime()) / (30.4 * 864e5));
  if (months < 1) return "ไม่นาน";
  if (months < 12) return `${months} เดือน`;
  return months < 24 ? "ปีกว่า" : `${Math.floor(months / 12)} ปีกว่า`;
}

/** Fills {ชื่อ} (first name, with คุณ unless they already have a title) and {ห่าง} (time since the last visit). */
export function personalize(text: string, name: string | null | undefined, last: Date | string | null | undefined, now = new Date()) {
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  const who = first ? (/^(คุณ|คุน|K\.|น้อง|พี่)/i.test(first) ? first : `คุณ${first}`) : "คุณลูกค้า";
  return text.split("{ชื่อ}").join(who).split("{ห่าง}").join(sinceText(last, now));
}

/** The message as a card: the personal text, the gift line, own booking link and the invite button. */
export function comebackCard(userId: string, text: string, campaignId: number): Msg {
  return { type: "flex", altText: text.slice(0, 380), contents: { type: "bubble",
    body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "18px", contents: [
      t(text, { size: "sm", color: NAVY }),
      { type: "box", layout: "vertical", backgroundColor: "#FFF4EC", cornerRadius: "10px", paddingAll: "12px", contents: [
        t("🎁 ของขวัญต้อนรับกลับ", { size: "xs", weight: "bold", color: ORANGE }),
        t(`${COMEBACK.gift} เมื่อทำ ${COMEBACK.minPayment.toLocaleString("en-US")} บาทขึ้นไป ภายใน ${COMEBACK.windowDays} วัน`, { size: "xs", color: NAVY }),
      ] },
      t("แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล", { size: "xxs", color: MUTED }),
    ] },
    footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
      { type: "button", style: "primary", color: ROYAL, action: { type: "uri", label: "เลือกวันนัด", uri: bookUrl(userId, { src: `comeback_${campaignId}` }) } },
      { type: "button", style: "link", action: { type: "message", label: "🎁 ชวนเพื่อนมาด้วย", text: "ชวนเพื่อน" } },
    ] } } };
}

/** After a payment: a 5,000+ payment within 30 days of a comeback message earns the gift once (staff give it at the visit). */
export async function checkComebackGift(clientId: number, amount: number, now = new Date()) {
  if (amount < COMEBACK.minPayment) return false;
  const got = await one(`select r.campaign_id from campaign_recipients r join campaigns k on k.id = r.campaign_id
    where r.client_id = $1 and r.sent_at is not null and k.images::text like '%"comeback:%' and r.sent_at between $2 and $3
    order by r.sent_at desc limit 1`, [clientId, new Date(now.getTime() - COMEBACK.windowDays * 864e5).toISOString(), now.toISOString()]);
  if (!got) return false;
  const r = await one(`insert into comeback_gifts(event_key, client_id, campaign_id, gift) values ($1,$2,$3,$4) on conflict do nothing returning id`,
    [COMEBACK.key, clientId, got.campaign_id, COMEBACK.giftShort]);
  if (r) {
    const { notifyStaff } = await import("./notify");
    await notifyStaff(`🎁 ลูกค้ากลับมาจากแคมเปญ “คิดถึงนะ” จ่ายครบ ${COMEBACK.minPayment.toLocaleString("en-US")} แล้ว · ให้${COMEBACK.giftShort} · ${process.env.APP_URL || ""}/staff/leads#comeback`, `comeback:${clientId}`).catch(() => false);
  }
  return !!r;
}

/** Staff view: everyone messaged in the last 30 days by a comeback campaign, whether they booked, paid and got the gift. */
export async function comebackBoard(now = new Date()) {
  return q(`select r.client_id, coalesce(c.name, c.display_name) n, c.phone, k.name campaign, r.sent_at,
      exists (select 1 from appointments a where a.client_id = r.client_id and a.created_at >= r.sent_at and a.status not in ('cancelled','no_show')) booked,
      (select coalesce(sum(p.amount), 0)::float from payments p where p.client_id = r.client_id and p.voided_at is null and p.created_at >= r.sent_at) paid,
      g.id gift_id, g.status gift
    from campaign_recipients r join campaigns k on k.id = r.campaign_id join clients c on c.id = r.client_id
    left join comeback_gifts g on g.client_id = r.client_id and g.event_key = $2
    where r.sent_at > $1 and k.images::text like '%"comeback:%'
    order by (g.status = 'pending') desc nulls last, booked desc, r.sent_at desc limit 200`,
    [new Date(now.getTime() - COMEBACK.windowDays * 864e5).toISOString(), COMEBACK.key]);
}
