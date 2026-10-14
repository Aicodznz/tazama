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
  Eye
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
}

export const ChannelPage: React.FC<ChannelPageProps> = ({ 
  channelId = 'ch-wasafi', 
  onSelectVideo,
  onOpenUpload 
}) => {
  const { channels, videos, shorts, userSubscriptions, toggleSubscribe } = useVideo();
  const { profile, language } = useAuth();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'about'>('videos');

  const channel = channels.find(c => c.id === channelId) || channels[0];
  const channelVideos = videos.filter(v => v.channelId === channel.id);
  const channelShorts = shorts.filter(s => s.channelId === channel.id);
  const isSubscribed = userSubscriptions.includes(channel.id);
  const isOwner = profile?.uid === channel.ownerId;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Banner */}
      <div className="relative w-full h-40 sm:h-56 md:h-64 rounded-3xl overflow-hidden bg-[#191E29] border border-[#262E3E]">
        <img
          src={channel.bannerUrl}
          alt={channel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Channel Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2 -mt-10 sm:-mt-14 relative z-10">
        <div className="flex items-end gap-4">
          <img
            src={channel.avatarUrl}
            alt={channel.name}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-[#10131B] shadow-2xl"
          />
          <div className="mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              {channel.name}
              {channel.isVerified && <CheckCircle2 className="w-5 h-5 text-[#16C784]" />}
            </h1>
            <p className="text-xs text-[#A7B0C0] font-mono mt-0.5">
              {channel.handle} • {formatViews(channel.subscriberCount, language)} {t.subscribers} • {channel.videoCount} video
            </p>
          </div>
        </div>

        {/* Subscribe / Manage Channel Button */}
        <div className="flex items-center gap-2.5">
          {isOwner ? (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF3040] text-white font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Pakia Video</span>
            </button>
          ) : (
            <button
              onClick={() => toggleSubscribe(channel.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                isSubscribed
                  ? 'bg-[#232A39] text-[#A7B0C0] hover:text-white'
                  : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-lg shadow-[#FF3040]/30'
              }`}
            >
              {isSubscribed ? t.subscribed : t.subscribe}
            </button>
          )}

          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="p-2.5 rounded-full bg-[#191E29] border border-[#262E3E] text-[#A7B0C0] hover:text-white"
            title="Shiriki Kituo"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#262E3E] text-xs font-bold pt-2">
        {[
          { id: 'videos', label: 'Video Kamili', icon: Tv },
          { id: 'shorts', label: 'Shorts', icon: Film },
          { id: 'about', label: 'Kuhusu Kituo', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
                isActive 
                  ? 'border-[#FF3040] text-white' 
                  : 'border-transparent text-[#A7B0C0] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {channelVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelectVideo={onSelectVideo}
            />
          ))}
        </div>
      )}

      {activeTab === 'shorts' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {channelShorts.map((short) => (
            <div
              key={short.id}
              onClick={() => onSelectVideo(short)}
              className="relative aspect-shorts rounded-2xl overflow-hidden bg-[#191E29] border border-[#262E3E] cursor-pointer group hover:scale-102 transition-transform"
            >
              <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <h4 className="text-xs font-bold text-white line-clamp-2">{short.title}</h4>
                <span className="text-[10px] text-[#A7B0C0] mt-1 font-mono">{formatViews(short.viewsCount, language)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-4 max-w-2xl text-xs">
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Maelezo (Bio)</h3>
            <p className="text-[#A7B0C0] leading-relaxed">{channel.bio}</p>
          </div>
          <div className="pt-3 border-t border-[#262E3E] space-y-2 text-[#A7B0C0]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF3040]" />
              <span>Kimejiunga: {channel.joinedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#16C784]" />
              <span>Jumla ya Matazamio: {formatViews(channel.totalViews, language)}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
