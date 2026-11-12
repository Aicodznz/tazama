import React, { useState, useMemo } from 'react';
import { Tv, CheckCircle2, ChevronLeft, Film, Video as VideoIcon, ArrowUpRight, Users } from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { VideoItem } from '../types';
import { formatViews } from '../lib/i18n';
import { createAvatarSvgDataUri } from '../lib/mediaPlaceholders';

interface SubscriptionsPageProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onNavigate?: (page: string) => void;
}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({
  onSelectVideo,
  onSelectChannel,
  onNavigate,
}) => {
  const {
    channels,
    videos,
    shorts,
    userSubscriptions,
    toggleSubscribe,
    notInterestedIds,
    hiddenChannelIds,
  } = useVideo();
  const { language } = useAuth();
  const isEn = language === 'en';

  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'videos' | 'shorts'>('all');

  const subbedChannels = useMemo(
    () => (channels || []).filter((c) => Boolean(c && c.id && userSubscriptions.includes(c.id))),
    [channels, userSubscriptions]
  );

  const suggestedChannels = useMemo(() => {
    const nonSubbed = (channels || []).filter(
      (c) => Boolean(c && c.id && !userSubscriptions.includes(c.id))
    );
    return [...nonSubbed]
      .sort((a, b) => (b.subscriberCount || 0) - (a.subscriberCount || 0))
      .slice(0, 6);
  }, [channels, userSubscriptions]);

  const feedItems = useMemo(() => {
    const combined: VideoItem[] = [
      ...(videos || []).map((v) => ({ ...v, isShort: false })),
      ...(shorts || []).map((s) => ({ ...s, isShort: true })),
    ];

    const activeChannelFilter =
      selectedCreatorId !== 'all' && userSubscriptions.includes(selectedCreatorId)
        ? selectedCreatorId
        : 'all';

    return combined
      .filter((item) => {
        if (!item || !item.id || !item.channelId) return false;
        if (!userSubscriptions.includes(item.channelId)) return false;
        if (activeChannelFilter !== 'all' && item.channelId !== activeChannelFilter) return false;
        if (notInterestedIds.includes(item.id) || hiddenChannelIds.includes(item.channelId)) {
          return false;
        }
        if (contentFilter === 'videos' && item.isShort) return false;
        if (contentFilter === 'shorts' && !item.isShort) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }, [
    videos,
    shorts,
    userSubscriptions,
    selectedCreatorId,
    contentFilter,
    notInterestedIds,
    hiddenChannelIds,
  ]);

  const activeCreator = useMemo(
    () => subbedChannels.find((c) => c.id === selectedCreatorId) || null,
    [subbedChannels, selectedCreatorId]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10 select-none">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-3 border-b border-slate-200 dark:border-[#242B3B]">
        <div className="flex items-center gap-2.5 min-w-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200/70 dark:hover:bg-[#191E29] text-slate-600 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title={isEn ? 'Back Home' : 'Rudi Mwanzo'}
              aria-label={isEn ? 'Back Home' : 'Rudi Mwanzo'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {isEn ? 'Subscriptions' : 'Ufuatiliaji Wako'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] truncate">
              {subbedChannels.length > 0
                ? `${subbedChannels.length} ${isEn ? 'followed channels' : 'vituo unavyofuatilia'} · ${feedItems.length} ${isEn ? 'videos' : 'video'}`
                : isEn
                  ? 'Latest drops from creators you follow'
                  : 'Maudhui mapya kutoka kwa waumbaji unaowafuatilia'}
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('channels')}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-[#FF3040]/50 text-xs font-bold text-slate-800 dark:text-white transition-colors shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#FF3040]" />
            <span>{isEn ? 'All Channels' : 'Vituo Vyote'}</span>
          </button>
        )}
      </div>

      {/* Empty State when not subscribed to any channel */}
      {subbedChannels.length === 0 ? (
        <div className="space-y-6">
          <div className="py-12 px-5 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] text-center max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF3040]/10 text-[#FF3040] flex items-center justify-center mx-auto">
              <Tv className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {isEn ? 'You haven’t followed any channels yet' : 'Bado Hujafuatilia Kituo Chochote'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                {isEn
                  ? 'Subscribe to Tanzanian creators below or explore the Channels directory to receive their newest videos and Shorts right here.'
                  : 'Fuatilia waumbaji uwapendao hapa chini au vinjari orodha ya Vituo ili kupata video zao mpya pindi zinapochapishwa.'}
              </p>
            </div>
            {onNavigate && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('channels')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold shadow-md shadow-[#FF3040]/25 transition-all cursor-pointer"
                >
                  <span>{isEn ? 'Browse Channels' : 'Gundua Vituo Vipya'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Recommended Creators Grid for 1-click Subscribe */}
          {suggestedChannels.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isEn ? 'Recommended Creators to Follow' : 'Vituo Vinavyopendekezwa Kufuatilia'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedChannels.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => onSelectChannel(ch.id)}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] hover:border-[#FF3040]/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={ch.avatarUrl || createAvatarSvgDataUri(ch.name)}
                        alt={ch.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = createAvatarSvgDataUri(ch.name);
                        }}
                        className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-[#262E3E]"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate group-hover:text-[#FF3040] transition-colors">
                          <span className="truncate">{ch.name}</span>
                          {ch.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          )}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] truncate tabular-nums">
                          {formatViews(ch.subscriberCount || 0, language)} {isEn ? 'subscribers' : 'wafuatiliaji'} · {ch.videoCount || 0} video
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubscribe(ch.id);
                      }}
                      className="min-h-[38px] px-4 rounded-full bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      {isEn ? 'Subscribe' : 'Fuatilia'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Subscribed Channels Horizontal Strip */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedCreatorId('all')}
              className="flex flex-col items-center gap-1.5 min-w-[68px] shrink-0 group cursor-pointer"
            >
              <div
                className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-all ${
                  selectedCreatorId === 'all'
                    ? 'border-[#FF3040] bg-[#FF3040] text-white shadow-md shadow-[#FF3040]/25'
                    : 'border-slate-200 dark:border-[#242B3B] bg-white dark:bg-[#151A24] text-slate-700 dark:text-[#A7B0C0] group-hover:border-[#FF3040]/60'
                }`}
              >
                <Tv className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-bold truncate max-w-[68px] ${
                  selectedCreatorId === 'all'
                    ? 'text-[#FF3040]'
                    : 'text-slate-700 dark:text-[#A7B0C0]'
                }`}
              >
                {isEn ? 'All' : 'Zote'}
              </span>
            </button>

            {subbedChannels.map((ch) => {
              const isSelected = selectedCreatorId === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedCreatorId(isSelected ? 'all' : ch.id)}
                  className="flex flex-col items-center gap-1.5 min-w-[68px] shrink-0 group cursor-pointer"
                  title={ch.name}
                >
                  <div
                    className={`w-13 h-13 rounded-full p-0.5 transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#FF3040] bg-[#FF3040]/15'
                        : 'ring-1 ring-slate-200 dark:ring-[#242B3B] group-hover:ring-[#FF3040]/60'
                    }`}
                  >
                    <img
                      src={ch.avatarUrl || createAvatarSvgDataUri(ch.name)}
                      alt={ch.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createAvatarSvgDataUri(ch.name);
                      }}
                      className="w-full h-full rounded-full object-cover bg-slate-100 dark:bg-[#10131B]"
                    />
                  </div>
                  <span
                    className={`text-[11px] font-semibold truncate max-w-[72px] ${
                      isSelected
                        ? 'text-[#FF3040] font-bold'
                        : 'text-slate-700 dark:text-[#CBD5E1]'
                    }`}
                  >
                    {ch.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Strip + Active Channel Quick Link */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200 dark:border-[#242B3B]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all' as const, label: isEn ? 'All Uploads' : 'Zote', icon: null },
                { id: 'videos' as const, label: 'Video', icon: VideoIcon },
                { id: 'shorts' as const, label: 'Shorts', icon: Film },
              ].map((tab) => {
                const isActive = contentFilter === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setContentFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 pb-2.5 px-1 text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'border-[#FF3040] text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeCreator && (
              <button
                type="button"
                onClick={() => onSelectChannel(activeCreator.id)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF3040] hover:underline mb-2 cursor-pointer whitespace-nowrap"
              >
                <span>{isEn ? `Open ${activeCreator.name}` : `Fungua ${activeCreator.name}`}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subscribed Videos Grid */}
          {feedItems.length === 0 ? (
            <div className="py-12 px-5 rounded-2xl bg-white dark:bg-[#151A24] border border-slate-200 dark:border-[#242B3B] text-center space-y-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {activeCreator
                  ? isEn
                    ? `${activeCreator.name} has no matching uploads yet`
                    : `${activeCreator.name} bado hana video katika kundi hili`
                  : isEn
                    ? 'No matching uploads from followed channels'
                    : 'Hakuna video zilizopatikana kwa sasa'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {selectedCreatorId !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCreatorId('all');
                      setContentFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    {isEn ? 'Show All Subscriptions' : 'Onyesha Vituo Vyote'}
                  </button>
                )}
                {activeCreator && (
                  <button
                    type="button"
                    onClick={() => onSelectChannel(activeCreator.id)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#232A39] text-slate-800 dark:text-white text-xs font-semibold cursor-pointer"
                  >
                    {isEn ? 'Visit Channel Page' : 'Tembelea Kituo'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {feedItems.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onSelectVideo={onSelectVideo}
                  onSelectChannel={onSelectChannel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
