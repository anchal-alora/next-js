/**
 * Google Tag Manager utility functions
 * Provides functions to push events to dataLayer for tracking
 */

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

/**
 * Initialize dataLayer if it doesn't exist
 */
function ensureDataLayer(): void {
  if (typeof window !== "undefined" && !window.dataLayer) {
    window.dataLayer = [];
  }
}

/**
 * Push data to GTM dataLayer
 * @param data - Data object to push to dataLayer
 */
export function pushToDataLayer(data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  ensureDataLayer();
  window.dataLayer.push(data);
}

/**
 * Track a page view
 * @param path - Page path (e.g., '/services')
 * @param title - Optional page title
 */
export function trackPageView(path: string, title?: string): void {
  const pageLocation = typeof window !== "undefined"
    ? window.location.href
    : "";

  pushToDataLayer({
    event: "page_view",
    page_path: path,
    page_title: title || (typeof document !== "undefined" ? document.title : ""),
    page_location: pageLocation,
  });
}

/**
 * Track a custom event
 * @param eventName - Name of the event
 * @param eventData - Additional event data
 */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
  pushToDataLayer({
    event: eventName,
    ...eventData,
  });
}

/**
 * Track a form submission
 * @param formName - Name of the form (e.g., 'contact', 'newsletter')
 * @param formData - Optional form data (sanitized, no PII)
 */
export function trackFormSubmit(formName: string, formData?: Record<string, unknown>): void {
  const pagePath = typeof window !== "undefined"
    ? window.location.pathname
    : "";
  const pageUrl = typeof window !== "undefined"
    ? window.location.href
    : "";

  // Extract form type from form name (e.g., 'downloadable-report' -> 'downloadable-report')
  const formType = formName;

  pushToDataLayer({
    event: "form_submit",
    form_name: formName,
    form_type: formType,
    page_path: pagePath,
    page_url: pageUrl,
    ...formData,
  });
}

/**
 * Track a button or link click
 * @param elementName - Name/identifier of the element
 * @param elementType - Type of element ('button', 'link', or 'other')
 * @param additionalData - Additional tracking data
 */
export function trackClick(
  elementName: string,
  elementType: "button" | "link" | "other" = "other",
  additionalData?: Record<string, unknown>
): void {
  const pagePath = typeof window !== "undefined"
    ? window.location.pathname
    : "";

  pushToDataLayer({
    event: "click",
    element_name: elementName,
    element_type: elementType,
    page_path: pagePath,
    ...additionalData,
  });
}
