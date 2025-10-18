import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '../types';
import { analyzeEntries } from '../services/geminiService';
import { 
  ModernLoader,
  GlassmorphismCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  AnimatedButton,
  PageTransition,
  StaggeredAnimation,
  ScrollAnimation,
  InteractiveAnimation,
  PulseIndicator,
  BreathingAnimation,
  useToast,
  toast
} from '../src/components/ui/enhanced';
import { Sparkles, CheckCircle, Lightbulb, Heart, ArrowRight, TrendingUp, Shield } from 'lucide-react';

interface EnhancedCheckInViewProps {
  coupleId: string;
  journalId: string;
  onNavigate: (view: string) => void;
}

const EnhancedCheckInView: React.FC<EnhancedCheckInViewProps> = ({ 
  coupleId, 
  journalId, 
  onNavigate 
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const result = await analyzeEntries(coupleId, journalId);
        setAnalysis(result);
        
        // Show success notification
        showToast(toast.therapy(
          'Analysis Complete! 🎉',
          'Your relationship insights are ready to explore.'
        ));
        
        // Trigger celebration animation
        setTimeout(() => setShowCelebration(true), 1000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
        setError(errorMessage);
        showToast(toast.error('Analysis Failed', 'We encountered an issue generating your insights. Please try again.'));
      } finally {
        setLoading(false);
      }
    };

    getAnalysis();
  }, [coupleId, journalId, showToast]);

  const handleSectionNext = () => {
    if (currentSection < 2) {
      setCurrentSection(currentSection + 1);
    } else {
      onNavigate('dashboard');
    }
  };

  const handleSectionPrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  if (loading) {
    return (
      <PageTransition variant="therapy" timing="gentle">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50">
          <div className="text-center space-y-8 max-w-md">
            <BreathingAnimation duration={3} scale={1.05}>
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </BreathingAnimation>
            
            <StaggeredAnimation>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Analyzing Your Connection 💙
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Our AI is thoughtfully reviewing your reflections to create personalized insights...
                </p>
              </div>
              
              <ModernLoader
                variant="therapy"
                size="lg"
                text="Processing your shared journey..."
              />
              
              <div className="flex justify-center space-x-2 mt-8">
                <PulseIndicator active color="bg-emerald-500" />
                <PulseIndicator active color="bg-teal-500" />
                <PulseIndicator active color="bg-indigo-500" />
              </div>
            </StaggeredAnimation>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition variant="slideUp" timing="gentle">
        <div className="min-h-screen flex items-center justify-center px-4">
          <GlassmorphismCard variant="default" padding="lg" className="max-w-md text-center">
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                <Shield className="w-16 h-16 text-red-400 mx-auto" />
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-semibold text-red-800 mb-3">
                  Analysis Temporarily Unavailable
                </h2>
                <p className="text-red-700 mb-2">
                  We're sorry, but there was an issue generating your insights.
                </p>
                <p className="text-sm text-gray-600">
                  Error: {error}
                </p>
              </div>
              
              <div className="space-y-3">
                <AnimatedButton 
                  variant="primary" 
                  onClick={() => window.location.reload()}
                  leftIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Try Again
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="ghost" 
                  onClick={() => onNavigate('dashboard')}
                >
                  Return to Dashboard
                </AnimatedButton>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
      </PageTransition>
    );
  }
    
  if (!analysis) return null;

  const { summary, strengths, opportunities, repairPlan } = analysis;

  const sections = [
    {
      title: "Your Connection Summary",
      icon: <Heart className="w-8 h-8 text-emerald-600" />,
      content: (
        <div className="space-y-6">
          <ScrollAnimation variant="fadeIn">
            <p className="text-lg text-gray-700 leading-relaxed">
              {summary}
            </p>
          </ScrollAnimation>
          
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center space-x-3 mb-4">
              <PulseIndicator active color="bg-emerald-500" size="lg" />
              <h3 className="text-xl font-semibold text-emerald-800">
                Connection Status: Active
              </h3>
            </div>
            <p className="text-emerald-700">
              Your relationship shows healthy communication patterns and mutual respect.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Strengths & Growth",
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <ScrollAnimation variant="slideLeft">
            <GlassmorphismCard variant="therapy" padding="lg">
              <GlassCardHeader icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}>
                <GlassCardTitle className="text-lg text-emerald-800">
                  Communication Strengths
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <ul className="space-y-3">
                  {strengths.map((strength, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </GlassCardContent>
            </GlassmorphismCard>
          </ScrollAnimation>
          
          <ScrollAnimation variant="slideRight">
            <GlassmorphismCard variant="calm" padding="lg">
              <GlassCardHeader icon={<Lightbulb className="w-6 h-6 text-amber-500" />}>
                <GlassCardTitle className="text-lg text-amber-800">
                  Growth Opportunities
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <ul className="space-y-3">
                  {opportunities.map((opportunity, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{opportunity}</span>
                    </motion.li>
                  ))}
                </ul>
              </GlassCardContent>
            </GlassmorphismCard>
          </ScrollAnimation>
        </div>
      )
    },
    {
      title: "Your Personalized Action Plan",
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="space-y-6">
          <ScrollAnimation variant="scaleIn">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                A 3-Step Guide to Deeper Connection
              </h3>
              <p className="text-gray-600">
                Personalized actions based on your unique relationship dynamics
              </p>
            </div>
          </ScrollAnimation>
          
          <StaggeredAnimation staggerDelay={0.2}>
            {repairPlan.map((step, index) => (
              <InteractiveAnimation key={index} hover tap>
                <div className="flex items-start space-x-6 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
                  <motion.div 
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                      {index + 1}
                    </div>
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              </InteractiveAnimation>
            ))}
          </StaggeredAnimation>
        </div>
      )
    }
  ];

  return (
    <PageTransition variant="therapy" timing="gentle">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header with celebration animation */}
          <div className="text-center mb-12 relative">
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                      style={{
                        left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 100}%`,
                        top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 100}%`
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-center mb-6">
                {sections[currentSection].icon}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Your Shared Insights
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the beautiful patterns in your relationship and your path forward together
              </p>
            </motion.div>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-3">
              {sections.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSection 
                      ? 'bg-emerald-500 w-8' 
                      : index < currentSection 
                        ? 'bg-emerald-300' 
                        : 'bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>

          {/* Section content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <GlassmorphismCard variant="default" padding="xl" className="mb-8">
                <GlassCardHeader>
                  <GlassCardTitle className="text-2xl text-center">
                    {sections[currentSection].title}
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  {sections[currentSection].content}
                </GlassCardContent>
              </GlassmorphismCard>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <AnimatedButton
              variant="ghost"
              onClick={handleSectionPrev}
              disabled={currentSection === 0}
              className={currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Previous
            </AnimatedButton>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                {currentSection + 1} of {sections.length}
              </p>
            </div>

            <AnimatedButton
              variant={currentSection === sections.length - 1 ? "therapy" : "primary"}
              onClick={handleSectionNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              animation="bounce"
            >
              {currentSection === sections.length - 1 ? 'Complete' : 'Next'}
            </AnimatedButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default EnhancedCheckInView;