import React, { useState, useMemo } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark, 
  Gift, 
  Award, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Bell, 
  BellRing, 
  BellOff, 
  Settings, 
  Download, 
  Play, 
  Plus, 
  X, 
  Lock, 
  LogIn, 
  UserPlus, 
  Copy,
  SlidersHorizontal,
  ChevronRight,
  MoreVertical,
  CornerDownRight
} from 'lucide-react';
import { VideoItem, VideoCategory } from '../types';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoThumbnailPreview } from '../components/video/VideoThumbnailPreview';
import { GiftModal } from '../components/gifts/GiftModal';
import { MembershipModal } from '../components/membership/MembershipModal';
import { ReportModal } from '../components/modals/ReportModal';
import { VideoDownloadModal } from '../components/modals/VideoDownloadModal';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatRelativeTime, formatDuration, translations } from '../lib/i18n';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';

interface WatchPageProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onOpenWallet: () => void;
  onNavigate?: (page: string) => void;
  onMinimize?: () => void;
}

type NotificationMode = 'all' | 'personalized' | 'none';

export const WatchPage: React.FC<WatchPageProps> = ({
  video,
  onSelectVideo,
  onSelectChannel,
  onOpenWallet,
  onNavigate,
  onMinimize
}) => {
  const { 
    videos, 
    shorts,
    channels,
    userSubscriptions, 
    toggleSubscribe, 
    likedVideoIds, 
    toggleLike, 
    comments, 
    addComment,
    isDownloaded,
    setMiniPlayerVideo,
    isDataSaver,
    playlists,
    addToPlaylist,
    removeFromPlaylist,
    createPlaylist
  } = useVideo();
  
  const { profile, language } = useAuth();
  const t = translations[language];

  // UI state
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [isCommentFocused, setIsCommentFocused] = useState<boolean>(false);
  const [commentSort, setCommentSort] = useState<'top' | 'newest'>('top');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);

  // Modals state
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [showMembershipModal, setShowMembershipModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState<boolean>(false);

  // Guest Auth Prompt Modal
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalAction, setAuthModalAction] = useState<string>('kutumia huduma hii');

  // Dislike State (with single-vote rule)
  const [dislikedVideoIds, setDislikedVideoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tazama_disliked_videos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Notification Bell Mode: 'all' | 'personalized' | 'none'
  const [bellMode, setBellMode] = useState<NotificationMode>('all');
  const [showBellDropdown, setShowBellDropdown] = useState<boolean>(false);
  const [bellToast, setBellToast] = useState<string | null>(null);

  // Share Feedback
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sidebar Filter Category
  const [selectedSidebarFilter, setSelectedSidebarFilter] = useState<string>('Zote');

  // Look up actual channel from database
  const creatorChannel = channels.find(c => 
    Boolean(video?.channelId && c.id === video.channelId) || 
    Boolean(video?.channelName && c.name.toLowerCase() === video.channelName.toLowerCase())
  );
  const realSubscriberCount = creatorChannel?.subscriberCount ?? 1;

  const isDownloadedAlready = video?.id ? isDownloaded(video.id) : false;
  const isSubscribed = Boolean(video?.channelId && userSubscriptions.includes(video.channelId));
  const isLiked = Boolean(video?.id && likedVideoIds.includes(video.id));
  const isDisliked = Boolean(video?.id && dislikedVideoIds.includes(video.id));
  const rawVideoComments = (video?.id && comments[video.id]) || [];

  // Sorted comments
  const videoComments = useMemo(() => {
    const list = [...rawVideoComments];
    if (commentSort === 'top') {
      return list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rawVideoComments, commentSort]);

  // Single-Vote Like handler
  const handleLikeClick = () => {
    if (!profile) {
      setAuthModalAction('kupiga kura ya Like (Kupenda)');
      setShowAuthModal(true);
      return;
    }
    if (isDisliked && video?.id) {
      setDislikedVideoIds(prev => {
        const next = prev.filter(id => id !== video.id);
        try { localStorage.setItem('tazama_disliked_videos', JSON.stringify(next)); } catch {}
        return next;
      });
    }
    toggleLike(video.id);
  };

  // Single-Vote Dislike handler
  const handleDislikeClick = () => {
    if (!profile) {
      setAuthModalAction('kupiga kura ya Dislike (Kutopenda)');
      setShowAuthModal(true);
      return;
    }
    if (isLiked && video?.id) {
      toggleLike(video.id);
    }
    setDislikedVideoIds(prev => {
      const exists = prev.includes(video.id);
      const next = exists ? prev.filter(id => id !== video.id) : [...prev, video.id];
      try { localStorage.setItem('tazama_disliked_videos', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Subscribe click handler
  const handleSubscribeClick = () => {
    if (!profile) {
      setAuthModalAction('kufuatilia chaneli hii (Kusubscribe)');
      setShowAuthModal(true);
      return;
    }
    toggleSubscribe(video.channelId);
  };

  // Bell click handler
  const handleBellClick = () => {
    if (!profile) {
      setAuthModalAction('kuchagua taarifa (Notifications) za kengele');
      setShowAuthModal(true);
      return;
    }
    setShowBellDropdown(prev => !prev);
  };

  const handleSelectBellMode = (mode: NotificationMode) => {
    setBellMode(mode);
    setShowBellDropdown(false);
    const messages: Record<NotificationMode, string> = {
      all: '🔔 Utaarifiwa kuhusu video zote mpya na matangazo ya Moja kwa Moja.',
      personalized: '🔕 Utaarifiwa kulingana na mapendeleo yako binafsi.',
      none: '🚫 Umezima taarifa zote kutoka kwa chaneli hii.'
    };
    setBellToast(messages[mode]);
    setTimeout(() => setBellToast(null), 3500);
  };

  // Download click handler
  const handleDownloadClick = () => {
    if (!profile) {
      setAuthModalAction('kupakua video kwenye simu au maktaba');
      setShowAuthModal(true);
      return;
    }
    setShowDownloadModal(true);
  };

  // Gift click handler
  const handleGiftClick = () => {
    if (!profile) {
      setAuthModalAction('kutuma zawadi (Gift) kwa muumbaji');
      setShowAuthModal(true);
      return;
    }
    setShowGiftModal(true);
  };

  // Save to Playlist click handler
  const handleSaveClick = () => {
    if (!profile) {
      setAuthModalAction('kuhifadhi video kwenye orodha za kucheza (Playlists)');
      setShowAuthModal(true);
      return;
    }
    setShowAddToPlaylistModal(true);
  };

  // Join Club click handler
  const handleJoinClubClick = () => {
    if (!profile) {
      setAuthModalAction('kujiunga na klabu ya uanachama wa chaneli');
      setShowAuthModal(true);
      return;
    }
    setShowMembershipModal(true);
  };

  // Comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      setAuthModalAction('kutoa maoni yako (Comment)');
      setShowAuthModal(true);
      return;
    }
    if (!commentText.trim()) return;
    addComment(video.id, commentText);
    setCommentText('');
    setIsCommentFocused(false);
  };

  const handleMinimize = () => {
    if (video) setMiniPlayerVideo(video);
    if (onMinimize) onMinimize();
  };

  // Share action
  const currentUrl = window.location.href;
  const shareMessage = `Tazama "${video.title}" kwenye Tazama Tanzania! ${currentUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Related Videos Recommendation
  const otherVideos = (videos || []).filter(v => Boolean(v && video && v.id && v.id !== video.id));
  const fallbackShortsAsVideos: VideoItem[] = (shorts || []).map(s => ({
    id: s.id,
    title: s.title,
    description: s.title,
    videoUrl: s.videoUrl,
    thumbnailUrl: s.thumbnailUrl,
    channelId: s.channelId,
    channelName: s.channelName,
    channelAvatar: s.channelAvatar,
    durationSeconds: 45,
    viewsCount: s.viewsCount,
    likesCount: s.likesCount,
    commentsCount: s.commentsCount,
    category: 'Vichekesho' as const,
    tags: ['shorts'],
    visibility: 'public' as const,
    processingStatus: 'ready' as const,
    createdAt: s.createdAt,
    isChannelVerified: true
  }));

  const allRecommendations: VideoItem[] = [...otherVideos, ...fallbackShortsAsVideos];

  // Filter recommendations by selected sidebar filter chip
  const filteredRecommendations = useMemo(() => {
    if (selectedSidebarFilter === 'Zote') {
      return allRecommendations;
    }
    if (selectedSidebarFilter === `Kutoka kwa ${video.channelName}`) {
      return allRecommendations.filter(v => v.channelId === video.channelId || v.channelName === video.channelName);
    }
    return allRecommendations.filter(v => v.category === selectedSidebarFilter);
  }, [allRecommendations, selectedSidebarFilter, video.channelId, video.channelName]);

  const sidebarChips = [
    'Zote',
    `Kutoka kwa ${video.channelName}`,
    'Vichekesho',
    'Muziki',
    'Michezo',
    'Habari',
    'Elimu'
  ];

  return (
    <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 select-none">
      
      {/* 2-Column Responsive Layout (YouTube-Style: Left Player & Discussion, Right Suggested Feed) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT PRIMARY COLUMN: Player, Title, Creator/Action Row, Description, Comments */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* Mobile Top Navigation Bar */}
          <div className="flex items-center justify-between py-2 px-1 sm:hidden bg-[#10131B] border-b border-[#262E3E]/60 sticky top-0 z-30 mb-1">
            <button
              onClick={handleMinimize}
              className="p-1 -ml-1 rounded-full hover:bg-[#191E29] text-white active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              title="Punguza video kwenye Mini-Player"
            >
              <ChevronDown className="w-5 h-5 text-[#FF3040]" />
              <span className="text-[11px] font-bold text-[#A7B0C0]">Rudi</span>
            </button>

            <div className="flex items-center gap-1.5 min-w-0 max-w-[200px] text-center">
              <span className="text-xs font-bold text-white truncate">
                {video.channelName}
              </span>
              {video.isChannelVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowReportModal(true)}
                className="p-1.5 rounded-full hover:bg-[#191E29] text-[#A7B0C0] hover:text-white transition-colors cursor-pointer"
                title="Ripoti Video"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Adaptive Video Player: 16:9 container */}
          <div className="w-full rounded-none sm:rounded-2xl overflow-hidden bg-black shadow-2xl">
            <VideoPlayer video={video} autoPlay={true} />
          </div>

          {/* Data Saver Mode Notice */}
          {isDataSaver && (
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                ⚡ Hali ya Kubana Bando (Data Saver) Imewashwa: Ubora wa 360p
              </span>
              <span className="text-[10px] font-bold text-amber-400">MBs Zinaokolewa</span>
            </div>
          )}

          {/* Video Title: Direct underneath player, bold & clear */}
          <h1 className="mt-3 sm:mt-4 text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
            {video.title}
          </h1>

          {/* CREATOR & ACTIONS ROW (Single unified horizontal row matching YouTube) */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/5">
            
            {/* Left Section: Creator Info + Subscribe + Bell + Join Club */}
            <div className="flex items-center gap-3 min-w-0">
              <div 
                onClick={() => onSelectChannel(video.channelId)}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
              >
                <img
                  src={video.channelAvatar || creatorChannel?.avatarUrl}
                  alt={video.channelName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createAvatarSvgDataUri(video.channelName);
                  }}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-[#FF3040] transition-all bg-[#141824]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-white truncate group-hover:text-[#FF3040] transition-colors">
                      {video.channelName}
                    </span>
                    {(video.isChannelVerified || creatorChannel?.isVerified) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A7B0C0] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#A7B0C0]">
                    {formatViews(realSubscriberCount, language)} {language === 'sw' ? 'wafuasi' : 'subscribers'}
                  </p>
                </div>
              </div>

              {/* Subscribe & Bell Button Group */}
              <div className="flex items-center gap-2 ml-1 sm:ml-2 relative">
                {isSubscribed ? (
                  /* Subscribed Pill with Bell Dropdown */
                  <div className="flex items-center rounded-full bg-white/10 hover:bg-white/15 transition-colors border border-white/10">
                    <button
                      onClick={handleSubscribeClick}
                      className="px-3.5 py-2 text-xs font-bold text-white/90 hover:text-white flex items-center gap-1.5 cursor-pointer"
                      title="Umesubscribe kwenye chaneli hii"
                    >
                      <Check className="w-3.5 h-3.5 text-[#16C784]" />
                      <span>Unafuatilia</span>
                    </button>
                    <div className="w-[1px] h-4 bg-white/20" />
                    <button
                      onClick={handleBellClick}
                      className="px-2.5 py-2 text-white/90 hover:text-white cursor-pointer relative"
                      title="Aina ya taarifa za kengele"
                    >
                      {bellMode === 'all' ? (
                        <BellRing className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ) : bellMode === 'personalized' ? (
                        <Bell className="w-4 h-4 text-blue-400" />
                      ) : (
                        <BellOff className="w-4 h-4 text-[#A7B0C0]" />
                      )}
                    </button>
                  </div>
                ) : (
                  /* Not Subscribed: Solid YouTube-style Subscribe Button */
                  <button
                    onClick={handleSubscribeClick}
                    className="px-4 py-2 rounded-full bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Fuatilia
                  </button>
                )}

                {/* 3-Tier Bell Dropdown Popover */}
                {showBellDropdown && (
                  <div className="absolute top-11 left-0 sm:left-auto w-64 bg-[#191E29] border border-[#262E3E] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-black text-[#A7B0C0] border-b border-[#262E3E] uppercase tracking-wider">
                      Aina ya Taarifa (Notifications)
                    </div>

                    <button
                      onClick={() => handleSelectBellMode('all')}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors ${
                        bellMode === 'all' ? 'bg-[#232A39] text-amber-400 font-bold' : 'hover:bg-[#232A39]/60 text-white'
                      }`}
                    >
                      <BellRing className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold">Zote (All)</div>
                        <div className="text-[10px] text-[#A7B0C0]">Pokea taarifa zote za video mpya na Live</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSelectBellMode('personalized')}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors ${
                        bellMode === 'personalized' ? 'bg-[#232A39] text-blue-400 font-bold' : 'hover:bg-[#232A39]/60 text-white'
                      }`}
                    >
                      <Bell className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                      <div>
                        <div className="text-xs font-bold">Zilizochaguliwa (Personalized)</div>
                        <div className="text-[10px] text-[#A7B0C0]">Taarifa maalum kulingana na unachopenda</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSelectBellMode('none')}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors ${
                        bellMode === 'none' ? 'bg-[#232A39] text-[#FF3040] font-bold' : 'hover:bg-[#232A39]/60 text-white'
                      }`}
                    >
                      <BellOff className="w-4 h-4 mt-0.5 shrink-0 text-[#FF3040]" />
                      <div>
                        <div className="text-xs font-bold">Hakuna (None)</div>
                        <div className="text-[10px] text-[#A7B0C0]">Usipokee taarifa kutoka chaneli hii</div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Join Club Pill Button */}
                <button
                  onClick={handleJoinClubClick}
                  className="hidden md:flex items-center gap-1 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Jiunge</span>
                </button>
              </div>
            </div>

            {/* Right Section: Action Buttons (Like/Dislike, Shiriki, Pakua, Zawadi, Orodha, More) */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
              
              {/* 1. Like & Dislike Combined Pill (Exact YouTube style) */}
              <div className="flex items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10 overflow-hidden shadow-sm">
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    isLiked ? 'text-[#FF3040]' : 'text-white'
                  }`}
                  title="Penda video hii"
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#FF3040]' : ''}`} />
                  <span>{formatViews(video.likesCount, language)}</span>
                </button>
                <div className="w-[1px] h-4 bg-white/20" />
                <button
                  onClick={handleDislikeClick}
                  className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    isDisliked ? 'text-amber-400' : 'text-[#A7B0C0] hover:text-white'
                  }`}
                  title="Sipendi video hii"
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              {/* 2. Shiriki (Share) Pill */}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer"
                title="Shiriki video"
              >
                <Share2 className="w-4 h-4" />
                <span>Shiriki</span>
              </button>

              {/* 3. Pakua (Download) Pill */}
              <button
                onClick={handleDownloadClick}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  isDownloadedAlready 
                    ? 'bg-[#16C784]/20 border-[#16C784]/50 text-[#16C784]' 
                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                }`}
                title="Pakua video"
              >
                {isDownloadedAlready ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16C784]" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isDownloadedAlready ? 'Imepakuliwa' : 'Pakua'}</span>
              </button>

              {/* 4. Zawadi (Gift) Pill */}
              <button
                onClick={handleGiftClick}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#16C784]/15 hover:bg-[#16C784]/25 border border-[#16C784]/40 text-xs font-bold text-[#16C784] transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Tuma zawadi ya kidijitali"
              >
                <Gift className="w-4 h-4" />
                <span>Zawadi</span>
              </button>

              {/* 5. Orodha (Save) Pill */}
              <button
                onClick={handleSaveClick}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer"
                title="Hifadhi kwenye playlist"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Orodha</span>
              </button>

              {/* More Actions (⋯) */}
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                title="Ripoti au mipangilio ya ziada"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Bell Toast Notification */}
          {bellToast && (
            <div className="mt-2.5 px-4 py-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-xs text-white text-center shadow-lg animate-in fade-in duration-200">
              {bellToast}
            </div>
          )}

          {/* DESCRIPTION CARD (Exact YouTube style: rounded container with views, date, and expandable text) */}
          <div 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-[#1A1F2B] hover:bg-[#202636] transition-colors cursor-pointer border border-white/5"
          >
            {/* Top stats line */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white mb-1.5">
              <span>{formatViews(video.viewsCount, language)} views</span>
              <span className="text-[#A7B0C0] font-normal">·</span>
              <span>{formatRelativeTime(video.createdAt, language)}</span>
              {video.category && (
                <>
                  <span className="text-[#A7B0C0] font-normal">·</span>
                  <span className="text-[#FF3040] font-semibold">#{video.category}</span>
                </>
              )}
            </div>

            {/* Description text */}
            <p className={`text-xs sm:text-sm text-[#D1D7E0] leading-relaxed whitespace-pre-line ${
              isDescExpanded ? '' : 'line-clamp-2'
            }`}>
              {video.description || 'Hakuna maelezo ya ziada kuhusu video hii.'}
            </p>

            {/* Expanded tags */}
            {video.tags && video.tags.length > 0 && isDescExpanded && (
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                {video.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-[#FF3040] hover:underline font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Inline More / Less toggle */}
            <div className="mt-2 text-xs font-bold text-white hover:text-[#FF3040] transition-colors">
              {isDescExpanded ? 'Onyesha kidogo' : '... Zaidi (more)'}
            </div>
          </div>

          {/* COMMENTS SECTION (Matching YouTube: Header with count, Sort button, Add comment box, Comments list) */}
          <div className="mt-6 pt-4 border-t border-white/10">
            
            {/* Comments Header & Sort By */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {videoComments.length} Maoni
                </h3>

                {/* Sort By Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Panga kwa: {commentSort === 'top' ? 'Maarufu zaidi' : 'Mpya zaidi'}</span>
                    <ChevronDown className="w-3 h-3 text-[#A7B0C0]" />
                  </button>

                  {showSortDropdown && (
                    <div className="absolute top-8 left-0 w-44 bg-[#191E29] border border-[#262E3E] rounded-xl shadow-2xl py-1 z-40 text-xs">
                      <button
                        onClick={() => { setCommentSort('top'); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 hover:bg-[#232A39] transition-colors ${
                          commentSort === 'top' ? 'text-[#FF3040] font-bold' : 'text-white'
                        }`}
                      >
                        Maarufu zaidi (Top)
                      </button>
                      <button
                        onClick={() => { setCommentSort('newest'); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 hover:bg-[#232A39] transition-colors ${
                          commentSort === 'newest' ? 'text-[#FF3040] font-bold' : 'text-white'
                        }`}
                      >
                        Mpya zaidi (Newest)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Input Box (Clean underline style like YouTube) */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
              <img
                src={profile?.photoURL || createAvatarSvgDataUri(profile?.displayName || 'User')}
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).src = createAvatarSvgDataUri(profile?.displayName || 'User');
                }}
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10 bg-[#141824]"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onFocus={() => setIsCommentFocused(true)}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={profile ? 'Andika maoni yako hapa...' : 'Ingia kwenye akaunti ili uweze kutoa maoni...'}
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white placeholder-[#A7B0C0]/70 focus:outline-none focus:border-[#FF3040] transition-colors"
                />

                {/* Comment Action Buttons (Visible when input is focused or has text) */}
                {(isCommentFocused || commentText.trim()) && (
                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCommentText('');
                        setIsCommentFocused(false);
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#A7B0C0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Ghairi
                    </button>
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        commentText.trim()
                          ? 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-md'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      Toa Maoni
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {videoComments.length > 0 ? (
                videoComments.map((c) => (
                  <div key={c.id} className="flex gap-3 text-xs sm:text-sm group">
                    <img
                      src={c.userAvatar}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createAvatarSvgDataUri(c.userName);
                      }}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/10 bg-[#141824]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-white text-xs">{c.userName}</span>
                        <span className="text-[11px] text-[#A7B0C0]">
                          {formatRelativeTime(c.createdAt, language)}
                        </span>
                      </div>
                      <p className="text-[#D1D7E0] leading-relaxed text-xs sm:text-sm">
                        {c.text}
                      </p>

                      {/* Comment Interactions (Like, Dislike, Reply) */}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#A7B0C0]">
                        <button className="flex items-center gap-1 hover:text-white cursor-pointer">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{c.likesCount || 0}</span>
                        </button>
                        <button className="hover:text-white cursor-pointer">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button className="font-semibold hover:text-white cursor-pointer">
                          Jibu
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#A7B0C0]">
                  Hakuna maoni yaliyowekwa bado. Kuwa wa kwanza kutoa maoni!
                </div>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT SECONDARY COLUMN: Filter Chips & Suggested Videos List (Matching image_23505de7.png) */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 space-y-4">
          
          {/* Horizontal Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {sidebarChips.map((chip) => {
              const isActive = selectedSidebarFilter === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setSelectedSidebarFilter(chip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white text-black shadow-sm' 
                      : 'bg-white/10 hover:bg-white/15 text-white'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* List of Recommended Video Cards */}
          <div className="space-y-3">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-3 group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {/* YouTube-Style Video Thumbnail Hover Preview */}
                  <div className="w-40 sm:w-44 shrink-0">
                    <VideoThumbnailPreview
                      video={item}
                      aspectRatioClass="aspect-video"
                      className="rounded-xl border border-white/5"
                      onSelectVideo={(v) => {
                        onSelectVideo(v);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>

                  {/* Video Meta Info */}
                  <div 
                    onClick={() => {
                      onSelectVideo(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="min-w-0 flex-1 flex flex-col justify-start py-0.5 cursor-pointer"
                  >
                    <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#FF3040] transition-colors">
                      {item.title}
                    </h4>
                    
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-[#A7B0C0] hover:text-white transition-colors">
                      <span className="truncate">{item.channelName}</span>
                      {item.isChannelVerified && (
                        <CheckCircle2 className="w-3 h-3 text-[#A7B0C0] shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#A7B0C0] mt-0.5">
                      <span>{formatViews(item.viewsCount, language)} views</span>
                      <span>•</span>
                      <span>{formatRelativeTime(item.createdAt, language)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 rounded-2xl bg-[#181C26] border border-[#262E3E] text-center text-xs text-[#A7B0C0]">
                Hakuna video zilizopatikana katika kundi hili.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 2. SHIRIKI (SHARE MODAL): WhatsApp, Facebook, Telegram, SMS, Copy Link */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#191E29] border border-[#262E3E] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#FF3040]" />
                <h3 className="text-sm font-bold text-white">Shiriki Video Hii</h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-[#A7B0C0] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A7B0C0]">
              Tuma video ya <strong>{video.title}</strong> kwa marafiki kupitia:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(video.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/30 text-[#0088cc] text-xs font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#0088cc]" />
                <span>Telegram</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-[#1877F2] text-xs font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                <span>Facebook</span>
              </a>

              {/* SMS */}
              <a
                href={`sms:?body=${encodeURIComponent(shareMessage)}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>SMS / Ujumbe</span>
              </a>
            </div>

            {/* Copy Link Direct Bar */}
            <div className="pt-2 border-t border-[#262E3E]">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#10131B] border border-[#262E3E]">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs text-[#A7B0C0] font-mono flex-1 outline-none truncate"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isCopied ? 'bg-[#16C784] text-black' : 'bg-[#FF3040] text-white hover:bg-[#E02635]'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Imenakiliwa' : 'Nakili Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ORODHA (SAVE TO PLAYLIST MODAL) */}
      {showAddToPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#191E29] border border-[#262E3E] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Hifadhi kwenye Orodha (Playlist)</h3>
              </div>
              <button 
                onClick={() => setShowAddToPlaylistModal(false)}
                className="text-[#A7B0C0] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Playlists list */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((pl) => {
                const isInList = pl.videoIds.includes(video.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => {
                      if (isInList) {
                        removeFromPlaylist(pl.id, video.id);
                      } else {
                        addToPlaylist(pl.id, video.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      isInList 
                        ? 'bg-[#16C784]/10 border-[#16C784]/40 text-white' 
                        : 'bg-[#10131B] hover:bg-[#232A39] border-[#262E3E] text-white'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{pl.title}</h4>
                      <p className="text-[10px] text-[#A7B0C0]">{pl.videoIds.length} video</p>
                    </div>
                    {isInList ? (
                      <span className="text-[10px] bg-[#16C784] text-black font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Imehifadhiwa
                      </span>
                    ) : (
                      <span className="text-[11px] text-purple-400 font-bold">+ Weka</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Create New Playlist Inline */}
            <div className="pt-2 border-t border-[#262E3E]">
              {isCreatingPlaylist ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    placeholder="Jina la orodha mpya..."
                    className="w-full bg-[#10131B] border border-[#262E3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsCreatingPlaylist(false)}
                      className="px-3 py-1 rounded-lg text-xs text-[#A7B0C0]"
                    >
                      Ghairi
                    </button>
                    <button
                      onClick={() => {
                        if (newPlaylistTitle.trim()) {
                          const newId = createPlaylist(newPlaylistTitle.trim());
                          addToPlaylist(newId, video.id);
                          setNewPlaylistTitle('');
                          setIsCreatingPlaylist(false);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold"
                    >
                      Tengeneza & Hifadhi
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingPlaylist(true)}
                  className="w-full py-2 px-3 rounded-xl bg-[#232A39] hover:bg-[#2E3748] text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Orodha Mpya ya Kucheza</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* GUEST AUTH PROMPT MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#191E29] border border-[#262E3E] rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#FF3040]/15 border border-[#FF3040]/30 flex items-center justify-center mx-auto text-[#FF3040]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white">
                Ingia Kwenye Akaunti Yako
              </h3>
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                Kama mgeni unaweza kutazama video, kubadili kasi (1x), ubora, manukuu (CC), skrini nzima na kushiriki. Ili uweze <strong>{authModalAction}</strong>, tafadhali ingia au jisajili.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  if (onNavigate) onNavigate('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-extrabold shadow-lg shadow-[#FF3040]/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingia Kwenye Akaunti</span>
              </button>

              <button
                onClick={() => {
                  setShowAuthModal(false);
                  if (onNavigate) onNavigate('register');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#232A39] hover:bg-[#2E3748] text-white border border-[#262E3E] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4 text-[#16C784]" />
                <span>Jisajili Bure</span>
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-1.5 text-xs text-[#A7B0C0] hover:text-white cursor-pointer"
              >
                Endelea Kutazama kama Mgeni
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ZAWADI (GIFT MODAL) */}
      <GiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        videoId={video.id}
        channelId={video.channelId}
        channelName={video.channelName}
        onOpenWallet={onOpenWallet}
      />

      {/* MEMBERSHIP MODAL */}
      <MembershipModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        channelId={video.channelId}
        channelName={video.channelName}
      />

      {/* REPORT MODAL */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="video"
        targetId={video.id}
        targetTitle={video.title}
      />

      {/* 3. PAKUA (VIDEO DOWNLOAD MODAL) */}
      <VideoDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        video={video}
        onGoToLibrary={() => {
          if (onMinimize) onMinimize();
        }}
      />

    </div>
  );
};
