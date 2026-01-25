"use client";

/**
 * Global error boundary for errors in root layout.
 * This catches errors that the regular error.tsx cannot handle.
 * Must include its own <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-8">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Critical Error
          </h1>
          <p className="text-gray-600 mb-8">
            A critical error has occurred. Please try refreshing the page.
          </p>

          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>

          <p className="mt-8 text-sm text-gray-500">
            If this problem persists, please contact{" "}
            <a
              href="mailto:contact@aloraadvisory.com"
              className="text-purple-600 hover:underline"
            >
              support
            </a>
            .
          </p>
        </div>
      </body>
    </html>
  );
}
