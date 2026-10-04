export const dynamic = "force-dynamic";

const ORIGINS = ["https://vinfinityclinic.com", "https://www.vinfinityclinic.com"];

/** The website asks this before routing LINE buttons through /r/web, so a blocked or down app never stops a client reaching LINE. */
export async function GET(req: Request) {
  const o = req.headers.get("origin");
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store", ...(o && ORIGINS.includes(o) ? { "Access-Control-Allow-Origin": o, Vary: "Origin" } : {}) } });
}
