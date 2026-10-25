import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, CheckCircle2, MoreVertical, Bell } from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatViews } from '../lib/i18n';

interface ChannelsPageProps {
  onSelectChannel: (channelId: string) => void;
  onNavigateHome: () => void;
}

export const ChannelsPage: React.FC<ChannelsPageProps> = ({
  onSelectChannel,
  onNavigateHome,
}) => {
  const { channels, userSubscriptions, toggleSubscribe } = useVideo();
  const { language } = useAuth();

  const [sortBy, setSortBy] = useState<string>('popular');

  const sortedChannels = [...channels].sort((a, b) => {
    if (sortBy === 'subscribers') {
      return b.subscriberCount - a.subscriberCount;
    }
    if (sortBy === 'videos') {
      return b.videoCount - a.videoCount;
    }
    return 0;
  });

  return (
    <div className="space-y-4 pb-20 select-none max-w-xl mx-auto">
      
      {/* Header with Sort By Dropdown (Matching Screenshot 4) */}
      <div className="flex items-center justify-between pt-1 pb-3 border-b border-[#262E3E]/60">
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateHome}
            className="p-1 rounded-full hover:bg-[#191E29] text-[#A7B0C0] hover:text-white transition-colors"
            title="Rudi Mwanzo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-white">
            Channels &amp; Subscriptions
          </h2>
        </div>

        {/* Sort by dropdown (Matching Screenshot 4: "Sort by : May you like that v") */}
        <div className="flex items-center gap-1.5 text-xs text-[#A7B0C0]">
          <span>Sort by :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="popular" className="bg-[#191E29] text-white">May you like that</option>
            <option value="subscribers" className="bg-[#191E29] text-white">Most subscribers</option>
            <option value="videos" className="bg-[#191E29] text-white">Most videos</option>
          </select>
        </div>
      </div>

      {/* Channel Rows (Matching Screenshot 4) */}
      <div className="space-y-2">
        {sortedChannels.map((channel) => {
          const isSubscribed = userSubscriptions.includes(channel.id);
          return (
            <div
              key={channel.id}
              onClick={() => onSelectChannel(channel.id)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#181C26] transition-colors cursor-pointer group"
            >
              {/* Avatar + Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={channel.avatarUrl}
                  alt={channel.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#262E3E] group-hover:ring-[#FF3040] transition-all shrink-0"
                />

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate group-hover:text-[#FF3040] transition-colors">
                    <span className="truncate">{channel.name}</span>
                    {channel.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16C784] shrink-0" />
                    )}
                  </h3>
                  <p className="text-[11px] text-[#A7B0C0] font-mono mt-0.5 truncate">
                    {formatViews(channel.subscriberCount, language)} subscribers • {channel.videoCount} video
                  </p>
                </div>
              </div>

              {/* Subscribe Action Button (Matching Screenshot 4: Red "Subscribe" vs Dark "Subscribed") */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubscribe(channel.id);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 ${
                    isSubscribed
                      ? 'bg-[#232A39] border border-[#262E3E] text-[#A7B0C0] hover:text-white'
                      : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-[#FF3040]/30'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
