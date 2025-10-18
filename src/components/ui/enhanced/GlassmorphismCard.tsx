import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const glassmorphismCardVariants = cva(
  "relative overflow-hidden backdrop-blur-md border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white/80 border-white/20 shadow-lg hover:shadow-xl",
        dark: "bg-gray-900/80 border-gray-700/30 shadow-lg hover:shadow-xl",
        therapy: "bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-200/30 shadow-lg hover:shadow-xl",
        calm: "bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-200/30 shadow-lg hover:shadow-xl",
        warm: "bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-200/30 shadow-lg hover:shadow-xl",
        glass: "bg-white/5 border-white/10 shadow-2xl hover:bg-white/10",
        frosted: "bg-white/20 border-white/30 shadow-xl backdrop-blur-xl hover:bg-white/30"
      },
      rounded: {
        sm: "rounded-lg",
        default: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl"
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10"
      },
      glow: {
        none: "",
        soft: "shadow-2xl shadow-blue-500/10",
        medium: "shadow-2xl shadow-blue-500/20",
        strong: "shadow-2xl shadow-blue-500/30"
      }
    },
    defaultVariants: {
      variant: "default",
      rounded: "default",
      padding: "default",
      glow: "none"
    }
  }
);

interface GlassmorphismCardProps 
  extends Omit<HTMLMotionProps<"div">, "children">,
    VariantProps<typeof glassmorphismCardVariants> {
  children: React.ReactNode;
  hover?: boolean;
  floatingElements?: boolean;
  shimmer?: boolean;
}

const GlassmorphismCard = React.forwardRef<HTMLDivElement, GlassmorphismCardProps>(
  ({ 
    className, 
    variant, 
    rounded,
    padding,
    glow,
    children,
    hover = true,
    floatingElements = false,
    shimmer = false,
    ...props 
  }, ref) => {
    const hoverAnimation = hover ? {
      whileHover: { 
        scale: 1.02,
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      },
      transition: { type: "spring", stiffness: 300, damping: 20 }
    } : {};

    return (
      <motion.div
        ref={ref}
        className={cn(glassmorphismCardVariants({ variant, rounded, padding, glow, className }))}
        {...hoverAnimation}
        {...props}
      >
        {/* Shimmer Effect */}
        {shimmer && (
          <motion.div
            className="absolute inset-0 opacity-0"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
            }}
            animate={{
              x: ['-100%', '200%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Floating Decorative Elements */}
        {floatingElements && (
          <>
            <motion.div
              className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full"
              animate={{
                y: [-2, 2, -2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-6 left-6 w-1 h-1 bg-white/20 rounded-full"
              animate={{
                y: [2, -2, 2],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </>
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Border Gradient */}
        <div className="absolute inset-0 rounded-inherit">
          <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        </div>
      </motion.div>
    );
  }
);

GlassmorphismCard.displayName = "GlassmorphismCard";

// Header Component
const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { icon?: React.ReactNode }
>(({ className, icon, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("flex items-center justify-between mb-6", className)}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    {...props}
  >
    <div className="flex items-center space-x-3">
      {icon && (
        <motion.div
          className="flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </div>
  </motion.div>
));
GlassCardHeader.displayName = "GlassCardHeader";

// Title Component
const GlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <motion.h3
    ref={ref}
    className={cn("text-xl font-semibold text-gray-800 dark:text-gray-100", className)}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.15 }}
    {...props}
  >
    {children}
  </motion.h3>
));
GlassCardTitle.displayName = "GlassCardTitle";

// Content Component
const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("text-gray-600 dark:text-gray-300", className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
));
GlassCardContent.displayName = "GlassCardContent";

// Footer Component
const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("mt-6 flex items-center justify-between", className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
    {...props}
  >
    {children}
  </motion.div>
));
GlassCardFooter.displayName = "GlassCardFooter";

export { 
  GlassmorphismCard, 
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassCardFooter,
  glassmorphismCardVariants 
};
export type { GlassmorphismCardProps };