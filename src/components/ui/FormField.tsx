// Form Field Component for AI HeartBridge - Therapeutic Design
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
}

export const TherapeuticFormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
  helpText,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-emerald-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5"
            >
              <p className="text-sm text-emerald-600 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {helpText && !error && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          💡 {helpText}
        </p>
      )}
    </div>
  );
};

export default TherapeuticFormField;