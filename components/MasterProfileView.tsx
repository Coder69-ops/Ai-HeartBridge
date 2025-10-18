// AI HeartBridge - Stunning Mobile-First Profile & Settings
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import { 
  User as UserIcon, 
  Mail, 
  Heart,
  Edit3,
  Save,
  X,
  Camera,
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Link as LinkIcon,
  Users,
  LogOut,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

interface MasterProfileViewProps {
  onBack: () => void;
}

const MasterProfileView: React.FC<MasterProfileViewProps> = ({ onBack }) => {
  const { user, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" />, color: 'from-emerald-500 to-cyan-500' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500' },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" />, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profile & Settings</h1>
          <p className="text-white/80">Manage your account and preferences</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-24" />
            
            <CardContent className="p-6 -mt-12">
              {/* Avatar */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                      {formData.avatar ? (
                        <img 
                          src={formData.avatar} 
                          alt={formData.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(formData.name)
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      {formData.name || 'Your Name'}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {formData.email}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="mt-4"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">Profile updated successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edit Form */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 mb-6"
                  >
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                        placeholder="your@email.com"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                      >
                        {isSaving ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="inline-block"
                            >
                              <Loader2 className="w-4 h-4 mr-2 inline-block" />
                            </motion.div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats */}
              {!isEditing && (
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">12</div>
                    <div className="text-sm text-gray-600">Check-ins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">8</div>
                    <div className="text-sm text-gray-600">Exercises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">24</div>
                    <div className="text-sm text-gray-600">Days Active</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <p className="text-sm text-gray-600">Manage your notification preferences</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Partner Messages', enabled: true },
                    { label: 'Check-in Reminders', enabled: true },
                    { label: 'Exercise Suggestions', enabled: false },
                    { label: 'Weekly Progress Reports', enabled: true },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-700">{item.label}</span>
                      <button
                        className={`w-12 h-6 rounded-full transition-colors ${
                          item.enabled ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                            item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Privacy & Security</h3>
                    <p className="text-sm text-gray-600">Keep your data safe and secure</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Change Password', icon: <Shield className="w-4 h-4" /> },
                    { label: 'Two-Factor Authentication', icon: <Shield className="w-4 h-4" /> },
                    { label: 'Data & Privacy', icon: <Globe className="w-4 h-4" /> },
                  ].map((item, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">{item.icon}</div>
                        <span className="text-gray-700">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                Log out?
              </h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Log Out
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasterProfileView;

