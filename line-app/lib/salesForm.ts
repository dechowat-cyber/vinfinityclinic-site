import { q, one } from "./db";
import { bkk, addDays } from "./time";

/**
 * The sales form staff kept before the bot (and may still post in the group while switching over):
 *  - a list of sales: date, HN, name, item, cash / transfer / card, note
 *  - a month grid: per day × seller (คุณหมอ / ยุ / เพลง) × channel (Walk in / Line OA / Online), target 50,000/day
 * Rows are re-checked against receipts already in the system so nothing is counted twice.
 */

export type FormRow = { day: string; hn?: string | null; name?: string | null; item?: string | null; method: string; amount: number; note?: string | null; seller?: string | null; channel?: string | null };
export type GridCell = { day: string; seller: string; channel: string; amount: number };
export type ParsedForm = { kind: "sales_list" | "daily_grid" | "other"; rows?: FormRow[]; grid?: GridCell[] };

const norm = (s?: string | null) => (s ?? "").replace(/\s+/g, "").toLowerCase();
export const methodOf = (s: string) => (/สด|cash/i.test(s) ? "cash" : /บัตร|card|credit|edc/i.test(s) ? "card" : "transfer");
// robust to small reading differences between postings: HN digits + day + amount + money type
const key = (r: FormRow) => { const hn = (r.hn ?? "").replace(/\D/g, "");
  return [r.day, hn || norm(r.name) || norm(r.item), Number(r.amount).toFixed(2), r.method].join("|"); };

/** Adds the rows not seen before (the form is cumulative, so earlier rows come again every day). */
export async function addRows(rows: FormRow[], source: string, formId: number | null, staffId: number | null) {
  let added = 0;
  for (const r of rows) {
    if (!r.day || !(Number(r.amount) > 0)) continue;
    const res = await one(`insert into manual_sales(day, hn, name, item, method, amount, seller, channel, note, source, form_id, created_by, dedupe)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) on conflict (dedupe) do nothing returning id`,
      [r.day, r.hn || null, r.name || null, r.item || null, r.method, r.amount, r.seller || null, r.channel || null, r.note || null, source, formId, staffId, key(r)]);
    if (res) added++;
  }
  return added;
}

export async function saveGrid(cells: GridCell[]) {
  for (const c of cells) {
    if (!c.day || !c.seller || !c.channel) continue;
    await q(`insert into sales_matrix(day, seller, channel, amount) values ($1,$2,$3,$4)
      on conflict (day, seller, channel) do update set amount = excluded.amount, updated_at = now()`, [c.day, c.seller, c.channel, Number(c.amount) || 0]);
  }
}

/**
 * Links form rows to receipts already in the system (same day, same amount, same kind of money)
 * so the money is counted once. Returns what still differs, for the re-check message.
 */
export async function reconcile(fromDay: string, toDay: string) {
  const [a, b] = [bkk(fromDay, "00:00").toISOString(), bkk(addDays(toDay, 1), "00:00").toISOString()];
  const rows = await q<{ id: number; day: string; amount: string; method: string }>(
    `select id, to_char(day,'YYYY-MM-DD') as day, amount, method from manual_sales where voided_at is null and payment_id is null and day between $1 and $2 order by id`, [fromDay, toDay]);
  const pays = await q<{ id: number; day: string; amount: string; method: string }>(
    `select p.id, to_char(p.created_at at time zone 'Asia/Bangkok','YYYY-MM-DD') as day, p.amount, p.method from payments p
     where p.voided_at is null and p.method <> 'wallet' and p.created_at >= $1 and p.created_at < $2
       and not exists (select 1 from manual_sales m where m.payment_id = p.id)`, [a, b]);
  const cashLike = (m: string) => (m === "qr" ? "transfer" : m);
  let matched = 0;
  for (const r of rows) {
    const i = pays.findIndex((p) => p.day === r.day && Number(p.amount) === Number(r.amount) && cashLike(p.method) === cashLike(r.method));
    if (i < 0) continue;
    await q("update manual_sales set payment_id = $1 where id = $2", [pays[i].id, r.id]);
    pays.splice(i, 1); matched++;
  }
  return { matched, systemOnly: pays.map((p) => ({ day: p.day, amount: Number(p.amount), method: p.method })) };
}

/** Form money not already in the system, by method — added to the finance totals. */
export async function manualTotals(fromDay: string, toDay: string) {
  const rows = await q<{ method: string; n: number; amt: number }>(`select method, count(*)::int n, coalesce(sum(amount),0)::float amt from manual_sales
    where voided_at is null and payment_id is null and day between $1 and $2 group by method`, [fromDay, toDay]);
  return rows.map((r) => ({ method: r.method, n: Number(r.n), amt: Number(r.amt) }));
}

export async function sellerTotals(fromDay: string, toDay: string) {
  return q<{ seller: string; channel: string; amt: number }>(`select seller, channel, sum(amount)::float amt from sales_matrix
    where day between $1 and $2 and amount <> 0 group by seller, channel order by seller, channel`, [fromDay, toDay]);
}

export async function listManual(fromDay: string, toDay: string) {
  return q(`select id, to_char(day,'YYYY-MM-DD') as day, hn, name, item, method, amount::float amount, seller, channel, note, source, payment_id, voided_at
    from manual_sales where day between $1 and $2 order by day desc, id desc`, [fromDay, toDay]);
}

// ---------- reading a photo / screenshot of the form ----------

const PROMPT = `You read a Thai aesthetic clinic's sales form (screenshot of a spreadsheet). Return ONLY JSON, no prose.
Thai Buddhist dates like "4/10/69" mean day/month/2569 BE = 2026 CE → "2026-10-04". A row with an empty date belongs to the date of the row above it.
If the image is the sales list (columns: วัน/เดือน/ปี, HN, ชื่อ-สกุล, หัตถการ, เงินสด, โอน, บัตรเครดิต, รวม, หมายเหตุ):
{"kind":"sales_list","rows":[{"day":"YYYY-MM-DD","hn":"HN 98","name":"...","item":"...","method":"cash|transfer|card","amount":1000,"note":"..."}]}
 - one entry per money column that has a value (a row paid by cash and transfer gives two entries); skip rows with no money (e.g. course use) and the total row.
If the image is the daily grid (rows = dates, column groups = seller names, sub-columns Walk in / Line OA / Online):
{"kind":"daily_grid","grid":[{"day":"YYYY-MM-DD","seller":"คุณหมอ","channel":"Walk in|Line OA|Online","amount":8000}]}
 - only non-empty cells; ignore the target column, day-off rows and the total row.
Otherwise: {"kind":"other"}. Numbers are plain numbers without commas. Never invent values you cannot read.`;

/** Reads the form image through Vercel AI Gateway (authenticated with the deployment's OIDC token). */
export async function readForm(img: Buffer, mime: string): Promise<ParsedForm> {
  const { getVercelOidcToken } = await import("@vercel/oidc");
  const token = process.env.AI_GATEWAY_API_KEY || (await getVercelOidcToken());
  const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      model: process.env.FORM_READER_MODEL || "anthropic/claude-sonnet-4.5",
      temperature: 0,
      messages: [{ role: "user", content: [
        { type: "text", text: PROMPT },
        { type: "image_url", image_url: { url: `data:${mime};base64,${img.toString("base64")}` } },
      ] }],
    }),
  });
  if (!res.ok) throw new Error(`gateway ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  const text: string = j.choices?.[0]?.message?.content ?? "";
  return parseReply(text);
}

export function parseReply(text: string): ParsedForm {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return { kind: "other" };
  const o = JSON.parse(m[0]);
  if (o.kind === "sales_list") {
    const rows: FormRow[] = (o.rows || []).filter((r: any) => /^\d{4}-\d{2}-\d{2}$/.test(r.day) && Number(r.amount) > 0)
      .map((r: any) => ({ day: r.day, hn: r.hn ?? null, name: r.name ?? null, item: r.item ?? null, method: methodOf(String(r.method ?? "")), amount: Number(r.amount), note: r.note ?? null }));
    return { kind: "sales_list", rows };
  }
  if (o.kind === "daily_grid") {
    const grid: GridCell[] = (o.grid || []).filter((g: any) => /^\d{4}-\d{2}-\d{2}$/.test(g.day) && g.seller && g.channel)
      .map((g: any) => ({ day: g.day, seller: String(g.seller).trim(), channel: String(g.channel).trim(), amount: Number(g.amount) || 0 }));
    return { kind: "daily_grid", grid };
  }
  return { kind: "other" };
}

const fmt = (n: number) => Number(n).toLocaleString("th-TH", { maximumFractionDigits: 2 });
const M_TH: Record<string, string> = { cash: "เงินสด", transfer: "โอน", card: "บัตร", qr: "QR" };

/** Handles one form image posted in the staff or management group. Returns the text for the management group. */
export async function ingestFormImage(messageId: string, groupId: string, img: Buffer, mime: string) {
  if (await one("select 1 from sales_forms where message_id = $1", [messageId])) return null;
  const parsed = await readForm(img, mime);
  if (parsed.kind === "other") { await q("insert into sales_forms(message_id, group_id, kind) values ($1,$2,'other') on conflict do nothing", [messageId, groupId]); return null; }
  const f = await one<{ id: number }>("insert into sales_forms(message_id, group_id, kind, parsed) values ($1,$2,$3,$4) on conflict (message_id) do nothing returning id",
    [messageId, groupId, parsed.kind, JSON.stringify(parsed)]);
  if (!f) return null;
  const lines: string[] = [];
  if (parsed.kind === "sales_list" && parsed.rows?.length) {
    const days = parsed.rows.map((r) => r.day).sort();
    const added = await addRows(parsed.rows, "form", f.id, null);
    const rec = await reconcile(days[0], days[days.length - 1]);
    const sum = parsed.rows.reduce((s, r) => s + r.amount, 0);
    lines.push(`🧾 อ่านฟอร์มยอดขายแล้ว ${parsed.rows.length} รายการ รวม ${fmt(sum)} บาท`,
      `  รายการใหม่ ${added} · ซ้ำกับที่ส่งมาก่อน ${parsed.rows.length - added}${rec.matched ? ` · ตรงกับใบเสร็จในระบบ ${rec.matched} (ไม่นับซ้ำ)` : ""}`);
    if (rec.systemOnly.length) lines.push(`  ⚠️ มีในระบบแต่ไม่อยู่ในฟอร์ม: ${rec.systemOnly.map((p) => `${p.day.slice(8)}/${p.day.slice(5, 7)} ${M_TH[p.method] ?? p.method} ${fmt(p.amount)}`).join(", ")}`);
    // compare with the grid of the same days, if staff sent it
    for (const d of [...new Set(days)]) {
      const g = await one<{ s: number }>("select coalesce(sum(amount),0)::float s from sales_matrix where day = $1", [d]);
      const r = parsed.rows.filter((x) => x.day === d).reduce((s, x) => s + x.amount, 0);
      if (Number(g?.s) > 0 && Number(g!.s) !== r) lines.push(`  ⚠️ ${d.slice(8)}/${d.slice(5, 7)} รายการรวม ${fmt(r)} แต่ตารางรายวันรวม ${fmt(Number(g!.s))}`);
    }
  } else if (parsed.kind === "daily_grid" && parsed.grid?.length) {
    await saveGrid(parsed.grid);
    const sum = parsed.grid.reduce((s, g) => s + g.amount, 0);
    lines.push(`📋 อ่านตารางยอดรายวัน (แยกคน/ช่องทาง) แล้ว ${parsed.grid.length} ช่อง รวม ${fmt(sum)} บาท`);
  } else return null;
  lines.push("รวมในรายงาน 19:00 ให้แล้วค่ะ · แก้ไขได้ที่ " + `${process.env.APP_URL || ""}/staff/finance`);
  const text = lines.join("\n");
  await q("update sales_forms set summary = $1 where id = $2", [text, f.id]);
  return text;
}

/** Pre-bot sales 1–4 Oct 2569 from the staff form the doctor sent (5 Oct). HN 58 on 1 Oct used a course: no money. */
export async function importOct69() {
  const rows: FormRow[] = [
    { day: "2026-10-03", hn: "HN 98", name: "k ต่าย", item: null, method: "transfer", amount: 1000, note: "มัดจำ Botox 50 u คงเหลือ 2210 บาท", seller: "ยุ", channel: "Line OA" },
    { day: "2026-10-03", hn: "HN 150", name: "k แม่ติ๋ม", item: null, method: "transfer", amount: 1000, note: "มัดจำ vitaran 3 cc คงเหลือ 8900 บาท", seller: "ยุ", channel: "Line OA" },
    { day: "2026-10-04", hn: "HN 126", name: "k แม่แอน", item: "Doublo 400 line 4000+Neocler 4 cc", method: "transfer", amount: 8000, note: null, seller: "คุณหมอ", channel: "Line OA" },
  ];
  const n = await addRows(rows, "import", null, null);
  await saveGrid([{ day: "2026-10-03", seller: "ยุ", channel: "Line OA", amount: 2000 }, { day: "2026-10-04", seller: "คุณหมอ", channel: "Line OA", amount: 8000 }]);
  await reconcile("2026-10-01", "2026-10-04");
  return n;
}
