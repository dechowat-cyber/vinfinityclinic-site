import { test } from "node:test";
import assert from "node:assert/strict";
import { upsertClientByLine } from "../lib/crm";
import { startSession, saveShot, referencePhotos, sessionsFor, suggestKind, followupsDue, shotsOf, PROTOCOLS } from "../lib/photos";
import { q } from "../lib/db";
import { bkk } from "../lib/time";

const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
const shoot = (sessionId: number, angle: string) => saveShot({ sessionId, angle, mime: "image/jpeg", data: jpg, width: 3, height: 4, staffId: 1 });

test("session links to today's appointment, retake replaces the shot, closed session is locked", async () => {
  const c = await upsertClientByLine("UPH1", {});
  const now = bkk("2026-10-05", "11:00");
  await q("insert into appointments(client_id, doctor, start_at, end_at, status) values ($1,'DR',$2,$3,'arrived')",
    [c.id, bkk("2026-10-05", "10:30").toISOString(), bkk("2026-10-05", "11:00").toISOString()]);
  assert.equal(await suggestKind(c.id, now), "before");
  const s = await startSession({ clientId: c.id, kind: "before", protocol: "face5", staffId: 1, now });
  const row = (await q("select appointment_id from photo_sessions where id = $1", [s]))[0];
  assert.ok(row.appointment_id);
  const first = await shoot(s, "front");
  const again = await shoot(s, "front");
  assert.notEqual(first.id, again.id);
  assert.deepEqual(await shotsOf(s), { front: again.id });
  await q("update photo_sessions set completed_at = now() where id = $1", [s]);
  await assert.rejects(shoot(s, "left45"), /session_closed/);
  assert.equal(await suggestKind(c.id, now), "after");
});

test("ghost reference comes from the earlier before session, not later shots", async () => {
  const c = await upsertClientByLine("UPH2", {});
  const b = await startSession({ clientId: c.id, kind: "before", protocol: "face5", staffId: 1 });
  const bf = await shoot(b, "front");
  await q("update photo_sessions set created_at = now() - interval '20 days' where id = $1", [b]);
  await q("update photos set created_at = now() - interval '20 days' where session_id = $1", [b]);
  const f1 = await startSession({ clientId: c.id, kind: "followup", protocol: "face5", staffId: 1 });
  await shoot(f1, "front");
  await q("update photo_sessions set created_at = now() - interval '5 days' where id = $1", [f1]);
  await q("update photos set created_at = now() - interval '5 days' where session_id = $1", [f1]);
  const f2 = await startSession({ clientId: c.id, kind: "followup", protocol: "face5", staffId: 1 });
  const refs = await referencePhotos(c.id, f2);
  assert.equal(refs.front.id, bf.id); // baseline wins over the newer follow-up
  assert.equal(refs.left45, undefined);
  const list = await sessionsFor(c.id);
  assert.equal(list.length, 3);
  assert.equal(list.find((x) => x.id === b)!.taken, 1);
  assert.equal(list[0].expected, PROTOCOLS.face5.angles.length);
});

test("follow-up photo due at D14, cleared by a follow-up session", async () => {
  const c = await upsertClientByLine("UPH3", {});
  const now = new Date("2026-10-20T03:00:00Z");
  const b = await startSession({ clientId: c.id, kind: "before", protocol: "eyes", staffId: 1 });
  await q("update photo_sessions set created_at = '2026-10-04T03:00:00Z' where id = $1", [b]);
  await q("insert into treatments(client_id, name, done_at) values ($1, 'ฟิลเลอร์ใต้ตา', '2026-10-04T04:00:00Z')", [c.id]);
  assert.equal(await suggestKind(c.id, now), "followup");
  const due = await followupsDue(now);
  const mine = due.find((t) => Number(t.client_id) === c.id)!;
  assert.equal(mine.step, 14);
  const f = await startSession({ clientId: c.id, kind: "followup", protocol: "eyes", staffId: 1, now });
  await q("update photo_sessions set created_at = $2 where id = $1", [f, now.toISOString()]);
  assert.equal((await followupsDue(now)).some((t) => Number(t.client_id) === c.id), false);
  // D30 comes round again
  assert.equal((await followupsDue(new Date("2026-11-04T03:00:00Z"))).find((t) => Number(t.client_id) === c.id)!.step, 30);
});
