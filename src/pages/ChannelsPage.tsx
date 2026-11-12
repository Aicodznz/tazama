import React, { useState, useMemo } from 'react';
import { ChevronLeft, CheckCircle2, Search, Users } from 'lucide-react';
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
  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'subscribers' | 'videos' | 'views'>('popular');
  const [onlySubscribed, setOnlySubscribed] = useState<boolean>(false);

  const displayedChannels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = (channels || []).filter((ch) => {
      if (!ch || !ch.id) return false;
      if (onlySubscribed && !userSubscriptions.includes(ch.id)) return false;
      if (q) {
        const matchName = ch.name?.toLowerCase().includes(q);
        const matchHandle = ch.handle?.toLowerCase().includes(q);
        const matchBio = ch.bio?.toLowerCase().includes(q);
        if (!matchName && !matchHandle && !matchBio) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'subscribers') {
        return (b.subscriberCount || 0) - (a.subscriberCount || 0);
      }
      if (sortBy === 'videos') {
        return (b.videoCount || 0) - (a.videoCount || 0);
      }
      if (sortBy === 'views') {
        return (b.totalViews || 0) - (a.totalViews || 0);
      }
      // 'popular': composite ranking using verification, subscribers, views, and catalog count
      const scoreA =
        (a.isVerified ? 50000 : 0) +
        (a.subscriberCount || 0) * 2 +
        (a.totalViews || 0) * 0.25 +
        (a.videoCount || 0) * 500;
      const scoreB =
        (b.isVerified ? 50000 : 0) +
        (b.subscriberCount || 0) * 2 +
        (b.totalViews || 0) * 0.25 +
        (b.videoCount || 0) * 500;
      return scoreB - scoreA;
    });
  }, [channels, searchQuery, sortBy, onlySubscribed, userSubscriptions]);

  return (
    <div className="space-y-5 pb-10 select-none max-w-5xl mx-auto">
      {/* Header with Sort By Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-3 border-b border-slate-200 dark:border-[#242B3B]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200/70 dark:hover:bg-[#191E29] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors shrink-0 cursor-pointer"
            title={isEn ? 'Back Home' : 'Rudi Mwanzo'}
            aria-label={isEn ? 'Back Home' : 'Rudi Mwanzo'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {isEn ? 'Creators & Channels' : 'Vituo & Waumbaji'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] truncate">
              {displayedChannels.length} {isEn ? 'channels' : 'vituo'} · {userSubscriptions.length}{' '}
              {isEn ? 'followed' : 'unavyofuatilia'}
            </p>
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#94A3B8] shrink-0">
          <span>{isEn ? 'Sort by:' : 'Panga kwa:'}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
          >
            <option value="popular" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
              {isEn ? 'Recommended' : 'Maarufu Zaidi'}
            </option>
            <option value="subscribers" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
              {isEn ? 'Most subscribers' : 'Wafuatiliaji wengi'}
            </option>
            <option value="views" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
              {isEn ? 'Most views' : 'Matazamio mengi'}
            </option>
            <option value="videos" className="bg-white text-slate-900 dark:bg-[#191E29] dark:text-white">
              {isEn ? 'Most videos' : 'Video nyingi'}
            </option>
          </select>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="flex-1 relative flex items-center min-w-0">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isEn
                ? 'Search channels by name, @handle or bio...'
                : 'Tafuta kituo kwa jina, @handle au maelezo...'
            }
            className="w-full bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#94A3B8]/60 shadow-sm dark:shadow-none focus:outline-none focus:border-[#FF3040] transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setOnlySubscribed((prev) => !prev)}
          className={`min-h-[40px] px-4 rounded-2xl text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            onlySubscribed
              ? 'bg-[#FF3040] border-[#FF3040] text-white shadow-sm'
              : 'bg-white dark:bg-[#151A24] border-slate-200 dark:border-[#242B3B] text-slate-700 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:text-white'
          }`}
        >
          {isEn
            ? `Following (${userSubscriptions.length})`
            : `Ninazofuatilia (${userSubscriptions.length})`}
        </button>
      </div>

      {/* Channel Cards Grid */}
      {displayedChannels.length === 0 ? (
        <div className="py-14 px-4 text-center bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] rounded-2xl max-w-xl mx-auto space-y-3 shadow-sm dark:shadow-none">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-[#1E2534] flex items-center justify-center mx-auto text-slate-500 dark:text-[#94A3B8]">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {searchQuery.trim() || onlySubscribed
              ? isEn
                ? 'No channels match your filter'
                : 'Hakuna chaneli zinazolingana na utafutaji huu'
              : isEn
                ? 'No channels registered yet'
                : 'Hakuna Chaneli Zilizosajiliwa Bado'}
          </p>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
            {searchQuery.trim() || onlySubscribed
              ? isEn
                ? 'Try clearing your search or showing all platform creators.'
                : 'Safisha neno la utafutaji au onyesha vituo vyote.'
              : isEn
                ? 'Be the first creator to launch your official Tazama channel today.'
                : 'Kuwa wa kwanza kuanzisha chaneli yako ya Tazama leo!'}
          </p>
          <div className="pt-1 flex justify-center gap-2">
            {(searchQuery.trim() || onlySubscribed) ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setOnlySubscribed(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isEn ? 'Show All Channels' : 'Onyesha Vituo Vyote'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:text-white text-xs font-semibold dark:border-[#262E3E] transition-all cursor-pointer"
              >
                {isEn ? 'Back Home' : 'Rudi Mwanzo'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedChannels.map((channel) => {
            const isSubscribed = userSubscriptions.includes(channel.id);
            const cleanHandle = channel.handle?.startsWith('@')
              ? channel.handle
              : `@${channel.handle || (channel.name || 'channel').toLowerCase().replace(/\s+/g, '')}`;

            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-[#FF3040]/45 shadow-sm dark:shadow-none transition-colors cursor-pointer group gap-3.5"
              >
                {/* Avatar + Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <img
                    src={channel.avatarUrl || createAvatarSvgDataUri(channel.name)}
                    alt={channel.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createAvatarSvgDataUri(channel.name);
                    }}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-slate-200 dark:ring-[#262E3E] group-hover:ring-[#FF3040] transition-all shrink-0 bg-slate-100 dark:bg-[#141824]"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate group-hover:text-[#FF3040] transition-colors">
                      <span className="truncate">{channel.name}</span>
                      {channel.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </h3>

                    <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] tabular-nums truncate">
                      <span className="font-medium text-slate-700 dark:text-[#CBD5E1]">{cleanHandle}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{formatViews(channel.subscriberCount || 0, language)} {isEn ? 'subs' : 'wafuatiliaji'}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{channel.videoCount || 0} video</span>
                    </p>

                    {channel.bio && (
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] line-clamp-1">
                        {channel.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subscribe Action Button */}
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubscribe(channel.id);
                    }}
                    className={`min-h-[40px] px-4 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer ${
                      isSubscribed
                        ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#232A39] dark:border-[#2E3748] dark:text-[#CBD5E1] dark:hover:text-white'
                        : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-[#FF3040]/25'
                    }`}
                  >
                    {isSubscribed
                      ? isEn
                        ? 'Subscribed'
                        : 'Unafuatilia'
                      : isEn
                        ? 'Subscribe'
                        : 'Fuatilia'}
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
