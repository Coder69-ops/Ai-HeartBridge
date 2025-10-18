import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { safeGetBoundingClientRect, safeEventHandler } from '../../../utils/errorHandler';

const animatedButtonVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 focus:ring-blue-300",
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-300",
        therapy: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-300",
        calm: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-300",
        warm: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 focus:ring-amber-300",
        danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 focus:ring-red-300",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 focus:ring-white/30"
      },
      size: {
        sm: "px-3 py-2 text-sm h-9",
        default: "px-6 py-3 text-base h-11",
        lg: "px-8 py-4 text-lg h-13",
        xl: "px-10 py-5 text-xl h-16",
        icon: "p-3 h-11 w-11"
      },
      animation: {
        scale: "",
        pulse: "",
        bounce: "",
        slide: "",
        float: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      animation: "scale"
    }
  }
);

interface AnimatedButtonProps 
  extends Omit<HTMLMotionProps<"button">, "size">,
    VariantProps<typeof animatedButtonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ripple?: boolean;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    loading = false,
    leftIcon,
    rightIcon,
    ripple = true,
    children,
    disabled,
    onTap,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    const [rippleId, setRippleId] = React.useState(0);

    const animationVariants = {
      scale: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 400, damping: 17 }
      },
      pulse: {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      },
      bounce: {
        whileHover: { y: -2 },
        whileTap: { y: 0 },
        transition: { type: "spring", stiffness: 400, damping: 10 }
      },
      slide: {
        whileHover: { x: 2 },
        whileTap: { x: 0 },
        transition: { type: "spring", stiffness: 400, damping: 17 }
      },
      float: {
        animate: { y: [-2, 2, -2] },
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    };

    const handleRipple = safeEventHandler((event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || disabled || loading) return;

      const button = event.currentTarget;
      if (!button) return;
      
      const rect = safeGetBoundingClientRect(button);
      if (!rect || !rect.width || !rect.height) return;
      
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple = { id: rippleId, x, y };
      setRipples(prev => [...prev, newRipple]);
      setRippleId(prev => prev + 1);

      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);

      onTap?.(event, {});
    }, 'AnimatedButton ripple effect');

    const currentVariant = animationVariants[animation || 'scale'];

    return (
      <motion.button
        ref={ref}
        className={cn(animatedButtonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        onTap={handleRipple}
        {...currentVariant}
        {...props}
      >
        {/* Ripple Effect */}
        {ripple && (
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{
                  left: ripple.x - 25,
                  top: ripple.y - 25,
                  width: 50,
                  height: 50,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}

        {/* Button Content */}
        <motion.div
          className={cn("flex items-center space-x-2", loading && "opacity-0")}
          initial={false}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {leftIcon && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {leftIcon}
            </motion.div>
          )}
          
          <motion.span
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {children}
          </motion.span>
          
          {rightIcon && (
            <motion.div
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {rightIcon}
            </motion.div>
          )}
        </motion.div>

        {/* Shine Effect for Primary Buttons */}
        {variant === 'primary' && !loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ transform: 'translateX(-100%)' }}
            whileHover={{
              transform: 'translateX(100%)',
              transition: { duration: 0.6, ease: "easeInOut" }
            }}
          />
        )}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, animatedButtonVariants };
export type { AnimatedButtonProps };