// AI HeartBridge - Stunning Mobile-First Check-In Results
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '../types';
import { analyzeEntries } from '../services/geminiService';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import { GorgeousLoader } from './shared/GorgeousLoader';
import { 
  Sparkles,
  Heart,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  Star
} from 'lucide-react';

interface MasterCheckInViewProps {
  coupleId: string;
  journalId: string;
  onNavigate: (view: string) => void;
}

const MasterCheckInView: React.FC<MasterCheckInViewProps> = ({ 
  coupleId, 
  journalId, 
  onNavigate 
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const result = await analyzeEntries(coupleId, journalId);
        setAnalysis(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    };

    getAnalysis();
  }, [coupleId, journalId]);

  if (loading) {
    return (
      <GorgeousLoader 
        message="Creating personalized insights..."
        type="analysis"
        size="lg"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Analysis Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => onNavigate('dashboard')} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  const sections = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Strengths',
      color: 'from-pink-500 to-rose-500',
      items: analysis.strengths
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Growth Areas',
      color: 'from-amber-500 to-orange-500',
      items: analysis.growthAreas
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Recommendations',
      color: 'from-purple-500 to-pink-500',
      items: analysis.recommendations
    }
  ];

  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentSectionData.color} text-white px-4 sm:px-6 lg:px-8 pt-6 pb-16`}>
        <motion.div 
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
          >
            {currentSectionData.icon}
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Your {currentSectionData.title}
          </h1>
          <p className="text-white/90">
            {currentSection === 0 && "Celebrate what's working well"}
            {currentSection === 1 && "Opportunities to grow together"}
            {currentSection === 2 && "Personalized guidance for your journey"}
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-12">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Section {currentSection + 1} of {sections.length}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(((currentSection + 1) / sections.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${currentSectionData.color}`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6 space-y-4">
                {currentSectionData.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 bg-gradient-to-r ${currentSectionData.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {currentSection === 0 && <Star className="w-4 h-4 text-white fill-white" />}
                        {currentSection === 1 && <TrendingUp className="w-4 h-4 text-white" />}
                        {currentSection === 2 && <Lightbulb className="w-4 h-4 text-white" />}
                      </div>
                      <p className="text-gray-800 leading-relaxed">{item}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex gap-3"
        >
          {currentSection > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentSection(currentSection - 1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          
          <Button
            onClick={() => {
              if (currentSection < sections.length - 1) {
                setCurrentSection(currentSection + 1);
              } else {
                onNavigate('dashboard');
              }
            }}
            className={`flex-1 bg-gradient-to-r ${currentSectionData.color} hover:opacity-90`}
          >
            {currentSection < sections.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MasterCheckInView;

