import React, { useState, useEffect } from 'react';
import { getRelationshipTrends, getHealthScore, RelationshipTrends, HealthScore } from '../services/analyticsService';
import { Card } from './shared/Card';
import { Loader } from './shared/Loader';
import Icon from './shared/Icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TrendsView: React.FC = () => {
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
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader />
        <p className="mt-4 text-slate-600">Loading your relationship analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Card>
          <Icon name="chart-bar" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800">Unable to Load Analytics</h2>
          <p className="mt-2 text-red-700">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  // Prepare CSI score chart data
  const csiChartData = trends?.csiScores.map(score => ({
    date: new Date(score.createdAt).toLocaleDateString(),
    score: score.averageScore,
    partner1: score.partner1Score,
    partner2: score.partner2Score
  })) || [];

  // Prepare Four Horsemen data
  const horsemenData = trends ? [
    { name: 'Criticism', count: trends.fourHorsemenStats.criticism },
    { name: 'Contempt', count: trends.fourHorsemenStats.contempt },
    { name: 'Defensiveness', count: trends.fourHorsemenStats.defensiveness },
    { name: 'Stonewalling', count: trends.fourHorsemenStats.stonewalling }
  ] : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800">Your Relationship Trends</h1>
        <p className="mt-2 text-lg text-slate-600">Track your progress and celebrate your growth together</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center space-x-4">
        {['1month', '3months', '6months', '1year'].map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeframe === period
                ? 'bg-teal-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {period === '1month' ? '1 Month' : 
             period === '3months' ? '3 Months' :
             period === '6months' ? '6 Months' : '1 Year'}
          </button>
        ))}
      </div>

      {/* Health Score Card */}
      {healthScore && (
        <Card className={`${getHealthBgColor(healthScore.healthScore)} border-l-4 border-l-teal-600`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Relationship Health Score</h2>
              <p className="text-slate-600">Overall assessment of your relationship wellness</p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getHealthColor(healthScore.healthScore)}`}>
                {healthScore.healthScore}
              </div>
              <div className={`text-lg font-semibold ${getHealthColor(healthScore.healthScore)}`}>
                {healthScore.healthLevel}
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">{healthScore.scoreComponents.satisfaction}</div>
              <div className="text-sm text-slate-600">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">{healthScore.scoreComponents.engagement}</div>
              <div className="text-sm text-slate-600">Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">{healthScore.scoreComponents.communication}</div>
              <div className="text-sm text-slate-600">Communication</div>
            </div>
          </div>

          {healthScore.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Recommendations</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {healthScore.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <Icon name="lightbulb" className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Summary Stats */}
      {trends && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <Icon name="journal" className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-slate-800">{trends.summary.totalJournals}</div>
            <div className="text-slate-600">Journal Sessions</div>
          </Card>
          <Card className="text-center">
            <Icon name="chart-bar" className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-slate-800">{trends.summary.totalCheckIns}</div>
            <div className="text-slate-600">Check-ins Completed</div>
          </Card>
          <Card className="text-center">
            <Icon name="book-open" className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-slate-800">{trends.summary.totalExercises}</div>
            <div className="text-slate-600">Exercises Practiced</div>
          </Card>
        </div>
      )}

      {/* CSI Scores Chart */}
      {csiChartData.length > 0 && (
        <Card title="Relationship Satisfaction Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={csiChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={3} name="Average Score" />
              <Line type="monotone" dataKey="partner1" stroke="#3b82f6" strokeWidth={2} name="Partner 1" />
              <Line type="monotone" dataKey="partner2" stroke="#8b5cf6" strokeWidth={2} name="Partner 2" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Four Horsemen Analysis */}
      {horsemenData.some(h => h.count > 0) && (
        <Card title="Communication Patterns Analysis">
          <p className="text-slate-600 mb-4">
            Based on your journal entries, here's how often the "Four Horsemen" patterns appeared:
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={horsemenData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Icon name="lightbulb" className="w-4 h-4 inline mr-1" />
              The fewer instances of these patterns, the healthier your communication. 
              Consider practicing exercises that focus on areas where these patterns appear most.
            </p>
          </div>
        </Card>
      )}

      {/* Exercise Categories */}
      {trends && Object.keys(trends.exerciseStats).length > 0 && (
        <Card title="Exercise Engagement">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(trends.exerciseStats).map(([category, stats]) => (
              <div key={category} className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-800">{category}</h3>
                <div className="text-2xl font-bold text-teal-600">{(stats as any).count}</div>
                <div className="text-sm text-slate-600">exercises completed</div>
                {(stats as any).averageRating > 0 && (
                  <div className="flex items-center mt-2">
                    <Icon name="heart" className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm">{((stats as any).averageRating).toFixed(1)}/5 avg rating</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {trends && trends.summary.totalJournals === 0 && trends.summary.totalCheckIns === 0 && (
        <Card className="text-center py-8">
          <Icon name="chart-bar" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Data Yet</h3>
          <p className="text-slate-600 mb-4">
            Start journaling together and taking relationship check-ins to see your trends and progress over time.
          </p>
        </Card>
      )}
    </div>
  );
};

export default TrendsView;