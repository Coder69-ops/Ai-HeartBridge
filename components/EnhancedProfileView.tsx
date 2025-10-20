import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { 
  AnimatedButton, 
  GlassmorphismCard, 
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
  ModernInput,
  InteractiveAnimation,
  ModernModal
} from '../src/components/ui/enhanced';
import { 
  User as UserIcon, 
  Settings, 
  Heart, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Mail, 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  MessageCircle,
  Shield,
  Bell,
  Palette,
  Globe,
  Clock,
  Baby,
  Star,
  Activity,
  Award,
  TrendingUp,
  Link as LinkIcon
} from 'lucide-react';

interface EnhancedProfileViewProps {
  onBack: () => void;
}

const EnhancedProfileView: React.FC<EnhancedProfileViewProps> = ({ onBack }) => {
  const { user, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editData, setEditData] = useState(user || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditData(user);
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(user || {});
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'relationship', label: 'Relationship', icon: Heart },
    { id: 'goals', label: 'Goals & Progress', icon: Target },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  const ProfileTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Avatar Section - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            )}
          </div>
          {isEditing && (
            <button className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
              <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
        
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
            {user?.profile?.firstName} {user?.profile?.lastName}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base truncate">{user?.email}</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Joined {user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 'Recently'}</span>
            </div>
            {user?.profile?.location?.city && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{user.profile.location.city}, {user.profile.location.country}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ModernInput
                    label="First Name"
                    value={editData.profile?.firstName || ''}
                    onChange={(value) => setEditData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, firstName: value }
                    }))}
                  />
                  <ModernInput
                    label="Last Name"
                    value={editData.profile?.lastName || ''}
                    onChange={(value) => setEditData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, lastName: value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <select
                      value={editData.profile?.age || ''}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        profile: { ...prev.profile, age: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Select age</option>
                      {Array.from({ length: 65 }, (_, i) => i + 18).map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={editData.profile?.gender || ''}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        profile: { ...prev.profile, gender: e.target.value }
                      }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{user?.profile?.age || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium capitalize">{user?.profile?.gender || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Status</h3>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-800">Account Verified</h4>
                  <p className="text-sm text-emerald-600">Your account is secure and verified</p>
                </div>
              </div>
            </div>

            {user?.coupleId ? (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800">Paired</h4>
                    <p className="text-sm text-purple-600">Connected with your partner</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">Not Paired</h4>
                    <p className="text-sm text-amber-600">Share your pairing code: <strong>{user?.pairingCode}</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const RelationshipTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Heart className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-800">Relationship Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium capitalize">{user?.profile?.relationshipStatus || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">
              {user?.profile?.relationshipDuration?.years || 0} years, {user?.profile?.relationshipDuration?.months || 0} months
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Living Together:</span>
            <span className="font-medium">{user?.profile?.livingTogether ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Children:</span>
            <span className="font-medium">
              {user?.profile?.hasChildren ? `Yes (${user?.profile?.childrenAges?.length || 0})` : 'No'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Communication Style</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Style:</span>
              <span className="font-medium capitalize">{user?.profile?.communicationStyle || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conflict Resolution:</span>
              <span className="font-medium capitalize">{user?.profile?.conflictResolutionStyle || 'Not specified'}</span>
            </div>
          </div>

          {user?.profile?.loveLanguages && user.profile.loveLanguages.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Love Languages</h4>
              <div className="flex flex-wrap gap-2">
                {user.profile.loveLanguages.map(language => (
                  <span
                    key={language}
                    className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full capitalize"
                  >
                    {language.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const GoalsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Target className="w-6 h-6 text-emerald-600" />
        <h3 className="text-xl font-semibold text-gray-800">Goals & Progress</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Current Goals</h4>
          {user?.profile?.primaryGoals && user.profile.primaryGoals.length > 0 ? (
            <div className="space-y-2">
              {user.profile.primaryGoals.map(goal => (
                <div key={goal} className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-800">{goal}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No goals set yet</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Areas for Growth</h4>
          {user?.profile?.areasForGrowth && user.profile.areasForGrowth.length > 0 ? (
            <div className="space-y-2">
              {user.profile.areasForGrowth.map(area => (
                <div key={area} className="flex items-center space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800">{area}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No growth areas identified</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Recent Activity</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Completed daily check-in</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
            <Award className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Journal entry shared</p>
              <p className="text-xs text-gray-500">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PreferencesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <h3 className="text-xl font-semibold text-gray-800">App Preferences</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-800">Notifications</h4>
                <p className="text-sm text-gray-600">Receive app notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user?.preferences?.notifications || false}
                className="sr-only peer"
                onChange={(e) => {
                  // Handle notification preference change
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Palette className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-gray-800">Theme</h4>
            </div>
            <select
              value={user?.preferences?.theme || 'system'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Globe className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-800">Language</h4>
            </div>
            <select
              value={user?.preferences?.language || 'en'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-gray-800">Session Preferences</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Session Length</label>
                <select
                  value={user?.profile?.preferredSessionLength || 30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select
                  value={user?.profile?.preferredTimeOfDay || 'evening'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
            <AnimatedButton
              variant="destructive"
              size="sm"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Sign Out
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No user data found</h2>
          <p className="text-gray-600">Please sign in again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <InteractiveAnimation hover tap>
              <button
                onClick={onBack}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </InteractiveAnimation>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Profile</h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            {!isEditing ? (
              <AnimatedButton
                variant="therapy"
                size="sm"
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit3 className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5"
              >
                Edit Profile
              </AnimatedButton>
            ) : (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  leftIcon={<X className="w-4 h-4" />}
                  className="flex-1 sm:flex-none text-sm sm:text-base py-2 sm:py-2.5"
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  variant="therapy"
                  size="sm"
                  onClick={handleSave}
                  loading={isLoading}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="flex-1 sm:flex-none text-sm sm:text-base py-2 sm:py-2.5"
                >
                  Save Changes
                </AnimatedButton>
              </div>
            )}
          </div>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-gray-200 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <InteractiveAnimation key={tab.id} hover tap>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              </InteractiveAnimation>
            ))}
          </div>
        </div>

        {/* Tab Content - Mobile Optimized */}
        <GlassmorphismCard variant="therapy" padding="lg">
          <GlassCardContent className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'relationship' && <RelationshipTab />}
                {activeTab === 'goals' && <GoalsTab />}
                {activeTab === 'preferences' && <PreferencesTab />}
              </motion.div>
            </AnimatePresence>
          </GlassCardContent>
        </GlassmorphismCard>

        {/* Logout Confirmation Modal */}
        <ModernModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          title="Confirm Sign Out"
        >
          <div className="space-y-4">
            <p className="text-gray-600">Are you sure you want to sign out of your account?</p>
            <div className="flex justify-end space-x-3">
              <AnimatedButton
                variant="ghost"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </AnimatedButton>
              <AnimatedButton
                variant="destructive"
                onClick={handleLogout}
              >
                Sign Out
              </AnimatedButton>
            </div>
          </div>
        </ModernModal>
      </div>
    </div>
  );
};

export default EnhancedProfileView;