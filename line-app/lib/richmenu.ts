import { useLiff, bookUrl } from "./link";

// 2500 x 1686. public/richmenu.jpg is drawn to these areas:
//   row 1 (900 px): [ book a consult — 2 columns ][ programs & prices ][ real cases ]
//   row 2 (786 px): [ my bookings ][ chat ][ map & hours ][ Vinfinity Wallet ]
const SITE = "https://vinfinityclinic.com";
const utm = "utm_source=line&utm_medium=richmenu";

export const RICH_MENU_ITEMS = [
  { label: "จองคิวปรึกษาคุณหมอ", bounds: [0, 0, 1250, 900], action: () => (useLiff() ? { type: "uri", uri: bookUrl(null, { src: "richmenu" }) } : { type: "postback", data: "menu=book", displayText: "จองคิวปรึกษาคุณหมอ" }) },
  { label: "โปรแกรมและราคา", bounds: [1250, 0, 625, 900], action: () => ({ type: "uri", uri: `${SITE}/menu/?${utm}` }) },
  { label: "เคสจริงและรีวิว", bounds: [1875, 0, 625, 900], action: () => ({ type: "uri", uri: `${SITE}/?${utm}#results` }) },
  { label: "นัดของฉัน", bounds: [0, 900, 625, 786], action: () => (useLiff() ? { type: "uri", uri: bookUrl(null, { view: "my" }) } : { type: "postback", data: "menu=my", displayText: "นัดของฉัน" }) },
  { label: "คุยกับทีมคลินิก", bounds: [625, 900, 625, 786], action: () => ({ type: "message", text: "อยากปรึกษาค่ะ" }) },
  { label: "แผนที่และเวลาเปิด", bounds: [1250, 900, 625, 786], action: () => ({ type: "uri", uri: `${SITE}/?${utm}#clinic` }) },
  // Wallet: opens the membership page of the menu book until the VIP wallet app is ready
  { label: "Vinfinity Wallet", bounds: [1875, 900, 625, 786], action: () => ({ type: "uri", uri: `${SITE}/menu/?${utm}#wallet` }) },
];

export function richMenuDefinition() {
  return {
    size: { width: 2500, height: 1686 },
    selected: true,
    name: "Vinfinity main v2",
    chatBarText: "เมนู · จองคิว",
    areas: RICH_MENU_ITEMS.map((it) => {
      const [x, y, width, height] = it.bounds;
      return { bounds: { x, y, width, height }, action: { label: it.label.slice(0, 20), ...it.action() } };
    }),
  };
}
