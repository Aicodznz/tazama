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
  Play,
  Check,
  Globe,
  Radio,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { formatViews, translations } from '../lib/i18n';
import { Channel, VideoItem } from '../types';
import { createAvatarSvgDataUri } from '../lib/mediaPlaceholders';

interface ChannelPageProps {
  channelId?: string;
  onSelectVideo: (video: VideoItem) => void;
  onOpenUpload: () => void;
  onNavigateHome?: () => void;
  onNavigate?: (page: string) => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({ 
  channelId = 'ch-wasafi', 
  onSelectVideo,
  onOpenUpload,
  onNavigateHome,
  onNavigate
}) => {
  const { channels, videos, shorts, userSubscriptions, toggleSubscribe } = useVideo();
  const { profile, language } = useAuth();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'home' | 'video' | 'shorts' | 'playlist' | 'community' | 'about'>('home');
  const [showBio, setShowBio] = useState<boolean>(false);
  const [hasBell, setHasBell] = useState<boolean>(true);
  const [bannerError, setBannerError] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<boolean>(false);

  // Fallback Channel Profile if none is found
  const fallbackChannel: Channel = {
    id: channelId || 'ch-mwamba',
    ownerId: profile?.uid || 'creator',
    handle: '@' + (channelId || 'mwamba').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
    name: channelId === 'ch-1793679828957' || channelId === 'mwamba' ? 'mwamba' : (channelId || 'Kituo cha Tazama'),
    bio: 'Kituo rasmi cha video, burudani na ubunifu kwenye jukwaa la Tazama.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    subscriberCount: 1,
    videoCount: 1,
    isVerified: true,
    isMonetized: false,
    totalViews: 0,
    joinedDate: '2026-01-01'
  };

  // Find channel safely matching id, handle, or name
  const channel = (channels && channels.length > 0 
    ? (channels.find(c => c && (
        c.id === channelId || 
        (c.name && (channelId || '') && c.name.toLowerCase() === (channelId || '').toLowerCase()) ||
        (c.handle && channelId && c.handle.toLowerCase() === channelId.toLowerCase())
      )) || channels[0]) 
    : null) || fallbackChannel;

  // Find all channel videos (long format)
  const channelVideos = videos ? videos.filter(v => 
    Boolean(v && channel && (
      v.channelId === channel.id || 
      (v.channelName && channel.name && v.channelName.toLowerCase() === channel.name.toLowerCase())
    ))
  ) : [];

  // Find all channel shorts (vertical format)
  const channelShorts = shorts ? shorts.filter(s => 
    Boolean(s && channel && (
      s.channelId === channel.id || 
      (s.channelName && channel.name && s.channelName.toLowerCase() === channel.name.toLowerCase())
    ))
  ) : [];

  // Combine both sets so nothing is hidden
  const allChannelVideos = [...channelVideos, ...channelShorts];
  const totalVideoCount = allChannelVideos.length;

  const isSubscribed = Boolean(channel?.id && userSubscriptions.includes(channel.id));
  const isOwner = Boolean(profile?.uid && channel && (profile.uid === channel.ownerId || profile.channelId === channel.id));

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    } catch {}
  };

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'video', label: `Video (${channelVideos.length})` },
    { id: 'shorts', label: `Shorts (${channelShorts.length})` },
    { id: 'playlist', label: 'Playlist' },
    { id: 'community', label: 'Community' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="space-y-4 pb-24 select-none max-w-5xl mx-auto px-2 sm:px-4">
      
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onNavigateHome || (() => window.history.back())}
          className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-[#191E29] text-[#A7B0C0] hover:text-white transition-colors"
          title="Rudi Mwanzo"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs font-semibold hidden sm:inline">Rudi Nyumbani</span>
        </button>

        <div className="flex items-center gap-2">
          {copyToast && (
            <span className="text-[11px] font-bold text-[#16C784] bg-[#16C784]/15 px-3 py-1 rounded-full border border-[#16C784]/30 animate-in fade-in">
              Linki ya Chaneli Imenakiliwa!
            </span>
          )}
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191E29] hover:bg-[#232A39] border border-[#262E3E] text-xs font-medium text-[#A7B0C0] hover:text-white transition-colors"
            title="Shiriki Chaneli"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shiriki</span>
          </button>
        </div>
      </div>

      {/* 2. Channel Banner with Afro-Futuristic Fallback */}
      <div className="relative w-full h-36 sm:h-56 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-[#1E1428] via-[#161C2C] to-[#0E131E] border border-[#262E3E] shadow-xl">
        {!bannerError && channel.bannerUrl ? (
          <img
            src={channel.bannerUrl}
            alt=""
            onError={() => setBannerError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#FF3040]/20 via-[#191E29] to-[#121622] p-6 text-center">
            <div className="space-y-1">
              <span className="text-xl sm:text-3xl font-black text-white/90 tracking-wide uppercase drop-shadow">
                {channel.name}
              </span>
              <p className="text-xs text-[#A7B0C0]">Kituo Rasmi cha Maudhui ya Tazama</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10131B] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 3. Channel Identity & Details Section */}
      <div className="relative z-10 px-2 sm:px-4 -mt-10 sm:-mt-14 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          
          {/* Avatar and Channel Meta */}
          <div className="flex items-end gap-3 sm:gap-5">
            {/* Creator Avatar with Ring */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-[#10131B] bg-[#181C26] shadow-2xl">
                {!avatarError && channel.avatarUrl ? (
                  <img
                    src={channel.avatarUrl}
                    alt={channel.name}
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#FF3040] to-purple-600 text-white font-black text-3xl">
                    {(channel.name || 'M')[0].toUpperCase()}
                  </div>
                )}
              </div>
              {channel.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-[#10131B] shadow-md" title="Imethibitishwa">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Names & Metrics */}
            <div className="space-y-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  {channel.name}
                </h1>
                {channel.isVerified && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Imethibitishwa</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#A7B0C0] font-mono flex flex-wrap items-center gap-2">
                <span className="text-[#FF3040] font-bold">
                  {channel.handle ? (channel.handle.startsWith('@') ? channel.handle : `@${channel.handle}`) : `@${(channel.name || 'channel').toLowerCase().replace(/\s+/g, '')}`}
                </span>
                <span>&bull;</span>
                <span className="text-white font-semibold">{totalVideoCount} video</span>
                <span>&bull;</span>
                <span>{formatViews(channel.subscriberCount || 1, language)} wafuatiliaji</span>
              </p>
            </div>
          </div>

          {/* Action Buttons: Subscribe / Upload */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {isOwner ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenUpload}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF3040] hover:bg-[#E02635] text-white font-bold text-xs shadow-lg shadow-[#FF3040]/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pakia Video Mpya</span>
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('studio')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#191E29] hover:bg-[#232A39] border border-[#262E3E] text-white font-semibold text-xs transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#16C784]" />
                    <span>Studio Yangu</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHasBell(!hasBell)}
                  className={`p-2.5 rounded-full border transition-all active:scale-95 ${
                    hasBell 
                      ? 'border-[#262E3E] bg-[#191E29] text-amber-400 shadow-md' 
                      : 'border-[#262E3E] text-[#A7B0C0] hover:text-white'
                  }`}
                  title={hasBell ? 'Taarifa zimewashwa' : 'Washa taarifa'}
                >
                  <Bell className={`w-4 h-4 ${hasBell ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  onClick={() => toggleSubscribe(channel.id)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 ${
                    isSubscribed
                      ? 'bg-[#232A39] border border-[#262E3E] text-[#CBD5E1] hover:text-white hover:bg-[#2E3748]'
                      : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-lg shadow-[#FF3040]/30'
                  }`}
                >
                  {isSubscribed ? 'Unamfuatilia' : 'Fuatilia (Subscribe)'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bio Snippet */}
        <div className="pt-1">
          <p className="text-xs text-[#CBD5E1] max-w-3xl leading-relaxed">
            {channel.bio || 'Karibu kwenye kituo rasmi cha Tazama! Tazama video mpya, habari, burudani, na kazi bora za waumbaji wetu wa Tanzania.'}
          </p>
        </div>
      </div>

      {/* 4. Horizontal Navigation Tabs */}
      <div className="flex items-center gap-5 border-b border-[#262E3E] text-xs font-bold px-2 pt-3 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 relative transition-colors whitespace-nowrap ${
                isActive ? 'text-white font-extrabold' : 'text-[#A7B0C0] hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF3040] rounded-full shadow-sm shadow-[#FF3040]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 5. TAB: HOME (Main Overview of Channel Content) */}
      {activeTab === 'home' && (
        <div className="space-y-6 px-1 pt-3">
          
          {/* Channel Shorts Shelf (If channel has any shorts) */}
          {channelShorts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF3040] to-orange-500 flex items-center justify-center text-white">
                  <Film className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  Shorts za {channel.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {channelShorts.map((short) => (
                  <div
                    key={short.id}
                    onClick={() => onSelectVideo(short)}
                    className="relative aspect-shorts rounded-2xl overflow-hidden bg-[#191E29] border border-[#262E3E] group cursor-pointer shadow-md hover:scale-102 transition-transform"
                  >
                    <img
                      src={short.thumbnailUrl}
                      alt={short.title}
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                      <h4 className="text-xs font-bold text-white line-clamp-2 drop-shadow">
                        {short.title}
                      </h4>
                      <p className="text-[10px] text-[#A7B0C0] mt-0.5">
                        {formatViews(short.viewsCount, language)} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Channel All Uploaded Videos (Including both horizontal and any uploaded video) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#FF3040]" />
              <span>Video Zote za {channel.name} ({totalVideoCount})</span>
            </h3>

            {allChannelVideos.length === 0 ? (
              <div className="py-14 text-center bg-[#191E29]/60 rounded-3xl border border-[#262E3E] space-y-3 p-6 max-w-lg mx-auto">
                <Tv className="w-10 h-10 text-[#A7B0C0] mx-auto opacity-60" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Bado Hakuna Video Zilizopakiwa</h4>
                  <p className="text-xs text-[#A7B0C0] leading-relaxed">
                    Chaneli ya {channel.name} bado haijachapisha video zozote. Fuatilia chaneli hii ili kuwa wa kwanza kutazama pindi video mpya itakapopakiwa.
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={onOpenUpload}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF3040] hover:bg-[#E02635] text-white text-xs font-bold shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Pakia Video ya Kwanza</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allChannelVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => onSelectVideo(video)}
                    className="group bg-[#191E29] border border-[#262E3E] hover:border-[#FF3040]/40 rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all flex flex-col justify-between"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-black overflow-hidden">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {video.isShort && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FF3040] text-white text-[10px] font-extrabold shadow">
                          Short
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
                        {Math.floor(video.durationSeconds / 60)}:{('0' + (video.durationSeconds % 60)).slice(-2)}
                      </div>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#FF3040] text-white flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-3 space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-[#FF3040] transition-colors leading-snug">
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-[#A7B0C0] font-mono flex items-center gap-1.5">
                        <span>{formatViews(video.viewsCount, language)} views</span>
                        <span>&bull;</span>
                        <span className="text-[#16C784] font-semibold">{video.category || 'Burudani'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB: VIDEO */}
      {activeTab === 'video' && (
        <div className="space-y-4 px-1 pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Video Zote ({allChannelVideos.length})</h3>
            <span className="text-xs text-[#A7B0C0] font-mono">{channel.name}</span>
          </div>

          {allChannelVideos.length === 0 ? (
            <div className="py-16 text-center text-[#A7B0C0] text-xs bg-[#191E29]/40 rounded-2xl border border-[#262E3E]">
              Bado hakuna video zilizopakiwa kwenye chaneli hii.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allChannelVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onSelectVideo={onSelectVideo}
                  onSelectChannel={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB: SHORTS */}
      {activeTab === 'shorts' && (
        <div className="space-y-4 px-1 pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Shorts za {channel.name} ({channelShorts.length})</h3>
          </div>

          {channelShorts.length === 0 ? (
            <div className="py-16 text-center text-[#A7B0C0] text-xs bg-[#191E29]/40 rounded-2xl border border-[#262E3E]">
              Kituo hiki hakijachapisha video fupi (Shorts) bado.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {channelShorts.map((short) => (
                <div
                  key={short.id}
                  onClick={() => onSelectVideo(short)}
                  className="relative aspect-shorts rounded-2xl overflow-hidden bg-[#191E29] border border-[#262E3E] group cursor-pointer shadow-md hover:scale-102 transition-transform"
                >
                  <img
                    src={short.thumbnailUrl}
                    alt={short.title}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                    <h4 className="text-xs font-bold text-white line-clamp-2 drop-shadow">
                      {short.title}
                    </h4>
                    <p className="text-[10px] text-[#A7B0C0] mt-0.5">
                      {formatViews(short.viewsCount, language)} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. TAB: PLAYLIST */}
      {activeTab === 'playlist' && (
        <div className="py-16 text-center bg-[#191E29]/40 rounded-3xl border border-[#262E3E] space-y-2 p-6">
          <Film className="w-8 h-8 text-[#A7B0C0] mx-auto opacity-60" />
          <p className="text-xs text-[#A7B0C0]">
            Bado hakuna orodha (playlist) iliyoundwa na chaneli hii.
          </p>
        </div>
      )}

      {/* 9. TAB: COMMUNITY */}
      {activeTab === 'community' && (
        <div className="p-5 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF3040]" />
            <h4 className="text-sm font-bold text-white">Machapisho ya Kijamii (Community)</h4>
          </div>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Karibuni kwenye jamii rasmi ya {channel.name}! Endelea kufuatilia video zetu, weka maoni, na ushiriki na marafiki.
          </p>
          <div className="pt-2 text-[11px] text-[#A7B0C0] font-mono">
            Imechapishwa na {channel.name} &bull; Tazama Platform
          </div>
        </div>
      )}

      {/* 10. TAB: ABOUT */}
      {activeTab === 'about' && (
        <div className="p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-5 shadow-xl">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Kuhusu Kituo cha {channel.name}</h4>
            <p className="text-xs text-[#A7B0C0] leading-relaxed">
              {channel.bio || 'Chaneli rasmi ya video na ubunifu kwenye Tazama.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#262E3E] text-xs">
            <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
              <span className="text-[10px] text-[#A7B0C0] font-semibold block">Utambulisho wa Kituo</span>
              <span className="font-bold text-white text-sm font-mono">{channel.handle || `@${channel.name}`}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
              <span className="text-[10px] text-[#A7B0C0] font-semibold block">Jumla ya Video</span>
              <span className="font-bold text-white text-sm font-mono">{totalVideoCount} video</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
              <span className="text-[10px] text-[#A7B0C0] font-semibold block">Wafuatiliaji (Subscribers)</span>
              <span className="font-bold text-[#16C784] text-sm font-mono">{formatViews(channel.subscriberCount || 1, language)}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
              <span className="text-[10px] text-[#A7B0C0] font-semibold block">Nchi & Eneo</span>
              <span className="font-bold text-white text-sm">Tanzania 🇹🇿</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
              <span className="text-[10px] text-[#A7B0C0] font-semibold block">Hali ya Uthibitisho</span>
              <span className={`font-bold text-xs ${channel.isVerified ? 'text-blue-400' : 'text-[#A7B0C0]'}`}>
                {channel.isVerified ? 'Imethibitishwa Rasmi (Verified)' : 'Haijathibitishwa'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-1">
              <span className="text-[10px] text-[#A7B0C0] font-semibold block">Tarehe ya Kuanzishwa</span>
              <span className="font-bold text-white text-xs font-mono">{channel.joinedDate || '2026-01-01'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
