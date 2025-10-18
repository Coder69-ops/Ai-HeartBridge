import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPartnerChat, 
  sendPartnerMessage, 
  markMessagesAsRead,
  formatMessageTime,
  isMyMessage,
  isMessageDeleted,
  isMessageEdited,
  getMessageStatus,
  type PartnerMessage,
  type PartnerChatResponse 
} from '../services/partnerChatService';
import { Button } from './shared/Button';
import Icon from './shared/Icon';
import { Loader } from './shared/Loader';

interface PartnerChatViewProps {
  onBack: () => void;
}

const PartnerChatView: React.FC<PartnerChatViewProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Fetch partner chat data
  const {
    data: chatData,
    isLoading,
    error,
    refetch
  } = useQuery<PartnerChatResponse>({
    queryKey: ['partner-chat'],
    queryFn: getPartnerChat,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
    staleTime: 5000
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => sendPartnerMessage(message),
    onSuccess: (data) => {
      // Update the chat data optimistically
      queryClient.setQueryData(['partner-chat'], (oldData: PartnerChatResponse | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          chat: {
            ...oldData.chat,
            messages: [...oldData.chat.messages, data.messageData],
            totalMessages: data.chat.totalMessages,
            lastMessageAt: data.chat.lastMessageAt
          }
        };
      });
      
      setMessageText('');
      scrollToBottom();
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    }
  });

  // Mark messages as read mutation
  const markReadMutation = useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: () => {
      // Update read status for messages
      queryClient.setQueryData(['partner-chat'], (oldData: PartnerChatResponse | undefined) => {
        if (!oldData || !user) return oldData;
        
        return {
          ...oldData,
          chat: {
            ...oldData.chat,
            messages: oldData.chat.messages.map(msg => 
              msg.receiverId === user.id ? { ...msg, isRead: true } : msg
            ),
            unreadCount: 0
          }
        };
      });
    }
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark messages as read when component loads or new messages arrive
  useEffect(() => {
    if (chatData?.chat.unreadCount && chatData.chat.unreadCount > 0) {
      markReadMutation.mutate();
    }
  }, [chatData?.chat.messages.length]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatData?.chat.messages]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(messageText.trim());
  };

  // Handle typing indicator
  useEffect(() => {
    if (messageText.trim()) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [messageText]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Icon name="alert-circle" className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Connection Error</h3>
        <p className="text-gray-400 mb-4">
          Unable to load your partner chat. Please check your connection.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Icon name="message-circle" className="w-16 h-16 text-purple-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Partner Found</h3>
        <p className="text-gray-400 mb-4">
          You need to be paired with someone to start chatting.
        </p>
        <Button onClick={onBack} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const { chat, partner } = chatData;

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Button
            onClick={onBack}
            variant="ghost"
            className="p-2 hover:bg-white/10"
          >
            <Icon name="arrow-left" className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {partner.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {partner.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              )}
            </div>
            
            <div>
              <h2 className="text-white font-semibold">{partner.name}</h2>
              <p className="text-xs text-gray-400">
                {partner.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {chat.totalMessages} messages
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {chat.messages.map((message) => {
            const isMyMsg = isMyMessage(message, user?.id || '');
            const isDeleted = isMessageDeleted(message);
            const isEdited = isMessageEdited(message);
            const status = getMessageStatus(message, isMyMsg);

            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isMyMsg 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'bg-white/10 text-white backdrop-blur-sm'
                }`}>
                  {isDeleted ? (
                    <p className="italic text-gray-400 text-sm">This message was deleted</p>
                  ) : (
                    <>
                      <p className="text-sm">{message.text}</p>
                      {message.messageType === 'emoji' && (
                        <span className="text-2xl">{message.text}</span>
                      )}
                    </>
                  )}
                  
                  <div className={`flex items-center justify-between mt-1 text-xs ${
                    isMyMsg ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    <span>{formatMessageTime(message.timestamp)}</span>
                    {(isEdited || status) && (
                      <span className="ml-2">
                        {isEdited && 'Edited • '}
                        {status}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {chat.messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-8"
          >
            <Icon name="heart" className="w-16 h-16 text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Start Your Conversation</h3>
            <p className="text-gray-400 max-w-md">
              Send your first message to {partner.name} and begin your private conversation together.
            </p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${partner.name}...`}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={sendMessageMutation.isPending}
            />
            {isTyping && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
          >
            {sendMessageMutation.isPending ? (
              <Loader className="w-4 h-4" />
            ) : (
              <Icon name="send" className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PartnerChatView;