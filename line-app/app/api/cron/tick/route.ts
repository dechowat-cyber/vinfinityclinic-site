import { NextRequest, NextResponse } from "next/server";
import { authorized } from "@/lib/cron";
import { runTick } from "@/lib/tick";
import { once } from "@/lib/jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduler entry point. Every step only does work that is already due and is idempotent, so the
 * public caller (GitHub Actions every 5 min) needs no secret; it is throttled to one run per 4 minutes
 * and gets no details back. Calls with the CRON_SECRET bearer (Vercel cron, manual) see the summary.
 */
export async function GET(req: NextRequest) {
  const full = authorized(req);
  if (!full) {
    const bucket = Math.floor(Date.now() / (4 * 60000));
    if (!(await once(`tick:${bucket}`))) return NextResponse.json({ ok: true, skipped: true });
  }
  const out = await runTick();
  return NextResponse.json(full ? out : { ok: true });
}
export const POST = GET;
