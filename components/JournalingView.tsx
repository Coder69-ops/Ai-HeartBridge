// Enhanced JournalingView with modern UX and therapy-focused design
import React, { useState, useEffect } from 'react';
import { Message, User } from '../types';
import SimpleChatView from './SimpleChatView';
import { Button } from './shared/Button';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import Icon from './shared/Icon';

interface JournalingViewProps {
  user: User;
  partner: User;
  onComplete: (entry: { partner1Chat: Message[], partner2Chat: Message[] }) => void;
  isReturningUser: boolean;
  sessionId?: string;
  initialUserChat?: Message[];
  initialPartnerChat?: Message[];
}

type ActivePartner = 'user' | 'partner';

const JournalingView: React.FC<JournalingViewProps> = ({ 
  user, 
  partner, 
  onComplete, 
  isReturningUser, 
  sessionId,
  initialUserChat,
  initialPartnerChat 
}) => {
    const [activePartner, setActivePartner] = useState<ActivePartner>('user');
    const [userChat, setUserChat] = useState<Message[] | null>(initialUserChat || null);
    const [partnerChat, setPartnerChat] = useState<Message[] | null>(initialPartnerChat || null);
    const [sessionStartTime] = useState<Date>(new Date());
    const [currentWordCount, setCurrentWordCount] = useState<number>(0);

    // Determine which partner should start based on existing data
    useEffect(() => {
      if (initialUserChat && initialUserChat.length > 0) {
        setUserChat(initialUserChat);
        if (initialPartnerChat && initialPartnerChat.length > 0) {
          setPartnerChat(initialPartnerChat);
        } else {
          setActivePartner('partner');
        }
      } else if (initialPartnerChat && initialPartnerChat.length > 0) {
        setPartnerChat(initialPartnerChat);
        setActivePartner('user');
      }
    }, [initialUserChat, initialPartnerChat]);

    const handleUserComplete = (chatHistory: Message[]) => {
        setUserChat(chatHistory);
        setActivePartner('partner');
    };

    const handlePartnerComplete = (chatHistory: Message[]) => {
        setPartnerChat(chatHistory);
    };
    
    const handleSeeResults = () => {
        if (userChat && partnerChat) {
            onComplete({ partner1Chat: userChat, partner2Chat: partnerChat });
        }
    };
    
    // Calculate session progress
    const sessionProgress = userChat && partnerChat ? 100 : userChat ? 50 : 0;
    const elapsedTime = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60);

    if (userChat && partnerChat) {
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
                                <span>{elapsedTime} min session</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="users" className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>2 perspectives shared</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleSeeResults} 
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
    
    const currentPartnerName = activePartner === 'user' ? getUserDisplayName() : getPartnerDisplayName();
    const handleComplete = activePartner === 'user' ? handleUserComplete : handlePartnerComplete;
    const isUserTurn = activePartner === 'user';
    
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Progress Indicator - Mobile Optimized */}
            <Card variant="calm" className="sticky top-0 z-10 backdrop-blur-sm border-b-2 border-therapy-calm/20">
                <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${userChat ? 'bg-therapy-growth' : isUserTurn ? 'bg-therapy-warmth animate-pulse' : 'bg-neutral-300'}`} />
                                <span className="text-xs sm:text-sm font-medium truncate">{getUserDisplayName()}</span>
                            </div>
                            <div className="w-4 sm:w-8 h-0.5 bg-neutral-300 flex-shrink-0" />
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${partnerChat ? 'bg-therapy-growth' : !isUserTurn ? 'bg-therapy-warmth animate-pulse' : 'bg-neutral-300'}`} />
                                <span className="text-xs sm:text-sm font-medium truncate">{getPartnerDisplayName()}</span>
                            </div>
                        </div>
                        
                        <div className="text-left sm:text-right text-xs sm:text-sm text-neutral-500 w-full sm:w-auto">
                            <div>Progress: {sessionProgress}%</div>
                            <div className="w-full sm:w-24 h-1 bg-neutral-200 rounded-full mt-1">
                                <div 
                                    className="h-full bg-therapy-growth rounded-full transition-all duration-500"
                                    style={{ width: `${sessionProgress}%` }}
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
                        <span className="text-lg sm:text-xl">{isUserTurn ? '💙' : '🌸'}</span>
                        <span className="truncate">{currentPartnerName}'s Reflection Time</span>
                    </CardTitle>
                    <p className="text-neutral-600 mt-2 text-sm sm:text-base">
                        {isUserTurn 
                            ? "Share your heart with Bridge - this is your private space 🤗" 
                            : "Please give your partner privacy for their reflection session ✨"
                        }
                    </p>
                </CardHeader>
            </Card>

            {/* Chat Interface */}
            <div className="animate-fade-in">
                <SimpleChatView
                    partnerName={currentPartnerName}
                    onComplete={handleComplete}
                    isReturningUser={isReturningUser}
                />
            </div>
        </div>
    );
};

export default JournalingView;