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
          getCoupleExerciseProgress(1, 100) // Get more progress data for stats
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
      const progressData = await getCoupleExerciseProgress(1, 100);
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
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Relationship Exercises</h1>
                <p className="text-white/80 text-sm sm:text-base">Evidence-based activities to strengthen your bond</p>
              </div>
            </div>
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'list', label: 'Exercises', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'tracking', label: 'Tracking', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'progress', label: 'Progress', icon: <Trophy className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  currentView === tab.id
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-8">
        {currentView === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search exercises..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                        selectedCategory === category.id
                          ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {category.icon}
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredExercises.map((exercise, index) => {
                const progress = getExerciseProgress(exercise.id);
                const categoryInfo = getCategoryInfo(exercise.category);
                
                return (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${categoryInfo.color} rounded-xl flex items-center justify-center text-white`}>
                            {categoryInfo.icon}
                          </div>
                          <div className="flex items-center gap-2">
                            {progress.length > 0 && (
                              <div className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">{progress.length}</span>
                              </div>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
                              {exercise.difficulty}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                          {exercise.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {exercise.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{exercise.duration || '10-15 min'}</span>
                          </div>
                          
                          <Button
                            onClick={() => {
                              setSelectedExercise(exercise);
                              setCurrentView('tracking');
                            }}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
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
