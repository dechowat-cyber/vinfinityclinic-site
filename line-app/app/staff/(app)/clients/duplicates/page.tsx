import { requireStaff } from "@/lib/session";
import { duplicateGroups, pickPrimary } from "@/lib/identity";
import { mergeAction } from "@/lib/cdpActions";
import { SOURCE_LABEL } from "@/lib/reports";
import { baht } from "@/lib/payments";
import { thaiDate } from "@/lib/time";

export const dynamic = "force-dynamic";
const ERR: Record<string, string> = { two_line_accounts: "ทั้งสองรายการมีบัญชี LINE คนละบัญชี ระบบไม่รวมให้ (อาจเป็นคนละคน)", not_found: "ไม่พบลูกค้า", bad_pair: "เลือกไม่ถูกต้อง" };

/** Same phone, more than one client record: merge into the one that has LINE. */
export default async function Duplicates({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  await requireStaff(["BM"]);
  const { err } = await searchParams;
  const groups = await duplicateGroups();
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">CDP · IDENTITY</div><h1>ลูกค้าซ้ำ (เบอร์โทรเดียวกัน)</h1></div>
        <a className="btn ghost small" href="/staff/clients">← ลูกค้า</a>
      </div>
      {err && <div className="card err">{ERR[err] ?? err}</div>}
      <p className="muted" style={{ margin: 0 }}>รวมแล้วนัด แผน ภาพ การชำระเงิน และประวัติทั้งหมดจะย้ายไปอยู่ที่รายการหลัก (รายการที่มี LINE) ระบบเก็บสำเนารายการที่ถูกรวมไว้ตรวจสอบย้อนหลัง</p>
      {groups.length === 0 ? <div className="card muted">ไม่พบลูกค้าซ้ำ</div> : groups.map((g) => {
        const p = g.reduce((a, b) => pickPrimary(a, b)[0]);
        return (
          <section key={g[0].phone_norm} className="card">
            <div className="eyebrow">เบอร์ {g[0].phone_norm}</div>
            <table className="t" style={{ marginTop: 10 }}><thead><tr><th>รายการ</th><th>LINE</th><th>ช่องทาง</th><th>นัด</th><th>ยอด</th><th>สร้างเมื่อ</th><th></th></tr></thead>
              <tbody>{g.map((c) => (
                <tr key={c.id}>
                  <td><a href={`/staff/clients/${c.id}`}><b>{c.name || c.display_name || `#${c.id}`}</b></a> <small className="muted">#{c.id}</small>{c.id === p.id && <> <span className="tag ok">รายการหลัก</span></>}</td>
                  <td>{c.line_user_id ? "มี" : "-"}</td><td><small>{SOURCE_LABEL[c.source] ?? c.source ?? "-"}</small></td><td>{c.appts}</td><td>{baht(c.revenue)}</td>
                  <td><small>{thaiDate(new Date(c.created_at))}</small></td>
                  <td>{c.id !== p.id && <form action={mergeAction}><input type="hidden" name="primary" value={p.id} /><input type="hidden" name="secondary" value={c.id} />
                    <button className="btn small">รวมเข้า #{p.id}</button></form>}</td>
                </tr>))}</tbody></table>
          </section>);
      })}
    </>
  );
}
