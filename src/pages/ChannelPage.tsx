import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Tv, 
  Film, 
  Info, 
  Award, 
  Plus, 
  Share2,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Bell,
  Play
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { formatViews, translations } from '../lib/i18n';
import { VideoItem } from '../types';

interface ChannelPageProps {
  channelId?: string;
  onSelectVideo: (video: VideoItem) => void;
  onOpenUpload: () => void;
  onNavigateHome?: () => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({ 
  channelId = 'ch-wasafi', 
  onSelectVideo,
  onOpenUpload,
  onNavigateHome
}) => {
  const { channels, videos, shorts, userSubscriptions, toggleSubscribe } = useVideo();
  const { profile, language } = useAuth();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'home' | 'video' | 'playlist' | 'community' | 'channels' | 'about'>('home');
  const [showBio, setShowBio] = useState<boolean>(false);
  const [hasBell, setHasBell] = useState<boolean>(true);

  const channel = channels.find(c => c.id === channelId) || channels[0];
  const channelVideos = videos.filter(v => v.channelId === channel.id);
  const channelShorts = shorts.filter(s => s.channelId === channel.id);
  const isSubscribed = userSubscriptions.includes(channel.id);
  const isOwner = profile?.uid === channel.ownerId;

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'video', label: 'Video' },
    { id: 'playlist', label: 'Playlist' },
    { id: 'community', label: 'Community' },
    { id: 'channels', label: 'Channels' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="space-y-4 pb-24 select-none max-w-4xl mx-auto">
      
      {/* 1. Header with Back arrow & 3-dots (Matching Screenshot 3) */}
      <div className="flex items-center justify-between pt-1 px-1">
        <button
          onClick={onNavigateHome || (() => window.history.back())}
          className="p-1.5 rounded-full hover:bg-[#191E29] text-[#A7B0C0] hover:text-white transition-colors"
          title="Rudi"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button 
          className="p-1.5 rounded-full hover:bg-[#191E29] text-[#A7B0C0] hover:text-white transition-colors"
          title="Chaguo zaidi"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Banner with Gradient */}
      <div className="relative w-full h-36 sm:h-52 rounded-3xl overflow-hidden bg-[#181C26] border border-[#262E3E]">
        <img
          src={channel.bannerUrl}
          alt={channel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10131B] via-transparent to-transparent" />
      </div>

      {/* 3. Channel Info & Subscribe Row (Matching Screenshot 3: Bell + Red Subscribe button on left, Avatar on right) */}
      <div className="flex items-start justify-between gap-4 px-2 -mt-8 sm:-mt-12 relative z-10">
        
        {/* Left: Subscribe Button + Bell + Bio */}
        <div className="pt-8 sm:pt-12 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHasBell(!hasBell)}
              className={`p-2 rounded-full border transition-all ${
                hasBell ? 'border-[#262E3E] bg-[#181C26] text-amber-400' : 'border-[#262E3E] text-[#A7B0C0]'
              }`}
              title="Pokea Taarifa"
            >
              <Bell className={`w-4 h-4 ${hasBell ? 'fill-amber-400' : ''}`} />
            </button>

            {isOwner ? (
              <button
                onClick={onOpenUpload}
                className="px-5 py-2 rounded-full bg-[#FF3040] hover:bg-[#E02635] text-white font-bold text-xs shadow-md shadow-[#FF3040]/30"
              >
                + Pakia Video
              </button>
            ) : (
              <button
                onClick={() => toggleSubscribe(channel.id)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all shadow-md ${
                  isSubscribed
                    ? 'bg-[#232A39] border border-[#262E3E] text-[#A7B0C0] hover:text-white'
                    : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-[#FF3040]/30'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscrib'}
              </button>
            )}
          </div>

          {/* Biography Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setShowBio(!showBio)}
              className="flex items-center gap-1 text-xs font-bold text-white hover:text-[#FF3040] transition-colors"
            >
              <span>Biography</span>
              {showBio ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <p className="text-[11px] text-[#A7B0C0] font-mono mt-0.5">
              {formatViews(channel.subscriberCount, language)} subscribers . {channel.videoCount} videos
            </p>
          </div>
        </div>

        {/* Right: Creator Avatar (Matching Screenshot 3) */}
        <div className="shrink-0">
          <img
            src={channel.avatarUrl}
            alt={channel.name}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-[#10131B] shadow-2xl"
          />
        </div>

      </div>

      {/* Expanded Bio Box */}
      {showBio && (
        <div className="p-4 rounded-2xl bg-[#181C26] border border-[#262E3E] text-xs text-[#A7B0C0] leading-relaxed mx-2 animate-in fade-in">
          <p className="font-semibold text-white mb-1">{channel.name}</p>
          <p>{channel.bio}</p>
        </div>
      )}

      {/* 4. Horizontal Navigation Tabs (Matching Screenshot 3: Home, Video, Playlist, Community, Channels, About) */}
      <div className="flex items-center gap-6 border-b border-[#262E3E]/60 text-xs font-bold px-2 pt-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 relative transition-colors whitespace-nowrap ${
                isActive ? 'text-white font-extrabold' : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF3040] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 5. Tab Content: "News" Section (Matching Screenshot 3) */}
      {activeTab === 'home' && (
        <div className="space-y-3 px-1 pt-2">
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
            News
          </h3>

          <div className="space-y-4">
            {channelVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="flex gap-3 group cursor-pointer p-2 rounded-2xl hover:bg-[#181C26] transition-colors"
              >
                {/* Thumbnail with corner play badge */}
                <div className="relative w-40 sm:w-48 aspect-video rounded-2xl overflow-hidden bg-[#181C26] border border-[#262E3E] shrink-0">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-[#FF3040] text-white flex items-center justify-center shadow-md">
                    <Play className="w-3 h-3 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-[#FF3040] transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[10px] text-[#A7B0C0] mt-1 font-mono">
                      {formatViews(video.viewsCount, language)} • 26 sep
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1 text-[#A7B0C0] hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1 pt-2">
          {channelVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelectVideo={onSelectVideo}
            />
          ))}
        </div>
      )}

      {activeTab === 'playlist' && (
        <div className="py-12 text-center text-[#A7B0C0] text-xs">
          Hakuna playlist bado. Video mpya zitaongezwa hapa hivi karibuni.
        </div>
      )}

      {activeTab === 'community' && (
        <div className="p-4 rounded-2xl bg-[#181C26] border border-[#262E3E] text-xs text-white space-y-2">
          <p className="font-semibold text-[#FF3040]">Machapisho ya Kijamii (Community)</p>
          <p className="text-[#A7B0C0]">
            Karibuni sana kwenye chaneli yetu ya Tazama! Usisahau kusubscribe na kuwasha kengele ya taarifa.
          </p>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="py-8 text-center text-[#A7B0C0] text-xs">
          Kituo hiki hakijaunganisha chaneli zingine.
        </div>
      )}

      {activeTab === 'about' && (
        <div className="p-5 rounded-2xl bg-[#181C26] border border-[#262E3E] text-xs space-y-3">
          <h4 className="font-bold text-white">Kuhusu Kituo Hiki</h4>
          <p className="text-[#A7B0C0] leading-relaxed">{channel.bio}</p>
          <div className="pt-2 border-t border-[#262E3E] space-y-1.5 text-[#A7B0C0]">
            <p>Jumla ya video: <strong className="text-white">{channel.videoCount}</strong></p>
            <p>Wafuatiliaji: <strong className="text-white">{formatViews(channel.subscriberCount, language)}</strong></p>
            <p>Tarehe ya kujiunga: <strong className="text-white">{channel.joinedDate}</strong></p>
          </div>
        </div>
      )}

    </div>
  );
};
