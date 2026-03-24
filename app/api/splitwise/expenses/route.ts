import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("X-Splitwise-Key");
  if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 401 });

  const limit = req.nextUrl.searchParams.get("limit") || "50";
  const offset = req.nextUrl.searchParams.get("offset") || "0";

  const res = await fetch(
    `https://secure.splitwise.com/api/v3.0/get_expenses?limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
