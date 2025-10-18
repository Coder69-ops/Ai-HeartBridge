// AI HeartBridge - Stunning Mobile-First Exercise Detail
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from '../types';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import { 
  ArrowLeft,
  Clock,
  Star,
  CheckCircle,
  Heart,
  Users,
  MessageCircle,
  Zap,
  Target,
  Play,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface MasterExerciseDetailViewProps {
  exercise: Exercise;
  onNavigate: (view: string) => void;
}

const MasterExerciseDetailView: React.FC<MasterExerciseDetailViewProps> = ({ 
  exercise, 
  onNavigate 
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isStarted, setIsStarted] = useState(false);

  // Toggle step completion
  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  // Get category config
  const getCategoryConfig = (category: string) => {
    const configs = {
      'Connection': { 
        icon: <Heart className="w-6 h-6" />, 
        color: 'from-pink-500 to-rose-500',
        bgColor: 'bg-pink-50'
      },
      'Communication': { 
        icon: <MessageCircle className="w-6 h-6" />, 
        color: 'from-blue-500 to-indigo-500',
        bgColor: 'bg-blue-50'
      },
      'Conflict': { 
        icon: <Zap className="w-6 h-6" />, 
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-50'
      },
      'Intimacy': { 
        icon: <Users className="w-6 h-6" />, 
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50'
      },
    };
    return configs[category as keyof typeof configs] || configs['Connection'];
  };

  const categoryConfig = getCategoryConfig(exercise.category);
  const progress = exercise.steps.length > 0 
    ? (completedSteps.length / exercise.steps.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Back Button - Fixed */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => onNavigate('exercises')}
          className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Exercises</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className={`${categoryConfig.bgColor} px-4 sm:px-6 lg:px-8 pt-8 pb-12`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Category Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${categoryConfig.color} text-white mb-4 shadow-lg`}>
            {categoryConfig.icon}
            <span className="font-medium">{exercise.category}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {exercise.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-700 mb-6">
            {exercise.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{exercise.duration}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
              <Target className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{exercise.difficulty}</span>
            </div>
            {completedSteps.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-sm">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
              </div>
            )}
          </div>

          {/* Start Button */}
          {!isStarted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Button
                onClick={() => setIsStarted(true)}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-xl text-lg px-8 py-4"
                size="lg"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Exercise
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Progress Card */}
        <AnimatePresence>
          {isStarted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-6 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${categoryConfig.color}`} style={{ width: `${progress}%` }} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
                    <span className="text-2xl font-bold text-emerald-600">
                      {completedSteps.length}/{exercise.steps.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {completedSteps.length === exercise.steps.length
                      ? '🎉 Exercise completed! Great work!'
                      : `Keep going! ${exercise.steps.length - completedSteps.length} steps remaining`}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

            {/* Steps */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                  How to Practice
                </h2>

                <div className="space-y-3">
                  {exercise.steps.map((step, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => toggleStep(index)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                        completedSteps.includes(index)
                          ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-300'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Step Number */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          completedSteps.includes(index)
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                            : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                        }`}>
                          {completedSteps.includes(index) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium transition-all ${
                            completedSteps.includes(index)
                              ? 'text-gray-500 line-through'
                              : 'text-gray-800'
                          }`}>
                            {step}
                          </p>
                        </div>

                        {/* Checkmark Icon */}
                        {completedSteps.includes(index) && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex-shrink-0"
                          >
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

            {/* Completion Action */}
            <AnimatePresence>
              {completedSteps.length === exercise.steps.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl text-white text-center"
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 fill-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Exercise Complete!</h3>
                  <p className="text-white/90 mb-4">
                    Amazing work! You've completed this exercise.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate('exercises')}
                    className="bg-white text-emerald-600 hover:bg-gray-50 border-0"
                  >
                    Back to Exercises
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Why This Exercise Works</h3>
            <div className="space-y-3">
              {[
                'Strengthens emotional connection',
                'Improves communication skills',
                'Builds trust and understanding',
                'Evidence-based approach',
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterExerciseDetailView;

