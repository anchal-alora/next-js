/**
 * Centralized route constants for the application
 * Use these constants instead of hardcoded paths to ensure consistency
 */

export const CONTACT_ROUTE = "/contact";
export const CONTACT_FORM_LINK = "/contact#contact-form";

/**
 * Builds a contact form link with source tracking parameter
 * Preserves existing query parameters (like subject) while adding source
 * 
 * @param source - Identifier for the button/link that leads to contact form (e.g., "header-button", "homepage-hero")
 * @param existingParams - Optional existing query parameters to preserve (e.g., { subject: "Market Opportunity" })
 * @returns Formatted URL with source parameter and hash anchor
 * 
 * @example
 * getContactFormLink("header-button") // "/contact?source=header-button#contact-form"
 * getContactFormLink("services-market-research", { subject: "Market Opportunity" }) 
 * // "/contact?subject=Market%20Opportunity&source=services-market-research#contact-form"
 */
export function getContactFormLink(
  source: string,
  existingParams?: Record<string, string>
): string {
  const params = new URLSearchParams();
  
  // Add existing params first
  if (existingParams) {
    Object.entries(existingParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
  }
  
  // Add source parameter
  params.append("source", source);
  
  const queryString = params.toString();
  return `${CONTACT_ROUTE}${queryString ? `?${queryString}` : ""}#contact-form`;
}

