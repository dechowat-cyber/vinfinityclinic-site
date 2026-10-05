
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

/** Added after launch (seeded once on existing databases too). */
export const AFTERCARE_DRAFT_V2: Record<string, Record<number, string>> = {
  sculptra: {
    0: "หลังฉีด Sculptra วันนี้ อย่าลืมนวดแบบ 5-5-5 นะคะ: ครั้งละ 5 นาที วันละ 5 ครั้ง ต่อเนื่อง 5 วัน",
    1: "ผ่านมา 1 วันแล้ว อาการเป็นอย่างไรบ้างคะ วันนี้นวด 5-5-5 ครบหรือยังคะ หน้าที่ดูอิ่มหลังฉีดจะยุบลงใน 2–3 วัน เป็นเรื่องปกติค่ะ",
    3: "วันที่ 3 แล้ว นวดต่ออีก 2 วันให้ครบ 5 วันนะคะ ผลจริงของ Sculptra จะค่อยๆ เห็นใน 6–12 สัปดาห์ค่ะ",
    7: "ครบ 1 สัปดาห์แล้วค่ะ ถ้าคลำเจอก้อนหรือมีคำถาม ส่งรูปมาให้ทีมดูได้เลยนะคะ ทีมจะเตือนนัดครั้งถัดไป (ประมาณ 4–6 สัปดาห์) ให้ค่ะ",
  },
  hifu: {
    0: "หลังทำ HIFU วันนี้ ผิวอาจแดงหรือตึงเล็กน้อย ทากันแดดและมอยส์เจอไรเซอร์สม่ำเสมอนะคะ",
    1: "ผ่านมา 1 วันแล้ว รู้สึกอย่างไรบ้างคะ กดเจ็บหรือชาแนวกรามเล็กน้อยพบได้ และค่อยๆ หายเองค่ะ",
    3: "เคล็ดลับ: ดื่มน้ำมากๆ และกันแดดทุกวัน ผลยกกระชับจะค่อยๆ ชัดขึ้นใน 1–3 เดือนค่ะ",
    7: "ครบ 1 สัปดาห์แล้วค่ะ มีคำถามเรื่องผลลัพธ์ ทักมาได้ตลอดนะคะ",
  },
  microneedle: {
    0: "หลังทำ Microneedle วันนี้ งดแต่งหน้า 24 ชม. และล้างหน้าเบาๆ หลัง 6 ชม. นะคะ",
    1: "ผ่านมา 1 วันแล้ว ผิวเป็นอย่างไรบ้างคะ แดงคล้ายโดนแดดพบได้และจะดีขึ้นใน 1–3 วัน เริ่มทากันแดดได้ตั้งแต่วันนี้ค่ะ",
    3: "ช่วงนี้ผิวอาจแห้งหรือลอกเล็กน้อย ทามอยส์เจอไรเซอร์บ่อยๆ และอย่าแกะนะคะ งดสครับและกรดผลัดเซลล์จนครบ 5 วันค่ะ",
    7: "ครบ 1 สัปดาห์แล้วค่ะ ผิวจะดีขึ้นชัดเมื่อทำครบคอร์ส ทีมจะเตือนนัดครั้งถัดไปให้นะคะ",
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
export const CATALOG_SEED_V2: [string, string, string, string, number, string][] = [
  ["SCULPTRA", "Sculptra กระตุ้นคอลลาเจน", "กระตุ้นคอลลาเจน", "ขวด", 0, "sculptra"],
  ["HIFU", "HIFU ยกกระชับ", "ยกกระชับ", "ครั้ง", 0, "hifu"],
  ["MN", "Microneedle", "ผิว", "ครั้ง", 0, "microneedle"],
];

/** Days until the same treatment is usually due again (recall). The branch manager can change these in the catalog. */
export const RECALL_DAYS: Record<string, number> = { "FIL-HA": 270, "FIL-TT": 270, TOX: 120, SKB: 28, DOUBLO: 180, SCULPTRA: 42, HIFU: 180, MN: 28 };

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
  // v2: Sculptra / HIFU / Microneedle with their own aftercare; New Doublo is HIFU
  if ((await r.query("insert into jobs(key) values ('seed:v2_care') on conflict do nothing returning key")).length) {
    for (const [k, days] of Object.entries(AFTERCARE_DRAFT_V2)) for (const [d, body] of Object.entries(days))
      await r.query("insert into aftercare_templates(key, day, body) values ($1,$2,$3) on conflict do nothing", [k, Number(d), body]);
    for (const [code, name, cat, unit, price, ak] of CATALOG_SEED_V2)
      await r.query("insert into catalog(code, name, category, unit, price, aftercare_key, recall_days) values ($1,$2,$3,$4,$5,$6,$7) on conflict (code) do nothing", [code, name, cat, unit, price, ak, RECALL_DAYS[code] ?? null]);
    await r.query("update catalog set aftercare_key = 'hifu' where code = 'DOUBLO' and aftercare_key = 'energy'");
  }
}

export async function seedOnce() { /* kept for callers; seeding happens on connect */ }
