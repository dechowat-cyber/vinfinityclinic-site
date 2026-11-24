import { GIFTS, GIFT_RULES, GIFT_USE_BY, giftDay, GIFT_START, GIFT_YEAR_END } from "@/lib/gifts";
import { oaId } from "@/lib/source";
import GiftCalendar, { type Box } from "./GiftCalendar";
import "./gifts.css";

export const dynamic = "force-dynamic";

const SITE = "https://vinfinity-line.vercel.app";
const TITLE = "ปฏิทินของขวัญ สวยก่อนปีใหม่ · Vinfinity Clinic";
const DESC = "31 วัน 31 กล่อง เปิดได้วันละ 1 กล่อง ทุกคนได้ของขวัญเดียวกันในวันนั้น สิทธิ์จำกัดต่อวัน · 1–31 ธ.ค.";

export const metadata = {
  title: TITLE, description: DESC,
  openGraph: { title: TITLE, description: DESC, url: `${SITE}/gifts`, images: [{ url: `${SITE}/campaign/gift-2612/og.jpg`, width: 1200, height: 630 }], locale: "th_TH", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [`${SITE}/campaign/gift-2612/og.jpg`] },
};

/** Clock for the page. Outside production `?at=2026-12-12T10:00:00+07:00` previews another moment. */
function clock(at?: string) {
  if (at && process.env.NODE_ENV !== "production" && !Number.isNaN(Date.parse(at))) return new Date(at);
  return new Date();
}

export default async function GiftsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const now = clock(sp.at);
  const today = giftDay(now);
  const before = now.getTime() < new Date(GIFT_START).getTime();
  const after = now.getTime() > new Date(GIFT_YEAR_END).getTime();
  let left: number | null = null;
  if (today) {
    try {
      const { promoByKey, seatsUsed } = await import("@/lib/promos");
      const p = promoByKey(GIFTS[today - 1].key);
      if (p?.limit) left = Math.max(0, p.limit - (await seatsUsed(p, now)));
    } catch (e) { console.error("[gifts] seats", e); }
  }
  // Future boxes ship without their contents so nobody can peek at the page source.
  const boxes: Box[] = GIFTS.map((g) => (after || (today && g.day <= today))
    ? { day: g.day, big: g.big, state: g.day === today ? "today" : "past", gift: { title: g.title, price: g.price, was: g.was, cond: g.cond, limit: g.limit, icon: g.icon, claimText: g.claimText } }
    : { day: g.day, big: g.big, state: "locked" });
  const oa = oaId();
  return (
    <main className="gf">
      <div className="gf-snow" aria-hidden />
      <header className="gf-head">
        <img src="/logo-h.svg" alt="Vinfinity Clinic" className="gf-logo" />
        <p className="gf-eyebrow">YEAR-END GIFT CALENDAR · 1–31 DEC</p>
        <h1>ปฏิทินของขวัญ<br /><em>สวยก่อนปีใหม่</em></h1>
        <p className="gf-sub">31 วัน 31 กล่อง เปิดได้วันละ 1 กล่อง<br />ทุกคนได้ของขวัญเดียวกันในวันนั้น แต่สิทธิ์มีจำกัดต่อวัน</p>
      </header>
      <GiftCalendar boxes={boxes} today={today} before={before} after={after} left={left} oa={oa} site={SITE} nowIso={now.toISOString()} />
      <section className="gf-rules">
        <h2>เงื่อนไข</h2>
        <ul>{GIFT_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
        <p className="gf-fine">กิจกรรมนี้ไม่ใช่การชิงโชค ทุกคนที่เปิดกล่องในวันเดียวกันได้ข้อเสนอเดียวกันจนกว่าสิทธิ์ของวันนั้นจะครบ · ใช้สิทธิ์ได้ถึง {GIFT_USE_BY}</p>
      </section>
      <footer className="gf-foot">Vinfinity Clinic อุดรธานี · นพ.เดโชวัต พรมดา ว.48943<br />ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง</footer>
    </main>
  );
}
