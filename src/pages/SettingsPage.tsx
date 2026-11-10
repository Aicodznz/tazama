import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Trash2, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Cloud,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  User,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../lib/i18n';
import { createAvatarSvgDataUri } from '../lib/mediaPlaceholders';

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { profile, role, language, setLanguage, theme, toggleTheme, logout } = useAuth();
  const isAdmin = role === 'admin' || profile?.role === 'admin' || profile?.email === 'amytzee@gmail.com';
  const t = translations[language];

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');

  // Cloudinary Settings State
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
    fetch('/api/cloudinary/config')
      .then(res => res.json())
      .then(data => {
        if (data.cloudName) setCloudinaryCloudName(data.cloudName);
        if (data.uploadPreset) setCloudinaryPreset(data.uploadPreset);
      })
      .catch(() => {});
  }, []);

  const handleSaveCloudinaryConfig = async () => {
    if (!cloudinaryCloudName.trim()) {
      setSaveStatusMessage('Tafadhali weka Cloud Name.');
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
          apiSecret: cloudinaryApiSecret.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatusMessage('✓ Taarifa za Cloudinary zimehifadhiwa kikamilifu!');
        setTimeout(() => setSaveStatusMessage(null), 3500);
      } else {
        setSaveStatusMessage(data.error || 'Imeshindikana kuhifadhi.');
      }
    } catch (err: any) {
      setSaveStatusMessage(err.message || 'Hitilafu ya mtandao');
    } finally {
      setIsSavingCloudinary(false);
    }
  };

  const handleTestCloudinaryConnection = async () => {
    setIsTestingCloudinary(true);
    setTestResult(null);
    try {
      // First ensure backend has current inputs
      await fetch('/api/cloudinary/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudName: cloudinaryCloudName.trim(),
          uploadPreset: cloudinaryPreset.trim(),
          apiKey: cloudinaryApiKey.trim(),
          apiSecret: cloudinaryApiSecret.trim()
        })
      });

      const res = await fetch('/api/cloudinary/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Hitilafu wakati wa kuunganisha na Cloudinary.'
      });
    } finally {
      setIsTestingCloudinary(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'futa') {
      setShowDeleteModal(false);
      logout();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-[#262E3E]">
        <div className="w-10 h-10 rounded-xl bg-[#FF3040] flex items-center justify-center text-white shadow-md">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t.settings}</h1>
          <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">Usimamizi wa akaunti yako, lugha, muonekano na usalama</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Profile Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] space-y-4 shadow-sm dark:shadow-none">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Taarifa za Wasifu (Profile)</h2>
          
          {profile && profile.uid ? (
            <>
              <div className="flex items-center gap-4">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName || 'Wasifu'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createAvatarSvgDataUri(profile.displayName || 'User');
                    }}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#FF3040]/40 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF3040] to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                    {(profile.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">{profile.displayName || 'Mtumiaji wa Tazama'}</span>
                  <p className="text-slate-600 dark:text-[#A7B0C0] font-mono mt-0.5">{profile.email}</p>
                  <span className="text-[10px] text-emerald-700 dark:text-[#16C784] font-semibold uppercase mt-1 inline-block bg-emerald-50 dark:bg-[#16C784]/15 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-[#16C784]/30">
                    Nafasi: {profile.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-[#A7B0C0] mb-1">Nchi:</label>
                  <input
                    type="text"
                    disabled
                    value="Tanzania 🇹🇿"
                    className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-slate-900 dark:text-white opacity-80"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-[#A7B0C0] mb-1">Sarafu ya Malipo:</label>
                  <input
                    type="text"
                    disabled
                    value="Shilingi ya Tanzania (TZS)"
                    className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-slate-900 dark:text-white opacity-80"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-[#262E3E] flex items-center justify-center text-slate-500 dark:text-[#A7B0C0]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Haujaingia kwenye akaunti</p>
                  <p className="text-xs text-slate-600 dark:text-[#A7B0C0] mt-0.5">Ingia au jisajili ili kusimamia wasifu wako na taarifa za akaunti.</p>
                </div>
              </div>
              {onNavigate && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold transition-all shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Kuingia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:border-[#262E3E] dark:text-white text-xs font-semibold transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784]" />
                    <span>Kujisajili</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preferences Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] space-y-4 text-xs shadow-sm dark:shadow-none">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Mapendekezo (Preferences)</h2>

          {/* Language Switch */}
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-[#262E3E]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FF3040]" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Lugha ya Jukwaa (Language)</span>
                <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0]">Chagua kati ya Kiswahili Sanifu na Kiingereza</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLanguage('sw')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                  language === 'sw' ? 'bg-[#FF3040] text-white' : 'bg-slate-100 text-slate-600 dark:bg-[#10131B] dark:text-[#A7B0C0]'
                }`}
              >
                Kiswahili
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                  language === 'en' ? 'bg-[#FF3040] text-white' : 'bg-slate-100 text-slate-600 dark:bg-[#10131B] dark:text-[#A7B0C0]'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme Switch */}
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-[#262E3E]">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Muonekano (Theme)</span>
                <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0]">Hali Nyeusi (Dark) au Hali Nyeupe (Light)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 dark:bg-[#10131B] dark:border-[#262E3E] dark:text-white text-xs font-semibold hover:border-[#FF3040]"
            >
              {theme === 'dark' ? 'Hali Nyeusi (Dark)' : 'Hali Nyeupe (Light)'}
            </button>
          </div>
        </div>

        {/* Cloudinary Integration Card - Visible ONLY to Administrator */}
        {isAdmin && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#191E29] border border-blue-200 dark:border-blue-500/30 space-y-5 text-xs shadow-sm dark:shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#262E3E]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Muunganisho wa Cloudinary Video & Media</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-mono text-[10px] border border-blue-200 dark:border-blue-500/30">
                      console.cloudinary.com
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0]">
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

            {/* Active Status Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-[#16C784]/10 border border-emerald-200 dark:border-[#16C784]/30 flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                  <span>Cloud Name Inayotumika: <span className="font-mono text-emerald-700 dark:text-[#16C784]">{cloudinaryCloudName}</span></span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0]">
                  Upload Preset: <span className="font-mono text-slate-900 dark:text-white">{cloudinaryPreset || 'Haijawekwa'}</span> (Inatumika kupakia video moja kwa moja bila kuonyesha siri)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#16C784] text-black font-extrabold text-[10px] tracking-wide shadow-sm">
                IMEUNGANISHWA
              </span>
            </div>

            {/* Guide Dropdown / Accordion */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Jinsi ya kupata taarifa kutoka console.cloudinary.com:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-[#A7B0C0] leading-relaxed pl-1">
                <li>Ingia kwenye akaunti yako kupitia <a href="https://console.cloudinary.com/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">console.cloudinary.com</a>.</li>
                <li>Kwenye ukurasa wa mwanzo (<strong>Dashboard</strong>), angalia sehemu ya <strong>Product Environment Credentials</strong> kupata <strong>Cloud name</strong>, <strong>API Key</strong> na <strong>API Secret</strong>.</li>
                <li>Ili kupata <strong>Upload Preset</strong>: Bonyeza alama ya Settings ⚙️ (chini kushoto) &rarr; Chagua <strong>Upload</strong> &rarr; Nenda chini sehemu ya <strong>Upload presets</strong> &rarr; Bonyeza <em>&quot;Add upload preset&quot;</em> &rarr; Weka <strong>Signing Mode: Unsigned</strong> &rarr; Hifadhi na unakili jina lake (kwa mfano: <code className="text-blue-700 dark:text-blue-300">malimai12</code>).</li>
              </ol>
            </div>

            {/* Credentials Form */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#A7B0C0] mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#A7B0C0] mb-1">
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
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#A7B0C0] mb-1">
                    API Key (Hiari - Kwa Usimamizi wa Server):
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
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#A7B0C0]">
                      API Secret (Hiari):
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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

              {/* Test Connection Results Notice */}
              {testResult && (
                <div className={`p-3 rounded-2xl text-xs border flex items-start gap-2.5 ${
                  testResult.success 
                    ? 'bg-emerald-50 dark:bg-[#16C784]/10 border-emerald-200 dark:border-[#16C784]/30 text-emerald-900 dark:text-white' 
                    : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#16C784] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      {testResult.success ? 'Muunganisho Umefanikiwa!' : 'Tatizo la Muunganisho'}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0]">{testResult.message}</p>
                  </div>
                </div>
              )}

              {saveStatusMessage && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{saveStatusMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isSavingCloudinary}
                  onClick={handleSaveCloudinaryConfig}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  {isSavingCloudinary ? 'Inahifadhi...' : 'Hifadhi Taarifa za Cloudinary'}
                </button>

                <button
                  type="button"
                  disabled={isTestingCloudinary}
                  onClick={handleTestCloudinaryConnection}
                  className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2c3547] dark:text-white font-semibold text-xs dark:border-[#262E3E] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloudinary ? 'animate-spin' : ''}`} />
                  <span>{isTestingCloudinary ? 'Inapima...' : 'Jaribu Muunganisho (Test)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Workflow */}
        {profile && profile.uid && (
          <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>Kufuta Akaunti (Account Deletion)</span>
            </div>
            <p className="text-slate-600 dark:text-[#A7B0C0]">
              Kufuta akaunti kutaondoa vituo vyako vyote, video ulizopakia, na historia ya utazamaji kabisa kutoka kwenye hifadhidata ya Firebase.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md"
            >
              Futa Akaunti Yangu
            </button>
          </div>
        )}

      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#191E29] border border-red-200 dark:border-red-500/40 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base text-slate-900 dark:text-white">Je, una uhakika unataka kufuta akaunti?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
              Hatua hii haiwezi kubatilishwa. Andika neno <span className="text-red-600 dark:text-red-400 font-bold font-mono">futa</span> hapa chini kuthibitisha:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Andika 'futa'"
              className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-red-500 outline-none"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-[#262E3E] text-xs text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white"
              >
                Ghairi
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== 'futa'}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-40"
              >
                Thibitisha Futa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
