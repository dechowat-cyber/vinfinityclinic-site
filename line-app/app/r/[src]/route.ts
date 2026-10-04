import { SOURCES, deepLink } from "@/lib/source";

export const dynamic = "force-dynamic";

/** Short source links for print, bios and QR codes: /r/fb, /r/ig, /r/qr_store, /r/ref_VXXXXX */
export async function GET(_req: Request, { params }: { params: Promise<{ src: string }> }) {
  const { src } = await params;
  const ref = /^ref_([A-Z0-9]{5,8})$/i.exec(src);
  const url = ref ? deepLink("ref", ref[1].toUpperCase()) : deepLink(SOURCES[src] ? src : "web");
  return Response.redirect(url, 302);
}
