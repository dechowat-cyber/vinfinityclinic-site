// Self-care cards sent on LINE right after a treatment (D0). One card per treatment type.
// DRAFT TEXT: must be read and approved by the doctor on /staff/aftercare before anything is sent.
// Bump CARE_VERSION whenever any text here changes: the approval then has to be given again.

export const CARE_VERSION = "2026-10-05";

export type CareCard = {
  title: string;
  lead: string;
  special?: { title: string; lines: string[] };
  doList: string[];
  avoid: string[];
  normal: string[];
  urgent: string[];
};

export const CARE_CARDS: Record<string, CareCard> = {
  filler: {
    title: "ดูแลตัวเองหลังฉีดฟิลเลอร์",
    lead: "ฟิลเลอร์จะค่อยๆ เข้าที่และดูเป็นธรรมชาติขึ้นใน 1–2 สัปดาห์",
    doList: [
      "ประคบเย็นเบาๆ ครั้งละ 10 นาที ถ้ารู้สึกบวม (ใน 48 ชม.แรก)",
      "คืนแรกนอนหนุนหมอนสูง และนอนหงาย",
      "แต่งหน้าได้หลัง 12 ชม. โดยลงเบาๆ",
    ],
    avoid: [
      "นวด กด หรือขยี้บริเวณที่ฉีด · 2 สัปดาห์",
      "แอลกอฮอล์ · 24 ชม.",
      "ออกกำลังกายหนัก ซาวน่า อบไอน้ำ · 48 ชม.",
      "เลเซอร์ ทรีตเมนต์หน้า หรือเครื่องยกกระชับบริเวณที่ฉีด · 2 สัปดาห์",
    ],
    normal: ["บวม ช้ำ หรือกดเจ็บเล็กน้อย ดีขึ้นใน 3–7 วัน", "คลำแล้วรู้สึกเป็นก้อนนุ่มๆ ช่วงแรก"],
    urgent: ["ปวดมากขึ้นเรื่อยๆ ไม่ดีขึ้น", "ผิวซีดขาว คล้ำเป็นลายร่างแห หรือเย็นผิดปกติ", "ตามัว มองเห็นไม่ชัด"],
  },
  toxin: {
    title: "ดูแลตัวเองหลังฉีดโบท็อกซ์",
    lead: "ผลจะเริ่มเห็นใน 3–5 วัน และเต็มที่ประมาณ 2 สัปดาห์",
    doList: ["นั่งหรือยืนตัวตรงใน 4 ชม.แรก", "ใช้ชีวิตตามปกติได้เลย"],
    avoid: [
      "นอนราบหรือก้มหน้านาน · 4 ชม.",
      "นวด กด หรือถูบริเวณที่ฉีด · 24 ชม.",
      "ออกกำลังกายหนัก ซาวน่า · 24 ชม.",
      "แอลกอฮอล์ · 24 ชม.",
      "ทรีตเมนต์หน้าหรือเครื่องยกกระชับ · 1 สัปดาห์",
    ],
    normal: ["ตุ่มนูนเล็กๆ ตรงจุดฉีด ยุบใน 30 นาที", "จุดช้ำเล็กๆ หรือปวดศีรษะเล็กน้อย 1–2 วัน"],
    urgent: ["หนังตาตก หรือมองเห็นภาพซ้อน", "พูด กลืน หรือหายใจลำบาก"],
  },
  sculptra: {
    title: "ดูแลตัวเองหลังฉีด Sculptra",
    lead: "Sculptra ค่อยๆ กระตุ้นคอลลาเจน ผลจริงจะเห็นใน 6–12 สัปดาห์ และมักทำ 2–3 ครั้ง ห่างกัน 4–6 สัปดาห์",
    special: {
      title: "สำคัญ: นวดแบบ 5-5-5",
      lines: [
        "นวดวนเบาๆ บริเวณที่ฉีด ครั้งละ 5 นาที",
        "วันละ 5 ครั้ง (เช่น หลังตื่นนอนและหลังอาหาร)",
        "ต่อเนื่อง 5 วัน ตามวิธีที่แพทย์สอน",
        "ช่วยให้ตัวยากระจายสม่ำเสมอ ลดโอกาสเกิดก้อน",
      ],
    },
    doList: ["ประคบเย็นเบาๆ ได้ในวันแรก", "ดื่มน้ำมากๆ", "ทากันแดดทุกวัน"],
    avoid: [
      "แอลกอฮอล์ · 24 ชม.",
      "ออกกำลังกายหนัก ซาวน่า · 48 ชม.",
      "เลเซอร์ ทรีตเมนต์หน้า หรือเครื่องยกกระชับ · 2 สัปดาห์",
      "แดดจัด หรือความร้อนจัด · 1 สัปดาห์",
    ],
    normal: ["หน้าดูอิ่มทันทีหลังฉีด แล้วยุบลงใน 2–3 วัน เป็นเรื่องปกติ (ยังไม่ใช่ผลจริง)", "บวม ช้ำ กดเจ็บเล็กน้อย 3–7 วัน"],
    urgent: ["ปวดมากขึ้นเรื่อยๆ ผิวซีดหรือคล้ำเป็นปื้น", "บวมแดงร้อน มีไข้", "คลำเจอก้อนแข็งที่โตขึ้น หรือมองเห็นชัด (ทักมาให้แพทย์ดู)"],
  },
  hifu: {
    title: "ดูแลตัวเองหลังทำ HIFU",
    lead: "ผลยกกระชับจะค่อยๆ ชัดขึ้นใน 1–3 เดือน ตามการสร้างคอลลาเจนใหม่",
    doList: ["ทากันแดด SPF 30 ขึ้นไปทุกวัน", "ทามอยส์เจอไรเซอร์ให้ผิวชุ่มชื้น", "ดื่มน้ำมากๆ"],
    avoid: [
      "ซาวน่า อบไอน้ำ น้ำร้อนจัด · 3 วัน",
      "สครับ หรือครีมผลัดเซลล์ (AHA/BHA/เรตินอยด์) · 3 วัน",
      "นวดหน้าแรงๆ · 1 สัปดาห์",
    ],
    normal: ["แดง ตึง หรือบวมเล็กน้อย 1–3 วัน", "กดเจ็บหรือชาแนวกรามเล็กน้อย อาจนาน 1–2 สัปดาห์"],
    urgent: ["ผิวพุพอง เป็นแผลไหม้ หรือแสบร้อนมาก", "ยิ้มเบี้ยว หรือชามากขึ้นไม่ดีขึ้น"],
  },
  microneedle: {
    title: "ดูแลผิวหลังทำ Microneedle",
    lead: "ผิวจะค่อยๆ เรียบเนียนขึ้น เห็นผลชัดเมื่อทำครบคอร์ส",
    doList: [
      "ล้างหน้าด้วยน้ำสะอาดหรือคลีนเซอร์อ่อนโยน หลัง 6 ชม.",
      "ทามอยส์เจอไรเซอร์ตามที่แพทย์แนะนำ",
      "ทากันแดดทุกวัน ตั้งแต่วันรุ่งขึ้น",
    ],
    avoid: [
      "แต่งหน้า · 24 ชม.",
      "ว่ายน้ำ ซาวน่า ออกกำลังกายหนัก · 48 ชม.",
      "สครับ AHA/BHA เรตินอยด์ วิตามินซีเข้มข้น · 5 วัน",
      "แกะ เกา ขุยหรือผิวที่ลอก",
    ],
    normal: ["แดงคล้ายโดนแดด 1–3 วัน", "ผิวแห้ง ลอกเล็กน้อย 3–5 วัน"],
    urgent: ["มีตุ่มหนอง บวมแดงร้อนมากขึ้น หรือมีไข้", "ผื่นคันลามมากขึ้น"],
  },
};

/** Treatments without their own card fall back to the closest one (or none). */
export const CARD_FOR: Record<string, string> = { filler: "filler", toxin: "toxin", sculptra: "sculptra", hifu: "hifu", energy: "hifu", microneedle: "microneedle" };
export const cardFor = (aftercareKey: string | null | undefined) => (aftercareKey ? CARE_CARDS[CARD_FOR[aftercareKey]] : undefined);

const NAVY = "#0B142E", ROYAL = "#1E3470", SILVER = "#D5DDEE", MUTED = "#5A6480", MIST = "#EEF2F8", BAD = "#B3261E";
const t = (text: string, o: Record<string, unknown> = {}) => ({ type: "text", text, wrap: true, ...o });
const list = (head: string, items: string[], color = NAVY, mark = "•") => ({
  type: "box", layout: "vertical", spacing: "xs", margin: "lg", contents: [
    t(head, { size: "sm", weight: "bold", color }),
    ...items.map((x) => ({ type: "box", layout: "baseline", spacing: "sm", contents: [t(mark, { size: "sm", color, flex: 0 }), t(x, { size: "sm", color: NAVY, flex: 1 })] })),
  ] });

/** LINE Flex bubble for one self-care card. */
export function careFlex(c: CareCard, phone: string) {
  const body: unknown[] = [t(c.lead, { size: "sm", color: MUTED })];
  if (c.special) body.push({ type: "box", layout: "vertical", backgroundColor: MIST, cornerRadius: "10px", paddingAll: "12px", margin: "lg", spacing: "xs", contents: [
    t(c.special.title, { size: "sm", weight: "bold", color: ROYAL }), ...c.special.lines.map((x) => t(`• ${x}`, { size: "sm", color: NAVY })) ] });
  body.push(list("ทำได้ / ควรทำ", c.doList, ROYAL, "✓"));
  body.push(list("งดก่อน", c.avoid, NAVY, "✕"));
  body.push(list("อาการที่พบได้ ไม่ต้องกังวล", c.normal, MUTED));
  body.push(list(`ติดต่อคลินิกทันที ${phone}`, c.urgent, BAD, "!"));
  return {
    type: "flex", altText: c.title,
    contents: { type: "bubble", size: "mega",
      header: { type: "box", layout: "vertical", backgroundColor: NAVY, paddingAll: "18px", contents: [
        t("AFTERCARE · VINFINITY CLINIC", { size: "xxs", color: SILVER, weight: "bold" }),
        t(c.title, { size: "lg", color: "#FFFFFF", weight: "bold", margin: "sm" }) ] },
      body: { type: "box", layout: "vertical", paddingAll: "18px", contents: body },
      footer: { type: "box", layout: "vertical", paddingAll: "14px", contents: [
        { type: "button", style: "primary", height: "sm", color: ROYAL, action: { type: "uri", label: "โทรหาคลินิก", uri: `tel:${phone.replace(/[^0-9+]/g, "")}` } },
        t("เก็บการ์ดนี้ไว้ดูได้ตลอด · ทักแชทนี้ได้ทุกเรื่อง", { size: "xxs", color: MUTED, align: "center", margin: "md" }) ] } },
  };
}
