// AI HeartBridge - Master Safety Center
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Phone, 
  MessageCircle, 
  Heart, 
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';

interface MasterSafetyCenterProps {
  onBack: () => void;
}

const MasterSafetyCenter: React.FC<MasterSafetyCenterProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<'crisis' | 'resources' | 'safety'>('crisis');

  const crisisResources = [
    {
      title: 'National Domestic Violence Hotline',
      phone: '1-800-799-7233',
      description: '24/7 confidential support for anyone experiencing domestic violence',
      available: '24/7',
      type: 'hotline'
    },
    {
      title: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: 'Free, 24/7 crisis support via text message',
      available: '24/7',
      type: 'text'
    },
    {
      title: 'National Suicide Prevention Lifeline',
      phone: '988',
      description: 'Free, confidential support for people in distress',
      available: '24/7',
      type: 'hotline'
    },
    {
      title: 'RAINN National Sexual Assault Hotline',
      phone: '1-800-656-4673',
      description: '24/7 support for survivors of sexual assault',
      available: '24/7',
      type: 'hotline'
    }
  ];

  const safetyResources = [
    {
      title: 'Safety Planning Guide',
      description: 'Step-by-step guide to creating a safety plan',
      type: 'guide',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      title: 'Recognizing Abuse Patterns',
      description: 'Learn to identify unhealthy relationship patterns',
      type: 'education',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      title: 'Support Groups',
      description: 'Connect with others who understand your experience',
      type: 'community',
      icon: <Users className="w-5 h-5" />
    },
    {
      title: 'Legal Resources',
      description: 'Information about protective orders and legal options',
      type: 'legal',
      icon: <Shield className="w-5 h-5" />
    }
  ];

  const safetyTips = [
    'Trust your instincts - if something feels wrong, it probably is',
    'Keep important documents and emergency contacts in a safe place',
    'Use a secure device when seeking help online',
    'Create a code word with trusted friends or family',
    'Know your local emergency numbers',
    'Document incidents with dates and details if safe to do so'
  ];

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleText = (text: string) => {
    window.open(`sms:${text}`, '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center text-red-600">
            <Shield className="w-6 h-6 mr-2" />
            <span className="font-semibold">Safety Center</span>
          </div>
        </div>

        {/* Emergency Notice */}
        <Card className="mb-8 border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-4 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-red-800 mb-2">
                  If you're in immediate danger, call 911
                </h2>
                <p className="text-red-700">
                  Your safety is the most important thing. If you're experiencing abuse or feel unsafe, 
                  please reach out to emergency services or a trusted support person immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'crisis', label: 'Crisis Support', icon: <Phone className="w-4 h-4" /> },
            { id: 'resources', label: 'Resources', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'safety', label: 'Safety Tips', icon: <Shield className="w-4 h-4" /> }
          ].map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-red-600 text-white'
                  : 'border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              {category.icon}
              {category.label}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedCategory === 'crisis' && (
            <motion.div
              key="crisis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Crisis Support Resources</h3>
              <div className="grid gap-6">
                {crisisResources.map((resource, index) => (
                  <Card key={index} className="border-red-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">
                            {resource.title}
                          </h4>
                          <p className="text-gray-600 mb-2">{resource.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Available {resource.available}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => resource.type === 'text' ? handleText(resource.phone) : handleCall(resource.phone)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {resource.type === 'text' ? (
                              <>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Text
                              </>
                            ) : (
                              <>
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {selectedCategory === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Safety Resources</h3>
              <div className="grid gap-4">
                {safetyResources.map((resource, index) => (
                  <Card key={index} className="border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                          {resource.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">
                            {resource.title}
                          </h4>
                          <p className="text-gray-600">{resource.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {selectedCategory === 'safety' && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Safety Tips</h3>
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-700">
                    <Info className="w-5 h-5 mr-2" />
                    Important Safety Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safetyTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <Heart className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Remember: You're Not Alone
                      </h4>
                      <p className="text-blue-700">
                        It takes courage to seek help. There are people who care about you and want to support you. 
                        You deserve to feel safe and loved in your relationships.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MasterSafetyCenter;
