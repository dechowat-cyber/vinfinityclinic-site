import QRCode from "qrcode";
import { requireStaff } from "@/lib/session";
import { SOURCES } from "@/lib/source";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Links() {
  await requireStaff();
  const base = process.env.APP_URL || "";
  const rows = await Promise.all(Object.entries(SOURCES).map(async ([k, label]) => ({ k, label, url: `${base}/r/${k}`, qr: await QRCode.toDataURL(`${base}/r/${k}`, { margin: 1, width: 160, color: { dark: "#0B142E", light: "#FFFFFF" } }) })));
  const stats = await q(`select coalesce(source,'ไม่ทราบ') src, count(*)::int n, count(*) filter (where status = 'Consult-Booked')::int booked
    from leads where created_at > now() - interval '30 days' group by 1 order by 2 desc`);
  return (
    <>
      <div><div className="eyebrow">SOURCE LINKS · FR-01</div><h1>ลิงก์ LINE แยกตามช่องทาง</h1></div>
      <p className="muted" style={{ margin: 0 }}>ใช้ลิงก์ให้ตรงช่องทาง ลูกค้าจะเห็นข้อความทักที่เติมไว้ให้ พอกดส่ง ระบบจะติด source ให้ lead อัตโนมัติ ลิงก์ของผู้แนะนำ: <code>/r/ref_รหัส</code> (รหัสอยู่ในหน้าลูกค้า) หรือให้เพื่อนพิมพ์ “รหัสแนะนำ VXXXXX” ตอนทักแชท</p>
      <div className="kpis">{stats.slice(0, 4).map((s) => <div className="kpi" key={s.src}><b>{s.n}</b><small>{s.src} · นัดแล้ว {s.booked} (30 วัน)</small></div>)}</div>
      <table className="t links">
        <thead><tr><th>ช่องทาง</th><th>ลิงก์</th><th>QR</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.k}><td><b>{r.label}</b><br /><small className="muted">{r.k}</small></td><td><code>{r.url}</code></td><td><img src={r.qr} width={110} height={110} alt={`QR ${r.label}`} /></td></tr>)}</tbody>
      </table>
    </>
  );
}
