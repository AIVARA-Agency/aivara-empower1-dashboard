import { NextResponse } from "next/server";

const UPSTREAM = "https://n8n.srv1312686.hstgr.cloud/webhook/dashboard/";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, { cache: "no-store" });
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
