import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

const getBackdropClasses = (backdrop: string) => {
  const baseClasses = "fixed inset-0 z-50 flex items-center justify-center p-4";
  const backdropMap = {
    blur: "backdrop-blur-md bg-black/50",
    dark: "bg-black/60",
    light: "bg-white/60",
    glass: "backdrop-blur-xl bg-white/10"
  };
  return cn(baseClasses, backdropMap[backdrop as keyof typeof backdropMap] || backdropMap.blur);
};

const getContentClasses = (variant: string, size: string) => {
  const baseClasses = "relative w-full rounded-2xl shadow-2xl border";
  
  const variantMap = {
    default: "bg-white border-gray-200",
    dark: "bg-gray-900 border-gray-700 text-white",
    therapy: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
    calm: "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200",
    glass: "bg-white/80 backdrop-blur-md border-white/20"
  };
  
  const sizeMap = {
    sm: "max-w-sm",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl"
  };
  
  return cn(
    baseClasses,
    variantMap[variant as keyof typeof variantMap] || variantMap.default,
    sizeMap[size as keyof typeof sizeMap] || sizeMap.default
  );
};

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  icon?: 'success' | 'warning' | 'error' | 'info' | React.ReactNode;
  footer?: React.ReactNode;
  preventClose?: boolean;
  backdrop?: 'blur' | 'dark' | 'light' | 'glass';
  variant?: 'default' | 'dark' | 'therapy' | 'calm' | 'glass';
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
}

const iconMap = {
  success: <CheckCircle className="w-6 h-6 text-emerald-500" />,
  warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
  error: <AlertCircle className="w-6 h-6 text-red-500" />,
  info: <Info className="w-6 h-6 text-blue-500" />
};

const ModernModal: React.FC<ModernModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  backdrop = "blur",
  variant = "default",
  size = "default",
  showCloseButton = true,
  closeOnBackdrop = true,
  icon,
  footer,
  preventClose = false
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop && !preventClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, preventClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={getBackdropClasses(backdrop)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className={getContentClasses(variant, size)}
            initial={{ 
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            transition={{ 
              duration: 0.2, 
              ease: [0.16, 1, 0.3, 1] // Custom easing for smooth feel
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {showCloseButton && !preventClose && (
              <motion.button
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
                onClick={handleClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            )}

            {/* Header */}
            {(title || description || icon) && (
              <motion.div 
                className="p-8 pb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start space-x-4">
                  {icon && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                    >
                      {typeof icon === 'string' ? iconMap[icon] : icon}
                    </motion.div>
                  )}
                  <div className="flex-1">
                    {title && (
                      <motion.h2 
                        className="text-2xl font-semibold text-gray-900 dark:text-white mb-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {title}
                      </motion.h2>
                    )}
                    {description && (
                      <motion.p 
                        className="text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        {description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Content */}
            <motion.div 
              className="px-8 pb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>

            {/* Footer */}
            {footer && (
              <motion.div 
                className="px-8 pb-8 border-t border-gray-200 dark:border-gray-700 pt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {footer}
              </motion.div>
            )}

            {/* Decorative gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { ModernModal };
export type { ModernModalProps };