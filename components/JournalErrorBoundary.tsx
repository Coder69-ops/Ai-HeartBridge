import React from 'react';

interface JournalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface JournalErrorBoundaryProps {
  children: React.ReactNode;
  onBack: () => void;
}

export class JournalErrorBoundary extends React.Component<JournalErrorBoundaryProps, JournalErrorBoundaryState> {
  constructor(props: JournalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): JournalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Journal Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Journal Error</h2>
            <p className="text-gray-600 mb-6">
              Something went wrong with the journal feature. 
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <button 
              onClick={this.props.onBack}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}