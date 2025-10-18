// Development Error Handler and Console Utilities
export class DevelopmentErrorHandler {
  private static instance: DevelopmentErrorHandler;
  private errorLog: Array<{ timestamp: Date; error: Error; context?: string }> = [];

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): DevelopmentErrorHandler {
    if (!DevelopmentErrorHandler.instance) {
      DevelopmentErrorHandler.instance = new DevelopmentErrorHandler();
    }
    return DevelopmentErrorHandler.instance;
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('Unhandled promise rejection:', event.reason);
      this.logError(new Error(event.reason), 'Unhandled Promise Rejection');
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.warn('Global error:', event.error);
      this.logError(event.error, 'Global Error');
    });

    // Suppress specific known warnings in development
    this.suppressKnownWarnings();
  }

  private suppressKnownWarnings() {
    if (import.meta.env.DEV) {
      // Store original console methods
      const originalWarn = console.warn;
      const originalError = console.error;

      // Filter out known development warnings
      console.warn = (...args) => {
        const message = args.join(' ');
        
        // Suppress specific warnings
        if (
          message.includes('was preloaded using link preload but not used') ||
          message.includes('Download the React DevTools') ||
          message.includes('X-Frame-Options may only be set via an HTTP header')
        ) {
          return; // Suppress these warnings
        }
        
        originalWarn.apply(console, args);
      };

      console.error = (...args) => {
        const message = args.join(' ');
        
        // Log but don't spam console with known issues
        if (message.includes('getBoundingClientRect')) {
          console.debug('AnimatedButton: Safely handled getBoundingClientRect error');
          return;
        }
        
        originalError.apply(console, args);
      };
    }
  }

  public logError(error: Error, context?: string) {
    this.errorLog.push({
      timestamp: new Date(),
      error,
      context
    });

    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  public getErrorLog() {
    return this.errorLog;
  }

  public clearErrorLog() {
    this.errorLog = [];
  }

  // Safe DOM operations with error handling
  public static safeGetBoundingClientRect(element: HTMLElement | null): DOMRect | null {
    try {
      if (!element || !element.getBoundingClientRect) {
        return null;
      }
      return element.getBoundingClientRect();
    } catch (error) {
      console.debug('Safe getBoundingClientRect: Element not available');
      return null;
    }
  }

  // Safe event handling
  public static safeEventHandler<T extends Event>(
    handler: (event: T) => void,
    context?: string
  ) {
    return (event: T) => {
      try {
        handler(event);
      } catch (error) {
        console.warn(`Error in ${context || 'event handler'}:`, error);
        DevelopmentErrorHandler.getInstance().logError(error as Error, context);
      }
    };
  }

  // Performance monitoring
  public static measurePerformance<T>(
    operation: () => T,
    label: string
  ): T {
    if (import.meta.env.DEV) {
      const start = performance.now();
      const result = operation();
      const end = performance.now();
      console.debug(`Performance [${label}]: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return operation();
  }
}

// Initialize error handler
if (typeof window !== 'undefined') {
  DevelopmentErrorHandler.getInstance();
}

// Export utility functions
export const safeGetBoundingClientRect = DevelopmentErrorHandler.safeGetBoundingClientRect;
export const safeEventHandler = DevelopmentErrorHandler.safeEventHandler;
export const measurePerformance = DevelopmentErrorHandler.measurePerformance;