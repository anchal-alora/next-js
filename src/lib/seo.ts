export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aloraadvisory.com";

export function toCanonical(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalized, SITE_URL).toString();
}

export function buildOgImagePath(pathname?: string) {
  return pathname ? new URL(pathname, SITE_URL).toString() : undefined;
}
