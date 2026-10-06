import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { handleEvent } from "../lib/webhook";
import { getClientByLine } from "../lib/crm";
import { addFaceReportPhoto, activeReport, draftFromForm, reportData, reportReadyMsg } from "../lib/faceReport";
import { renderFaceReport } from "../lib/faceReportDoc";
import { readLinkToken } from "../lib/link";
import { q, one } from "../lib/db";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";
const open = new Date("2026-10-05T05:00:00Z");
const U = "UFR1";
const ev = (extra: any) => ({ replyToken: "t", source: { type: "user", userId: U }, ...extra });
const say = (text: string) => handleEvent(ev({ type: "message", message: { type: "text", id: "m", text } }), open, DEFAULTS);
const tap = (data: string) => handleEvent(ev({ type: "postback", postback: { data } }), open, DEFAULTS);

test("face report: consent first, 3 questions, 3 photos, staff link only, then a private report link", async () => {
  // the ad's pre-filled message starts the flow; no data consent yet -> asks for it
  let out = await say("ขอรับ Face Architecture Report");
  const txt = JSON.stringify(out);
  assert.ok(txt.includes("ข้อมูลสุขภาพ"), "explains why consent is needed");
  const c = (await getClientByLine(U))!;
  assert.equal((await activeReport(c.id, open))!.status, "need_consent");

  // consent yes -> first question with quick replies
  out = await tap("consent=data&v=1");
  assert.ok(JSON.stringify(out).includes("(1/3)"));
  assert.equal((await activeReport(c.id, open))!.status, "asking");

  out = await tap("fr=a&k=concern&v=0");
  assert.ok(JSON.stringify(out).includes("(2/3)"));
  out = await tap("fr=a&k=concern&v=2"); // out-of-order tap is ignored, question repeated
  assert.ok(JSON.stringify(out).includes("(2/3)"));
  await tap("fr=a&k=history&v=0");
  out = await tap("fr=a&k=budget&v=1");
  assert.ok(JSON.stringify(out).includes("รูปที่ 1/3"));
  const r = (await activeReport(c.id, open))!;
  assert.equal(r.status, "waiting_photo");
  assert.deepEqual(r.answers, { concern: "ใต้ตา / ดูเหนื่อย", history: "ไม่เคย", budget: "15,000–40,000" });

  const img = { mime: "image/jpeg", data: Buffer.from([1, 2, 3]) };
  assert.ok(JSON.stringify(await addFaceReportPhoto(c.id, img, open)).includes("รูปที่ 2/3"));
  assert.ok(JSON.stringify(await addFaceReportPhoto(c.id, img, open)).includes("รูปที่ 3/3"));
  assert.ok(JSON.stringify(await addFaceReportPhoto(c.id, img, open)).includes("ครบแล้ว"));
  const row = await one("select * from face_reports where client_id = $1 order by id desc limit 1", [c.id]);
  assert.equal(row!.status, "waiting_doctor");
  const ph = await q("select angle from photos where face_report_id = $1 order by id", [row!.id]);
  assert.deepEqual(ph.map((p) => p.angle), ["fr_front", "fr_oblique", "fr_profile"]);
  assert.equal(await addFaceReportPhoto(c.id, img, open), null, "no request waiting -> image falls through to other handlers");

  // doctor's draft from the form -> document
  const fd = new FormData();
  fd.set("summary", "เริ่มจากชั้นลึก"); fd.set("st_deep", "treat"); fd.set("fd_deep", "ปริมาตรลดลง");
  fd.set("plan", "สัปดาห์ 0 | 04 · ไขมันชั้นลึก | ฟิลเลอร์ HA | รองรับใต้ตา [1] | 1 ครั้ง");
  fd.set("refs", "Master 2024 | https://doi.org/10.1097/GOX.0000000000005934");
  const draft = draftFromForm(fd);
  assert.equal(draft.plan[0].treatment, "ฟิลเลอร์ HA");
  assert.equal(draft.layers.find((l) => l.key === "deep")!.status, "treat");
  const html = renderFaceReport(reportData({ ...row!, report: draft }, "คุณทดสอบ", []));
  assert.ok(html.includes("FAR-") && html.includes("แนะนำให้แก้") && html.includes("ฟิลเลอร์ HA"));
  assert.ok(html.includes("ใต้ตา / ดูเหนื่อย"), "client's concern shown on the cover");

  // the LINE card links to a personal signed URL for this user only
  const card = JSON.stringify(reportReadyMsg(row!.id, U, "ทดสอบ"));
  const t = decodeURIComponent(card.match(/t=([^"\\]+)/)![1]);
  assert.equal(readLinkToken(t), U);
});

test("face report: cancel by typing ยกเลิก", async () => {
  const u = "UFR2";
  await handleEvent({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", id: "m", text: "วิเคราะห์หน้า" } }, open, DEFAULTS);
  const c = (await getClientByLine(u))!;
  assert.ok(await activeReport(c.id, open));
  const out = await handleEvent({ type: "message", replyToken: "t", source: { type: "user", userId: u }, message: { type: "text", id: "m", text: "ยกเลิก" } }, open, DEFAULTS);
  assert.ok(JSON.stringify(out).includes("ยกเลิกคำขอรายงานแล้ว"));
  assert.equal(await activeReport(c.id, open), null);
});
