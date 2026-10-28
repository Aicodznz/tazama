import React, { useState } from 'react';
import { Plus, Film } from 'lucide-react';
import { useVideo } from '../../context/VideoContext';
import { createAvatarSvgDataUri } from '../../lib/mediaPlaceholders';
import { Channel } from '../../types';

interface StoriesBarProps {
  onSelectChannel: (channelId: string) => void;
  onOpenUpload: () => void;
  onNavigateShorts: () => void;
}

const StoryItem: React.FC<{
  channel: Channel;
  index: number;
  onSelect: () => void;
}> = ({ channel, index, onSelect }) => {
  const [imgError, setImgError] = useState(false);
  const avatarSrc = imgError 
    ? createAvatarSvgDataUri(channel.name) 
    : (channel.avatarUrl || createAvatarSvgDataUri(channel.name));

  return (
    <div
      onClick={onSelect}
      className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
    >
      <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#FF3040] via-amber-400 to-[#16C784] group-hover:scale-105 transition-transform shadow-md">
        <div className="w-full h-full rounded-full bg-[#10131B] p-[2px] overflow-hidden">
          <img
            src={avatarSrc}
            alt=""
            onError={() => setImgError(true)}
            className="w-full h-full rounded-full object-cover bg-[#1A1F2E]"
          />
        </div>

        {/* Online Green Indicator Dot */}
        {index < 4 && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[#16C784] border-2 border-[#10131B]" />
        )}
      </div>
      <span className="text-[11px] font-medium text-white/90 truncate max-w-[64px] text-center">
        {channel.handle ? channel.handle.replace('@', '') : channel.name.split(' ')[0]}
      </span>
    </div>
  );
};

export const StoriesBar: React.FC<StoriesBarProps> = ({
  onSelectChannel,
  onOpenUpload,
  onNavigateShorts,
}) => {
  const { channels } = useVideo();

  return (
    <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 px-1 select-none">
      {/* 1. "Your shorts" / Add Story */}
      <div 
        onClick={onNavigateShorts}
        className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
      >
        <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-[#191E29] border border-[#262E3E] flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-full bg-[#232A39] flex items-center justify-center text-white/80">
            <Film className="w-6 h-6 text-white group-hover:text-[#FF3040] transition-colors" />
          </div>

          {/* Plus Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenUpload();
            }}
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#FF3040] text-white flex items-center justify-center border-2 border-[#10131B] shadow-md hover:scale-110 active:scale-95 transition-transform"
            title="Unda Short / Pakia"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
        <span className="text-[11px] font-semibold text-white/90 truncate max-w-[64px]">
          Shorts Zako
        </span>
      </div>

      {/* 2. Popular Tanzanian Creators with Active Status Dot */}
      {channels.map((ch, idx) => (
        <StoryItem
          key={ch.id}
          channel={ch}
          index={idx}
          onSelect={() => onSelectChannel(ch.id)}
        />
      ))}
    </div>
  );
};
