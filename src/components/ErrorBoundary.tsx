import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AnimatedButton, GlassmorphismCard, GlassCardContent } from './ui/enhanced';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to error handler if available
    if (typeof window !== 'undefined' && (window as any).errorHandler) {
      (window as any).errorHandler.logError(error, 'React ErrorBoundary');
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return (
          <Fallback 
            error={this.state.error!} 
            resetError={() => this.setState({ hasError: false, error: null })}
          />
        );
      }

      return <DefaultErrorFallback 
        error={this.state.error!} 
        resetError={() => this.setState({ hasError: false, error: null })}
      />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <GlassmorphismCard className="max-w-md w-full">
        <GlassCardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            {isDevelopment && (
              <details className="text-left bg-gray-100 rounded-lg p-3 mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                  {error.message}
                  {error.stack && '\n\n' + error.stack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <AnimatedButton
              onClick={resetError}
              variant="primary"
              className="flex-1"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => window.location.reload()}
              variant="secondary"
              className="flex-1"
            >
              Refresh Page
            </AnimatedButton>
          </div>

          {isDevelopment && (
            <p className="text-xs text-gray-500">
              This error boundary is only shown in development. 
              In production, users will see a more friendly error page.
            </p>
          )}
        </GlassCardContent>
      </GlassmorphismCard>
    </div>
  );
};

// Specialized error boundary for onboarding
export const OnboardingErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-blue-50">
          <GlassmorphismCard className="max-w-md w-full">
            <GlassCardContent className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Onboarding Error
                </h2>
                <p className="text-gray-600 mb-4">
                  There was an issue with the onboarding process. Let's get you back on track.
                </p>
                
                {import.meta.env.DEV && (
                  <details className="text-left bg-gray-100 rounded-lg p-3 mb-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                      Technical Details
                    </summary>
                    <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                      {error.message}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <AnimatedButton
                  onClick={resetError}
                  variant="therapy"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Restart Onboarding
                </AnimatedButton>
                
                <AnimatedButton
                  onClick={() => window.location.href = '/'}
                  variant="secondary"
                >
                  Go to Dashboard
                </AnimatedButton>
              </div>
            </GlassCardContent>
          </GlassmorphismCard>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;