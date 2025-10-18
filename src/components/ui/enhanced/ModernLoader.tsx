import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

interface ModernLoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'wave' | 'therapy';
  size?: 'sm' | 'default' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'therapy' | 'calm' | 'warm';
  text?: string;
  fullscreen?: boolean;
  overlay?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  default: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  therapy: 'text-emerald-600',
  calm: 'text-indigo-600',
  warm: 'text-amber-600'
};

const ModernLoader: React.FC<ModernLoaderProps> = ({
  variant = 'spinner',
  size = 'default',
  color = 'primary',
  text,
  fullscreen = false,
  overlay = false
}) => {
  const renderSpinner = () => (
    <motion.div
      className={cn("border-4 border-current border-t-transparent rounded-full", sizeClasses[size])}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("rounded-full bg-current", {
            'w-2 h-2': size === 'sm',
            'w-3 h-3': size === 'default',
            'w-4 h-4': size === 'lg',
            'w-5 h-5': size === 'xl'
          })}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={cn("rounded-full bg-current", sizeClasses[size])}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  const renderBounce = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("rounded-full bg-current", {
            'w-2 h-2': size === 'sm',
            'w-3 h-3': size === 'default',
            'w-4 h-4': size === 'lg',
            'w-5 h-5': size === 'xl'
          })}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderWave = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={cn("bg-current rounded-t-sm", {
            'w-1 h-4': size === 'sm',
            'w-1.5 h-6': size === 'default',
            'w-2 h-8': size === 'lg',
            'w-3 h-12': size === 'xl'
          })}
          animate={{
            scaleY: [1, 2, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderTherapy = () => (
    <div className="relative">
      <motion.div
        className={cn("rounded-full border-4 border-emerald-200", sizeClasses[size])}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
        animate={{
          scale: [0.8, 1, 0.8],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-1 h-1 bg-white rounded-full"
          animate={{
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'bounce': return renderBounce();
      case 'wave': return renderWave();
      case 'therapy': return renderTherapy();
      default: return renderSpinner();
    }
  };

  const loaderContent = (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center space-y-4",
        colorClasses[color]
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {renderLoader()}
      {text && (
        <motion.p
          className="text-sm font-medium text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullscreen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {loaderContent}
      </motion.div>
    );
  }

  if (overlay) {
    return (
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {loaderContent}
      </motion.div>
    );
  }

  return loaderContent;
};

export { ModernLoader };
export type { ModernLoaderProps };