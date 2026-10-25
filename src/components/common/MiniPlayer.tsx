import React from 'react';
import { Play, Pause, X, CheckCircle2 } from 'lucide-react';
import { VideoItem } from '../../types';

interface MiniPlayerProps {
  video: VideoItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExpand: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  video,
  isPlaying,
  onTogglePlay,
  onExpand,
  onClose,
}) => {
  return (
    <div className="fixed bottom-16 sm:bottom-18 left-2 right-2 sm:left-4 sm:right-4 z-40 max-w-lg mx-auto bg-[#181C26]/95 backdrop-blur-xl border border-[#262E3E] rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200 select-none">
      
      {/* Thumbnail */}
      <div 
        onClick={onExpand}
        className="relative w-16 h-11 sm:w-20 sm:h-12 rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer border border-[#262E3E]"
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-[#FF3040]/90 text-white flex items-center justify-center">
            <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div 
        onClick={onExpand}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <h4 className="text-xs font-bold text-white truncate leading-snug">
          {video.title}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#A7B0C0]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="truncate">{video.channelName}</span>
          {video.isChannelVerified && (
            <CheckCircle2 className="w-3 h-3 text-[#16C784] shrink-0" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          className="p-2 rounded-full hover:bg-[#232A39] text-white active:scale-95 transition-all"
          title={isPlaying ? 'Sitisha (Pause)' : 'Cheza (Play)'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white ml-0.5" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 rounded-full hover:bg-[#232A39] text-[#A7B0C0] hover:text-white transition-colors"
          title="Funga"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
