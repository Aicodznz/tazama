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
import { CreatorStudioPage } from './pages/CreatorStudioPage';
import { AdminPage } from './pages/AdminPage';
import { ChannelPage } from './pages/ChannelPage';
import { LibraryPage } from './pages/LibraryPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LivePage } from './pages/LivePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MiniPlayer } from './components/common/MiniPlayer';
import { UploadModal } from './components/upload/UploadModal';
import { WalletModal } from './components/wallet/WalletModal';
import { USSDPushModal } from './components/wallet/USSDPushModal';
import { PremiumPlansModal } from './components/modals/PremiumPlansModal';
import { CreateChannelModal } from './components/channel/CreateChannelModal';
import { VideoItem, VideoCategory, UserRole } from './types';
import { Sparkles, Shield, Info, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, profile, switchDemoRole, upgradeToCreator } = useAuth();
  const { setSelectedCategory, videos } = useVideo();

  const [activePage, setActivePage] = useState<string>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [minimizedVideo, setMinimizedVideo] = useState<VideoItem | null>(null);
  const [isMiniPlaying, setIsMiniPlaying] = useState<boolean>(true);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch-wasafi');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState<boolean>(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState<boolean>(false);
  const [premiumTarget, setPremiumTarget] = useState<'viewer' | 'creator'>('viewer');

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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#10131B] text-white flex flex-col font-sans selection:bg-[#FF3040] selection:text-white">
      
      {/* Main App Navbar (Hidden on mobile watch page for focused immersion) */}
      <div className={activePage === 'watch' ? 'hidden sm:block' : 'block'}>
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
        />

        {/* Content View Container: Full width/bleed on mobile for Watch & Shorts */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            activePage === 'watch' || activePage === 'shorts'
              ? 'px-0 sm:px-6 pt-0 sm:pt-4 pb-20 md:pb-8'
              : 'px-3 sm:px-6 pt-3 sm:pt-5 pb-24 md:pb-8'
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

          {activePage === 'explore' && (
            <ExplorePage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}

          {activePage === 'channels' && (
            <ChannelsPage
              onSelectChannel={handleSelectChannel}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}

          {activePage === 'watch' && selectedVideo && (
            <WatchPage
              video={selectedVideo}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onOpenWallet={handleOpenWallet}
              onMinimize={() => {
                setActivePage('home');
              }}
            />
          )}

          {activePage === 'shorts' && (
            <ShortsPage
              onSelectChannel={handleSelectChannel}
              onOpenWallet={handleOpenWallet}
            />
          )}

          {activePage === 'studio' && (
            profile && (role === 'creator' || role === 'admin') ? (
              <CreatorStudioPage
                onOpenUpload={handleOpenUpload}
                onOpenPremium={() => {
                  setPremiumTarget('creator');
                  setIsPremiumOpen(true);
                }}
              />
            ) : profile && role === 'viewer' ? (
              <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#191E29] border border-[#262E3E] rounded-3xl p-8 text-center space-y-5 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-[#16C784]/15 border border-[#16C784]/30 flex items-center justify-center mx-auto text-[#16C784]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-white">Kuwa Muundaji wa Tazama</h2>
                    <p className="text-xs text-[#A7B0C0] leading-relaxed">
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
                      className="py-2.5 px-4 rounded-xl bg-[#232A39] hover:bg-[#2E3748] text-white text-xs font-semibold border border-[#262E3E] transition-all"
                    >
                      Rudi Nyumbani
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#191E29] border border-[#262E3E] rounded-3xl p-8 text-center space-y-5 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-[#16C784]/15 border border-[#16C784]/30 flex items-center justify-center mx-auto text-[#16C784]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-white">Studio ya Waumbaji wa Tazama</h2>
                    <p className="text-xs text-[#A7B0C0] leading-relaxed">
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
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#232A39] hover:bg-[#2E3748] text-white text-xs font-semibold border border-[#262E3E] transition-all"
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
            />
          )}

          {activePage === 'library' && (
            <LibraryPage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onOpenWallet={handleOpenWallet}
              onOpenPremium={() => {
                setPremiumTarget('viewer');
                setIsPremiumOpen(true);
              }}
            />
          )}

          {activePage === 'admin' && (
            profile && (role === 'admin' || role === 'moderator' || role === 'finance') ? (
              <AdminPage />
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#191E29] border border-[#262E3E] rounded-3xl p-8 text-center space-y-5 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-white">Jopo la Mfumo Limelindwa</h2>
                    <p className="text-xs text-[#A7B0C0] leading-relaxed">
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
                      className="py-2.5 px-4 rounded-xl bg-[#232A39] hover:bg-[#2E3748] text-[#A7B0C0] hover:text-white text-xs font-semibold border border-[#262E3E] transition-all"
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
            <SettingsPage />
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

          {/* Search results route fallback */}
          {activePage === 'search' && (
            <HomePage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onNavigate={handleNavigate}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Floating MiniPlayer Docked Above Bottom Bar (Matching Screenshot 3 & 4) */}
      {minimizedVideo && activePage !== 'watch' && (
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
