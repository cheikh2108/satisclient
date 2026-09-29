'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              Une erreur est survenue
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {this.state.error?.message || 'Erreur inattendue'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              <RefreshCw className="h-3 w-3" />
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
