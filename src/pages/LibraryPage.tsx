import React, { useState } from 'react';
import { 
  Clock, 
  ThumbsUp, 
  Tv, 
  Library, 
  Download, 
  ListMusic, 
  Plus, 
  Trash2, 
  HardDrive, 
  Play, 
  CheckCircle2, 
  FolderPlus,
  WifiOff,
  Wallet,
  Crown,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Check,
  ChevronRight,
  Flame,
  UserCheck,
  Radio,
  LogIn,
  UserPlus,
  User
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { VideoItem, Playlist } from '../types';
import { translations, formatViews, formatTZS } from '../lib/i18n';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';

interface LibraryPageProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onOpenWallet?: () => void;
  onOpenPremium?: () => void;
  onNavigate?: (page: string) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ 
  onSelectVideo, 
  onSelectChannel,
  onOpenWallet,
  onOpenPremium,
  onNavigate
}) => {
  const { 
    watchHistory, 
    videos, 
    likedVideoIds, 
    channels, 
    userSubscriptions,
    offlineDownloads,
    removeDownload,
    playlists,
    createPlaylist,
    deletePlaylist,
    isDataSaver,
    toggleDataSaver
  } = useVideo();
  const { profile, language } = useAuth();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'all' | 'offline' | 'playlists' | 'history' | 'liked' | 'subscriptions'>('all');
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');
  const [clearHistoryToast, setClearHistoryToast] = useState<boolean>(false);

  const likedVideos = videos ? videos.filter(v => Boolean(v && v.id && likedVideoIds.includes(v.id))) : [];
  const subbedChannels = channels ? channels.filter(c => Boolean(c && c.id && userSubscriptions.includes(c.id))) : [];
  const subbedVideos = videos ? videos.filter(v => Boolean(v && v.channelId && userSubscriptions.includes(v.channelId))) : [];

  // Calculate total offline storage used
  const totalOfflineBytes = offlineDownloads.reduce((acc, curr) => acc + curr.fileSizeBytes, 0);
  const totalOfflineMB = (totalOfflineBytes / (1024 * 1024)).toFixed(1);

  const isLoggedIn = Boolean(profile && profile.uid);
  const isVIP = Boolean(isLoggedIn && profile?.premiumPlanId && profile.premiumPlanId !== 'plan-viewer-free');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;
    createPlaylist(newPlaylistTitle.trim(), newPlaylistDesc.trim());
    setNewPlaylistTitle('');
    setNewPlaylistDesc('');
    setShowCreatePlaylistModal(false);
  };

  return (
    <div className="space-y-5 pb-8 select-none max-w-6xl mx-auto">
      
      {/* 1. Viewer Hub Header: Profile Card (Logged-in) OR Clean Guest Banner (Not Logged-in) */}
      {isLoggedIn ? (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-white via-slate-50 to-slate-100 dark:from-[#191E29] dark:via-[#1E2638] dark:to-[#121622] border border-slate-200 dark:border-[#262E3E] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm dark:shadow-xl">
          {/* User Identity Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile?.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt={profile.displayName || 'User'} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createAvatarSvgDataUri(profile.displayName || 'User');
                  }}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#FF3040]/40 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF3040] to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  {(profile?.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              {isVIP && (
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400 absolute -top-1.5 -right-1.5 drop-shadow" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{profile?.displayName || 'Mwanachama wa Tazama'}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isVIP 
                    ? 'bg-gradient-to-r from-amber-400 to-[#FF3040] text-black shadow-sm' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-[#10131B] dark:text-[#A7B0C0] dark:border-[#262E3E]'
                }`}>
                  {isVIP ? 'Tazama VIP Mwezi' : (profile?.role === 'creator' ? 'Muundaji (Creator)' : profile?.role === 'admin' ? 'Msimamizi Mkuu' : 'Mtumiaji')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0] mt-0.5 font-mono">
                {profile?.email} &bull; <span className="font-sans text-slate-700 dark:text-[#CBD5E1]">{subbedChannels.length} vituo unavyofuatilia</span>
              </p>
            </div>
          </div>

          {/* Quick Viewer Action Badges & Wallet Balance */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Wallet Balance Pill */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-[#16C784]/20 text-emerald-700 dark:text-[#16C784] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] block font-semibold">Salio Lako la Tazama</span>
                <span className="text-sm font-black font-mono text-emerald-700 dark:text-[#16C784]">{formatTZS(profile?.balanceTZS || 0)}</span>
              </div>
              {onOpenWallet && (
                <button
                  onClick={onOpenWallet}
                  className="ml-2 px-3 py-1.5 rounded-xl bg-[#16C784] hover:bg-[#13A76E] text-black font-extrabold text-[10px] shadow-sm transition-all"
                >
                  + Weka Pesa
                </button>
              )}
            </div>

            {/* Data Saver Mode Pill */}
            <button
              onClick={toggleDataSaver}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                isDataSaver 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-[#16C784]/15 dark:border-[#16C784]/40 dark:text-[#16C784]' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#10131B] dark:border-[#262E3E] dark:text-[#A7B0C0] dark:hover:text-white'
              }`}
              title="Washa au zima ubora wa kubana MBs kwenye video"
            >
              <Smartphone className="w-4 h-4" />
              <div>
                <span className="text-[10px] block font-semibold">Kubana Bando</span>
                <span className="text-xs font-bold">{isDataSaver ? 'Imewashwa (360p)' : 'Imezimwa (HD)'}</span>
              </div>
            </button>

            {/* Premium VIP Upgrade / Status Button */}
            {onOpenPremium && !isVIP && (
              <button
                onClick={onOpenPremium}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-[#FF3040] hover:brightness-110 text-black font-black text-xs shadow-lg shadow-amber-400/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Crown className="w-4 h-4" />
                <span>Ondoa Matangazo (VIP)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Guest Banner: Clean State When Not Logged In (No Fake Profile / No Fake Salio) */
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-white via-slate-50 to-slate-100 dark:from-[#191E29] dark:via-[#161B26] dark:to-[#121622] border border-slate-200 dark:border-[#262E3E] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm dark:shadow-xl">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF3040]/10 border border-[#FF3040]/30 flex items-center justify-center text-[#FF3040] shrink-0 shadow-lg shadow-[#FF3040]/10">
              <Library className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Maktaba Yako ya Tazama</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700 border border-slate-300 dark:bg-[#232A39] dark:text-[#A7B0C0] dark:border-[#262E3E]">
                  Hujaingia (Mgeni)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0] max-w-xl leading-relaxed">
                Ingia kwenye akaunti yako au jisajili ili uweze kuhifadhi video unazozipenda, kuunda orodha zako (playlists), kufuata chaneli unazopenda, na kusawazisha historia yako.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF3040]/25 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Kuingia Kwenye Akaunti</span>
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 hover:text-slate-900 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:border-[#262E3E] dark:text-[#CBD5E1] dark:hover:text-white text-xs font-semibold transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                  <span>Kujisajili Bure</span>
                </button>
              </>
            )}

            {/* Data Saver Mode Pill (Always usable) */}
            <button
              onClick={toggleDataSaver}
              className={`p-2.5 px-3 rounded-xl border text-left flex items-center gap-2 transition-all active:scale-95 ${
                isDataSaver 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-[#16C784]/15 dark:border-[#16C784]/40 dark:text-[#16C784]' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#10131B] dark:border-[#262E3E] dark:text-[#A7B0C0] dark:hover:text-white'
              }`}
              title="Washa au zima ubora wa kubana MBs kwenye video"
            >
              <Smartphone className="w-4 h-4" />
              <div>
                <span className="text-[10px] block font-semibold">Kubana Bando</span>
                <span className="text-[11px] font-bold">{isDataSaver ? 'Imewashwa (360p)' : 'Imezimwa (HD)'}</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2. Subscribed Channels Carousel (Vituo Unavyofuatilia) */}
      {subbedChannels.length > 0 && (
        <div className="p-4 rounded-3xl bg-white dark:bg-[#121622] border border-slate-200 dark:border-[#262E3E] space-y-3 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-[#FF3040]" />
              <span>Vituo Unavyofuatilia (Subscriptions)</span>
            </h3>
            <span className="text-[11px] text-slate-600 dark:text-[#A7B0C0] font-mono">{subbedChannels.length} vituo</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
            {subbedChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 group min-w-[70px] text-center"
              >
                <div className="relative">
                  <img
                    src={ch.avatarUrl || createAvatarSvgDataUri(ch.name)}
                    alt={ch.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createAvatarSvgDataUri(ch.name);
                    }}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-[#262E3E] group-hover:ring-[#FF3040] transition-all bg-slate-100 dark:bg-[#141824]"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16C784] absolute bottom-0 right-0 ring-2 ring-white dark:ring-[#121622]" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-white truncate max-w-[80px] group-hover:text-[#FF3040] transition-colors">
                  {ch.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Zote (All)' },
          { id: 'offline', label: `Nje ya Mtandao (${offlineDownloads.length})`, icon: WifiOff },
          { id: 'playlists', label: `Orodha Zangu (${playlists.length})`, icon: ListMusic },
          { id: 'history', label: `Historia (${watchHistory.length})`, icon: Clock },
          { id: 'liked', label: `Zilizopendwa (${likedVideos.length})`, icon: ThumbsUp },
          { id: 'subscriptions', label: `Video Mpya (${subbedVideos.length})`, icon: Tv }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#FF3040] text-white shadow-md shadow-[#FF3040]/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Create Playlist Action on Right */}
        <button
          onClick={() => setShowCreatePlaylistModal(true)}
          className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 dark:bg-[#191E29] dark:hover:bg-[#232A39] dark:border-[#262E3E] dark:text-white whitespace-nowrap shrink-0 transition-all active:scale-95"
        >
          <FolderPlus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>+ Orodha Mpya</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. OFFLINE DOWNLOADS SECTION */}
      {/* ------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'offline') && (
        <div className="space-y-3.5 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
              <span>Video Zilizopakuliwa (Offline Storage)</span>
            </h2>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-[#16C784]/10 dark:border-[#16C784]/20 px-3 py-1 rounded-full text-xs dark:text-[#16C784] font-semibold">
              <HardDrive className="w-3.5 h-3.5" />
              <span>{totalOfflineMB} MB zimetumika &bull; Tazama popote bila intaneti</span>
            </div>
          </div>

          {offlineDownloads.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#191E29]/60 rounded-2xl border border-slate-200 dark:border-[#262E3E] space-y-2 shadow-sm dark:shadow-none">
              <WifiOff className="w-8 h-8 text-slate-400 dark:text-[#A7B0C0] mx-auto opacity-70" />
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                Hauna video uliyopakua bado. Bonyeza kitufe cha &lsquo;Pakua&rsquo; kwenye video yoyote uipendayo ili kuitazama nje ya mtandao bila bando.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offlineDownloads.map((dl) => (
                <div
                  key={dl.videoId}
                  className="group relative p-3 rounded-2xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] hover:border-emerald-400 dark:hover:border-[#16C784]/40 transition-all flex flex-col justify-between gap-3 shadow-sm dark:shadow-lg"
                >
                  <div 
                    onClick={() => onSelectVideo(dl.video)}
                    className="relative w-full aspect-video rounded-xl overflow-hidden bg-black cursor-pointer"
                  >
                    <img
                      src={dl.video.thumbnailUrl || createThumbnailSvgDataUri(dl.video.title, dl.video.category)}
                      alt={dl.video.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createThumbnailSvgDataUri(dl.video.title, dl.video.category);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#16C784] text-black text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Nje ya Mtandao</span>
                    </div>
                    <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-[#FF3040] text-white flex items-center justify-center shadow-lg">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                  </div>

                  <div>
                    <h3 
                      onClick={() => onSelectVideo(dl.video)}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#FF3040] cursor-pointer transition-colors"
                    >
                      {dl.video.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0] mt-1">
                      {dl.video.channelName} &bull; {(dl.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#262E3E]/60 text-xs">
                    <button
                      onClick={() => onSelectVideo(dl.video)}
                      className="flex items-center gap-1 text-emerald-700 dark:text-[#16C784] hover:underline font-bold"
                    >
                      <Play className="w-3 h-3" />
                      <span>Tazama Sasa</span>
                    </button>
                    <button
                      onClick={() => removeDownload(dl.videoId)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-[#A7B0C0] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Futa faili hili la simu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. CUSTOM PLAYLISTS SECTION */}
      {/* ------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'playlists') && (
        <div className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-[#262E3E]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Orodha Zangu za Nyimbo &amp; Video (Playlists)</span>
            </h2>
            <span className="text-xs text-slate-600 dark:text-[#A7B0C0]">{playlists.length} orodha</span>
          </div>

          {playlists.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-[#191E29]/40 rounded-2xl border border-slate-200 dark:border-[#262E3E]/60 space-y-2 shadow-sm dark:shadow-none">
              <ListMusic className="w-6 h-6 text-slate-400 dark:text-[#A7B0C0] mx-auto opacity-60" />
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                {isLoggedIn 
                  ? 'Hauna orodha ya video bado. Bonyeza kitufe cha "+ Orodha Mpya" hapo juu kuanza kutengeneza.'
                  : 'Hujaunda orodha ya video bado. Ingia kwenye akaunti yako ili kuunda na kuhifadhi orodha zako.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((pl) => {
                const count = pl.videoIds.length;
                return (
                  <div
                    key={pl.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] hover:border-purple-400 dark:hover:border-purple-500/40 transition-all space-y-3 shadow-sm dark:shadow-lg"
                  >
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                      <img
                        src={pl.coverUrl || createThumbnailSvgDataUri(pl.title, 'Playlist')}
                        alt={pl.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = createThumbnailSvgDataUri(pl.title, 'Playlist');
                        }}
                        className="w-full h-full object-cover opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                          <ListMusic className="w-3 h-3 text-purple-400" />
                          <span>{count} video</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{pl.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-[#A7B0C0] line-clamp-1 mt-0.5">
                        {pl.description || 'Hakuna maelezo'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#262E3E]/60 text-xs">
                      <button
                        onClick={() => {
                          const firstVid = videos.find(v => pl.videoIds.includes(v.id)) || videos[0];
                          if (firstVid) onSelectVideo(firstVid);
                        }}
                        className="flex items-center gap-1.5 text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-bold"
                      >
                        <Play className="w-3.5 h-3.5 fill-purple-600 dark:fill-purple-400" />
                        <span>Cheza Orodha Hii</span>
                      </button>
                      <button
                        onClick={() => deletePlaylist(pl.id)}
                        className="p-1 rounded-lg text-slate-500 dark:text-[#A7B0C0] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Futa orodha hii"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. WATCH HISTORY SECTION */}
      {/* ------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'history') && (
        <div className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-[#262E3E]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF3040]" />
              <span>{t.history}</span>
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 dark:text-[#A7B0C0]">{watchHistory.length} video</span>
              {watchHistory.length > 0 && (
                <button
                  onClick={() => {
                    setClearHistoryToast(true);
                    setTimeout(() => setClearHistoryToast(false), 2000);
                  }}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
                >
                  Safisha Historia
                </button>
              )}
            </div>
          </div>

          {clearHistoryToast && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-400">
              Historia ya video imewekwa salama kwenye kumbukumbu ya faragha.
            </div>
          )}

          {watchHistory.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-[#191E29]/40 rounded-2xl border border-slate-200 dark:border-[#262E3E]/60 space-y-2 shadow-sm dark:shadow-none">
              <Clock className="w-6 h-6 text-slate-400 dark:text-[#A7B0C0] mx-auto opacity-60" />
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                {isLoggedIn 
                  ? 'Bado haujatazama video yoyote kwenye kipindi hiki.' 
                  : 'Bado haujatazama video yoyote. Ingia ili uweze kusawazisha na kuhifadhi historia yako ya kutazama.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchHistory.slice(0, 6).map((vid) => (
                <VideoCard
                  key={vid.id}
                  video={vid}
                  onSelectVideo={onSelectVideo}
                  onSelectChannel={onSelectChannel}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. LIKED VIDEOS SECTION */}
      {/* ------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'liked') && (
        <div className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-[#262E3E]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
              <span>{t.likedVideos}</span>
            </h2>
            <span className="text-xs text-slate-600 dark:text-[#A7B0C0]">{likedVideos.length} video</span>
          </div>

          {likedVideos.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-[#191E29]/40 rounded-2xl border border-slate-200 dark:border-[#262E3E]/60 space-y-2 shadow-sm dark:shadow-none">
              <ThumbsUp className="w-6 h-6 text-slate-400 dark:text-[#A7B0C0] mx-auto opacity-60" />
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                {isLoggedIn 
                  ? 'Hauna video uliyoweka Like bado.' 
                  : 'Hauna video uliyoweka Like bado. Ingia ili video uzipendazo zihifadhiwe hapa.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedVideos.map((vid) => (
                <VideoCard
                  key={vid.id}
                  video={vid}
                  onSelectVideo={onSelectVideo}
                  onSelectChannel={onSelectChannel}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. SUBSCRIBED VIDEOS SECTION */}
      {/* ------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'subscriptions') && (
        <div className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-[#262E3E]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#FF3040]" />
              <span>Video Mpya Kutoka kwa Waumbaji Wako</span>
            </h2>
            <span className="text-xs text-slate-600 dark:text-[#A7B0C0]">{subbedVideos.length} video</span>
          </div>

          {subbedVideos.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-[#191E29]/40 rounded-2xl border border-slate-200 dark:border-[#262E3E]/60 space-y-2 shadow-sm dark:shadow-none">
              <Tv className="w-6 h-6 text-slate-400 dark:text-[#A7B0C0] mx-auto opacity-60" />
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                {isLoggedIn 
                  ? 'Jiunge na vituo (Subscribe) ili kuona video zao mpya hapa kwanza.' 
                  : 'Jiunge na vituo unavyovipenda ili kuona video mpya za waumbaji wako hapa.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subbedVideos.map((vid) => (
                <VideoCard
                  key={vid.id}
                  video={vid}
                  onSelectVideo={onSelectVideo}
                  onSelectChannel={onSelectChannel}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262E3E]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tengeneza Orodha Mpya ya Video</h3>
              </div>
              <button 
                onClick={() => setShowCreatePlaylistModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/90 mb-1">
                  Jina la Orodha (Playlist Name):
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="Mfano: Bongo Flava Kali 2026, Vichekesho..."
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/90 mb-1">
                  Maelezo Mafupi (Description):
                </label>
                <textarea
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Orodha ya nyimbo na video ninazozipenda..."
                  className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl py-2 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0] focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#262E3E] text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistTitle.trim()}
                  className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-purple-500/20"
                >
                  Hifadhi Orodha
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
