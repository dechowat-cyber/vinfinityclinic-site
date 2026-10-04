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
  });
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
export const push = (to: string, messages: Msg[], retryKey?: string) =>
  call("/message/push", { json: { to, messages: messages.slice(0, 5) }, headers: retryKey ? { "X-Line-Retry-Key": retryKey } : {} });

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
export async function installRichMenu(menu: Msg, png: Buffer) {
  const created: any = await call("/richmenu", { json: menu });
  const id = created.richMenuId as string;
  const token = await accessToken();
  const up = await fetch(`https://api-data.line.me/v2/bot/richmenu/${id}/content`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/png" }, body: new Uint8Array(png),
  });
  if (!up.ok) throw new Error(`richmenu_upload_${up.status}: ${await up.text()}`);
  await call(`/user/all/richmenu/${id}`, { method: "POST" });
  return id;
}

export const liffUrl = (path = "", params: Record<string, string> = {}) => {
  const id = env("NEXT_PUBLIC_LIFF_ID");
  const qs = new URLSearchParams(params).toString();
  return id ? `https://liff.line.me/${id}${path}${qs ? `?${qs}` : ""}` : `${env("APP_URL")}/liff${path}${qs ? `?${qs}` : ""}`;
};
