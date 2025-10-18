// AI HeartBridge - Stunning Mobile-First Analytics & Trends
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRelationshipTrends, getHealthScore, RelationshipTrends, HealthScore } from '../services/analyticsService';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import { GorgeousLoader } from './shared/GorgeousLoader';
import { 
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  AlertTriangle,
  Activity,
  Calendar,
  BarChart3,
  Sparkles,
  Check,
  X,
  Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const MasterTrendsView: React.FC = () => {
  const [trends, setTrends] = useState<RelationshipTrends | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('6months');

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [trendsData, healthData] = await Promise.all([
        getRelationshipTrends(timeframe),
        getHealthScore()
      ]);
      
      setTrends(trendsData);
      setHealthScore(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-amber-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-500';
  };

  if (loading) {
    return (
      <GorgeousLoader 
        message="Loading your relationship insights..."
        type="sync"
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
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Analytics</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadData} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const csiChartData = trends?.csiScores.map(score => ({
    date: new Date(score.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: score.averageScore,
    partner1: score.partner1Score,
    partner2: score.partner2Score
  })) || [];

  const horsemenData = trends ? [
    { name: 'Criticism', count: trends.fourHorsemenStats.criticism, color: '#ef4444' },
    { name: 'Contempt', count: trends.fourHorsemenStats.contempt, color: '#f97316' },
    { name: 'Defensiveness', count: trends.fourHorsemenStats.defensiveness, color: '#eab308' },
    { name: 'Stonewalling', count: trends.fourHorsemenStats.stonewalling, color: '#8b5cf6' }
  ] : [];

  const healthScoreValue = healthScore?.overallScore || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Relationship Analytics</h1>
              <p className="text-white/80 text-sm">Track your progress and celebrate growth</p>
            </div>
          </div>

          {/* Timeframe Pills */}
          <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
            {['1month', '3months', '6months', '1year'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                  timeframe === tf
                    ? 'bg-white text-emerald-600 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {tf.replace('month', ' Month').replace('year', ' Year')}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-12">
        {/* Overall Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${getHealthColor(healthScoreValue)}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-600" />
                  Relationship Health Score
                </h2>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    {healthScoreValue}
                  </div>
                  <div className="text-sm text-gray-600">out of 100</div>
                </div>
              </div>

              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${healthScoreValue}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${getHealthColor(healthScoreValue)}`}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {healthScore && Object.entries(healthScore.categoryScores).map(([key, value], index) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{value}</div>
                    <div className="text-xs text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSI Scores Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Satisfaction Over Time
                </h3>
                
                {csiChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={csiChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} name="Average" />
                      <Line type="monotone" dataKey="partner1" stroke="#0891b2" strokeWidth={2} name="Partner 1" />
                      <Line type="monotone" dataKey="partner2" stroke="#8b5cf6" strokeWidth={2} name="Partner 2" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No data yet. Complete check-ins to see trends!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Four Horsemen Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Communication Patterns
                </h3>

                {horsemenData.length > 0 && horsemenData.some(h => h.count > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={horsemenData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Check className="w-12 h-12 mx-auto mb-2 text-green-400" />
                      <p className="font-medium text-green-600">Great job!</p>
                      <p className="text-sm">No negative patterns detected</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                AI Insights & Recommendations
              </h3>

              <div className="space-y-3">
                {healthScoreValue >= 80 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Strong Relationship Health</p>
                      <p className="text-sm text-green-700">
                        Your relationship is thriving! Continue practicing open communication and appreciation.
                      </p>
                    </div>
                  </div>
                )}

                {healthScoreValue >= 60 && healthScoreValue < 80 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Good Progress</p>
                      <p className="text-sm text-amber-700">
                        You're on the right track. Consider completing more exercises together to strengthen your bond.
                      </p>
                    </div>
                  </div>
                )}

                {healthScoreValue < 60 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Room for Growth</p>
                      <p className="text-sm text-blue-700">
                        Focus on regular check-ins and communication exercises. Small steps lead to big improvements!
                      </p>
                    </div>
                  </div>
                )}

                {trends && trends.checkInStreak > 7 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900">Amazing Streak!</p>
                      <p className="text-sm text-purple-700">
                        You've maintained a {trends.checkInStreak}-day check-in streak. Consistency is key!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
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

export default MasterTrendsView;

