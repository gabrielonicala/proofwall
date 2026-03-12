"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Something went wrong
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
