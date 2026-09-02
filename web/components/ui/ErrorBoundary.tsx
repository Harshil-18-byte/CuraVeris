"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SectionErrorProps {
  onRetry?: () => void;
  title?: string;
}

export const SectionError: React.FC<SectionErrorProps> = ({
  onRetry,
  title = "This section couldn't load",
}) => {
  return (
    <div className="p-8 bg-bg-secondary rounded-lg text-center border border-border-subtle my-2">
      <AlertCircle className="w-7 h-7 text-border-strong mx-auto" strokeWidth={1.5} />
      <p className="mt-3 font-semibold text-sm text-text-primary">{title}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Section Error Caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SectionError
          title={this.props.fallbackTitle || "This section couldn't load"}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
