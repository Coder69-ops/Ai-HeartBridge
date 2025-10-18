import React, { Suspense, lazy } from 'react';
import { ModernLoader } from '../components/ui/enhanced';

// Enhanced lazy loading with retry logic
const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(async () => {
    try {
      return await importFunc();
    } catch (error) {
      console.error('Failed to load component:', error);
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await importFunc();
    }
  });

  const ComponentWithSuspense: React.FC<React.ComponentProps<T>> = (props) => (
    <Suspense fallback={fallback ? <fallback /> : <ModernLoader variant="therapy" />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  ComponentWithSuspense.displayName = `LazyComponent(${LazyComponent.displayName || 'Unknown'})`;
  
  return ComponentWithSuspense;
};

// Lazy-loaded components with optimized chunking
export const LazyDashboard = createLazyComponent(
  () => import('../../components/EnhancedDashboard')
);

export const LazyCheckInView = createLazyComponent(
  () => import('../../components/CheckInView')
);

export const LazyExercisesView = createLazyComponent(
  () => import('../../components/ExercisesView')
);

export const LazyJournalingView = createLazyComponent(
  () => import('../../components/JournalingView')
);

export const LazyChatView = createLazyComponent(
  () => import('../../components/ChatView')
);

export const LazyTrendsView = createLazyComponent(
  () => import('../../components/TrendsView')
);

export const LazyProfileView = createLazyComponent(
  () => import('../../components/ProfileView')
);

export const LazyExerciseDetailView = createLazyComponent(
  () => import('../../components/ExerciseDetailView')
);

// Performance monitoring utilities
interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observer?: PerformanceObserver;

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Navigation timing:', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              totalTime: navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
          
          if (entry.entryType === 'measure') {
            console.log(`Custom measure ${entry.name}:`, entry.duration);
          }
          
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          }
        });
      });

      try {
        this.observer.observe({ entryTypes: ['navigation', 'measure', 'largest-contentful-paint', 'first-input'] });
      } catch (error) {
        console.warn('Performance observer failed to initialize:', error);
      }
    }
  }

  startMeasure(name: string) {
    const startTime = performance.now();
    this.metrics.set(name, { name, startTime });
    
    if (typeof performance.mark === 'function') {
      performance.mark(`${name}-start`);
    }
  }

  endMeasure(name: string) {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No metric found for ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;

    if (typeof performance.mark === 'function' && typeof performance.measure === 'function') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  getMetrics() {
    return Array.from(this.metrics.values());
  }

  clearMetrics() {
    this.metrics.clear();
  }

  // Web Vitals measurement
  measureWebVitals() {
    if (typeof window === 'undefined') return;

    // Measure CLS (Cumulative Layout Shift)
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
          clsEntries.push(entry);
        }
      }
    });
    
    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('CLS observer failed:', error);
    }

    // Report Web Vitals after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        console.log('Web Vitals:', {
          CLS: clsValue,
          entries: clsEntries
        });
      }, 0);
    });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Performance HOC for component timing
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const name = componentName || Component.displayName || Component.name || 'Unknown';
  
  const PerformanceMonitoredComponent: React.FC<P> = (props) => {
    React.useEffect(() => {
      performanceMonitor.startMeasure(`${name}-render`);
      return () => {
        performanceMonitor.endMeasure(`${name}-render`);
      };
    }, []);

    return <Component {...props} />;
  };

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${name})`;
  return PerformanceMonitoredComponent;
};

// Resource preloading utilities
export const preloadRoute = (routeImport: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Preload on interaction or idle time
    const preload = () => {
      routeImport().catch(error => {
        console.warn('Route preload failed:', error);
      });
    };

    // Preload on mouse hover over navigation links
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        preload();
      }
    }, { once: true });

    // Preload on idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload);
    } else {
      setTimeout(preload, 2000);
    }
  }
};

// Bundle analysis utilities
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Analyze loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const totalSize = scripts.reduce((total, script) => {
      const src = (script as HTMLScriptElement).src;
      // This would need to be implemented with actual size checking
      console.log('Loaded script:', src);
      return total;
    }, 0);

    console.log('Total scripts loaded:', scripts.length);
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
    const memory = (performance as any).memory;
    console.log('Memory usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    });
  }
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.measureWebVitals();
  
  // Monitor memory usage periodically in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
  }
}

export { createLazyComponent };