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
}

type ActivePartner = 'user' | 'partner';

const JournalingView: React.FC<JournalingViewProps> = ({ user, partner, onComplete, isReturningUser }) => {
    const [activePartner, setActivePartner] = useState<ActivePartner>('user');
    const [userChat, setUserChat] = useState<Message[] | null>(null);
    const [partnerChat, setPartnerChat] = useState<Message[] | null>(null);
    const [sessionStartTime] = useState<Date>(new Date());
    const [currentWordCount, setCurrentWordCount] = useState<number>(0);

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
            <div className="max-w-2xl mx-auto p-6">
                <Card variant="therapy" className="text-center animate-fade-in">
                    <CardHeader>
                        <div className="mx-auto mb-4 p-4 bg-therapy-growth/10 rounded-full w-20 h-20 flex items-center justify-center">
                            <Icon name="check" className="w-10 h-10 text-therapy-growth" />
                        </div>
                        <CardTitle className="text-2xl text-therapy-calm">
                            ✨ Both Reflections Complete
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-neutral-600 leading-relaxed">
                            Thank you both for opening your hearts 💝 Bridge is now weaving your perspectives together to find common ground and growth opportunities.
                        </p>
                        
                        <div className="flex justify-center items-center gap-6 py-4 text-sm text-neutral-500">
                            <div className="flex items-center gap-2">
                                <Icon name="clock" className="w-4 h-4" />
                                <span>{elapsedTime} min session</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="users" className="w-4 h-4" />
                                <span>2 perspectives shared</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleSeeResults} 
                            variant="therapy" 
                            size="lg"
                            className="mt-6 animate-bounce-in"
                        >
                            🌟 See Your Shared Insights
                        </Button>
                    </CardContent>
                </Card>
            </div>
         );
    }
    
    const currentPartnerName = activePartner === 'user' ? user.email : partner.email;
    const handleComplete = activePartner === 'user' ? handleUserComplete : handlePartnerComplete;
    const isUserTurn = activePartner === 'user';
    
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Progress Indicator */}
            <Card variant="calm" className="sticky top-0 z-10 backdrop-blur-sm border-b-2 border-therapy-calm/20">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${userChat ? 'bg-therapy-growth' : isUserTurn ? 'bg-therapy-warmth animate-pulse' : 'bg-neutral-300'}`} />
                                <span className="text-sm font-medium">{user.email}</span>
                            </div>
                            <div className="w-8 h-0.5 bg-neutral-300" />
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${partnerChat ? 'bg-therapy-growth' : !isUserTurn ? 'bg-therapy-warmth animate-pulse' : 'bg-neutral-300'}`} />
                                <span className="text-sm font-medium">{partner.email}</span>
                            </div>
                        </div>
                        
                        <div className="text-right text-sm text-neutral-500">
                            <div>Progress: {sessionProgress}%</div>
                            <div className="w-24 h-1 bg-neutral-200 rounded-full mt-1">
                                <div 
                                    className="h-full bg-therapy-growth rounded-full transition-all duration-500"
                                    style={{ width: `${sessionProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Session Header */}
            <Card variant="therapy" className="animate-slide-in-down">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-therapy-calm">
                        {isUserTurn ? '💙' : '🌸'} {currentPartnerName}'s Reflection Time
                    </CardTitle>
                    <p className="text-neutral-600 mt-2">
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