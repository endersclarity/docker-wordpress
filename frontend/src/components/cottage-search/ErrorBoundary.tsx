'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryProps } from '@/types/cottage-search';

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component for cottage search
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cottage Search Error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} />;
      }

      return (
        <div className="error-boundary text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Something went wrong with the magic
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The cottage search spell encountered an error
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="magical-button bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}