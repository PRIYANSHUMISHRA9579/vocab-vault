import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { word: string } }
) {
  const word = params.word;
  if (!word || !word.trim()) {
    return NextResponse.json(
      { error: "Word parameter is required." },
      { status: 400 }
    );
  }

  const cleanWord = word.trim().toLowerCase();

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`,
      {
        next: { revalidate: 86400 }, // Cache on Vercel for 24 hours
      }
    );

    if (res.status === 404) {
      return NextResponse.json(
        { error: `No definition found for "${cleanWord}".` },
        { status: 404 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream dictionary error (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch word meaning." },
      { status: 500 }
    );
  }
}
