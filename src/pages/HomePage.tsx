import React from 'react';
import { 
  CheckCircle2, 
  Film, 
  ChevronRight, 
  TrendingUp 
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { VideoThumbnailPreview } from '../components/video/VideoThumbnailPreview';
import { StoriesBar } from '../components/home/StoriesBar';
import { MastheadAdBanner } from '../components/ads/MastheadAdBanner';
import { InFeedAdCard } from '../components/ads/InFeedAdCard';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';
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
    adCampaigns,
    notInterestedIds,
    hiddenChannelIds
  } = useVideo();
  
  const { language, profile, role } = useAuth();
  const t = translations[language];
  const isRegistered = Boolean(profile);

  const categories = [
    'Zote', 'Muziki', 'Vichekesho', 'Habari', 'Elimu', 'Michezo', 'Teknolojia', 'Mtindo wa Maisha', 'Burudani'
  ];

  const mastheadAd = React.useMemo(() => {
    return adCampaigns.find(a => a.status === 'active' && a.adFormat === 'masthead');
  }, [adCampaigns]);

  const inFeedAds = React.useMemo(() => {
    return adCampaigns ? adCampaigns.filter(a => Boolean(a && a.status === 'active' && ['in_feed', 'sponsored_placement', 'image_ad'].includes(a.adFormat))) : [];
  }, [adCampaigns]);

  // Combine all uploaded videos and shorts
  const allContent = React.useMemo(() => {
    const list: VideoItem[] = [];
    const seen = new Set<string>();
    (videos || []).forEach(v => {
      if (v && v.id && v.videoUrl && v.title && !seen.has(v.id)) {
        seen.add(v.id);
        list.push(v);
      }
    });
    (shorts || []).forEach(s => {
      if (s && s.id && s.videoUrl && s.title && !seen.has(s.id)) {
        seen.add(s.id);
        list.push(s);
      }
    });
    return list;
  }, [videos, shorts]);

  const filteredVideos = React.useMemo(() => {
    const isAllowed = (v: VideoItem) =>
      Boolean(
        v &&
          v.id &&
          v.videoUrl &&
          v.title &&
          !notInterestedIds.includes(v.id) &&
          !hiddenChannelIds.includes(v.channelId)
      );

    const validOnly = allContent.filter(isAllowed);
    if (selectedCategory === 'Zote') {
      const validVideos = (videos || []).filter(isAllowed);
      if (validVideos.length > 0) {
        return validVideos;
      }
      return validOnly;
    }
    return validOnly.filter((v) => v.category === selectedCategory);
  }, [selectedCategory, videos, allContent, notInterestedIds, hiddenChannelIds]);

  const visibleShorts = React.useMemo(() => {
    return (shorts || []).filter((s) =>
      Boolean(
        s &&
          s.id &&
          !notInterestedIds.includes(s.id) &&
          !hiddenChannelIds.includes(s.channelId)
      )
    );
  }, [shorts, notInterestedIds, hiddenChannelIds]);

  return (
    <div className="space-y-3 sm:space-y-5 pb-6 select-none">
      
      {/* 1. Top Creator Stories Bar (Matching Screenshot 1 & 7) */}
      <StoriesBar
        onSelectChannel={onSelectChannel}
        onOpenUpload={onOpenUpload || (() => onNavigate('studio'))}
        onNavigateShorts={() => onNavigate('shorts')}
      />

      {/* 2. Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold shadow-md dark:bg-white dark:text-black'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 dark:bg-[#191E29] dark:text-[#A7B0C0] dark:hover:text-white dark:hover:bg-[#232A39] dark:border-[#262E3E]'
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

      {/* Main Videos Grid (Positioned above Tazama Shorts) */}
      <div>
        {filteredVideos.length === 0 ? (
          <div className="py-16 sm:py-20 px-4 text-center bg-white dark:bg-[#141824] rounded-3xl border border-slate-200 dark:border-[#262E3E] space-y-4 max-w-xl mx-auto shadow-sm dark:shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-[#FF3040]/10 border border-[#FF3040]/30 flex items-center justify-center mx-auto text-[#FF3040]">
              <Film className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedCategory !== 'Zote' 
                  ? `Hakuna Video kwenye Kategoria ya "${selectedCategory}"` 
                  : 'Hakuna Video Zilizopakiwa Bado'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed max-w-md mx-auto">
                {selectedCategory !== 'Zote' ? (
                  `Kwa sasa hakuna video iliyochapishwa chini ya kategoria hii. Bofya "Onyesha Zote" ili kuona video zote zilizopakiwa.`
                ) : isRegistered ? (
                  `Jukwaa la Tazama lipo tayari na salama. Karibu ${profile?.displayName || ''}, kuwa wa kwanza kupakia video na kukuza jamii yako ya wafuasi.`
                ) : (
                  `Jukwaa la Tazama lipo tayari na salama. Kuwa mtayarishaji wa kwanza kupakia video au jisajili kwenye mfumo kuanza safari yako.`
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              {selectedCategory !== 'Zote' && (
                <button
                  onClick={() => setSelectedCategory('Zote')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Onyesha Video Zote
                </button>
              )}
              <button
                onClick={onOpenUpload || (() => onNavigate('studio'))}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3040] to-[#E02635] text-white text-xs font-bold shadow-lg shadow-[#FF3040]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Pakia Video Sasa
              </button>
              {!isRegistered && (
                <button
                  onClick={() => onNavigate('register')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-[#191E29] dark:hover:bg-[#232A39] dark:border-[#262E3E] dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Jisajili Kwenye Mfumo
                </button>
              )}
              {isRegistered && (role === 'creator' || profile?.channelId) && (
                <button
                  onClick={() => onNavigate('studio')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-[#191E29] dark:hover:bg-[#232A39] dark:border-[#262E3E] dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fungua Studio
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredVideos.map((video, idx) => {
              const shouldShowInFeedAd = inFeedAds.length > 0 && (idx === 2 || (idx > 2 && (idx + 1) % 5 === 0));
              const adIndex = Math.floor(idx / 3) % inFeedAds.length;
              const adToShow = inFeedAds[adIndex];

              return (
                <React.Fragment key={video.id}>
                  <VideoCard
                    video={video}
                    autoPlayPreview={idx === 0}
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

      {/* Shorts Vertical Reels Section (Below Recommended Videos; only if real shorts exist) */}
      {visibleShorts.length > 0 && (
        <div className="pt-4 sm:pt-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF3040] to-orange-500 flex items-center justify-center text-white shadow-md">
                <Film className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Tazama Shorts</h2>
            </div>
            <button 
              onClick={() => onNavigate('shorts')}
              className="flex items-center gap-1 text-xs font-semibold text-[#FF3040] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {visibleShorts.slice(0, 4).map((short) => (
              <div
                key={short.id}
                className="group flex flex-col gap-1.5 cursor-pointer select-none"
              >
                <VideoThumbnailPreview
                  video={short}
                  onSelectVideo={onSelectVideo}
                  aspectRatioClass="aspect-shorts"
                  className="rounded-2xl group-hover:scale-[1.02] transition-transform shadow-md"
                />
                <div 
                  onClick={() => onSelectVideo(short)}
                  className="px-1"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#FF3040] transition-colors">
                    {short.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0] mt-0.5 tabular-nums">
                    {formatViews(short.viewsCount, language)} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Tanzanian Creators Showcase (Only if channels exist) */}
      {channels.length > 0 && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-[#16C784]" />
              <span>{t.newCreators}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {channels.slice(0, 3).map((ch) => {
              const isSubbed = userSubscriptions.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] hover:border-slate-300 dark:hover:border-[#2E3748] shadow-sm dark:shadow-none transition-colors"
                >
                  <div 
                    onClick={() => onSelectChannel(ch.id)}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <img
                      src={ch.avatarUrl || createAvatarSvgDataUri(ch.name)}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createAvatarSvgDataUri(ch.name);
                      }}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-[#262E3E] bg-slate-100 dark:bg-[#141824]"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                        {ch.name}
                        {ch.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784]" />}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0] font-mono">
                        {formatViews(ch.subscriberCount, language)} {t.subscribers}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSubscribe(ch.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ml-2 ${
                      isSubbed
                        ? 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 dark:bg-[#232A39] dark:text-[#A7B0C0] dark:hover:text-white dark:border-transparent'
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
      )}

    </div>
  );
};
