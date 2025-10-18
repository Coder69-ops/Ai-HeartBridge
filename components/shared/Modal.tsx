import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const modalVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  {
    variants: {
      size: {
        sm: "max-w-md",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] max-h-[95vh]"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
);

const modalContentVariants = cva(
  "relative w-full rounded-xl border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        therapy: "border-therapy-primary/20 bg-therapy-background",
        destructive: "border-destructive/20 bg-destructive/5"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants>, VariantProps<typeof modalContentVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  title,
  description,
  size,
  variant,
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        />
        <div className={cn(modalVariants({ size }))}>
          <Dialog.Content
            className={cn(modalContentVariants({ variant }))}
            onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
          >
            {(title || description || showClose) && (
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  {title && (
                    <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                      {title}
                    </Dialog.Title>
                  )}
                  {description && (
                    <Dialog.Description className="text-sm text-muted-foreground">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                {showClose && (
                  <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m18 6-12 12" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="sr-only">Close</span>
                  </Dialog.Close>
                )}
              </div>
            )}
            {children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
    {children}
  </div>
);

const ModalTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <Dialog.Title className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
    {children}
  </Dialog.Title>
);

const ModalDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <Dialog.Description className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </Dialog.Description>
);

const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter };