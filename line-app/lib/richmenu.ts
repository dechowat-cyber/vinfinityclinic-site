import { useLiff, bookUrl } from "./link";

// 2500 x 1686, 3 columns x 2 rows. The image (public/richmenu.png) is drawn to match these areas.
export const RICH_MENU_ITEMS = [
  { label: "จองคิวปรึกษาคุณหมอ", en: "BOOK A CONSULT", action: () => (useLiff() ? { type: "uri", uri: bookUrl(null, { src: "richmenu" }) } : { type: "postback", data: "menu=book", displayText: "จองคิวปรึกษาคุณหมอ" }) },
  { label: "นัดของฉัน", en: "MY APPOINTMENTS", action: () => (useLiff() ? { type: "uri", uri: bookUrl(null, { view: "my" }) } : { type: "postback", data: "menu=my", displayText: "นัดของฉัน" }) },
  { label: "คุยกับทีมคลินิก", en: "CHAT WITH US", action: () => ({ type: "message", text: "อยากปรึกษาค่ะ" }) },
  { label: "โปรแกรมและราคาเริ่มต้น", en: "PROGRAMS", action: () => ({ type: "uri", uri: "https://vinfinityclinic.com/#programs" }) },
  { label: "เคสจริงและรีวิว", en: "REVIEWS", action: () => ({ type: "uri", uri: "https://vinfinityclinic.com/#reviews" }) },
  { label: "แผนที่และเวลาเปิด", en: "VISIT US", action: () => ({ type: "uri", uri: "https://vinfinityclinic.com/#clinic" }) },
];

export function richMenuDefinition() {
  const W = 2500, H = 1686, cw = Math.round(W / 3), rh = H / 2;
  return {
    size: { width: W, height: H },
    selected: true,
    name: "Vinfinity main v1",
    chatBarText: "เมนู · จองคิว",
    areas: RICH_MENU_ITEMS.map((it, i) => ({
      bounds: { x: (i % 3) * cw, y: Math.floor(i / 3) * rh, width: i % 3 === 2 ? W - 2 * cw : cw, height: rh },
      action: { label: it.label.slice(0, 20), ...it.action() },
    })),
  };
}
