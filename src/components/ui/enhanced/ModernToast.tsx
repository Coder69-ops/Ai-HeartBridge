import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Heart } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'therapy';
  title: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const iconMap = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  therapy: <Heart className="w-5 h-5" />
};

const colorMap = {
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: 'text-emerald-600',
    button: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-600',
    button: 'text-red-600 hover:text-red-800 hover:bg-red-100'
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: 'text-amber-600',
    button: 'text-amber-600 hover:text-amber-800 hover:bg-amber-100'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-600',
    button: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
  },
  therapy: {
    container: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800',
    icon: 'text-emerald-600',
    button: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100'
  }
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const colors = colorMap[toast.type];

  React.useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, toast.persistent, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative max-w-sm w-full rounded-xl border shadow-lg backdrop-blur-sm p-4",
        colors.container
      )}
    >
      {/* Progress bar for non-persistent toasts */}
      {!toast.persistent && toast.duration !== 0 && (
        <motion.div
          className="absolute top-0 left-0 h-1 bg-current opacity-30 rounded-t-xl"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
        />
      )}

      <div className="flex items-start space-x-3">
        <motion.div
          className={cn("flex-shrink-0 mt-0.5", colors.icon)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          {iconMap[toast.type]}
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.p
            className="text-sm font-semibold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            {toast.title}
          </motion.p>
          
          {toast.description && (
            <motion.p
              className="mt-1 text-sm opacity-90"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {toast.description}
            </motion.p>
          )}

          {toast.action && (
            <motion.button
              className="mt-3 text-sm font-medium underline hover:no-underline transition-all"
              onClick={toast.action.onClick}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {toast.action.label}
            </motion.button>
          )}
        </div>

        <motion.button
          className={cn(
            "flex-shrink-0 p-1 rounded-md transition-all",
            colors.button
          )}
          onClick={() => onDismiss(toast.id)}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer: React.FC<ToastContainerProps> = ({ position = 'top-right' }) => {
  const { toasts, hideToast } = useToast();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={cn("fixed z-50 pointer-events-none", positionClasses[position])}>
      <div className="flex flex-col space-y-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={hideToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const toast: Toast = { ...toastData, id };
    
    setToasts(prev => [...prev, toast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Convenience functions
export const toast = {
  success: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'success' as const,
    title,
    description,
    ...options
  }),
  error: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'error' as const,
    title,
    description,
    ...options
  }),
  warning: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'warning' as const,
    title,
    description,
    ...options
  }),
  info: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'info' as const,
    title,
    description,
    ...options
  }),
  therapy: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'therapy' as const,
    title,
    description,
    ...options
  })
};

export { ToastContainer, ToastItem };
export type { Toast, ToastContextType };