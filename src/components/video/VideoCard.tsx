import React from 'react';
import { CheckCircle2, MoreVertical, Share2, Bookmark } from 'lucide-react';
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

  return (
    <div className="group flex flex-col gap-2.5 cursor-pointer">
      
      {/* Thumbnail Container */}
      <div 
        onClick={() => onSelectVideo(video)}
        className="relative w-full aspect-video-player rounded-xl overflow-hidden bg-[#191E29] border border-[#262E3E]/60 transition-transform duration-200 group-hover:scale-[1.02] shadow-md group-hover:shadow-xl"
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
        />

        {/* Video Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-mono font-semibold text-white">
          {formatDuration(video.durationSeconds)}
        </div>

        {/* Category Tag Overlay */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-white/90">
          {video.category}
        </div>

        {video.isMembersOnly && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#16C784] text-[10px] font-bold text-black shadow-md">
            VIP Pekee
          </div>
        )}
      </div>

      {/* Video Details */}
      <div className="flex gap-3 px-0.5">
        
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
            className="w-9 h-9 rounded-full object-cover ring-1 ring-[#262E3E] group-hover/avatar:ring-[#FF3040] transition-all"
          />
        </button>

        {/* Metadata */}
        <div className="flex-1 min-w-0" onClick={() => onSelectVideo(video)}>
          <h3 
            className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#FF3040] transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#A7B0C0]">
            <span className="hover:text-white truncate font-medium">{video.channelName}</span>
            {video.isChannelVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A7B0C0] fill-[#A7B0C0] text-black shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#A7B0C0]">
            <span>{formatViews(video.viewsCount, language)} {language === 'sw' ? 'matazamio' : 'views'}</span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt, language)}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
