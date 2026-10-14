import React from 'react';
import { Clock, ThumbsUp, Tv, Library, Trash2 } from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { VideoItem } from '../types';
import { translations } from '../lib/i18n';

interface LibraryPageProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ onSelectVideo, onSelectChannel }) => {
  const { watchHistory, videos, likedVideoIds, channels, userSubscriptions } = useVideo();
  const { language } = useAuth();
  const t = translations[language];

  const likedVideos = videos.filter(v => likedVideoIds.includes(v.id));
  const subbedChannels = channels.filter(c => userSubscriptions.includes(c.id));

  return (
    <div className="space-y-8 pb-20">
      
      {/* Page Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#262E3E]">
        <div className="w-10 h-10 rounded-xl bg-[#FF3040] flex items-center justify-center text-white shadow-md">
          <Library className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t.library}</h1>
          <p className="text-xs text-[#A7B0C0]">Historia yako ya utazamaji, video unazopenda, na orodha ulizohifadhi</p>
        </div>
      </div>

      {/* Watch History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF3040]" />
            <span>{t.history}</span>
          </h2>
          <span className="text-xs text-[#A7B0C0]">{watchHistory.length} video</span>
        </div>

        {watchHistory.length === 0 ? (
          <p className="text-xs text-[#A7B0C0]">Bado haujatazama video yoyote.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchHistory.slice(0, 6).map((vid) => (
              <VideoCard
                key={vid.id}
                video={vid}
                onSelectVideo={onSelectVideo}
                onSelectChannel={onSelectChannel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Liked Videos */}
      <div className="space-y-3 pt-4 border-t border-[#262E3E]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-[#16C784]" />
            <span>{t.likedVideos}</span>
          </h2>
          <span className="text-xs text-[#A7B0C0]">{likedVideos.length} video</span>
        </div>

        {likedVideos.length === 0 ? (
          <p className="text-xs text-[#A7B0C0]">Hauna video uliyopenda bado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {likedVideos.map((vid) => (
              <VideoCard
                key={vid.id}
                video={vid}
                onSelectVideo={onSelectVideo}
                onSelectChannel={onSelectChannel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Subscribed Channels */}
      <div className="space-y-3 pt-4 border-t border-[#262E3E]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Tv className="w-4 h-4 text-purple-400" />
          <span>Vituo Unavyofuatilia ({subbedChannels.length})</span>
        </h2>

        <div className="flex flex-wrap gap-4">
          {subbedChannels.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectChannel(c.id)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#191E29] border border-[#262E3E] cursor-pointer hover:border-[#FF3040] transition-colors"
            >
              <img src={c.avatarUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
              <span className="text-xs font-bold text-white">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
