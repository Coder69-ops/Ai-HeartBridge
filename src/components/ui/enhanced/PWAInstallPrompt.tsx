import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AnimatedButton, 
  GlassmorphismCard, 
  GlassCardContent,
  InteractiveAnimation
} from './index';
import { Download, X, Smartphone, Monitor, Heart } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Detect platform
    const detectPlatform = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setPlatform(isMobile ? 'mobile' : 'desktop');
    };

    checkInstalled();
    detectPlatform();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Don't show immediately, wait a bit for user to explore
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 30000); // Show after 30 seconds
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed, dismissed, or no prompt available
  if (isInstalled || 
      sessionStorage.getItem('pwa-prompt-dismissed') || 
      !deferredPrompt || 
      !showPrompt) {
    return null;
  }

  const PlatformIcon = platform === 'mobile' ? Smartphone : Monitor;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <GlassmorphismCard 
          variant="therapy" 
          padding="lg"
          className="relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-300/30 rounded-full transform translate-x-16 -translate-y-16" />
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          <GlassCardContent>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Heart className="w-6 h-6 text-white" />
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Install HeartBridge
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get the full app experience
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <PlatformIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">
                    {platform === 'mobile' ? 'Add to home screen' : 'Desktop app experience'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">Works offline</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">Faster and more reliable</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <AnimatedButton
                  variant="therapy"
                  size="sm"
                  onClick={handleInstallClick}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="flex-1"
                  animation="bounce"
                >
                  Install App
                </AnimatedButton>
                
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-gray-600"
                >
                  Not now
                </AnimatedButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassmorphismCard>
      </motion.div>
    </AnimatePresence>
  );
};

// Install banner for browsers that don't support beforeinstallprompt
const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isPWA);

    // Show banner on iOS Safari (doesn't support beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari && !isPWA && !sessionStorage.getItem('ios-install-banner-dismissed')) {
      setTimeout(() => setShowBanner(true), 10000); // Show after 10 seconds
    }
  }, []);

  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 z-50"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Heart className="w-5 h-5" />
            <div>
              <p className="font-medium">Install HeartBridge</p>
              <p className="text-sm opacity-90">
                Tap <span className="font-semibold">Share</span> then <span className="font-semibold">Add to Home Screen</span>
              </p>
            </div>
          </div>
          
          <InteractiveAnimation hover tap>
            <button
              onClick={() => {
                setShowBanner(false);
                sessionStorage.setItem('ios-install-banner-dismissed', 'true');
              }}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </InteractiveAnimation>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export { PWAInstallPrompt, PWAInstallBanner };
export type { PWAInstallPromptProps };