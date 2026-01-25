import React from 'react';

interface FormErrorSummaryProps {
  errors: string[];
}

/**
 * Displays error summary at the top of a form
 * Shows when there are validation errors
 */
export function FormErrorSummary({ errors }: FormErrorSummaryProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm mb-4">
      Please fix the highlighted fields.
    </div>
  );
}

