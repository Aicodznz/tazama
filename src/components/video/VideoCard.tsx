import React, { useState } from 'react';
import { CheckCircle2, MoreVertical, Play } from 'lucide-react';
import { VideoItem } from '../../types';
import { formatDuration, formatViews, formatRelativeTime } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../../lib/mediaPlaceholders';

interface VideoCardProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel?: (channelId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onSelectVideo, 
  onSelectChannel 
}) => {
  const { language } = useAuth();
  const [thumbError, setThumbError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const isLive = video.viewsCount > 500000;

  const thumbnailSrc = thumbError 
    ? createThumbnailSvgDataUri(video.title, video.category)
    : (video.thumbnailUrl || createThumbnailSvgDataUri(video.title, video.category));

  const avatarSrc = avatarError
    ? createAvatarSvgDataUri(video.channelName)
    : (video.channelAvatar || createAvatarSvgDataUri(video.channelName));

  return (
    <div className="group flex flex-col gap-2.5 cursor-pointer select-none">
      
      {/* Thumbnail Container */}
      <div 
        onClick={() => onSelectVideo(video)}
        className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-[#141824] border border-[#262E3E]/70 transition-transform duration-200 group-hover:scale-[1.01] shadow-lg group-hover:shadow-2xl"
      >
        <img
          src={thumbnailSrc}
          alt="" // Avoid showing broken browser alt text over card
          loading="lazy"
          onError={() => setThumbError(true)}
          className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
        />

        {/* Live Badge (Top-left) */}
        {isLive ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#FF3040] text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md shadow-[#FF3040]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Live</span>
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/10">
            {video.category}
          </div>
        )}

        {video.isMembersOnly && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#16C784] text-[10px] font-extrabold text-black shadow-md">
            VIP Pekee
          </div>
        )}

        {/* Red Circle Play Badge (Bottom-Right) */}
        <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-[#FF3040] text-white flex items-center justify-center shadow-lg shadow-[#FF3040]/50 group-hover:scale-110 active:scale-95 transition-transform">
          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
        </div>

        {/* Duration Badge */}
        {!isLive && (
          <div className="absolute bottom-2.5 right-11 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[10px] font-mono font-semibold text-white border border-white/10">
            {formatDuration(video.durationSeconds)}
          </div>
        )}
      </div>

      {/* Video Details & Meta */}
      <div className="flex gap-3 px-0.5">
        
        {/* Channel Avatar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectChannel?.(video.channelId);
          }}
          className="shrink-0 group/avatar focus:outline-none self-start mt-0.5"
          title={video.channelName}
        >
          <img
            src={avatarSrc}
            alt=""
            onError={() => setAvatarError(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1.5 ring-[#262E3E] group-hover/avatar:ring-[#FF3040] transition-all bg-[#1A1F2E]"
          />
        </button>

        {/* Title, Channel Info, Views */}
        <div className="flex-1 min-w-0" onClick={() => onSelectVideo(video)}>
          <h3 
            className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FF3040] transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="mt-1 space-y-0.5">
            {/* Channel Name + Verified Badge */}
            <div className="flex items-center gap-1.5 text-xs text-[#CBD5E1] font-medium">
              <span className="hover:text-white truncate max-w-[180px] sm:max-w-none">
                {video.channelName}
              </span>
              {video.isChannelVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
            </div>

            {/* Views Count & Relative Time */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
              <span>{formatViews(video.viewsCount, language)} {language === 'sw' ? 'matazamio' : 'views'}</span>
              <span className="text-[#475569]">•</span>
              <span>{formatRelativeTime(video.createdAt, language)}</span>
            </div>
          </div>
        </div>

        {/* 3-dots Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-1 text-[#A7B0C0] hover:text-white shrink-0 self-start mt-0.5 cursor-pointer rounded-full hover:bg-white/5 transition-colors"
          title="Chaguo zaidi"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
