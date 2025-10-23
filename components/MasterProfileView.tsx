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
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Profile & Settings</h1>
          <p className="text-white/80 text-sm sm:text-base">Manage your account and preferences</p>
        </motion.div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 -mt-12 sm:-mt-16 pb-8 sm:pb-12">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-24" />
            
            <CardContent className="p-4 sm:p-6 -mt-8 sm:-mt-12">
              {/* Avatar - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl border-4 border-white">
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
                      <button className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">
                      {formData.name || 'Your Name'}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formData.email}
                    </p>
                  </div>
                </div>

                {/* Edit Button - Mobile Optimized */}
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="mt-2 sm:mt-4 w-full sm:w-auto"
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
                    {/* Name Field - Mobile Optimized */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email Field - Mobile Optimized */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                        placeholder="your@email.com"
                      />
                    </div>

                    {/* Action Buttons - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-sm sm:text-base py-2 sm:py-3"
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
                        className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User Stats Section - Mobile Optimized */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
              >
                <Card className="text-center">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">12</div>
                    <div className="text-xs sm:text-xs text-gray-600 font-medium">Check-ins</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">8</div>
                    <div className="text-xs sm:text-xs text-gray-600 font-medium">Exercises</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">24</div>
                    <div className="text-xs sm:text-xs text-gray-600 font-medium">Days Active</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Settings Sections - Mobile Optimized */}
              <div className="space-y-3 sm:space-y-4">
                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 min-h-[60px] ${
                      activeSection === section.id
                        ? `bg-gradient-to-r ${section.color} text-white border-transparent shadow-lg`
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                      {section.icon}
                    </div>
                    <span className="font-medium flex-1 text-sm sm:text-base">{section.label}</span>
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                  </motion.button>
                ))}
              </div>

              {/* Section Content */}
              <AnimatePresence mode="wait">
                {activeSection === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white rounded-2xl border-2 border-gray-200"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Account Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-sm sm:text-base text-gray-700"><strong>Name:</strong> {user?.name}</p>
                      <p className="text-sm sm:text-base text-gray-700"><strong>Email:</strong> {user?.email}</p>
                      <Button onClick={() => setIsEditing(true)} className="mt-3 sm:mt-4 w-full sm:w-auto text-sm sm:text-base">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white rounded-2xl border-2 border-gray-200 space-y-3 sm:space-y-4"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notification Settings</h3>
                    {[
                      { label: 'Partner Messages', enabled: true },
                      { label: 'Check-in Reminders', enabled: true },
                      { label: 'Exercise Suggestions', enabled: false },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg min-h-[50px]">
                        <span className="text-sm sm:text-base text-gray-700">{item.label}</span>
                        <input type="checkbox" checked={item.enabled} readOnly className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeSection === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white rounded-2xl border-2 border-gray-200 space-y-2 sm:space-y-3"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Privacy & Security</h3>
                    {[
                      { label: 'Change Password', icon: '🔐' },
                      { label: 'Two-Factor Authentication', icon: '🛡️' },
                      { label: 'Data & Privacy', icon: '🌐' },
                    ].map((item, idx) => (
                      <button key={idx} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left min-h-[50px]">
                        <div className="flex items-center gap-3">
                          <span className="text-base sm:text-lg">{item.icon}</span>
                          <span className="text-sm sm:text-base text-gray-700 font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </button>
                    ))}
                  </motion.div>
                )}

                {activeSection === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white rounded-2xl border-2 border-gray-200 space-y-3 sm:space-y-4"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Appearance</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg min-h-[50px]">
                        <span className="text-sm sm:text-base text-gray-700">Dark Mode</span>
                        <input type="checkbox" readOnly className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg min-h-[50px]">
                        <span className="text-sm sm:text-base text-gray-700">Compact View</span>
                        <input type="checkbox" readOnly className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout Confirmation Modal - Mobile Optimized */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
              onClick={() => setShowLogoutConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-2xl"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-2">
                  Log out?
                </h3>
                <p className="text-center text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Are you sure you want to log out of your account?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base py-2 sm:py-3"
                  >
                    Log Out
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MasterProfileView;

