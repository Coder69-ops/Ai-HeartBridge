// AI HeartBridge - Stunning Mobile-First Exercises View
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from '../types';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
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
  Target
} from 'lucide-react';

interface MasterExercisesViewProps {
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

const MasterExercisesView: React.FC<MasterExercisesViewProps> = ({ 
  exercises, 
  onSelectExercise 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories with beautiful icons and colors
  const categories = [
    { id: 'all', label: 'All', icon: <Sparkles className="w-4 h-4" />, color: 'from-emerald-500 to-cyan-500' },
    { id: 'Connection', label: 'Connection', icon: <Heart className="w-4 h-4" />, color: 'from-pink-500 to-rose-500' },
    { id: 'Communication', label: 'Communication', icon: <MessageCircle className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
    { id: 'Conflict', label: 'Conflict', icon: <Zap className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
    { id: 'Intimacy', label: 'Intimacy', icon: <Users className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
  ];

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.title.toLowerCase().includes(query) ||
        ex.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [exercises, selectedCategory, searchQuery]);

  // Get category info
  const getCategoryInfo = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat || categories[0];
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
          </div>

          {/* Search Bar - Mobile Optimized */}
          <div className="mt-4 sm:mt-6 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
            />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-6">
        {/* Category Pills - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
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
              <span className="text-xs sm:text-sm">{category.label}</span>
              {category.id !== 'all' && (
                <span className="text-xs bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {exercises.filter(ex => ex.category === category.id).length}
                </span>
              )}
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
                      onClick={() => onSelectExercise(exercise)}
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
                            <span className="text-xs">{exercise.duration}</span>
                          </div>

                          {/* Difficulty */}
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </span>

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

        {/* Stats Footer - Mobile Optimized */}
        {filteredExercises.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">{filteredExercises.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Available</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {filteredExercises.filter(ex => ex.difficulty === 'Beginner').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Beginner</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {categories.length - 1}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-rose-600">
                  {Math.floor(filteredExercises.length * 0.4)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Recommended</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MasterExercisesView;

