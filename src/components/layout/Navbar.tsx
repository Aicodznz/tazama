import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  X,
  Crown,
  Zap,
  Download,
  Megaphone,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { translations, formatTZS, formatRelativeTime } from '../../lib/i18n';
import { PWAInstallModal } from '../modals/PWAInstallModal';
import { createAvatarSvgDataUri } from '../../lib/mediaPlaceholders';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenWallet: () => void;
  onOpenPremium?: (target?: 'viewer' | 'creator') => void;
  onToggleSidebar: () => void;
  onNavigate: (page: string) => void;
  onStartCreator?: () => void;
  onOpenCreateAd?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenUpload, 
  onOpenWallet, 
  onOpenPremium,
  onToggleSidebar,
  onNavigate,
  onStartCreator,
  onOpenCreateAd
}) => {
  const { 
    profile, 
    role, 
    language, 
    theme, 
    logout, 
    setLanguage, 
    toggleTheme 
  } = useAuth();
  
  const { 
    searchQuery, 
    setSearchQuery, 
    isDataSaver, 
    toggleDataSaver,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    adCampaigns
  } = useVideo();
  const t = translations[language];

  const pendingAdsCount = useMemo(() => {
    return (adCampaigns || []).filter(a => a && a.status === 'pending_approval').length;
  }, [adCampaigns]);

  const { isInstalled } = usePWAInstall();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showPWAModal, setShowPWAModal] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotifications && !showProfileMenu) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showNotifications, showProfileMenu]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    onNavigate('search');
    setShowMobileSearch(false);
  };

  const formattedWalletShort = profile?.balanceTZS
    ? (profile.balanceTZS >= 1000000
        ? `${(profile.balanceTZS / 1000000).toFixed(1)}M`
        : `${Math.round(profile.balanceTZS / 1000)}k`)
    : '0';

  const isAdmin = Boolean(profile && (role === 'admin' || profile.email === 'amytzee@gmail.com'));
  const isCreator = Boolean(profile && (role === 'creator' || profile.channelId));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-[#262E3E] bg-white/95 dark:bg-[#10131B]/95 backdrop-blur-md px-2.5 sm:px-6 py-2 sm:py-2.5 md:min-h-[64px] transition-colors">
      {/* Row 1: Primary Top Navigation Bar */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-4 w-full min-w-0">
        
        {/* Left: Hamburger (Mobile + Desktop) & Tazama Logo */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#191E29] transition-colors focus:outline-none cursor-pointer"
            title="Fungua Menyu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button 
            type="button"
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-1.5 sm:gap-2.5 group focus:outline-none cursor-pointer"
            aria-label="Tazama Home"
          >
            {/* Custom Play Symbol */}
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#FF3040] to-[#FF6B6B] flex items-center justify-center shadow-lg shadow-[#FF3040]/30 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-0 h-0 border-y-[5px] sm:border-y-[6px] border-y-transparent border-l-[8px] sm:border-l-[10px] border-l-white ml-0.5" />
            </div>
            
            <div className="flex flex-col text-left justify-center">
              <span className="text-[15px] min-[360px]:text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 leading-tight">
                TAZAMA
                <span className="hidden min-[350px]:inline-block w-1.5 h-1.5 rounded-full bg-[#FF3040]" />
              </span>
              <span className="hidden lg:inline text-[9px] font-medium tracking-wider text-slate-500 dark:text-[#A7B0C0] uppercase leading-none">
                {t.tagline}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar (Tablet & Desktop) */}
        <div className="flex-1 min-w-[120px] max-w-xl mx-2 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-100 dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-full py-2 pl-4 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040] focus:ring-1 focus:ring-[#FF3040] transition-all"
            />
            {searchInput && (
              <button 
                type="button" 
                onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                className="absolute right-10 text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 bg-slate-200 dark:bg-[#232A39] hover:bg-[#FF3040] text-slate-600 dark:text-[#A7B0C0] hover:text-white p-2 rounded-full transition-colors"
              title={t.searchPlaceholder}
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Utility Controls + Desktop Quick Actions */}
        <div className="flex items-center gap-0.5 min-[360px]:gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
          
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden p-1.5 rounded-full text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#191E29] transition-colors cursor-pointer"
            title="Tafuta"
            aria-label="Tafuta"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Data Saver Mode Toggle Button (Desktop/Tablet md+ inline; Mobile Row 2 & Profile Menu) */}
          <button
            type="button"
            onClick={toggleDataSaver}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              isDataSaver 
                ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-sm dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50 dark:shadow-md dark:shadow-amber-500/20' 
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
            }`}
            title={isDataSaver ? 'Hali ya Kubana Bando Imewashwa (360p)' : 'Washa Hali ya Kubana Bando (Data Saver)'}
          >
            <Zap className={`w-3.5 h-3.5 ${isDataSaver ? 'text-amber-600 fill-amber-500 dark:text-amber-400 dark:fill-amber-400' : ''}`} />
            <span className="text-[11px]">{isDataSaver ? 'Bando: 360p' : 'Bana Bando'}</span>
          </button>

          {/* Live Streaming Button (Desktop/Tablet inline; Mobile uses Row 2 bar) */}
          <button
            type="button"
            onClick={() => onNavigate('live')}
            className="hidden md:flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 dark:bg-red-600/20 dark:hover:bg-red-600/30 dark:border-red-500/30 dark:text-red-400 text-xs font-bold transition-all shrink-0 cursor-pointer"
            title="Tazama Mubashara (Live Streaming)"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF3040] animate-pulse" />
            <span className="hidden xl:inline">Mubashara</span>
          </button>

          {/* Quick Upload Button (Desktop/Tablet) */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="hidden md:flex items-center gap-1.5 bg-[#FF3040] hover:bg-[#E02635] text-white px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-semibold shadow-md shadow-[#FF3040]/20 hover:scale-102 active:scale-98 transition-all shrink-0 cursor-pointer"
            title={t.upload}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">{t.create}</span>
          </button>

          {/* Install PWA Button (Desktop inline; suppressed when already installed in standalone mode) */}
          {!isInstalled && (
            <button
              type="button"
              onClick={() => setShowPWAModal(true)}
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] hover:border-slate-300 dark:hover:border-white/30 text-[11px] font-semibold text-slate-700 dark:text-white/90 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 cursor-pointer"
              title="Weka App ya Tazama kwenye Simu yako"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784]" />
              <span>Weka App</span>
            </button>
          )}

          {/* Wallet Balance Badge (Desktop/Tablet inline; Mobile uses Row 2 bar) */}
          {profile && (
            <button
              type="button"
              onClick={onOpenWallet}
              className="hidden md:flex items-center gap-1.5 bg-emerald-50 dark:bg-[#191E29] border border-emerald-200 dark:border-[#262E3E] hover:border-emerald-400 dark:hover:border-[#16C784] px-2.5 py-1.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-[#16C784] transition-all shrink-0 cursor-pointer"
              title="Mfuko wa Pesa (Mobile Money)"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784]" />
              <span className="font-mono text-xs">{formattedWalletShort}</span>
            </button>
          )}

          {/* Admin Icon Button (Desktop/Tablet inline; Mobile uses Row 2 bar) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="hidden md:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 shadow-sm dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:border-amber-500/50 dark:text-amber-300 px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-bold transition-all dark:shadow-md dark:shadow-amber-500/10 shrink-0 relative cursor-pointer"
              title="Jopo la Msimamizi Mkuu (Admin Hub)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Admin</span>
              {pendingAdsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow">
                  {pendingAdsCount}
                </span>
              )}
            </button>
          )}

          {/* Studio / Dashboard Button (Desktop/Tablet inline; Mobile uses Row 2 bar) */}
          {isCreator && (
            <button
              type="button"
              onClick={() => onNavigate('studio')}
              className="hidden md:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm dark:bg-[#16C784]/20 dark:hover:bg-[#16C784]/30 dark:border-[#16C784]/40 dark:text-[#16C784] px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-bold transition-all dark:shadow-md dark:shadow-[#16C784]/15 shrink-0 cursor-pointer"
              title="Dashibodi ya Studio ya Kituo Chako"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784]" />
              <span>Studio</span>
            </button>
          )}

          {/* Language Switcher (ALWAYS visible on Mobile & Desktop) */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-full text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#191E29] transition-colors shrink-0 cursor-pointer"
            title="Badili Lugha / Switch Language"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[11px] sm:text-xs font-bold uppercase">{language}</span>
          </button>

          {/* Theme Switcher (ALWAYS visible on Mobile & Desktop) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#191E29] transition-colors shrink-0 cursor-pointer"
            title={theme === 'dark' ? 'Washa Hali ya Mchana (Light Mode)' : 'Washa Hali ya Usiku (Dark Mode)'}
            aria-label="Badili Mandhari / Switch Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600 animate-in spin-in-180 duration-300" />
            )}
          </button>

          {/* Notifications (ALWAYS visible on Mobile & Desktop when logged in) */}
          {profile && (
            <div ref={notificationsRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowNotifications((prev) => !prev);
                }}
                className="relative p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#191E29] transition-colors focus:outline-none cursor-pointer"
                title="Taarifa (Notifications)"
                aria-label="Taarifa"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full bg-[#FF3040] text-white text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center shadow-md shadow-[#FF3040]/40">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed left-2 right-2 top-[58px] sm:top-auto sm:left-auto sm:absolute sm:right-0 sm:mt-2 sm:w-96 bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] rounded-3xl shadow-2xl p-3 sm:p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262E3E]">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Taarifa Mpya</h4>
                      {unreadNotificationCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF3040]/15 dark:bg-[#FF3040]/20 text-[#FF3040] font-mono text-[10px] font-extrabold">
                          {unreadNotificationCount} mpya
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsAsRead()}
                        className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-[#16C784] hover:underline font-semibold cursor-pointer"
                        title="Weka zote zimesomwa"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Weka zote zimesomwa</span>
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-[#262E3E]/60 max-h-[340px] overflow-y-auto no-scrollbar py-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 dark:text-[#A7B0C0] space-y-2">
                        <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-[#262E3E]" />
                        <p className="text-xs">Hakuna taarifa mpya kwa sasa.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.targetType === 'wallet') {
                              onOpenWallet();
                            } else if (n.targetType === 'campaign') {
                              onNavigate('studio');
                            } else if (n.targetType === 'channel' && n.targetId) {
                              onNavigate('channel');
                            }
                            setShowNotifications(false);
                          }}
                          className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                            !n.isRead ? 'bg-slate-50 hover:bg-slate-100 dark:bg-[#191E29] dark:hover:bg-[#202736]' : 'hover:bg-slate-50 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-[#FF3040]" style={{ visibility: n.isRead ? 'hidden' : 'visible' }} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-[#CBD5E1]'}`}>
                                {n.title}
                              </h5>
                              <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] font-mono shrink-0">
                                {formatRelativeTime(n.createdAt, language)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0] line-clamp-2 mt-0.5 leading-snug">
                              {n.message}
                            </p>
                            {n.actionLabel && (
                              <span className="inline-block mt-1.5 text-[10px] font-bold text-emerald-700 dark:text-[#16C784] hover:underline">
                                {n.actionLabel} &rarr;
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-[#262E3E] text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('settings');
                      }}
                      className="text-[11px] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Mipangilio ya Taarifa
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth (ALWAYS visible on Mobile & Desktop) */}
          <div ref={profileMenuRef} className="relative shrink-0">
            {profile ? (
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(false);
                  setShowProfileMenu((prev) => !prev);
                }}
                className="flex items-center p-0.5 sm:p-1 rounded-full border border-transparent hover:border-[#FF3040] transition-colors focus:outline-none cursor-pointer"
                aria-label="Akaunti Yako"
              >
                <img
                  src={profile.photoURL || createAvatarSvgDataUri(profile.displayName || 'Tazama')}
                  alt={profile.displayName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createAvatarSvgDataUri(profile.displayName || 'Tazama');
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-[#262E3E] bg-slate-100 dark:bg-[#141824]"
                />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1 sm:gap-1.5 bg-[#FF3040] hover:bg-[#E02635] text-white px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-md shadow-[#FF3040]/25 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Kuingia</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="hidden sm:flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#191E29] dark:hover:bg-[#232A39] border border-slate-200 dark:border-[#262E3E] text-slate-900 dark:text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Kujisajili</span>
                </button>
              </div>
            )}

            {/* Profile Dropdown Menu with Full Mobile Viewport Support */}
            {showProfileMenu && profile && (
              <div className="fixed right-2 top-[58px] w-[min(19rem,calc(100vw-1rem))] sm:top-auto sm:absolute sm:right-0 sm:mt-2 sm:w-72 max-h-[calc(100dvh-76px)] overflow-y-auto bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-2xl shadow-2xl p-2.5 z-50">
                <div className="px-3 py-2 border-b border-slate-200 dark:border-[#262E3E] mb-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-[#A7B0C0] truncate font-mono">{profile.email}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] bg-slate-100 dark:bg-[#232A39] text-emerald-700 dark:text-[#16C784] font-semibold px-2 py-0.5 rounded-full uppercase">
                      {role}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-700 dark:text-[#16C784]">{formatTZS(profile.balanceTZS || 0)}</span>
                  </div>
                </div>

                {/* Mobile Quick Switches: Language & Theme */}
                <div className="md:hidden flex items-center justify-between px-2 py-1.5 mb-2 border-b border-slate-200 dark:border-[#262E3E] text-xs text-slate-600 dark:text-[#A7B0C0]">
                  <button
                    type="button"
                    onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
                    className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Lugha: {language.toUpperCase()}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
                    <span>{theme === 'dark' ? 'Mchana' : 'Giza'}</span>
                  </button>
                </div>

                <div className="space-y-0.5 text-xs text-slate-800 dark:text-white">
                  <button
                    type="button"
                    onClick={toggleDataSaver}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isDataSaver
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-[#232A39] text-slate-800 dark:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${isDataSaver ? 'text-amber-600 fill-amber-500 dark:text-amber-400 dark:fill-amber-400' : 'text-slate-500 dark:text-[#A7B0C0]'}`} />
                      <span>{language === 'en' ? 'Data Saver Mode' : 'Hali ya Kubana Bando'}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isDataSaver
                        ? 'bg-amber-400 text-black'
                        : 'bg-slate-200 text-slate-700 dark:bg-[#232A39] dark:text-[#A7B0C0]'
                    }`}>
                      {isDataSaver ? '360p ON' : 'Auto'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenPremium) onOpenPremium(role === 'creator' ? 'creator' : 'viewer');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232A39] flex items-center justify-between text-amber-700 dark:text-amber-300 font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Tazama Premium Plans</span>
                    </div>
                    <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-extrabold uppercase">VIP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCreateAd) onOpenCreateAd();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232A39] flex items-center justify-between text-slate-800 dark:text-white font-medium cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Weka Tangazo (Tazama Ads)</span>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 px-1.5 py-0.5 rounded font-bold">Tangaza</span>
                  </button>

                  {/* If user hasn't created a channel, show Anza Kuwa Creator */}
                  {role === 'viewer' && !profile.channelId && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onStartCreator) onStartCreator();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 text-emerald-800 dark:from-[#16C784]/20 dark:to-[#16C784]/10 dark:hover:from-[#16C784]/30 dark:hover:to-[#16C784]/20 dark:border-[#16C784]/40 dark:text-[#16C784] font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                        <span>Anza Kuwa Creator</span>
                      </div>
                      <span className="text-[9px] bg-[#16C784] text-black px-1.5 py-0.5 rounded font-black uppercase">Fungua Channel</span>
                    </button>
                  )}

                  {/* If user is creator or has channel */}
                  {isCreator && (
                    <>
                      <button
                        type="button"
                        onClick={() => { onNavigate('studio'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232A39] flex items-center gap-2 text-slate-900 dark:text-white font-semibold cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                        <span>{t.creatorStudio}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { onNavigate('channel'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232A39] flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white cursor-pointer"
                      >
                        <VideoIcon className="w-4 h-4 text-slate-500 dark:text-[#A7B0C0]" />
                        <span>Kituo Changu (My Channel)</span>
                      </button>
                    </>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => { onNavigate('admin'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232A39] flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.adminPanel}</span>
                    </button>
                  )}

                  {!isInstalled && (
                    <button
                      type="button"
                      onClick={() => { setShowPWAModal(true); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232A39] flex items-center gap-2 text-emerald-700 dark:text-[#16C784] font-semibold cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                      <span>Weka App kwenye Simu</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232A39] flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white cursor-pointer"
                  >
                    <span>{t.settings}</span>
                  </button>

                  <div className="pt-1.5 border-t border-slate-200 dark:border-[#262E3E] space-y-1">
                    <button
                      type="button"
                      onClick={() => { onNavigate('login'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232A39] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Badili Akaunti (Switch Account)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { logout(); onNavigate('login'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer"
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

      {/* Row 2: Mobile Quick-Action Utility Strip (< md, only visible when logged in) */}
      {profile && (
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 mt-2 border-t border-slate-200/70 dark:border-[#262E3E]/70">
          <button
            type="button"
            onClick={onOpenWallet}
            className="flex items-center gap-1 bg-emerald-50 dark:bg-[#191E29] border border-emerald-200 dark:border-[#262E3E] px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-[#16C784] shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Wallet className="w-3 h-3 text-emerald-600 dark:text-[#16C784]" />
            <span className="font-mono">{formattedWalletShort}</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Admin</span>
              {pendingAdsCount > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                  {pendingAdsCount}
                </span>
              )}
            </button>
          )}

          {isCreator && (
            <button
              type="button"
              onClick={() => onNavigate('studio')}
              className="flex items-center gap-1 bg-emerald-50 dark:bg-[#16C784]/20 border border-emerald-300 dark:border-[#16C784]/40 text-emerald-800 dark:text-[#16C784] px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-[#16C784]" />
              <span>Studio</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('live')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-[11px] font-bold shrink-0 whitespace-nowrap cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3040] animate-pulse" />
            <span>Mubashara</span>
          </button>

          <button
            type="button"
            onClick={toggleDataSaver}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              isDataSaver 
                ? 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50' 
                : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:border-[#262E3E]'
            }`}
          >
            <Zap className={`w-3 h-3 ${isDataSaver ? 'text-amber-600 fill-amber-500 dark:text-amber-400 dark:fill-amber-400' : ''}`} />
            <span>{isDataSaver ? 'Bando: 360p' : 'Bana Bando'}</span>
          </button>

          {!isInstalled && (
            <button
              type="button"
              onClick={() => setShowPWAModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] text-[11px] font-semibold text-slate-700 dark:text-white/90 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3 h-3 text-emerald-600 dark:text-[#16C784]" />
              <span>Weka App</span>
            </button>
          )}
        </div>
      )}

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
              className="w-full bg-slate-100 dark:bg-[#191E29] border border-[#FF3040]/70 rounded-full py-2 pl-4 pr-16 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0] focus:outline-none focus:ring-1 focus:ring-[#FF3040]"
            />
            {searchInput && (
              <button 
                type="button" 
                onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                className="absolute right-9 text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white p-1"
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
