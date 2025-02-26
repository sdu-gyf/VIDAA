import { LoadingSpinner } from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
  spinnerSize?: 'sm' | 'md' | 'lg';
  spinnerColor?: string;
}

export function LoadingState({
  message = 'Loading...',
  showSpinner = true,
  spinnerSize = 'md',
  spinnerColor = 'text-blue-500'
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      {showSpinner && (
        <LoadingSpinner size={spinnerSize} color={spinnerColor} />
      )}
      <div className="w-full max-w-md mt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-progress"></div>
        </div>
      </div>
      <p className="text-gray-600 mt-4">{message}</p>
    </div>
  );
}
