import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  /** What to show instead of the crashed subtree. */
  fallback: (reset: () => void) => ReactNode;
  children: ReactNode;
};

type ErrorBoundaryState = { hasError: boolean };

/**
 * Keeps a crash local (UX-GUIDELINES.md §4.2): one broken window must not
 * take the town down with it. React still requires a class for this.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Technical detail goes to the console only, never to the visitor.
    console.error(error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    return this.state.hasError ? this.props.fallback(this.reset) : this.props.children;
  }
}
