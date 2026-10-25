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
import { VideoItem, VideoCategory, UserRole } from './types';
import { Sparkles, Shield, Info, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, switchDemoRole } = useAuth();
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
  const [premiumTarget, setPremiumTarget] = useState<'viewer' | 'creator'>('viewer');
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(true);

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

  const handleAuthSuccess = (targetRole: UserRole) => {
    switchDemoRole(targetRole);
    if (targetRole === 'admin' || targetRole === 'moderator' || targetRole === 'finance') {
      setActivePage('admin');
    } else if (targetRole === 'creator') {
      setActivePage('studio');
    } else {
      setActivePage('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#10131B] text-white flex flex-col font-sans selection:bg-[#FF3040] selection:text-white">
      
      {/* Top Demo Notice & Role Selector Banner (Hidden in watch & shorts for full immersion) */}
      {showDemoBanner && activePage !== 'watch' && activePage !== 'shorts' && (
        <div className="bg-gradient-to-r from-[#191E29] via-[#232A39] to-[#191E29] border-b border-[#262E3E] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-[#A7B0C0] z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16C784] animate-ping" />
            <span className="text-white font-semibold">Tazama Platform Live</span>
            <span className="hidden md:inline">• Panel &amp; Auth Hub</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] hidden sm:inline">Panel za Moja kwa Moja:</span>
            <button
              onClick={() => { switchDemoRole('viewer'); setActivePage('home'); }}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${role === 'viewer' ? 'bg-[#FF3040] text-white' : 'bg-[#10131B] text-[#A7B0C0] hover:text-white'}`}
            >
              Mtazamaji (Viewer)
            </button>
            <button
              onClick={() => { switchDemoRole('creator'); setActivePage('studio'); }}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${role === 'creator' ? 'bg-[#16C784] text-black font-extrabold' : 'bg-[#10131B] text-[#A7B0C0] hover:text-white'}`}
            >
              Muundaji (Creator)
            </button>
            <button
              onClick={() => { switchDemoRole('admin'); setActivePage('admin'); }}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${role === 'admin' ? 'bg-amber-400 text-black font-extrabold' : 'bg-[#10131B] text-[#A7B0C0] hover:text-white'}`}
            >
              Mkuu (Admin)
            </button>

            <div className="w-[1px] h-3 bg-[#262E3E] mx-1" />

            <button
              onClick={() => setActivePage('login')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                activePage === 'login' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'bg-[#191E29] hover:bg-[#232A39] text-purple-300 border border-purple-500/30'
              }`}
            >
              Kuingia (Login)
            </button>

            <button
              onClick={() => setActivePage('register')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                activePage === 'register' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-[#191E29] hover:bg-[#232A39] text-blue-300 border border-blue-500/30'
              }`}
            >
              Kujisajili (Register)
            </button>

            <button
              onClick={() => setShowDemoBanner(false)}
              className="text-[#A7B0C0] hover:text-white ml-1 text-xs"
              title="Funga taarifa hii"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main App Navbar (Hidden on mobile watch page for focused immersion) */}
      <div className={activePage === 'watch' ? 'hidden sm:block' : 'block'}>
        <Navbar
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenPremium={(target) => {
            setPremiumTarget(target || 'viewer');
            setIsPremiumOpen(true);
          }}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={handleNavigate}
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
            setIsUploadOpen(true);
            setIsSidebarOpen(false);
          }}
          onOpenPremium={(target) => {
            setPremiumTarget(target || 'viewer');
            setIsPremiumOpen(true);
            setIsSidebarOpen(false);
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
              onOpenUpload={() => setIsUploadOpen(true)}
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
              onOpenWallet={() => setIsWalletOpen(true)}
              onMinimize={() => {
                setActivePage('home');
              }}
            />
          )}

          {activePage === 'shorts' && (
            <ShortsPage
              onSelectChannel={handleSelectChannel}
              onOpenWallet={() => setIsWalletOpen(true)}
            />
          )}

          {activePage === 'studio' && (
            <CreatorStudioPage
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenPremium={() => {
                setPremiumTarget('creator');
                setIsPremiumOpen(true);
              }}
            />
          )}

          {activePage === 'channel' && (
            <ChannelPage
              channelId={selectedChannelId}
              onSelectVideo={handleSelectVideo}
              onOpenUpload={() => setIsUploadOpen(true)}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}

          {activePage === 'library' && (
            <LibraryPage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onOpenWallet={() => setIsWalletOpen(true)}
              onOpenPremium={() => {
                setPremiumTarget('viewer');
                setIsPremiumOpen(true);
              }}
            />
          )}

          {activePage === 'admin' && (
            <AdminPage />
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
              onOpenWallet={() => setIsWalletOpen(true)}
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
