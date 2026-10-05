import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { METHODS, baht } from "@/lib/payments";
import { thaiDate, thaiTime } from "@/lib/time";
import { PrintButton } from "./print";

export const dynamic = "force-dynamic";

const ADDRESS = "106/27-28 อาคารธนารักษ์ ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000"; // keep identical to the website NAP (build.py)
const LICENCE = "41101001567";

/** Printable receipt for the clinic's own records. Not a tax invoice. */
export default async function Receipt({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ void?: string }> }) {
  const { void: voidErr } = await searchParams;
  await requireStaff();
  const id = Number((await params).id);
  const p = await one(`select p.*, c.name, c.display_name, c.phone, s.name as staff_name, pl.items, pl.total as plan_total, pl.goal
    from payments p join clients c on c.id = p.client_id left join staff s on s.id = p.received_by left join plans pl on pl.id = p.plan_id where p.id = $1`, [id]);
  if (!p) notFound();
  const s = await getSettings();
  const at = new Date(p.created_at);
  const items = (p.items as { name: string; qty: number; unit: string }[] | null) ?? [];
  return (
    <>
      <div className="row noprint" style={{ justifyContent: "space-between" }}>
        <a className="btn ghost small" href={`/staff/clients/${p.client_id}#payments`}>← กลับหน้าลูกค้า</a>
        <PrintButton />
      </div>
      <article className="receipt card">
        {p.voided_at && <div className="void">ยกเลิกแล้ว</div>}
        <header>
          <div><b style={{ fontSize: 18 }}>{s.clinicName}</b><br /><small>{ADDRESS}<br />โทร {s.phone} · ใบอนุญาตสถานพยาบาลเลขที่ {LICENCE}</small></div>
          <div style={{ textAlign: "right" }}><b>ใบรับเงิน</b><br /><small>เลขที่ {p.receipt_no}<br />{thaiDate(at)} {thaiTime(at)}</small></div>
        </header>
        <p>ได้รับเงินจาก <b>{p.name || p.display_name || "-"}</b>{p.phone ? ` · โทร ${p.phone}` : ""}</p>
        <table className="t">
          <thead><tr><th>รายการ</th><th style={{ textAlign: "right" }}>จำนวนเงิน</th></tr></thead>
          <tbody><tr>
            <td>{p.plan_id ? <>ชำระตามแผนการรักษา #{p.plan_id}{items.length ? <><br /><small className="muted">{items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ")}</small></> : null}</> : "ค่าบริการทางการแพทย์"}
              {p.note ? <><br /><small className="muted">{p.note}</small></> : null}</td>
            <td style={{ textAlign: "right" }}>{baht(Number(p.amount))}</td>
          </tr></tbody>
          <tfoot><tr><td style={{ textAlign: "right" }}><b>รวม</b></td><td style={{ textAlign: "right" }}><b>{baht(Number(p.amount))}</b></td></tr></tfoot>
        </table>
        <p><small>ชำระโดย {METHODS[p.method] ?? p.method} · ผู้รับเงิน {p.staff_name || "-"}</small></p>
        {voidErr && !p.voided_at && <p className="err">ยกเลิกไม่ได้: {voidErr === "wallet_used" ? "ลูกค้าใช้เครดิตจาก Wallet นี้ไปแล้ว ต้องปรับยอดกับผู้จัดการก่อน" : voidErr === "reason" ? "ต้องใส่เหตุผล" : voidErr}</p>}
        {p.voided_at && <p className="err">ยกเลิกเมื่อ {thaiDate(new Date(p.voided_at))} · เหตุผล: {p.void_reason}</p>}
        <p className="muted" style={{ fontSize: 12 }}>เอกสารนี้เป็นใบรับเงินของคลินิก ไม่ใช่ใบกำกับภาษี</p>
      </article>
    </>
  );
}
