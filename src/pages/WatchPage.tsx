import React, { useState, useMemo, useEffect } from 'react';
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
  Flag, 
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
  CornerDownRight,
  AlertCircle,
  Sparkles
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
    recordView,
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

  // Live video from context to keep viewsCount and likesCount reactive in real time
  const liveVideo = useMemo(() => {
    return (
      (videos && videos.find(v => Boolean(v && v.id === video?.id))) ||
      (shorts && shorts.find(s => Boolean(s && s.id === video?.id))) ||
      video
    );
  }, [videos, shorts, video]);


  // UI state
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [isCommentFocused, setIsCommentFocused] = useState<boolean>(false);
  const [commentSort, setCommentSort] = useState<'top' | 'newest'>('top');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [showCommentsMobile, setShowCommentsMobile] = useState<boolean>(false);

  // Modals state
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [showMembershipModal, setShowMembershipModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showAiSummaryModal, setShowAiSummaryModal] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState<boolean>(false);

  // Next video calculation for autoplay
  const nextVideo = useMemo(() => {
    return (videos && videos.find(v => Boolean(v && v.id !== liveVideo?.id))) || null;
  }, [videos, liveVideo?.id]);

  const handleNextVideo = () => {
    if (nextVideo) {
      onSelectVideo(nextVideo);
    }
  };

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
    Boolean(liveVideo?.channelId && c?.id === liveVideo.channelId) || 
    Boolean(liveVideo?.channelName && c?.name && c.name.toLowerCase() === liveVideo.channelName.toLowerCase())
  );
  const realSubscriberCount = creatorChannel?.subscriberCount ?? 1;

  const isDownloadedAlready = liveVideo?.id ? isDownloaded(liveVideo.id) : false;
  const isSubscribed = Boolean(liveVideo?.channelId && userSubscriptions.includes(liveVideo.channelId));
  const isLiked = Boolean(liveVideo?.id && likedVideoIds.includes(liveVideo.id));
  const isDisliked = Boolean(liveVideo?.id && dislikedVideoIds.includes(liveVideo.id));
  const rawVideoComments = (liveVideo?.id && comments[liveVideo.id]) || [];

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
  const otherVideos = (videos || []).filter(v => Boolean(v && video && v.id && v.id !== video.id && v.videoUrl && v.title));
  const fallbackShortsAsVideos: VideoItem[] = (shorts || [])
    .filter(s => Boolean(s && video && s.id && s.id !== video.id && s.videoUrl && s.title))
    .map(s => ({
      id: s.id,
      title: s.title,
      description: s.title,
      videoUrl: s.videoUrl,
      thumbnailUrl: s.thumbnailUrl,
      channelId: s.channelId,
      channelName: s.channelName || 'Tazama Creator',
      channelAvatar: s.channelAvatar,
      durationSeconds: s.durationSeconds || 45,
      viewsCount: s.viewsCount || 0,
      likesCount: s.likesCount || 0,
      commentsCount: s.commentsCount || 0,
      category: s.category || 'Vichekesho',
      tags: s.tags || ['shorts'],
      visibility: 'public' as const,
      processingStatus: 'ready' as const,
      createdAt: s.createdAt || new Date().toISOString(),
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
    <div className="w-full max-w-[1720px] mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-4 select-none">
      
      {/* 2-Column Responsive Layout (YouTube-Style: Left Player & Discussion, Right Suggested Feed) */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
        
        {/* LEFT PRIMARY COLUMN: Player, Title, Creator/Action Row, Description, Comments */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* Mobile Top Navigation Bar */}
          <div className="flex items-center justify-between py-1.5 px-3 sm:hidden bg-white/95 dark:bg-[#10131B]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#262E3E]/70 sticky top-0 z-30 mb-0">
            <button
              onClick={handleMinimize}
              className="min-h-[40px] py-1 px-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#191E29] text-slate-900 dark:text-white active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
              title="Punguza video kwenye Mini-Player"
            >
              <ChevronDown className="w-5 h-5 text-[#FF3040]" />
              <span className="text-xs font-bold text-slate-700 dark:text-[#A7B0C0]">Rudi</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 min-w-0 max-w-[200px] text-center px-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {video.channelName}
              </span>
              {video.isChannelVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowReportModal(true)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-[#191E29] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors cursor-pointer"
                title="Ripoti Video"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Adaptive Video Player: edge-to-edge flush on mobile, rounded on sm+ */}
          <div className="w-full rounded-none sm:rounded-2xl overflow-hidden bg-[#07090E] sm:shadow-2xl relative">
            {liveVideo && liveVideo.videoUrl ? (
              <VideoPlayer 
                video={liveVideo} 
                autoPlay={true} 
                onMinimize={handleMinimize}
                onNextVideo={handleNextVideo}
              />
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#141824]">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Video Haipatikani</h4>
                <p className="text-xs text-[#A7B0C0] max-w-sm">
                  Video hii haina faili halali la kucheza au bado inachakatwa.
                </p>
              </div>
            )}
          </div>

          {/* Seamless Video Info Panel (Flush below player on mobile with zero corner notches; rounded card on sm+) */}
          <div className="relative mt-0 sm:mt-4 rounded-none sm:rounded-3xl bg-white dark:bg-[#0F131C] border-b sm:border border-slate-200/90 dark:border-white/10 px-3.5 sm:px-6 pt-3.5 sm:pt-5 pb-5 sm:pb-6 shadow-none sm:shadow-xl dark:sm:shadow-2xl z-10 transition-colors">
            {/* Data Saver Mode Notice */}
            {isDataSaver && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  ⚡ Hali ya Kubana Bando (Data Saver) Imewashwa: Ubora wa 360p
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">MBs Zinaokolewa</span>
              </div>
            )}

            {/* 1. Video Title: bold & prominent typography */}
            <h1 className="mt-1 sm:mt-2 text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-2">
              {liveVideo.title}
            </h1>

            {/* 2. Metadata Line: @channel · likes · views · time · #category more */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5 text-xs text-slate-600 dark:text-[#A7B0C0]">
              <span 
                onClick={() => liveVideo?.channelId && onSelectChannel(liveVideo.channelId)}
                className="font-semibold text-slate-900 hover:text-black dark:text-white/95 dark:hover:text-white cursor-pointer"
              >
                @{creatorChannel?.handle ? (creatorChannel.handle.startsWith('@') ? creatorChannel.handle.slice(1) : creatorChannel.handle) : (liveVideo?.channelName ? liveVideo.channelName.toLowerCase().replace(/\s+/g, '') : 'channel')}
              </span>
              <span>•</span>
              <span>{formatViews(liveVideo.likesCount, language)} likes</span>
              <span>•</span>
              <span className="text-slate-900 dark:text-white font-semibold">{formatViews(liveVideo.viewsCount, language)} views</span>
              <span>•</span>
              <span>{formatRelativeTime(liveVideo.createdAt, language)}</span>
              {liveVideo.category && (
                <>
                  <span>•</span>
                  <span className="text-slate-700 dark:text-white/80">#{liveVideo.category}</span>
                </>
              )}
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)} 
                className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer ml-0.5"
              >
                {isDescExpanded ? 'less' : 'more'}
              </button>
            </div>

            {/* Expandable Description Box (when user clicks more) */}
            {isDescExpanded && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#191E2A] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-[#D1D7E0] animate-in fade-in space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 dark:text-[#A7B0C0]">
                  <span>Maelezo ya Video (Description)</span>
                  <button 
                    onClick={() => setIsDescExpanded(false)} 
                    className="text-[#FF3040] hover:underline cursor-pointer"
                  >
                    Onyesha kidogo
                  </button>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-slate-800 dark:text-[#E2E8F0]">
                  {liveVideo.description || 'Hakuna maelezo ya ziada kuhusu video hii.'}
                </p>
                {liveVideo.tags && liveVideo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200 dark:border-white/5">
                    {liveVideo.tags.map((tag, i) => (
                      <span key={i} className="text-xs text-[#FF3040] hover:underline font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. SINGLE-ROW ACTION & CHANNEL BAR */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x flex-nowrap -mx-3 px-3 sm:mx-0 sm:px-0 py-1">
              {/* Creator Avatar */}
              <div 
                onClick={() => onSelectChannel(liveVideo.channelId)}
                className="shrink-0 cursor-pointer group"
                title={liveVideo.channelName}
              >
                <img
                  src={liveVideo.channelAvatar || creatorChannel?.avatarUrl}
                  alt={liveVideo.channelName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createAvatarSvgDataUri(liveVideo.channelName);
                  }}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10 group-hover:ring-[#FF3040] transition-all bg-slate-100 dark:bg-[#141824]"
                />
              </div>

              {/* Channel Name (on tablet / desktop) */}
              <div 
                onClick={() => onSelectChannel(liveVideo.channelId)}
                className="hidden md:flex flex-col min-w-0 pr-1 cursor-pointer group shrink-0"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#FF3040] transition-colors">
                    {liveVideo.channelName}
                  </span>
                  {(liveVideo.isChannelVerified || creatorChannel?.isVerified) && (
                    <CheckCircle2 className="w-3 h-3 text-slate-500 dark:text-[#A7B0C0] shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-slate-600 dark:text-[#A7B0C0]">
                  {formatViews(realSubscriberCount, language)} {language === 'sw' ? 'wafuasi' : 'subs'}
                </span>
              </div>

              {/* Subscribe Button */}
              {isSubscribed ? (
                <div className="flex items-center rounded-full bg-slate-100 border border-slate-200 dark:bg-white/10 dark:border-white/15 shrink-0">
                  <button
                    onClick={handleSubscribeClick}
                    className="px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    title="Umesubscribe kwenye chaneli hii"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784]" />
                    <span>Unafuatilia</span>
                  </button>
                  <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-white/20" />
                  <button
                    onClick={handleBellClick}
                    className="px-2 py-1.5 text-slate-700 hover:text-slate-900 dark:text-white/90 dark:hover:text-white cursor-pointer relative shrink-0"
                    title="Aina ya taarifa za kengele"
                  >
                    {bellMode === 'all' ? (
                      <BellRing className="w-3.5 h-3.5 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" />
                    ) : bellMode === 'personalized' ? (
                      <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 text-slate-500 dark:text-[#A7B0C0]" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSubscribeClick}
                  className="shrink-0 whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Subscribe
                </button>
              )}

              {/* 3-Tier Bell Dropdown Popover */}
              {showBellDropdown && (
                <div className="absolute top-12 left-10 sm:left-auto w-64 bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black text-slate-500 dark:text-[#A7B0C0] border-b border-slate-200 dark:border-[#262E3E] uppercase tracking-wider">
                    Aina ya Taarifa (Notifications)
                  </div>

                  <button
                    onClick={() => handleSelectBellMode('all')}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors ${
                      bellMode === 'all' ? 'bg-amber-50 text-amber-700 dark:bg-[#232A39] dark:text-amber-400 font-bold' : 'hover:bg-slate-50 text-slate-900 dark:hover:bg-[#232A39]/60 dark:text-white'
                    }`}
                  >
                    <BellRing className="w-4 h-4 mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
                    <div>
                      <div className="text-xs font-bold">Zote (All)</div>
                      <div className="text-[10px] text-slate-500 dark:text-[#A7B0C0]">Pokea taarifa zote za video mpya na Live</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectBellMode('personalized')}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors ${
                      bellMode === 'personalized' ? 'bg-blue-50 text-blue-700 dark:bg-[#232A39] dark:text-blue-400 font-bold' : 'hover:bg-slate-50 text-slate-900 dark:hover:bg-[#232A39]/60 dark:text-white'
                    }`}
                  >
                    <Bell className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="text-xs font-bold">Zilizochaguliwa (Personalized)</div>
                      <div className="text-[10px] text-slate-500 dark:text-[#A7B0C0]">Taarifa maalum kulingana na unachopenda</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectBellMode('none')}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors ${
                      bellMode === 'none' ? 'bg-red-50 text-[#FF3040] dark:bg-[#232A39] font-bold' : 'hover:bg-slate-50 text-slate-900 dark:hover:bg-[#232A39]/60 dark:text-white'
                    }`}
                  >
                    <BellOff className="w-4 h-4 mt-0.5 shrink-0 text-[#FF3040]" />
                    <div>
                      <div className="text-xs font-bold">Hakuna (None)</div>
                      <div className="text-[10px] text-slate-500 dark:text-[#A7B0C0]">Usipokee taarifa kutoka chaneli hii</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Join Club button on desktop */}
              <button
                onClick={handleJoinClubClick}
                className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-[#1F2533] dark:hover:bg-[#262E3E] dark:text-white dark:border-white/10 text-xs font-semibold transition-all cursor-pointer shrink-0"
              >
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Jiunge</span>
              </button>

              {/* 1. Like & Dislike Combined Pill */}
              <div className="flex items-center shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-[#1F2533] dark:hover:bg-[#262E3E] dark:border-white/10 overflow-hidden shadow-sm">
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition-colors cursor-pointer ${
                    isLiked ? 'text-[#FF3040]' : 'text-slate-900 dark:text-white'
                  }`}
                  title="Penda video hii"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-[#FF3040]' : ''}`} />
                  <span>{formatViews(liveVideo.likesCount, language)}</span>
                </button>
                <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-white/20" />
                <button
                  onClick={handleDislikeClick}
                  className={`px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition-colors cursor-pointer ${
                    isDisliked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white'
                  }`}
                  title="Sipendi video hii"
                >
                  <ThumbsDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDisliked ? 'fill-amber-600 dark:fill-amber-400' : ''}`} />
                </button>
              </div>

              {/* 2. Shiriki (Share) Pill */}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-900 dark:bg-[#1F2533] dark:hover:bg-[#262E3E] dark:border-white/10 dark:text-white transition-all active:scale-95 cursor-pointer"
                title="Shiriki video"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Shiriki</span>
              </button>

              {/* 2.5. Tazama AI */}
              <button
                onClick={() => setShowAiSummaryModal(true)}
                className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200/80 hover:to-pink-200/80 border border-purple-300 text-purple-900 dark:from-purple-600/30 dark:to-pink-600/30 dark:hover:from-purple-600/40 dark:hover:to-pink-600/40 dark:border-purple-500/40 text-xs font-bold dark:text-white transition-all active:scale-95 cursor-pointer shadow-sm shadow-purple-500/10"
                title="Muhtasari wa Video kwa AI (Tazama AI)"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700 dark:text-amber-300" />
                <span className="bg-gradient-to-r from-purple-700 to-pink-600 dark:from-amber-300 dark:to-pink-200 bg-clip-text text-transparent font-extrabold">Tazama AI</span>
              </button>

              {/* 3. Remix / Zawadi (Gift) */}
              <button
                onClick={handleGiftClick}
                className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-emerald-300 text-emerald-700 dark:bg-[#1F2533] dark:hover:bg-[#262E3E] dark:border-[#16C784]/30 text-xs font-bold dark:text-[#16C784] transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Tuma zawadi ya kidijitali"
              >
                <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Zawadi</span>
              </button>

              {/* 4. Pakua (Download) Pill */}
              <button
                onClick={handleDownloadClick}
                className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  isDownloadedAlready 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-[#16C784]/20 dark:border-[#16C784]/50 dark:text-[#16C784]' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900 dark:bg-[#1F2533] dark:hover:bg-[#262E3E] dark:border-white/10 dark:text-white'
                }`}
                title="Pakua video"
              >
                {isDownloadedAlready ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-[#16C784]" />
                ) : (
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span>{isDownloadedAlready ? 'Imepakuliwa' : 'Pakua'}</span>
              </button>

              {/* 5. Orodha (Save) Pill */}
              <button
                onClick={handleSaveClick}
                className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-900 dark:bg-[#1F2533] dark:hover:bg-[#262E3E] dark:border-white/10 dark:text-white transition-all active:scale-95 cursor-pointer"
                title="Hifadhi kwenye playlist"
              >
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Orodha</span>
              </button>

              {/* 6. More Actions (⋯) */}
              <button
                onClick={() => setShowReportModal(true)}
                className="shrink-0 p-2 sm:p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 dark:bg-[#1F2533] dark:hover:bg-[#262E3E] dark:border-white/10 dark:text-white transition-all active:scale-95 cursor-pointer"
                title="Mengineyo"
              >
                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Bell Toast Notification */}
            {bellToast && (
              <div className="mt-2.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-[#191E29] border border-slate-800 dark:border-[#262E3E] text-xs text-center shadow-lg animate-in fade-in duration-200">
                {bellToast}
              </div>
            )}

            {/* 4. COMMENTS PREVIEW CARD */}
            <div 
              onClick={() => setShowCommentsMobile(!showCommentsMobile)}
              className="mt-3 p-3 sm:hidden rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 dark:bg-[#171C28] dark:hover:bg-[#1E2434] dark:border-white/10 cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Comments</span>
                  <span className="text-xs text-slate-600 dark:text-[#A7B0C0] font-bold tabular-nums">{videoComments.length}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-[#A7B0C0] transition-transform duration-200 ${showCommentsMobile ? 'rotate-180' : ''}`} />
              </div>

              {/* Top Comment Snippet Preview */}
              <div className="flex items-start gap-2.5">
                <img
                  src={videoComments[0]?.userAvatar || profile?.photoURL || createAvatarSvgDataUri(videoComments[0]?.userName || 'Mtumiaji')}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createAvatarSvgDataUri('Mtumiaji');
                  }}
                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-white/10 bg-slate-200 dark:bg-[#141824] mt-0.5"
                />
                <p className="text-xs text-slate-700 dark:text-[#D1D7E0] line-clamp-2 leading-relaxed">
                  {videoComments[0]?.text || 'Kuwa wa kwanza kutoa maoni... Bofya hapa kuandika maoni yako.'}
                </p>
              </div>
            </div>

          {/* COMMENTS SECTION */}
          <div className={`${showCommentsMobile ? 'block' : 'hidden sm:block'} mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 dark:border-white/10 animate-in fade-in duration-200`}>
            
            {/* Comments Header & Sort By */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {videoComments.length} Maoni
                </h3>

                {/* Sort By Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-black hover:bg-slate-100 dark:text-white/90 dark:hover:text-white cursor-pointer px-2 py-1 rounded-lg dark:hover:bg-white/5 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Panga kwa: {commentSort === 'top' ? 'Maarufu zaidi' : 'Mpya zaidi'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500 dark:text-[#A7B0C0]" />
                  </button>

                  {showSortDropdown && (
                    <div className="absolute top-8 left-0 w-44 bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-xl shadow-2xl py-1 z-40 text-xs">
                      <button
                        onClick={() => { setCommentSort('top'); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-[#232A39] transition-colors ${
                          commentSort === 'top' ? 'text-[#FF3040] font-bold' : 'text-slate-800 dark:text-white'
                        }`}
                      >
                        Maarufu zaidi (Top)
                      </button>
                      <button
                        onClick={() => { setCommentSort('newest'); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-[#232A39] transition-colors ${
                          commentSort === 'newest' ? 'text-[#FF3040] font-bold' : 'text-slate-800 dark:text-white'
                        }`}
                      >
                        Mpya zaidi (Newest)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Close Comments Button */}
              <button
                onClick={() => setShowCommentsMobile(false)}
                className="sm:hidden text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 dark:text-[#A7B0C0] dark:hover:text-white px-2.5 py-1 rounded-lg dark:bg-white/5 cursor-pointer"
              >
                Funga ✕
              </button>
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
              <img
                src={profile?.photoURL || createAvatarSvgDataUri(profile?.displayName || 'User')}
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).src = createAvatarSvgDataUri(profile?.displayName || 'User');
                }}
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-white/10 bg-slate-100 dark:bg-[#141824]"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onFocus={() => setIsCommentFocused(true)}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={profile ? 'Andika maoni yako hapa...' : 'Ingia kwenye akaunti ili uweze kutoa maoni...'}
                  className="w-full bg-transparent border-b border-slate-300 dark:border-white/20 pb-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0]/70 focus:outline-none focus:border-[#FF3040] transition-colors"
                />

                {/* Comment Action Buttons */}
                {(isCommentFocused || commentText.trim()) && (
                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCommentText('');
                        setIsCommentFocused(false);
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#A7B0C0] dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Ghairi
                    </button>
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        commentText.trim()
                          ? 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-md'
                          : 'bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-white/40 cursor-not-allowed'
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
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-white/10 bg-slate-100 dark:bg-[#141824]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{c.userName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-[#A7B0C0]">
                          {formatRelativeTime(c.createdAt, language)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-[#D1D7E0] leading-relaxed text-xs sm:text-sm">
                        {c.text}
                      </p>

                      {/* Comment Interactions */}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-[#A7B0C0]">
                        <button className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{c.likesCount || 0}</span>
                        </button>
                        <button className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button className="font-semibold hover:text-slate-900 dark:hover:text-white cursor-pointer">
                          Jibu
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 dark:text-[#A7B0C0]">
                  Hakuna maoni yaliyowekwa bado. Kuwa wa kwanza kutoa maoni!
                </div>
              )}
            </div>

            </div>

          </div>

        </div>

        {/* RIGHT SECONDARY COLUMN: Filter Chips & Suggested Videos List */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 space-y-4 px-3 sm:px-0">
          
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
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-black' 
                      : 'bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* List of Recommended Video Cards */}
          <div className="space-y-4 sm:space-y-3">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 group cursor-pointer p-1.5 sm:p-1 rounded-2xl sm:rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Video Thumbnail Preview */}
                  <div className="w-full sm:w-40 md:w-44 shrink-0 px-0.5 sm:px-0">
                    <VideoThumbnailPreview
                      video={item}
                      aspectRatioClass="aspect-video"
                      className="rounded-2xl sm:rounded-xl"
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
                    className="min-w-0 flex-1 flex items-start gap-2.5 sm:gap-0 sm:flex-col justify-start py-0.5 cursor-pointer"
                  >
                    {/* Mobile Avatar */}
                    <img
                      src={item.channelAvatar || createAvatarSvgDataUri(item.channelName)}
                      alt={item.channelName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createAvatarSvgDataUri(item.channelName);
                      }}
                      className="w-9 h-9 rounded-full object-cover shrink-0 sm:hidden ring-1 ring-slate-200 dark:ring-white/10 bg-slate-100 dark:bg-[#141824] mt-0.5"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-xs md:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#FF3040] transition-colors">
                        {item.title}
                      </h4>
                      
                      {/* Mobile stats row */}
                      <div className="flex sm:hidden items-center flex-wrap gap-1 mt-1 text-xs text-slate-600 dark:text-[#A7B0C0]">
                        <span className="truncate text-slate-700 dark:text-white/80 font-medium">{item.channelName}</span>
                        {item.isChannelVerified && (
                          <CheckCircle2 className="w-3 h-3 text-slate-500 dark:text-[#A7B0C0] shrink-0" />
                        )}
                        <span>•</span>
                        <span>{formatViews(item.viewsCount, language)} views</span>
                        <span>•</span>
                        <span>{formatRelativeTime(item.createdAt, language)}</span>
                      </div>

                      {/* Desktop stats rows */}
                      <div className="hidden sm:flex items-center gap-1 mt-1 text-[11px] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors">
                        <span className="truncate">{item.channelName}</span>
                        {item.isChannelVerified && (
                          <CheckCircle2 className="w-3 h-3 text-slate-500 dark:text-[#A7B0C0] shrink-0" />
                        )}
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#A7B0C0] mt-0.5">
                        <span>{formatViews(item.viewsCount, language)} views</span>
                        <span>•</span>
                        <span>{formatRelativeTime(item.createdAt, language)}</span>
                      </div>
                    </div>

                    {/* 3-dots button on mobile */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReportModal(true);
                      }}
                      className="sm:hidden p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Mengineyo"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#181C26] border border-slate-200 dark:border-[#262E3E] text-center text-xs text-slate-600 dark:text-[#A7B0C0]">
                Hakuna video zilizopatikana katika kundi hili.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 2. SHIRIKI (SHARE MODAL) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262E3E]">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#FF3040]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shiriki Video Hii</h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
              Tuma video ya <strong className="text-slate-900 dark:text-white">{video.title}</strong> kwa marafiki kupitia:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-emerald-700 dark:text-[#25D366] text-xs font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(video.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/30 text-[#0077b5] dark:text-[#0088cc] text-xs font-bold transition-all"
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
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:border-amber-500/30 dark:text-amber-300 text-xs font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                <span>SMS / Ujumbe</span>
              </a>
            </div>

            {/* Copy Link Direct Bar */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#262E3E]">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E]">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs text-slate-600 dark:text-[#A7B0C0] font-mono flex-1 outline-none truncate"
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

      {/* 4.5. TAZAMA AI SUMMARY & INSIGHTS MODAL */}
      {showAiSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#181E29] border border-purple-200 dark:border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Uchambuzi wa Tazama AI
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0]">
                    Muhtasari wa papo hapo na maarifa ya video hii
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiSummaryModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white p-1 cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1 text-xs">
              {/* Summary card */}
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20 space-y-2">
                <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold uppercase tracking-wider text-[10px]">
                  <span>💡 Muhtasari Mkuu</span>
                </div>
                <p className="text-slate-800 dark:text-[#E2E8F0] leading-relaxed">
                  {liveVideo.description || `Video hii ya "${liveVideo.title}" inamulika maudhui ya kipekee ya ${liveVideo.category || 'burudani'}, ikieleza kwa kina matukio muhimu, mafunzo na burudani safi kwa watazamaji wote nchini Tanzania na Afrika Mashariki.`}
                </p>
              </div>

              {/* Key points */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121622] border border-slate-200 dark:border-white/10 space-y-2">
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  🔥 Mambo Muhimu Katika Video Hii
                </div>
                <ul className="space-y-1.5 text-slate-700 dark:text-[#D1D7E0] list-disc list-inside">
                  <li>Uhuishaji wa hali ya juu na ubora wa HD 1080p uliotengenezwa kwa umakini.</li>
                  <li>Uwasilishaji wa hisia halisi za simulizi inayomshika mtazamaji mwanzo hadi mwisho.</li>
                  <li>Lugha na manukuu ya Kiswahili yanayopatikana kwa kubofya kitufe cha CC.</li>
                  <li>Inaoana na hali ya kubana bando (Data Saver) kwa kutumia MBs chache.</li>
                </ul>
              </div>

              {/* Tags & Channel */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-[#10131B] border border-slate-200 dark:border-white/5 text-[11px]">
                <span className="text-slate-600 dark:text-[#A7B0C0]">Chaneli:</span>
                <span className="font-bold text-slate-900 dark:text-white">@{creatorChannel?.handle || liveVideo.channelName}</span>
              </div>
            </div>

            <button
              onClick={() => setShowAiSummaryModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Nimeelewa (Funga)
            </button>
          </div>
        </div>
      )}

      {/* 5. ORODHA (SAVE TO PLAYLIST MODAL) */}
      {showAddToPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262E3E]">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hifadhi kwenye Orodha (Playlist)</h3>
              </div>
              <button 
                onClick={() => setShowAddToPlaylistModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white p-1 cursor-pointer"
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
                        ? 'bg-emerald-50 border-emerald-300 text-slate-900 dark:bg-[#16C784]/10 dark:border-[#16C784]/40 dark:text-white' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 dark:bg-[#10131B] dark:hover:bg-[#232A39] dark:border-[#262E3E] dark:text-white'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{pl.title}</h4>
                      <p className="text-[10px] text-slate-600 dark:text-[#A7B0C0]">{pl.videoIds.length} video</p>
                    </div>
                    {isInList ? (
                      <span className="text-[10px] bg-[#16C784] text-black font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Imehifadhiwa
                      </span>
                    ) : (
                      <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">+ Weka</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Create New Playlist Inline */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#262E3E]">
              {isCreatingPlaylist ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    placeholder="Jina la orodha mpya..."
                    className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsCreatingPlaylist(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-600 dark:text-[#A7B0C0]"
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
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                    >
                      Tengeneza & Hifadhi
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingPlaylist(true)}
                  className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:text-purple-300 dark:border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#FF3040]/15 border border-[#FF3040]/30 flex items-center justify-center mx-auto text-[#FF3040]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Ingia Kwenye Akaunti Yako
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                Kama mgeni unaweza kutazama video, kubadili kasi (1x), ubora, manukuu (CC), skrini nzima na kushiriki. Ili uweze <strong className="text-slate-900 dark:text-white">{authModalAction}</strong>, tafadhali ingia au jisajili.
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
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:text-white dark:border-[#262E3E] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
                <span>Jisajili Bure</span>
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white cursor-pointer"
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
