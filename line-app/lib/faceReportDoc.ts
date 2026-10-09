// Face Architecture Report: a 3-page A4 document the doctor sends after reading a client's photos.
// Pure function (data -> HTML) so the staff page, a print-to-PDF and the sample file share one template.

export type LayerKey = "skin" | "superficial" | "smas" | "deep" | "bone";
export type LayerStatus = "good" | "watch" | "treat";
export const LAYERS: { key: LayerKey; no: string; th: string; en: string; what: string }[] = [
  { key: "skin", no: "01", th: "ผิวหนัง", en: "SKIN", what: "ความชุ่มชื้น เนื้อผิว ริ้วรอยตื้น" },
  { key: "superficial", no: "02", th: "ไขมันชั้นตื้น", en: "SUPERFICIAL FAT", what: "ความอิ่ม รอยเว้าตื้น ร่องที่เห็นเวลาขยับ" },
  { key: "smas", no: "03", th: "SMAS · กล้ามเนื้อ", en: "SMAS & MUSCLE", what: "การยกกระชับ แรงดึงของกล้ามเนื้อ" },
  { key: "deep", no: "04", th: "ไขมันชั้นลึก · เอ็นยึด", en: "DEEP FAT & LIGAMENTS", what: "ปริมาตรที่หายไปตามวัย ความหย่อน" },
  { key: "bone", no: "05", th: "กระดูก", en: "BONE", what: "โครงหน้า ฐานที่ทุกชั้นวางอยู่" },
];
export const STATUS: Record<LayerStatus, { th: string; cls: string }> = {
  good: { th: "ดีอยู่แล้ว", cls: "good" },
  watch: { th: "ควรดูแล", cls: "watch" },
  treat: { th: "แนะนำให้แก้", cls: "treat" },
};

export type ReportData = {
  clientName: string;
  date: string; // e.g. "6 ตุลาคม 2569"
  doctor?: string;
  concern: string; // what the client said they want
  summary: string; // doctor's one-paragraph reading
  photos: { label: string; src?: string }[]; // up to 3
  layers: { key: LayerKey; status: LayerStatus; finding: string }[];
  plan: { when: string; layer: string; treatment: string; why: string; sessions?: string }[];
  notNow?: string[]; // things the doctor does not recommend now
  priceRange?: string; // e.g. "45,000–60,000 บาท"
  priceNote?: string;
  refs?: { label: string; url?: string }[];
  reportNo?: string;
};

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

const LOGO = `<svg viewBox="0 0 46 46" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7 L23 39 L40 7"/><path d="M14 7 L23 25 L32 7"/></svg>`;

const FACE = `<svg viewBox="0 0 120 150" class="ph-svg" aria-hidden="true"><g fill="none" stroke="#8698B5" stroke-width="1.2"><ellipse cx="60" cy="72" rx="38" ry="50"/><path d="M38 64q8-6 16 0M66 64q8-6 16 0"/><path d="M60 70v20q-5 4 0 6"/><path d="M47 106q13 8 26 0"/></g></svg>`;

export function renderFaceReport(d: ReportData, opts: { fontCss?: string } = {}) {
  const fontCss = opts.fontCss ?? `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&family=Montserrat:wght@500;600&display=swap" rel="stylesheet">`;
  const byKey = Object.fromEntries(d.layers.map((l) => [l.key, l]));
  const photos = [0, 1, 2].map((i) => d.photos[i] ?? { label: ["หน้าตรง", "เอียง 45°", "ด้านข้าง"][i] });
  const counts = { treat: d.layers.filter((l) => l.status === "treat").length, watch: d.layers.filter((l) => l.status === "watch").length };

  const head = (page: number) => `<header class="hd"><div class="brand">${LOGO}<span>VINFINITY</span></div><div class="meta">FACE ARCHITECTURE REPORT${d.reportNo ? ` · ${esc(d.reportNo)}` : ""} · ${page} / 3</div></header>`;
  const foot = `<footer class="ft"><span>Data-driven precision. Art-driven result.</span><span>LINE @vinfinityclinic · vinfinityclinic.com</span></footer>`;

  const stack = LAYERS.map((L, i) => {
    const st = (byKey[L.key]?.status ?? "good") as LayerStatus;
    return `<div class="sl ${STATUS[st].cls}" style="--i:${i}"><span>${L.no}</span><b>${esc(L.th)}</b><em>${STATUS[st].th}</em></div>`;
  }).join("");

  const rows = LAYERS.map((L) => {
    const l = byKey[L.key];
    const st = (l?.status ?? "good") as LayerStatus;
    return `<tr><td class="no">${L.no}</td><td><b>${esc(L.th)}</b><small>${esc(L.what)}</small></td><td><span class="chip ${STATUS[st].cls}">${STATUS[st].th}</span></td><td>${esc(l?.finding || "—")}</td></tr>`;
  }).join("");

  const plan = d.plan.map((p, i) => `<li><div class="pw"><span class="pn">${String(i + 1).padStart(2, "0")}</span><b>${esc(p.when)}</b></div>
    <div class="pb"><div class="pl">${esc(p.layer)}</div><h4>${esc(p.treatment)}${p.sessions ? `<small> · ${esc(p.sessions)}</small>` : ""}</h4><p>${esc(p.why)}</p></div></li>`).join("");

  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Face Architecture Report · ${esc(d.clientName)}</title>${fontCss}
<style>
:root{--navy:#0B142E;--royal:#1E3470;--sap:#3A5496;--peri:#8698B5;--silver:#D5DDEE;--pearl:#EEF2F8;--muted:#5A6480;--good:#2F7D5B;--watch:#B7791F;--treat:#1E3470}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Kanit,system-ui,sans-serif;color:var(--navy);background:#ccd3e0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;margin:0 auto 10mm;background:#fff;position:relative;overflow:hidden;padding:16mm 16mm 20mm;display:flex;flex-direction:column}
@media print{body{background:#fff}.page{margin:0;page-break-after:always}}
.hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:5mm;border-bottom:1px solid var(--silver)}
.brand{display:flex;align-items:center;gap:8px;color:var(--royal);font:600 12px Montserrat,sans-serif;letter-spacing:.3em}
.meta{font:600 8.5px Montserrat,sans-serif;letter-spacing:.2em;color:var(--sap)}
.ft{position:absolute;left:16mm;right:16mm;bottom:9mm;display:flex;justify-content:space-between;font:500 8.5px Montserrat,Kanit,sans-serif;color:var(--peri);letter-spacing:.06em;border-top:1px solid var(--silver);padding-top:3mm}
.eb{font:600 9px Montserrat,sans-serif;letter-spacing:.28em;color:var(--sap);text-transform:uppercase}
h1{font-weight:600;font-size:30px;line-height:1.2;color:var(--royal);margin-top:3mm}
h2{font-weight:600;font-size:19px;color:var(--royal);margin:2mm 0 3mm}
p{font-size:12px;line-height:1.65;color:#25324D}
.cover{margin:-16mm -16mm 0;padding:14mm 16mm 12mm;background:radial-gradient(ellipse at 75% 20%,#2A4796 0%,#1A326B 40%,#0B142E 90%);color:#fff}
.cover .brand{color:#fff}.cover .meta{color:var(--silver)}.cover .hd{border-color:rgba(213,221,238,.25)}
.cover h1{color:#fff;font-size:34px;margin-top:9mm}
.cover .eb{color:var(--silver);margin-top:2mm}
.who{display:flex;gap:10mm;margin-top:6mm;font-size:11.5px;color:var(--silver)}
.who b{display:block;font-size:15px;color:#fff;font-weight:500}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:7mm}
.ph{aspect-ratio:3/4;border-radius:5mm;overflow:hidden;background:var(--pearl);position:relative;display:grid;place-items:center}
.ph img{width:100%;height:100%;object-fit:cover}
.ph-svg{width:55%;opacity:.8}
.ph span{position:absolute;left:3mm;bottom:3mm;font-size:9.5px;background:rgba(255,255,255,.92);color:var(--royal);padding:1mm 3mm;border-radius:9px}
.box{border:1px solid var(--silver);border-radius:4mm;padding:5mm 6mm;margin-top:6mm}
.box.fill{background:var(--pearl);border-color:var(--pearl)}
.quote{font-size:14px;line-height:1.6;color:var(--royal)}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:5mm}
.kpi{border-radius:4mm;padding:4mm 5mm;background:var(--pearl)}
.kpi b{display:block;font:600 22px Montserrat,sans-serif;color:var(--royal)}
.kpi span{font-size:10.5px;color:var(--muted)}
.grid2{display:grid;grid-template-columns:62mm 1fr;gap:7mm;margin-top:4mm;align-items:start}
.stack{display:flex;flex-direction:column;gap:2.2mm;padding-top:2mm}
.sl{border-radius:3mm;padding:3mm 4mm;display:grid;grid-template-columns:7mm 1fr;row-gap:.5mm;color:#fff;background:var(--peri);margin-left:calc(var(--i) * 1.6mm);margin-right:calc((4 - var(--i)) * 1.6mm)}
.sl span{font:600 9px Montserrat,sans-serif;opacity:.85;grid-row:span 2;align-self:center}
.sl b{font-weight:500;font-size:11px}
.sl em{font-style:normal;font-size:9px;opacity:.9}
.sl.good{background:#8FB9A6}.sl.watch{background:#D4A35A}.sl.treat{background:var(--royal)}
table{width:100%;border-collapse:collapse;font-size:10.8px}
td{padding:3mm 2mm;border-bottom:1px solid var(--silver);vertical-align:top;line-height:1.55;color:#25324D}
td.no{font:600 10px Montserrat,sans-serif;color:var(--sap);width:8mm}
td b{display:block;color:var(--royal);font-weight:500;font-size:11.5px}
td small{display:block;color:var(--muted);font-size:9.5px}
.chip{display:inline-block;white-space:nowrap;font-size:9.5px;padding:.8mm 2.6mm;border-radius:9px;color:#fff}
.chip.good{background:var(--good)}.chip.watch{background:var(--watch)}.chip.treat{background:var(--treat)}
.legend{display:flex;gap:5mm;font-size:9.5px;color:var(--muted);margin-top:3mm}
.legend i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;vertical-align:middle}
ol.plan{list-style:none;margin-top:3mm;border-top:1px solid var(--silver)}
ol.plan li{display:grid;grid-template-columns:36mm 1fr;gap:5mm;padding:3.6mm 0;border-bottom:1px solid var(--silver)}
.pw{display:flex;gap:3mm;align-items:baseline}
.pn{font:600 10px Montserrat,sans-serif;color:var(--peri)}
.pw b{font-weight:500;font-size:11.5px;color:var(--royal)}
.pl{font:600 8.5px Montserrat,Kanit,sans-serif;letter-spacing:.14em;color:var(--sap);text-transform:uppercase}
.pb h4{font-weight:500;font-size:13px;color:var(--navy);margin:.6mm 0 .8mm}
.pb h4 small{font-size:10.5px;color:var(--muted);font-weight:400}
.pb p{font-size:10.8px;line-height:1.55;color:var(--muted)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:5mm}
.price b{display:block;font:600 20px Montserrat,Kanit,sans-serif;color:var(--royal);margin:1mm 0}
.price small,.nn li{font-size:10.5px;color:var(--muted);line-height:1.55}
.nn ul{padding-left:4mm;margin-top:1mm}
.refs{margin-top:auto;padding-top:4mm;font-size:8.8px;color:var(--muted);line-height:1.5}
.refs ol{padding-left:4mm}
.refs a{color:var(--sap);text-decoration:none}
.sign{display:flex;justify-content:space-between;align-items:flex-end;margin-top:5mm}
.sign .s{border-top:1px solid var(--navy);padding-top:2mm;font-size:10.5px;min-width:60mm;text-align:center}
.disc{font-size:8.8px;color:var(--muted);line-height:1.5;margin-top:3mm}
.next{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-top:3mm}
.next div{background:var(--pearl);border-radius:3mm;padding:3mm 4mm;font-size:10.5px;line-height:1.5;color:#25324D}
.next b{display:block;font:600 9px Montserrat,sans-serif;color:var(--sap);letter-spacing:.14em}
</style></head><body>

<section class="page">
 <div class="cover">
  ${head(1)}
  <div class="eb">Prepared for</div>
  <h1>${esc(d.clientName)}</h1>
  <div class="who"><div>วันที่ประเมิน<b>${esc(d.date)}</b></div><div>แพทย์ผู้ประเมิน<b>${esc(d.doctor ?? "นพ.เดโชวัต พรมดา")}</b></div></div>
  <div class="photos">${photos.map((p) => `<div class="ph">${p.src ? `<img src="${esc(p.src)}" alt="${esc(p.label)}">` : FACE}<span>${esc(p.label)}</span></div>`).join("")}</div>
 </div>
 <div class="box fill" style="margin-top:7mm"><div class="eb">สิ่งที่คุณอยากปรับ</div><p class="quote" style="margin-top:2mm">“${esc(d.concern)}”</p></div>
 <div style="margin-top:6mm"><div class="eb">Doctor's reading</div><h2>สรุปจากแพทย์</h2><p>${esc(d.summary)}</p></div>
 <div class="kpis">
  <div class="kpi"><b>5</b><span>ชั้นของใบหน้าที่ประเมิน</span></div>
  <div class="kpi"><b>${counts.treat}</b><span>ชั้นที่แนะนำให้แก้</span></div>
  <div class="kpi"><b>${d.plan.length}</b><span>ขั้นตอนในแผนการรักษา</span></div>
 </div>
 ${foot}
</section>

<section class="page">
 ${head(2)}
 <div class="eb" style="margin-top:6mm">The 5 layers</div>
 <h2>อ่านใบหน้าทีละชั้น</h2>
 <p>ใบหน้าไม่ได้มีชั้นเดียว ปัญหาที่เห็นด้านนอกมักเริ่มจากชั้นที่ลึกกว่า แพทย์จึงประเมินทั้ง 5 ชั้นก่อนวางแผน แล้วเริ่มแก้จากชั้นที่เป็นต้นเหตุ</p>
 <div class="grid2">
  <div><div class="stack">${stack}</div>
   <div class="legend"><span><i style="background:var(--good)"></i>ดีอยู่แล้ว</span><span><i style="background:var(--watch)"></i>ควรดูแล</span><span><i style="background:var(--treat)"></i>แนะนำให้แก้</span></div></div>
  <table><tbody>${rows}</tbody></table>
 </div>
 <div class="two" style="margin-top:8mm">
  <div class="box fill"><div class="eb">Data-driven precision</div><p style="margin-top:2mm">ประเมินจากโครงสร้างจริงของใบหน้าคุณ ทีละชั้น เลือกผลิตภัณฑ์จากคุณสมบัติและหลักฐานงานวิจัย และบันทึกทุกครั้งเพื่อให้การดูแลครั้งต่อไปแม่นขึ้น</p></div>
  <div class="box fill"><div class="eb">Art-driven result</div><p style="margin-top:2mm">ตัดสินผลลัพธ์ด้วยสัดส่วน แสง และเงาของใบหน้า รู้ว่าควรหยุดตรงไหน เป้าหมายคือดูสดชื่นขึ้นโดยยังเป็นตัวคุณ</p></div>
 </div>
 <div class="box" style="margin-top:5mm"><div class="eb">วิธีอ่านรายงานนี้</div><p style="margin-top:2mm">ชั้นที่ “แนะนำให้แก้” คือจุดที่ถ้าแก้แล้วจะเห็นความเปลี่ยนแปลงมากที่สุด ชั้นที่ “ควรดูแล” ยังไม่ต้องรีบ แต่ควรดูแลต่อเนื่อง ส่วนชั้นที่ “ดีอยู่แล้ว” ไม่ต้องทำอะไรเพิ่ม การไม่ทำในชั้นที่ไม่จำเป็นช่วยให้หน้ายังดูเป็นธรรมชาติ</p></div>
 ${foot}
</section>

<section class="page">
 ${head(3)}
 <div class="eb" style="margin-top:6mm">Your plan</div>
 <h2>แผนการรักษาที่แนะนำ</h2>
 <p>เรียงจากชั้นลึกขึ้นมาชั้นตื้น ใช้เท่าที่จำเป็น และนัดดูผลก่อนตัดสินใจขั้นต่อไปทุกครั้ง</p>
 <ol class="plan">${plan}</ol>
 <div class="two">
  <div class="box price"><div class="eb">ค่าใช้จ่ายโดยประมาณ</div><b>${esc(d.priceRange ?? "แจ้งหลังประเมินที่คลินิก")}</b><small>${esc(d.priceNote ?? "ราคาจริงยืนยันอีกครั้งหลังตรวจที่คลินิก แจ้งค่าใช้จ่ายทั้งหมดก่อนเริ่มทุกครั้ง")}</small></div>
  <div class="box nn"><div class="eb">ยังไม่แนะนำตอนนี้</div><ul>${(d.notNow ?? ["—"]).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
 </div>
 <div class="next"><div><b>STEP 1</b>ทัก LINE @vinfinityclinic เพื่อนัดตรวจที่คลินิก</div><div><b>STEP 2</b>แพทย์ตรวจซ้ำ ถ่ายรูปมาตรฐาน และยืนยันแผน</div><div><b>STEP 3</b>เริ่มชั้นแรก แล้วนัดดูผลราว 2 สัปดาห์</div></div>
 <div class="sign"><div class="disc" style="max-width:100mm">รายงานนี้ประเมินจากรูปถ่ายเพื่อประกอบการปรึกษา ไม่ใช่การวินิจฉัยหรือการรับประกันผล ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล การทำหัตถการทุกชนิดอาจมีผลข้างเคียง แพทย์จะยืนยันแผนอีกครั้งหลังตรวจที่คลินิก</div><div class="s">${esc(d.doctor ?? "นพ.เดโชวัต พรมดา")}<br><small style="color:var(--muted)">ว.48943 · Vinfinity Clinic</small></div></div>
 ${d.refs?.length ? `<div class="refs"><div class="eb" style="font-size:8px">เอกสารอ้างอิง</div><ol>${d.refs.map((r) => `<li>${r.url ? `<a href="${esc(r.url)}">${esc(r.label)}</a>` : esc(r.label)}</li>`).join("")}</ol></div>` : ""}
 ${foot}
</section>
</body></html>`;
}
