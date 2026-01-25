import { SITE_URL, toCanonical } from "@/lib/seo";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Alora Advisory",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo/alora-logo.webp`,
    sameAs: ["https://www.linkedin.com/company/alora-advisory"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Alora Advisory",
    url: SITE_URL,
  };
}

export function webPageSchema(pathname: string, title: string, description?: string) {
  const canonical = toCanonical(pathname);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(params: {
  pathname: string;
  headline: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  authorName?: string;
}) {
  const canonical = toCanonical(params.pathname);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: canonical,
    headline: params.headline,
    description: params.description,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    image: params.image ? [params.image] : undefined,
    author: params.authorName
      ? {
          "@type": "Organization",
          name: params.authorName,
        }
      : {
          "@type": "Organization",
          name: "Alora Advisory",
        },
    publisher: {
      "@type": "Organization",
      name: "Alora Advisory",
      url: SITE_URL,
    },
  };
}
