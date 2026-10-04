import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { HEALTH_ROLES } from "@/lib/health";

export const dynamic = "force-dynamic";

export default async function Clients({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const me = await requireStaff();
  const cam = HEALTH_ROLES.includes(me.role);
  const { s = "" } = await searchParams;
  const term = s.trim();
  const rows = await q(`select c.id, c.name, c.display_name, c.phone, c.source, c.created_at,
      (select status from leads l where l.client_id = c.id order by id desc limit 1) as lead_status,
      (select max(start_at) from appointments a where a.client_id = c.id) as last_appt,
      (select count(*)::int from plans p where p.client_id = c.id and p.status = 'sent') as open_plans,
      (select granted from consents k where k.client_id = c.id and k.type = 'data' order by k.created_at desc, k.id desc limit 1) as consent
    from clients c ${term ? "where c.name ilike $1 or c.display_name ilike $1 or c.phone like $1" : ""}
    order by c.id desc limit 100`, term ? [`%${term}%`] : []);
  return (
    <>
      <div><div className="eyebrow">CLIENTS</div><h1>ลูกค้า</h1></div>
      <form className="row"><input name="s" defaultValue={term} className="inp" placeholder="ค้นหาชื่อ ชื่อ LINE หรือเบอร์โทร" style={{ flex: 1, minHeight: 44 }} /><button className="btn small">ค้นหา</button></form>
      <table className="t">
        <thead><tr><th>ลูกค้า</th><th>source</th><th>สถานะ lead</th><th>นัดล่าสุด</th><th>แผนที่รอติดตาม</th>{cam && <th>ภาพ</th>}</tr></thead>
        <tbody>{rows.length === 0 && <tr><td colSpan={6} className="muted">ไม่พบ</td></tr>}
          {rows.map((r) => (
            <tr key={r.id}><td><a href={`/staff/clients/${r.id}`}><b>{r.name || r.display_name || `#${r.id}`}</b></a><br /><small className="muted">{r.phone || ""}</small></td>
              <td><small>{r.source || "-"}</small></td><td><small>{r.lead_status || "-"}</small></td>
              <td><small>{r.last_appt ? new Date(r.last_appt).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" }) : "-"}</small></td>
              <td>{r.open_plans ? <span className="tag warn">{r.open_plans}</span> : ""}</td>
              {cam && <td>{r.consent === true ? <a className="btn ghost small" href={`/staff/clients/${r.id}#photos`}>📷</a> : ""}</td>}</tr>))}
        </tbody>
      </table>
    </>
  );
}
