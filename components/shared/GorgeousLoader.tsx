// Gorgeous Loading States for AI HeartBridge
import React from 'react';
import { motion } from 'framer-motion';

interface GorgeousLoaderProps {
  message?: string;
  type?: 'default' | 'therapy' | 'analysis' | 'sync' | 'thinking';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Enhanced Gorgeous Spinner - 100% Mobile Responsive
 */
const GorgeousSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}> = ({ size = 'md', color = 'from-emerald-500 to-cyan-500' }) => {
  const sizes = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8',
    md: 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20',
    lg: 'w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32'
  };

  return (
    <div className={`relative ${sizes[size]}`}>
      {/* Outer rotating ring with enhanced gradient */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 rounded-full border-3 sm:border-4 border-transparent bg-gradient-to-r ${color} bg-clip-border shadow-lg`}
      />

      {/* Inner solid circle with subtle shadow */}
      <div className={`absolute inset-1 sm:inset-2 rounded-full bg-white shadow-inner`} />

      {/* Enhanced pulsing dot with breathing effect */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute inset-1 sm:inset-2 rounded-full bg-gradient-to-r ${color} shadow-md`}
      />

      {/* Additional inner glow effect */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5
        }}
        className={`absolute inset-2 sm:inset-3 rounded-full bg-gradient-to-r ${color} opacity-30`}
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
 * Enhanced Progress Bar - 100% Mobile Responsive
 */
const ShimmerProgress: React.FC<{ progress?: number }> = ({ progress = 30 }) => {
  return (
    <div className="w-full">
      <div className="relative h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-sm"
        />

        {/* Enhanced shimmer effect */}
        <motion.div
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
        />

        {/* Additional glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-20"
        />
      </div>
    </div>
  );
};

/**
 * Main Gorgeous Loader Component - 100% Mobile Responsive
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
      title: 'Loading',
      description: 'Preparing your experience...'
    },
    therapy: {
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      icon: '💝',
      title: 'Creating Safe Space',
      description: 'Setting up your secure, judgment-free environment...'
    },
    analysis: {
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      icon: '🧠',
      title: 'Analyzing',
      description: 'Processing your thoughts with care...'
    },
    sync: {
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      icon: '🔄',
      title: 'Syncing',
      description: 'Connecting your data securely...'
    },
    thinking: {
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      icon: '🤔',
      title: 'Thinking',
      description: 'Processing your request...'
    }
  };

  const config = configs[type];

  return (
    <div className={`h-screen bg-gradient-to-br ${config.bgColor} flex items-center justify-center p-3 sm:p-4 lg:p-6 pt-20`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 max-w-xs sm:max-w-sm lg:max-w-md w-full"
      >
        {/* Enhanced Spinner with Mobile Optimization */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative"
        >
          <GorgeousSpinner size={size} color={config.color} />
          
          {/* Floating particles around spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${config.color} ${
                  i % 2 === 0 ? 'top-0' : 'bottom-0'
                }`}
                style={{
                  left: `${50 + 40 * Math.cos((i * 60) * Math.PI / 180)}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Title Section - Mobile Optimized */}
        <div className="text-center space-y-2 sm:space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-3"
          >
            {config.icon}
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent leading-tight`}
          >
            {config.title}
          </motion.h2>

          {/* Enhanced Message with Better Mobile Typography */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed px-2"
          >
            {message || config.description}
          </motion.p>
        </div>

        {/* Enhanced Animated Dots - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <AnimatedDots color={`text-${config.color.split('-')[1]}-600`} />
        </motion.div>

        {/* Enhanced Progress Bar - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="w-full max-w-xs sm:max-w-sm"
        >
          <ShimmerProgress progress={45} />
        </motion.div>

        {/* Enhanced Tips Section - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center space-y-2 sm:space-y-3"
        >
          <div className="text-xs sm:text-sm text-gray-500 px-4">
            <p className="font-medium">This shouldn't take long...</p>
            {type === 'therapy' && (
              <p className="text-xs mt-1 opacity-75">
                Your privacy and comfort are our priority
              </p>
            )}
          </div>
          
          {/* Mobile-friendly status indicators */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs text-gray-400">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1"
            >
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Secure</span>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="flex items-center gap-1"
            >
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Private</span>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              className="flex items-center gap-1"
            >
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <span>Safe</span>
            </motion.div>
          </div>
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
