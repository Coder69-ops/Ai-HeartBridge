import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { useAuthStore } from '../store/authStore';
import { 
  AnimatedButton, 
  GlassmorphismCard, 
  GlassCardContent,
  ModernInput,
  InteractiveAnimation,
  PageTransition,
  BreathingAnimation,
  FloatingActionButton,
  PulseIndicator,
  toast
} from '../src/components/ui/enhanced';
import { 
  Send, 
  Heart, 
  MessageCircle, 
  Type, 
  Bot, 
  User, 
  Lightbulb, 
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  Smile,
  ThumbsUp,
  Star,
  Coffee,
  Moon,
  Sun,
  Zap,
  Target
} from 'lucide-react';

interface EnhancedChatViewProps {
  partnerName?: string;
  onComplete?: (chatHistory: Message[]) => void;
  isReturningUser?: boolean;
  mode?: 'therapy' | 'casual' | 'relationship' | 'support';
}

// Bot personality configurations
const BOT_PERSONALITIES = {
  therapy: {
    name: 'Dr. Bridge',
    avatar: '🧠',
    color: 'emerald',
    greeting: 'Hello there 🌸 I\'m Dr. Bridge, your AI therapy companion. I\'m here to provide a safe space for reflection. What\'s on your mind today?',
    style: 'professional and empathetic'
  },
  casual: {
    name: 'Buddy',
    avatar: '😊',
    color: 'blue',
    greeting: 'Hey! I\'m Buddy, your friendly AI companion. Ready to chat about anything? What\'s happening in your world?',
    style: 'friendly and casual'
  },
  relationship: {
    name: 'Cupid',
    avatar: '💕',
    color: 'pink',
    greeting: 'Hi love birds! 💝 I\'m Cupid, your relationship guide. I\'m here to help strengthen your bond. What would you like to explore together?',
    style: 'romantic and supportive'
  },
  support: {
    name: 'Hope',
    avatar: '🤗',
    color: 'purple',
    greeting: 'Welcome 🌟 I\'m Hope, your support companion. Remember, you\'re never alone in this journey. How can I support you today?',
    style: 'nurturing and encouraging'
  }
};

// Suggested responses for different contexts
const SUGGESTED_RESPONSES = {
  initial: [
    "Tell me about your day",
    "I'm feeling stressed lately",
    "My relationship is going well",
    "I need some advice",
    "Let's talk about my goals"
  ],
  emotional: [
    "That sounds challenging",
    "I understand how you feel",
    "Can you tell me more?",
    "What would help right now?",
    "You're doing great"
  ],
  relationship: [
    "We're working through something",
    "I want to improve communication",
    "Tell me about love languages",
    "Help with conflict resolution",
    "Planning our future together"
  ]
};

const EnhancedChatView: React.FC<EnhancedChatViewProps> = ({ 
  partnerName, 
  onComplete, 
  isReturningUser = false,
  mode = 'therapy'
}) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isChatComplete, setIsChatComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState(SUGGESTED_RESPONSES.initial);
  const [botPersonality, setBotPersonality] = useState(BOT_PERSONALITIES[mode]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionStartRef = useRef<Date>(new Date());

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update word counts
  useEffect(() => {
    const words = userInput.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [userInput]);

  // Calculate total words and sentiment
  useEffect(() => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const totalWords = userMessages.reduce((total, msg) => {
      const words = msg.text.trim().split(/\s+/).filter(word => word.length > 0);
      return total + words.length;
    }, 0);
    setTotalWordCount(totalWords);

    // Simple sentiment analysis based on keywords
    const lastUserMessage = userMessages[userMessages.length - 1];
    if (lastUserMessage) {
      const text = lastUserMessage.text.toLowerCase();
      const positiveWords = ['happy', 'good', 'great', 'love', 'amazing', 'wonderful', 'excited', 'grateful'];
      const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'depressed', 'difficult', 'stressed'];
      
      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;
      
      if (positiveCount > negativeCount) {
        setSentiment('positive');
        setCurrentSuggestions(SUGGESTED_RESPONSES.emotional);
      } else if (negativeCount > positiveCount) {
        setSentiment('negative');
        setCurrentSuggestions(SUGGESTED_RESPONSES.emotional);
      } else {
        setSentiment('neutral');
      }
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  // Initialize chat
  useEffect(() => {
    setIsBotTyping(true);
    setTimeout(() => {
      const welcomeMessage: Message = {
        sender: 'bot',
        text: isReturningUser 
          ? `Welcome back, ${(user as any)?.firstName || 'friend'}! 🤗 I'm here whenever you're ready to continue our conversation. How are you feeling today?`
          : botPersonality.greeting
      };
      setMessages([welcomeMessage]);
      setIsBotTyping(false);
    }, 1500);
  }, [isReturningUser, botPersonality, user]);

  // Text-to-speech for bot messages
  const speakMessage = useCallback((text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  }, [isVoiceEnabled]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || userInput;
    if (!text.trim() || isBotTyping || isChatComplete) return;

    const newUserMessage: Message = { sender: 'user', text };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setShowSuggestions(false);
    setIsBotTyping(true);
    setError(null);

    try {
      let botResponseText = await getChatbotResponse(updatedMessages);
      
      // Check for conversation completion
      if (botResponseText.includes('[CONVERSATION_COMPLETE]')) {
        botResponseText = botResponseText.replace('[CONVERSATION_COMPLETE]', '').trim();
        setIsChatComplete(true);
        toast.success('Great conversation! You can continue or wrap up whenever you are ready.');
      }

      const botMessage: Message = { sender: 'bot', text: botResponseText };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Speak bot response if voice is enabled
      speakMessage(botResponseText);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection issue occurred.";
      setError(errorMessage);
      const errorBotMessage: Message = { 
        sender: 'bot', 
        text: `I'm having a little trouble connecting right now. Please check your connection or try again in a moment. 🔄`
      };
      setMessages(prevMessages => [...prevMessages, errorBotMessage]);
      toast.error('Connection issue - please try again');
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
    handleSendMessage(suggestion);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative': return <Heart className="w-4 h-4 text-red-500" />;
      default: return <MessageCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const resetChat = () => {
    setMessages([]);
    setUserInput('');
    setIsChatComplete(false);
    setError(null);
    setShowSuggestions(true);
    setCurrentSuggestions(SUGGESTED_RESPONSES.initial);
    sessionStartRef.current = new Date();
    
    // Reinitialize with welcome message
    setTimeout(() => {
      const welcomeMessage: Message = {
        sender: 'bot',
        text: 'Fresh start! 🌟 What would you like to talk about?'
      };
      setMessages([welcomeMessage]);
    }, 500);
    
    toast.success('Chat reset - ready for a fresh conversation!');
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6 p-4">
        {/* Enhanced Header with Stats and Controls */}
        <GlassmorphismCard className="backdrop-blur-xl">
          <GlassCardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <BreathingAnimation>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0">
                    {botPersonality.avatar}
                  </div>
                </BreathingAnimation>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                    Chat with {botPersonality.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Your AI companion • Private & Secure 🔒
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <InteractiveAnimation hover tap>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className={`${isVoiceEnabled ? 'text-emerald-600' : 'text-gray-400'} p-2`}
                  >
                    {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </AnimatedButton>
                </InteractiveAnimation>
                
                <InteractiveAnimation hover tap>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={resetChat}
                    className="text-gray-600 hover:text-red-500 p-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </AnimatedButton>
                </InteractiveAnimation>
              </div>
            </div>

            {/* Session Statistics - Mobile Optimized */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Messages</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {messages.filter(m => m.sender === 'user').length}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <Type className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Words</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">{totalWordCount}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Duration</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{formatDuration(sessionDuration)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  {getSentimentIcon()}
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Mood</span>
                </div>
                <p className="text-sm sm:text-lg font-semibold capitalize text-gray-700">{sentiment}</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassmorphismCard>

        {/* Chat Messages Container - Mobile Optimized */}
        <GlassmorphismCard className="h-[50vh] sm:h-[60vh] flex flex-col backdrop-blur-xl">
          <GlassCardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex items-end gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <BreathingAnimation>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-lg shadow-lg flex-shrink-0">
                          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </BreathingAnimation>
                    )}
                    
                    <InteractiveAnimation hover>
                      <div className={`max-w-xs sm:max-w-md lg:max-w-lg p-3 sm:p-4 rounded-2xl shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md' 
                          : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-md border border-gray-200'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        {msg.sender === 'bot' && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500">{botPersonality.name}</span>
                            <div className="flex space-x-1">
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <ThumbsUp className="w-3 h-3 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <Star className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </InteractiveAnimation>
                    
                    {msg.sender === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Bot Typing Indicator */}
              <AnimatePresence>
                {isBotTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-end gap-4 justify-start"
                  >
                    <PulseIndicator className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </PulseIndicator>
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-emerald-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-emerald-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-emerald-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {botPersonality.name} is thinking...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>
          </GlassCardContent>

          {/* Input Area - Mobile Optimized */}
          <div className="p-3 sm:p-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
            {isChatComplete ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="flex items-center justify-center space-x-2 text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-lg font-semibold">Great conversation!</span>
                  <Sparkles className="w-5 h-5" />
                </div>
                <AnimatedButton 
                  onClick={() => onComplete?.(messages)} 
                  variant="therapy" 
                  size="lg" 
                  className="px-8"
                >
                  Complete Session & Continue
                </AnimatedButton>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* Suggested Responses - Mobile Optimized */}
                <AnimatePresence>
                  {showSuggestions && currentSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-1 sm:gap-2"
                    >
                      {currentSuggestions.slice(0, 3).map((suggestion, index) => (
                        <motion.button
                          key={suggestion}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-full transition-colors duration-200 flex items-center space-x-1"
                        >
                          <Lightbulb className="w-3 h-3" />
                          <span className="truncate max-w-[120px] sm:max-w-none">{suggestion}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="space-y-3">
                  {/* Word count indicator */}
                  {userInput.trim() && (
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{wordCount} words</span>
                      <span className="text-emerald-600 flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>Every word matters</span>
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-end gap-2 sm:gap-3">
                    <div className="flex-1">
                      <ModernInput
                        ref={inputRef}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isBotTyping ? `${botPersonality.name} is typing...` : "Share what's on your mind... 💭"}
                        disabled={isBotTyping}
                        className="rounded-2xl text-sm sm:text-base"
                        onFocus={() => setShowSuggestions(false)}
                      />
                    </div>
                    <AnimatedButton 
                      type="submit" 
                      disabled={isBotTyping || !userInput.trim()} 
                      variant="therapy"
                      size="lg"
                      className="rounded-2xl px-4 sm:px-6 min-h-[40px] sm:min-h-[44px]"
                      ripple
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </AnimatedButton>
                  </div>
                </form>
              </div>
            )}

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center space-x-2 text-red-600"
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassmorphismCard>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <FloatingActionButton
            onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <MessageCircle className="w-5 h-5" />
          </FloatingActionButton>
          
          <FloatingActionButton
            onClick={() => inputRef.current?.focus()}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Type className="w-5 h-5" />
          </FloatingActionButton>
        </div>
      </div>
    </PageTransition>
  );
};

export default EnhancedChatView;