import { getSettings } from "./settings";
import { push } from "./line";
import { once } from "./jobs";

const staffUrl = (path: string) => `${process.env.APP_URL || ""}${path}`;

/** Posts to the staff LINE group. Never put health details here, only a link that needs login. */
export async function notifyStaff(text: string, key?: string) {
  if (key && !(await once(`notify:${key}`))) return false;
  const s = await getSettings();
  if (!s.staffGroupId) { console.warn("[notify] no staff group:", text); return false; }
  try { await push(s.staffGroupId, [{ type: "text", text }]); return true; }
  catch (e) { console.error("[notify]", e); return false; }
}

export async function alertCare(_clientId: number, what: string) {
  return notifyStaff(`🩺 ${what}\nเปิดดูและรับเรื่อง: ${staffUrl("/staff/care")}`);
}
