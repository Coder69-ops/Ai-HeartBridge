import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md text-sm font-medium',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-therapy-calm focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'therapy-button'
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-therapy-calm text-white shadow-sm',
          'hover:bg-primary-600 hover:shadow-md',
          'active:bg-primary-700',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900 border border-neutral-300',
          'hover:bg-neutral-200 hover:shadow-sm',
          'active:bg-neutral-300',
        ],
        success: [
          'bg-therapy-growth text-white shadow-sm',
          'hover:bg-secondary-600 hover:shadow-md',
          'active:bg-secondary-700',
        ],
        warning: [
          'bg-therapy-warmth text-white shadow-sm',
          'hover:bg-accent-600 hover:shadow-md',
          'active:bg-accent-700',
        ],
        destructive: [
          'bg-error text-white shadow-sm',
          'hover:bg-red-600 hover:shadow-md',
          'active:bg-red-700',
        ],
        outline: [
          'border border-therapy-calm text-therapy-calm bg-transparent',
          'hover:bg-therapy-calm hover:text-white',
          'active:bg-primary-700 active:text-white',
        ],
        ghost: [
          'text-therapy-calm bg-transparent',
          'hover:bg-primary-50 hover:text-primary-700',
          'active:bg-primary-100',
        ],
        link: [
          'text-therapy-calm underline-offset-4',
          'hover:underline hover:text-primary-700',
          'active:text-primary-800',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="h-4 w-4" />
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Loading Spinner Component
const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export { Button, buttonVariants };