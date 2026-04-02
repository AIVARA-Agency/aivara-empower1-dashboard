import { NextResponse } from "next/server";

export const runtime = "edge";

const UPSTREAM = "https://n8n.srv1312686.hstgr.cloud/webhook/dashboard/";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
