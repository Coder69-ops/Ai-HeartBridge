import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import Icon from './shared/Icon';

interface InsightsViewProps {
  insights: string;
  onBack: () => void;
}

const InsightsView: React.FC<InsightsViewProps> = ({ insights, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-white/50"
            >
              <Icon name="arrow-left" className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Shared Insights</h1>
              <p className="text-gray-600">Your relationship analysis and growth opportunities</p>
            </div>
          </div>
        </div>

        {/* Insights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center p-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
              <div className="mx-auto mb-4 p-4 bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
                <Icon name="lightbulb" className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                ✨ Your Relationship Insights
              </CardTitle>
              <p className="text-emerald-100 mt-2">
                Based on both of your reflections and our evidence-based analysis
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }}
                />
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={onBack}
                    variant="therapy"
                    size="lg"
                    className="px-8 py-3"
                  >
                    <Icon name="arrow-left" className="w-5 h-5 mr-2" />
                    Back to Journal
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    size="lg"
                    className="px-8 py-3"
                  >
                    <Icon name="printer" className="w-5 h-5 mr-2" />
                    Print Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsView;
