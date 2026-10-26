import React, { useState } from 'react';
import { 
  Home, 
  Flame, 
  Tv, 
  Clock, 
  ThumbsUp, 
  Library, 
  Sparkles, 
  Music, 
  Trophy, 
  Laugh, 
  Newspaper, 
  GraduationCap, 
  ShieldAlert, 
  Gift, 
  Users, 
  Film,
  Plus,
  Crown,
  X,
  Settings,
  ShieldCheck,
  Compass,
  Radio,
  Download,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../lib/i18n';
import { PWAInstallModal } from '../modals/PWAInstallModal';

interface SidebarProps {
  isOpen: boolean;
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenUpload: () => void;
  onOpenPremium?: (target?: 'viewer' | 'creator') => void;
  onClose?: () => void;
  onStartCreator?: () => void;
  onOpenCreateAd?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  activePage, 
  onNavigate,
  onOpenUpload,
  onOpenPremium,
  onClose,
  onStartCreator,
  onOpenCreateAd
}) => {
  const { language, role, profile, upgradeToCreator, logout } = useAuth();
  const [showPWAModal, setShowPWAModal] = useState(false);
  const t = translations[language];

  const mainNavItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'live', label: 'Mubashara (Live)', icon: Radio, badge: 'LIVE' },
    { id: 'shorts', label: t.shorts, icon: Film, badge: '🔥' },
    { id: 'subscriptions', label: t.subscriptions, icon: Tv },
  ];

  const libraryItems = [
    { id: 'library', label: t.library, icon: Library },
    { id: 'history', label: t.history, icon: Clock },
    { id: 'liked', label: t.likedVideos, icon: ThumbsUp },
  ];

  const exploreItems = [
    { id: 'trending', label: t.trending, icon: Flame },
    { id: 'cat-music', label: t.music, icon: Music },
    { id: 'cat-sports', label: t.sports, icon: Trophy },
    { id: 'cat-comedy', label: t.comedy, icon: Laugh },
    { id: 'cat-news', label: t.news, icon: Newspaper },
    { id: 'cat-education', label: t.education, icon: GraduationCap },
  ];

  const creatorItems = [
    { id: 'studio', label: t.creatorStudio, icon: Sparkles, highlight: true },
    { id: 'gifts', label: 'Zawadi za Watayarishaji', icon: Gift },
    { id: 'memberships', label: 'Uanachama (Memberships)', icon: Users },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* 1. Desktop & Tablet Sidebar */}
      <aside 
        className={`fixed left-0 top-[61px] bottom-0 z-30 transition-all duration-300 bg-[#10131B] border-r border-[#262E3E] overflow-y-auto hidden md:block ${
          isOpen ? 'w-60 px-3 py-4' : 'w-[72px] px-2 py-4'
        }`}
      >
        {/* Main Section */}
        <div className="space-y-1 pb-3 border-b border-[#262E3E]">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#FF3040] text-white shadow-md shadow-[#FF3040]/30' 
                    : 'text-[#A7B0C0] hover:text-white hover:bg-[#191E29]'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isOpen && (
                  <span className="truncate flex items-center justify-between flex-1">
                    {item.label}
                    {item.badge && <span className="text-[10px]">{item.badge}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Creator Economy Section - Strictly guarded by role */}
        {profile && (role === 'creator' || role === 'admin') ? (
          <div className="pt-3 pb-3 border-b border-[#262E3E] space-y-1">
            {isOpen && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#16C784]">
                {language === 'sw' ? 'Uchumi wa Waumbaji' : 'Creator Economy'}
              </p>
            )}
            {creatorItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#16C784] text-white shadow-md shadow-[#16C784]/20' 
                      : 'text-[#A7B0C0] hover:text-white hover:bg-[#191E29]'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${item.highlight ? 'text-[#16C784]' : ''}`} />
                  {isOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ) : profile && role === 'viewer' && !profile.channelId ? (
          /* Logged-in Viewer: Trigger 6-Step Channel Creation */
          isOpen && (
            <div className="pt-3 pb-3 border-b border-[#262E3E]">
              <div className="p-3 mx-1 rounded-2xl bg-gradient-to-br from-[#191E29] to-[#121622] border border-[#262E3E] space-y-2">
                <div className="flex items-center gap-2 text-[#16C784]">
                  <Sparkles className="w-4 h-4 text-[#16C784]" />
                  <span className="text-xs font-bold text-white">Anza Kuwa Creator</span>
                </div>
                <p className="text-[11px] text-[#A7B0C0] leading-snug">
                  Fungua channel yako ya Tazama, weka kazi zako, linda hakimiliki na uanze kupata mapato.
                </p>
                <button
                  onClick={() => {
                    if (onStartCreator) onStartCreator();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#16C784] to-[#13ab71] hover:brightness-110 text-black font-black text-xs transition-colors shadow-md shadow-[#16C784]/20 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Anza Kuwa Creator</span>
                </button>
              </div>
            </div>
          )
        ) : (
          /* Unauthenticated Guest: Clean Creator Promo */
          isOpen && (
            <div className="pt-3 pb-3 border-b border-[#262E3E]">
              <div className="p-3 mx-1 rounded-2xl bg-[#191E29] border border-[#262E3E] space-y-2">
                <div className="flex items-center gap-2 text-[#16C784]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Wewe ni Muundaji?</span>
                </div>
                <p className="text-[11px] text-[#A7B0C0] leading-snug">
                  Pakia kazi zako, linda hakimiliki na COSOTA, na upokee mapato.
                </p>
                <button
                  onClick={() => handleItemClick('register')}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#16C784]/20 hover:bg-[#16C784]/30 border border-[#16C784]/40 text-[#16C784] font-bold text-xs transition-colors text-center"
                >
                  Jisajili kama Muundaji
                </button>
              </div>
            </div>
          )
        )}

        {/* Tazama Platform Premium Button */}
        <div className="pt-3 pb-3 border-b border-[#262E3E]">
          <button
            onClick={() => onOpenPremium && onOpenPremium(role === 'creator' ? 'creator' : 'viewer')}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/30 text-amber-300 hover:border-amber-400 hover:text-white"
            title="Tazama Premium Plans"
          >
            <Crown className="w-5 h-5 shrink-0 text-amber-400" />
            {isOpen && (
              <span className="truncate flex items-center justify-between flex-1">
                Tazama Premium
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-extrabold uppercase">VIP</span>
              </span>
            )}
          </button>
        </div>

        {/* Tazama Ads Button (Viewer & Creator) */}
        <div className="pt-3 pb-3 border-b border-[#262E3E]">
          <button
            onClick={() => {
              if (onOpenCreateAd) onOpenCreateAd();
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 text-amber-300 hover:border-amber-400 hover:text-white"
            title="Weka Tangazo (Tazama Ads)"
          >
            <Megaphone className="w-5 h-5 shrink-0 text-amber-400" />
            {isOpen && (
              <span className="truncate flex items-center justify-between flex-1">
                Weka Tangazo
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-extrabold uppercase">Ads</span>
              </span>
            )}
          </button>
        </div>

        {/* Library Section */}
        <div className="pt-3 pb-3 border-b border-[#262E3E] space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0]">
              {language === 'sw' ? 'Wewe & Maktaba' : 'Library'}
            </p>
          )}
          {libraryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#FF3040] text-white' 
                    : 'text-[#A7B0C0] hover:text-white hover:bg-[#191E29]'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Explore Categories */}
        <div className="pt-3 pb-3 border-b border-[#262E3E] space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0]">
              {t.explore}
            </p>
          )}
          {exploreItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#FF3040] text-white' 
                    : 'text-[#A7B0C0] hover:text-white hover:bg-[#191E29]'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Admin Section (Only for authenticated admin/moderators) */}
        {profile && (role === 'admin' || role === 'moderator' || role === 'finance') && (
          <div className="pt-3 pb-3 border-b border-[#262E3E] space-y-1">
            {isOpen && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Usimamizi (Admin)
              </p>
            )}
            <button
              onClick={() => handleItemClick('admin')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activePage === 'admin' 
                  ? 'bg-amber-500 text-black font-bold' 
                  : 'text-amber-400 hover:text-white hover:bg-[#191E29]'
              }`}
              title="Jopo la Mkuu wa Mfumo"
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {isOpen && <span className="truncate">Admin Dashboard</span>}
            </button>
          </div>
        )}

        {/* Account & Login Section (Only shown when not logged in) */}
        {!profile && (
          <div className="pt-3 pb-3 border-b border-[#262E3E] space-y-1">
            {isOpen && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0]">
                Akaunti &amp; Kuingia
              </p>
            )}
          <button
            onClick={() => handleItemClick('login')}
            className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activePage === 'login' 
                ? 'bg-purple-600 text-white font-bold' 
                : 'text-[#A7B0C0] hover:text-white hover:bg-[#191E29]'
            }`}
            title="Ingia Kwenye Akaunti Yako"
          >
            <Users className="w-5 h-5 shrink-0 text-purple-400" />
            {isOpen && <span className="truncate">Kuingia (Login)</span>}
          </button>
          <button
            onClick={() => handleItemClick('register')}
            className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activePage === 'register' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-[#A7B0C0] hover:text-white hover:bg-[#191E29]'
            }`}
            title="Tengeneza Akaunti Mpya"
          >
            <Crown className="w-5 h-5 shrink-0 text-blue-400" />
            {isOpen && <span className="truncate">Kujisajili (Register)</span>}
          </button>
        </div>
      )}

        {/* Footer links in sidebar */}
        {isOpen && (
          <div className="pt-4 px-3 text-[11px] text-[#A7B0C0]/70 space-y-2">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <button onClick={() => handleItemClick('policies')} className="hover:underline">Vigezo</button>
              <span>•</span>
              <button onClick={() => handleItemClick('policies')} className="hover:underline">Faragha</button>
              <span>•</span>
              <button onClick={() => handleItemClick('policies')} className="hover:underline">Hakimiliki</button>
              <span>•</span>
              <button onClick={() => handleItemClick('policies')} className="hover:underline">Miongozo</button>
            </div>
            <p className="text-[10px] text-[#A7B0C0]/50 pt-1">
              © 2026 Tazama Platform TZ.<br/>Unda. Tazama. Pata.
            </p>
          </div>
        )}
      </aside>

      {/* 2. Mobile Slide-Over Drawer (Toggled by hamburger on Phone screen) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Dark Backdrop */}
          <div 
            onClick={onClose} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer Content */}
          <div className="relative w-[300px] max-w-[85vw] h-full bg-[#10131B] border-r border-[#262E3E] shadow-2xl flex flex-col z-10 overflow-y-auto p-4 space-y-4 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3040] to-[#FF6B6B] flex items-center justify-center shadow-lg shadow-[#FF3040]/30">
                  <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-0.5" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                    TAZAMA
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3040]" />
                  </span>
                  <span className="text-[9px] text-[#A7B0C0] uppercase font-semibold">Tanzania Stream</span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-2 rounded-full text-[#A7B0C0] hover:text-white hover:bg-[#191E29] transition-colors"
                title="Funga Menyu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile status pill or Guest login invitation */}
            {profile ? (
              <div className="p-3 rounded-2xl bg-[#191E29] border border-[#262E3E] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt={profile.displayName}
                    className="w-9 h-9 rounded-full object-cover border border-[#262E3E] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{profile.displayName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        role === 'admin' ? 'bg-amber-500/20 text-amber-400' : role === 'creator' ? 'bg-[#16C784]/20 text-[#16C784]' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {role}
                      </span>
                      <span className="text-[10px] font-mono text-[#16C784]">
                        TZS {(profile.balanceTZS || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    if (onClose) onClose();
                  }}
                  className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#232A39] transition-colors"
                  title="Toka (Logout)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#191E29] border border-[#262E3E] space-y-2.5">
                <div>
                  <p className="text-xs font-bold text-white">Karibu Tazama!</p>
                  <p className="text-[11px] text-[#A7B0C0] leading-snug mt-0.5">
                    Ingia au sajili akaunti kufurahia maudhui na kusimamia huduma zote.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleItemClick('login')}
                    className="flex-1 py-1.5 rounded-xl bg-[#FF3040] text-white font-bold text-xs text-center hover:bg-[#E02635] transition-colors shadow-md shadow-[#FF3040]/25"
                  >
                    Kuingia
                  </button>
                  <button
                    onClick={() => handleItemClick('register')}
                    className="flex-1 py-1.5 rounded-xl bg-[#232A39] border border-[#262E3E] text-white font-semibold text-xs text-center hover:bg-[#2E3748] transition-colors"
                  >
                    Kujisajili
                  </button>
                </div>
              </div>
            )}

            {/* Main Menu Links */}
            <div className="space-y-1 pb-3 border-b border-[#262E3E]">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#FF3040] text-white font-bold' 
                        : 'text-[#A7B0C0] hover:text-white hover:bg-[#191E29]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tazama Premium Action */}
            <div className="pb-3 border-b border-[#262E3E]">
              <button
                onClick={() => {
                  if (onClose) onClose();
                  if (onOpenPremium) onOpenPremium(role === 'creator' ? 'creator' : 'viewer');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-[#FF3040]/10 border border-amber-500/40 text-amber-300 font-bold text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Vifurushi vya Premium</span>
                </div>
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-extrabold uppercase">VIP</span>
              </button>

              {/* Install PWA App Button */}
              <button
                onClick={() => {
                  if (onClose) onClose();
                  setShowPWAModal(true);
                }}
                className="w-full mt-2 flex items-center justify-between p-3 rounded-2xl bg-[#16C784]/15 border border-[#16C784]/30 text-[#16C784] font-bold text-xs hover:bg-[#16C784]/25 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-[#16C784]" />
                  <span>Weka App kwenye Simu</span>
                </div>
                <span className="text-[9px] bg-[#16C784] text-black px-1.5 py-0.5 rounded font-extrabold uppercase">BURE</span>
              </button>
            </div>

            {/* Creator Economy Mobile - Strictly guarded */}
            {profile && (role === 'creator' || role === 'admin') ? (
              <div className="space-y-1 pb-3 border-b border-[#262E3E]">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#16C784]">
                  Uchumi wa Waumbaji
                </p>
                {creatorItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-[#16C784] text-black font-bold' 
                          : 'text-[#A7B0C0] hover:text-white hover:bg-[#191E29]'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0 text-[#16C784]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : profile && role === 'viewer' && !profile.channelId ? (
              <div className="pb-3 border-b border-[#262E3E]">
                <button
                  onClick={() => {
                    if (onClose) onClose();
                    if (onStartCreator) onStartCreator();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#16C784]/15 border border-[#16C784]/30 text-[#16C784] font-bold text-xs hover:bg-[#16C784]/25 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#16C784]" />
                    <span>Anza Kuwa Creator</span>
                  </div>
                  <span className="text-[9px] bg-[#16C784] text-black px-1.5 py-0.5 rounded font-black uppercase">Fungua Channel</span>
                </button>
              </div>
            ) : (
              <div className="pb-3 border-b border-[#262E3E]">
                <button
                  onClick={() => handleItemClick('register')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#191E29] border border-[#262E3E] text-[#16C784] font-bold text-xs hover:bg-[#232A39] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#16C784]" />
                    <span>Jiunge kama Muundaji</span>
                  </div>
                  <span className="text-[9px] bg-[#16C784]/20 text-[#16C784] px-1.5 py-0.5 rounded font-semibold uppercase">Pata Mapato</span>
                </button>
              </div>
            )}

            {/* Admin Section (If admin/moderator) */}
            {profile && (role === 'admin' || role === 'moderator' || role === 'finance') && (
              <div className="space-y-1 pb-3 border-b border-[#262E3E]">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Usimamizi wa Mfumo
                </p>
                <button
                  onClick={() => handleItemClick('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activePage === 'admin'
                      ? 'bg-amber-500 text-black'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Admin Dashboard</span>
                </button>
              </div>
            )}

            {/* Library Links */}
            <div className="space-y-1 pb-3 border-b border-[#262E3E]">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0]">
                Maktaba Yako
              </p>
              {libraryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-[#FF3040] text-white' : 'text-[#A7B0C0] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Explore categories */}
            <div className="space-y-1 pb-3">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0]">
                Maudhui &amp; Makundi
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[#191E29] hover:bg-[#232A39] text-[#A7B0C0] hover:text-white text-[11px] font-medium"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Policy & Terms link */}
            <div className="pt-2 text-[10px] text-[#A7B0C0]/60 space-y-1">
              <button 
                onClick={() => handleItemClick('policies')} 
                className="hover:underline block text-left"
              >
                Vigezo, Faragha &amp; Hakimiliki COSOTA
              </button>
              <p>© 2026 Tazama Platform TZ</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Dock (Hidden on WatchPage for full immersive view) */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 bg-[#121620]/95 backdrop-blur-xl border-t border-[#262E3E]/80 px-2 py-1.5 items-center justify-around md:hidden safe-area-pb shadow-2xl ${
        activePage === 'watch' ? 'hidden' : 'flex'
      }`}>
        {/* Home */}
        <button
          onClick={() => handleItemClick('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
            activePage === 'home' ? 'text-white font-bold' : 'text-[#A7B0C0] hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${activePage === 'home' ? 'text-white stroke-[2.5]' : 'text-[#A7B0C0]'}`} />
          <span className="truncate">Home</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => handleItemClick('explore')}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
            activePage === 'explore' ? 'text-white font-bold' : 'text-[#A7B0C0] hover:text-white'
          }`}
        >
          <Compass className={`w-5 h-5 mb-0.5 ${activePage === 'explore' ? 'text-white stroke-[2.5]' : 'text-[#A7B0C0]'}`} />
          <span className="truncate">Explore</span>
        </button>

        {/* Center Floating Plus Action (Upload Video / Short) */}
        <button
          onClick={() => {
            onOpenUpload();
            if (onClose) onClose();
          }}
          className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-[#FF3040] text-white shadow-xl shadow-[#FF3040]/50 active:scale-95 transition-transform"
          title="Unda Video / Short"
          aria-label="Upload Video"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Channels */}
        <button
          onClick={() => handleItemClick('channels')}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
            activePage === 'channels' ? 'text-white font-bold' : 'text-[#A7B0C0] hover:text-white'
          }`}
        >
          <Users className={`w-5 h-5 mb-0.5 ${activePage === 'channels' ? 'text-white stroke-[2.5]' : 'text-[#A7B0C0]'}`} />
          <span className="truncate">Channels</span>
        </button>

        {/* Library */}
        <button
          onClick={() => handleItemClick('library')}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
            activePage === 'library' ? 'text-white font-bold' : 'text-[#A7B0C0] hover:text-white'
          }`}
        >
          <Library className={`w-5 h-5 mb-0.5 ${activePage === 'library' ? 'text-white stroke-[2.5]' : 'text-[#A7B0C0]'}`} />
          <span className="truncate">Library</span>
        </button>
      </nav>

      {/* PWA Install Guide Modal */}
      <PWAInstallModal 
        isOpen={showPWAModal} 
        onClose={() => setShowPWAModal(false)} 
      />
    </>
  );
};
