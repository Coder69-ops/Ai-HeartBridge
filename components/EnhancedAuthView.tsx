import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FormValidation } from '../types';
import { useAuthStore } from '../store/authStore';
import { 
  AnimatedButton, 
  GlassmorphismCard, 
  GlassCardContent, 
  ModernInput,
  InteractiveAnimation 
} from '../src/components/ui/enhanced';
import { Heart, Mail, Lock, Eye, EyeOff, Users, Sparkles, Shield } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

const EnhancedAuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const { login, register, isLoading, error, clearError, user, isAuthenticated } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form
  const [signupData, setSignupData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const [validation, setValidation] = useState<FormValidation>({
    isValid: false,
    errors: {},
    warnings: {}
  });

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      onLoginSuccess(user);
    }
  }, [isAuthenticated, user, onLoginSuccess]);

  // Validation logic
  const validateForm = (data: any, isSignup: boolean): FormValidation => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (isSignup) {
      if (data.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        warnings.password = 'For better security, include uppercase, lowercase, and numbers';
      }
    }

    if (isSignup) {
      // Name validation
      if (!data.firstName?.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!data.lastName?.trim()) {
        errors.lastName = 'Last name is required';
      }

      // Confirm password
      if (!data.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // Terms and privacy
      if (!data.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the Terms of Service';
      }
      if (!data.agreeToPrivacy) {
        errors.agreeToPrivacy = 'You must agree to the Privacy Policy';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  };

  // Update validation when form data changes
  useEffect(() => {
    const data = mode === 'login' ? loginData : signupData;
    setValidation(validateForm(data, mode === 'signup'));
  }, [loginData, signupData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const formValidation = validateForm(mode === 'login' ? loginData : signupData, mode === 'signup');
    if (!formValidation.isValid) {
      setValidation(formValidation);
      return;
    }

    try {
      if (mode === 'login') {
        await login(loginData.email, loginData.password);
      } else {
        await register({
          email: signupData.email,
          password: signupData.password,
          name: `${signupData.firstName} ${signupData.lastName}`
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    clearError();
    setValidation({ isValid: false, errors: {}, warnings: {} });
    setLoginData({ email: '', password: '' });
    setSignupData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      agreeToPrivacy: false
    });
  };

  const backgroundVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 1 }
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.2
      }
    }
  };

  const formVariants = {
    initial: { opacity: 0, x: mode === 'login' ? -20 : 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: mode === 'login' ? 20 : -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col justify-center items-center p-4 relative overflow-hidden"
      variants={backgroundVariants}
      initial="initial"
      animate="animate"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-200/30 to-teal-300/30 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-200/30 to-blue-300/30 rounded-full filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.div 
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6 shadow-lg"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-3">
          AI HeartBridge
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Your private space to connect, grow, and strengthen your relationship together
        </p>
      </motion.div>

      {/* Auth Card */}
      <motion.div 
        className="max-w-md w-full relative z-10"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <GlassmorphismCard variant="therapy" padding="lg">
          <GlassCardContent>
            {/* Mode Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-100/50 p-1 rounded-lg">
                <InteractiveAnimation hover tap>
                  <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                      mode === 'login'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Sign In
                  </button>
                </InteractiveAnimation>
                <InteractiveAnimation hover tap>
                  <button
                    onClick={() => setMode('signup')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                      mode === 'signup'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Sign Up
                  </button>
                </InteractiveAnimation>
              </div>
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                className="space-y-4"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <ModernInput
                        label="First Name"
                        type="text"
                        value={signupData.firstName}
                        onChange={(value) => setSignupData(prev => ({ ...prev, firstName: value }))}
                        error={validation.errors.firstName}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <ModernInput
                        label="Last Name"
                        type="text"
                        value={signupData.lastName}
                        onChange={(value) => setSignupData(prev => ({ ...prev, lastName: value }))}
                        error={validation.errors.lastName}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                )}

                <ModernInput
                  label="Email Address"
                  type="email"
                  value={mode === 'login' ? loginData.email : signupData.email}
                  onChange={(value) => {
                    if (mode === 'login') {
                      setLoginData(prev => ({ ...prev, email: value }));
                    } else {
                      setSignupData(prev => ({ ...prev, email: value }));
                    }
                  }}
                  error={validation.errors.email}
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <ModernInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={mode === 'login' ? loginData.password : signupData.password}
                  onChange={(value) => {
                    if (mode === 'login') {
                      setLoginData(prev => ({ ...prev, password: value }));
                    } else {
                      setSignupData(prev => ({ ...prev, password: value }));
                    }
                  }}
                  error={validation.errors.password}
                  warning={validation.warnings.password}
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create a strong password'}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                />

                {mode === 'signup' && (
                  <ModernInput
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupData.confirmPassword}
                    onChange={(value) => setSignupData(prev => ({ ...prev, confirmPassword: value }))}
                    error={validation.errors.confirmPassword}
                    placeholder="Confirm your password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    required
                  />
                )}

                {mode === 'signup' && (
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={signupData.agreeToTerms}
                        onChange={(e) => setSignupData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                        className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">
                          Terms of Service
                        </a>
                      </span>
                    </label>
                    {validation.errors.agreeToTerms && (
                      <p className="text-xs text-red-500 ml-7">{validation.errors.agreeToTerms}</p>
                    )}

                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={signupData.agreeToPrivacy}
                        onChange={(e) => setSignupData(prev => ({ ...prev, agreeToPrivacy: e.target.checked }))}
                        className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {validation.errors.agreeToPrivacy && (
                      <p className="text-xs text-red-500 ml-7">{validation.errors.agreeToPrivacy}</p>
                    )}
                  </div>
                )}

                {error && (
                  <motion.div
                    className="p-3 bg-red-50 border border-red-200 rounded-md"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                <AnimatedButton
                  type="submit"
                  variant="therapy"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !validation.isValid}
                  loading={isLoading}
                  leftIcon={mode === 'login' ? <Heart className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  animation="bounce"
                >
                  {mode === 'login' ? 'Sign In to HeartBridge' : 'Create Your Account'}
                </AnimatedButton>
              </motion.form>
            </AnimatePresence>
          </GlassCardContent>
        </GlassmorphismCard>

        {/* Switch Mode */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <InteractiveAnimation hover tap>
              <button
                onClick={toggleMode}
                className="ml-2 font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {mode === 'login' ? 'Sign up for free' : 'Sign in here'}
              </button>
            </InteractiveAnimation>
          </p>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs text-gray-600">Private & Secure</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xs text-gray-600">AI-Powered</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-xs text-gray-600">Built for Couples</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedAuthView;