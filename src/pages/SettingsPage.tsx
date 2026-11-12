import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Moon,
  Sun,
  Bell,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Cloud,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  User,
  LogIn,
  UserPlus,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationPreferences } from '../types';
import { translations } from '../lib/i18n';
import { createAvatarSvgDataUri } from '../lib/mediaPlaceholders';
import { dispatchActionToast } from '../components/video/VideoActionsMenu';

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const {
    profile,
    role,
    language,
    setLanguage,
    theme,
    toggleTheme,
    logout,
    updateUserProfile,
    notificationPreferences,
    updateNotificationPreferences,
  } = useAuth();
  const isAdmin =
    role === 'admin' ||
    profile?.role === 'admin' ||
    profile?.email === 'amytzee@gmail.com';
  const t = translations[language];
  const isEn = language === 'en';

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(profile?.displayName || '');
  const [editPhoto, setEditPhoto] = useState<string>(profile?.photoURL || '');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [notifSavedNotice, setNotifSavedNotice] = useState<boolean>(false);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');

  // Cloudinary Settings State (Admin only)
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState<string>('ecsswynm');
  const [cloudinaryPreset, setCloudinaryPreset] = useState<string>('malimai12');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState<string>('');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState<string>('');
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isTestingCloudinary, setIsTestingCloudinary] = useState<boolean>(false);
  const [isSavingCloudinary, setIsSavingCloudinary] = useState<boolean>(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    mode?: string;
  } | null>(null);

  useEffect(() => {
    setEditName(profile?.displayName || '');
    setEditPhoto(profile?.photoURL || '');
  }, [profile?.displayName, profile?.photoURL]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/cloudinary/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.cloudName) setCloudinaryCloudName(data.cloudName);
        if (data.uploadPreset) setCloudinaryPreset(data.uploadPreset);
      })
      .catch(() => {});
  }, [isAdmin]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSavingProfile(true);
    setProfileFeedback(null);
    const ok = await updateUserProfile({
      displayName: editName.trim(),
      photoURL: editPhoto.trim() || createAvatarSvgDataUri(editName.trim()),
    });
    setIsSavingProfile(false);
    if (ok) {
      setIsEditingProfile(false);
      setProfileFeedback(
        isEn
          ? 'Profile changes saved successfully.'
          : 'Mabadiliko ya wasifu yamehifadhiwa kikamilifu.'
      );
      dispatchActionToast({
        message: isEn ? 'Profile updated!' : 'Wasifu wako umesasishwa!',
      });
      setTimeout(() => setProfileFeedback(null), 3500);
    }
  };

  const handleToggleNotifPref = (key: keyof NotificationPreferences) => {
    updateNotificationPreferences({ [key]: !notificationPreferences[key] });
    setNotifSavedNotice(true);
    setTimeout(() => setNotifSavedNotice(false), 2000);
  };

  const handleSaveCloudinaryConfig = async () => {
    if (!cloudinaryCloudName.trim()) {
      setSaveStatusMessage(isEn ? 'Please enter Cloud Name.' : 'Tafadhali weka Cloud Name.');
      return;
    }
    setIsSavingCloudinary(true);
    setSaveStatusMessage(null);
    try {
      const res = await fetch('/api/cloudinary/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudName: cloudinaryCloudName.trim(),
          uploadPreset: cloudinaryPreset.trim(),
          apiKey: cloudinaryApiKey.trim(),
          apiSecret: cloudinaryApiSecret.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatusMessage(
          isEn
            ? '✓ Cloudinary configuration saved!'
            : '✓ Taarifa za Cloudinary zimehifadhiwa kikamilifu!'
        );
        setTimeout(() => setSaveStatusMessage(null), 3500);
      } else {
        setSaveStatusMessage(data.error || (isEn ? 'Failed to save.' : 'Imeshindikana kuhifadhi.'));
      }
    } catch (err: any) {
      setSaveStatusMessage(err.message || (isEn ? 'Network error' : 'Hitilafu ya mtandao'));
    } finally {
      setIsSavingCloudinary(false);
    }
  };

  const handleTestCloudinaryConnection = async () => {
    setIsTestingCloudinary(true);
    setTestResult(null);
    try {
      await fetch('/api/cloudinary/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudName: cloudinaryCloudName.trim(),
          uploadPreset: cloudinaryPreset.trim(),
          apiKey: cloudinaryApiKey.trim(),
          apiSecret: cloudinaryApiSecret.trim(),
        }),
      });

      const res = await fetch('/api/cloudinary/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message:
          err.message ||
          (isEn
            ? 'Error connecting to Cloudinary.'
            : 'Hitilafu wakati wa kuunganisha na Cloudinary.'),
      });
    } finally {
      setIsTestingCloudinary(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'futa') {
      setShowDeleteModal(false);
      logout();
    }
  };

  const avatarSeedChoices = [
    profile?.displayName || 'Tazama',
    `${profile?.displayName || 'User'} TZ`,
    'Bongo Creator',
    'Kilimanjaro',
  ];

  const notifRows: Array<{
    key: keyof NotificationPreferences;
    title: string;
    desc: string;
  }> = [
    {
      key: 'newVideos',
      title: isEn ? 'New uploads & Shorts' : 'Video mpya kutoka vituo unavyofuatilia',
      desc: isEn
        ? 'Get notified when followed creators publish new videos or go live.'
        : 'Pata arifa pindi waumbaji unaowafuatilia wanapopakia video au kwenda mubashara.',
    },
    {
      key: 'commentsReplies',
      title: isEn ? 'Comments & replies' : 'Maoni na majibu mapya',
      desc: isEn
        ? 'Notifications when viewers reply to your comments or like them.'
        : 'Arifa pindi watazamaji wanapojibu au kupenda maoni yako.',
    },
    {
      key: 'giftsTips',
      title: isEn ? 'Gifts & Wallet updates' : 'Zawadi na miamala ya Wallet',
      desc: isEn
        ? 'Confirmations for M-Pesa deposits, gifts sent, and creator tips.'
        : 'Uthibitisho wa salio la M-Pesa, zawadi zinazotumwa, na tips.',
    },
    {
      key: 'platformUpdates',
      title: isEn ? 'Platform announcements' : 'Taarifa muhimu za jukwaa',
      desc: isEn
        ? 'New Tazama features, security notices, and creator program updates.'
        : 'Vipengele vipya vya Tazama, usalama wa akaunti na matangazo ya mfumo.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-[#242B3B]">
        <div className="w-10 h-10 rounded-xl bg-[#FF3040] flex items-center justify-center text-white shadow-md shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 dark:text-white truncate">{t.settings}</h1>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] truncate">
            {isEn
              ? 'Manage your profile, appearance, language, and notification settings'
              : 'Usimamizi wa wasifu wako, lugha, muonekano, arifa na usalama'}
          </p>
        </div>
      </div>

      {/* 1. Profile Card & Editor */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] space-y-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {isEn ? 'Profile Details' : 'Taarifa za Wasifu (Profile)'}
          </h2>
          {profile && profile.uid && !isEditingProfile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2534] dark:hover:bg-[#262E3E] text-slate-800 dark:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#FF3040]" />
              <span>{isEn ? 'Edit Profile' : 'Hariri Wasifu'}</span>
            </button>
          )}
        </div>

        {profileFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#16C784]/10 border border-emerald-200 dark:border-[#16C784]/30 text-xs font-semibold text-emerald-700 dark:text-[#16C784] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{profileFeedback}</span>
          </div>
        )}

        {profile && profile.uid ? (
          isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={editPhoto || createAvatarSvgDataUri(editName || 'User')}
                  alt={editName || 'Avatar'}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createAvatarSvgDataUri(editName || 'User');
                  }}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#FF3040] bg-slate-100 dark:bg-[#10131B] shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-[#94A3B8]">
                    {isEn ? 'Choose quick avatar style:' : 'Chagua mtindo wa picha ya wasifu:'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {avatarSeedChoices.map((seed) => {
                      const uri = createAvatarSvgDataUri(seed);
                      return (
                        <button
                          key={seed}
                          type="button"
                          onClick={() => setEditPhoto(uri)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            editPhoto === uri
                              ? 'border-[#FF3040] scale-105'
                              : 'border-slate-200 dark:border-[#262E3E] hover:border-[#FF3040]/50'
                          }`}
                          title={seed}
                        >
                          <img src={uri} alt={seed} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">
                    {isEn ? 'Display Name *' : 'Jina Lako Kamili *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={isEn ? 'Your name' : 'Jina lako'}
                    className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-[#FF3040] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">
                    {isEn ? 'Avatar Image URL (Optional)' : 'Kiungo cha Picha (Hiari)'}
                  </label>
                  <input
                    type="url"
                    value={editPhoto.startsWith('data:') ? '' : editPhoto}
                    onChange={(e) => setEditPhoto(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-[#FF3040] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEditName(profile.displayName || '');
                    setEditPhoto(profile.photoURL || '');
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#262E3E] text-xs font-semibold text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t.cancel}</span>
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile || !editName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {isSavingProfile
                      ? isEn
                        ? 'Saving...'
                        : 'Inahifadhi...'
                      : isEn
                        ? 'Save Profile'
                        : 'Hifadhi Wasifu'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName || 'Wasifu'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createAvatarSvgDataUri(
                        profile.displayName || 'User'
                      );
                    }}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#FF3040]/40 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF3040] to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
                    {(profile.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-xs min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white text-sm block truncate">
                    {profile.displayName || 'Mtumiaji wa Tazama'}
                  </span>
                  <p className="text-slate-600 dark:text-[#94A3B8] font-mono mt-0.5 truncate">
                    {profile.email}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-[#16C784] font-bold uppercase mt-1">
                    {isEn ? 'Role:' : 'Nafasi:'} {profile.role}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3.5 py-2.5">
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
                    {isEn ? 'Country' : 'Nchi'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    Tanzania 🇹🇿
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3.5 py-2.5">
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
                    {isEn ? 'Currency' : 'Sarafu ya Malipo'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    Shilingi ya Tanzania (TZS)
                  </span>
                </div>
              </div>
            </>
          )
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-[#262E3E] flex items-center justify-center text-slate-500 dark:text-[#A7B0C0] shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {isEn ? 'You are not signed in' : 'Haujaingia kwenye akaunti'}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5">
                  {isEn
                    ? 'Sign in or create an account to customize your profile.'
                    : 'Ingia au jisajili ili kusimamia wasifu wako na taarifa za akaunti.'}
                </p>
              </div>
            </div>
            {onNavigate && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Sign In' : 'Kuingia'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:border-[#262E3E] dark:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784]" />
                  <span>{isEn ? 'Sign Up' : 'Kujisajili'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Language & Theme Preferences Card */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] space-y-4 text-xs shadow-sm dark:shadow-none">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
          {isEn ? 'Appearance & Language' : 'Lugha na Muonekano'}
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-200 dark:border-[#242B3B]">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-[#FF3040] shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {isEn ? 'Platform Language' : 'Lugha ya Jukwaa (Language)'}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-[#94A3B8]">
                {isEn
                  ? 'Switch between Kiswahili and English'
                  : 'Chagua kati ya Kiswahili Sanifu na Kiingereza'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLanguage('sw')}
              className={`min-h-[36px] px-3.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                language === 'sw'
                  ? 'bg-[#FF3040] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-[#10131B] dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kiswahili
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`min-h-[36px] px-3.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                language === 'en'
                  ? 'bg-[#FF3040] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 dark:bg-[#10131B] dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {isEn ? 'Theme Mode' : 'Muonekano (Theme)'}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-[#94A3B8]">
                {isEn ? 'Choose Dark or Light appearance' : 'Hali Nyeusi (Dark) au Hali Nyeupe (Light)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="min-h-[36px] px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 dark:bg-[#10131B] dark:border-[#262E3E] dark:text-white text-xs font-bold hover:border-[#FF3040] transition-colors cursor-pointer"
          >
            {theme === 'dark'
              ? isEn
                ? 'Dark Mode'
                : 'Hali Nyeusi (Dark)'
              : isEn
                ? 'Light Mode'
                : 'Hali Nyeupe (Light)'}
          </button>
        </div>
      </section>

      {/* 3. Notification Preferences Card */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] space-y-4 text-xs shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF3040]" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {isEn ? 'Notification Preferences' : 'Mipangilio ya Taarifa (Notifications)'}
            </h2>
          </div>
          {notifSavedNotice && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-[#16C784] animate-in fade-in">
              {isEn ? '✓ Saved' : '✓ Imehifadhiwa'}
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-200 dark:divide-[#242B3B]">
          {notifRows.map((row) => {
            const enabled = notificationPreferences[row.key];
            return (
              <div
                key={row.key}
                className="flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white">{row.title}</p>
                  <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] mt-0.5 leading-snug">
                    {row.desc}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => handleToggleNotifPref(row.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
                    enabled
                      ? 'bg-[#FF3040]'
                      : 'bg-slate-300 dark:bg-[#262E3E]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Cloudinary Integration Card - Visible ONLY to Administrator */}
      {isAdmin && (
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151A24] border border-blue-200 dark:border-blue-500/30 space-y-5 text-xs shadow-sm dark:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#242B3B]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                  <span>Muunganisho wa Cloudinary Video & Media</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                    console.cloudinary.com
                  </span>
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-[#94A3B8]">
                  Hifadhi video na picha za ubora wa juu kwenye akaunti yako ya Cloudinary (Usimamizi wa Admin)
                </p>
              </div>
            </div>

            <a
              href="https://console.cloudinary.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 dark:border-blue-500/30 dark:text-blue-400 dark:hover:text-white font-bold text-xs transition-colors"
            >
              <span>Fungua Console ya Cloudinary</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-[#16C784]/10 border border-emerald-200 dark:border-[#16C784]/30 flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                <span>
                  Cloud Name Inayotumika:{' '}
                  <span className="font-mono text-emerald-700 dark:text-[#16C784]">
                    {cloudinaryCloudName}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#94A3B8]">
                Upload Preset:{' '}
                <span className="font-mono text-slate-900 dark:text-white">
                  {cloudinaryPreset || 'Haijawekwa'}
                </span>
              </p>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-700 dark:text-[#16C784] tracking-wide">
              IMEUNGANISHWA
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Jinsi ya kupata taarifa kutoka console.cloudinary.com:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed pl-1">
              <li>
                Ingia kwenye akaunti yako kupitia{' '}
                <a
                  href="https://console.cloudinary.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  console.cloudinary.com
                </a>
                .
              </li>
              <li>
                Kwenye <strong>Dashboard</strong>, angalia sehemu ya{' '}
                <strong>Product Environment Credentials</strong> kupata{' '}
                <strong>Cloud name</strong>, <strong>API Key</strong> na{' '}
                <strong>API Secret</strong>.
              </li>
              <li>
                Kwenye Settings &rarr; Upload &rarr; Upload presets weka{' '}
                <strong>Signing Mode: Unsigned</strong> na unakili jina lake.
              </li>
            </ol>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94A3B8] mb-1">
                  Cloud Name (Jina la Wingu) *
                </label>
                <input
                  type="text"
                  value={cloudinaryCloudName}
                  onChange={(e) => setCloudinaryCloudName(e.target.value)}
                  placeholder="mfano: ecsswynm"
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94A3B8] mb-1">
                  Upload Preset (Unsigned Preset) *
                </label>
                <input
                  type="text"
                  value={cloudinaryPreset}
                  onChange={(e) => setCloudinaryPreset(e.target.value)}
                  placeholder="mfano: malimai12"
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94A3B8] mb-1">
                  API Key (Hiari):
                </label>
                <input
                  type="text"
                  value={cloudinaryApiKey}
                  onChange={(e) => setCloudinaryApiKey(e.target.value)}
                  placeholder="mfano: 384729184719283"
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#94A3B8]">
                    API Secret (Hiari):
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                  >
                    {showSecret ? 'Ficha' : 'Onyesha'}
                  </button>
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={cloudinaryApiSecret}
                  onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-2xl text-xs border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-[#16C784]/10 border-emerald-200 dark:border-[#16C784]/30 text-emerald-900 dark:text-white'
                    : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#16C784] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <span className="font-bold block">
                    {testResult.success ? 'Muunganisho Umefanikiwa!' : 'Tatizo la Muunganisho'}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-[#94A3B8]">
                    {testResult.message}
                  </p>
                </div>
              </div>
            )}

            {saveStatusMessage && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{saveStatusMessage}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={isSavingCloudinary}
                onClick={handleSaveCloudinaryConfig}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSavingCloudinary ? 'Inahifadhi...' : 'Hifadhi Taarifa za Cloudinary'}
              </button>

              <button
                type="button"
                disabled={isTestingCloudinary}
                onClick={handleTestCloudinaryConnection}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2c3547] dark:text-white font-semibold text-xs dark:border-[#262E3E] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloudinary ? 'animate-spin' : ''}`} />
                <span>{isTestingCloudinary ? 'Inapima...' : 'Jaribu Muunganisho (Test)'}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Account Deletion Card */}
      {profile && profile.uid && (
        <section className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
            <Trash2 className="w-4 h-4" />
            <span>
              {isEn ? 'Delete Account' : 'Kufuta Akaunti (Account Deletion)'}
            </span>
          </div>
          <p className="text-slate-600 dark:text-[#94A3B8]">
            {isEn
              ? 'Deleting your account permanently removes your channels, uploaded videos, and watch history.'
              : 'Kufuta akaunti kutaondoa vituo vyako vyote, video ulizopakia, na historia ya utazamaji kabisa.'}
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
          >
            {isEn ? 'Delete My Account' : 'Futa Akaunti Yangu'}
          </button>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#191E29] border border-red-200 dark:border-red-500/40 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base text-slate-900 dark:text-white">
                {isEn
                  ? 'Are you sure you want to delete your account?'
                  : 'Je, una uhakika unataka kufuta akaunti?'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
              {isEn ? 'This action cannot be undone. Type ' : 'Hatua hii haiwezi kubatilishwa. Andika neno '}
              <span className="text-red-600 dark:text-red-400 font-bold font-mono">futa</span>{' '}
              {isEn ? 'below to confirm:' : 'hapa chini kuthibitisha:'}
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="futa"
              className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-red-500 outline-none"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-[#262E3E] text-xs text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== 'futa'}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                {isEn ? 'Confirm Delete' : 'Thibitisha Futa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
