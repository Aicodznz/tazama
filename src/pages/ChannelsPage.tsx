import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, CheckCircle2, MoreVertical, Bell } from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatViews } from '../lib/i18n';
import { createAvatarSvgDataUri } from '../lib/mediaPlaceholders';

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
    <div className="space-y-4 pb-8 select-none max-w-3xl mx-auto">
      
      {/* Header with Sort By Dropdown */}
      <div className="flex items-center justify-between pt-1 pb-3 border-b border-slate-200 dark:border-[#262E3E]/60">
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateHome}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200/70 dark:hover:bg-[#191E29] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors cursor-pointer"
            title="Rudi Mwanzo"
            aria-label="Rudi Mwanzo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Vituo &amp; Wafuatiliaji
          </h2>
        </div>

        {/* Sort by dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#A7B0C0]">
          <span>Sort by :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-slate-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="popular" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">May you like that</option>
            <option value="subscribers" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">Most subscribers</option>
            <option value="videos" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">Most videos</option>
          </select>
        </div>
      </div>

      {/* Channel Rows */}
      {sortedChannels.length === 0 ? (
        <div className="py-16 px-4 text-center bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] rounded-3xl space-y-3 shadow-sm dark:shadow-none">
          <p className="text-base font-bold text-slate-900 dark:text-white">Hakuna Chaneli Zilizosajiliwa Bado</p>
          <p className="text-xs text-slate-600 dark:text-[#A7B0C0] max-w-sm mx-auto">
            Bado hakuna waundaji waliofungua chaneli. Kuwa wa kwanza kuanzisha chaneli yako ya Tazama leo!
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:text-white text-xs font-semibold dark:border-[#262E3E] transition-all"
            >
              Rudi Mwanzo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedChannels.map((channel) => {
            const isSubscribed = userSubscriptions.includes(channel.id);
            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] hover:border-[#FF3040]/40 shadow-sm dark:shadow-none transition-colors cursor-pointer group gap-3"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={channel.avatarUrl || createAvatarSvgDataUri(channel.name)}
                    alt={channel.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createAvatarSvgDataUri(channel.name);
                    }}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-[#262E3E] group-hover:ring-[#FF3040] transition-all shrink-0 bg-slate-100 dark:bg-[#141824]"
                  />

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate group-hover:text-[#FF3040] transition-colors">
                      <span className="truncate">{channel.name}</span>
                      {channel.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784] shrink-0" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0] font-mono tabular-nums mt-0.5 truncate">
                      {formatViews(channel.subscriberCount, language)} wafuatiliaji &middot; {channel.videoCount} video
                    </p>
                  </div>
                </div>

                {/* Subscribe Action Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubscribe(channel.id);
                    }}
                    className={`min-h-[38px] px-4 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer ${
                      isSubscribed
                        ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#232A39] dark:border-[#262E3E] dark:text-[#A7B0C0] dark:hover:text-white'
                        : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-[#FF3040]/30'
                    }`}
                  >
                    {isSubscribed ? 'Unafuatilia' : 'Fuatilia'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
