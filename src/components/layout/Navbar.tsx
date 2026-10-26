import React, { useState } from 'react';
import { 
  Search, 
  Video as VideoIcon, 
  Bell, 
  Globe, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Wallet, 
  Plus, 
  Menu,
  CheckCircle,
  X,
  Crown,
  Zap,
  Radio,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { translations, formatTZS } from '../../lib/i18n';
import { UserRole } from '../../types';
import { PWAInstallModal } from '../modals/PWAInstallModal';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenWallet: () => void;
  onOpenPremium?: (target?: 'viewer' | 'creator') => void;
  onToggleSidebar: () => void;
  onNavigate: (page: string) => void;
  onStartCreator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenUpload, 
  onOpenWallet, 
  onOpenPremium,
  onToggleSidebar,
  onNavigate,
  onStartCreator
}) => {
  const { 
    user, 
    profile, 
    role, 
    language, 
    theme, 
    loginWithGoogle, 
    logout, 
    switchDemoRole, 
    setLanguage, 
    toggleTheme 
  } = useAuth();
  
  const { searchQuery, setSearchQuery, isDataSaver, toggleDataSaver } = useVideo();
  const t = translations[language];

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showPWAModal, setShowPWAModal] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    onNavigate('search');
    setShowMobileSearch(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#262E3E] bg-[#10131B]/95 backdrop-blur-md px-3 sm:px-6 py-2 transition-colors">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        
        {/* Left: Mobile hamburger & Tazama Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-1.5 sm:p-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#191E29] transition-colors focus:outline-none"
            title="Fungua Menyu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none"
            aria-label="Tazama Home"
          >
            {/* Custom Play Symbol */}
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#FF3040] to-[#FF6B6B] flex items-center justify-center shadow-lg shadow-[#FF3040]/30 group-hover:scale-105 transition-transform">
              <div className="w-0 h-0 border-y-[5px] sm:border-y-[6px] border-y-transparent border-l-[9px] sm:border-l-[10px] border-l-white ml-0.5" />
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1">
                TAZAMA
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3040]" />
              </span>
              <span className="hidden sm:inline text-[9px] font-medium tracking-wider text-[#A7B0C0] uppercase">
                {t.tagline}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar (Desktop & Tablet) */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-[#191E29] border border-[#262E3E] rounded-full py-2 pl-4 pr-11 text-sm text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040] focus:ring-1 focus:ring-[#FF3040] transition-all"
            />
            {searchInput && (
              <button 
                type="button" 
                onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                className="absolute right-10 text-[#A7B0C0] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 bg-[#232A39] hover:bg-[#FF3040] text-[#A7B0C0] hover:text-white p-2 rounded-full transition-colors"
              title={t.searchPlaceholder}
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Actions, Wallet, Role, Language, Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden p-1.5 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#191E29] transition-colors"
            title="Tafuta"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Data Saver Mode Toggle Button (Hidden on small mobile to prevent clutter) */}
          <button
            onClick={toggleDataSaver}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              isDataSaver 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/20' 
                : 'bg-[#191E29] text-[#A7B0C0] hover:text-white border border-[#262E3E]'
            }`}
            title={isDataSaver ? 'Hali ya Kubana Bando Imewashwa (360p)' : 'Washa Hali ya Kubana Bando (Data Saver)'}
          >
            <Zap className={`w-3.5 h-3.5 ${isDataSaver ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span className="hidden md:inline text-[11px]">{isDataSaver ? 'Bando: 360p' : 'Bana Bando'}</span>
          </button>

          {/* Live Streaming Button (Hidden on small mobile to prevent clutter) */}
          <button
            onClick={() => onNavigate('live')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-bold transition-all shrink-0"
            title="Tazama Mubashara (Live Streaming)"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF3040] animate-pulse" />
            <span className="hidden md:inline">Mubashara</span>
          </button>

          {/* Quick Upload Button (Desktop/Tablet) */}
          <button
            onClick={onOpenUpload}
            className="hidden md:flex items-center gap-1.5 bg-[#FF3040] hover:bg-[#E02635] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md shadow-[#FF3040]/20 hover:scale-102 active:scale-98 transition-all"
            title={t.upload}
          >
            <Plus className="w-4 h-4" />
            <span>{t.create}</span>
          </button>

          {/* Tazama Premium Button (Desktop/Tablet) */}
          <button
            onClick={() => onOpenPremium && onOpenPremium(role === 'creator' ? 'creator' : 'viewer')}
            className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/40 hover:border-amber-400 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 transition-all hover:scale-102"
            title="Vifurushi vya Tazama Premium"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Premium</span>
          </button>

          {/* Install PWA Button */}
          <button
            onClick={() => setShowPWAModal(true)}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#10131B] border border-[#262E3E] hover:border-white/30 text-[11px] font-semibold text-white/90 hover:text-white transition-all shrink-0"
            title="Weka App ya Tazama kwenye Simu yako"
          >
            <Download className="w-3.5 h-3.5 text-[#16C784]" />
            <span>Weka App</span>
          </button>

          {/* Wallet Balance Badge (Mobile & Desktop - Only visible when logged in) */}
          {profile && (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 bg-[#191E29] border border-[#262E3E] hover:border-[#16C784] px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#16C784] transition-all shrink-0"
              title="Mfuko wa Pesa (Mobile Money)"
            >
              <Wallet className="w-3.5 h-3.5 text-[#16C784]" />
              <span className="font-mono text-[11px] sm:text-xs">
                {profile.balanceTZS 
                  ? (profile.balanceTZS >= 1000000 
                      ? `${(profile.balanceTZS/1000000).toFixed(1)}M` 
                      : `${Math.round(profile.balanceTZS/1000)}k`) 
                  : '0'}
              </span>
            </button>
          )}

          {/* 1. Admin Icon Button (Only for verified admin) */}
          {profile && (role === 'admin' || profile.email === 'amytzee@gmail.com') && (
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-amber-500/10 shrink-0"
              title="Jopo la Msimamizi Mkuu (Admin Hub)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          )}

          {/* 2. Studio / Dashboard Button (For users who are creators or have a channel) */}
          {profile && (role === 'creator' || profile.channelId) && (
            <button
              onClick={() => onNavigate('studio')}
              className="flex items-center gap-1.5 bg-[#16C784]/20 hover:bg-[#16C784]/30 border border-[#16C784]/40 text-[#16C784] px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-[#16C784]/15 shrink-0"
              title="Dashibodi ya Studio ya Kituo Chako"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#16C784]" />
              <span>Studio</span>
            </button>
          )}

          {/* 3. 'Anza Kuwa Creator' Button (For viewers who haven't opened a channel yet) */}
          {profile && role === 'viewer' && !profile.channelId && (
            <button
              onClick={onStartCreator}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#16C784] to-[#13ab71] hover:brightness-110 text-black px-3.5 py-1.5 rounded-full text-xs font-black shadow-md shadow-[#16C784]/25 transition-all active:scale-95 shrink-0"
              title="Fungua Channel Yako ya Tazama"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Anza Kuwa Creator</span>
            </button>
          )}

          {/* Language Switcher (Desktop) */}
          <button
            onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
            className="hidden md:flex items-center gap-1 p-2 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#191E29] transition-colors"
            title="Badili Lugha / Switch Language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">{language}</span>
          </button>

          {/* Theme Switcher (Desktop) */}
          <button
            onClick={toggleTheme}
            className="hidden md:flex p-2 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#191E29] transition-colors"
            title={theme === 'dark' ? 'Washa Hali Nyeupe' : 'Washa Hali Nyeusi'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications (Only for authenticated users) */}
          {profile && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#191E29] transition-colors"
                title="Taarifa (Notifications)"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-[#FF3040]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#191E29] border border-[#262E3E] rounded-2xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#262E3E]">
                    <h4 className="text-sm font-bold text-white">Taarifa Mpya</h4>
                    <span className="text-[10px] text-[#16C784] font-semibold">Zote zimesomwa</span>
                  </div>
                  <div className="divide-y divide-[#262E3E]/60 text-xs">
                    <div className="py-2.5">
                      <p className="font-semibold text-white">Karibu Tazama!</p>
                      <p className="text-[11px] text-[#A7B0C0]">Akaunti yako ipo tayari. Anza kutazama na kushiriki maudhui.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth */}
          <div className="relative">
            {profile ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-transparent hover:border-[#FF3040] transition-colors focus:outline-none"
              >
                <img
                  src={profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={profile.displayName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#262E3E]"
                />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1.5 bg-[#FF3040] hover:bg-[#E02635] text-white px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-[#FF3040]/25 active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Kuingia</span>
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="hidden sm:flex items-center gap-1 bg-[#191E29] hover:bg-[#232A39] border border-[#262E3E] text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                >
                  <span>Kujisajili</span>
                </button>
              </div>
            )}

            {/* Profile Dropdown Menu with Mobile Support */}
            {showProfileMenu && profile && (
              <div className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-[#191E29] border border-[#262E3E] rounded-2xl shadow-2xl p-2.5 z-50">
                <div className="px-3 py-2 border-b border-[#262E3E] mb-2">
                  <p className="text-sm font-bold text-white truncate">{profile.displayName}</p>
                  <p className="text-xs text-[#A7B0C0] truncate font-mono">{profile.email}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] bg-[#232A39] text-[#16C784] font-semibold px-2 py-0.5 rounded-full uppercase">
                      {role}
                    </span>
                    <span className="text-xs font-bold font-mono text-[#16C784]">{formatTZS(profile.balanceTZS || 0)}</span>
                  </div>
                </div>

                {/* Mobile Quick Switches: Language & Theme */}
                <div className="md:hidden flex items-center justify-between px-2 py-1.5 mb-2 border-b border-[#262E3E] text-xs text-[#A7B0C0]">
                  <button
                    onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>Lugha: {language.toUpperCase()}</span>
                  </button>

                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    <span>{theme === 'dark' ? 'Mchana' : 'Giza'}</span>
                  </button>
                </div>

                <div className="space-y-0.5 text-xs text-white">
                  <button
                    onClick={() => {
                      if (onOpenPremium) onOpenPremium(role === 'creator' ? 'creator' : 'viewer');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#232A39] flex items-center justify-between text-amber-300 font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Tazama Premium Plans</span>
                    </div>
                    <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-extrabold uppercase">VIP</span>
                  </button>

                  {/* If user hasn't created a channel, show Anza Kuwa Creator */}
                  {role === 'viewer' && !profile.channelId && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onStartCreator) onStartCreator();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#16C784]/20 to-[#16C784]/10 hover:from-[#16C784]/30 hover:to-[#16C784]/20 border border-[#16C784]/40 text-[#16C784] font-bold flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#16C784]" />
                        <span>Anza Kuwa Creator</span>
                      </div>
                      <span className="text-[9px] bg-[#16C784] text-black px-1.5 py-0.5 rounded font-black uppercase">Fungua Channel</span>
                    </button>
                  )}

                  {/* If user is creator or has channel */}
                  {(role === 'creator' || profile.channelId) && (
                    <>
                      <button
                        onClick={() => { onNavigate('studio'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#232A39] flex items-center gap-2 text-white font-semibold"
                      >
                        <Sparkles className="w-4 h-4 text-[#16C784]" />
                        <span>{t.creatorStudio}</span>
                      </button>

                      <button
                        onClick={() => { onNavigate('channel'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#232A39] flex items-center gap-2 text-[#A7B0C0] hover:text-white"
                      >
                        <VideoIcon className="w-4 h-4 text-[#A7B0C0]" />
                        <span>Kituo Changu (My Channel)</span>
                      </button>
                    </>
                  )}

                  {(role === 'admin' || profile.email === 'amytzee@gmail.com') && (
                    <button
                      onClick={() => { onNavigate('admin'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#232A39] flex items-center gap-2 text-amber-400 font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.adminPanel}</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setShowPWAModal(true); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#232A39] flex items-center gap-2 text-[#16C784] font-semibold"
                  >
                    <Download className="w-4 h-4 text-[#16C784]" />
                    <span>Weka App kwenye Simu</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#232A39] flex items-center gap-2 text-[#A7B0C0]"
                  >
                    <span>{t.settings}</span>
                  </button>

                  <div className="pt-1.5 border-t border-[#262E3E] space-y-1">
                    <button
                      onClick={() => { onNavigate('login'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#232A39] text-[#A7B0C0] hover:text-white flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Badili Akaunti (Switch Account)</span>
                    </button>
                    <button
                      onClick={() => { logout(); onNavigate('login'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Global PWA Install Modal */}
      <PWAInstallModal 
        isOpen={showPWAModal} 
        onClose={() => setShowPWAModal(false)} 
      />

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && (
        <div className="mt-2 sm:hidden animate-in fade-in duration-200">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-[#191E29] border border-[#FF3040]/70 rounded-full py-2 pl-4 pr-16 text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:ring-1 focus:ring-[#FF3040]"
            />
            {searchInput && (
              <button 
                type="button" 
                onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                className="absolute right-9 text-[#A7B0C0] hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              type="submit" 
              className="absolute right-1.5 bg-[#FF3040] text-white p-1.5 rounded-full"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
