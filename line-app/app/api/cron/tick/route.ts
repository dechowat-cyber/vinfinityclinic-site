import { NextRequest, NextResponse } from "next/server";
import { authorized } from "@/lib/cron";
import { runTick } from "@/lib/tick";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await runTick());
}
export const POST = GET;
