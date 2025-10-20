
import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import Icon from './shared/Icon';

interface ExercisesViewProps {
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

interface SmartRecommendation {
  exercise: Exercise;
  aiRationale: string;
  difficultyScore: number;
  impactPrediction: string;
  isRecommended: boolean;
}

const ExercisesView: React.FC<ExercisesViewProps> = ({ exercises, onSelectExercise }) => {
    const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Generate AI-powered recommendations
    useEffect(() => {
        const generateRecommendations = () => {
            // Simulate AI analysis based on relationship patterns
            const smartRecommendations: SmartRecommendation[] = exercises.map(exercise => {
                // Simple AI logic for demonstration - in real app, this would call an API
                const isRecommended = Math.random() > 0.4; // 60% chance of recommendation
                const difficultyScore = Math.floor(Math.random() * 5) + 1;
                
                let aiRationale = '';
                let impactPrediction = '';
                
                switch (exercise.category) {
                    case 'Connection':
                        aiRationale = isRecommended 
                            ? "Based on your communication patterns, building appreciation habits could strengthen your bond 💝"
                            : "Consider this when ready to deepen emotional intimacy";
                        impactPrediction = "High positive impact on relationship satisfaction";
                        break;
                    case 'Conflict':
                        aiRationale = isRecommended
                            ? "Your recent reflections suggest this could help transform difficult conversations 🌱"
                            : "Useful for future conflict resolution skills";
                        impactPrediction = "Significant improvement in communication quality";
                        break;
                    case 'Communication':
                        aiRationale = isRecommended
                            ? "This aligns with your goal of more open, regular connection 💙"
                            : "Great for establishing communication routines";
                        impactPrediction = "Steady improvement in understanding each other";
                        break;
                    default:
                        aiRationale = "A valuable exercise for relationship growth";
                        impactPrediction = "Positive impact on relationship dynamics";
                }

                return {
                    exercise,
                    aiRationale,
                    difficultyScore,
                    impactPrediction,
                    isRecommended
                };
            });

            // Sort: recommended first, then by difficulty
            smartRecommendations.sort((a, b) => {
                if (a.isRecommended && !b.isRecommended) return -1;
                if (!a.isRecommended && b.isRecommended) return 1;
                return a.difficultyScore - b.difficultyScore;
            });

            setRecommendations(smartRecommendations);
            setIsLoading(false);
        };

        // Simulate API call delay
        setTimeout(generateRecommendations, 1500);
    }, [exercises]);

    const filteredRecommendations = filterCategory === 'all' 
        ? recommendations 
        : recommendations.filter(rec => rec.exercise.category === filterCategory);

    const categories = ['all', ...Array.from(new Set(exercises.map(ex => ex.category)))];

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                <Card variant="therapy" className="text-center animate-pulse">
                    <CardHeader>
                        <CardTitle className="text-therapy-calm">
                            🌟 AI is analyzing your relationship patterns...
                        </CardTitle>
                        <p className="text-neutral-600">
                            Personalizing exercise recommendations just for you
                        </p>
                    </CardHeader>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                                <div className="h-8 bg-neutral-200 rounded mb-4"></div>
                                <div className="h-16 bg-neutral-200 rounded mb-4"></div>
                                <div className="h-10 bg-neutral-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Header with AI Insights - Mobile Optimized */}
            <Card variant="therapy" className="text-center animate-fade-in">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-2xl sm:text-3xl text-therapy-calm">
                        🌟 Personalized Exercises for You
                    </CardTitle>
                    <p className="text-neutral-600 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base">
                        Based on your relationship patterns and goals, these evidence-based exercises are tailored to help you build stronger communication and deeper connection.
                    </p>
                    
                    {/* Quick Stats - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-4 sm:mt-6 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-therapy-growth">
                            <Icon name="target" className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{recommendations.filter(r => r.isRecommended).length} AI Recommended</span>
                        </div>
                        <div className="flex items-center gap-2 text-therapy-calm">
                            <Icon name="book-open" className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{exercises.length} Total Exercises</span>
                        </div>
                        <div className="flex items-center gap-2 text-therapy-warmth">
                            <Icon name="trending-up" className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Evidence-Based</span>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Category Filter - Mobile Optimized */}
            <Card className="animate-slide-in-up">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={filterCategory === category ? "therapy" : "outline"}
                                size="sm"
                                onClick={() => setFilterCategory(category)}
                                className="capitalize text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Exercises Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredRecommendations.map((recommendation, index) => (
                    <Card 
                        key={recommendation.exercise.id} 
                        variant={recommendation.isRecommended ? "therapy" : "default"}
                        interactive={true}
                        className="flex flex-col animate-scale-in hover:shadow-xl transition-all duration-300"
                        style={{animationDelay: `${index * 0.1}s`}}
                    >
                        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                            {/* Recommended Badge - Mobile Optimized */}
                            {recommendation.isRecommended && (
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 px-2 sm:px-3 py-1 bg-therapy-growth/10 rounded-full text-therapy-growth text-xs font-medium">
                                    <Icon name="sparkles" className="w-3 h-3" />
                                    <span className="text-xs">AI Recommended</span>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-therapy-calm/10 p-2 sm:p-3 rounded-full flex-shrink-0">
                                    <Icon name={recommendation.exercise.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-therapy-calm" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-therapy-warmth uppercase tracking-wide">
                                        {recommendation.exercise.category}
                                    </p>
                                    <CardTitle className="text-base sm:text-lg line-clamp-2">{recommendation.exercise.title}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="flex-grow space-y-3 sm:space-y-4 p-4 sm:p-6">
                            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                {recommendation.exercise.description}
                            </p>
                            
                            {/* AI Insights - Mobile Optimized */}
                            {recommendation.isRecommended && (
                                <div className="p-2 sm:p-3 bg-therapy-calm/5 rounded-lg border border-therapy-calm/20">
                                    <p className="text-xs text-therapy-calm font-medium mb-1">💡 AI Insight</p>
                                    <p className="text-xs text-neutral-600 line-clamp-2">{recommendation.aiRationale}</p>
                                </div>
                            )}
                            
                            {/* Exercise Stats - Mobile Optimized */}
                            <div className="flex justify-between items-center text-xs text-neutral-500">
                                <div className="flex items-center gap-1">
                                    <Icon name="clock" className="w-3 h-3" />
                                    <span className="text-xs">Difficulty: {recommendation.difficultyScore}/5</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Icon name="heart" className="w-3 h-3" />
                                    <span className="text-xs">High Impact</span>
                                </div>
                            </div>
                            
                            <Button
                                onClick={() => onSelectExercise(recommendation.exercise)}
                                variant={recommendation.isRecommended ? "therapy" : "outline"}
                                className="w-full mt-3 sm:mt-4 therapy-button text-xs sm:text-sm py-2 sm:py-2.5"
                            >
                                {recommendation.isRecommended ? "🌟 Start Recommended" : "View Exercise"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Help Text - Mobile Optimized */}
            <Card variant="calm" className="text-center">
                <CardContent className="py-4 sm:py-6 px-4 sm:px-6">
                    <p className="text-neutral-600 text-xs sm:text-sm">
                        💙 Each exercise is designed to be done together. Take your time, be patient with each other, and remember that small steps lead to big changes.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExercisesView;