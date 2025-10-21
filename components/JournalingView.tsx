// Enhanced JournalingView with modern UX and therapy-focused design
import React, { useState, useEffect } from 'react';
import { Message, User } from '../types';
import SimpleChatView from './SimpleChatView';
import { Button } from './shared/Button';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import Icon from './shared/Icon';
import { completeJournalReflection, JournalSessionStatus } from '../services/journalSessionService';

interface JournalingViewProps {
  user: User;
  partner: User;
  onComplete: (entry: { partner1Chat: Message[], partner2Chat: Message[] }) => void;
  isReturningUser: boolean;
  sessionId?: string;
  initialUserChat?: Message[];
  initialPartnerChat?: Message[];
  currentUserId?: string;
  sessionStatus?: JournalSessionStatus;
  isCurrentUserPartner1?: boolean;
  insights?: string;
}

type ActivePartner = 'user' | 'partner';

const JournalingView: React.FC<JournalingViewProps> = ({ 
  user, 
  partner, 
  onComplete, 
  isReturningUser, 
  sessionId,
  initialUserChat,
  initialPartnerChat,
  currentUserId,
  sessionStatus: initialSessionStatus,
  isCurrentUserPartner1 = true,
  insights
}) => {
    console.log('JournalingView - Component rendered with props:', {
        sessionId,
        initialSessionStatus,
        insights: insights ? 'Present' : 'Missing',
        isCurrentUserPartner1
    });
    
    const [currentPartner, setCurrentPartner] = useState<ActivePartner>('user');
    const [userChat, setUserChat] = useState<Message[] | null>(initialUserChat || null);
    const [partnerChat, setPartnerChat] = useState<Message[] | null>(initialPartnerChat || null);
    const [sessionStartTime] = useState<Date>(new Date());
    const [isCompleting, setIsCompleting] = useState(false);
    const [sessionStatus, setSessionStatus] = useState<JournalSessionStatus>(initialSessionStatus || JournalSessionStatus.CREATED);
    
    // Sync local sessionStatus with prop changes
    useEffect(() => {
        if (initialSessionStatus) {
            console.log('JournalingView - Updating sessionStatus from', sessionStatus, 'to', initialSessionStatus);
            setSessionStatus(initialSessionStatus);
        }
    }, [initialSessionStatus]);

    const getPartnerDisplayName = () => {
        if (!partner) return '';
        if (partner.profile?.firstName) {
            return partner.profile.firstName + (partner.profile.lastName ? ` ${partner.profile.lastName}` : '');
        }
        return partner.name || partner.email.split('@')[0];
    };

    const getUserDisplayName = () => {
        if (user.profile?.firstName) {
            return user.profile.firstName + (user.profile.lastName ? ` ${user.profile.lastName}` : '');
        }
        return user.name || user.email.split('@')[0];
    };

    // Load the current user's chat
    useEffect(() => {
      // JournalManager now passes the correct chat data based on partner identity
      if (initialUserChat && initialUserChat.length > 0) {
        setUserChat(initialUserChat);
      }
      
      // Always set current partner to 'user' - the current user should only see their own chat
      setCurrentPartner('user');
    }, [initialUserChat]);

    const handleReflectionComplete = async (chatHistory: Message[]) => {
        if (!sessionId) {
            console.error('No session ID provided');
            return;
        }

        try {
            setIsCompleting(true);
            
            // Complete the reflection for the current partner
            const journalMessages = chatHistory.map(msg => ({
                sender: msg.sender as 'user' | 'bot',
                text: msg.text,
                timestamp: msg.timestamp || new Date()
            }));
            const response = await completeJournalReflection(sessionId, journalMessages);
            
            // Update local state - current user completed their reflection
            setUserChat(chatHistory);
            
            // Update status based on which partner completed
            if (isCurrentUserPartner1) {
              setSessionStatus(JournalSessionStatus.PARTNER1_COMPLETE);
            } else {
              setSessionStatus(JournalSessionStatus.PARTNER2_COMPLETE);
            }

            // Update session status from response
            setSessionStatus(response.session.status);

            // If both partners have completed, show results
            if (response.session.status === JournalSessionStatus.ANALYSIS_PENDING || 
                response.session.status === JournalSessionStatus.INSIGHTS_READY) {
                onComplete({ partner1Chat: userChat || [], partner2Chat: partnerChat || [] });
            }
        } catch (error) {
            console.error('Error completing reflection:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    // Show completion screen only when both partners have completed
    if (sessionStatus === JournalSessionStatus.ANALYSIS_PENDING || 
        sessionStatus === JournalSessionStatus.INSIGHTS_READY) {
         return (
            <div className="max-w-2xl mx-auto p-4 sm:p-6">
                <Card variant="therapy" className="text-center animate-fade-in">
                    <CardHeader className="p-4 sm:p-6">
                        <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-therapy-growth/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                            <Icon name="check" className="w-8 h-8 sm:w-10 sm:h-10 text-therapy-growth" />
                        </div>
                        <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                            ✨ Both Reflections Complete
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                        <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                            Thank you both for opening your hearts 💝 Bridge is now weaving your perspectives together to find common ground and growth opportunities.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 py-3 sm:py-4 text-xs sm:text-sm text-neutral-500">
                            <div className="flex items-center gap-2">
                                <Icon name="clock" className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60)} min session</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="users" className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>2 perspectives shared</span>
                            </div>
                        </div>

                        <Button 
                            onClick={() => onComplete({ partner1Chat: userChat || [], partner2Chat: partnerChat || [] })} 
                            variant="therapy" 
                            size="lg"
                            className="mt-4 sm:mt-6 animate-bounce-in text-sm sm:text-base py-2.5 sm:py-3"
                        >
                            🌟 See Your Shared Insights
                        </Button>
                    </CardContent>
                </Card>
            </div>
         );
    }

    // Show insights if they are ready
    console.log('JournalingView - sessionStatus:', sessionStatus);
    console.log('JournalingView - insights:', insights);
    console.log('JournalingView - INSIGHTS_READY:', JournalSessionStatus.INSIGHTS_READY);
    console.log('JournalingView - Condition check:', {
        sessionStatusEquals: sessionStatus === JournalSessionStatus.INSIGHTS_READY,
        hasInsights: !!insights,
        bothTrue: sessionStatus === JournalSessionStatus.INSIGHTS_READY && insights
    });
    
    if (sessionStatus === JournalSessionStatus.INSIGHTS_READY && insights) {
        console.log('JournalingView - Showing insights view');
        return (
            <div className="max-w-2xl mx-auto p-4 sm:p-6">
                <Card variant="therapy" className="text-center animate-fade-in">
                    <CardHeader className="p-4 sm:p-6">
                        <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-therapy-growth/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                            <Icon name="lightbulb" className="w-8 h-8 sm:w-10 sm:h-10 text-therapy-growth" />
                        </div>
                        <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                            ✨ Your Shared Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 sm:p-6">
                        <div 
                            className="text-neutral-600 leading-relaxed text-sm sm:text-base text-left"
                            dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }}
                        />
                        <Button
                            onClick={() => onComplete({ partner1Chat: userChat || [], partner2Chat: partnerChat || [] })}
                            variant="therapy"
                            size="lg"
                            className="w-full"
                        >
                            <Icon name="check" className="w-5 h-5 mr-2" />
                            Complete Session
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // Show waiting screen only if current user has completed their reflection
    // and the session status indicates they are waiting for their partner
    const shouldShowWaitingScreen = () => {
      if (!userChat || userChat.length === 0) return false;
      
      const result = isCurrentUserPartner1 
        ? sessionStatus === JournalSessionStatus.PARTNER1_COMPLETE
        : sessionStatus === JournalSessionStatus.PARTNER2_COMPLETE;
      
      console.log('JournalingView - shouldShowWaitingScreen:', {
        hasUserChat: !!userChat,
        userChatLength: userChat?.length,
        isCurrentUserPartner1,
        sessionStatus,
        result
      });
      
      return result;
    };
    
    if (shouldShowWaitingScreen()) {
            console.log('JournalingView - Showing waiting screen instead of insights');
            return (
                <div className="max-w-2xl mx-auto p-4 sm:p-6">
                    <Card variant="therapy" className="text-center animate-fade-in">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-yellow-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                <Icon name="clock" className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
                            </div>
                            <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                                ⏳ Waiting for {getPartnerDisplayName()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                                You have completed your reflection. {getPartnerDisplayName()} will be notified to complete their reflection. You'll be notified when both reflections are ready to view together.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 py-3 sm:py-4 text-xs sm:text-sm text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <Icon name="clock" className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60)} min session</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon name="users" className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>1 of 2 perspectives shared</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
    }
    
    // Current user is always the active partner
    const isUserTurn = true;
    
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Progress Indicator - Mobile Optimized */}
            <Card variant="calm" className="sticky top-0 z-10 backdrop-blur-sm border-b-2 border-therapy-calm/20">
                <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${userChat ? 'bg-therapy-growth' : 'bg-therapy-warmth animate-pulse'}`} />
                                <span className="text-xs sm:text-sm font-medium truncate">{getUserDisplayName()}</span>
                            </div>
                            <div className="w-4 sm:w-8 h-0.5 bg-neutral-300 flex-shrink-0" />
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 bg-neutral-300" />
                                <span className="text-xs sm:text-sm font-medium truncate">{getPartnerDisplayName()}</span>
                            </div>
                        </div>
                        
                        <div className="text-left sm:text-right text-xs sm:text-sm text-neutral-500 w-full sm:w-auto">
                            <div>Your Progress: {userChat ? 'Complete' : 'In Progress'}</div>
                            <div className="w-full sm:w-24 h-1 bg-neutral-200 rounded-full mt-1">
                                <div 
                                    className="h-full bg-therapy-growth rounded-full transition-all duration-500"
                                    style={{ width: userChat ? '100%' : '50%' }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Session Header - Mobile Optimized */}
            <Card variant="therapy" className="animate-slide-in-down">
                <CardHeader className="text-center p-4 sm:p-6">
                    <CardTitle className="flex items-center justify-center gap-2 text-therapy-calm text-lg sm:text-xl">
                        <span className="text-lg sm:text-xl">💙</span>
                        <span className="truncate">{getUserDisplayName()}'s Reflection Time</span>
                    </CardTitle>
                    <p className="text-neutral-600 mt-2 text-sm sm:text-base">
                        Share your heart with Bridge - this is your private space 🤗
                    </p>
                </CardHeader>
            </Card>

            {/* Chat Interface */}
            <div className="animate-fade-in">
                <SimpleChatView
                    partnerName={getUserDisplayName()}
                    onComplete={handleReflectionComplete}
                    isReturningUser={isReturningUser}
                    initialMessages={userChat}
                    isCompleting={isCompleting}
                />
            </div>
        </div>
    );
};

export default JournalingView;