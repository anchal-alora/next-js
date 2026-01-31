import type { SearchResult, SearchScope } from "./types";
import { industriesData } from "@/lib/industriesData";
import { servicesData } from "@/lib/servicesData";

function sectionSuggestion(params: {
  type: "service" | "industry";
  prefix: "services" | "industries";
  id: string;
  title: string;
}): SearchResult {
  return {
    id: `${params.prefix}:${params.id}`,
    type: params.type,
    title: params.title,
    href: `/${params.prefix}#${params.id}`,
  };
}

const commonPages: SearchResult[] = [
  { id: "page:/insights/explore", type: "page", title: "Explore Insights", href: "/insights/explore" },
  { id: "page:/newsroom", type: "page", title: "Newsroom", href: "/newsroom" },
  { id: "page:/services", type: "page", title: "Services", href: "/services" },
  { id: "page:/industries", type: "page", title: "Industries", href: "/industries" },
  { id: "page:/contact", type: "page", title: "Contact", href: "/contact" },
];

export function getSearchSuggestions(scope: SearchScope): SearchResult[] {
  if (scope === "insights") {
    return [
      { id: "page:/insights", type: "page", title: "Insights", href: "/insights" },
      { id: "page:/insights/explore", type: "page", title: "Explore All Insights", href: "/insights/explore" },
      { id: "page:/insights/explore:type:Case Study", type: "page", title: "Case Studies", href: "/insights/explore?type=Case%20Study" },
      { id: "page:/insights/explore:type:Market Overview", type: "page", title: "Market Reports", href: "/insights/explore?type=Market%20Overview" },
    ];
  }

  if (scope === "newsroom") {
    return [];
  }

  return [
    ...commonPages,
    sectionSuggestion({
      type: "service",
      prefix: "services",
      id: servicesData[0]?.id ?? "market-research",
      title: servicesData[0]?.shortTitle ?? servicesData[0]?.title ?? "Market Research",
    }),
    sectionSuggestion({
      type: "industry",
      prefix: "industries",
      id: industriesData[0]?.id ?? "technology",
      title: industriesData[0]?.shortTitle ?? industriesData[0]?.title ?? "Technology",
    }),
  ].filter(Boolean);
}
