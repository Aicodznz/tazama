import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  MoreHorizontal,
  Play,
  Bookmark,
  ThumbsUp,
  Copy,
  Check,
  Tv,
} from 'lucide-react';
import { VideoItem } from '../../types';
import { formatViews, formatRelativeTime } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { createAvatarSvgDataUri } from '../../lib/mediaPlaceholders';
import { VideoThumbnailPreview } from './VideoThumbnailPreview';

interface VideoCardProps {
  video: VideoItem;
  autoPlayPreview?: boolean;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel?: (channelId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  autoPlayPreview = false,
  onSelectVideo,
  onSelectChannel,
}) => {
  const { language } = useAuth();
  const { likedVideoIds, toggleLike, playlists, addToPlaylist } = useVideo();

  const [avatarError, setAvatarError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isMenuOpen]);

  const avatarSrc = avatarError
    ? createAvatarSvgDataUri(video.channelName)
    : video.channelAvatar || createAvatarSvgDataUri(video.channelName);

  const isLiked = Boolean(video?.id && likedVideoIds.includes(video.id));

  const handleSaveWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    const watchLater =
      playlists.find((p) => p.id === 'pl-watch-later') || playlists[0];
    if (watchLater) {
      addToPlaylist(watchLater.id, video.id);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 1800);
    }
    setIsMenuOpen(false);
  };

  const handleQuickLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(video.id);
    setIsMenuOpen(false);
  };

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/?v=${encodeURIComponent(video.id)}`
        : '';
    if (shareUrl && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setIsMenuOpen(false);
    }, 900);
  };

  return (
    <div className="group flex flex-col gap-2 cursor-pointer select-none">
      {/* Dynamic Gradient Border Thumbnail + Live Preview */}
      <VideoThumbnailPreview
        video={video}
        autoPlayPreview={autoPlayPreview}
        onSelectVideo={onSelectVideo}
        aspectRatioClass="aspect-video"
        className="rounded-xl sm:rounded-2xl shadow-sm dark:shadow-lg group-hover:shadow-md dark:group-hover:shadow-2xl"
      />

      {/* Compact Video Details & Single-Row Inline Meta */}
      <div className="flex items-start gap-2.5 px-0.5 relative">
        {/* Channel Avatar */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectChannel?.(video.channelId);
          }}
          className="shrink-0 group/avatar focus:outline-none mt-0.5 cursor-pointer"
          title={video.channelName}
        >
          <img
            src={avatarSrc}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setAvatarError(true)}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#262E3E] group-hover/avatar:ring-[#FF3040] transition-all bg-slate-100 dark:bg-[#1A1F2E]"
          />
        </button>

        {/* Title + Non-Wrapping Single-Row Metadata */}
        <div className="flex-1 min-w-0" onClick={() => onSelectVideo(video)}>
          <h3
            className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-[1.28] group-hover:text-[#FF3040] transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="mt-1 flex items-center flex-nowrap gap-1.5 text-[11px] leading-tight text-slate-600 dark:text-[#94A3B8] overflow-hidden">
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelectChannel?.(video.channelId);
              }}
              className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:text-white min-w-0 truncate"
            >
              <span className="min-w-0 truncate">{video.channelName}</span>
              {video.isChannelVerified && (
                <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </span>

            <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-[#94A3B8] tabular-nums shrink-0 whitespace-nowrap">
              <Play className="w-2.5 h-2.5 text-slate-400 dark:text-[#64748B]" />
              <span>{formatViews(video.viewsCount, language)}</span>
            </span>

            <span className="text-slate-500 dark:text-[#94A3B8] shrink-0 whitespace-nowrap">
              {formatRelativeTime(video.createdAt, language)}
            </span>
          </div>
        </div>

        {/* 3-Dots Context Menu Trigger */}
        <div ref={menuRef} className="relative shrink-0 -mr-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className="min-w-[34px] min-h-[34px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white cursor-pointer rounded-full hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
            title="Chaguo zaidi"
            aria-expanded={isMenuOpen}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-9 w-52 bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-2xl shadow-xl dark:shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                type="button"
                onClick={handleSaveWatchLater}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
              >
                {savedNotice ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784] shrink-0" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>
                  {savedNotice ? 'Imehifadhiwa!' : 'Hifadhi (Tazama Baadaye)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleQuickLike}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
              >
                <ThumbsUp
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isLiked ? 'text-[#FF3040] fill-[#FF3040]' : ''
                  }`}
                />
                <span>{isLiked ? 'Ondoa Like' : 'Penda Video (Like)'}</span>
              </button>

              {onSelectChannel && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onSelectChannel(video.channelId);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                >
                  <Tv className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Fungua Chaneli</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784] shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{copiedLink ? 'Imenakiliwa!' : 'Nakili Link ya Video'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
