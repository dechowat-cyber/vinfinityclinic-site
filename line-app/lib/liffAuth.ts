import { verifyIdToken } from "./line";
import { upsertClientByLine } from "./crm";

/**
 * Resolves the client behind a LIFF request. In local development (no LINE Login channel
 * configured) a fake user id can be passed with ?dev_user= so the pages can be tested.
 */
export async function clientFromRequest(req: Request, body?: any) {
  const auth = req.headers.get("authorization") || "";
  const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : body?.idToken;
  let sub: string | null = null, name: string | undefined, picture: string | undefined;
  if (idToken) {
    const v = await verifyIdToken(idToken);
    if (v) ({ sub, name, picture } = v);
  }
  if (!sub && !process.env.LINE_LOGIN_CHANNEL_ID && process.env.VERCEL_ENV !== "production") {
    sub = new URL(req.url).searchParams.get("dev_user") || body?.devUser || null;
  }
  if (!sub) return null;
  return upsertClientByLine(sub, { displayName: name, pictureUrl: picture }, body?.src ?? undefined);
}
