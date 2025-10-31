// AI HeartBridge - Master Partner Pairing View
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Copy, 
  CheckCircle, 
  ArrowLeft,
  QrCode,
  Share2,
  AlertCircle,
  Loader2,
  Sparkles,
  UserPlus,
  Shield
} from 'lucide-react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import { pairUsers } from '../services/authService';
import { useToast } from '../src/components/ui/enhanced/ModernToast';

interface MasterPartnerPairingViewProps {
  user: User;
  onBack: () => void;
}

const MasterPartnerPairingView: React.FC<MasterPartnerPairingViewProps> = ({
  user,
  onBack
}) => {
  const { showToast } = useToast();
  const [pairingCode, setPairingCode] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [pairingStep, setPairingStep] = useState<'waiting' | 'connected' | 'error'>('waiting');
  const [error, setError] = useState<string | null>(null);

  const handlePairingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCode.trim()) return;

    setIsPairing(true);
    setError(null);

    try {
      const result = await pairUsers(user.id, pairingCode.trim());
      if (result.partner) {
        setPairingStep('connected');
        showToast({ type: 'success', title: 'Successfully paired with your partner! 💝' });
      } else {
        setError('Failed to pair with partner');
        setPairingStep('error');
      }
    } catch (error) {
      console.error('Pairing error:', error);
      setError('Failed to connect with partner. Please check the code and try again.');
      setPairingStep('error');
    } finally {
      setIsPairing(false);
    }
  };

  const copyPairingCode = () => {
    navigator.clipboard.writeText(user.pairingCode || '');
    showToast({ type: 'success', title: 'Pairing code copied to clipboard!' });
  };

  const sharePairingCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on AI HeartBridge',
          text: `Let's strengthen our relationship together! Use this code to connect: ${user.pairingCode}`,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyPairingCode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center text-emerald-600">
            <Heart className="w-6 h-6 mr-2" />
            <span className="font-semibold">Partner Pairing</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {pairingStep === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Your Pairing Code */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-700">
                    <Sparkles className="w-6 h-6 mr-2" />
                    Your Pairing Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-emerald-700 mb-4 font-mono tracking-wider">
                      {user.pairingCode || 'Loading...'}
                    </div>
                    <p className="text-emerald-600 mb-4">
                      Share this code with your partner to connect
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={copyPairingCode}
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button
                        onClick={sharePairingCode}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enter Partner's Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-700">
                    <Users className="w-6 h-6 mr-2" />
                    Connect with Partner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePairingSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your partner's pairing code
                      </label>
                      <Input
                        type="text"
                        value={pairingCode}
                        onChange={(e) => setPairingCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="text-center text-lg font-mono tracking-wider"
                        maxLength={6}
                        disabled={isPairing}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={!pairingCode.trim() || isPairing}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3"
                    >
                      {isPairing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5 mr-2" />
                          Connect with Partner
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {pairingStep === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <Card>
                <CardContent className="pt-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-700 mb-4">
                    Successfully Connected! 💝
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You and your partner are now connected. Start your journey together!
                  </p>
                  <Button
                    onClick={onBack}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3"
                  >
                    Continue to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {pairingStep === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-red-200">
                <CardContent className="pt-8">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-700 mb-4">
                    Connection Failed
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {error || 'Unable to connect with your partner. Please check the code and try again.'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setPairingStep('waiting');
                        setError(null);
                        setPairingCode('');
                      }}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={onBack}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              How to Connect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-blue-600">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                <p>Share your pairing code with your partner</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                <p>Your partner enters your code in their app</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                <p>You'll be connected and can start your journey together!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Notice */}
        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Safety First</h3>
                <p className="text-sm text-amber-700">
                  Only share your pairing code with your trusted partner. If you're experiencing abuse or need help, 
                  please contact local support services immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterPartnerPairingView;
