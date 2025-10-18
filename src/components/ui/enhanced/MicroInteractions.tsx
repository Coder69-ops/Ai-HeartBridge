import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Heart, MessageCircle, Activity, CheckCircle, AlertTriangle, Sparkles, Bell } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface FloatingActionButtonProps {
  primary?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'primary' | 'secondary' | 'therapy' | 'danger';
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  badge?: number;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  children?: React.ReactNode;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  primary = false,
  size = 'default',
  variant = 'primary',
  onClick,
  icon,
  label,
  badge,
  position = 'bottom-right',
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    default: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl',
    therapy: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  const scale = useSpring(1, { stiffness: 300, damping: 20 });
  const rotate = useTransform(scale, [1, 1.1], [0, 180]);

  useEffect(() => {
    scale.set(isHovered ? 1.05 : 1);
  }, [isHovered, scale]);

  return (
    <div className={cn('fixed z-50', positionClasses[position])}>
      <AnimatePresence>
        {/* Submenu items */}
        {isExpanded && children && (
          <motion.div
            className="absolute bottom-20 right-0 space-y-3"
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ duration: 0.2, staggerChildren: 0.05 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className={cn(
          'relative rounded-full flex items-center justify-center transition-all duration-300 transform',
          sizeClasses[size],
          variantClasses[variant]
        )}
        onClick={() => {
          if (children) {
            setIsExpanded(!isExpanded);
          } else {
            onClick?.();
          }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ scale, rotate: children ? rotate : 0 }}
      >
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Badge */}
        {badge && badge > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            {badge > 99 ? '99+' : badge}
          </motion.div>
        )}

        {/* Icon */}
        <motion.div
          className="relative z-10"
          animate={{ rotate: isExpanded && children ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {icon || <Heart className="w-6 h-6" />}
        </motion.div>

        {/* Label */}
        <AnimatePresence>
          {label && isHovered && (
            <motion.div
              className="absolute right-full mr-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {label}
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-900 transform rotate-45 -translate-y-1/2" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

// Sub-action button for FAB menu
interface FABActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'therapy';
}

const FABAction: React.FC<FABActionProps> = ({ icon, label, onClick, variant = 'secondary' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    therapy: 'bg-emerald-500 hover:bg-emerald-600'
  };

  return (
    <motion.div
      className="flex items-center space-x-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all',
          variantClasses[variant]
        )}
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {icon}
      </motion.button>
    </motion.div>
  );
};

// Micro-interaction components
const PulseIndicator: React.FC<{ active?: boolean; color?: string; size?: 'sm' | 'default' | 'lg' }> = ({
  active = false,
  color = 'bg-emerald-500',
  size = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    default: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
      <div className={cn('rounded-full', color, sizeClasses[size])} />
      {active && (
        <>
          <motion.div
            className={cn('absolute rounded-full', color, 'opacity-75')}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ width: '100%', height: '100%' }}
          />
          <motion.div
            className={cn('absolute rounded-full', color, 'opacity-50')}
            animate={{
              scale: [1, 2.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            style={{ width: '100%', height: '100%' }}
          />
        </>
      )}
    </div>
  );
};

// Floating notification component
interface FloatingNotificationProps {
  type: 'success' | 'warning' | 'info' | 'therapy';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000
}) => {
  const [progress, setProgress] = useState(100);

  const iconMap = {
    success: <CheckCircle className="w-6 h-6 text-emerald-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Bell className="w-6 h-6 text-blue-600" />,
    therapy: <Heart className="w-6 h-6 text-emerald-600" />
  };

  const colorMap = {
    success: 'border-emerald-200 bg-emerald-50',
    warning: 'border-amber-200 bg-amber-50',
    info: 'border-blue-200 bg-blue-50',
    therapy: 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'
  };

  useEffect(() => {
    if (isVisible && duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-6 right-6 z-50 max-w-sm"
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className={cn(
            'rounded-xl border backdrop-blur-sm shadow-lg p-4 relative overflow-hidden',
            colorMap[type]
          )}>
            {/* Progress bar */}
            {duration > 0 && (
              <motion.div
                className="absolute top-0 left-0 h-1 bg-current opacity-30"
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            )}

            <div className="flex items-start space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              >
                {iconMap[type]}
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.h4
                  className="font-semibold text-gray-900 mb-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {title}
                </motion.h4>
                <motion.p
                  className="text-sm text-gray-700"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {message}
                </motion.p>
              </div>

              <motion.button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { 
  FloatingActionButton, 
  FABAction, 
  PulseIndicator, 
  FloatingNotification 
};
export type { 
  FloatingActionButtonProps, 
  FABActionProps, 
  FloatingNotificationProps 
};