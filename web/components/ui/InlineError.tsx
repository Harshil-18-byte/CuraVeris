import React from "react";

interface InlineErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  requestId?: string | null;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  title = "Error loading data",
  message,
  onRetry,
  requestId,
}) => {
  return (
    <div className="bg-danger/10 border-l-4 border-danger rounded-md p-4">
      <h4 className="font-semibold text-danger text-sm">{title}</h4>
      <p className="text-danger/80 text-sm mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-danger underline text-sm mt-2 cursor-pointer font-medium hover:text-danger/90 block"
        >
          Try Again
        </button>
      )}
      {requestId && (
        <p className="text-xs font-mono text-neutral-600 mt-2">
          Request ID: {requestId}
        </p>
      )}
    </div>
  );
};
