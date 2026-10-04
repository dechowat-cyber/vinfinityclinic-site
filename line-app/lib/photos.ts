import { q, one } from "./db";
import { bkk, todayBkk, addDays } from "./time";

// Photo studio in the style of Next Motion: every visit is a session that follows a fixed protocol
// (same angles, same order), the camera shows a ghost of the earlier photo of the same angle so the
// pose, distance and framing match, and before/after/follow-up sessions line up for comparison.

/** guide = which alignment lines the camera draws over the live view */
export type Guide = "front" | "oblique" | "profile" | "close";
export type Angle = { key: string; label: string; hint: string; guide: Guide };

const A: Record<string, Angle> = {
  front: { key: "front", label: "หน้าตรง", hint: "มองตรงเข้ากล้อง หน้านิ่ง ปากปิด ผมเก็บหลังหู", guide: "front" },
  left45: { key: "left45", label: "เอียงซ้าย 45°", hint: "หันซ้ายจนปลายจมูกชนแนวแก้มอีกข้าง", guide: "oblique" },
  right45: { key: "right45", label: "เอียงขวา 45°", hint: "หันขวาจนปลายจมูกชนแนวแก้มอีกข้าง", guide: "oblique" },
  left90: { key: "left90", label: "ด้านซ้าย 90°", hint: "หันซ้ายเต็มข้าง เห็นตาข้างเดียว", guide: "profile" },
  right90: { key: "right90", label: "ด้านขวา 90°", hint: "หันขวาเต็มข้าง เห็นตาข้างเดียว", guide: "profile" },
  chinup: { key: "chinup", label: "เงยหน้า", hint: "เงยหน้าขึ้นเล็กน้อย เห็นแนวกราม-คอ", guide: "front" },
  eye_front: { key: "eye_front", label: "ใต้ตา ตรง", hint: "ซูมช่วงตา-แก้ม มองตรง", guide: "close" },
  eye_up: { key: "eye_up", label: "ใต้ตา มองบน", hint: "มองขึ้นด้านบน เห็นร่องใต้ตาชัด", guide: "close" },
  eye_left45: { key: "eye_left45", label: "ใต้ตา เอียงซ้าย", hint: "ซูมช่วงตา หันซ้าย 45°", guide: "close" },
  eye_right45: { key: "eye_right45", label: "ใต้ตา เอียงขวา", hint: "ซูมช่วงตา หันขวา 45°", guide: "close" },
  lips_front: { key: "lips_front", label: "ปาก ตรง", hint: "ซูมจมูก-คาง ปากปิดสบาย", guide: "close" },
  lips_smile: { key: "lips_smile", label: "ปาก ยิ้ม", hint: "ยิ้มเห็นฟัน", guide: "close" },
  lips_left90: { key: "lips_left90", label: "ปาก ด้านซ้าย", hint: "ด้านข้างซ้าย ซูมปาก-คาง", guide: "profile" },
  lips_right90: { key: "lips_right90", label: "ปาก ด้านขวา", hint: "ด้านข้างขวา ซูมปาก-คาง", guide: "profile" },
};

export const PROTOCOLS: Record<string, { label: string; angles: Angle[] }> = {
  face5: { label: "ใบหน้า 5 มุม (มาตรฐาน)", angles: [A.front, A.left45, A.right45, A.left90, A.right90] },
  eyes: { label: "ใต้ตา (ฟิลเลอร์ใต้ตา)", angles: [A.front, A.eye_front, A.eye_up, A.eye_left45, A.eye_right45] },
  lips: { label: "ปาก / คาง", angles: [A.front, A.lips_front, A.lips_smile, A.lips_left90, A.lips_right90] },
  jaw: { label: "กราม / คอ (ยกกระชับ)", angles: [A.front, A.left45, A.right45, A.left90, A.right90, A.chinup] },
};

export const KINDS: Record<string, string> = { before: "ก่อนทำ", after: "หลังทำทันที", followup: "ติดตามผล" };
export const ALL_ANGLES = [...Object.keys(A), "other", "care"];
export const angleLabel = (k: string) => A[k]?.label ?? (k === "care" ? "รูปจากลูกค้า" : k);
/** follow-up photo is due this many days after a treatment */
export const FOLLOWUP_DAYS = [14, 30, 90];

const dayRange = (now: Date) => {
  const d = todayBkk(now);
  return [bkk(d, "00:00").toISOString(), bkk(addDays(d, 1), "00:00").toISOString()];
};

/** What the studio should open with: after a treatment today → after; on a visit today → before; returning client → follow-up. */
export async function suggestKind(clientId: number, now = new Date()) {
  const [from, to] = dayRange(now);
  const [tx, before, appt, past] = await Promise.all([
    one("select id from treatments where client_id = $1 and done_at >= $2 and done_at < $3 limit 1", [clientId, from, to]),
    one("select id from photo_sessions where client_id = $1 and kind = 'before' and created_at >= $2 and created_at < $3 limit 1", [clientId, from, to]),
    one("select id from appointments where client_id = $1 and start_at >= $2 and start_at < $3 and status not in ('cancelled','no_show') limit 1", [clientId, from, to]),
    one("select id from treatments where client_id = $1 and done_at < $2 limit 1", [clientId, from]),
  ]);
  if (tx) return "after";
  if (appt) return before ? "after" : "before";
  return past ? "followup" : "before";
}

/** Opens a session and links it to today's appointment, the latest consult and (after/follow-up) the latest treatment. */
export async function startSession(o: { clientId: number; kind: string; protocol: string; staffId: number | null; note?: string; now?: Date }) {
  const kind = KINDS[o.kind] ? o.kind : "before";
  const protocol = PROTOCOLS[o.protocol] ? o.protocol : "face5";
  const [from, to] = dayRange(o.now ?? new Date());
  const [appt, consult, tx] = await Promise.all([
    one("select id from appointments where client_id = $1 and start_at >= $2 and start_at < $3 and status not in ('cancelled','no_show') order by start_at limit 1", [o.clientId, from, to]),
    one("select id from consults where client_id = $1 order by id desc limit 1", [o.clientId]),
    kind === "before" ? Promise.resolve(null) : one("select id from treatments where client_id = $1 order by done_at desc limit 1", [o.clientId]),
  ]);
  const row = await one(`insert into photo_sessions(client_id, appointment_id, consult_id, treatment_id, kind, protocol, note, created_by)
    values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
    [o.clientId, appt?.id ?? null, consult?.id ?? null, tx?.id ?? null, kind, protocol, (o.note || "").slice(0, 500) || null, o.staffId]);
  return Number(row!.id);
}

/**
 * Ghost overlay source for each angle: the photo of that angle from the most recent earlier "before"
 * session (so every after/follow-up lines up with the same baseline), else the latest earlier photo of that angle.
 */
export async function referencePhotos(clientId: number, sessionId: number) {
  const rows = await q(`
    select distinct on (p.angle) p.angle, p.id, p.created_at, s.kind
    from photos p left join photo_sessions s on s.id = p.session_id
    where p.client_id = $1 and p.angle not in ('care','other') and coalesce(p.session_id, 0) <> $2
      and p.created_at < (select created_at from photo_sessions where id = $2)
    order by p.angle, (s.kind = 'before') desc nulls last, p.created_at desc`, [clientId, sessionId]);
  const out: Record<string, { id: number; at: string; kind: string | null }> = {};
  for (const r of rows) out[r.angle] = { id: Number(r.id), at: new Date(r.created_at).toISOString(), kind: r.kind ?? null };
  return out;
}

export type PhotoSession = {
  id: number; client_id: number; kind: string; protocol: string; note: string | null; created_at: string; completed_at: string | null;
  shots: Record<string, number>; expected: number; taken: number;
};

/** Sessions for a client, newest first, with the photo id of each angle. */
export async function sessionsFor(clientId: number, limit = 20): Promise<PhotoSession[]> {
  const ss = await q("select * from photo_sessions where client_id = $1 order by created_at desc limit $2", [clientId, limit]);
  if (!ss.length) return [];
  const ps = await q("select id, session_id, angle from photos where session_id = any($1::bigint[]) order by id", [ss.map((s) => s.id)]);
  return ss.map((s) => {
    const shots: Record<string, number> = {};
    for (const p of ps) if (Number(p.session_id) === Number(s.id)) shots[p.angle] = Number(p.id);
    const expected = PROTOCOLS[s.protocol]?.angles.length ?? 0;
    return { ...(s as Omit<PhotoSession, "id" | "shots" | "expected" | "taken">), id: Number(s.id), shots, expected, taken: PROTOCOLS[s.protocol]?.angles.filter((a) => shots[a.key]).length ?? 0 };
  });
}

/** angle -> photo id for one session */
export async function shotsOf(sessionId: number) {
  const out: Record<string, number> = {};
  for (const p of await q("select id, angle from photos where session_id = $1 order by id", [sessionId])) out[p.angle] = Number(p.id);
  return out;
}

/** Stores one shot. A retake inside an open session replaces the earlier shot of that angle. */
export async function saveShot(o: { sessionId: number; angle: string; mime: string; data: Buffer; width?: number; height?: number; meta?: unknown; staffId: number | null }) {
  const s = await one("select id, client_id, consult_id, completed_at from photo_sessions where id = $1", [o.sessionId]);
  if (!s) throw new Error("session_not_found");
  if (s.completed_at) throw new Error("session_closed");
  await q("delete from photos where session_id = $1 and angle = $2", [o.sessionId, o.angle]);
  const row = await one(`insert into photos(client_id, consult_id, session_id, angle, mime, data, width, height, meta, created_by)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id`,
    [s.client_id, s.consult_id, o.sessionId, o.angle, o.mime, o.data, o.width || null, o.height || null, o.meta ? JSON.stringify(o.meta) : null, o.staffId]);
  return { id: Number(row!.id), clientId: Number(s.client_id) };
}

/** Treatments that have reached D14 / D30 / D90 and have no follow-up session since that point. */
export async function followupsDue(now = new Date()) {
  const rows = await q(`
    select t.id, t.client_id, t.name, t.done_at, c.name as client_name, c.display_name, c.phone,
      (select b.protocol from photo_sessions b where b.client_id = t.client_id and b.kind = 'before' and b.created_at <= t.done_at order by b.created_at desc limit 1) as protocol
    from treatments t join clients c on c.id = t.client_id
    where t.done_at < $1 and t.done_at > $2
      and exists (select 1 from photo_sessions b where b.client_id = t.client_id and b.kind = 'before')
    order by t.done_at`, [new Date(now.getTime() - FOLLOWUP_DAYS[0] * 864e5).toISOString(), new Date(now.getTime() - (FOLLOWUP_DAYS.at(-1)! + 14) * 864e5).toISOString()]);
  const out: (Record<string, any> & { days: number; step: number })[] = [];
  for (const t of rows) {
    const days = Math.floor((now.getTime() - new Date(t.done_at).getTime()) / 864e5);
    const step = [...FOLLOWUP_DAYS].reverse().find((d) => days >= d)!;
    const since = new Date(new Date(t.done_at).getTime() + step * 864e5 - 3 * 864e5).toISOString();
    const done = await one("select id from photo_sessions where client_id = $1 and kind = 'followup' and created_at >= $2 limit 1", [t.client_id, since]);
    if (!done) out.push({ ...t, days, step });
  }
  // one row per client: the most recent treatment that is due
  const seen = new Set<number>();
  return out.reverse().filter((t) => !seen.has(Number(t.client_id)) && seen.add(Number(t.client_id)));
}

export type Pair = { before: PhotoSession; after: PhotoSession; angles: string[] };

/** Angles both sessions have, in protocol order (the after session's protocol first). */
export function sharedAngles(a: PhotoSession, b: PhotoSession) {
  const order = [...new Set([...(PROTOCOLS[b.protocol]?.angles ?? []), ...(PROTOCOLS[a.protocol]?.angles ?? [])].map((x) => x.key))];
  return order.filter((k) => a.shots[k] && b.shots[k]);
}

/**
 * The "before" that an after / follow-up session should be compared with: the latest before session
 * taken ahead of the treatment it belongs to (or ahead of the session itself) that shares at least one angle.
 */
export function baselineFor(s: PhotoSession, all: PhotoSession[], txDone?: string | null) {
  const cutoff = new Date(txDone && new Date(txDone) < new Date(s.created_at) ? txDone : s.created_at).getTime();
  return all
    .filter((b) => b.kind === "before" && b.id !== s.id && new Date(b.created_at).getTime() <= cutoff && sharedAngles(b, s).length > 0)
    .sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())[0] ?? null;
}

/** Automatic before & after pairs for a client, newest after first. */
export async function autoPairs(clientId: number): Promise<Pair[]> {
  const all = await sessionsFor(clientId, 100);
  const tx = await q("select s.id, t.done_at from photo_sessions s join treatments t on t.id = s.treatment_id where s.client_id = $1", [clientId]);
  const done = new Map(tx.map((r) => [Number(r.id), new Date(r.done_at).toISOString()]));
  const out: Pair[] = [];
  for (const s of all) {
    if (s.kind === "before" || s.taken === 0) continue;
    const b = baselineFor(s, all, done.get(s.id));
    if (b) out.push({ before: b, after: s, angles: sharedAngles(b, s) });
  }
  return out;
}

/** Latest pair per client across the clinic (for the Photo studio overview). */
export async function recentPairs(since: string, limit = 24) {
  const ids = await q(`select distinct client_id from photo_sessions where kind <> 'before' and created_at >= $1 limit $2`, [since, limit]);
  const out: (Pair & { clientId: number })[] = [];
  for (const r of ids) {
    const p = (await autoPairs(Number(r.client_id)))[0];
    if (p) out.push({ ...p, clientId: Number(r.client_id) });
  }
  return out.sort((a, b) => new Date(b.after.created_at).getTime() - new Date(a.after.created_at).getTime());
}

/** Picks the protocol from what the client came for (appointment note, lead interest, plan items). */
export function suggestProtocol(text: string | null | undefined) {
  const t = (text || "").toLowerCase();
  if (/ใต้ตา|ร่องตา|tear|eye/.test(t)) return "eyes";
  if (/ปาก|คาง|lip|chin/.test(t)) return "lips";
  if (/ยก|กราม|คอ|doublo|hifu|ulthera|lift|jaw|neck/.test(t)) return "jaw";
  return "face5";
}

export type QueueItem = {
  appointmentId: number; clientId: number; name: string; phone: string | null; time: string; status: string; note: string | null;
  consent: boolean; kind: string; protocol: string; openSession: number | null; shot: string[];
};

/** Today's visits as a photo queue: who still needs before / after shots, with the suggested next step. */
export async function studioQueue(now = new Date()): Promise<QueueItem[]> {
  const [from, to] = dayRange(now);
  const rows = await q(`
    select a.id, a.client_id, a.start_at, a.status, a.note, c.name, c.display_name, c.phone,
      (select granted from consents k where k.client_id = c.id and k.type = 'data' order by k.created_at desc, k.id desc limit 1) as consent,
      (select interest from leads l where l.client_id = c.id order by l.id desc limit 1) as interest,
      (select string_agg(i->>'name', ' ') from plans p, jsonb_array_elements(p.items) i where p.client_id = c.id and p.status <> 'done') as plan_items,
      (select id from photo_sessions s where s.client_id = c.id and s.completed_at is null and s.created_at >= $1 order by s.id desc limit 1) as open_session,
      (select array_agg(distinct s.kind) from photo_sessions s where s.client_id = c.id and s.created_at >= $1 and s.created_at < $2
         and exists (select 1 from photos p where p.session_id = s.id)) as shot
    from appointments a join clients c on c.id = a.client_id
    where a.start_at >= $1 and a.start_at < $2 and a.status not in ('cancelled','no_show')
    order by (a.status in ('arrived','in_consult')) desc, a.start_at`, [from, to]);
  const out: QueueItem[] = [];
  for (const r of rows) {
    const shot: string[] = r.shot || [];
    out.push({
      appointmentId: Number(r.id), clientId: Number(r.client_id), name: r.name || r.display_name || `#${r.client_id}`, phone: r.phone,
      time: new Date(r.start_at).toISOString(), status: r.status, note: r.note, consent: r.consent === true,
      kind: shot.includes("before") ? "after" : await suggestKind(Number(r.client_id), now),
      protocol: suggestProtocol([r.note, r.interest, r.plan_items].join(" ")),
      openSession: r.open_session ? Number(r.open_session) : null, shot,
    });
  }
  return out;
}
