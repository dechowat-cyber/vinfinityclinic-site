import crypto from "node:crypto";

const API = "https://api.line.me/v2/bot";
const env = (k: string) => (process.env[k] || "").trim();

export function verifySignature(body: string, signature: string | null, secret = env("LINE_CHANNEL_SECRET")) {
  if (!signature || !secret) return false;
  const mac = crypto.createHmac("sha256", secret).update(body).digest("base64");
  const a = Buffer.from(mac), b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

let cached: { token: string; until: number } | null = null;
/** Long-lived token from env, or a stateless token issued with channel ID + secret (no console access needed). */
export async function accessToken(): Promise<string> {
  if (env("LINE_CHANNEL_ACCESS_TOKEN")) return env("LINE_CHANNEL_ACCESS_TOKEN");
  if (!env("LINE_CHANNEL_ID") || !env("LINE_CHANNEL_SECRET")) return "";
  if (cached && cached.until > Date.now()) return cached.token;
  const res = await fetch("https://api.line.me/oauth2/v3/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: env("LINE_CHANNEL_ID"), client_secret: env("LINE_CHANNEL_SECRET") }),
  });
  if (!res.ok) throw new Error(`line_token_${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j: any = await res.json();
  cached = { token: j.access_token, until: Date.now() + (Number(j.expires_in || 900) - 60) * 1000 };
  return cached.token;
}

async function call(path: string, init: RequestInit & { json?: unknown } = {}) {
  const token = await accessToken();
  if (!token) { console.warn("[line] no access token; skipped", path); return null; }
  const res = await fetch(path.startsWith("http") ? path : API + path, {
    method: init.method ?? (init.json ? "POST" : "GET"),
    headers: { Authorization: `Bearer ${token}`, ...(init.json ? { "Content-Type": "application/json" } : {}), ...(init.headers || {}) },
    body: init.json ? JSON.stringify(init.json) : (init.body as any),
    signal: init.signal,
  });
  // 409 with a retry key = LINE already accepted this exact request earlier; treat as sent.
  if (res.status === 409 && (init.headers as Record<string, string> | undefined)?.["X-Line-Retry-Key"]) return null;
  if (!res.ok) {
    const text = await res.text();
    console.error("[line] error", path, res.status, text);
    throw new Error(`line_api_${res.status}: ${text.slice(0, 300)}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("json") ? res.json() : null;
}

export type Msg = Record<string, any>;

/** Free: replying with a reply token does not count against the monthly message quota. */
export const reply = (replyToken: string, messages: Msg[]) => call("/message/reply", { json: { replyToken, messages: messages.slice(0, 5) } });
/** Counts against the LINE OA plan's monthly push quota. */
/** LINE requires X-Line-Retry-Key to be a UUID; derive a stable one from any idempotency key. */
export function retryUuid(key: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return key;
  const h = crypto.createHash("sha256").update(key).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
export const push = (to: string, messages: Msg[], retryKey?: string) =>
  call("/message/push", { json: { to, messages: messages.slice(0, 5) }, headers: retryKey ? { "X-Line-Retry-Key": retryUuid(retryKey) } : {} });

/** Every friend of the OA. Counts one message per friend against the monthly quota. */
export const broadcast = (messages: Msg[], retryKey: string) =>
  call("/message/broadcast", { json: { messages: messages.slice(0, 5) }, headers: { "X-Line-Retry-Key": retryUuid(retryKey) } });

export type Narrow = { max?: number; gender?: "female" | "male"; ageFrom?: number; ageTo?: number };
const AGES = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
/** LINE's own audience filter (gender / age are LINE's estimates) and a hard cap on recipients. */
export function narrowBody(messages: Msg[], n: Narrow) {
  const and: Record<string, unknown>[] = [];
  if (n.gender) and.push({ type: "gender", oneOf: [n.gender] });
  const gte = AGES.includes(Number(n.ageFrom)) ? `age_${n.ageFrom}` : undefined, lt = AGES.includes(Number(n.ageTo)) ? `age_${n.ageTo}` : undefined;
  if (gte || lt) and.push({ type: "age", ...(gte ? { gte } : {}), ...(lt ? { lt } : {}) });
  return { messages: messages.slice(0, 5), ...(and.length ? { filter: { demographic: and.length === 1 ? and[0] : { type: "operator", and } } } : {}),
    ...(n.max ? { limit: { max: Math.max(1, Math.round(n.max)), upToRemainingQuota: true } } : {}) };
}
/** Narrowcast is asynchronous: LINE answers 202 with a request id; progress is read separately. */
export async function narrowcast(messages: Msg[], n: Narrow, retryKey: string): Promise<string | null> {
  const token = await accessToken();
  if (!token) { console.warn("[line] no access token; skipped narrowcast"); return null; }
  const res = await fetch(API + "/message/narrowcast", { method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Line-Retry-Key": retryUuid(retryKey) }, body: JSON.stringify(narrowBody(messages, n)) });
  if (!res.ok && res.status !== 409) { const t = await res.text(); console.error("[line] narrowcast", res.status, t); throw new Error(`line_api_${res.status}: ${t.slice(0, 200)}`); }
  return res.headers.get("x-line-request-id");
}
export async function narrowProgress(requestId: string): Promise<{ phase?: string; successCount?: number; failedDescription?: string; targetCount?: number } | null> {
  try { return (await call(`/message/progress/narrowcast?requestId=${encodeURIComponent(requestId)}`, { signal: AbortSignal.timeout(3000) })) as any; } catch { return null; }
}

/** Monthly quota and what is used so far; plus how many friends a broadcast would reach (LINE's own estimate, from 2 days ago). */
export async function reachInfo(now = new Date()): Promise<{ limit: number | null; used: number | null; reach: number | null; followers: number | null }> {
  const d = new Date(now.getTime() + 7 * 3600e3 - 2 * 864e5).toISOString().slice(0, 10).replace(/-/g, "");
  const safe = async (path: string) => { try { return (await call(path, { signal: AbortSignal.timeout(3000) })) as any; } catch { return null; } };
  const [q, c, f] = await Promise.all([safe("/message/quota"), safe("/message/quota/consumption"), safe(`/insight/followers?date=${d}`)]);
  const n = (v: unknown) => (typeof v === "number" ? v : null);
  return { limit: q?.type === "limited" ? n(q.value) : null, used: n(c?.totalUsage), reach: f?.status === "ready" ? n(f.targetedReaches) : null, followers: f?.status === "ready" ? n(f.followers) : null };
}

export async function profile(userId: string): Promise<{ displayName?: string; pictureUrl?: string; language?: string } | null> {
  try { return (await call(`/profile/${userId}`)) as any; } catch { return null; }
}

/** Verifies a LIFF / LINE Login ID token and returns the LINE user id (sub). */
export async function verifyIdToken(idToken: string): Promise<{ sub: string; name?: string; picture?: string } | null> {
  const clientId = env("LINE_LOGIN_CHANNEL_ID");
  if (!idToken || !clientId) return null;
  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
  });
  if (!res.ok) { console.error("[line] verify id_token", res.status, (await res.text()).slice(0, 200)); return null; }
  const j: any = await res.json();
  return j?.sub ? { sub: j.sub, name: j.name, picture: j.picture } : null;
}

/** Downloads an image/video a user sent (needed for aftercare photos). */
export async function content(messageId: string): Promise<{ data: Buffer; mime: string }> {
  const token = await accessToken();
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`content_${res.status}`);
  return { data: Buffer.from(await res.arrayBuffer()), mime: res.headers.get("content-type") || "image/jpeg" };
}

// ---- rich menu (run once from the staff settings page) ----
export async function installRichMenu(menu: Msg, img: Buffer, mime = "image/jpeg", replaceId?: string | null, unlinkUsers?: string[]) {
  const created: any = await call("/richmenu", { json: menu });
  const id = created.richMenuId as string;
  const token = await accessToken();
  const up = await fetch(`https://api-data.line.me/v2/bot/richmenu/${id}/content`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": mime }, body: new Uint8Array(img),
  });
  if (!up.ok) throw new Error(`richmenu_upload_${up.status}: ${await up.text()}`);
  await call(`/user/all/richmenu/${id}`, { method: "POST" });
  // a per-user menu (e.g. linked by a previous agency tool) would hide the default: clear those links
  for (let i = 0; i < (unlinkUsers?.length ?? 0); i += 500)
    await call("/richmenu/bulk/unlink", { json: { userIds: unlinkUsers!.slice(i, i + 500) } }).catch((e) => console.warn("[richmenu] unlink", e));
  // the previous menu is no longer the default: remove it so only one stays on the account
  if (replaceId && replaceId !== id) await call(`/richmenu/${replaceId}`, { method: "DELETE" }).catch(() => {});
  return id;
}

export const liffUrl = (path = "", params: Record<string, string> = {}) => {
  const id = env("NEXT_PUBLIC_LIFF_ID");
  const qs = new URLSearchParams(params).toString();
  return id ? `https://liff.line.me/${id}${path}${qs ? `?${qs}` : ""}` : `${env("APP_URL")}/liff${path}${qs ? `?${qs}` : ""}`;
};
