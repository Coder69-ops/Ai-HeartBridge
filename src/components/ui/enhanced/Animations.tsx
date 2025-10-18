import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Page transition variants
const pageVariants: Record<string, Variants> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  
  scaleOut: {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  therapy: {
    initial: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      filter: 'blur(0px)'
    },
    exit: { 
      opacity: 0, 
      scale: 1.05, 
      y: -20,
      filter: 'blur(2px)'
    },
  },
  
  gentle: {
    initial: { 
      opacity: 0, 
      y: 30,
      scale: 0.98
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1
    },
    exit: { 
      opacity: 0, 
      y: -15,
      scale: 1.02
    },
  }
};

// Transition timing configurations
const transitionConfigs = {
  fast: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  normal: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  spring: { type: "spring", stiffness: 300, damping: 25 },
  gentle: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  therapy: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: keyof typeof pageVariants;
  timing?: keyof typeof transitionConfigs;
  className?: string;
  key?: string | number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fadeIn',
  timing = 'normal',
  className = '',
  key
}) => {
  const variants = pageVariants[variant];
  const transition = transitionConfigs[timing];

  return (
    <motion.div
      key={key}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Container for page transitions with AnimatePresence
interface PageTransitionContainerProps {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  className?: string;
}

const PageTransitionContainer: React.FC<PageTransitionContainerProps> = ({
  children,
  mode = 'wait',
  className = ''
}) => {
  return (
    <AnimatePresence mode={mode}>
      <div className={className}>
        {children}
      </div>
    </AnimatePresence>
  );
};

// Staggered children animation
const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

interface StaggeredAnimationProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  className = '',
  staggerDelay = 0.1
}) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerChild}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Scroll-triggered animations
interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  variant?: 'slideUp' | 'slideLeft' | 'slideRight' | 'fadeIn' | 'scaleIn';
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  className = '',
  threshold = 0.1,
  triggerOnce = true,
  variant = 'slideUp'
}) => {
  const variants = {
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 }
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: triggerOnce, amount: threshold }}
      variants={variants[variant]}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hover and tap animations
interface InteractiveAnimationProps {
  children: React.ReactNode;
  hover?: boolean;
  tap?: boolean;
  hoverScale?: number;
  tapScale?: number;
  className?: string;
  onClick?: () => void;
}

const InteractiveAnimation: React.FC<InteractiveAnimationProps> = ({
  children,
  hover = true,
  tap = true,
  hoverScale = 1.02,
  tapScale = 0.98,
  className = '',
  onClick
}) => {
  const animations: any = {};

  if (hover) {
    animations.whileHover = { scale: hoverScale };
  }

  if (tap) {
    animations.whileTap = { scale: tapScale };
  }

  return (
    <motion.div
      {...animations}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Loading skeleton animation
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'rectangular'
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};

// Breathing animation for relaxation
interface BreathingAnimationProps {
  duration?: number;
  scale?: number;
  children: React.ReactNode;
  className?: string;
}

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  duration = 4,
  scale = 1.1,
  children,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export {
  PageTransition,
  PageTransitionContainer,
  StaggeredAnimation,
  ScrollAnimation,
  InteractiveAnimation,
  Skeleton,
  BreathingAnimation,
  pageVariants,
  transitionConfigs
};

export type {
  PageTransitionProps,
  PageTransitionContainerProps,
  StaggeredAnimationProps,
  ScrollAnimationProps,
  InteractiveAnimationProps,
  SkeletonProps,
  BreathingAnimationProps
};