import React, { useState } from 'react';
import {
  CheckCircle2,
  Tv,
  Film,
  Plus,
  Share2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Bell,
  Check,
  Radio,
  Sliders
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoThumbnailPreview } from '../components/video/VideoThumbnailPreview';
import { formatViews, formatRelativeTime } from '../lib/i18n';
import { Channel, VideoItem } from '../types';
import { createAvatarSvgDataUri, createThumbnailSvgDataUri } from '../lib/mediaPlaceholders';

interface ChannelPageProps {
  channelId?: string;
  onSelectVideo: (video: VideoItem) => void;
  onOpenUpload: () => void;
  onNavigateHome?: () => void;
  onNavigate?: (page: string) => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({
  channelId = 'ch-lucifer-donghua-tz',
  onSelectVideo,
  onOpenUpload,
  onNavigateHome,
  onNavigate
}) => {
  const { channels, videos, shorts, userSubscriptions, toggleSubscribe } = useVideo();
  const { profile, language } = useAuth();

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
    avatarUrl: createAvatarSvgDataUri(channelId || 'Tazama'),
    bannerUrl: '',
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

  const allChannelVideos = [...channelVideos, ...channelShorts];
  const totalVideoCount = allChannelVideos.length;

  const isSubscribed = Boolean(channel?.id && userSubscriptions.includes(channel.id));
  const isOwner = Boolean(profile?.uid && channel && (profile.uid === channel.ownerId || profile.channelId === channel.id));

  const bioText = channel.bio || 'Karibu kwenye kituo rasmi cha Tazama! Tazama video mpya, habari, burudani, na kazi bora za waumbaji wetu wa Tanzania.';
  const isLongBio = bioText.length > 105;

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
    <div className="select-none max-w-5xl mx-auto pb-8">

      {/* 1. Unified Channel Banner + Identity Header Card */}
      <div className="bg-white dark:bg-[#141824] sm:rounded-3xl border-b sm:border border-slate-200 dark:border-[#262E3E] shadow-sm dark:shadow-xl overflow-hidden">

        {/* Edge-to-Edge Banner with Floating Top Controls */}
        <div className="relative w-full h-36 sm:h-52 md:h-60 overflow-hidden bg-slate-900">
          {!bannerError && channel.bannerUrl ? (
            <img
              src={channel.bannerUrl}
              alt={channel.name}
              referrerPolicy="no-referrer"
              onError={() => setBannerError(true)}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#FF3040]/25 via-[#191E29] to-[#121622] p-6 text-center">
              <div className="space-y-1">
                <span className="text-xl sm:text-3xl font-black text-white/95 tracking-wide uppercase drop-shadow">
                  {channel.name}
                </span>
                <p className="text-xs text-slate-300">Kituo Rasmi cha Maudhui ya Tazama</p>
              </div>
            </div>
          )}

          {/* Subtle top & bottom gradient scrims for icon legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35 pointer-events-none" />

          {/* Floating Back & Share Controls (Eliminates awkward empty white strip above banner) */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            <button
              onClick={onNavigateHome || (() => window.history.back())}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-2.5 sm:px-3.5 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 transition-all active:scale-95 cursor-pointer shadow-md"
              title="Rudi Mwanzo"
              aria-label="Rudi Mwanzo"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-xs font-bold hidden sm:inline whitespace-nowrap">Rudi Nyumbani</span>
            </button>

            <div className="flex items-center gap-2">
              {copyToast && (
                <span className="text-[11px] font-bold text-white bg-emerald-600/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg animate-in fade-in whitespace-nowrap">
                  Linki Imenakiliwa!
                </span>
              )}
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-2.5 sm:px-3.5 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
                title="Shiriki Chaneli"
                aria-label="Shiriki Chaneli"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Shiriki</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Header: Raised Avatar (Left) + Channel Title & Details (Center) + Compact Actions (Right) */}
        <div className="px-3 sm:px-6 pt-2 sm:pt-3 pb-3 space-y-2">
          <div className="flex items-start justify-between gap-2.5 sm:gap-4">

            {/* Left: Raised Channel Avatar Overlapping Banner Seam */}
            <div className="relative z-10 shrink-0 -mt-10 sm:-mt-14">
              <div className="w-[68px] h-[68px] sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#141824] bg-slate-100 dark:bg-[#181C26] shadow-xl">
                {!avatarError && channel.avatarUrl ? (
                  <img
                    src={channel.avatarUrl}
                    alt={channel.name}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={createAvatarSvgDataUri(channel.name)}
                    alt={channel.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {channel.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#141824] shadow-sm" title="Imethibitishwa">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Middle: Channel Name & Metadata Centered Cleanly Between Avatar and Actions */}
            <div className="flex-1 min-w-0 pt-0.5 sm:pt-1 space-y-0.5">
              <div className="flex items-center gap-1">
                <h1 className="text-[13.5px] sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                  {channel.name}
                </h1>
                {channel.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </div>

              <p className="text-[11px] sm:text-xs font-semibold text-[#FF3040] truncate leading-tight">
                {channel.handle ? (channel.handle.startsWith('@') ? channel.handle : `@${channel.handle}`) : `@${(channel.name || 'channel').toLowerCase().replace(/\s+/g, '')}`}
              </p>

              <p className="text-[10.5px] sm:text-xs text-slate-600 dark:text-[#A7B0C0] tabular-nums truncate leading-tight">
                <span className="text-slate-900 dark:text-white font-bold">{totalVideoCount} video</span>
                <span aria-hidden="true"> &middot; </span>
                <span>{formatViews(channel.subscriberCount || 1, language)} wafuatiliaji</span>
              </p>
            </div>

            {/* Right: Compact Subscribe & Bell Buttons */}
            <div className="relative z-10 flex items-center gap-1.5 shrink-0 -mt-5 sm:mt-0 sm:self-center">
              {isOwner ? (
                <>
                  <button
                    onClick={onOpenUpload}
                    className="flex items-center justify-center gap-1 h-8 sm:h-9 px-3 sm:px-4 rounded-full bg-[#FF3040] hover:bg-[#E02635] text-white font-bold text-[11px] sm:text-xs shadow-md ring-2 ring-white dark:ring-[#141824] transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>Pakia</span>
                  </button>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('studio')}
                      className="w-8 h-8 sm:w-auto sm:h-9 sm:px-3.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 dark:bg-[#191E29] dark:hover:bg-[#232A39] dark:border-[#2E384D] dark:text-white font-semibold text-[11px] sm:text-xs shadow-md ring-2 ring-white dark:ring-[#141824] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                      title="Studio Yangu"
                      aria-label="Studio Yangu"
                    >
                      <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-[#16C784] shrink-0" />
                      <span className="hidden sm:inline">Studio</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleSubscribe(channel.id)}
                    className={`h-8 sm:h-9 px-3.5 sm:px-5 rounded-full text-[11px] sm:text-xs font-bold shadow-md ring-2 ring-white dark:ring-[#141824] transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                      isSubscribed
                        ? 'bg-slate-100 border border-slate-200 text-slate-900 hover:bg-slate-200 dark:bg-[#232A39] dark:border-[#323C52] dark:text-white dark:hover:bg-[#2E3748]'
                        : 'bg-[#FF3040] hover:bg-[#E02635] text-white shadow-[#FF3040]/25'
                    }`}
                  >
                    {isSubscribed
                      ? (language === 'en' ? 'Subscribed' : 'Unafuatilia')
                      : (language === 'en' ? 'Subscribe' : 'Fuatilia')}
                  </button>

                  <button
                    onClick={() => setHasBell(!hasBell)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center shrink-0 shadow-md ring-2 ring-white dark:ring-[#141824] transition-all active:scale-95 cursor-pointer ${
                      hasBell
                        ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-[#2E384D] dark:bg-[#191E29] dark:text-amber-400'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-[#2E384D] dark:bg-[#191E29] dark:text-[#CBD5E1] dark:hover:text-white'
                    }`}
                    title={hasBell ? 'Taarifa zimewashwa' : 'Washa taarifa'}
                    aria-label={hasBell ? 'Taarifa zimewashwa' : 'Washa taarifa'}
                  >
                    <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasBell ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Compact Expandable Bio */}
          <div className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
            <p className={showBio ? '' : 'line-clamp-2'}>{bioText}</p>
            {isLongBio && (
              <button
                type="button"
                onClick={() => setShowBio(!showBio)}
                className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-900 dark:text-white hover:text-[#FF3040] mt-0.5 cursor-pointer"
              >
                <span>{showBio ? 'Onyesha kidogo' : 'Soma zaidi'}</span>
                {showBio ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Compact Navigation Tabs Attached Cleanly to Header Surface */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-6 px-3 sm:px-6 border-t border-slate-100 dark:border-[#262E3E]/70 text-[11.5px] sm:text-xs font-bold overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 relative transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white'
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
      </div>

      {/* 2. Tab Panels */}
      <div className="px-3 sm:px-1 pt-3 sm:pt-4">

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4">

            {/* Channel Shorts Shelf (If channel has any shorts) */}
            {channelShorts.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF3040] to-orange-500 flex items-center justify-center text-white">
                    <Film className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Shorts za {channel.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {channelShorts.map((short) => (
                    <div
                      key={short.id}
                      onClick={() => onSelectVideo(short)}
                      className="relative aspect-shorts rounded-2xl overflow-hidden bg-slate-900 dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] group cursor-pointer shadow-sm hover:scale-[1.01] transition-transform"
                    >
                      <img
                        src={short.thumbnailUrl || createThumbnailSvgDataUri(short.title, 'Shorts')}
                        alt={short.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = createThumbnailSvgDataUri(short.title, 'Shorts');
                        }}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                        <h4 className="text-xs font-bold text-white line-clamp-2 drop-shadow">
                          {short.title}
                        </h4>
                        <p className="text-[10px] text-slate-300 mt-0.5 tabular-nums">
                          {formatViews(short.viewsCount, language)} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Channel All Uploaded Videos */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between px-0.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-[#FF3040] shrink-0" />
                  <span>Video Zote</span>
                </h3>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#A7B0C0] font-mono tabular-nums">{totalVideoCount} video</span>
              </div>

              {allChannelVideos.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-[#191E29]/60 rounded-3xl border border-slate-200 dark:border-[#262E3E] space-y-3 p-6 max-w-lg mx-auto shadow-sm dark:shadow-none">
                  <Tv className="w-10 h-10 text-slate-400 dark:text-[#A7B0C0] mx-auto opacity-60" />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Bado Hakuna Video Zilizopakiwa</h4>
                    <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  {allChannelVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => onSelectVideo(video)}
                      className="group bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] hover:border-[#FF3040]/40 rounded-2xl cursor-pointer shadow-sm dark:shadow-lg transition-all flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-2.5 p-2.5 active:scale-[0.99]"
                    >
                      {/* Responsive Thumbnail Preview with Dynamic Animated Gradient Border */}
                      <div className="w-[144px] sm:w-full shrink-0">
                        <VideoThumbnailPreview
                          video={video}
                          onSelectVideo={onSelectVideo}
                          aspectRatioClass="aspect-video"
                          compactMobile
                          className="rounded-xl"
                        />
                      </div>

                      {/* Video Details (Clean & Balanced on Both Mobile and Desktop) */}
                      <div className="flex-1 min-w-0 py-0.5 sm:px-0.5 sm:pb-0.5 flex flex-col justify-between gap-1.5">
                        <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#FF3040] transition-colors leading-snug">
                          {video.title}
                        </h4>

                        <div className="space-y-1">
                          <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0] font-mono tabular-nums flex items-center gap-1 truncate">
                            <span>{formatViews(video.viewsCount, language)} views</span>
                            <span aria-hidden="true">&middot;</span>
                            <span className="font-sans truncate">{formatRelativeTime(video.createdAt, language)}</span>
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:bg-[#16C784]/15 dark:text-[#16C784] text-[10px] font-bold">
                              {video.category || 'Burudani'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: VIDEO */}
        {activeTab === 'video' && (
          <div className="space-y-2.5 sm:space-y-3.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Video Zote ({channelVideos.length})</h3>
              <span className="text-[11px] sm:text-xs text-slate-600 dark:text-[#A7B0C0] font-mono">{channel.name}</span>
            </div>

            {channelVideos.length === 0 ? (
              <div className="py-14 text-center text-slate-600 dark:text-[#A7B0C0] text-xs bg-white dark:bg-[#191E29]/40 rounded-2xl border border-slate-200 dark:border-[#262E3E]">
                Bado hakuna video zilizopakiwa kwenye chaneli hii.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                {channelVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => onSelectVideo(video)}
                    className="group bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] hover:border-[#FF3040]/40 rounded-2xl cursor-pointer shadow-sm dark:shadow-lg transition-all flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-2.5 p-2.5 active:scale-[0.99]"
                  >
                    {/* Responsive Thumbnail Preview with Dynamic Animated Gradient Border */}
                    <div className="w-[144px] sm:w-full shrink-0">
                      <VideoThumbnailPreview
                        video={video}
                        onSelectVideo={onSelectVideo}
                        aspectRatioClass="aspect-video"
                        compactMobile
                        className="rounded-xl"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 py-0.5 sm:px-0.5 sm:pb-0.5 flex flex-col justify-between gap-1.5">
                      <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#FF3040] transition-colors leading-snug">
                        {video.title}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-600 dark:text-[#A7B0C0] font-mono tabular-nums flex items-center gap-1 truncate">
                          <span>{formatViews(video.viewsCount, language)} views</span>
                          <span aria-hidden="true">&middot;</span>
                          <span className="font-sans truncate">{formatRelativeTime(video.createdAt, language)}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:bg-[#16C784]/15 dark:text-[#16C784] text-[10px] font-bold">
                            {video.category || 'Burudani'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SHORTS */}
        {activeTab === 'shorts' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shorts za {channel.name} ({channelShorts.length})</h3>
            </div>

            {channelShorts.length === 0 ? (
              <div className="py-14 text-center text-slate-600 dark:text-[#A7B0C0] text-xs bg-white dark:bg-[#191E29]/40 rounded-2xl border border-slate-200 dark:border-[#262E3E]">
                Kituo hiki hakijachapisha video fupi (Shorts) bado.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {channelShorts.map((short) => (
                  <div
                    key={short.id}
                    onClick={() => onSelectVideo(short)}
                    className="relative aspect-shorts rounded-2xl overflow-hidden bg-slate-900 dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] group cursor-pointer shadow-sm hover:scale-[1.01] transition-transform"
                  >
                    <img
                      src={short.thumbnailUrl || createThumbnailSvgDataUri(short.title, 'Shorts')}
                      alt={short.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = createThumbnailSvgDataUri(short.title, 'Shorts');
                      }}
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                      <h4 className="text-xs font-bold text-white line-clamp-2 drop-shadow">
                        {short.title}
                      </h4>
                      <p className="text-[10px] text-slate-300 mt-0.5 tabular-nums">
                        {formatViews(short.viewsCount, language)} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PLAYLIST */}
        {activeTab === 'playlist' && (
          <div className="py-14 text-center bg-white dark:bg-[#191E29]/40 rounded-3xl border border-slate-200 dark:border-[#262E3E] space-y-2 p-6 shadow-sm dark:shadow-none">
            <Film className="w-8 h-8 text-slate-400 dark:text-[#A7B0C0] mx-auto opacity-60" />
            <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
              Bado hakuna orodha (playlist) iliyoundwa na chaneli hii.
            </p>
          </div>
        )}

        {/* TAB: COMMUNITY */}
        {activeTab === 'community' && (
          <div className="p-5 rounded-3xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] space-y-3 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#FF3040]" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Machapisho ya Kijamii (Community)</h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
              Karibuni kwenye jamii rasmi ya {channel.name}! Endelea kufuatilia video zetu, weka maoni, na ushiriki na marafiki.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 dark:text-[#A7B0C0] font-mono">
              Imechapishwa na {channel.name} &middot; Tazama Platform
            </div>
          </div>
        )}

        {/* TAB: ABOUT */}
        {activeTab === 'about' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#191E29] border border-slate-200 dark:border-[#262E3E] space-y-4 shadow-sm dark:shadow-xl">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Kuhusu Kituo cha {channel.name}</h4>
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                {channel.bio || 'Chaneli rasmi ya video na ubunifu kwenye Tazama.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-[#262E3E] text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] font-semibold block">Utambulisho wa Kituo</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{channel.handle || `@${channel.name}`}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] font-semibold block">Jumla ya Video</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono tabular-nums">{totalVideoCount} video</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] font-semibold block">Wafuatiliaji (Subscribers)</span>
                <span className="font-bold text-emerald-700 dark:text-[#16C784] text-sm font-mono tabular-nums">{formatViews(channel.subscriberCount || 1, language)}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] font-semibold block">Nchi & Eneo</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Tanzania 🇹🇿</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] font-semibold block">Hali ya Uthibitisho</span>
                <span className={`font-bold text-xs ${channel.isVerified ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-[#A7B0C0]'}`}>
                  {channel.isVerified ? 'Imethibitishwa Rasmi (Verified)' : 'Haijathibitishwa'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10131B] border border-slate-200 dark:border-[#262E3E] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-[#A7B0C0] font-semibold block">Tarehe ya Kuanzishwa</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs font-mono tabular-nums">{channel.joinedDate || '2026-01-01'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
