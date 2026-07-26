import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TrackFolio AI Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Something went wrong
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
            An unexpected error occurred while processing this page. Please try refreshing or returning to the main dashboard.
          </p>

          {this.state.error?.message && (
            <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full text-left font-mono text-xs text-rose-600 dark:text-rose-400 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>

            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back Home</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
