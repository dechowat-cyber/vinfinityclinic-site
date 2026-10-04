import { requireStaff } from "@/lib/session";
import { REPORT_ROLES, SOURCE_LABEL, PERIODS, periodRange, funnel, periodKpis, monthlyRevenue, campaignFunnel } from "@/lib/reports";
import { METHODS, baht } from "@/lib/payments";
import { addDays } from "@/lib/time";

export const dynamic = "force-dynamic";

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");
const dmy = (d: string) => d.split("-").reverse().join("/");
const TH_M = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const ym = (s: string) => { const [y, m] = s.split("-").map(Number); return `${TH_M[m - 1]} ${String(y + 543).slice(-2)}`; };

/** CRM loop in numbers: channel → contact → booked → arrived → treated → paid → came back. */
export default async function Reports({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  await requireStaff(REPORT_ROLES);
  const key = PERIODS[(await searchParams).p || ""] ? (await searchParams).p! : "month";
  const [from, to] = periodRange(key);
  const [rows, k, months, camps] = await Promise.all([funnel(from, to), periodKpis(from, to), monthlyRevenue(6), campaignFunnel(from, to)]);
  const sum = rows.reduce((a, r) => ({ clients: a.clients + r.clients, booked: a.booked + r.booked, arrived: a.arrived + r.arrived, treated: a.treated + r.treated, paid: a.paid + r.paid, repeat: a.repeat + r.repeat, revenue: a.revenue + r.revenue }),
    { clients: 0, booked: 0, arrived: 0, treated: 0, paid: 0, repeat: 0, revenue: 0 });

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">REPORTS · CRM FUNNEL</div><h1>รายงาน {PERIODS[key]} <small className="muted" style={{ fontSize: 15 }}>{dmy(from)} – {dmy(addDays(to, -1))}</small></h1></div>
        <div className="row">{Object.entries(PERIODS).map(([p, l]) => <a key={p} href={`?p=${p}`} className={`btn small ${p === key ? "" : "ghost"}`}>{l}</a>)}</div>
      </div>

      <div className="kpis">
        <div className="kpi"><b>{baht(k.revenue)}</b><small>รายรับ ({k.receipts} ใบเสร็จ)</small></div>
        <div className="kpi"><b>{k.payers}</b><small>ลูกค้าที่ชำระเงิน</small></div>
        <div className="kpi"><b>{baht(Math.round(k.avgTicket))}</b><small>เฉลี่ยต่อใบเสร็จ</small></div>
        <div className="kpi"><b>{pct(k.returningRevenue, k.revenue)}</b><small>รายรับจากลูกค้าเก่า ({baht(k.returningRevenue)})</small></div>
        <div className="kpi"><b>{k.recall.booked}/{k.recall.reached}</b><small>recall ที่ติดต่อแล้วจองกลับ ({pct(k.recall.booked, k.recall.reached)})</small></div>
      </div>

      <section className="card">
        <div className="eyebrow">FUNNEL ตามช่องทาง · ลูกค้าใหม่ที่เข้ามาในช่วงนี้</div>
        <table className="t funnel" style={{ marginTop: 10 }}>
          <thead><tr><th>ช่องทาง</th><th>ลูกค้าใหม่</th><th>จองนัด</th><th>มาจริง</th><th>ได้ทำ</th><th>ชำระเงิน</th><th>กลับมาซ้ำ</th><th>รายรับรวม</th><th>ต่อคน</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={9} className="muted">ยังไม่มีลูกค้าใหม่ในช่วงนี้</td></tr>}
            {[...rows, ...(rows.length > 1 ? [{ src: "__all", ...sum }] : [])].map((r) => (
              <tr key={r.src} className={r.src === "__all" ? "total" : ""}>
                <td><b>{r.src === "__all" ? "รวม" : SOURCE_LABEL[r.src] ?? r.src}</b></td>
                <td>{r.clients}</td>
                <td>{r.booked} <small className="muted">{pct(r.booked, r.clients)}</small></td>
                <td>{r.arrived} <small className="muted">{pct(r.arrived, r.booked)}</small></td>
                <td>{r.treated} <small className="muted">{pct(r.treated, r.arrived)}</small></td>
                <td>{r.paid} <small className="muted">{pct(r.paid, r.clients)}</small></td>
                <td>{r.repeat} <small className="muted">{pct(r.repeat, r.treated)}</small></td>
                <td>{baht(r.revenue)}</td>
                <td>{r.paid ? baht(Math.round(r.revenue / r.paid)) : "–"}</td>
              </tr>))}
          </tbody>
        </table>
        <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>% ในแต่ละช่องเทียบกับขั้นก่อนหน้า (ชำระเงิน เทียบกับลูกค้าใหม่) · รายรับ = ทุกบาทที่ลูกค้ากลุ่มนี้จ่ายมาจนถึงวันนี้ · ช่องทาง = จุดแรกที่ลูกค้ารู้จักคลินิก</p>
      </section>

      {camps.length > 0 && <section className="card">
        <div className="eyebrow">แคมเปญโฆษณา / UTM · ลูกค้าใหม่ที่มาจากเว็บไซต์</div>
        <table className="t" style={{ marginTop: 10 }}>
          <thead><tr><th>ช่องทาง</th><th>แคมเปญ</th><th>ลูกค้าใหม่</th><th>จองนัด</th><th>ชำระเงิน</th><th>รายรับ</th></tr></thead>
          <tbody>{camps.map((c) => (
            <tr key={c.src + c.campaign}><td><small>{SOURCE_LABEL[c.src] ?? c.src}</small></td><td><b>{c.campaign}</b></td><td>{c.clients}</td>
              <td>{c.booked} <small className="muted">{pct(c.booked, c.clients)}</small></td><td>{c.paid} <small className="muted">{pct(c.paid, c.clients)}</small></td><td>{baht(c.revenue)}</td></tr>))}</tbody>
        </table>
      </section>}

      <div className="grid2">
        <section className="card"><div className="eyebrow">รายรับรายเดือน</div>
          <table className="t" style={{ marginTop: 10 }}><thead><tr><th>เดือน</th><th>รายรับ</th><th>ลูกค้าที่ชำระ</th></tr></thead>
            <tbody>{months.map((m) => <tr key={m.month}><td>{ym(m.month)}</td><td>{baht(m.revenue)}</td><td>{m.payers}</td></tr>)}</tbody></table>
        </section>
        <section className="card"><div className="eyebrow">หัตถการในช่วงนี้</div>
          {k.treatments.length === 0 ? <p className="muted">-</p> :
            <table className="t" style={{ marginTop: 10 }}><thead><tr><th>หัตถการ</th><th>ครั้ง</th><th>ลูกค้า</th></tr></thead>
              <tbody>{k.treatments.map((t) => <tr key={t.name}><td>{t.name}</td><td>{t.n}</td><td>{t.clients}</td></tr>)}</tbody></table>}
          <div className="eyebrow" style={{ marginTop: 16 }}>วิธีชำระ</div>
          {k.methods.length === 0 ? <p className="muted">-</p> : <ul className="list">{k.methods.map((m) => <li key={m.method}>{METHODS[m.method] ?? m.method}: {baht(m.amount)} ({m.n} ใบ)</li>)}</ul>}
          <p className="muted" style={{ fontSize: 13 }}>recall ที่ยังเปิดอยู่ {k.recall.open} ราย · <a href="/staff/recall">ไปหน้ากลับมาทำซ้ำ</a></p>
        </section>
      </div>
    </>
  );
}
