import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { HEALTH_ROLES } from "@/lib/health";
import { PROTOCOLS, KINDS, followupsDue, recentPairs } from "@/lib/photos";
import { thaiDate, thaiTime, todayBkk, bkk, addDays } from "@/lib/time";

export const dynamic = "force-dynamic";

const fmt = (d: string | Date) => `${thaiDate(new Date(d))} ${thaiTime(new Date(d))}`;

/** Photo studio overview: follow-up shots that are due and every session taken in the last 7 days. */
export default async function Photos() {
  await requireStaff(HEALTH_ROLES);
  const now = new Date();
  const since = bkk(addDays(todayBkk(now), -6), "00:00").toISOString();
  const [due, recent, pairs] = await Promise.all([
    followupsDue(now),
    q(`select s.*, c.name, c.display_name, (select count(*)::int from photos p where p.session_id = s.id) as n
       from photo_sessions s join clients c on c.id = s.client_id where s.created_at >= $1 order by s.created_at desc limit 100`, [since]),
    recentPairs(bkk(addDays(todayBkk(now), -29), "00:00").toISOString()),
  ]);
  const names = new Map(recent.map((r) => [Number(r.client_id), r.name || r.display_name]));
  return (
    <>
      <div><div className="eyebrow">PHOTO STUDIO</div><h1>ภาพก่อน-หลัง</h1></div>
      <section className="card">
        <div className="eyebrow">ถึงรอบถ่ายภาพติดตามผล (D14 / D30 / D90)</div>
        {due.length === 0 ? <p className="muted">ไม่มีค้าง</p> :
          <table className="t" style={{ marginTop: 10 }}><thead><tr><th>ลูกค้า</th><th>หัตถการ</th><th>ทำเมื่อ</th><th>รอบ</th><th></th></tr></thead>
            <tbody>{due.map((t) => (
              <tr key={t.id}><td><a href={`/staff/clients/${t.client_id}`}>{t.client_name || t.display_name || "-"}</a><br /><small className="muted">{t.phone || ""}</small></td>
                <td>{t.name}</td><td><small>{fmt(t.done_at)}</small></td><td><span className="tag warn">D{t.step} · ผ่านมา {t.days} วัน</span></td>
                <td><a className="btn small" href={`/staff/clients/${t.client_id}#photos`}>ถ่ายติดตามผล</a></td></tr>))}</tbody></table>}
        <p className="muted" style={{ fontSize: 13 }}>นัดลูกค้ามาถ่ายพร้อมนัดติดตามอาการ ภาพจะซ้อนเงากับชุด “ก่อนทำ” ให้อัตโนมัติ</p>
      </section>
      {pairs.length > 0 && <section className="card">
        <div className="eyebrow">BEFORE &amp; AFTER อัตโนมัติ · 30 วันล่าสุด</div>
        <div className="ba-grid">{pairs.map((p) => {
          const k = p.angles[0];
          return (
            <a key={p.after.id} href={`/staff/clients/${p.clientId}/compare?b=${p.after.id}`} className="ba-card">
              <div><img src={`/api/staff/photo/${p.before.shots[k]}`} alt="ก่อน" loading="lazy" /><img src={`/api/staff/photo/${p.after.shots[k]}`} alt="หลัง" loading="lazy" /></div>
              <small><b>{names.get(p.clientId) || `#${p.clientId}`}</b> · {KINDS[p.after.kind]} · {thaiDate(new Date(p.after.created_at))}</small>
            </a>);
        })}</div>
      </section>}
      <table className="t">
        <thead><tr><th>เวลา</th><th>ลูกค้า</th><th>ชุด</th><th>ภาพ</th><th>สถานะ</th></tr></thead>
        <tbody>
          {recent.length === 0 && <tr><td colSpan={5} className="muted">7 วันที่ผ่านมายังไม่มีชุดภาพ</td></tr>}
          {recent.map((s) => {
            const p = PROTOCOLS[s.protocol];
            return (
              <tr key={s.id}><td><small>{fmt(s.created_at)}</small></td>
                <td><a href={`/staff/clients/${s.client_id}#photos`}>{s.name || s.display_name || "-"}</a></td>
                <td>{KINDS[s.kind] ?? s.kind}<br /><small className="muted">{p?.label ?? s.protocol}</small></td>
                <td>{s.n}/{p?.angles.length ?? "-"}</td>
                <td>{s.completed_at ? <span className="tag ok">บันทึกแล้ว</span> : <a className="tag warn" href={`/staff/clients/${s.client_id}/capture?session=${s.id}`}>ยังไม่จบ · ถ่ายต่อ</a>}</td></tr>);
          })}
        </tbody>
      </table>
    </>
  );
}
