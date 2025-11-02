import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Lightbulb,
  Target,
  Activity,
  Sparkles,
  Clock,
  Users,
  MessageCircle,
  Star,
  Shield,
  Eye,
  Pause,
  Camera,
  Map,
  Compass,
  Thermometer,
  Mail,
  BookOpen,
  CloudSun,
  TrendingUp,
  Umbrella,
  Battery,
  PartyPopper,
  ShieldCheck,
  Wrench,
  HelpCircle,
  Languages,
  Smartphone
} from 'lucide-react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { GorgeousLoader } from './shared/GorgeousLoader';
import { getPersonalizedBridgeRecommendations, BridgeRecommendation, RecommendationAnalysis } from '../services/bridgeRecommendationService';

// Icon mapping for exercise icons
const getExerciseIcon = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'heart': Heart,
    'alert-circle': AlertCircle,
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    'check': CheckCircle,
    'lightbulb': Lightbulb,
    'sparkles': Sparkles,
    'users': Users,
    'clock': Clock,
    'pause': Pause,
    'star': Star,
    'camera': Camera,
    'heart-pulse': Activity,
    'compass': Compass,
    'tools': Wrench,
    'shield': Shield,
    'hand-heart': Heart,
    'compass-outline': Compass,
    'thermometer': Thermometer,
    'camera-retro': Camera,
    'telescope': Target,
    'leaf': Activity,
    'question-mark': HelpCircle,
    'helping-hand': Heart,
    'language': Languages,
    'heart-handshake': Heart,
    'smartphone-off': Smartphone,
    'battery': Battery,
    'party': PartyPopper,
    'shield-check': ShieldCheck,
    'messages': MessageCircle,
    'umbrella': Umbrella,
    'trending-up': TrendingUp,
    'treasure-chest': Star,
    'timeline': Activity,
    'cloud-sun': Activity,
    'mail': Mail,
    'book-open': BookOpen,
    'eye': Eye,
    'map': Map,
  };
  
  return iconMap[iconName] || Heart;
};

interface PersonalizedBridgesViewProps {
  onSelectExercise: (exerciseId: string) => void;
  onBack: () => void;
}

export const PersonalizedBridgesView: React.FC<PersonalizedBridgesViewProps> = ({
  onSelectExercise,
  onBack,
}) => {
  const [analysis, setAnalysis] = useState<RecommendationAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPersonalizedBridgeRecommendations();
      setAnalysis(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load personalized recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'text-red-700 bg-red-100';
      case 'improvement': return 'text-blue-700 bg-blue-100';
      case 'maintenance': return 'text-green-700 bg-green-100';
      case 'growth': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const filteredRecommendations = analysis?.recommendations.filter(rec => 
    selectedCategory === 'all' || rec.category === selectedCategory
  ) || [];

  const categories = ['all', 'urgent', 'improvement', 'maintenance', 'growth'];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <GorgeousLoader />
          <p className="mt-4 text-gray-600">Analyzing your relationship data...</p>
          <p className="text-sm text-gray-500 mt-2">Creating personalized bridge recommendations</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Recommendations</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadRecommendations} variant="default">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Available</h3>
          <p className="text-gray-600">Complete some check-ins or journal entries to get personalized recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Your Personalized Bridges
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered exercise recommendations based on your relationship data
          </p>
        </div>
        <Button onClick={onBack} variant="secondary" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* User Insights Summary */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Health Status</h3>
            <p className="text-sm text-gray-600">{analysis.userInsights.healthStatus}</p>
          </div>
          
          {analysis.userInsights.strengths.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Strengths</h3>
              <ul className="text-sm text-green-600 space-y-1">
                {analysis.userInsights.strengths.slice(0, 3).map((strength, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.userInsights.primaryConcerns.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Areas to Focus</h3>
              <ul className="text-sm text-amber-600 space-y-1">
                {analysis.userInsights.primaryConcerns.slice(0, 3).map((concern, index) => (
                  <li key={index} className="flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0" />
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>{analysis.recommendationSummary.totalRecommendations} recommendations</span>
            <span>{analysis.recommendationSummary.highPriority} high priority</span>
            <span>{analysis.recommendationSummary.categoriesAdressed.length} categories addressed</span>
            <span className="text-therapy-calm font-medium">
              {analysis.recommendationSummary.estimatedImpact} potential impact
            </span>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-therapy-calm text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
            {category === 'all' && ` (${analysis.recommendations.length})`}
            {category !== 'all' && 
              ` (${analysis.recommendations.filter(r => r.category === category).length})`
            }
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <RecommendationCard
                recommendation={recommendation}
                onSelect={() => onSelectExercise(recommendation.exercise.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {selectedCategory} recommendations
          </h3>
          <p className="text-gray-600">Try selecting a different category.</p>
        </div>
      )}
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: BridgeRecommendation;
  onSelect: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onSelect 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'text-red-700 bg-red-100';
      case 'improvement': return 'text-blue-700 bg-blue-100';
      case 'maintenance': return 'text-green-700 bg-green-100';
      case 'growth': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {React.createElement(getExerciseIcon(recommendation.exercise.icon), {
              className: "w-8 h-8 text-therapy-calm"
            })}
            <div>
              <h3 className="font-semibold text-gray-900">
                {recommendation.exercise.title}
              </h3>
              <p className="text-sm text-gray-600">
                {recommendation.exercise.category}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
              {recommendation.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
              {recommendation.category}
            </span>
          </div>
        </div>

        {/* Match Score */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-therapy-calm h-2 rounded-full transition-all duration-300"
              style={{ width: `${recommendation.matchScore}%` }}
            />
          </div>
          <span className="text-sm font-medium text-therapy-calm">
            {recommendation.matchScore}% match
          </span>
        </div>

        {/* Reason */}
        <p className="text-sm text-gray-700 leading-relaxed">
          {recommendation.reason}
        </p>

        {/* Key Insights Preview */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
            Why This Helps
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {recommendation.insights.slice(0, 2).map((insight, index) => (
              <li key={index} className="flex items-start">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t border-gray-200"
            >
              {/* Benefits */}
              <div>
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Expected Benefits
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {recommendation.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exercise Description */}
              <div>
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Exercise Overview
                </h4>
                <p className="text-sm text-gray-600">
                  {recommendation.exercise.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-therapy-calm font-medium hover:text-therapy-calm/80 transition-colors"
          >
            {showDetails ? 'Show Less' : 'Show Details'}
          </button>
          
          <Button onClick={onSelect} variant="default" size="sm">
            Start Exercise
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
};