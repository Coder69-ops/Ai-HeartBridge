import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './Card';
import { 
  Brain, 
  Heart, 
  MessageCircle, 
  BarChart3, 
  Shield, 
  Users, 
  BookOpen, 
  Activity,
  Zap,
  TrendingUp,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

interface ContextualLoaderProps {
  type: 'journal' | 'insights' | 'chat' | 'analytics' | 'safety' | 'pairing' | 'checkin' | 'exercises' | 'dashboard' | 'general';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ContextualLoader: React.FC<ContextualLoaderProps> = ({ 
  type, 
  message, 
  size = 'lg',
  className = ''
}) => {
  const getLoaderConfig = () => {
    switch (type) {
      case 'journal':
        return {
          icon: BookOpen,
          color: 'from-emerald-500 to-cyan-500',
          bgColor: 'from-emerald-50 to-cyan-50',
          defaultMessage: 'Preparing your journal session...',
          messages: [
            'Setting up your reflection space...',
            'Preparing thoughtful prompts...',
            'Creating a safe space for sharing...',
            'Getting ready for your journey...'
          ]
        };
      
      case 'insights':
        return {
          icon: Brain,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'from-purple-50 to-pink-50',
          defaultMessage: 'Analyzing your relationship insights...',
          messages: [
            'Processing your reflections...',
            'Analyzing communication patterns...',
            'Generating personalized insights...',
            'Preparing your relationship analysis...'
          ]
        };
      
      case 'chat':
        return {
          icon: MessageCircle,
          color: 'from-blue-500 to-indigo-500',
          bgColor: 'from-blue-50 to-indigo-50',
          defaultMessage: 'Connecting to AI counselor...',
          messages: [
            'Starting your conversation...',
            'Preparing thoughtful responses...',
            'Connecting with your AI counselor...',
            'Setting up your chat session...'
          ]
        };
      
      case 'analytics':
        return {
          icon: BarChart3,
          color: 'from-green-500 to-emerald-500',
          bgColor: 'from-green-50 to-emerald-50',
          defaultMessage: 'Calculating relationship metrics...',
          messages: [
            'Analyzing your relationship data...',
            'Calculating health scores...',
            'Processing trend data...',
            'Preparing your analytics dashboard...'
          ]
        };
      
      case 'safety':
        return {
          icon: Shield,
          color: 'from-red-500 to-rose-500',
          bgColor: 'from-red-50 to-rose-50',
          defaultMessage: 'Loading safety resources...',
          messages: [
            'Preparing safety information...',
            'Loading crisis resources...',
            'Setting up support contacts...',
            'Getting safety tools ready...'
          ]
        };
      
      case 'pairing':
        return {
          icon: Users,
          color: 'from-cyan-500 to-blue-500',
          bgColor: 'from-cyan-50 to-blue-50',
          defaultMessage: 'Setting up partner connection...',
          messages: [
            'Preparing pairing process...',
            'Generating secure connection...',
            'Setting up partner verification...',
            'Creating your couple profile...'
          ]
        };
      
      case 'checkin':
        return {
          icon: CheckCircle,
          color: 'from-orange-500 to-yellow-500',
          bgColor: 'from-orange-50 to-yellow-50',
          defaultMessage: 'Preparing your check-in...',
          messages: [
            'Loading assessment questions...',
            'Preparing your relationship survey...',
            'Setting up your check-in session...',
            'Getting your personalized questions...'
          ]
        };
      
      case 'exercises':
        return {
          icon: Activity,
          color: 'from-indigo-500 to-purple-500',
          bgColor: 'from-indigo-50 to-purple-50',
          defaultMessage: 'Loading relationship exercises...',
          messages: [
            'Preparing evidence-based activities...',
            'Loading exercise library...',
            'Setting up your practice space...',
            'Getting your relationship tools ready...'
          ]
        };
      
      case 'dashboard':
        return {
          icon: TrendingUp,
          color: 'from-emerald-500 to-teal-500',
          bgColor: 'from-emerald-50 to-teal-50',
          defaultMessage: 'Loading your dashboard...',
          messages: [
            'Preparing your relationship overview...',
            'Loading your progress data...',
            'Setting up your dashboard...',
            'Getting your insights ready...'
          ]
        };
      
      default:
        return {
          icon: Lightbulb,
          color: 'from-gray-500 to-slate-500',
          bgColor: 'from-gray-50 to-slate-50',
          defaultMessage: 'Loading...',
          messages: [
            'Please wait...',
            'Loading content...',
            'Preparing...',
            'Almost ready...'
          ]
        };
    }
  };

  const config = getLoaderConfig();
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgColor} flex items-center justify-center p-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 1,
            ease: "easeInOut"
          }}
          className={`${sizeClasses[size]} mx-auto mb-6 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center shadow-lg`}
        >
          <Icon className={`${iconSizeClasses[size]} text-white`} />
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">
            {displayMessage}
          </h2>
          
          {/* Animated Dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 w-64 mx-auto"
        >
          <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
              style={{ width: '30%' }}
            />
          </div>
        </motion.div>

        {/* Contextual Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 max-w-md mx-auto"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 text-center">
                {type === 'journal' && "Take your time to reflect deeply on your relationship."}
                {type === 'insights' && "Our AI is analyzing patterns to provide personalized insights."}
                {type === 'chat' && "Your AI counselor is ready to listen and support you."}
                {type === 'analytics' && "We're processing your relationship data to show meaningful trends."}
                {type === 'safety' && "Your safety and wellbeing are our top priority."}
                {type === 'pairing' && "We're creating a secure connection between you and your partner."}
                {type === 'checkin' && "These questions help us understand your relationship better."}
                {type === 'exercises' && "Evidence-based activities designed to strengthen your bond."}
                {type === 'dashboard' && "Your personalized relationship overview is being prepared."}
                {type === 'general' && "Please wait while we prepare everything for you."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContextualLoader;
