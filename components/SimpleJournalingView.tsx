// Simplified JournalingView without XState - Permanent Fix
import React, { useState, useEffect } from 'react';
import { Message, User } from '../types';
import SimpleChatView from './SimpleChatView';
import { Button } from './shared/Button';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import Icon from './shared/Icon';
import { completeJournalReflection, JournalSessionStatus } from '../services/journalSessionService';
import InsightsDisplay from './InsightsDisplay';

interface SimpleJournalingViewProps {
  user: User;
  partner: User;
  onComplete: (entry: { partner1Chat: Message[], partner2Chat: Message[] }) => void;
  onBack: () => void;
  isReturningUser: boolean;
  sessionId?: string;
  initialUserChat?: Message[];
  initialPartnerChat?: Message[];
  sessionStatus?: JournalSessionStatus;
  isCurrentUserPartner1?: boolean;
  insights?: string;
}

type JournalingState = 'chat' | 'waiting' | 'insights' | 'generating' | 'error';

const SimpleJournalingView: React.FC<SimpleJournalingViewProps> = ({ 
  user, 
  partner, 
  onComplete, 
  onBack,
  isReturningUser, 
  sessionId,
  initialUserChat = [],
  initialPartnerChat = [],
  sessionStatus,
  isCurrentUserPartner1 = true,
  insights
}) => {
  const [currentState, setCurrentState] = useState<JournalingState>('chat');
  const [userMessages, setUserMessages] = useState<Message[]>(initialUserChat);
  const [partnerMessages, setPartnerMessages] = useState<Message[]>(initialPartnerChat);
  const [sessionInsights, setSessionInsights] = useState<string | null>(insights || null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine current state based on session status and data
  useEffect(() => {
    if (insights) {
      setCurrentState('insights');
    } else if (sessionStatus === JournalSessionStatus.INSIGHTS_READY) {
      setCurrentState('insights');
    } else if (sessionStatus === JournalSessionStatus.ANALYSIS_PENDING) {
      setCurrentState('waiting'); // Both completed, generating insights
    } else if (sessionStatus === JournalSessionStatus.PARTNER1_COMPLETE && isCurrentUserPartner1) {
      setCurrentState('waiting'); // I completed, waiting for partner
    } else if (sessionStatus === JournalSessionStatus.PARTNER2_COMPLETE && !isCurrentUserPartner1) {
      setCurrentState('waiting'); // I completed, waiting for partner
    } else if (sessionStatus === JournalSessionStatus.PARTNER1_COMPLETE && !isCurrentUserPartner1) {
      setCurrentState('chat'); // Partner completed, I need to complete
    } else if (sessionStatus === JournalSessionStatus.PARTNER2_COMPLETE && isCurrentUserPartner1) {
      setCurrentState('chat'); // Partner completed, I need to complete
    } else {
      setCurrentState('chat'); // Fresh session or both need to start
    }
  }, [sessionStatus, insights, isCurrentUserPartner1]);

  const handleChatComplete = async (messages: Message[]) => {
    try {
      setUserMessages(messages);
      setIsGenerating(true);
      setCurrentState('generating');

      if (sessionId) {
        // Complete the journal reflection - convert Message[] to JournalMessage[]
        const journalMessages = messages.map(msg => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp || new Date()
        }));
        const result = await completeJournalReflection(sessionId, journalMessages);
        
        if (result.session.insights) {
          setSessionInsights(result.session.insights);
          setCurrentState('insights');
        } else {
          setCurrentState('waiting');
        }
      } else {
        // No session ID, just complete locally
        setCurrentState('waiting');
      }
    } catch (err: any) {
      console.error('Error completing journal reflection:', err);
      setError(err.message || 'Failed to complete reflection');
      setCurrentState('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsightsContinue = () => {
    onComplete({ 
      partner1Chat: isCurrentUserPartner1 ? userMessages : partnerMessages,
      partner2Chat: isCurrentUserPartner1 ? partnerMessages : userMessages
    });
  };

  const handleRetry = () => {
    setError(null);
    setCurrentState('chat');
  };

  // Chat State - User is actively journaling
  if (currentState === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
        <div className="pt-4 pb-4">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Journal Session</h1>
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                <Icon name="arrow-left" className="w-4 h-4" />
                Back
              </Button>
            </div>
          </div>
        </div>
        
        <SimpleChatView
          partnerName="Bridge"
          onComplete={handleChatComplete}
          isReturningUser={isReturningUser}
          initialMessages={userMessages}
          isCompleting={isGenerating}
        />
      </div>
    );
  }

  // Waiting State - User completed, waiting for partner or insights
  if (currentState === 'waiting') {
    const getWaitingMessage = () => {
      if (sessionStatus === JournalSessionStatus.ANALYSIS_PENDING) {
        return {
          title: "✨ Generating Insights",
          message: "Both of you have completed your reflections! Our AI is now analyzing your conversations and generating personalized insights. This may take a few moments.",
          icon: "sparkles",
          color: "purple"
        };
      } else if (sessionStatus === JournalSessionStatus.PARTNER1_COMPLETE && isCurrentUserPartner1) {
        return {
          title: `⏳ Waiting for ${partner?.name || 'your partner'}`,
          message: `You have completed your reflection. ${partner?.name || 'Your partner'} will be notified to complete their reflection. You'll be notified when both reflections are ready to view together.`,
          icon: "users",
          color: "yellow"
        };
      } else if (sessionStatus === JournalSessionStatus.PARTNER2_COMPLETE && !isCurrentUserPartner1) {
        return {
          title: `⏳ Waiting for ${partner?.name || 'your partner'}`,
          message: `You have completed your reflection. ${partner?.name || 'Your partner'} will be notified to complete their reflection. You'll be notified when both reflections are ready to view together.`,
          icon: "users",
          color: "yellow"
        };
      } else {
        return {
          title: "⏳ Processing",
          message: "Your reflection is being processed. Please wait a moment.",
          icon: "lightbulb",
          color: "blue"
        };
      }
    };

    const waitingInfo = getWaitingMessage();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-xl">
            <CardHeader className="p-6">
              <div className={`mx-auto mb-4 p-4 bg-${waitingInfo.color}-100 rounded-full w-20 h-20 flex items-center justify-center`}>
                <Icon name={waitingInfo.icon as any} className={`w-10 h-10 text-${waitingInfo.color}-600`} />
              </div>
              <CardTitle className="text-2xl text-gray-800">
                {waitingInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-gray-600 leading-relaxed">
                {waitingInfo.message}
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={onBack}>
                  Back to Dashboard
                </Button>
                {sessionStatus !== JournalSessionStatus.ANALYSIS_PENDING && (
                  <Button onClick={() => setCurrentState('chat')}>
                    Continue Writing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Generating State - AI is creating insights
  if (currentState === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-xl">
            <CardHeader className="p-6">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
                <Icon name="brain" className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-800">
                🧠 Generating Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-gray-600 leading-relaxed">
                Both partners have completed their reflections. Our AI is analyzing your relationship patterns 
                and generating personalized insights. This may take a few moments.
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Insights State - Show AI-generated insights
  if (currentState === 'insights' && sessionInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Session Insights</h1>
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <Icon name="arrow-left" className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <InsightsDisplay 
            insights={sessionInsights}
            onContinue={handleInsightsContinue}
          />
        </div>
      </div>
    );
  }

  // Error State - Something went wrong
  if (currentState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-xl">
            <CardHeader className="p-6">
              <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-20 h-20 flex items-center justify-center">
                <Icon name="alert-circle" className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-800">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-gray-600 leading-relaxed">
                {error || 'An unexpected error occurred during your journaling session.'}
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={onBack}>
                  Back to Dashboard
                </Button>
                <Button onClick={handleRetry}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Loading journal session...</p>
        <Button onClick={onBack}>Back to Dashboard</Button>
      </div>
    </div>
  );
};

export default SimpleJournalingView;