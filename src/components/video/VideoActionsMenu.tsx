import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreHorizontal,
  MoreVertical,
  ListVideo,
  Clock,
  Bookmark,
  Download,
  Share2,
  ThumbsUp,
  Tv,
  Ban,
  CircleMinus,
  Flag,
  Check,
  CheckCircle2,
  Copy,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react';
import { VideoItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { createThumbnailSvgDataUri } from '../../lib/mediaPlaceholders';
import { ReportModal } from '../modals/ReportModal';
import { VideoDownloadModal } from '../modals/VideoDownloadModal';

export interface TazamaActionToastPayload {
  id?: string;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const dispatchActionToast = (payload: TazamaActionToastPayload) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('tazama_action_toast', {
      detail: {
        ...payload,
        id: payload.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    })
  );
};

interface VideoActionsMenuProps {
  video: VideoItem;
  onSelectVideo?: (video: VideoItem) => void;
  onSelectChannel?: (channelId: string) => void;
  variant?: 'horizontal' | 'vertical';
  buttonClassName?: string;
}

export const VideoActionsMenu: React.FC<VideoActionsMenuProps> = ({
  video,
  onSelectVideo,
  onSelectChannel,
  variant = 'horizontal',
  buttonClassName,
}) => {
  const { language } = useAuth();
  const isEn = language === 'en';

  const {
    likedVideoIds,
    toggleLike,
    playlists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    toggleWatchLater,
    isInWatchLater,
    isDownloaded,
    addToQueue,
    removeFromQueue,
    isInQueue,
    markNotInterested,
    undoNotInterested,
    hideChannelRecommendations,
    unhideChannelRecommendations,
  } = useVideo();

  const [isOpen, setIsOpen] = useState(false);
  const [desktopCoords, setDesktopCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ top: 0, right: 16 });

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const isLiked = Boolean(video?.id && likedVideoIds.includes(video.id));
  const inQueue = Boolean(video?.id && isInQueue(video.id));
  const inWatchLater = Boolean(video?.id && isInWatchLater(video.id));
  const downloaded = Boolean(video?.id && isDownloaded(video.id));

  const updateDesktopPosition = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const right = Math.max(12, window.innerWidth - rect.right);

    if (spaceBelow < 410 && rect.top > 360) {
      setDesktopCoords({
        bottom: window.innerHeight - rect.top + 6,
        right,
      });
    } else {
      setDesktopCoords({
        top: rect.bottom + 6,
        right,
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updateDesktopPosition();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleScrollOrResize = () => {
      if (window.innerWidth >= 640) {
        updateDesktopPosition();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateDesktopPosition]);

  const handleToggleQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (inQueue) {
      removeFromQueue(video.id);
      dispatchActionToast({
        message: isEn ? 'Removed from queue' : 'Imeondolewa kwenye foleni ya kucheza',
      });
    } else {
      addToQueue(video);
      dispatchActionToast({
        message: isEn ? 'Added to queue' : 'Imeongezwa kwenye foleni (Queue)',
        actionLabel: onSelectVideo ? (isEn ? 'Play' : 'Cheza') : undefined,
        onAction: onSelectVideo ? () => onSelectVideo(video) : undefined,
      });
    }
  };

  const handleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    const added = toggleWatchLater(video.id);
    dispatchActionToast({
      message: added
        ? isEn
          ? 'Saved to Watch later'
          : 'Imehifadhiwa kwenye Tazama Baadaye'
        : isEn
          ? 'Removed from Watch later'
          : 'Imeondolewa kwenye Tazama Baadaye',
      undoLabel: isEn ? 'Undo' : 'Tendua',
      onUndo: () => toggleWatchLater(video.id),
    });
  };

  const handleOpenPlaylists = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowPlaylistModal(true);
  };

  const handleOpenDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowDownloadModal(true);
  };

  const handleOpenShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowShareModal(true);
  };

  const handleQuickLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    toggleLike(video.id);
    dispatchActionToast({
      message: !isLiked
        ? isEn
          ? 'Added to liked videos'
          : 'Imependezwa na kuhifadhiwa kwenye Zilizopendwa'
        : isEn
          ? 'Removed like'
          : 'Like imeondolewa',
    });
  };

  const handleOpenChannel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onSelectChannel?.(video.channelId);
  };

  const handleNotInterested = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    markNotInterested(video.id);
    dispatchActionToast({
      message: isEn ? 'Video removed from your feed' : 'Video imeondolewa kwenye mapendekezo yako',
      undoLabel: isEn ? 'Undo' : 'Tendua',
      onUndo: () => undoNotInterested(video.id),
    });
  };

  const handleHideChannel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    hideChannelRecommendations(video.channelId);
    dispatchActionToast({
      message: isEn
        ? `Won't recommend "${video.channelName}"`
        : `Chaneli "${video.channelName}" haitapendekezwa tena`,
      undoLabel: isEn ? 'Undo' : 'Tendua',
      onUndo: () => unhideChannelRecommendations(video.channelId),
    });
  };

  const handleOpenReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowReportModal(true);
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?v=${encodeURIComponent(video.id)}`
      : '';
  const shareMessage = `${isEn ? 'Watch' : 'Tazama'} "${video.title}" ${
    isEn ? 'on Tazama!' : 'kwenye Tazama!'
  } ${shareUrl}`;

  const handleCopyShareLink = () => {
    if (shareUrl && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `${video.title} — ${video.channelName}`,
          url: shareUrl,
        });
        setShowShareModal(false);
      } catch {
        // User dismissed native share sheet
      }
    }
  };

  const thumbFallback = createThumbnailSvgDataUri(video.title, video.category);
  const thumbSrc = video.thumbnailUrl || thumbFallback;

  const MenuIcon = variant === 'vertical' ? MoreVertical : MoreHorizontal;

  const menuRows = (isMobileSheet: boolean) => {
    const rowCls = isMobileSheet
      ? 'w-full flex items-center gap-3.5 px-4 py-3 text-[13px] font-semibold text-slate-800 hover:bg-slate-100 active:bg-slate-200/70 dark:text-white dark:hover:bg-white/10 transition-colors cursor-pointer text-left'
      : 'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 transition-colors cursor-pointer text-left';

    const iconCls = isMobileSheet ? 'w-5 h-5 shrink-0' : 'w-4 h-4 shrink-0';

    return (
      <>
        {/* 1. Add to queue */}
        <button type="button" onClick={handleToggleQueue} className={rowCls}>
          {inQueue ? (
            <Check className={`${iconCls} text-emerald-600 dark:text-[#16C784]`} />
          ) : (
            <ListVideo className={iconCls} />
          )}
          <span className="flex-1 truncate">
            {inQueue
              ? isEn
                ? 'In queue (Remove)'
                : 'Kwenye foleni (Ondoa)'
              : isEn
                ? 'Add to queue'
                : 'Ongeza kwenye foleni'}
          </span>
        </button>

        {/* 2. Save to Watch later */}
        <button type="button" onClick={handleWatchLater} className={rowCls}>
          {inWatchLater ? (
            <Check className={`${iconCls} text-emerald-600 dark:text-[#16C784]`} />
          ) : (
            <Clock className={iconCls} />
          )}
          <span className="flex-1 truncate">
            {inWatchLater
              ? isEn
                ? 'Saved to Watch later'
                : 'Imehifadhiwa (Tazama Baadaye)'
              : isEn
                ? 'Save to Watch later'
                : 'Hifadhi (Tazama Baadaye)'}
          </span>
        </button>

        {/* 3. Save to playlist */}
        <button type="button" onClick={handleOpenPlaylists} className={rowCls}>
          <Bookmark className={iconCls} />
          <span className="flex-1 truncate">
            {isEn ? 'Save to playlist' : 'Hifadhi kwenye Orodha'}
          </span>
        </button>

        {/* 4. Download */}
        <button type="button" onClick={handleOpenDownload} className={rowCls}>
          {downloaded ? (
            <CheckCircle2 className={`${iconCls} text-emerald-600 dark:text-[#16C784]`} />
          ) : (
            <Download className={iconCls} />
          )}
          <span className="flex-1 truncate">
            {downloaded
              ? isEn
                ? 'Downloaded (Offline)'
                : 'Imepakuliwa (Nje ya Mtandao)'
              : isEn
                ? 'Download'
                : 'Pakua Video'}
          </span>
        </button>

        {/* 5. Share */}
        <button type="button" onClick={handleOpenShare} className={rowCls}>
          <Share2 className={iconCls} />
          <span className="flex-1 truncate">{isEn ? 'Share' : 'Shiriki Video'}</span>
        </button>

        <div className="my-1 border-t border-slate-100 dark:border-white/10" />

        {/* Quick Like & Open Channel */}
        <button type="button" onClick={handleQuickLike} className={rowCls}>
          <ThumbsUp
            className={`${iconCls} ${isLiked ? 'text-[#FF3040] fill-[#FF3040]' : ''}`}
          />
          <span className="flex-1 truncate">
            {isLiked
              ? isEn
                ? 'Remove like'
                : 'Ondoa Like'
              : isEn
                ? 'Like video'
                : 'Penda Video (Like)'}
          </span>
        </button>

        {onSelectChannel && (
          <button type="button" onClick={handleOpenChannel} className={rowCls}>
            <Tv className={iconCls} />
            <span className="flex-1 truncate">
              {isEn ? 'Open channel' : 'Fungua Chaneli'}
            </span>
          </button>
        )}

        <div className="my-1 border-t border-slate-100 dark:border-white/10" />

        {/* 6. Not interested */}
        <button type="button" onClick={handleNotInterested} className={rowCls}>
          <Ban className={iconCls} />
          <span className="flex-1 truncate">
            {isEn ? 'Not interested' : 'Sipendezwi nayo'}
          </span>
        </button>

        {/* 7. Don't recommend channel */}
        <button type="button" onClick={handleHideChannel} className={rowCls}>
          <CircleMinus className={iconCls} />
          <span className="flex-1 truncate">
            {isEn ? "Don't recommend channel" : 'Usipendekeze chaneli hii'}
          </span>
        </button>

        {/* 8. Report */}
        <button
          type="button"
          onClick={handleOpenReport}
          className={`${rowCls} text-red-600 dark:text-red-400`}
        >
          <Flag className={iconCls} />
          <span className="flex-1 truncate">{isEn ? 'Report' : 'Ripoti'}</span>
        </button>
      </>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={
          buttonClassName ||
          'min-w-[34px] min-h-[34px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white cursor-pointer rounded-full hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors shrink-0'
        }
        title={isEn ? 'More options' : 'Chaguo zaidi'}
        aria-label={isEn ? 'More video options' : 'Chaguo zaidi za video'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MenuIcon className="w-4 h-4" />
      </button>

      {/* Portal Dropdown (Desktop) + Bottom Sheet (Mobile) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="fixed inset-0 z-[70]"
          >
            {/* Mobile Backdrop + Bottom Sheet (< 640px) */}
            <div className="sm:hidden fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] animate-in fade-in duration-150" />
            <div
              onClick={(e) => e.stopPropagation()}
              role="menu"
              className="sm:hidden fixed inset-x-0 bottom-0 z-[71] bg-white dark:bg-[#191E29] border-t border-slate-200 dark:border-[#262E3E] rounded-t-3xl shadow-2xl pb-5 pt-2.5 max-h-[82vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 select-none"
            >
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mb-2.5" />

              {/* Compact Video Summary Header */}
              <div className="flex items-center gap-2.5 px-4 pb-2.5 mb-1 border-b border-slate-100 dark:border-[#262E3E]">
                <img
                  src={thumbSrc}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = thumbFallback;
                  }}
                  className="w-14 h-9 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-[#10131B]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {video.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
                    {video.channelName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                  aria-label="Funga"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-1">{menuRows(true)}</div>
            </div>

            {/* Desktop Boundary-Aware Popover (>= 640px) */}
            <div
              onClick={(e) => e.stopPropagation()}
              role="menu"
              style={{
                top: desktopCoords.top !== undefined ? `${desktopCoords.top}px` : undefined,
                bottom:
                  desktopCoords.bottom !== undefined ? `${desktopCoords.bottom}px` : undefined,
                right: `${desktopCoords.right}px`,
              }}
              className="hidden sm:block fixed z-[71] w-64 max-h-[75vh] overflow-y-auto bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-2xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 select-none"
            >
              {menuRows(false)}
            </div>
          </div>,
          document.body
        )}

      {/* Save to Playlist Portal Modal */}
      {showPlaylistModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylistModal(false);
            }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 select-none"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262E3E]">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Save to playlist' : 'Hifadhi kwenye Orodha (Playlist)'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlaylistModal(false)}
                  className="p-1 rounded-full text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Watch Later Row */}
              <button
                type="button"
                onClick={() => toggleWatchLater(video.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  inWatchLater
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900 dark:bg-[#16C784]/10 dark:border-[#16C784]/40 dark:text-white'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 dark:bg-[#10131B] dark:hover:bg-[#232A39] dark:border-[#262E3E] dark:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#FF3040]" />
                  <div>
                    <h4 className="text-xs font-bold">
                      {isEn ? 'Watch later' : 'Tazama Baadaye'}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-[#A7B0C0]">
                      {isEn ? 'Quick access playlist' : 'Orodha ya haraka'}
                    </p>
                  </div>
                </div>
                {inWatchLater ? (
                  <span className="text-[10px] bg-[#16C784] text-black font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {isEn ? 'Saved' : 'Imehifadhiwa'}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#FF3040] font-bold">
                    + {isEn ? 'Save' : 'Hifadhi'}
                  </span>
                )}
              </button>

              {/* Other Custom Playlists */}
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {playlists
                  .filter((pl) => pl.id !== 'pl-watch-later')
                  .map((pl) => {
                    const isInList = pl.videoIds.includes(video.id);
                    return (
                      <button
                        type="button"
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
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-bold truncate">{pl.title}</h4>
                          <p className="text-[10px] text-slate-600 dark:text-[#A7B0C0]">
                            {pl.videoIds.length} video
                          </p>
                        </div>
                        {isInList ? (
                          <span className="text-[10px] bg-[#16C784] text-black font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            {isEn ? 'Saved' : 'Ipo'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold shrink-0">
                            + {isEn ? 'Add' : 'Weka'}
                          </span>
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
                      placeholder={isEn ? 'New playlist title...' : 'Jina la orodha mpya...'}
                      className="w-full bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingPlaylist(false);
                          setNewPlaylistTitle('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-[#A7B0C0] cursor-pointer"
                      >
                        {isEn ? 'Cancel' : 'Ghairi'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (newPlaylistTitle.trim()) {
                            const newId = createPlaylist(newPlaylistTitle.trim());
                            addToPlaylist(newId, video.id);
                            setNewPlaylistTitle('');
                            setIsCreatingPlaylist(false);
                            dispatchActionToast({
                              message: isEn
                                ? 'Playlist created and video saved!'
                                : 'Orodha mpya imeundwa na video imehifadhiwa!',
                            });
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                      >
                        {isEn ? 'Create & Save' : 'Unda & Hifadhi'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreatingPlaylist(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:text-purple-300 dark:border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isEn ? 'New playlist' : 'Unda Orodha Mpya'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Share Portal Modal */}
      {showShareModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowShareModal(false);
            }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 select-none"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262E3E]">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#FF3040]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Share video' : 'Shiriki Video Hii'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-full text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-[#A7B0C0] line-clamp-2">
                {video.title}
              </p>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Share via device apps' : 'Shiriki kupitia programu za simu'}</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-emerald-700 dark:text-[#25D366] text-xs font-bold transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(video.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/30 text-[#0077b5] dark:text-[#0088cc] text-xs font-bold transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0088cc]" />
                  <span>Telegram</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-[#1877F2] text-xs font-bold transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                  <span>Facebook</span>
                </a>

                <a
                  href={`sms:?body=${encodeURIComponent(shareMessage)}`}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:border-amber-500/30 dark:text-amber-300 text-xs font-bold transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span>SMS / Ujumbe</span>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-[#262E3E]">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E]">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="bg-transparent text-xs text-slate-600 dark:text-[#A7B0C0] font-mono flex-1 outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                      copiedLink
                        ? 'bg-[#16C784] text-black'
                        : 'bg-[#FF3040] text-white hover:bg-[#E02635]'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (isEn ? 'Copied' : 'Imenakiliwa') : (isEn ? 'Copy link' : 'Nakili Link')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Download Portal Modal */}
      {showDownloadModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div onClick={(e) => e.stopPropagation()}>
            <VideoDownloadModal
              isOpen={showDownloadModal}
              onClose={() => setShowDownloadModal(false)}
              video={video}
            />
          </div>,
          document.body
        )}

      {/* Report Portal Modal */}
      {showReportModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div onClick={(e) => e.stopPropagation()}>
            <ReportModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              targetType="video"
              targetId={video.id}
              targetTitle={video.title}
            />
          </div>,
          document.body
        )}
    </>
  );
};
