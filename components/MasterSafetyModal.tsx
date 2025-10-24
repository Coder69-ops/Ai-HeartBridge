// AI HeartBridge - Stunning Safety & Crisis Resources Modal
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import { 
  AlertTriangle,
  Phone,
  MessageCircle,
  ExternalLink,
  Shield,
  Heart,
  X,
  Info
} from 'lucide-react';

interface MasterSafetyModalProps {
  onClose: () => void;
  onNavigateToSafetyCenter?: () => void;
}

const MasterSafetyModal: React.FC<MasterSafetyModalProps> = ({ onClose, onNavigateToSafetyCenter }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-modal-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-lg w-full"
        >
          <Card className="overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h2 id="safety-modal-title" className="text-2xl font-bold mb-1">
                    Your Safety Matters
                  </h2>
                  <p className="text-white/90 text-sm">
                    Emergency resources available 24/7
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Emergency Notice */}
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-900 mb-1">
                      If you are in immediate danger:
                    </p>
                    <p className="text-red-800">
                      Call <strong>911</strong> (US), <strong>112</strong> (EU), or your local emergency services immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Crisis Hotlines */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  Crisis Support Hotlines
                </h3>

                <div className="space-y-3">
                  {/* National Domestic Violence Hotline */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      National Domestic Violence Hotline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <a
                        href="tel:1-800-799-7233"
                        className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        <span>1-800-799-7233</span>
                      </a>
                      <a
                        href="tel:1-800-787-3224"
                        className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>1-800-787-3224 (TTY)</span>
                      </a>
                      <a
                        href="https://www.thehotline.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>thehotline.org (Online Chat)</span>
                      </a>
                    </div>
                  </div>

                  {/* National Suicide Prevention Lifeline */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      National Suicide Prevention Lifeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <a
                        href="tel:988"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        <span>988 (Crisis & Suicide Hotline)</span>
                      </a>
                      <a
                        href="https://988lifeline.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>988lifeline.org</span>
                      </a>
                    </div>
                  </div>

                  {/* Crisis Text Line */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Crisis Text Line
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <MessageCircle className="w-4 h-4" />
                        <span>Text <strong>HOME</strong> to <strong>741741</strong></span>
                      </div>
                      <a
                        href="https://www.crisistextline.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>crisistextline.org</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold mb-1">Privacy & Safety Tip</p>
                    <p>
                      Consider using a private/incognito browser window and clearing your history 
                      if you have safety concerns about someone monitoring your device.
                    </p>
                  </div>
                </div>
              </div>

              {/* About AI HeartBridge */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p>
                      <strong>AI HeartBridge</strong> is designed to support healthy relationships 
                      and improve communication. While we use evidence-based approaches, we are <strong>not</strong> a crisis 
                      service or a substitute for professional mental health care or emergency services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                size="lg"
              >
                I Understand
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MasterSafetyModal;

