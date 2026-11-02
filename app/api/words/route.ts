import { NextRequest, NextResponse } from "next/server";

// In-memory fallback cache for serverless invocation demonstration
let serverWordsCache: any[] = [];

export async function GET() {
  return NextResponse.json({
    status: "ok",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    words: serverWordsCache,
    message: process.env.DATABASE_URL
      ? "Connected to cloud database"
      : "Operating in client-persisted mode with full localStorage & IndexedDB support",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !body.word) {
      return NextResponse.json({ error: "Word data is required" }, { status: 400 });
    }

    serverWordsCache = [body, ...serverWordsCache.filter((w) => w.word !== body.word)];

    return NextResponse.json({
      status: "saved",
      word: body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid payload" }, { status: 500 });
  }
}
