/**
 * Google Tag Manager Configuration
 *
 * GTM Container ID and Google Analytics Measurement ID
 * Note: Google Analytics is configured through GTM dashboard, not directly in code
 */

// GTM Container ID
export const GTM_CONTAINER_ID =
  process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || "GTM-TZCZP6G8";

// Google Analytics Measurement ID (for reference/documentation)
// This will be configured in GTM dashboard as a GA4 Configuration tag
export const GA_MEASUREMENT_ID = "G-8MER4PMSVV";

/**
 * Type definitions for common GTM event structures
 */
export interface PageViewEvent {
  event: "page_view";
  page_path: string;
  page_title?: string;
  page_location?: string;
}

export interface FormSubmitEvent {
  event: "form_submit";
  form_name: string;
  form_type: string;
  page_path: string;
  page_url?: string;
}

export interface ClickEvent {
  event: "click";
  element_name: string;
  element_type: "button" | "link" | "other";
  click_url?: string;
  page_path?: string;
}

export interface CustomEvent {
  event: string;
  [key: string]: unknown;
}
