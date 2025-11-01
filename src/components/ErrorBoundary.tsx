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
  const isDevelopment = (import.meta as any).env?.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <GlassmorphismCard className="max-w-md w-full">
        <GlassCardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Let's take a moment together 🤗
            </h2>
            <p className="text-gray-600 mb-4">
              Something unexpected happened, but don't worry - these things are part of the journey. Your progress is safe, and we're here to help you get back on track. Take a deep breath with us. 💚
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
              Let's Try Again 💚
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => window.location.reload()}
              variant="secondary"
              className="flex-1"
            >
              Fresh Start 🌱
            </AnimatedButton>
          </div>

          {isDevelopment && (
            <p className="text-xs text-emerald-600">
              Development mode - helping you grow stronger 🌿
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
                  Let's pause and regroup 🤗
                </h2>
                <p className="text-gray-600 mb-4">
                  Your onboarding journey hit a small bump, but that's okay - growth isn't always linear. Let's take a mindful moment and continue together. Your progress matters, and we're here to support you every step of the way. 💚
                </p>
                
                {(import.meta as any).env?.DEV && (
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
                  Continue Our Journey 🌱
                </AnimatedButton>
                
                <AnimatedButton
                  onClick={() => window.location.href = '/'}
                  variant="secondary"
                >
                  Safe Harbor (Dashboard) 🏠
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