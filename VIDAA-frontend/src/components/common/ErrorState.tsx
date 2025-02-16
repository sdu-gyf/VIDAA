interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="text-center py-4">
      <p className="text-red-600">{message}</p>
    </div>
  );
}
