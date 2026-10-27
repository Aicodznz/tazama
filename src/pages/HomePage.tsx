import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Film, 
  ChevronRight, 
  TrendingUp 
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { StoriesBar } from '../components/home/StoriesBar';
import { MastheadAdBanner } from '../components/ads/MastheadAdBanner';
import { InFeedAdCard } from '../components/ads/InFeedAdCard';
import { formatViews, translations } from '../lib/i18n';
import { VideoItem } from '../types';

interface HomePageProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onNavigate: (page: string) => void;
  onOpenUpload?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onSelectVideo, 
  onSelectChannel,
  onNavigate,
  onOpenUpload
}) => {
  const { 
    videos, 
    shorts, 
    channels, 
    selectedCategory, 
    setSelectedCategory, 
    watchHistory,
    userSubscriptions,
    toggleSubscribe,
    adCampaigns
  } = useVideo();
  
  const { language } = useAuth();
  const t = translations[language];

  const categories = [
    'Zote', 'Muziki', 'Vichekesho', 'Habari', 'Elimu', 'Michezo', 'Teknolojia', 'Mtindo wa Maisha', 'Burudani'
  ];

  const mastheadAd = React.useMemo(() => {
    return adCampaigns.find(a => a.status === 'active' && a.adFormat === 'masthead');
  }, [adCampaigns]);

  const inFeedAds = React.useMemo(() => {
    return adCampaigns.filter(a => a.status === 'active' && ['in_feed', 'sponsored_placement', 'image_ad'].includes(a.adFormat));
  }, [adCampaigns]);

  const filteredVideos = selectedCategory === 'Zote'
    ? videos
    : videos.filter(v => v.category === selectedCategory);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 select-none">
      
      {/* 1. Top Creator Stories Bar (Matching Screenshot 1 & 7) */}
      <StoriesBar
        onSelectChannel={onSelectChannel}
        onOpenUpload={onOpenUpload || (() => onNavigate('studio'))}
        onNavigateShorts={() => onNavigate('shorts')}
      />

      {/* 2. Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-[#191E29] text-[#A7B0C0] hover:text-white hover:bg-[#232A39] border border-[#262E3E]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* YouTube Masthead Video Ad (Top Hero Slot) */}
      {mastheadAd && selectedCategory === 'Zote' && (
        <MastheadAdBanner ad={mastheadAd} />
      )}

      {/* Shorts Vertical Reels Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF3040] to-orange-500 flex items-center justify-center text-white shadow-md">
              <Film className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">Tazama Shorts</h2>
          </div>
          <button 
            onClick={() => onNavigate('shorts')}
            className="flex items-center gap-1 text-xs font-semibold text-[#FF3040] hover:underline"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {shorts.slice(0, 4).map((short) => (
            <div
              key={short.id}
              onClick={() => onSelectVideo(short)}
              className="relative aspect-shorts rounded-2xl overflow-hidden bg-[#191E29] border border-[#262E3E] group cursor-pointer shadow-md hover:shadow-xl transition-transform hover:scale-102"
            >
              <img
                src={short.thumbnailUrl}
                alt={short.title}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3">
                <h4 className="text-xs font-bold text-white line-clamp-2 drop-shadow-md">
                  {short.title}
                </h4>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#A7B0C0]">
                  <span>{formatViews(short.viewsCount, language)} {language === 'sw' ? 'matazamio' : 'views'}</span>
                  <span className="text-[10px] bg-red-600/80 text-white px-1.5 py-0.2 rounded font-semibold">Short</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Recommended Videos Grid */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF3040]" />
            <span>{selectedCategory === 'Zote' ? t.recommended : `${selectedCategory} Tanzania`}</span>
          </h2>
          <span className="text-xs text-[#A7B0C0]">{filteredVideos.length} video</span>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="py-16 text-center text-[#A7B0C0] bg-[#191E29] rounded-2xl border border-[#262E3E]">
            <p className="text-sm">{t.noVideosFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video, idx) => {
              const shouldShowInFeedAd = inFeedAds.length > 0 && (idx === 2 || (idx > 2 && (idx + 1) % 5 === 0));
              const adIndex = Math.floor(idx / 3) % inFeedAds.length;
              const adToShow = inFeedAds[adIndex];

              return (
                <React.Fragment key={video.id}>
                  <VideoCard
                    video={video}
                    onSelectVideo={onSelectVideo}
                    onSelectChannel={onSelectChannel}
                  />
                  {shouldShowInFeedAd && adToShow && (
                    <InFeedAdCard ad={adToShow} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Tanzanian Creators Showcase */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#16C784]" />
            <span>{t.newCreators}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.slice(0, 3).map((ch) => {
            const isSubbed = userSubscriptions.includes(ch.id);
            return (
              <div
                key={ch.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#191E29] border border-[#262E3E] hover:border-[#2E3748] transition-colors"
              >
                <div 
                  onClick={() => onSelectChannel(ch.id)}
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <img
                    src={ch.avatarUrl}
                    alt={ch.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#262E3E]"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1">
                      {ch.name}
                      {ch.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#16C784]" />}
                    </h4>
                    <p className="text-[11px] text-[#A7B0C0] font-mono">
                      {formatViews(ch.subscriberCount, language)} {t.subscribers}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleSubscribe(ch.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ml-2 ${
                    isSubbed
                      ? 'bg-[#232A39] text-[#A7B0C0] hover:text-white'
                      : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-md shadow-[#FF3040]/20'
                  }`}
                >
                  {isSubbed ? t.subscribed : t.subscribe}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
