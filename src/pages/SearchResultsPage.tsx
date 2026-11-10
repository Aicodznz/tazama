import React, { useState } from 'react';
import { 
  Search, 
  Film, 
  Play, 
  CheckCircle2, 
  Users, 
  Filter, 
  Clock, 
  Eye, 
  TrendingUp,
  Radio,
  ArrowRight
} from 'lucide-react';
import { VideoItem } from '../types';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatViews, formatDuration, formatRelativeTime, translations } from '../lib/i18n';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';
import { VideoThumbnailPreview } from '../components/video/VideoThumbnailPreview';

interface SearchResultsPageProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onNavigateHome: () => void;
}

type SearchFilterType = 'all' | 'videos' | 'shorts' | 'channels' | 'live';

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  onSelectVideo,
  onSelectChannel,
  onNavigateHome
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    videos, 
    shorts, 
    channels, 
    userSubscriptions, 
    toggleSubscribe 
  } = useVideo();
  const { language } = useAuth();
  const t = translations[language];

  const [activeFilter, setActiveFilter] = useState<SearchFilterType>('all');
  const [localInput, setLocalInput] = useState(searchQuery);

  const queryClean = (searchQuery || '').trim().toLowerCase();

  // Filter Videos
  const matchingVideos = React.useMemo(() => {
    if (!videos) return [];
    if (!queryClean) return videos.filter(Boolean);
    return videos.filter(v => 
      v && (
        v.title?.toLowerCase().includes(queryClean) ||
        v.channelName?.toLowerCase().includes(queryClean) ||
        v.category?.toLowerCase().includes(queryClean) ||
        (Array.isArray(v.tags) && v.tags.some(tag => tag?.toLowerCase().includes(queryClean))) ||
        v.description?.toLowerCase().includes(queryClean)
      )
    );
  }, [videos, queryClean]);

  // Filter Shorts
  const matchingShorts = React.useMemo(() => {
    if (!shorts) return [];
    if (!queryClean) return shorts.filter(Boolean);
    return shorts.filter(s => 
      s && (
        s.title?.toLowerCase().includes(queryClean) ||
        s.channelName?.toLowerCase().includes(queryClean) ||
        (Array.isArray(s.tags) && s.tags.some(tag => tag?.toLowerCase().includes(queryClean)))
      )
    );
  }, [shorts, queryClean]);

  // Filter Channels
  const matchingChannels = React.useMemo(() => {
    if (!channels) return [];
    if (!queryClean) return channels.filter(Boolean);
    return channels.filter(ch => 
      ch && (
        ch.name?.toLowerCase().includes(queryClean) ||
        ch.handle?.toLowerCase().includes(queryClean) ||
        ch.bio?.toLowerCase().includes(queryClean)
      )
    );
  }, [channels, queryClean]);

  // Live Videos
  const matchingLive = React.useMemo(() => {
    return matchingVideos ? matchingVideos.filter(v => Boolean(v && v.viewsCount > 500000)) : [];
  }, [matchingVideos]);

  const totalResultsCount = matchingVideos.length + matchingShorts.length + matchingChannels.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput.trim()) {
      setSearchQuery(localInput.trim());
    }
  };

  const quickSuggestions = [
    'Wasafi', 'Diamond Platnumz', 'Millard Ayo', 'SGR Treni', 'Simba vs Yanga', 'Swahili Techies', 'Serengeti 4K', 'Joti TV'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-6 select-none">
      
      {/* Search Header Bar with Input and Filter Chips */}
      <div className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
        
        {/* Search bar inside page for mobile or direct refiltering */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Tafuta video, mtayarishaji, neno kuu, au aina ya maudhui..."
            className="w-full bg-slate-50 dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] rounded-2xl py-3 pl-4 pr-12 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A7B0C0] focus:outline-none focus:border-[#FF3040] focus:ring-1 focus:ring-[#FF3040] transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-2.5 rounded-xl bg-[#FF3040] hover:bg-[#E02635] text-white transition-colors"
            title="Tafuta"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>

        {/* Query Summary & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-[#262E3E]/60">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-[#FF3040]" />
              <span>Matokeo ya Utafutaji wa:</span>
              <span className="text-[#FF3040]">&ldquo;{searchQuery || 'Zote'}&rdquo;</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0] font-mono mt-0.5">
              Matokeo {totalResultsCount} yamepatikana
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-black'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
              }`}
            >
              Zote ({totalResultsCount})
            </button>
            <button
              onClick={() => setActiveFilter('videos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'videos'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-black'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
              }`}
            >
              Video ({matchingVideos.length})
            </button>
            <button
              onClick={() => setActiveFilter('shorts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'shorts'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-black'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
              }`}
            >
              Shorts ({matchingShorts.length})
            </button>
            <button
              onClick={() => setActiveFilter('channels')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'channels'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-black'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
              }`}
            >
              Chaneli ({matchingChannels.length})
            </button>
            <button
              onClick={() => setActiveFilter('live')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'live'
                  ? 'bg-[#FF3040] text-white shadow-md shadow-[#FF3040]/30'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
              }`}
            >
              Mubashara ({matchingLive.length})
            </button>
          </div>
        </div>

      </div>

      {/* No Results Empty State */}
      {totalResultsCount === 0 && (
        <div className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-sm dark:shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-[#FF3040]/10 border border-[#FF3040]/25 flex items-center justify-center mx-auto text-[#FF3040]">
            <Search className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Hakuna Matokeo Yaliyopatikana
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
              Hatukuweza kupata video, shorts, au kituo kinacholingana na &ldquo;{searchQuery}&rdquo;. Hakikisha maneno yameandikwa kwa usahihi au chagua mada zilizopendekezwa hapa chini.
            </p>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">Mapendekezo ya Haraka:</p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
              {quickSuggestions.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setLocalInput(term);
                    setSearchQuery(term);
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-800 hover:text-slate-900 dark:bg-[#191E29] dark:hover:bg-[#232A39] dark:border-[#262E3E] dark:text-white/90 dark:hover:text-white transition-all hover:scale-105 cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onNavigateHome}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-[#232A39] dark:hover:bg-[#2E3748] dark:text-white text-xs font-bold dark:border-[#262E3E] transition-all"
            >
              Rudi Ukurasa wa Kwanza
            </button>
          </div>
        </div>
      )}

      {/* 1. MATCHING CHANNELS SECTION (If channels matched and filter includes channels) */}
      {(activeFilter === 'all' || activeFilter === 'channels') && matchingChannels.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
            <span>Chaneli Zinazolingana</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchingChannels.map((channel) => {
              const isSubscribed = userSubscriptions.includes(channel.id);
              return (
                <div
                  key={channel.id}
                  className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] hover:border-slate-300 dark:hover:border-[#38445C] rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors shadow-sm dark:shadow-lg"
                >
                  <div 
                    onClick={() => onSelectChannel(channel.id)}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <img
                      src={channel.avatarUrl || createAvatarSvgDataUri(channel.name)}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createAvatarSvgDataUri(channel.name);
                      }}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-[#262E3E] shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                        <span>{channel.name}</span>
                        {channel.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-[#A7B0C0] font-mono">
                        {channel.handle} &bull; {formatViews(channel.subscriberCount, language)} {t.subscribers}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#A7B0C0] line-clamp-1 mt-0.5">
                        {channel.bio}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSubscribe(channel.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 shadow-sm ${
                      isSubscribed
                        ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-[#232A39] dark:text-[#A7B0C0] dark:hover:text-white dark:border-[#262E3E]'
                        : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-[#FF3040]/25'
                    }`}
                  >
                    {isSubscribed ? t.subscribed : t.subscribe}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MATCHING SHORTS SECTION */}
      {(activeFilter === 'all' || activeFilter === 'shorts') && matchingShorts.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-[#FF3040]" />
              <span>Tazama Shorts ({matchingShorts.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {matchingShorts.map((short) => (
              <div
                key={short.id}
                onClick={() => onSelectVideo(short)}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 dark:bg-[#141824] border border-slate-200 dark:border-[#262E3E] group cursor-pointer shadow-md hover:shadow-xl transition-transform hover:scale-102"
              >
                <img
                  src={short.thumbnailUrl || createThumbnailSvgDataUri(short.title, 'Shorts')}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = createThumbnailSvgDataUri(short.title, 'Shorts');
                  }}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col justify-end p-2.5">
                  <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                    {short.title}
                  </h4>
                  <p className="text-[10px] text-slate-300 mt-1 font-mono">
                    {formatViews(short.viewsCount, language)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MATCHING VIDEOS SECTION */}
      {(activeFilter === 'all' || activeFilter === 'videos' || activeFilter === 'live') && (
        <div className="space-y-3 pt-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-[#FF3040] fill-[#FF3040]" />
            <span>
              {activeFilter === 'live' 
                ? `Maudhui ya Mubashara (${matchingLive.length})` 
                : `Video Zilizopatikana (${matchingVideos.length})`}
            </span>
          </h2>

          <div className="space-y-4">
            {(activeFilter === 'live' ? matchingLive : matchingVideos).map((video) => {
              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  className="group flex flex-col sm:flex-row gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#141824] dark:hover:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] hover:border-slate-300 dark:hover:border-[#38445C] cursor-pointer transition-all duration-200 shadow-sm dark:shadow-md"
                >
                  {/* Video Thumbnail Hover Preview */}
                  <div className="w-full sm:w-64 sm:min-w-[256px] shrink-0">
                    <VideoThumbnailPreview
                      video={video}
                      onSelectVideo={onSelectVideo}
                      aspectRatioClass="aspect-video"
                      className="rounded-xl overflow-hidden"
                    />
                  </div>

                  {/* Video Meta Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#FF3040] transition-colors line-clamp-2 leading-snug">
                        {video.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#A7B0C0] font-mono mt-1">
                        <span>{formatViews(video.viewsCount, language)} {language === 'sw' ? 'matazamio' : 'views'}</span>
                        <span>&bull;</span>
                        <span>{formatRelativeTime(video.createdAt, language)}</span>
                      </div>

                      {/* Channel Info Row */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectChannel(video.channelId);
                        }}
                        className="flex items-center gap-2 mt-2.5 hover:text-slate-900 dark:hover:text-white cursor-pointer w-fit"
                      >
                        <img
                          src={video.channelAvatar || createAvatarSvgDataUri(video.channelName)}
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = createAvatarSvgDataUri(video.channelName);
                          }}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#262E3E]"
                        />
                        <span className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:text-white">
                          {video.channelName}
                        </span>
                        {video.isChannelVerified && (
                          <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>

                      {/* Description Snippet (Desktop) */}
                      <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 mt-2 leading-relaxed hidden sm:block">
                        {video.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {video.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag}
                            className="text-[10px] font-mono text-slate-600 dark:text-[#A7B0C0] bg-slate-100 dark:bg-[#10131B] px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#262E3E]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
