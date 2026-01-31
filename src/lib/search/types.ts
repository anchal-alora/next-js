export type SearchScope = "all" | "insights" | "newsroom";

export type SearchResultType =
  | "insight"
  | "newsroom"
  | "page"
  | "service"
  | "industry"
  | "contentType";

export type SearchMode = "suggest" | "prefix" | "full";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  href: string;
  snippet?: string;
  industry?: string;
  contentType?: string;
  date?: string;
  tags?: string[];
};

export type SearchResponse = {
  scope: SearchScope;
  query: string;
  mode: SearchMode;
  results: SearchResult[];
};
