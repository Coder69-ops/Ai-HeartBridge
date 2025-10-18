// AI HeartBridge - Masterpiece Mobile-First Auth View
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon,
  Sparkles,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from './shared/Button';
import { Card, CardContent } from './shared/Card';

interface MasterAuthViewProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const MasterAuthView: React.FC<MasterAuthViewProps> = ({ onLoginSuccess }) => {
  const { login, register, isLoading, error, clearError, user, isAuthenticated } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle successful auth
  useEffect(() => {
    if (isAuthenticated && user) {
      onLoginSuccess(user);
    }
  }, [isAuthenticated, user, onLoginSuccess]);

  // Clear error when switching modes
  useEffect(() => {
    clearError();
    setFormErrors({});
    setTouched({});
  }, [mode, clearError]);

  // Validate form
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (mode === 'signup' && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Signup-specific validation
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!validate() || isLoading) return;

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  // Handle field blur
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  // Switch mode
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setFormErrors({});
    setTouched({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl shadow-2xl mb-4"
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            AI HeartBridge
          </h1>
          <p className="text-gray-600 text-lg">
            {mode === 'login' ? 'Welcome back! 💚' : 'Start your journey together 💙'}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name Field (Signup only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          onBlur={() => handleBlur('name')}
                          placeholder="Enter your full name"
                          autoComplete="name"
                          className={`w-full h-12 pl-12 pr-4 text-base border-2 rounded-xl bg-white focus:outline-none focus:ring-4 transition-all ${
                            touched.name && formErrors.name
                              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                              : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {touched.name && formErrors.name && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-red-600 mt-1.5 flex items-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {formErrors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => handleBlur('email')}
                      placeholder="your@email.com"
                      autoComplete="email"
                      className={`w-full h-12 pl-12 pr-4 text-base border-2 rounded-xl bg-white focus:outline-none focus:ring-4 transition-all ${
                        touched.email && formErrors.email
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {touched.email && formErrors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-red-600 mt-1.5 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onBlur={() => handleBlur('password')}
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className={`w-full h-12 pl-12 pr-12 text-base border-2 rounded-xl bg-white focus:outline-none focus:ring-4 transition-all ${
                        touched.password && formErrors.password
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {touched.password && formErrors.password && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-red-600 mt-1.5 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password (Signup only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          onBlur={() => handleBlur('confirmPassword')}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className={`w-full h-12 pl-12 pr-4 text-base border-2 rounded-xl bg-white focus:outline-none focus:ring-4 transition-all ${
                            touched.confirmPassword && formErrors.confirmPassword
                              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                              : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {touched.confirmPassword && formErrors.confirmPassword && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-red-600 mt-1.5 flex items-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {formErrors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="w-5 h-5 mr-2" />
                      </motion.div>
                      <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                    </span>
                  </div>
                </div>

                {/* Toggle Mode Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleMode}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold"
                >
                  {mode === 'login' ? 'Create new account' : 'Sign in instead'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: <Shield className="w-6 h-6" />, text: 'Secure & Private', color: 'from-blue-500 to-indigo-500' },
            { icon: <Heart className="w-6 h-6" />, text: 'Evidence-Based', color: 'from-pink-500 to-rose-500' },
            { icon: <Sparkles className="w-6 h-6" />, text: 'AI-Powered', color: 'from-purple-500 to-pink-500' },
          ].map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-md text-center"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                {feature.icon}
              </div>
              <p className="text-sm font-semibold text-gray-700">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MasterAuthView;
