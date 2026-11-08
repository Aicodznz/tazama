import React, { useState } from 'react';
import { CheckCircle2, MoreVertical } from 'lucide-react';
import { VideoItem } from '../../types';
import { formatViews, formatRelativeTime } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { createAvatarSvgDataUri } from '../../lib/mediaPlaceholders';
import { VideoThumbnailPreview } from './VideoThumbnailPreview';

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
  const [avatarError, setAvatarError] = useState(false);

  const avatarSrc = avatarError
    ? createAvatarSvgDataUri(video.channelName)
    : (video.channelAvatar || createAvatarSvgDataUri(video.channelName));

  return (
    <div className="group flex flex-col gap-2.5 cursor-pointer select-none">
      
      {/* YouTube-Style Video Thumbnail Hover Preview */}
      <VideoThumbnailPreview
        video={video}
        onSelectVideo={onSelectVideo}
        aspectRatioClass="aspect-video"
        className="rounded-2xl sm:rounded-3xl shadow-lg group-hover:shadow-2xl"
      />

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
