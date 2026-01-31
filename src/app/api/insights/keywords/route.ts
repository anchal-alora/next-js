import { NextResponse } from "next/server";
import { getInsightsKeywordSuggestions } from "@/lib/server/insightsKeywords";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const limitParam = Number.parseInt(searchParams.get("limit") ?? "10", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;

  const suggestions = await getInsightsKeywordSuggestions({ query, limit });
  return NextResponse.json(
    { query: query.trim(), suggestions },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=600",
      },
    },
  );
}

