import React from 'react';
import { CheckCircle2, MoreVertical, Play, Flame } from 'lucide-react';
import { VideoItem } from '../../types';
import { formatDuration, formatViews, formatRelativeTime } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';

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

  const isLive = video.viewsCount > 500000;

  return (
    <div className="group flex flex-col gap-2.5 cursor-pointer select-none">
      
      {/* Thumbnail Container (Matching Screenshot 1 & 7: Large rounded card with Live badge & Play circle) */}
      <div 
        onClick={() => onSelectVideo(video)}
        className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-[#181C26] border border-[#262E3E]/60 transition-transform duration-200 group-hover:scale-[1.01] shadow-lg group-hover:shadow-2xl"
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
        />

        {/* Live Badge (Top-left, matching Screenshot 1 & 7) */}
        {isLive ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#FF3040] text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Live</span>
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-white/90">
            {video.category}
          </div>
        )}

        {video.isMembersOnly && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#16C784] text-[10px] font-bold text-black shadow-md">
            VIP Pekee
          </div>
        )}

        {/* Red Circle Play Badge (Bottom-Right, matching Screenshot 1 & 7) */}
        <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-[#FF3040] text-white flex items-center justify-center shadow-lg shadow-[#FF3040]/50 group-hover:scale-110 active:scale-95 transition-transform">
          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
        </div>

        {/* Duration Badge */}
        {!isLive && (
          <div className="absolute bottom-2.5 right-11 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono font-semibold text-white">
            {formatDuration(video.durationSeconds)}
          </div>
        )}
      </div>

      {/* Video Details & Meta */}
      <div className="flex gap-3 px-1">
        
        {/* Channel Avatar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectChannel?.(video.channelId);
          }}
          className="shrink-0 group/avatar focus:outline-none"
        >
          <img
            src={video.channelAvatar}
            alt={video.channelName}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-[#262E3E] group-hover/avatar:ring-[#FF3040] transition-all"
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

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#A7B0C0]">
            <span className="hover:text-white truncate font-medium">{video.channelName}</span>
            {video.isChannelVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            )}
            <span>•</span>
            <span>{formatViews(video.viewsCount, language)} views</span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt, language)}</span>
          </div>
        </div>

        {/* 3-dots Menu Button (Matching Screenshot 1 & 7) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-1 text-[#A7B0C0] hover:text-white shrink-0 self-start"
          title="Chaguo zaidi"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
