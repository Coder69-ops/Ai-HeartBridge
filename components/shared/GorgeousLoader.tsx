// Gorgeous Loading States for AI HeartBridge
import React from 'react';
import { motion } from 'framer-motion';

interface GorgeousLoaderProps {
  message?: string;
  type?: 'default' | 'therapy' | 'analysis' | 'sync' | 'thinking';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Gorgeous spinner with smooth animation
 */
const GorgeousSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}> = ({ size = 'md', color = 'from-emerald-500 to-cyan-500' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`relative ${sizes[size]}`}>
      {/* Outer rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r ${color} bg-clip-border`}
      />

      {/* Inner solid circle */}
      <div className={`absolute inset-1 rounded-full bg-white`} />

      {/* Pulsing dot */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`absolute inset-1 rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
};

/**
 * Animated dots loader
 */
const AnimatedDots: React.FC<{ color?: string }> = ({ color = 'text-emerald-600' }) => {
  return (
    <div className="flex gap-2 justify-center items-center h-8">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -8, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15
          }}
          className={`w-3 h-3 rounded-full bg-current ${color}`}
        />
      ))}
    </div>
  );
};

/**
 * Smooth progress bar with shimmer
 */
const ShimmerProgress: React.FC<{ progress?: number }> = ({ progress = 30 }) => {
  return (
    <div className="w-full">
      <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
        />

        {/* Shimmer effect */}
        <motion.div
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
        />
      </div>
    </div>
  );
};

/**
 * Main Gorgeous Loader Component
 */
export const GorgeousLoader: React.FC<GorgeousLoaderProps> = ({
  message = 'Loading...',
  type = 'default',
  size = 'md'
}) => {
  const configs = {
    default: {
      color: 'from-emerald-500 to-cyan-500',
      bgColor: 'from-emerald-50 to-cyan-50',
      icon: '✨',
      title: 'Loading'
    },
    therapy: {
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      icon: '💝',
      title: 'Creating Safe Space'
    },
    analysis: {
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      icon: '🧠',
      title: 'Analyzing'
    },
    sync: {
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      icon: '🔄',
      title: 'Syncing'
    },
    thinking: {
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      icon: '🤔',
      title: 'Thinking'
    }
  };

  const config = configs[type];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgColor} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 max-w-sm"
      >
        {/* Spinner */}
        <GorgeousSpinner size={size} color={config.color} />

        {/* Title */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent mb-2`}
          >
            {config.title}
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-lg"
          >
            {message}
          </motion.p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center">
          <AnimatedDots color={`text-${config.color.split('-')[1]}-600`} />
        </div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <ShimmerProgress progress={45} />
        </motion.div>

        {/* Tips or Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-4"
        >
          <p>This shouldn't take long...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

/**
 * Inline loading state (for small areas)
 */
export const InlineLoader: React.FC<{ message?: string; color?: string }> = ({
  message,
  color = 'text-emerald-600'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full ${color}`}
      />
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </motion.div>
  );
};

/**
 * Card skeleton loader (for content placeholders)
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-6 space-y-4 shadow-sm"
        >
          {/* Header skeleton */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-4/5 animate-pulse" />
          </div>

          {/* Footer skeleton */}
          <div className="flex gap-2 pt-2">
            <div className="h-8 bg-gray-100 rounded w-20 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded w-20 animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GorgeousLoader;
