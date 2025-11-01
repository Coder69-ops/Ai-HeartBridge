// Network Error Handler for AI HeartBridge - Therapeutic & Supportive
import React from 'react';

export class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;
  private isOnline = navigator.onLine;
  private retryQueue: Array<{ fn: () => Promise<any>; retries: number; description?: string }> = [];
  private maxRetries = 3;
  private listeners: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    this.setupNetworkListeners();
  }

  public static getInstance(): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler();
    }
    return NetworkErrorHandler.instance;
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processRetryQueue();
      this.notifyListeners(true);
      console.log('💚 Connection restored - Your journey continues');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      console.log('💔 Connection temporarily lost - We\'ll reconnect when ready');
    });
  }

  public addStatusListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline));
  }

  public async handleApiCall<T>(
    apiCall: () => Promise<T>,
    options?: {
      showOfflineToast?: boolean;
      retryOnReconnect?: boolean;
      fallbackData?: T;
      description?: string;
      showSupportiveMessage?: boolean;
    }
  ): Promise<T> {
    try {
      if (!this.isOnline) {
        throw new Error('CONNECTION_OFFLINE');
      }

      return await apiCall();
    } catch (error: any) {
      const description = options?.description || 'connecting to our services';
      
      // Network errors - Use therapeutic messaging
      if (!this.isOnline || error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || error.message === 'CONNECTION_OFFLINE') {
        if (options?.retryOnReconnect) {
          this.retryQueue.push({ fn: apiCall, retries: 0, description });
        }
        
        if (options?.fallbackData) {
          return options.fallbackData;
        }
        
        // Therapeutic offline message
        throw new Error(`We're having trouble ${description} right now. Don't worry - your progress is safe and we'll reconnect automatically when your network is ready. Take a moment to breathe. 💚`);
      }

      // Server errors (5xx) - Supportive messaging
      if (error.response?.status >= 500) {
        if (options?.retryOnReconnect) {
          this.retryQueue.push({ fn: apiCall, retries: 0, description });
        }
        throw new Error(`Our servers need a moment to catch up. Your data is safe, and we're working to restore everything quickly. Please try again in a few moments. 🤗`);
      }

      // Rate limiting (429) - Gentle guidance
      if (error.response?.status === 429) {
        throw new Error(`You're moving fast! Let's take a brief pause together and try again in a moment. Sometimes slowing down helps us process better. 🌱`);
      }

      // Authentication errors (401/403) - Supportive redirection
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(`It looks like your session has expired. Let's get you signed in again so you can continue your journey. 🔒`);
      }

      // Re-throw other errors with context
      throw error;
    }
  }

  private async processRetryQueue() {
    const pendingRetries = [...this.retryQueue];
    this.retryQueue = [];

    console.log(`💚 Reconnected! Processing ${pendingRetries.length} pending requests...`);

    for (const item of pendingRetries) {
      if (item.retries < this.maxRetries) {
        try {
          await item.fn();
          console.log(`✅ Successfully restored: ${item.description || 'connection'}`);
        } catch (error) {
          if (item.retries < this.maxRetries - 1) {
            this.retryQueue.push({ ...item, retries: item.retries + 1 });
            console.log(`🔄 Retrying: ${item.description || 'request'} (attempt ${item.retries + 2}/${this.maxRetries})`);
          } else {
            console.log(`😔 Could not restore: ${item.description || 'request'} after ${this.maxRetries} attempts`);
          }
        }
      }
    }
  }

  public isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  public getConnectionStatus(): { isOnline: boolean; message: string } {
    return {
      isOnline: this.isOnline,
      message: this.isOnline 
        ? "You're connected and ready to continue your journey 💚"
        : "Connection paused - We'll reconnect automatically when ready 🤗"
    };
  }
}

// React hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// Initialize network error handler
if (typeof window !== 'undefined') {
  NetworkErrorHandler.getInstance();
}

export default NetworkErrorHandler;