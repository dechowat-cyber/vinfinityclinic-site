import { test } from "node:test";
import assert from "node:assert/strict";
import { apptCard, reminderEn, enDate, enTime, intlPhone } from "../lib/apptCard";
import { DEFAULTS } from "../lib/settings";

test("English follow-up card: Bangkok date/time, purpose, international phone", () => {
  const a = { id: 7, start_at: "2026-11-09T06:00:00Z", doctor: "นพ.เดโชวัต", kind: "followup" };
  assert.equal(enDate(new Date(a.start_at)), "Monday, 9 November 2026");
  assert.equal(enTime(new Date(a.start_at)), "1:00 PM");
  assert.equal(intlPhone("082-462-2963"), "+66 82 462 2963");
  const m: any = apptCard(a, "en", DEFAULTS, "2-week follow-up after filler 1 cc + PN 2.5% 1 cc");
  const json = JSON.stringify(m);
  assert.match(m.altText, /^Follow-up review: Monday, 9 November 2026, 1:00 PM$/);
  assert.ok(json.includes("Your follow-up is booked") && json.includes("PN 2.5% 1 cc") && json.includes("+66 82 462 2963"));
  assert.ok(!/[฀-๿]/.test(JSON.stringify(m.contents.header) + JSON.stringify(m.contents.footer)), "no Thai in English header/buttons");
  assert.match(JSON.stringify(reminderEn(a, DEFAULTS, "d1")), /Tomorrow at 1:00 PM/);
  assert.match(JSON.stringify(apptCard(a, "th", DEFAULTS)), /ลงนัดติดตามผลแล้ว/);
});
