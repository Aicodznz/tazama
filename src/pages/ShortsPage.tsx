import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Gift,
  Play,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Search,
  CheckCircle2,
  Film,
  Maximize,
  Minimize,
  MoreVertical,
  X,
  Send,
  Tv
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatRelativeTime } from '../lib/i18n';
import { GiftModal } from '../components/gifts/GiftModal';
import { parseVideoSource } from '../lib/videoUtils';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';

interface ShortsPageProps {
  onSelectChannel: (channelId: string) => void;
  onOpenWallet: () => void;
  onNavigate?: (page: string) => void;
}

type ShortsFeedTab = 'explore' | 'following' | 'forYou';

export const ShortsPage: React.FC<ShortsPageProps> = ({
  onSelectChannel,
  onOpenWallet,
  onNavigate
}) => {
  const {
    shorts,
    channels,
    comments,
    addComment,
    playlists,
    addToPlaylist,
    removeFromPlaylist,
    likedVideoIds,
    toggleLike,
    userSubscriptions,
    toggleSubscribe,
    addToWatchHistory,
    isDataSaver
  } = useVideo();
  const { language, profile } = useAuth();

  const [feedTab, setFeedTab] = useState<ShortsFeedTab>('forYou');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLockRef = useRef<number>(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  // Filtered feed based on Explore / Following / For You tab
  const filteredShorts = useMemo(() => {
    const list = (shorts || []).filter(Boolean);
    if (feedTab === 'following') {
      return list.filter((s) => userSubscriptions.includes(s.channelId));
    }
    if (feedTab === 'explore') {
      return [...list].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }
    return list;
  }, [shorts, feedTab, userSubscriptions]);

  const safeIndex = filteredShorts.length > 0 ? Math.min(currentIndex, filteredShorts.length - 1) : 0;
  const currentShort = filteredShorts[safeIndex];

  // Reset per-short UI state when active Short changes & record in watch history
  useEffect(() => {
    setProgress(0);
    setIsCaptionExpanded(false);
    setShowMoreMenu(false);
    setShowCommentsSheet(false);
    setIsPlaying(true);
    if (currentShort?.id) {
      addToWatchHistory(currentShort);
    }
  }, [currentShort?.id]);

  // Safe autoplay helper with instant muted fallback if browser blocks unmuted autoplay
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !currentShort) return;
    vid.currentTime = 0;
    vid.muted = isMuted;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Browser blocked unmuted autoplay; seamlessly fall back to muted playback
          vid.muted = true;
          setIsMuted(true);
          vid.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        });
    }
  }, [currentShort?.id]);

  // Keep native audio state synced
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleNext = () => {
    if (safeIndex < filteredShorts.length - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  // Keyboard navigation on desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showCommentsSheet || showGiftModal) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [safeIndex, filteredShorts.length, showCommentsSheet, showGiftModal]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (showCommentsSheet) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (showCommentsSheet || touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    if (deltaY > 55) {
      handleNext();
    } else if (deltaY < -55) {
      handlePrev();
    }
    touchStartY.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (showCommentsSheet || showGiftModal) return;
    const now = Date.now();
    if (now - wheelLockRef.current < 450) return;
    if (Math.abs(e.deltaY) > 45) {
      wheelLockRef.current = now;
      if (e.deltaY > 0) handleNext();
      else handlePrev();
    }
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  // Single tap toggles play/pause; double tap triggers Like + heart animation
  const handleCanvasTap = () => {
    if (showMoreMenu) {
      setShowMoreMenu(false);
      return;
    }
    const now = Date.now();
    if (now - lastTapTime.current < 260) {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      if (currentShort && !likedVideoIds.includes(currentShort.id)) {
        toggleLike(currentShort.id);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 750);
    } else {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => {
        togglePlay();
      }, 220);
    }
    lastTapTime.current = now;
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      try {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        } else if ((videoRef.current as any)?.webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
        }
      } catch {}
      setIsFullscreen(true);
    } else {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
      setIsFullscreen(false);
    }
    setShowMoreMenu(false);
  };

  useEffect(() => {
    const handleNativeFullscreen = () => {
      const isNative = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNative && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handleNativeFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleNativeFullscreen);
  }, [isFullscreen]);

  // Empty platform shorts state
  if (!shorts || shorts.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-8 text-center space-y-4 shadow-sm dark:shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-[#FF3040]/10 border border-[#FF3040]/30 flex items-center justify-center mx-auto text-[#FF3040]">
            <Film className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hakuna Shorts kwa Sasa</h2>
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
              Bado hakuna video fupi za wima (9:16) zilizopakiwa. Kuwa mtayarishaji wa kwanza kupakia Short kwenye Tazama!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const creatorChannel = currentShort
    ? channels.find(
        (c) =>
          c.id === currentShort.channelId ||
          c.name?.toLowerCase() === currentShort.channelName?.toLowerCase()
      )
    : undefined;

  const creatorHandle =
    creatorChannel?.handle ||
    (currentShort
      ? `@${(currentShort.channelName || 'creator').toLowerCase().replace(/\s+/g, '')}`
      : '@tazama');
  const creatorAvatar =
    currentShort?.channelAvatar ||
    creatorChannel?.avatarUrl ||
    createAvatarSvgDataUri(currentShort?.channelName || 'Tazama');
  const subscriberCount = creatorChannel?.subscriberCount ?? 0;
  const isVerified = currentShort?.isChannelVerified ?? creatorChannel?.isVerified;

  const isLiked = currentShort ? likedVideoIds.includes(currentShort.id) : false;
  const isSubscribed = currentShort ? userSubscriptions.includes(currentShort.channelId) : false;

  const watchLaterPlaylist = playlists.find((p) => p.id === 'pl-watch-later') || playlists[0];
  const isSaved = Boolean(
    watchLaterPlaylist && currentShort && watchLaterPlaylist.videoIds.includes(currentShort.id)
  );

  const shortComments = currentShort ? comments[currentShort.id] || [] : [];
  const totalCommentsCount = currentShort
    ? Math.max(currentShort.commentsCount || 0, shortComments.length)
    : 0;

  const handleToggleSave = () => {
    if (!currentShort || !watchLaterPlaylist) return;
    if (isSaved) {
      removeFromPlaylist(watchLaterPlaylist.id, currentShort.id);
      showToast(language === 'en' ? 'Removed from Saved' : 'Imeondolewa kwenye Hifadhi');
    } else {
      addToPlaylist(watchLaterPlaylist.id, currentShort.id);
      showToast(language === 'en' ? 'Saved to Watch Later' : 'Imehifadhiwa Tazama Baadaye');
    }
  };

  const handleShare = async () => {
    if (!currentShort) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentShort.title,
          url: shareUrl
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(language === 'en' ? 'Link copied!' : 'Linki imenakiliwa!');
    } catch {}
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShort || !commentText.trim()) return;
    addComment(currentShort.id, commentText.trim());
    setCommentText('');
  };

  const feedTabs: { id: ShortsFeedTab; label: string }[] = [
    { id: 'explore', label: language === 'en' ? 'Explore' : 'Gundua' },
    { id: 'following', label: language === 'en' ? 'Following' : 'Unafuatilia' },
    { id: 'forYou', label: language === 'en' ? 'For You' : 'Kwako' }
  ];

  const captionSource = currentShort
    ? [currentShort.title, currentShort.description].filter(Boolean).join(' — ')
    : '';
  const hasLongCaption = captionSource.length > 52;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className={`flex justify-center items-center select-none w-full transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen bg-black'
          : 'h-[calc(100dvh-62px)] sm:h-[calc(100dvh-146px)] md:h-[calc(100dvh-106px)] md:max-h-[820px] gap-4'
      }`}
    >
      {/* Central Phone Canvas: Edge-to-edge on mobile, sleek 9:16 frame on desktop */}
      <div
        ref={containerRef}
        className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden transition-all ${
          isFullscreen
            ? 'w-screen h-screen rounded-none'
            : 'sm:w-[400px] md:w-[420px] rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 dark:border-[#262E3E]'
        }`}
      >
        {/* Top Floating Segmented Feed Tabs + Mobile Back + Mute/Search */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
          {/* Left: Back on mobile, reel counter on desktop */}
          <div className="flex items-center shrink-0 pointer-events-auto">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="sm:hidden w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                title={language === 'en' ? 'Back' : 'Rudi'}
                aria-label="Rudi Mwanzo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white tabular-nums">
              <Film className="w-3.5 h-3.5 text-[#FF3040]" />
              <span>{filteredShorts.length > 0 ? `${safeIndex + 1}/${filteredShorts.length}` : '0'}</span>
            </div>
          </div>

          {/* Center: Explore | Following | For You Segmented Tabs */}
          <div className="flex items-center gap-1 pointer-events-auto overflow-x-auto no-scrollbar">
            {feedTabs.map((tab) => {
              const isActive = feedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setFeedTab(tab.id);
                    setCurrentIndex(0);
                  }}
                  className={`min-h-[36px] px-3 py-1 rounded-full text-[11.5px] sm:text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 font-extrabold shadow-lg'
                      : 'bg-black/40 hover:bg-black/55 backdrop-blur-md border border-white/15 text-white/90 font-semibold'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right: Mute + Search */}
          <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              title={isMuted ? 'Washa sauti' : 'Zima sauti'}
              aria-label={isMuted ? 'Washa sauti' : 'Zima sauti'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#FF3040]" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('search')}
                className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                title={language === 'en' ? 'Search' : 'Tafuta'}
                aria-label="Tafuta"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white text-xs font-bold shadow-xl whitespace-nowrap animate-in fade-in duration-150">
            {toastMsg}
          </div>
        )}

        {/* Active Feed Content OR Following Empty State */}
        {!currentShort ? (
          <div className="relative z-10 max-w-xs mx-auto p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 text-center space-y-4 text-white">
            <Film className="w-10 h-10 text-[#FF3040] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold">
                {language === 'en' ? 'No Following Shorts Yet' : 'Hakuna Shorts Kutoka Unazofuatilia'}
              </h3>
              <p className="text-xs text-white/75 leading-relaxed">
                {language === 'en'
                  ? 'Follow creators to see their latest vertical videos here.'
                  : 'Fuatilia waumbaji ili kuona video zao mpya fupi kwenye orodha hii.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFeedTab('forYou');
                setCurrentIndex(0);
              }}
              className="px-4 py-2 rounded-full bg-white text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer active:scale-95 transition-transform"
            >
              {language === 'en' ? 'Browse For You' : 'Tazama Kwako (For You)'}
            </button>
          </div>
        ) : (
          <>
            {/* Ambient Blurred Backdrop Layer (softens letterbox/aspect edges cleanly) */}
            <img
              src={currentShort.thumbnailUrl || createThumbnailSvgDataUri(currentShort.title, currentShort.category)}
              alt=""
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-45 pointer-events-none"
            />

            {/* Video / Embed Media Layer */}
            {parseVideoSource(currentShort.videoUrl).sourceType === 'youtube' ? (
              <iframe
                src={`${parseVideoSource(currentShort.videoUrl).embedUrl}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${parseVideoSource(currentShort.videoUrl).videoId}&controls=0&playsinline=1`}
                title={currentShort.title}
                className="relative z-[1] w-full h-full border-0"
                allow="autoplay; encrypted-media"
              />
            ) : parseVideoSource(currentShort.videoUrl).sourceType === 'vimeo' ? (
              <iframe
                src={`${parseVideoSource(currentShort.videoUrl).embedUrl}?autoplay=1&loop=1&muted=${isMuted ? 1 : 0}`}
                title={currentShort.title}
                className="relative z-[1] w-full h-full border-0"
                allow="autoplay; encrypted-media"
              />
            ) : (
              <video
                ref={videoRef}
                key={currentShort.id}
                src={
                  parseVideoSource(currentShort.videoUrl).sourceType === 'direct'
                    ? parseVideoSource(currentShort.videoUrl).streamUrl || currentShort.videoUrl
                    : currentShort.videoUrl
                }
                poster={currentShort.thumbnailUrl}
                preload={isDataSaver ? 'metadata' : 'auto'}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onClick={handleCanvasTap}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                  const vid = videoRef.current;
                  if (vid && vid.duration && !isNaN(vid.duration)) {
                    setProgress((vid.currentTime / vid.duration) * 100);
                  }
                }}
                onError={() => {
                  setIsPlaying(false);
                }}
                className="relative z-[1] w-full h-full object-cover cursor-pointer"
              />
            )}

            {/* Measured Top & Bottom Contrast Gradient Scrims */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/75 via-black/25 to-transparent z-[2] pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-[2] pointer-events-none" />

            {/* Subtle Translucent Paused Indicator (Never harsh opaque red sticker over faces) */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Cheza Video"
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
              </button>
            )}

            {/* Double-Tap Heart Burst Animation */}
            {showHeartBurst && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <Heart className="w-20 h-20 text-[#FF3040] fill-[#FF3040] drop-shadow-2xl animate-ping" />
              </div>
            )}

            {/* Bottom-Left: Creator Handle, Follower Count, Follow CTA, Expandable Caption & Social Proof */}
            <div className="absolute bottom-6 sm:bottom-4 left-3.5 right-16 z-20 text-white space-y-2">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectChannel(currentShort.channelId)}
                  className="shrink-0 focus:outline-none cursor-pointer"
                  title={currentShort.channelName}
                >
                  <img
                    src={creatorAvatar}
                    alt={currentShort.channelName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createAvatarSvgDataUri(
                        currentShort.channelName
                      );
                    }}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40 bg-slate-800 shadow-md"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectChannel(currentShort.channelId)}
                  className="min-w-0 text-left focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-extrabold text-white truncate drop-shadow">
                      {creatorHandle}
                    </span>
                    {isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-white/80 font-medium tabular-nums truncate">
                    {formatViews(subscriberCount, language)}{' '}
                    {language === 'en' ? 'Followers' : 'Wafuatiliaji'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSubscribe(currentShort.channelId)}
                  className={`min-h-[34px] px-4 py-1 rounded-full text-xs font-extrabold transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer ${
                    isSubscribed
                      ? 'bg-white/20 backdrop-blur-md border border-white/25 text-white hover:bg-white/30'
                      : 'bg-white text-slate-950 hover:bg-white/90 shadow-lg'
                  }`}
                >
                  {isSubscribed
                    ? language === 'en'
                      ? 'Following'
                      : 'Unafuatilia'
                    : language === 'en'
                      ? 'Follow'
                      : 'Fuatilia'}
                </button>
              </div>

              {/* Caption with Expandable "... more" toggle */}
              {captionSource && (
                <div className="text-xs sm:text-[13px] leading-snug text-white/95 drop-shadow">
                  <p className={isCaptionExpanded ? '' : 'line-clamp-1'}>
                    {captionSource}
                  </p>
                  {hasLongCaption && (
                    <button
                      type="button"
                      onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                      className="text-[11px] font-bold text-white/75 hover:text-white mt-0.5 cursor-pointer"
                    >
                      {isCaptionExpanded
                        ? language === 'en'
                          ? 'less'
                          : 'kidogo'
                        : language === 'en'
                          ? '... more'
                          : '... zaidi'}
                    </button>
                  )}
                </div>
              )}

              {/* Unboxed Likes / Category Micro-Row (Zero-Pill discipline) */}
              <div className="flex items-center gap-2 text-[11px] text-white/85 pt-0.5">
                <div className="flex -space-x-1.5 shrink-0">
                  <span className="w-4 h-4 rounded-full bg-[#FF3040] ring-1 ring-black flex items-center justify-center text-[8px] font-bold">
                    <Heart className="w-2.5 h-2.5 fill-white text-white" />
                  </span>
                  <span className="w-4 h-4 rounded-full bg-slate-700 ring-1 ring-black flex items-center justify-center text-[8px] font-bold">
                    {(currentShort.channelName?.[0] || 'T').toUpperCase()}
                  </span>
                </div>
                <span className="truncate tabular-nums">
                  {currentShort.likesCount > 0
                    ? `${language === 'en' ? 'Liked by' : 'Imependwa na'} ${formatViews(
                        currentShort.likesCount,
                        language
                      )} ${language === 'en' ? 'others' : 'watazamaji'}`
                    : `${currentShort.channelName}`}
                  <span aria-hidden="true"> · </span>
                  <span className="text-white/75">#{currentShort.category || 'Shorts'}</span>
                </span>
              </div>
            </div>

            {/* Right-Edge Vertical Floating Action Rail (Ergonomic Thumb Zone) */}
            <div className="absolute right-2.5 bottom-6 sm:bottom-4 flex flex-col items-center gap-3 z-20 text-white">
              {/* 1. Like */}
              <button
                type="button"
                onClick={() => toggleLike(currentShort.id)}
                className="flex flex-col items-center gap-0.5 group cursor-pointer"
                aria-label="Penda Video"
              >
                <div
                  className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-transform group-active:scale-90 group-hover:scale-105 ${
                    isLiked
                      ? 'bg-[#FF3040]/25 border-[#FF3040]/60 text-[#FF3040]'
                      : 'bg-black/45 border-white/15 text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#FF3040] text-[#FF3040]' : ''}`} />
                </div>
                <span className="text-[11px] font-bold tabular-nums drop-shadow">
                  {formatViews(currentShort.likesCount, language)}
                </span>
              </button>

              {/* 2. Comments */}
              <button
                type="button"
                onClick={() => setShowCommentsSheet(true)}
                className="flex flex-col items-center gap-0.5 group cursor-pointer"
                aria-label="Maoni"
              >
                <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg transition-transform group-active:scale-90 group-hover:scale-105">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold tabular-nums drop-shadow">
                  {formatViews(totalCommentsCount, language)}
                </span>
              </button>

              {/* 3. Bookmark / Save */}
              <button
                type="button"
                onClick={handleToggleSave}
                className="flex flex-col items-center gap-0.5 group cursor-pointer"
                aria-label="Hifadhi Video"
              >
                <div
                  className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-transform group-active:scale-90 group-hover:scale-105 ${
                    isSaved
                      ? 'bg-amber-400/25 border-amber-400/60 text-amber-300'
                      : 'bg-black/45 border-white/15 text-white'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-300 text-amber-300' : ''}`} />
                </div>
                <span className="text-[10.5px] font-bold drop-shadow">
                  {language === 'en' ? 'Save' : 'Hifadhi'}
                </span>
              </button>

              {/* 4. Gift (Zawadi) */}
              <button
                type="button"
                onClick={() => setShowGiftModal(true)}
                className="flex flex-col items-center gap-0.5 group cursor-pointer"
                aria-label="Tuma Zawadi"
              >
                <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-[#16C784]/50 text-[#16C784] flex items-center justify-center shadow-lg transition-transform group-active:scale-90 group-hover:scale-105">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="text-[10.5px] font-bold text-[#16C784] drop-shadow">
                  Zawadi
                </span>
              </button>

              {/* 5. Share */}
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-col items-center gap-0.5 group cursor-pointer"
                aria-label="Shiriki Video"
              >
                <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg transition-transform group-active:scale-90 group-hover:scale-105">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10.5px] font-bold drop-shadow">
                  {language === 'en' ? 'Share' : 'Shiriki'}
                </span>
              </button>

              {/* 6. More Options (Fullscreen / Channel / Audio) */}
              <button
                type="button"
                onClick={() => setShowMoreMenu((prev) => !prev)}
                className="flex flex-col items-center gap-0.5 group cursor-pointer"
                aria-label="Chaguo Zaidi"
              >
                <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg transition-transform group-active:scale-90 group-hover:scale-105">
                  <MoreVertical className="w-5 h-5" />
                </div>
              </button>
            </div>

            {/* Quick Options Popover from More Button */}
            {showMoreMenu && (
              <div className="absolute right-16 bottom-6 z-30 w-48 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/15 shadow-2xl p-1.5 text-white animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 text-[#FF3040]" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                  <span>
                    {isFullscreen
                      ? language === 'en'
                        ? 'Exit Fullscreen'
                        : 'Toka Skrini Nzima'
                      : language === 'en'
                        ? 'Fullscreen'
                        : 'Skrini Nzima'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMuted((prev) => !prev);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>
                    {isMuted
                      ? language === 'en'
                        ? 'Unmute Audio'
                        : 'Washa Sauti'
                      : language === 'en'
                        ? 'Mute Audio'
                        : 'Zima Sauti'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onSelectChannel(currentShort.channelId);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Tv className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Visit Channel' : 'Tembelea Chaneli'}</span>
                </button>
              </div>
            )}

            {/* Razor-Thin Video Progress Bar Along Bottom Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-20 pointer-events-none">
              <div
                className="h-full bg-[#FF3040] transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>

            {/* Interactive Slide-Up Comments Sheet */}
            {showCommentsSheet && (
              <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150">
                <div
                  className="flex-1"
                  onClick={() => setShowCommentsSheet(false)}
                />
                <div className="bg-white dark:bg-[#141824] text-slate-900 dark:text-white rounded-t-3xl border-t border-slate-200 dark:border-[#262E3E] shadow-2xl max-h-[68%] flex flex-col">
                  <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 shrink-0" />
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-[#262E3E] shrink-0">
                    <h4 className="text-sm font-extrabold">
                      {language === 'en' ? 'Comments' : 'Maoni'} ({totalCommentsCount})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCommentsSheet(false)}
                      className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-[#191E29] flex items-center justify-center text-slate-500 dark:text-[#A7B0C0] cursor-pointer"
                      aria-label="Funga Maoni"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {shortComments.length === 0 ? (
                      <div className="py-8 text-center space-y-1.5">
                        <MessageCircle className="w-7 h-7 text-slate-400 dark:text-[#A7B0C0] mx-auto opacity-60" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-[#A7B0C0]">
                          {language === 'en'
                            ? 'Be the first to leave a comment!'
                            : 'Kuwa wa kwanza kutoa maoni kwenye Short hii!'}
                        </p>
                      </div>
                    ) : (
                      shortComments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5">
                          <img
                            src={comment.userAvatar || createAvatarSvgDataUri(comment.userName)}
                            alt={comment.userName}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = createAvatarSvgDataUri(
                                comment.userName
                              );
                            }}
                            className="w-8 h-8 rounded-full object-cover shrink-0 bg-slate-100 dark:bg-[#191E29]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {comment.userName}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500 dark:text-[#A7B0C0]">
                                {formatRelativeTime(comment.createdAt, language)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-[#CBD5E1] mt-0.5 leading-relaxed break-words">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    onSubmit={handlePostComment}
                    className="p-3 pb-5 sm:pb-3 border-t border-slate-100 dark:border-[#262E3E] flex items-center gap-2 bg-slate-50/70 dark:bg-[#10131B]/70 shrink-0"
                  >
                    <img
                      src={
                        profile?.photoURL ||
                        createAvatarSvgDataUri(profile?.displayName || 'Mwanachama')
                      }
                      alt={profile?.displayName || 'Mwanachama'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createAvatarSvgDataUri(
                          profile?.displayName || 'Mwanachama'
                        );
                      }}
                      className="w-8 h-8 rounded-full object-cover shrink-0 bg-slate-200 dark:bg-[#191E29]"
                    />
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={
                        language === 'en' ? 'Add a comment...' : 'Andika maoni yako...'
                      }
                      className="flex-1 min-w-0 bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-full px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF3040]"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="w-9 h-9 rounded-full bg-[#FF3040] hover:bg-[#E02635] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
                      aria-label="Tuma Maoni"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop Navigation Rail Beside the 9:16 Theater Card */}
      {!isFullscreen && (
        <div className="hidden sm:flex flex-col gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIndex === 0}
            className="w-11 h-11 rounded-full bg-white hover:bg-slate-100 dark:bg-[#191E29] dark:hover:bg-[#232A39] border border-slate-200 dark:border-[#262E3E] text-slate-900 dark:text-white disabled:opacity-35 flex items-center justify-center shadow-md transition-all cursor-pointer"
            title="Short Iliyopita"
            aria-label="Short Iliyopita"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={safeIndex >= filteredShorts.length - 1}
            className="w-11 h-11 rounded-full bg-white hover:bg-slate-100 dark:bg-[#191E29] dark:hover:bg-[#232A39] border border-slate-200 dark:border-[#262E3E] text-slate-900 dark:text-white disabled:opacity-35 flex items-center justify-center shadow-md transition-all cursor-pointer"
            title="Short Inayofuata"
            aria-label="Short Inayofuata"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Gift Modal */}
      {currentShort && (
        <GiftModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          videoId={currentShort.id}
          channelId={currentShort.channelId}
          channelName={currentShort.channelName}
          onOpenWallet={onOpenWallet}
        />
      )}
    </div>
  );
};
