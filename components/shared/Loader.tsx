
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const loaderVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        default: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        therapy: "text-therapy-primary",
        calm: "text-therapy-calm",
        focus: "text-therapy-focus",
        muted: "text-muted-foreground"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
);

export interface LoaderProps extends VariantProps<typeof loaderVariants> {
  text?: string;
  centered?: boolean;
  fullScreen?: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size, 
  variant, 
  text, 
  centered = false, 
  fullScreen = false,
  className 
}) => {
  const LoaderComponent = (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn(loaderVariants({ size, variant }))} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {LoaderComponent}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex items-center justify-center p-8">
        {LoaderComponent}
      </div>
    );
  }

  return LoaderComponent;
};

// Pulse loader variant
export const PulseLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex space-x-1", className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-current rounded-full animate-pulse"
        style={{
          animationDelay: `${i * 0.2}s`,
          animationDuration: '1s'
        }}
      />
    ))}
  </div>
);

// Skeleton loader for content placeholders
export const Skeleton: React.FC<{ 
  className?: string;
  width?: string | number;
  height?: string | number;
}> = ({ className, width, height }) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-muted",
      className
    )}
    style={{ width, height }}
  />
);

// Progress loader
export const ProgressLoader: React.FC<{
  progress: number;
  className?: string;
  showPercent?: boolean;
}> = ({ progress, className, showPercent = false }) => (
  <div className={cn("w-full", className)}>
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="bg-therapy-primary h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
    {showPercent && (
      <div className="text-xs text-muted-foreground mt-1 text-center">
        {Math.round(progress)}%
      </div>
    )}
  </div>
);

export { Loader, loaderVariants };
