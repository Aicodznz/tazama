import React from 'react';
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
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../lib/i18n';

interface SidebarProps {
  isOpen: boolean;
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenUpload: () => void;
  onOpenPremium?: (target?: 'viewer' | 'creator') => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  activePage, 
  onNavigate,
  onOpenUpload,
  onOpenPremium,
  onClose
}) => {
  const { language, role, profile } = useAuth();
  const t = translations[language];

  const mainNavItems = [
    { id: 'home', label: t.home, icon: Home },
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

        {/* Creator Economy Section */}
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

          {/* Tazama Platform Premium Button */}
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

        {/* Admin Section (If admin role active) */}
        {role === 'admin' && (
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

            {/* Profile status pill */}
            <div className="p-3 rounded-2xl bg-[#191E29] border border-[#262E3E] flex items-center gap-3">
              <img 
                src={profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                alt={profile?.displayName}
                className="w-10 h-10 rounded-full object-cover border border-[#262E3E]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{profile?.displayName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] bg-[#FF3040]/20 text-[#FF3040] font-bold px-1.5 py-0.2 rounded uppercase">
                    {role}
                  </span>
                  <span className="text-[10px] font-mono text-[#16C784]">
                    TZS {(profile?.balanceTZS || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

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
            </div>

            {/* Creator Economy Mobile */}
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

            {/* Admin Section (If admin) */}
            {role === 'admin' && (
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

      {/* 3. Mobile Bottom Navigation Bar (Phone UX - Sticky and Always Visible on Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#10131B]/95 backdrop-blur-md border-t border-[#262E3E] px-2 py-1 flex items-center justify-around md:hidden safe-area-pb">
        {/* Home */}
        <button
          onClick={() => handleItemClick('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
            activePage === 'home' ? 'text-[#FF3040]' : 'text-[#A7B0C0] hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="truncate">{t.home}</span>
        </button>

        {/* Shorts */}
        <button
          onClick={() => handleItemClick('shorts')}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
            activePage === 'shorts' ? 'text-[#FF3040]' : 'text-[#A7B0C0] hover:text-white'
          }`}
        >
          <Film className="w-5 h-5 mb-0.5" />
          <span className="truncate">{t.shorts}</span>
        </button>

        {/* Center Floating Plus Action (Upload Video / Short) */}
        <button
          onClick={() => {
            onOpenUpload();
            if (onClose) onClose();
          }}
          className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF3040] to-[#FF6B6B] text-white shadow-lg shadow-[#FF3040]/40 active:scale-95 transition-transform"
          title={t.upload}
          aria-label="Upload Video"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Premium Plans */}
        <button
          onClick={() => {
            if (onClose) onClose();
            if (onOpenPremium) onOpenPremium(role === 'creator' ? 'creator' : 'viewer');
          }}
          className="flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors text-amber-400 hover:text-amber-300"
        >
          <Crown className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="truncate">Premium</span>
        </button>

        {/* Role-Aware Tab (Admin if role===admin, Studio if creator, else Library) */}
        {role === 'admin' ? (
          <button
            onClick={() => handleItemClick('admin')}
            className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
              activePage === 'admin' ? 'text-amber-400 font-bold' : 'text-[#A7B0C0] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5 text-amber-400" />
            <span className="truncate">Admin</span>
          </button>
        ) : role === 'creator' ? (
          <button
            onClick={() => handleItemClick('studio')}
            className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
              activePage === 'studio' ? 'text-[#16C784] font-bold' : 'text-[#A7B0C0] hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5 text-[#16C784]" />
            <span className="truncate">Studio</span>
          </button>
        ) : (
          <button
            onClick={() => handleItemClick('library')}
            className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
              activePage === 'library' ? 'text-[#FF3040]' : 'text-[#A7B0C0] hover:text-white'
            }`}
          >
            <Library className="w-5 h-5 mb-0.5" />
            <span className="truncate">{t.library}</span>
          </button>
        )}
      </nav>
    </>
  );
};
