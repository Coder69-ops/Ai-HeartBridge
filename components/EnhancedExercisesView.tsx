import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import ContextualLoader from './shared/ContextualLoader';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  Zap, 
  Star, 
  Clock,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle,
  Award,
  Calendar,
  BarChart3,
  Trophy,
  Activity,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Shield,
  ArrowRight,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { 
  getExercises, 
  getExerciseById, 
  completeExercise, 
  getCoupleExerciseProgress,
  getExerciseMetadata,
  ExerciseProgress 
} from '../services/exerciseService';

interface EnhancedExercisesViewProps {
  onBack: () => void;
}

type ViewMode = 'list' | 'tracking' | 'progress';

const EnhancedExercisesView: React.FC<EnhancedExercisesViewProps> = ({ onBack }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionData, setCompletionData] = useState({
    rating: 0,
    feedback: '',
    timeSpent: 0
  });
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [exerciseStats, setExerciseStats] = useState({
    totalCompleted: 0,
    thisWeek: 0,
    thisMonth: 0,
    averageRating: 0,
    streak: 0
  });

  // Categories with beautiful icons and colors
  const categories = [
    { id: 'all', label: 'All', icon: <Sparkles className="w-4 h-4" />, color: 'from-emerald-500 to-cyan-500' },
    { id: 'Connection', label: 'Connection', icon: <Heart className="w-4 h-4" />, color: 'from-pink-500 to-rose-500' },
    { id: 'Communication', label: 'Communication', icon: <MessageCircle className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
    { id: 'Conflict', label: 'Conflict', icon: <Zap className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
    { id: 'Intimacy', label: 'Intimacy', icon: <Users className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
  ];

  // Load exercises and progress data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [exercisesData, progressData] = await Promise.all([
          getExercises(),
          getCoupleExerciseProgress(1, 100).catch(() => ({ progress: [] })) // Fallback for unpaired users
        ]);
        
        setExercises(exercisesData);
        setExerciseProgress(progressData.progress);
        
        // Calculate stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const thisWeek = progressData.progress.filter(p => new Date(p.dateCompleted) >= weekAgo).length;
        const thisMonth = progressData.progress.filter(p => new Date(p.dateCompleted) >= monthAgo).length;
        const ratings = progressData.progress.filter(p => p.rating).map(p => p.rating!);
        const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        
        setExerciseStats({
          totalCompleted: progressData.progress.length,
          thisWeek,
          thisMonth,
          averageRating: Math.round(averageRating * 10) / 10,
          streak: calculateStreak(progressData.progress)
        });
      } catch (error) {
        console.error('Failed to load exercise data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateStreak = (progress: ExerciseProgress[]) => {
    if (progress.length === 0) return 0;
    
    const sortedDates = progress
      .map(p => new Date(p.dateCompleted))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      date.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (date.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleCompleteExercise = async () => {
    if (!selectedExercise) return;
    
    try {
      setIsCompleting(true);
      await completeExercise(selectedExercise.id, {
        rating: completionData.rating || undefined,
        feedback: completionData.feedback || undefined,
        timeSpent: completionData.timeSpent || undefined
      });
      
      setShowCompletionModal(false);
      setCompletionData({ rating: 0, feedback: '', timeSpent: 0 });
      
      // Reload progress data
      const progressData = await getCoupleExerciseProgress(1, 100).catch(() => ({ progress: [] }));
      setExerciseProgress(progressData.progress);
      
      // Update stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const thisWeek = progressData.progress.filter(p => new Date(p.dateCompleted) >= weekAgo).length;
      const thisMonth = progressData.progress.filter(p => new Date(p.dateCompleted) >= monthAgo).length;
      const ratings = progressData.progress.filter(p => p.rating).map(p => p.rating!);
      const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      
      setExerciseStats({
        totalCompleted: progressData.progress.length,
        thisWeek,
        thisMonth,
        averageRating: Math.round(averageRating * 10) / 10,
        streak: calculateStreak(progressData.progress)
      });
    } catch (error) {
      console.error('Failed to complete exercise:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.id === category) || categories[0];
  };

  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getExerciseProgress = (exerciseId: string) => {
    return exerciseProgress.filter(p => p.exerciseId === exerciseId);
  };

  if (isLoading) {
    return <ContextualLoader type="exercises" message="Loading relationship exercises..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Relationship Exercises</h1>
              <p className="text-white/80 text-xs sm:text-sm">Evidence-based activities to strengthen your bond</p>
            </div>
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation Tabs - Mobile Optimized */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 no-scrollbar mb-4 sm:mb-6">
            {[
              { id: 'list', label: 'Exercises', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'tracking', label: 'Tracking', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'progress', label: 'Progress', icon: <Trophy className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as ViewMode)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap transition-all ${
                  currentView === tab.id
                    ? 'bg-white shadow-lg scale-105 text-emerald-600 font-medium'
                    : 'bg-white/70 hover:bg-white hover:shadow-md text-gray-600'
                }`}
              >
                {tab.icon}
                <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-6">
        {currentView === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search Bar - Mobile Optimized */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative mb-4 sm:mb-6"
            >
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
              />
            </motion.div>

            {/* Category Pills - Mobile Optimized */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 no-scrollbar mb-4 sm:mb-6"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-white shadow-lg scale-105 text-emerald-600 font-medium'
                      : 'bg-white/70 hover:bg-white hover:shadow-md text-gray-600'
                  }`}
                >
                  <span className="w-3 h-3 sm:w-4 sm:h-4">{category.icon}</span>
                  <span className="text-xs sm:text-sm font-medium">{category.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Exercises Grid */}
            <AnimatePresence mode="wait">
              {filteredExercises.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 sm:py-12"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No exercises found</h3>
                  <p className="text-sm sm:text-base text-gray-600">Try adjusting your filters or search query</p>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedCategory + searchQuery}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  {filteredExercises.map((exercise, index) => {
                    const progress = getExerciseProgress(exercise.id);
                    const categoryInfo = getCategoryInfo(exercise.category);
                    
                    return (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                          onClick={() => {
                            setSelectedExercise(exercise);
                            setCurrentView('tracking');
                          }}
                        >
                          {/* Gradient Header */}
                          <div className={`h-2 bg-gradient-to-r ${categoryInfo.color}`} />
                          
                          <CardContent className="p-4 sm:p-5">
                            {/* Category Badge - Mobile Optimized */}
                            <div className="flex items-center justify-between mb-3">
                              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryInfo.color} text-white`}>
                                <span className="w-3 h-3 sm:w-4 sm:h-4">{categoryInfo.icon}</span>
                                <span className="text-xs sm:text-xs">{exercise.category}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </div>

                            {/* Title - Mobile Optimized */}
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                              {exercise.title}
                            </h3>

                            {/* Description - Mobile Optimized */}
                            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                              {exercise.description}
                            </p>

                            {/* Meta Info - Mobile Optimized */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              {/* Duration */}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="text-xs">{exercise.duration || '10-15 min'}</span>
                              </div>

                              {/* Difficulty */}
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
                                {exercise.difficulty}
                              </span>

                              {/* Progress Indicator */}
                              {progress.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                  <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  <span className="hidden sm:inline">Completed</span>
                                  <span className="sm:hidden">✓</span>
                                </div>
                              )}

                              {/* Is Recommended */}
                              {index < 3 && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                                  <span className="hidden sm:inline">Recommended</span>
                                  <span className="sm:hidden">⭐</span>
                                </div>
                              )}
                            </div>

                            {/* Hover Effect - Mobile Optimized */}
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Start exercise</span>
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentView === 'tracking' && selectedExercise && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Exercise Detail */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getCategoryInfo(selectedExercise.category).color} rounded-2xl flex items-center justify-center text-white`}>
                    {getCategoryInfo(selectedExercise.category).icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedExercise.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className={`px-3 py-1 rounded-full border ${getDifficultyColor(selectedExercise.difficulty)}`}>
                        {selectedExercise.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedExercise.duration || '10-15 min'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentView('list')}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-700 mb-6">{selectedExercise.description}</p>

              {/* Steps */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Steps</h3>
                {selectedExercise.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>

              {/* Complete Button */}
              <Button
                onClick={() => setShowCompletionModal(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark as Complete
              </Button>
            </Card>
          </motion.div>
        )}

        {currentView === 'progress' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-emerald-600 mb-1">{exerciseStats.totalCompleted}</div>
                <div className="text-sm text-gray-600">Total Completed</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">{exerciseStats.thisWeek}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">{exerciseStats.streak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">{exerciseStats.averageRating}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </Card>
            </div>

            {/* Recent Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exerciseProgress.length > 0 ? (
                  <div className="space-y-3">
                    {exerciseProgress.slice(0, 10).map((progress, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">Exercise Completed</div>
                            <div className="text-sm text-gray-600">
                              {new Date(progress.dateCompleted).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {progress.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < progress.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Progress Yet</h3>
                    <p className="text-gray-600 mb-4">Start completing exercises to track your progress!</p>
                    <Button
                      onClick={() => setCurrentView('list')}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                    >
                      Browse Exercises
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCompletionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Exercise</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating (Optional)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setCompletionData({ ...completionData, rating })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          completionData.rating >= rating
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Spent (minutes)</label>
                  <input
                    type="number"
                    value={completionData.timeSpent}
                    onChange={(e) => setCompletionData({ ...completionData, timeSpent: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback (Optional)</label>
                  <textarea
                    value={completionData.feedback}
                    onChange={(e) => setCompletionData({ ...completionData, feedback: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400"
                    rows={3}
                    placeholder="How did it go? What did you learn?"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCompletionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteExercise}
                  disabled={isCompleting}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                >
                  {isCompleting ? 'Completing...' : 'Complete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedExercisesView;
