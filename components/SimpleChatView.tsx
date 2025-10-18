// Simple, focused chat for AI HeartBridge therapy sessions
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { Button } from './shared/Button';
import { Card, CardContent } from './shared/Card';

interface SimpleChatViewProps {
  partnerName?: string;
  onComplete?: (chatHistory: Message[]) => void;
  isReturningUser?: boolean;
}

const SimpleChatView: React.FC<SimpleChatViewProps> = ({ 
  partnerName, 
  onComplete, 
  isReturningUser = false 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isChatComplete, setIsChatComplete] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting from Bridge
  useEffect(() => {
    const greeting = isReturningUser
      ? "Welcome back 🤗 I'm here to listen whenever you're ready to share what's on your heart 💙"
      : "Hello there 🌸 I'm Bridge, your private counselor. I'm here to help you reflect. What's weighing on your mind today? 💭";
    
    setMessages([{ sender: 'bot', text: greeting }]);
  }, [isReturningUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update word counts
  useEffect(() => {
    const words = userInput.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [userInput]);

  useEffect(() => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const total = userMessages.reduce((sum, msg) => {
      const words = msg.text.trim().split(/\s+/).filter(w => w.length > 0);
      return sum + words.length;
    }, 0);
    setTotalWords(total);
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isBotTyping) return;

    const userMessage: Message = { sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsBotTyping(true);

    try {
      const updatedHistory = [...messages, userMessage];
      const response = await getChatbotResponse(updatedHistory);
      
      const botMessage: Message = { sender: 'bot', text: response };
      setMessages(prev => [...prev, botMessage]);

      // Check if conversation is complete
      if (response.includes('[CONVERSATION_COMPLETE]')) {
        setIsChatComplete(true);
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = { 
        sender: 'bot', 
        text: "I'm having trouble connecting right now 💙 Please try again in a moment." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isChatComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12 space-y-6">
          <div className="mx-auto w-20 h-20 bg-therapy-growth/10 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-therapy-growth" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-therapy-calm mb-2">
              Thank You for Sharing 💝
            </h3>
            <p className="text-neutral-600">
              You shared <strong>{totalWords} words</strong> from your heart today.
            </p>
          </div>
          <Button 
            onClick={() => onComplete?.(messages)} 
            variant="therapy" 
            size="lg"
            className="px-8"
          >
            Complete Reflection & Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-neutral-200 bg-therapy-safe/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-therapy-calm" />
              <span className="font-medium text-therapy-calm">Bridge</span>
              <span className="text-xs text-neutral-500">Your AI Counselor</span>
            </div>
            <div className="text-sm text-neutral-600">
              {totalWords} words shared
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-therapy-safe/5 to-white">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-therapy-warmth text-white rounded-br-md'
                      : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text.replace('[CONVERSATION_COMPLETE]', '')}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isBotTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-neutral-200 p-4 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-therapy-calm rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500">Bridge is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-neutral-200 bg-white">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            {userInput.trim() && (
              <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                <span>{wordCount} words</span>
                <span className="text-therapy-calm flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Every word matters
                </span>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isBotTyping ? "Bridge is typing..." : "Share what's on your mind... 💭"}
                disabled={isBotTyping}
                className="flex-1 px-4 py-3 border-2 border-therapy-calm/20 rounded-xl focus:outline-none focus:border-therapy-calm focus:ring-2 focus:ring-therapy-calm/20 transition-all duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
              <Button
                type="submit"
                disabled={isBotTyping || !userInput.trim()}
                variant="therapy"
                size="lg"
                className="px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleChatView;

