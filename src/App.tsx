import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VideoProvider, useVideo } from './context/VideoContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { ShortsPage } from './pages/ShortsPage';
import { CreatorStudioPage } from './pages/CreatorStudioPage';
import { AdminPage } from './pages/AdminPage';
import { ChannelPage } from './pages/ChannelPage';
import { LibraryPage } from './pages/LibraryPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { SettingsPage } from './pages/SettingsPage';
import { UploadModal } from './components/upload/UploadModal';
import { WalletModal } from './components/wallet/WalletModal';
import { PremiumPlansModal } from './components/modals/PremiumPlansModal';
import { VideoItem, VideoCategory } from './types';
import { Sparkles, Shield, Info, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, switchDemoRole } = useAuth();
  const { setSelectedCategory, videos } = useVideo();

  const [activePage, setActivePage] = useState<string>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch-wasafi');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState<boolean>(false);
  const [premiumTarget, setPremiumTarget] = useState<'viewer' | 'creator'>('viewer');
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(true);

  const handleSelectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
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

  return (
    <div className="min-h-screen bg-[#10131B] text-white flex flex-col font-sans selection:bg-[#FF3040] selection:text-white">
      
      {/* Top Demo Notice & Role Selector Banner */}
      {showDemoBanner && (
        <div className="bg-gradient-to-r from-[#191E29] via-[#232A39] to-[#191E29] border-b border-[#262E3E] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-[#A7B0C0] z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16C784] animate-ping" />
            <span className="text-white font-semibold">Tazama Platform Live</span>
            <span className="hidden md:inline">• Firebase &lsquo;tazama-9862d&rsquo; &bull; Cloudinary &amp; Cloudflare Video CDN</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] hidden sm:inline">Jaribu kama:</span>
            <button
              onClick={() => switchDemoRole('viewer')}
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
            <button
              onClick={() => setShowDemoBanner(false)}
              className="text-[#A7B0C0] hover:text-white ml-2 text-xs"
              title="Funga taarifa hii"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main App Navbar */}
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

        {/* Content View Container */}
        <main 
          className={`flex-1 transition-all duration-300 px-3 sm:px-6 pt-4 sm:pt-5 pb-24 md:pb-8 min-w-0 ${
            isSidebarOpen ? 'md:ml-60' : 'md:ml-[72px]'
          }`}
        >
          {activePage === 'home' && (
            <HomePage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'watch' && selectedVideo && (
            <WatchPage
              video={selectedVideo}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onOpenWallet={() => setIsWalletOpen(true)}
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
            />
          )}

          {activePage === 'library' && (
            <LibraryPage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
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

          {/* Search results route fallback */}
          {activePage === 'search' && (
            <HomePage
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>

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
