import { currentStaff } from "@/lib/session";
import { CASHIER_ROLES } from "@/lib/payments";
import { one } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Slip images: cashiers and the manager only. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentStaff();
  if (!me || !CASHIER_ROLES.includes(me.role)) return new Response("forbidden", { status: 403 });
  const s = await one("select mime, data from slips where id = $1", [Number((await params).id)]);
  if (!s) return new Response("not found", { status: 404 });
  const d = s.data;
  const data: Buffer = typeof d === "string" ? Buffer.from(d.replace(/^\\x/, ""), "hex") : Buffer.from(d);
  return new Response(new Uint8Array(data), { headers: { "Content-Type": s.mime, "Cache-Control": "private, no-store" } });
}
