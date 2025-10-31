// Enhanced JournalingView with modern UX and therapy-focused design
import React, { useState, useEffect } from 'react';
import { Message, User } from '../types';
import SimpleChatView from './SimpleChatView';
import { Button } from './shared/Button';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import Icon from './shared/Icon';
import { completeJournalReflection, JournalSessionStatus } from '../services/journalSessionService';
import InsightsDisplay from './InsightsDisplay';
import { socket } from '../services/socketService';

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

import { useMachine } from '@xstate/react';
import { journalingMachine } from './JournalingView.machine';

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
    const [state, send] = useMachine(journalingMachine, {
        context: {
            user,
            partner,
            sessionId,
            userChat: initialUserChat || [],
            partnerChat: initialPartnerChat || [],
            insights: insights || null,
            sessionStatus: initialSessionStatus || 'created'
        }
    });

    useEffect(() => {
        socket.connect();

        socket.on('partner_completed', () => {
            send('PARTNER_COMPLETED');
        });

        socket.on('insights_ready', (data) => {
            send({ type: 'INSIGHTS_READY', insights: data.insights });
        });

        return () => {
            socket.disconnect();
        };
    }, [send]);
    


    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {state.matches('journaling.userReflection') && (
                <SimpleChatView
                    partnerName={state.context.user?.name || ''}
                    onComplete={(chatHistory) => send({ type: 'COMPLETE_REFLECTION', chatHistory })}
                    isReturningUser={isReturningUser}
                    initialMessages={state.context.userChat}
                    isCompleting={state.matches('journaling.userReflection')}
                />
            )}
            {state.matches('journaling.waitingForPartner') && (
                <div className="max-w-2xl mx-auto p-4 sm:p-6">
                    <Card variant="therapy" className="text-center animate-fade-in">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-yellow-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                <Icon name="clock" className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
                            </div>
                            <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                                ⏳ Waiting for {state.context.partner?.name || 'your partner'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                                You have completed your reflection. {state.context.partner?.name || 'Your partner'} will be notified to complete their reflection. You'll be notified when both reflections are ready to view together.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
            {state.matches('journaling.generatingInsights') && (
                <div className="max-w-2xl mx-auto p-4 sm:p-6">
                    <Card variant="therapy" className="text-center animate-fade-in">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                <Icon name="brain" className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                                🧠 Generating Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                                Both partners have completed their reflections. Our AI is analyzing your relationship patterns and generating personalized insights. This may take a few moments.
                            </p>
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-therapy-calm"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {state.matches('journaling.insightsReady') && (
                <InsightsDisplay 
                    insights={state.context.insights || ''}
                    onContinue={() => onComplete({ partner1Chat: state.context.userChat, partner2Chat: state.context.partnerChat })}
                />
            )}
            {state.matches('journaling.insightsFailed') && (
                <div className="max-w-2xl mx-auto p-4 sm:p-6">
                    <Card variant="therapy" className="text-center animate-fade-in">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-red-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                <Icon name="alert-circle" className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                            </div>
                            <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                                Error Generating Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                                {state.context.error}
                            </p>
                            <Button onClick={() => send('RETRY')}>Retry</Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default JournalingView;