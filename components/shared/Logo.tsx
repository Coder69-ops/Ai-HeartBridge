import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animated?: boolean;
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  animated = true,
  showText = true,
  variant = 'default'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6';
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      case '2xl':
        return 'w-20 h-20';
      default:
        return 'w-10 h-10';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      case '2xl':
        return 'text-2xl';
      default:
        return 'text-base';
    }
  };

  const getTextGradient = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-gray-800';
      default:
        return 'bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent';
    }
  };

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.05, 
      rotate: [0, 5, -5, 0],
      transition: { 
        duration: 0.6,
        rotate: { duration: 2, repeat: Infinity, repeatDelay: 3 }
      }
    },
    tap: { scale: 0.95 }
  };

  const LogoImage = () => (
    <motion.img
      src="/aiheartbridgelogo.png"
      alt="AI HeartBridge"
      className={`${getSizeClasses()} object-contain ${className}`}
      variants={animated ? logoVariants : undefined}
      initial="initial"
      whileHover={animated ? "hover" : undefined}
      whileTap={animated ? "tap" : undefined}
      loading="eager"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );

  if (!showText) {
    return <LogoImage />;
  }

  return (
    <motion.div
      className={`flex items-center gap-2 sm:gap-3 ${className}`}
      variants={animated ? logoVariants : undefined}
      initial="initial"
      whileHover={animated ? "hover" : undefined}
      whileTap={animated ? "tap" : undefined}
    >
      <LogoImage />
      <div className="flex flex-col">
        <span className={`font-bold ${getTextSizeClasses()} ${getTextGradient()}`}>
          AI HeartBridge
        </span>
        {size === 'lg' || size === 'xl' || size === '2xl' ? (
          <span className="text-xs text-gray-500 font-medium">
            Relationship Intelligence
          </span>
        ) : null}
      </div>
    </motion.div>
  );
};

export default Logo;
