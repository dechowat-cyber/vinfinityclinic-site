
// Drafts only. Every text here must be approved by the doctor before aftercare is switched on
// (Settings → "แพทย์อนุมัติข้อความ aftercare แล้ว"). Prices other than those already published
// on the website are 0 and must be set by the branch manager.
export const AFTERCARE_DRAFT: Record<string, Record<number, string>> = {
  general: {
    0: "ขอบคุณที่ไว้ใจ Vinfinity Clinic นะคะ วันนี้พักผ่อนให้เพียงพอ เลี่ยงการนวดหรือกดบริเวณที่ทำ และดื่มน้ำมากๆ ค่ะ",
    1: "สวัสดีค่ะ ผ่านมา 1 วันแล้ว อาการเป็นอย่างไรบ้างคะ บวมหรือแดงเล็กน้อยพบได้ และมักค่อยๆ ดีขึ้นใน 2–3 วัน",
    3: "เคล็ดลับช่วงนี้: ทาครีมกันแดดทุกเช้า งดซาวน่า ออกกำลังกายหนัก และแอลกอฮอล์อีก 2–3 วันนะคะ",
    7: "ครบ 1 สัปดาห์แล้วค่ะ ถ้าสะดวก ส่ง selfie หน้าตรงในที่แสงสว่างมาให้ทีมดูผลได้นะคะ (ไม่บังคับ)",
  },
  filler: {
    0: "หลังฉีดฟิลเลอร์วันนี้: เลี่ยงการนวด กด หรือนอนคว่ำทับบริเวณที่ฉีด ประคบเย็นเบาๆ ได้ถ้าบวม และงดแอลกอฮอล์ 24 ชม. นะคะ",
    1: "ผ่านมา 1 วันหลังฉีดฟิลเลอร์ อาการเป็นอย่างไรบ้างคะ บวมหรือช้ำเล็กน้อยพบได้ และมักดีขึ้นใน 3–7 วัน",
    3: "เคล็ดลับช่วงนี้: ยังเลี่ยงการนวดหน้า ซาวน่า และออกกำลังกายหนักอีกสักระยะ ฟิลเลอร์จะเข้าที่และดูเป็นธรรมชาติขึ้นใน 1–2 สัปดาห์ค่ะ",
    7: "ครบ 1 สัปดาห์แล้วค่ะ ถ้าสะดวก ส่ง selfie หน้าตรงและเอียง 45° ในที่แสงสว่าง ให้ทีมดูผลได้นะคะ (ไม่บังคับ)",
  },
  toxin: {
    0: "หลังฉีดวันนี้: งดนอนราบและก้มหน้านาน 4 ชม. ไม่นวดหรือกดบริเวณที่ฉีด และงดออกกำลังกายหนักวันนี้นะคะ",
    1: "ผ่านมา 1 วันแล้ว อาการเป็นอย่างไรบ้างคะ ผลจะค่อยๆ เห็นใน 3–14 วันค่ะ",
    3: "ช่วงนี้ผลเริ่มเห็นทีละน้อย ถ้ามีคำถามเรื่องความสมดุลของใบหน้า ทักมาได้เลยค่ะ",
    7: "ครบ 1 สัปดาห์แล้วค่ะ ถ้าสะดวก ส่ง selfie ให้ทีมดูผลได้นะคะ (ไม่บังคับ) แพทย์จะประเมินอีกครั้งที่ 2 สัปดาห์ถ้าจำเป็น",
  },
  skinbooster: {
    0: "หลังทำสกินบูสเตอร์: ตุ่มนูนเล็กๆ จะยุบเองใน 1–2 วัน วันนี้งดแต่งหน้า และเลี่ยงการนวดหน้านะคะ",
    1: "ผ่านมา 1 วันแล้ว ผิวเป็นอย่างไรบ้างคะ แดงหรือมีจุดเล็กๆ พบได้และมักหายใน 2–3 วัน",
    3: "เคล็ดลับ: ทามอยส์เจอไรเซอร์และกันแดดทุกวัน ผิวจะค่อยๆ ดูชุ่มชื้นขึ้นค่ะ",
    7: "ครบ 1 สัปดาห์แล้วค่ะ ผลของสกินบูสเตอร์จะชัดขึ้นเมื่อทำครบคอร์ส ทีมจะเตือนนัดครั้งถัดไปให้นะคะ",
  },
  energy: {
    0: "หลังทำเครื่องยกกระชับวันนี้: ผิวอาจแดงหรือตึงเล็กน้อย ประคบเย็นได้ และทากันแดดสม่ำเสมอนะคะ",
    1: "ผ่านมา 1 วันแล้ว รู้สึกอย่างไรบ้างคะ อาการกดเจ็บเล็กน้อยพบได้และมักหายในไม่กี่วัน",
    3: "เคล็ดลับ: ดื่มน้ำมากๆ และกันแดดทุกวัน ผลยกกระชับจะค่อยๆ เห็นชัดขึ้นใน 1–3 เดือนค่ะ",
    7: "ครบ 1 สัปดาห์แล้วค่ะ มีคำถามเรื่องผลลัพธ์ ทักมาได้ตลอดนะคะ",
  },
};

export const CATALOG_SEED: [string, string, string, string, number, string][] = [
  // code, name, category, unit, price, aftercare_key
  ["FIL-HA", "ฟิลเลอร์ HA", "ฟิลเลอร์", "cc", 9990, "filler"],
  ["FIL-TT", "ฟิลเลอร์ใต้ตา", "ฟิลเลอร์", "cc", 9990, "filler"],
  ["FIL-DIS", "สลายฟิลเลอร์", "ฟิลเลอร์", "ครั้ง", 0, "filler"],
  ["TOX", "ฉีดลดริ้วรอย/ปรับรูปหน้า (โบทูลินัม)", "โบทูลินัม", "ตำแหน่ง", 0, "toxin"],
  ["SKB", "สกินบูสเตอร์", "สกินบูสเตอร์", "ครั้ง", 0, "skinbooster"],
  ["DOUBLO", "New Doublo 2.0 Multilayer Lifting", "ยกกระชับ", "ครั้ง", 22222, "energy"],
  ["CONSULT", "ปรึกษาและวางแผนการรักษา", "ปรึกษา", "ครั้ง", 0, "general"],
];

/** Days until the same treatment is usually due again (recall). The branch manager can change these in the catalog. */
export const RECALL_DAYS: Record<string, number> = { "FIL-HA": 270, "FIL-TT": 270, TOX: 120, SKB: 28, DOUBLO: 180 };

type Run = { query: (t: string, p?: unknown[]) => Promise<Record<string, any>[]> };

/** Runs right after the schema on first connection (see db.ts). */
export async function seedWith(r: Run) {
  const t = await r.query("select count(*)::int n from aftercare_templates");
  if (!t[0]?.n) for (const [k, days] of Object.entries(AFTERCARE_DRAFT)) for (const [d, body] of Object.entries(days))
    await r.query("insert into aftercare_templates(key, day, body) values ($1,$2,$3) on conflict do nothing", [k, Number(d), body]);
  const c = await r.query("select count(*)::int n from catalog");
  if (!c[0]?.n) for (const [code, name, cat, unit, price, ak] of CATALOG_SEED)
    await r.query("insert into catalog(code, name, category, unit, price, aftercare_key) values ($1,$2,$3,$4,$5,$6) on conflict do nothing", [code, name, cat, unit, price, ak]);
  // recall defaults, once only (so a value the manager clears stays cleared)
  if ((await r.query("insert into jobs(key) values ('seed:recall_days') on conflict do nothing returning key")).length)
    for (const [code, days] of Object.entries(RECALL_DAYS)) await r.query("update catalog set recall_days = $2 where code = $1 and recall_days is null", [code, days]);
}

export async function seedOnce() { /* kept for callers; seeding happens on connect */ }
