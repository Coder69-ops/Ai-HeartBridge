import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import Icon from './shared/Icon';

interface JournalNotificationProps {
  type: 'partner_completed' | 'insights_ready' | 'reminder';
  partnerName?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const JournalNotification: React.FC<JournalNotificationProps> = ({
  type,
  partnerName,
  onAction,
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  const getNotificationContent = () => {
    switch (type) {
      case 'partner_completed':
        return {
          icon: '📔',
          title: 'Partner Reflection Complete',
          message: `${partnerName} has completed their reflection. You can now share your perspective.`,
          actionText: 'Continue Journal',
          color: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'insights_ready':
        return {
          icon: '✨',
          title: 'Insights Ready',
          message: 'Both reflections have been analyzed. Your shared insights are ready to view.',
          actionText: 'View Insights',
          color: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600'
        };
      case 'reminder':
        return {
          icon: '💙',
          title: 'Gentle Reminder',
          message: `${partnerName} shared their thoughts. Take your time when you're ready to reflect.`,
          actionText: 'View Journal',
          color: 'bg-purple-50 border-purple-200',
          iconColor: 'text-purple-600'
        };
      default:
        return {
          icon: '📝',
          title: 'Journal Update',
          message: 'Your journal session has been updated.',
          actionText: 'View',
          color: 'bg-gray-50 border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const content = getNotificationContent();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 max-w-sm sm:w-full"
        >
          <Card className={`${content.color} border-2 shadow-lg`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className={`text-2xl sm:text-3xl ${content.iconColor} flex-shrink-0`}>
                  {content.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {content.message}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {onAction && (
                      <Button
                        onClick={() => {
                          onAction();
                          setIsVisible(false);
                        }}
                        size="sm"
                        className="text-xs sm:text-sm px-4 py-2 min-h-[36px] font-medium"
                      >
                        {content.actionText}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setIsVisible(false);
                        onDismiss?.();
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-xs sm:text-sm px-4 py-2 min-h-[36px] text-gray-500 hover:text-gray-700"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    onDismiss?.();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] p-2 flex items-center justify-center flex-shrink-0"
                >
                  <Icon name="x" className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JournalNotification;
