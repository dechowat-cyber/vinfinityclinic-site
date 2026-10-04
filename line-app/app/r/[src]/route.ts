import { SOURCES, deepLink } from "@/lib/source";
import { recordVisit, VISIT_PARAMS, type VisitParams } from "@/lib/attribution";

export const dynamic = "force-dynamic";

/**
 * Short source links for print, bios and QR codes: /r/fb, /r/ig, /r/qr_store, /r/ref_VXXXXX.
 * /r/web?v=CODE&utm_…&gclid=… comes from the website: the visit is stored and the code rides in the LINE message.
 */
export async function GET(req: Request, { params }: { params: Promise<{ src: string }> }) {
  const { src } = await params;
  const ref = /^ref_([A-Z0-9]{5,8})$/i.exec(src);
  if (ref) return Response.redirect(deepLink("ref", ref[1].toUpperCase()), 302);
  const key = SOURCES[src] ? src : "web";
  const sp = new URL(req.url).searchParams;
  if (key === "web" && sp.size) {
    const v: VisitParams = {};
    for (const k of VISIT_PARAMS) { const x = sp.get(k); if (x) v[k] = x; }
    if (!v.referrer) v.referrer = req.headers.get("referer") || undefined;
    try {
      const { code } = await recordVisit(sp.get("v"), v);
      return Response.redirect(deepLink("web", undefined, code), 302);
    } catch (e) {
      console.error("[r/web] visit", e); // never block the client from reaching LINE
    }
  }
  return Response.redirect(deepLink(key), 302);
}
