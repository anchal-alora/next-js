import React from 'react';

interface FieldErrorProps {
  error?: string | null;
}

/**
 * Inline error component for individual form fields
 * Only renders when error exists
 */
export function FieldError({ error }: FieldErrorProps) {
  if (!error) {
    return null;
  }

  return <p className="text-destructive text-sm mt-1">{error}</p>;
}

