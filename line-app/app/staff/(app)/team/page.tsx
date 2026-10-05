import { q } from "@/lib/db";
import { staffUpdate, staffApprove } from "@/lib/actions";
import { requireStaff, ROLES } from "@/lib/session";

export const dynamic = "force-dynamic";

const sel = { border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", minHeight: 40 } as const;

export default async function Team() {
  const me = await requireStaff(["BM"]);
  const rows = await q("select * from staff where role <> 'OFF' or active order by created_at");
  const waiting = rows.filter((r) => !r.active), team = rows.filter((r) => r.active);
  return (
    <>
      <div><div className="eyebrow">TEAM</div><h1>ทีมงาน</h1></div>
      {waiting.length > 0 && <section className="card" style={{ borderColor: "var(--warn)" }}>
        <div className="eyebrow" style={{ color: "var(--warn)" }}>รออนุมัติ {waiting.length} คน</div>
        {waiting.map((r) => (
          <form key={r.id} action={staffApprove} className="row" style={{ marginTop: 12, alignItems: "center" }}>
            <input type="hidden" name="id" value={r.id} />
            {r.picture_url && <img src={r.picture_url} alt="" width={36} height={36} style={{ borderRadius: "50%" }} />}
            <b style={{ flex: 1 }}>{r.name || "-"}</b>
            <select name="role" defaultValue="AD" style={sel} aria-label="บทบาท">{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <button className="btn small">อนุมัติ</button>
            <button className="btn ghost small" name="decline" value="1">ไม่ใช่พนักงาน</button>
          </form>))}
      </section>}
      <p className="muted" style={{ margin: 0 }}>พนักงานใหม่กด “เข้าสู่ระบบด้วย LINE” ครั้งเดียว แล้วจะขึ้นที่นี่ให้คุณอนุมัติ (ระบบแจ้งในกลุ่ม LINE พนักงานด้วย)</p>
      <table className="t">
        <thead><tr><th>ชื่อ</th><th>บทบาท</th></tr></thead>
        <tbody>
          {team.map((r) => (
            <tr key={r.id}>
              <td><b>{r.name || "-"}</b>{r.id === me.id && <span className="muted"> (คุณ)</span>}</td>
              <td>
                <form action={staffUpdate} className="row">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="active" value="on" />
                  <select name="role" defaultValue={r.role} style={sel}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                  <button className="btn ghost small">บันทึก</button>
                  {r.id !== me.id && <button className="btn ghost small danger" name="active" value="off" formNoValidate>ปิดสิทธิ์</button>}
                </form>
              </td>
            </tr>))}
        </tbody>
      </table>
    </>
  );
}
