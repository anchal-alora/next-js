import { NextResponse } from "next/server";
import { searchSite } from "@/lib/server/search";
import type { SearchMode, SearchScope } from "@/lib/search/types";

const VALID_SCOPES: SearchScope[] = ["all", "insights", "newsroom"];
const VALID_MODES: SearchMode[] = ["suggest", "prefix", "full"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const scopeParam = (searchParams.get("scope") ?? "all").toLowerCase();
  const scope = (VALID_SCOPES.includes(scopeParam as SearchScope) ? scopeParam : "all") as SearchScope;

  const query = searchParams.get("q") ?? "";

  const limitParam = Number.parseInt(searchParams.get("limit") ?? "8", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 8;

  const offsetParam = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const offset = Number.isFinite(offsetParam) ? Math.max(0, offsetParam) : 0;

  const modeParam = (searchParams.get("mode") ?? "").toLowerCase();
  const mode = VALID_MODES.includes(modeParam as SearchMode) ? (modeParam as SearchMode) : undefined;

  const data = await searchSite({ scope, query, limit, offset, mode });
  return NextResponse.json(data, {
    headers: {
      // Live search: keep responses cacheable but short-lived.
      "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
    },
  });
}

