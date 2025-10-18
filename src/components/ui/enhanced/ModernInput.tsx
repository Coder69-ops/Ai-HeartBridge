import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ModernInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  warning?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  helperText?: string;
}

const ModernInput: React.FC<ModernInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  warning,
  success,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  className = '',
  helperText
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const hasWarning = !!warning && !hasError;
  const hasSuccess = !!success && !hasError && !hasWarning;

  const getBorderColor = () => {
    if (hasError) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (hasWarning) return 'border-amber-300 focus:border-amber-500 focus:ring-amber-500';
    if (hasSuccess) return 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500';
    return 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500';
  };

  const getIconColor = () => {
    if (hasError) return 'text-red-400';
    if (hasWarning) return 'text-amber-400';
    if (hasSuccess) return 'text-emerald-400';
    return 'text-gray-400';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getIconColor()}`}>
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <motion.input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            block w-full px-3 py-2.5 text-sm
            ${leftIcon ? 'pl-10' : 'pl-3'}
            ${rightIcon ? 'pr-10' : 'pr-3'}
            border rounded-lg
            ${getBorderColor()}
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-all duration-200
            bg-white/70 backdrop-blur-sm
          `}
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightIcon}
          </div>
        )}

        {/* Status Icon */}
        {(hasError || hasWarning || hasSuccess) && !rightIcon && (
          <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${getIconColor()}`}>
            {hasError && <AlertCircle className="w-4 h-4" />}
            {hasWarning && <AlertCircle className="w-4 h-4" />}
            {hasSuccess && <CheckCircle className="w-4 h-4" />}
          </div>
        )}
      </div>

      {/* Helper Text / Error / Warning / Success */}
      <div className="min-h-[1.25rem]">
        {error && (
          <motion.p 
            className="text-xs text-red-600 flex items-center space-x-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </motion.p>
        )}
        {warning && !error && (
          <motion.p 
            className="text-xs text-amber-600 flex items-center space-x-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="w-3 h-3" />
            <span>{warning}</span>
          </motion.p>
        )}
        {success && !error && !warning && (
          <motion.p 
            className="text-xs text-emerald-600 flex items-center space-x-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle className="w-3 h-3" />
            <span>{success}</span>
          </motion.p>
        )}
        {helperText && !error && !warning && !success && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    </div>
  );
};

export default ModernInput;