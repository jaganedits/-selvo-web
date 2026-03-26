import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("X-Splitwise-Key");
  if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 401 });

  try {
    const res = await fetch("https://secure.splitwise.com/api/v3.0/get_friends", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Splitwise API error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to reach Splitwise" }, { status: 502 });
  }
}
