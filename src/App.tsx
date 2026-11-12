import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VideoProvider, useVideo } from './context/VideoContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { ShortsPage } from './pages/ShortsPage';
import { ExplorePage } from './pages/ExplorePage';
import { ChannelsPage } from './pages/ChannelsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { CreatorStudioPage } from './pages/CreatorStudioPage';
import { AdminPage } from './pages/AdminPage';
import { ChannelPage } from './pages/ChannelPage';
import { LibraryPage } from './pages/LibraryPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LivePage } from './pages/LivePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { MiniPlayer } from './components/common/MiniPlayer';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { UploadModal } from './components/upload/UploadModal';
import { WalletModal } from './components/wallet/WalletModal';
import { USSDPushModal } from './components/wallet/USSDPushModal';
import { PremiumPlansModal } from './components/modals/PremiumPlansModal';
import { CreateChannelModal } from './components/channel/CreateChannelModal';
import { CreateAdModal } from './components/ads/CreateAdModal';
import { VideoItem, VideoCategory, UserRole } from './types';
import { Sparkles, Shield, Info, CheckCircle2, X } from 'lucide-react';
import { TazamaActionToastPayload } from './components/video/VideoActionsMenu';

const AppContent: React.FC = () => {
  const { role, profile, switchDemoRole } = useAuth();
  const { setSelectedCategory, videos, shorts, liveStreams, setActiveLiveStream } = useVideo();

  const [activePage, setActivePage] = useState<string>('home');
  const [navRequestSeq, setNavRequestSeq] = useState<number>(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const liveSelectedVideo = selectedVideo 
    ? (videos.find(v => v.id === selectedVideo.id) || (shorts && shorts.find(s => s.id === selectedVideo.id)) || selectedVideo)
    : null;
  const [minimizedVideo, setMinimizedVideo] = useState<VideoItem | null>(null);
  const [isMiniPlaying, setIsMiniPlaying] = useState<boolean>(true);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch-lucifer-donghua-tz');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState<boolean>(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState<boolean>(false);
  const [isCreateAdOpen, setIsCreateAdOpen] = useState<boolean>(false);
  const [premiumTarget, setPremiumTarget] = useState<'viewer' | 'creator'>('viewer');
  const [authActionPrompt, setAuthActionPrompt] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<TazamaActionToastPayload | null>(null);
  const deepLinkHandledRef = React.useRef(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const handleAuthReq = (e: any) => {
      const action = e.detail?.action || 'kutumia huduma hii';
      setAuthActionPrompt(action);
    };
    window.addEventListener('tazama_show_auth_modal', handleAuthReq);
    return () => window.removeEventListener('tazama_show_auth_modal', handleAuthReq);
  }, []);

  React.useEffect(() => {
    let timerId: number | undefined;
    const handleActionToast = (e: Event) => {
      const detail = (e as CustomEvent<TazamaActionToastPayload>).detail;
      if (!detail || !detail.message) return;
      setActionToast(detail);
      if (timerId) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        setActionToast(null);
      }, 4500);
    };
    window.addEventListener('tazama_action_toast', handleActionToast);
    return () => {
      window.removeEventListener('tazama_action_toast', handleActionToast);
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  React.useEffect(() => {
    if (deepLinkHandledRef.current || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sharedVideoId = params.get('v');
    const sharedLiveId = params.get('live');
    if (!sharedVideoId && !sharedLiveId) {
      deepLinkHandledRef.current = true;
      return;
    }
    if (sharedVideoId) {
      const found =
        videos.find((v) => v.id === sharedVideoId) ||
        (shorts && shorts.find((s) => s.id === sharedVideoId));
      if (found) {
        deepLinkHandledRef.current = true;
        setSelectedVideo(found);
        setMinimizedVideo(found);
        setIsMiniPlaying(true);
        setActivePage('watch');
      }
      return;
    }
    if (sharedLiveId) {
      const foundLive = (liveStreams || []).find((s) => s.id === sharedLiveId);
      if (foundLive) {
        deepLinkHandledRef.current = true;
        setActiveLiveStream(foundLive);
        setActivePage('live');
      }
    }
  }, [videos, shorts, liveStreams, setActiveLiveStream]);

  const handleSelectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setMinimizedVideo(video);
    setIsMiniPlaying(true);
    setActivePage('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    setActivePage('channel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    setNavRequestSeq((n) => n + 1);
    if (page.startsWith('cat-')) {
      const categoryMap: Record<string, VideoCategory> = {
        'cat-music': 'Muziki',
        'cat-sports': 'Michezo',
        'cat-comedy': 'Vichekesho',
        'cat-news': 'Habari',
        'cat-education': 'Elimu'
      };
      const cat = categoryMap[page] || 'Burudani';
      setSelectedCategory(cat);
      setActivePage('home');
    } else {
      setActivePage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUpload = () => {
    if (!profile) {
      setActivePage('login');
      return;
    }
    setIsUploadOpen(true);
  };

  const handleOpenWallet = () => {
    if (!profile) {
      setActivePage('login');
      return;
    }
    setIsWalletOpen(true);
  };

  const handleAuthSuccess = (targetRole: UserRole) => {
    switchDemoRole(targetRole);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F4F6F9] dark:bg-[#10131B] text-[#0F172A] dark:text-white flex flex-col font-sans selection:bg-[#FF3040] selection:text-white transition-colors duration-200">
      
      {/* Main App Navbar (Hidden on mobile watch & shorts pages for focused immersion) */}
      <div className={activePage === 'watch' || activePage === 'shorts' ? 'hidden sm:block' : 'block'}>
        <Navbar
          onOpenUpload={handleOpenUpload}
          onOpenWallet={handleOpenWallet}
          onOpenPremium={(target) => {
            setPremiumTarget(target || 'viewer');
            setIsPremiumOpen(true);
          }}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={handleNavigate}
          onStartCreator={() => setIsCreateChannelOpen(true)}
          onOpenCreateAd={() => setIsCreateAdOpen(true)}
        />
      </div>

      {/* Main Body with Responsive Sidebar */}
      <div className="flex flex-1 relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activePage={activePage}
          onNavigate={(page) => {
            handleNavigate(page);
            setIsSidebarOpen(false);
          }}
          onOpenUpload={() => {
            handleOpenUpload();
            setIsSidebarOpen(false);
          }}
          onOpenPremium={(target) => {
            setPremiumTarget(target || 'viewer');
            setIsPremiumOpen(true);
            setIsSidebarOpen(false);
          }}
          onStartCreator={() => {
            setIsSidebarOpen(false);
            setIsCreateChannelOpen(true);
          }}
          onOpenCreateAd={() => {
            setIsSidebarOpen(false);
            setIsCreateAdOpen(true);
          }}
        />

        {/* Content View Container: Full width/bleed on mobile for Watch, Shorts, and Channel */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            activePage === 'shorts'
              ? 'px-0 sm:px-6 pt-0 sm:pt-3 pb-[62px] md:pb-6'
              : activePage === 'watch' || activePage === 'channel'
                ? 'px-0 sm:px-6 pt-0 sm:pt-4 pb-20 md:pb-8'
                : 'px-3 sm:px-6 pt-3 sm:pt-5 pb-20 md:pb-8'
          } min-w-0 ${
            isSidebarOpen ? 'md:ml-60' : 'md:ml-[72px]'
          }`}
        >
          {activePage === 'home' && (
            <HomePage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onNavigate={handleNavigate}
              onOpenUpload={handleOpenUpload}
            />
          )}

          {(activePage === 'explore' || activePage === 'trending') && (
            <ExplorePage
              initialCategory="trend"
              tabRequestKey={navRequestSeq}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onNavigateHome={() => handleNavigate('home')}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'subscriptions' && (
            <SubscriptionsPage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'channels' && (
            <ChannelsPage
              onSelectChannel={handleSelectChannel}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}

          {activePage === 'watch' && liveSelectedVideo && (
            <WatchPage
              video={liveSelectedVideo}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onOpenWallet={handleOpenWallet}
              onNavigate={handleNavigate}
              onMinimize={() => {
                setActivePage('home');
              }}
            />
          )}

          {activePage === 'shorts' && (
            <ShortsPage
              onSelectChannel={handleSelectChannel}
              onOpenWallet={handleOpenWallet}
              onNavigate={handleNavigate}
            />
          )}

          {(activePage === 'studio' || activePage === 'gifts' || activePage === 'memberships') && (
            profile && (role === 'creator' || role === 'admin') ? (
              <CreatorStudioPage
                initialTab={
                  activePage === 'gifts'
                    ? 'revenue'
                    : activePage === 'memberships'
                      ? 'memberships'
                      : 'dashboard'
                }
                tabRequestKey={navRequestSeq}
                onOpenUpload={handleOpenUpload}
                onOpenPremium={() => {
                  setPremiumTarget('creator');
                  setIsPremiumOpen(true);
                }}
              />
            ) : profile && role === 'viewer' ? (
              <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-8 text-center space-y-5 shadow-xl dark:shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-[#16C784]/15 border border-emerald-200 dark:border-[#16C784]/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-[#16C784]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Kuwa Muundaji wa Tazama</h2>
                    <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                      Akaunti yako ({profile.displayName}) kwa sasa ipo katika hadhi ya Mtazamaji. Boresha sasa uwe Muundaji wa Maudhui ili ufungue Studio ya Waumbaji, upakie video, na upate mapato ya M-Pesa.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      onClick={() => setIsCreateChannelOpen(true)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#16C784] to-[#13ab71] hover:brightness-110 text-black text-xs font-bold transition-all shadow-lg shadow-[#16C784]/25 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>Anza Kuwa Creator</span>
                    </button>
                    <button
                      onClick={() => setActivePage('home')}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-[#262E3E] transition-all"
                    >
                      Rudi Nyumbani
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-8 text-center space-y-5 shadow-xl dark:shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-[#16C784]/15 border border-emerald-200 dark:border-[#16C784]/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-[#16C784]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Studio ya Waumbaji wa Tazama</h2>
                    <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                      Kupakia video, kusimamia chaneli yako, na kuangalia mapato ya kazi zako, tafadhali ingia au jisajili kama Muundaji wa Maudhui.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      onClick={() => setActivePage('login')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#16C784] hover:bg-[#13ab71] text-black text-xs font-bold transition-all shadow-lg shadow-[#16C784]/25"
                    >
                      Ingia Kwenye Akaunti
                    </button>
                    <button
                      onClick={() => setActivePage('register')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-[#262E3E] transition-all"
                    >
                      Jisajili kama Muundaji
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {activePage === 'channel' && (
            <ChannelPage
              channelId={selectedChannelId}
              onSelectVideo={handleSelectVideo}
              onOpenUpload={handleOpenUpload}
              onNavigateHome={() => handleNavigate('home')}
              onNavigate={handleNavigate}
            />
          )}

          {(activePage === 'library' || activePage === 'history' || activePage === 'liked') && (
            <LibraryPage
              initialTab={
                activePage === 'history'
                  ? 'history'
                  : activePage === 'liked'
                    ? 'liked'
                    : 'all'
              }
              tabRequestKey={navRequestSeq}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onOpenWallet={handleOpenWallet}
              onOpenPremium={() => {
                setPremiumTarget('viewer');
                setIsPremiumOpen(true);
              }}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'admin' && (
            profile && (role === 'admin' || role === 'moderator' || role === 'finance') ? (
              <AdminPage />
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-8 text-center space-y-5 shadow-xl dark:shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Jopo la Mfumo Limelindwa</h2>
                    <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                      Jopo hili la Usimamizi (Admin Hub) linahitaji uingie na akaunti iliyothibitishwa ya Msimamizi Mkuu wa Tazama. Wageni na watazamaji wa kawaida hawaruhusiwi kufikia eneo hili.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      onClick={() => setActivePage('login')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF3040]/25"
                    >
                      Ingia Kama Msimamizi
                    </button>
                    <button
                      onClick={() => setActivePage('home')}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] text-slate-700 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-[#262E3E] transition-all"
                    >
                      Rudi Nyumbani
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {activePage === 'policies' && (
            <PoliciesPage />
          )}

          {activePage === 'settings' && (
            <SettingsPage onNavigate={handleNavigate} />
          )}

          {activePage === 'live' && (
            <LivePage
              onSelectChannel={handleSelectChannel}
              onOpenWallet={handleOpenWallet}
            />
          )}

          {activePage === 'login' && (
            <LoginPage
              onNavigate={handleNavigate}
              onLoginSuccess={handleAuthSuccess}
            />
          )}

          {activePage === 'register' && (
            <RegisterPage
              onNavigate={handleNavigate}
              onRegisterSuccess={handleAuthSuccess}
            />
          )}

          {/* Search results dedicated route */}
          {activePage === 'search' && (
            <SearchResultsPage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}
        </main>
      </div>

      {/* Floating MiniPlayer Docked Above Bottom Bar */}
      {minimizedVideo && activePage !== 'watch' && activePage !== 'shorts' && (
        <MiniPlayer
          video={minimizedVideo}
          isPlaying={isMiniPlaying}
          onTogglePlay={() => setIsMiniPlaying(!isMiniPlaying)}
          onExpand={() => {
            setSelectedVideo(minimizedVideo);
            setActivePage('watch');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onClose={() => setMinimizedVideo(null)}
        />
      )}

      {/* Global Upload Studio Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newVid) => {
          handleSelectVideo(newVid);
        }}
      />

      {/* Global Mobile Money Wallet Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />

      {/* Global Premium Plans Subscription Modal */}
      <PremiumPlansModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
        defaultTarget={premiumTarget}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* Global Interactive Mobile Money STK Push USSD Modal */}
      <USSDPushModal />

      {/* Global 6-Step Channel Creation Wizard Modal */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onSuccess={(createdChannel) => {
          setSelectedChannelId(createdChannel.id);
          setActivePage('studio');
        }}
      />

      {/* Global Create Ad Campaign Modal (Viewer & Creator) */}
      <CreateAdModal
        isOpen={isCreateAdOpen}
        onClose={() => setIsCreateAdOpen(false)}
      />

      {/* Global Auth Prompt Modal */}
      {authActionPrompt && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#191E2A] border border-slate-200 dark:border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#FF3040]/10 text-[#FF3040] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ingia kwenye Akaunti</h3>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                Ili uweze {authActionPrompt}, unahitaji kuwa umeingia kwenye akaunti yako ya Tazama.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setAuthActionPrompt(null);
                  setActivePage('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF3040] hover:bg-[#FF3040]/90 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Ingia Sasa (Sign In)
              </button>
              <button
                onClick={() => {
                  setAuthActionPrompt(null);
                  setActivePage('register');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:border-transparent dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Tengeneza Akaunti Mpya (Register)
              </button>
              <button
                onClick={() => setAuthActionPrompt(null)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white pt-1 cursor-pointer"
              >
                Baadaye (Ghairi)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Action / Undo Toast */}
      {actionToast && (
        <div
          key={actionToast.id}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-md bg-slate-900 dark:bg-[#191E29] text-white border border-slate-700/80 dark:border-[#2E3748] rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none"
        >
          <span className="text-xs font-semibold leading-snug flex-1">
            {actionToast.message}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {actionToast.undoLabel && actionToast.onUndo && (
              <button
                type="button"
                onClick={() => {
                  actionToast.onUndo?.();
                  setActionToast(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FF3040]/20 hover:bg-[#FF3040]/30 text-[#FF5C69] font-extrabold text-xs cursor-pointer transition-colors"
              >
                {actionToast.undoLabel}
              </button>
            )}
            {actionToast.actionLabel && actionToast.onAction && (
              <button
                type="button"
                onClick={() => {
                  actionToast.onAction?.();
                  setActionToast(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#16C784]/20 hover:bg-[#16C784]/30 text-[#16C784] font-extrabold text-xs cursor-pointer transition-colors"
              >
                {actionToast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActionToast(null)}
              className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              aria-label="Funga"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <VideoProvider>
        <AppContent />
      </VideoProvider>
    </AuthProvider>
  );
}
