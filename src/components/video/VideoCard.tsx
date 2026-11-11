import React, { useState } from 'react';
import { CheckCircle2, Play } from 'lucide-react';
import { VideoItem } from '../../types';
import { formatViews, formatRelativeTime } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { createAvatarSvgDataUri } from '../../lib/mediaPlaceholders';
import { VideoThumbnailPreview } from './VideoThumbnailPreview';
import { VideoActionsMenu } from './VideoActionsMenu';

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
  const [avatarError, setAvatarError] = useState(false);

  const avatarSrc = avatarError
    ? createAvatarSvgDataUri(video.channelName)
    : video.channelAvatar || createAvatarSvgDataUri(video.channelName);

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
        <div className="relative shrink-0 -mr-1.5">
          <VideoActionsMenu
            video={video}
            onSelectVideo={onSelectVideo}
            onSelectChannel={onSelectChannel}
            variant="horizontal"
          />
        </div>
      </div>
    </div>
  );
};
