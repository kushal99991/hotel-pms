import React from "react";
import { logFrontendError } from "utils/errorLogger";

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // Log to backend using same API error format
    await logFrontendError(
      error.message,
      {
        url: window.location.href,
        method: "RENDER",
        params: null,
        data: null,
        additional: {
          componentStack: errorInfo?.componentStack || "Unknown Component",
          stack: error.stack || "",
        },
      },
      "COMPONENT_ERROR"
    );
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
