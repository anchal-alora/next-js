/**
 * Form validation utilities
 * Provides consistent validation error messages across all forms
 */

/**
 * Validates email format
 * @returns Error message string or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') {
    return 'Email is required.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Enter a valid email address.';
  }

  return null;
}

/**
 * Validates required field
 * @returns Error message string or null if valid
 */
export function required(value: string, label: string): string | null {
  if (!value || value.trim() === '') {
    return `${label} is required.`;
  }
  return null;
}

