import { Button } from '@heroui/react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  title?: string;
}

export function ErrorDisplay({
  message,
  onRetry,
  showRetry = true,
  title = "Error Occurred"
}: ErrorDisplayProps) {
  // Don't modify the error message, display it exactly as received
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        {title}
      </div>
      <div className="text-red-700 bg-red-100 rounded p-3 font-mono text-sm">
        {message}
      </div>
      {showRetry && onRetry && (
        <div className="mt-3">
          <Button
            color="primary"
            size="sm"
            onClick={onRetry}
            className="px-4 rounded-full border-none shadow-sm text-white bg-blue-500 hover:bg-blue-600"
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
