import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import { 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  Shield, 
  Users, 
  MessageCircle,
  Brain,
  ArrowRight,
  Star,
  Target,
  Zap
} from 'lucide-react';

interface InsightsDisplayProps {
  insights: string;
  onBack?: () => void;
  onContinue?: () => void;
}

const InsightsDisplay: React.FC<InsightsDisplayProps> = ({ 
  insights, 
  onBack, 
  onContinue 
}) => {
  // Parse the insights text to extract structured data
  const parseInsights = (text: string) => {
    const sections = {
      summary: '',
      strengths: [] as string[],
      opportunities: [] as string[],
      fourHorsemen: {
        criticism: false,
        contempt: false,
        defensiveness: false,
        stonewalling: false
      },
      emotionalIntelligence: {
        empathyLevel: '',
        emotionalRegulation: '',
        communicationStyle: '',
        emotionalValidation: ''
      },
      relationshipSatisfaction: {
        overallScore: 0,
        keyFactors: '',
        improvementAreas: ''
      },
      repairPlan: [] as string[],
      riskFlags: [] as string[],
      safetyMode: false
    };

    // Extract summary
    const summaryMatch = text.match(/## Summary\s*\n(.*?)(?=##|$)/s);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    // Extract strengths
    const strengthsMatch = text.match(/## Strengths\s*\n(.*?)(?=##|$)/s);
    if (strengthsMatch) {
      sections.strengths = strengthsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    // Extract opportunities
    const opportunitiesMatch = text.match(/## Growth Opportunities\s*\n(.*?)(?=##|$)/s);
    if (opportunitiesMatch) {
      sections.opportunities = opportunitiesMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    // Extract Four Horsemen
    const fourHorsemenMatch = text.match(/## Four Horsemen Assessment\s*\n(.*?)(?=##|$)/s);
    if (fourHorsemenMatch) {
      const horsemenText = fourHorsemenMatch[1];
      sections.fourHorsemen.criticism = horsemenText.includes('Criticism') && horsemenText.includes('⚠️');
      sections.fourHorsemen.contempt = horsemenText.includes('Contempt') && horsemenText.includes('⚠️');
      sections.fourHorsemen.defensiveness = horsemenText.includes('Defensiveness') && horsemenText.includes('⚠️');
      sections.fourHorsemen.stonewalling = horsemenText.includes('Stonewalling') && horsemenText.includes('⚠️');
    }

    // Extract repair plan
    const repairPlanMatch = text.match(/## Repair Plan\s*\n(.*?)(?=##|$)/s);
    if (repairPlanMatch) {
      sections.repairPlan = repairPlanMatch[1]
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    // Extract risk flags
    const riskFlagsMatch = text.match(/## Safety Considerations\s*\n(.*?)(?=##|$)/s);
    if (riskFlagsMatch) {
      sections.riskFlags = riskFlagsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    return sections;
  };

  const parsedInsights = parseInsights(insights);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Brain className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            ✨ Your Shared Insights
          </h1>
          <p className="text-white/90 text-lg">
            AI-powered analysis of your relationship reflection session
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>2 perspectives analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>AI-powered insights</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Relationship analysis</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-12">
        {/* Summary Card */}
        {parsedInsights.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-t-xl">
                <CardTitle className="text-xl lg:text-2xl font-bold flex items-center gap-3">
                  <Heart className="w-6 h-6 lg:w-7 lg:h-7" />
                  Relationship Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                <p className="text-gray-700 leading-relaxed text-lg lg:text-xl">
                  {parsedInsights.summary}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Strengths and Opportunities */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          {parsedInsights.strengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-xl">
                <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-3">
                  <Star className="w-5 h-5 lg:w-6 lg:h-6" />
                  Relationship Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                  <div className="space-y-3">
                    {parsedInsights.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white/60 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{strength}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Opportunities */}
          {parsedInsights.opportunities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-xl">
                <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-3">
                  <Target className="w-5 h-5 lg:w-6 lg:h-6" />
                  Growth Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                  <div className="space-y-3">
                    {parsedInsights.opportunities.map((opportunity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white/60 rounded-lg"
                      >
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{opportunity}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Four Horsemen Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
            <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-xl">
                <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6" />
                  Communication Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { key: 'criticism', label: 'Criticism', icon: MessageCircle },
                  { key: 'contempt', label: 'Contempt', icon: AlertTriangle },
                  { key: 'defensiveness', label: 'Defensiveness', icon: Shield },
                  { key: 'stonewalling', label: 'Stonewalling', icon: Users }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="text-center p-4 rounded-lg hover:bg-white/50 transition-colors">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center shadow-lg ${
                      parsedInsights.fourHorsemen[key as keyof typeof parsedInsights.fourHorsemen]
                        ? 'bg-red-100 text-red-600 border-2 border-red-200'
                        : 'bg-green-100 text-green-600 border-2 border-green-200'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <p className="text-base font-semibold text-gray-800 mb-1">{label}</p>
                    <p className={`text-sm font-medium ${
                      parsedInsights.fourHorsemen[key as keyof typeof parsedInsights.fourHorsemen]
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {parsedInsights.fourHorsemen[key as keyof typeof parsedInsights.fourHorsemen] ? 'Present' : 'Absent'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Repair Plan */}
        {parsedInsights.repairPlan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-3">
                  <Zap className="w-5 h-5 lg:w-6 lg:h-6" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                <div className="space-y-4">
                  {parsedInsights.repairPlan.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white/60 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Safety Considerations */}
        {parsedInsights.riskFlags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <Card className="shadow-lg bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-t-xl">
                <CardTitle className="text-lg lg:text-xl font-bold flex items-center gap-3">
                  <Shield className="w-5 h-5 lg:w-6 lg:h-6" />
                  Safety Considerations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                <div className="space-y-3">
                  {parsedInsights.riskFlags.map((flag, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border-l-4 border-red-400"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{flag}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col lg:flex-row gap-4 justify-center max-w-4xl mx-auto"
        >
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full lg:w-auto px-8 py-4 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
              Back to Journal
            </Button>
          )}
          {onContinue && (
            <Button
              onClick={onContinue}
              className="w-full lg:w-auto px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsDisplay;
