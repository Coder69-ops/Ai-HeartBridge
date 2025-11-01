// Form Error Handler for AI HeartBridge - Therapeutic & Supportive
import React from 'react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Heart } from 'lucide-react';

export interface FormFieldError {
  field: string;
  message: string;
  type: 'required' | 'validation' | 'server';
}

export interface FormErrorState {
  hasErrors: boolean;
  fieldErrors: Record<string, string>;
  globalError?: string;
}

// Validation schemas with gentle, therapeutic messaging
export const authSchemas = {
  email: z.string()
    .min(1, "We'd love to stay connected with you 💙 Please share your email")
    .email("This doesn't look quite right. Could you double-check your email? We want to make sure we can reach you 📧"),
  
  password: z.string()
    .min(6, "For your peace of mind, let's use at least 6 characters to keep your account secure 🔒")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Let's make this extra secure together - try mixing uppercase, lowercase, and numbers 🛡️"),
  
  name: z.string()
    .min(2, "We'd love to know what to call you 💚 Please share at least 2 characters")
    .max(50, "What a beautiful name! Could you keep it under 50 characters for us? ✨"),
  
  confirmPassword: (password: string) => z.string()
    .refine((val) => val === password, "The passwords don't match yet - let's make sure they're the same for your security 🤝")
};

export const relationshipSchemas = {
  partnerCode: z.string()
    .min(1, "Please enter your partner's connection code to begin your journey together 💕")
    .length(8, "Connection codes are 8 characters - please double-check with your partner 🔗"),
  
  relationshipGoal: z.string()
    .min(10, "Take your time to share what you're hoping to achieve together (at least 10 characters) 🌟")
    .max(500, "Your goals are important! Could you summarize in under 500 characters? 📝")
};

export class FormErrorHandler {
  private errors: FormErrorState = {
    hasErrors: false,
    fieldErrors: {},
  };

  // Handle Zod validation errors
  public handleZodError(error: z.ZodError): FormErrorState {
    const fieldErrors: Record<string, string> = {};
    
    error.errors.forEach((err) => {
      const field = err.path.join('.');
      fieldErrors[field] = err.message;
    });

    this.errors = {
      hasErrors: true,
      fieldErrors,
    };

    return this.errors;
  }

  // Handle server validation errors
  public handleServerError(error: any): FormErrorState {
    if (error.response?.data?.errors) {
      // Server returns field-specific errors
      const fieldErrors: Record<string, string> = {};
      
      if (Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          if (err.field && err.message) {
            fieldErrors[err.field] = err.message;
          }
        });
      } else if (typeof error.response.data.errors === 'object') {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          fieldErrors[field] = message as string;
        });
      }

      this.errors = {
        hasErrors: true,
        fieldErrors,
      };
    } else {
      // Generic server error
      this.errors = {
        hasErrors: true,
        fieldErrors: {},
        globalError: error.response?.data?.message || error.message || 'An error occurred',
      };
    }

    return this.errors;
  }

  // Clear all errors
  public clearErrors(): void {
    this.errors = {
      hasErrors: false,
      fieldErrors: {},
    };
  }

  // Clear specific field error
  public clearFieldError(field: string): void {
    delete this.errors.fieldErrors[field];
    this.errors.hasErrors = Object.keys(this.errors.fieldErrors).length > 0 || !!this.errors.globalError;
  }

  // Get current error state
  public getErrors(): FormErrorState {
    return this.errors;
  }

  // Check if specific field has error
  public hasFieldError(field: string): boolean {
    return !!this.errors.fieldErrors[field];
  }

  // Get specific field error
  public getFieldError(field: string): string | undefined {
    return this.errors.fieldErrors[field];
  }
}

// React hook for form error handling
export const useFormErrorHandler = () => {
  const [errorHandler] = React.useState(() => new FormErrorHandler());
  const [errors, setErrors] = React.useState<FormErrorState>(errorHandler.getErrors());

  const handleZodError = React.useCallback((error: z.ZodError) => {
    const newErrors = errorHandler.handleZodError(error);
    setErrors({ ...newErrors });
    return newErrors;
  }, [errorHandler]);

  const handleServerError = React.useCallback((error: any) => {
    const newErrors = errorHandler.handleServerError(error);
    setErrors({ ...newErrors });
    return newErrors;
  }, [errorHandler]);

  const clearErrors = React.useCallback(() => {
    errorHandler.clearErrors();
    setErrors(errorHandler.getErrors());
  }, [errorHandler]);

  const clearFieldError = React.useCallback((field: string) => {
    errorHandler.clearFieldError(field);
    setErrors({ ...errorHandler.getErrors() });
  }, [errorHandler]);

  return {
    errors,
    handleZodError,
    handleServerError,
    clearErrors,
    clearFieldError,
    hasFieldError: errorHandler.hasFieldError.bind(errorHandler),
    getFieldError: errorHandler.getFieldError.bind(errorHandler),
  };
};

// Form field component interfaces
export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
}

// Enhanced therapeutic error messages based on server responses
export const getServerErrorMessage = (error: any): string => {
  if (!error.response) {
    return "We're having trouble connecting right now 🌐 Please check your internet connection and we'll try again together.";
  }

  const status = error.response.status;
  const message = error.response.data?.message || '';

  switch (status) {
    case 400:
      if (message.includes('email')) {
        return "It looks like someone already has an account with this email 📧 Would you like to sign in instead? We're here to help! 🤗";
      }
      if (message.includes('password')) {
        return "The password isn't quite right 🔐 Take your time and try again - we know these things can be tricky.";
      }
      if (message.includes('partner') || message.includes('code')) {
        return "We can't find that partner code 🔗 Double-check with your partner - sometimes a fresh perspective helps! 💕";
      }
      return "Something in the information needs a small adjustment ✏️ Please review and we'll try again together.";
    
    case 401:
      return "The credentials don't match what we have on file 🔍 Take a moment to double-check your email and password - you've got this! 💪";
    
    case 404:
      return "We couldn't find an account with that email yet 📫 Would you like to create one and start your journey? We're excited to have you! ✨";
    
    case 409:
      return "You're already paired with a wonderful partner! 👑 If you need to change this, please reach out to our support team.";
    
    case 422:
      return "Some of the information needs a little refinement 🎯 Please check the highlighted fields and we'll get you sorted.";
    
    case 429:
      return "You're moving fast! 🏃‍♀️ Let's take a mindful moment together and try again in a few seconds. Sometimes slower is better. 🧘‍♀️";
    
    case 500:
    case 502:
    case 503:
      return "Our servers are taking a breather 😌 Please try again in a moment - we appreciate your patience as we get everything running smoothly.";
    
    default:
      return "Something unexpected happened, but don't worry - these things happen! 🤍 Please try again, and if it continues, our support team is here to help.";
  }
};

export default FormErrorHandler;