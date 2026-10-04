import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { HEALTH_ROLES } from "@/lib/health";
import { PROTOCOLS, KINDS, followupsDue, recentPairs, studioQueue, suggestKind } from "@/lib/photos";
import { thaiDate, thaiTime, todayBkk, bkk, addDays, parts } from "@/lib/time";
import { QuickShoot } from "../quick-shoot";

export const dynamic = "force-dynamic";
// iPad: Share → Add to Home Screen on this page gives a "Photo Studio" icon that opens here (in Safari, so the staff login is shared)
export const metadata = { title: "Photo Studio · Vinfinity", appleWebApp: { title: "Photo Studio" } };

const fmt = (d: string | Date) => `${thaiDate(new Date(d))} ${thaiTime(new Date(d))}`;
const ST: Record<string, string> = { booked: "จองแล้ว", confirmed: "ยืนยันแล้ว", arrived: "มาถึงแล้ว", in_consult: "กำลังปรึกษา", done: "เสร็จ" };

/**
 * Photo Studio home: everything is one tap from here. Today's queue with the next shot for each visit,
 * client search, follow-ups that are due, the automatic before & after gallery and recent sessions.
 */
export default async function Photos({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  await requireStaff(HEALTH_ROLES);
  const term = ((await searchParams).s || "").trim();
  const now = new Date();
  const since = bkk(addDays(todayBkk(now), -6), "00:00").toISOString();
  const [queue, due, recent, pairs, found] = await Promise.all([
    studioQueue(now),
    followupsDue(now),
    q(`select s.*, c.name, c.display_name, (select count(*)::int from photos p where p.session_id = s.id) as n
       from photo_sessions s join clients c on c.id = s.client_id where s.created_at >= $1 order by s.created_at desc limit 100`, [since]),
    recentPairs(bkk(addDays(todayBkk(now), -29), "00:00").toISOString()),
    term ? q(`select c.id, c.name, c.display_name, c.phone,
        (select granted from consents k where k.client_id = c.id and k.type = 'data' order by k.created_at desc, k.id desc limit 1) as consent,
        (select id from photo_sessions s where s.client_id = c.id and s.completed_at is null order by s.id desc limit 1) as open_session
      from clients c where c.name ilike $1 or c.display_name ilike $1 or c.phone like $1 order by c.id desc limit 12`, [`%${term}%`]) : Promise.resolve([]),
  ]);
  const kinds = await Promise.all(found.map((c) => suggestKind(Number(c.id), now)));
  const names = new Map((pairs.length ? await q("select id, coalesce(name, display_name) n from clients where id = any($1::bigint[])", [pairs.map((p) => p.clientId)]) : []).map((r) => [Number(r.id), r.n]));
  const waiting = queue.filter((v) => ["arrived", "in_consult", "done"].includes(v.status) && !(v.shot.includes("before") && v.shot.includes("after"))).length;

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">PHOTO STUDIO</div><h1>ถ่ายภาพ / ก่อน-หลัง</h1></div>
        <div className="row"><span className={`tag ${waiting ? "warn" : "ok"}`}>วันนี้รอถ่าย {waiting}</span><span className={`tag ${due.length ? "warn" : ""}`}>ถึงรอบติดตามผล {due.length}</span></div>
      </div>

      <form className="row" method="get">
        <input name="s" defaultValue={term} className="inp" placeholder="ค้นหาลูกค้าเพื่อถ่ายภาพ: ชื่อ ชื่อ LINE หรือเบอร์โทร" style={{ flex: 1, minHeight: 48, fontSize: 16 }} autoComplete="off" />
        <button className="btn">ค้นหา</button>
      </form>
      {term && <section className="card">
        <div className="eyebrow">ผลการค้นหา “{term}”</div>
        {found.length === 0 ? <p className="muted">ไม่พบลูกค้า</p> : <ul className="queue">{found.map((c, i) => (
          <li key={c.id}>
            <div><a href={`/staff/clients/${c.id}#photos`}><b>{c.name || c.display_name || `#${c.id}`}</b></a><br /><small className="muted">{c.phone || ""}</small></div>
            <div className="row"><QuickShoot clientId={Number(c.id)} kind={kinds[i]} consent={c.consent === true} openSession={c.open_session ? Number(c.open_session) : null} />
              <a className="btn ghost small" href={`/staff/clients/${c.id}#photos`}>เลือกชุดมุมเอง</a></div>
          </li>))}</ul>}
      </section>}

      <section className="card">
        <div className="eyebrow">คิวถ่ายภาพวันนี้ · {todayBkk(now).split("-").reverse().join("/")}</div>
        {queue.length === 0 ? <p className="muted">วันนี้ยังไม่มีนัด · ใช้ช่องค้นหาด้านบนสำหรับลูกค้า walk-in</p> : <ul className="queue">{queue.map((v) => {
          const doneAll = v.shot.includes("before") && v.shot.includes("after");
          return (
            <li key={v.appointmentId} className={["arrived", "in_consult"].includes(v.status) ? "now" : ""}>
              <div>
                <b>{parts(new Date(v.time)).time}</b> · <a href={`/staff/clients/${v.clientId}#photos`}><b>{v.name}</b></a> <span className="tag">{ST[v.status] ?? v.status}</span>
                <br /><small className="muted">{v.note || ""}{v.note ? " · " : ""}ชุดมุม: {PROTOCOLS[v.protocol].label}</small>
                <div className="row" style={{ marginTop: 4 }}>
                  <span className={`tag ${v.shot.includes("before") ? "ok" : ""}`}>before {v.shot.includes("before") ? "✓" : "–"}</span>
                  <span className={`tag ${v.shot.includes("after") ? "ok" : ""}`}>after {v.shot.includes("after") ? "✓" : "–"}</span>
                </div>
              </div>
              <div className="row">
                {doneAll && !v.openSession ? <a className="btn ghost small" href={`/staff/clients/${v.clientId}/compare`}>ดูก่อน-หลัง</a>
                  : <QuickShoot clientId={v.clientId} kind={v.kind} protocol={v.protocol} consent={v.consent} openSession={v.openSession} size="big" />}
              </div>
            </li>);
        })}</ul>}
      </section>

      <section className="card">
        <div className="eyebrow">ถึงรอบถ่ายภาพติดตามผล (D14 / D30 / D90)</div>
        {due.length === 0 ? <p className="muted">ไม่มีค้าง</p> : <ul className="queue">{due.map((t) => (
          <li key={t.id}>
            <div><a href={`/staff/clients/${t.client_id}#photos`}><b>{t.client_name || t.display_name || "-"}</b></a> <span className="tag warn">D{t.step} · ผ่านมา {t.days} วัน</span>
              <br /><small className="muted">{t.name} · ทำเมื่อ {fmt(t.done_at)}{t.phone ? ` · ${t.phone}` : ""}</small></div>
            <QuickShoot clientId={Number(t.client_id)} kind="followup" protocol={t.protocol} />
          </li>))}</ul>}
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

      <details className="card">
        <summary>ชุดภาพ 7 วันที่ผ่านมา ({recent.length})</summary>
        <table className="t" style={{ marginTop: 12 }}>
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
      </details>
    </>
  );
}
