import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { TIERS, offerResults, offerAudience, type Tier } from "@/lib/loyalty";
import { createOfferAction } from "@/lib/crmActions";
import { thaiDate } from "@/lib/time";
import { baht } from "@/lib/payments";

export const dynamic = "force-dynamic";
const ERR: Record<string, string> = { empty: "ใส่ชื่อโปรและรายละเอียด", no_recipients: "ไม่มีสมาชิกที่ตรงเงื่อนไขและยินยอมรับข่าวสาร" };

export default async function Loyalty({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; t?: string; l?: string }> }) {
  await requireStaff(["BM", "MK"]);
  const sp = await searchParams;
  const counts = await q(`select tier, count(*)::int n, count(*) filter (where line_user_id is not null and followed)::int line from clients group by tier`);
  const by = Object.fromEntries(counts.map((r) => [r.tier, r]));
  const offers = await offerResults();
  const pickT = (TIERS.find((t) => t.key === sp.t)?.key ?? "member") as Tier, pickL = Number(sp.l) || null;
  const reach = (await offerAudience({ minTier: pickT, lapsedDays: pickL })).length;
  return (
    <>
      <div><div className="eyebrow">VINFINITY CIRCLE</div><h1>สมาชิก · โปรลับ</h1></div>
      <div className="kpis">{TIERS.map((t) => (
        <div className="kpi" key={t.key} style={{ borderTop: `4px solid ${t.color}` }}><b>{by[t.key]?.n ?? 0}</b><small>{t.name} · ยอด 12 เดือน {t.min ? `≥ ${t.min.toLocaleString()}` : "ทุกคน"}</small></div>))}</div>
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>ระดับคิดจากยอดชำระจริง 12 เดือนล่าสุด ขึ้นระดับทันทีและคงระดับ 12 เดือน · ลูกค้าเห็นบัตรของตัวเองจากปุ่ม “บัตรสมาชิก” ในเมนู LINE · ลูกค้าที่ขึ้นระดับจะได้ข้อความแสดงความยินดีอัตโนมัติ</p>

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

      <table className="t">
        <thead><tr><th>โปร</th><th>ส่งให้</th><th>ส่งแล้ว</th><th>ใช้แล้ว</th><th>ยอดจากผู้ใช้โปร</th></tr></thead>
        <tbody>{offers.length === 0 ? <tr><td colSpan={5} className="muted">ยังไม่มีโปรลับ</td></tr> : offers.map((o) => (
          <tr key={o.id}><td><b>{o.title}</b><br /><small className="muted">{thaiDate(new Date(o.created_at))} · {TIERS.find((t) => t.key === o.min_tier)?.name}{o.min_tier !== "member" ? "+" : ""}{o.lapsed_days ? ` · ไม่มา ${o.lapsed_days} วัน` : ""} · ใช้ได้ {o.valid_days} วัน</small></td>
            <td>{o.issued}</td><td>{o.sent}</td><td>{o.redeemed}{o.issued ? <small className="muted"> ({Math.round((o.redeemed / o.issued) * 100)}%)</small> : null}</td><td>{baht(o.revenue)}</td></tr>))}</tbody>
      </table>
    </>
  );
}
