import { NextRequest, NextResponse } from "next/server";
import { authorized, eveningRun } from "@/lib/cron";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await eveningRun());
}
