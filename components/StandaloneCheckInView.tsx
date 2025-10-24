import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import ContextualLoader from './shared/ContextualLoader';
import { 
  Activity, 
  Target, 
  Calendar, 
  BarChart3, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Heart, 
  TrendingUp, 
  Zap,
  Clock,
  Star,
  Award,
  Sparkles
} from 'lucide-react';
import { createCheckIn, submitCheckInResponses, CheckInWithQuestions } from '../services/checkInService';

interface StandaloneCheckInViewProps {
  coupleId: string;
  onNavigate: (view: string) => void;
}

type CheckInType = 'CSI-4' | 'CSI-16' | 'weekly' | 'monthly';
type CheckInStep = 'selection' | 'questions' | 'results';

const StandaloneCheckInView: React.FC<StandaloneCheckInViewProps> = ({ 
  coupleId, 
  onNavigate 
}) => {
  const [currentStep, setCurrentStep] = useState<CheckInStep>('selection');
  const [selectedType, setSelectedType] = useState<CheckInType | null>(null);
  const [checkIn, setCheckIn] = useState<CheckInWithQuestions | null>(null);
  const [responses, setResponses] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const checkInTypes = [
    {
      id: 'CSI-4' as CheckInType,
      name: 'Quick Check-in',
      description: '4 questions, 2 minutes',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      questions: 4,
      time: '2 min'
    },
    {
      id: 'CSI-16' as CheckInType,
      name: 'Deep Assessment',
      description: '16 questions, 10 minutes',
      icon: Target,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50',
      questions: 16,
      time: '10 min'
    },
    {
      id: 'weekly' as CheckInType,
      name: 'Weekly Review',
      description: 'Weekly relationship check',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      questions: 8,
      time: '5 min'
    },
    {
      id: 'monthly' as CheckInType,
      name: 'Monthly Review',
      description: 'Comprehensive monthly assessment',
      icon: BarChart3,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50',
      questions: 12,
      time: '8 min'
    }
  ];

  const handleTypeSelection = async (type: CheckInType) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedType(type);
      
      const newCheckIn = await createCheckIn(type);
      setCheckIn(newCheckIn);
      setResponses(new Array(newCheckIn.questions.length).fill(0));
      setCurrentStep('questions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionIndex: number, response: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = response;
    setResponses(newResponses);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < checkIn!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!checkIn || responses.some(r => r === 0)) {
      setError('Please answer all questions');
      return;
    }

    try {
      setLoading(true);
      const result = await submitCheckInResponses(checkIn.id, responses, notes);
      setScore(result.score);
      setCurrentStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "🌟 Excellent! Your relationship is thriving.";
    if (score >= 60) return "💪 Good progress! Keep building your connection.";
    if (score >= 40) return "🌱 Room for growth. Try more communication exercises.";
    return "💝 Every relationship can grow. Start with daily check-ins.";
  };

  if (loading && currentStep === 'selection') {
    return <ContextualLoader type="checkin" message="Preparing your relationship assessment..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mb-4 shadow-lg">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Relationship Check-in
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            {currentStep === 'selection' && 'Choose your assessment type to get started'}
            {currentStep === 'questions' && `Answer ${checkIn?.questions.length} questions about your relationship`}
            {currentStep === 'results' && 'Your relationship assessment results'}
          </p>
        </motion.div>

        {/* Step 1: Type Selection */}
        {currentStep === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          >
            {checkInTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${type.bgColor} border-0`}
                    onClick={() => handleTypeSelection(type.id)}
                  >
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${type.color} rounded-full flex items-center justify-center`}>
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                            {type.name}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {type.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>{type.questions} questions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{type.time}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Step 2: Questions */}
        {currentStep === 'questions' && checkIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    Question {currentQuestion + 1} of {checkIn.questions.length}
                  </CardTitle>
                  <div className="text-sm">
                    {Math.round(((currentQuestion + 1) / checkIn.questions.length) * 100)}%
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / checkIn.questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-full h-2"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                    {checkIn.questions[currentQuestion]}
                  </h3>
                  
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label
                        key={value}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          responses[currentQuestion] === value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={value}
                          checked={responses[currentQuestion] === value}
                          onChange={() => handleResponseChange(currentQuestion, value)}
                          className="w-4 h-4 text-emerald-600"
                        />
                        <span className="text-gray-700 font-medium">
                          {value === 1 && 'Strongly Disagree'}
                          {value === 2 && 'Disagree'}
                          {value === 3 && 'Neutral'}
                          {value === 4 && 'Agree'}
                          {value === 5 && 'Strongly Agree'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentQuestion === checkIn.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Assessment
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={responses[currentQuestion] === 0}
                      className="w-full sm:w-auto"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {currentStep === 'results' && score !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-cyan-50">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-t-xl">
                <CardTitle className="text-xl sm:text-2xl font-bold text-center">
                  🎉 Assessment Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className={`text-4xl sm:text-5xl font-bold mb-2 ${getScoreColor(score)}`}>
                    {score}/100
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-3 rounded-full ${
                        score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        score >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                        'bg-gradient-to-r from-red-500 to-rose-500'
                      }`}
                    />
                  </div>
                  <p className="text-lg text-gray-700 mb-6">
                    {getScoreMessage(score)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white/60 rounded-lg text-center">
                    <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="font-semibold text-gray-800">Relationship Health</div>
                    <div className="text-sm text-gray-600">Based on your responses</div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-lg text-center">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="font-semibold text-gray-800">Assessment Type</div>
                    <div className="text-sm text-gray-600">{selectedType}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => onNavigate('trends')}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Insights
                  </Button>
                  <Button
                    onClick={() => onNavigate('dashboard')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mt-6"
          >
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">⚠️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Back Button */}
        {currentStep !== 'selection' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6"
          >
            <Button
              onClick={() => {
                if (currentStep === 'questions') {
                  setCurrentStep('selection');
                } else {
                  onNavigate('dashboard');
                }
              }}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 'questions' ? 'Back to Selection' : 'Back to Dashboard'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StandaloneCheckInView;
