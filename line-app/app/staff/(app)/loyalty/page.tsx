import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { TIERS, offerResults, offerAudience, type Tier } from "@/lib/loyalty";
import { createOfferAction, createEventAction } from "@/lib/crmActions";
import { walletSummary, CASHBACK, REFERRAL_CREDIT, REFERRAL_MIN_PAYMENT } from "@/lib/wallet";
import { eventList } from "@/lib/events";
import { todayBkk, addDays, thaiTime } from "@/lib/time";
import { thaiDate } from "@/lib/time";
import { baht } from "@/lib/payments";

export const dynamic = "force-dynamic";
const ERR: Record<string, string> = { empty: "ใส่ชื่อโปรและรายละเอียด", no_recipients: "ไม่มีสมาชิกที่ตรงเงื่อนไขและยินยอมรับข่าวสาร" };

export default async function Loyalty({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; t?: string; l?: string; ev?: string; everr?: string }> }) {
  await requireStaff(["BM", "MK"]);
  const sp = await searchParams;
  const counts = await q(`select tier, count(*)::int n, count(*) filter (where line_user_id is not null and followed)::int line from clients group by tier`);
  const by = Object.fromEntries(counts.map((r) => [r.tier, r]));
  const offers = await offerResults();
  const pickT = (TIERS.find((t) => t.key === sp.t)?.key ?? "member") as Tier, pickL = Number(sp.l) || null;
  const reach = (await offerAudience({ minTier: pickT, lapsedDays: pickL })).length;
  const today = todayBkk();
  const [w, events] = await Promise.all([walletSummary(new Date(`${today.slice(0, 8)}01T00:00:00+07:00`).toISOString()), eventList()]);
  return (
    <>
      <div><div className="eyebrow">VINFINITY CIRCLE</div><h1>สมาชิก · โปรลับ</h1></div>
      <div className="kpis">{TIERS.map((t) => (
        <div className="kpi" key={t.key} style={{ borderTop: `4px solid ${t.color}` }}><b>{by[t.key]?.n ?? 0}</b><small>{t.name} · ยอด 12 เดือน {t.min ? `≥ ${t.min.toLocaleString()}` : "ทุกคน"}</small></div>))}</div>
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>ระดับคิดจากยอดชำระจริง 12 เดือนล่าสุด ขึ้นระดับทันทีและคงระดับ 12 เดือน · ลูกค้าเห็นบัตรของตัวเองจากปุ่ม “บัตรสมาชิก” ในเมนู LINE · ลูกค้าที่ขึ้นระดับจะได้ข้อความแสดงความยินดีอัตโนมัติ</p>

      <section className="card">
        <div className="eyebrow">VINFINITY WALLET · เครดิต</div>
        <div className="kpis" style={{ marginTop: 10 }}>
          <div className="kpi"><b>{w.outstanding.toLocaleString()}</b><small>เครดิตคงค้างทั้งหมด (บาท) · {w.holders} คน</small></div>
          <div className="kpi"><b>{w.topup.toLocaleString()}</b><small>เติม Wallet เดือนนี้</small></div>
          <div className="kpi"><b>{w.used.toLocaleString()}</b><small>ใช้จ่ายจาก Wallet เดือนนี้</small></div>
          <div className="kpi"><b>{w.given.toLocaleString()}</b><small>เครดิตที่ให้ (โบนัส · คืน · ชวนเพื่อน) เดือนนี้</small></div>
        </div>
        <p className="muted" style={{ fontSize: 13, margin: "10px 0 0" }}>เติม Wallet ที่หน้าลูกค้า (ส่วนชำระเงิน) · เครดิตคืน Silver {CASHBACK.silver * 100}% · Gold {CASHBACK.gold * 100}% · Platinum {CASHBACK.platinum * 100}% ของเงินที่จ่ายจริง · V Circle ให้เครดิตคนละ {REFERRAL_CREDIT.toLocaleString()} เมื่อเพื่อนจ่ายครั้งแรกตั้งแต่ {REFERRAL_MIN_PAYMENT.toLocaleString()} บาท · เครดิตใช้ได้ 2 ปีนับจากรายการล่าสุด · เครดิตคงค้างเป็นภาระที่คลินิกต้องให้บริการ ให้บัญชีบันทึกเป็นเงินรับล่วงหน้า</p>
      </section>

      <form className="card" action={createOfferAction}>
        <div className="eyebrow">ส่งโปรลับ (รหัสเฉพาะคน ใช้ได้ 1 ครั้ง)</div>
        {sp.ok && <p className="tag ok">สร้างโปรแล้ว ส่งให้ {sp.ok} คน (ทยอยส่งภายในไม่กี่นาที เฉพาะ 09:00–20:00)</p>}
        {sp.err && <p className="err">{ERR[sp.err] ?? sp.err}</p>}
        <div className="row" style={{ marginTop: 12, alignItems: "flex-end" }}>
          <div className="field" style={{ margin: 0 }}><label>ส่งให้ระดับ</label>
            <select name="min_tier" defaultValue={pickT}>{TIERS.map((t) => <option key={t.key} value={t.key}>{t.name}{t.key === "member" ? " (ทุกคน)" : " ขึ้นไป"}</option>)}</select></div>
          <div className="field" style={{ margin: 0 }}><label>เฉพาะคนที่ไม่ได้มา</label>
            <select name="lapsed" defaultValue={pickL ?? ""}><option value="">ทุกคน</option><option value="60">60 วันขึ้นไป</option><option value="90">90 วันขึ้นไป</option><option value="180">180 วันขึ้นไป</option></select></div>
          <div className="field" style={{ margin: 0 }}><label>ใช้ได้</label>
            <select name="valid" defaultValue="30"><option value="7">7 วัน</option><option value="14">14 วัน</option><option value="30">30 วัน</option><option value="60">60 วัน</option></select></div>
        </div>
        <div className="field" style={{ marginTop: 12 }}><label>ชื่อโปร (หัวการ์ด)</label><input name="title" maxLength={60} required placeholder="เช่น Gold Members · ทรีตเมนต์ผิวเดือนตุลาคม" /></div>
        <div className="field"><label>รายละเอียดสิทธิ์</label><textarea name="detail" rows={3} maxLength={400} required placeholder="เช่น รับ Aqua Peel ฟรี 1 ครั้ง เมื่อทำหัตถการใดก็ได้ภายในเดือนนี้" /></div>
        <p className="muted" style={{ fontSize: 13, margin: "0 0 12px" }}>ตอนนี้ตรงเงื่อนไขและยินยอมรับข่าวสาร: <b>{reach.toLocaleString()} คน</b> (<a href={`?t=${pickT}${pickL ? `&l=${pickL}` : ""}`}>คำนวณใหม่ตามตัวเลือก</a>) · ห้ามใช้คำรับประกันผลหรือคำเกินจริง ตรวจกฎโฆษณาสถานพยาบาลก่อนส่ง</p>
        <button className="btn">สร้างรหัสและส่งทาง LINE</button>
      </form>

      <form className="card" action={createEventAction} id="events">
        <div className="eyebrow">CIRCLE TALK · กิจกรรมสมาชิก</div>
        {sp.ev && <p className="tag ok">ส่งคำเชิญแล้ว {sp.ev} คน · สมาชิกกดตอบรับในแชท ระบบให้ที่นั่งตามลำดับจนเต็ม แล้วเป็นรายชื่อสำรอง</p>}
        {sp.everr && <p className="err">{sp.everr === "no_recipients" ? "ไม่มีสมาชิกระดับนี้ที่ยินยอมรับข่าวสาร" : "ใส่ชื่อ รายละเอียด และวันเวลาในอนาคต"}</p>}
        <div className="row" style={{ marginTop: 12, alignItems: "flex-end" }}>
          <div className="field" style={{ margin: 0 }}><label>เชิญระดับ</label><select name="min_tier" defaultValue="gold">{TIERS.map((t) => <option key={t.key} value={t.key}>{t.name}{t.key === "member" ? " (ทุกคน)" : " ขึ้นไป"}</option>)}</select></div>
          <div className="field" style={{ margin: 0 }}><label>วัน</label><select name="date" defaultValue={addDays(today, 14)}>{Array.from({ length: 60 }, (_, i) => addDays(today, i + 1)).map((d) => <option key={d} value={d}>{thaiDate(new Date(`${d}T12:00:00+07:00`))}</option>)}</select></div>
          <div className="field" style={{ margin: 0 }}><label>เวลา</label><select name="time" defaultValue="18:30">{["10:00", "13:00", "14:00", "16:00", "17:00", "18:00", "18:30", "19:00"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="field" style={{ margin: 0 }}><label>ที่นั่ง</label><select name="capacity" defaultValue="10">{[6, 8, 10, 12, 15, 20, 30].map((n) => <option key={n}>{n}</option>)}</select></div>
        </div>
        <div className="field" style={{ marginTop: 12 }}><label>ชื่องาน</label><input name="title" maxLength={60} required placeholder="เช่น Circle Talk: ดูแลผิวให้สวยระยะยาว กับคุณหมอบาส" /></div>
        <div className="field"><label>รายละเอียด</label><textarea name="detail" rows={2} maxLength={400} required placeholder="เช่น คุยกันแบบกลุ่มเล็ก 8 คน ที่คลินิก มีของว่างและสาธิตการดูแลผิว" /></div>
        <button className="btn">สร้างงานและส่งคำเชิญทาง LINE</button>
        {events.length > 0 && <table className="t" style={{ marginTop: 14 }}><thead><tr><th>งาน</th><th>ตอบรับ</th><th>รายชื่อ</th></tr></thead><tbody>{events.map((e) => (
          <tr key={e.id}><td><b>{e.title}</b><br /><small className="muted">{thaiDate(new Date(e.starts_at))} {thaiTime(new Date(e.starts_at))} · {TIERS.find((t) => t.key === e.min_tier)?.name}+ · เชิญ {e.invited}</small></td>
            <td>{e.going}/{e.capacity}{e.waitlist ? <><br /><small className="muted">สำรอง {e.waitlist}</small></> : null}</td>
            <td><small>{((e.people ?? []) as any[]).map((p, i) => <span key={p.id}>{i ? ", " : ""}<a href={`/staff/clients/${p.id}`}>{p.name || `#${p.id}`}</a>{p.status === "waitlist" ? " (สำรอง)" : ""}</span>)}</small></td></tr>))}</tbody></table>}
      </form>

      <table className="t">
        <thead><tr><th>โปร</th><th>ส่งให้</th><th>ส่งแล้ว</th><th>ใช้แล้ว</th><th>ยอดจากผู้ใช้โปร</th></tr></thead>
        <tbody>{offers.length === 0 ? <tr><td colSpan={5} className="muted">ยังไม่มีโปรลับ</td></tr> : offers.map((o) => (
          <tr key={o.id}><td><b>{o.title}</b><br /><small className="muted">{thaiDate(new Date(o.created_at))} · {TIERS.find((t) => t.key === o.min_tier)?.name}{o.min_tier !== "member" ? "+" : ""}{o.lapsed_days ? ` · ไม่มา ${o.lapsed_days} วัน` : ""} · ใช้ได้ {o.valid_days} วัน</small></td>
            <td>{o.issued}</td><td>{o.sent}</td><td>{o.redeemed}{o.issued ? <small className="muted"> ({Math.round((o.redeemed / o.issued) * 100)}%)</small> : null}</td><td>{baht(o.revenue)}</td></tr>))}</tbody>
      </table>
    </>
  );
}
