/**
 * Form submission utilities (server-first via Next API routes)
 */

import { trackFormSubmit } from "./gtm";

export function getTrackingFields(): Record<string, string> {
  const fields: Record<string, string> = {
    pagePath: typeof window !== "undefined" ? window.location.pathname : "",
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
  };

  if (typeof window !== "undefined") {
    try {
      const sourceData = sessionStorage.getItem("contactFormSource");
      if (sourceData) {
        const parsed = JSON.parse(sourceData);
        if (parsed.source) {
          fields.source = parsed.source;
        }
      }
    } catch {
      // ignore
    }
  }

  return fields;
}

export async function submitForm(formType: string, data: Record<string, string>): Promise<void> {
  trackFormSubmit(formType, {
    form_type: formType,
  });

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formType,
      ...data,
    }),
  });

  if (!response.ok) {
    let responseBody = "";
    try {
      responseBody = await response.text();
    } catch {
      // ignore
    }

    throw new Error(
      `Form submission failed: ${response.status} ${response.statusText}${responseBody ? ` - ${responseBody}` : ""}`,
    );
  }
}

