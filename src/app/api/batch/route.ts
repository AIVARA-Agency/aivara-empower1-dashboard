import { NextResponse } from "next/server";

const UPSTREAM = "https://n8n.srv1312686.hstgr.cloud/webhook/leads/batch/analysis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadSource = searchParams.get("lead_source");

  const url = leadSource ? `${UPSTREAM}?lead_source=${encodeURIComponent(leadSource)}` : UPSTREAM;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}
